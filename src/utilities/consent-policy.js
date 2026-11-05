/**
 * Pure rules for window.nostr requests. No imports and no side effects, so the
 * background worker and the tests run exactly the same code.
 */

const MAX_EVENT_KIND = 65535;
// The latest time, in seconds, a Date can hold. Past it a date cannot be shown.
const MAX_CREATED_AT = 8_640_000_000_000;

/**
 * The most a prompt will hold for its page to read, in characters of JSON. A sanity
 * limit only: well above what relays accept, so anything a relay would take can be
 * shown. A prompt reads its request from the worker, so size does not touch its URL.
 */
export const MAX_PROMPT_PAYLOAD = 2 * 1024 * 1024;

/** The origin of an address, or null for one that has none of its own. */
function originOf(address) {
    if (!isString(address)) return null;
    try {
        const url = new URL(address);
        if (url.protocol === 'file:') return 'file://';
        return url.origin === 'null' ? null : url.origin;
    } catch {
        return null;
    }
}

/**
 * The site a request came from, from the browser's own record of the sender.
 * Chrome states an origin. Firefox and Safari report the frame's address, and a
 * top frame with no usable address of its own falls back to its tab. A frame
 * inside a page never takes on the tab's origin.
 *
 * @param {object} sender the MessageSender the browser passed in
 * @returns {?string} the origin, or null if the sender does not show one
 */
export function senderOrigin(sender) {
    const own = originOf(sender?.origin) ?? originOf(sender?.url);
    if (own) return own;
    const topFrame = sender?.frameId === undefined || sender.frameId === 0;
    return topFrame ? originOf(sender?.tab?.url) : null;
}

const isObject = (value) => typeof value === 'object' && value !== null;
const isString = (value) => typeof value === 'string';
const createdAtOk = (value) => value === undefined
    || (Number.isInteger(value) && value >= 0 && value <= MAX_CREATED_AT);

// Every window.nostr method apart from signEvent.
const REQUEST_METHODS = new Set([
    'getPubKey', 'getRelays', 'addRelay',
    'nip04.encrypt', 'nip04.decrypt', 'nip44.encrypt', 'nip44.decrypt',
]);

/**
 * Is this request shaped the way its method needs? Runs on an untrusted payload
 * and never throws.
 *
 * @param {string} kind    the request method, e.g. 'signEvent'
 * @param {*}      payload whatever the page sent
 * @returns {boolean}
 */
export function validateRequest(kind, payload) {
    switch (kind) {
        case 'getPubKey':
        case 'getRelays':
            return true;
        case 'signEvent':
            return isObject(payload)
                && Number.isInteger(payload.kind)
                && payload.kind >= 0
                && payload.kind <= MAX_EVENT_KIND
                && createdAtOk(payload.created_at);
        case 'addRelay':
            return isObject(payload) && isString(payload.url);
        case 'nip04.encrypt':
        case 'nip44.encrypt':
            return isObject(payload) && isString(payload.pubKey) && isString(payload.plainText);
        case 'nip04.decrypt':
        case 'nip44.decrypt':
            return isObject(payload) && isString(payload.pubKey) && isString(payload.cipherText);
        default:
            return false;
    }
}

/**
 * Is this request a sane size to show on a prompt? Only asked on the way to opening
 * one: a request answered from a grant is never shown, so its size does not matter.
 *
 * @param {*} payload whatever the page sent
 * @returns {boolean}
 */
export function fitsPrompt(payload) {
    return JSON.stringify(payload || false).length <= MAX_PROMPT_PAYLOAD;
}

export const MAX_BLOSSOM_TTL_S = 3900;

const BLOSSOM_KIND = 24242;
const BLOSSOM_VERBS = new Set(['get', 'upload', 'list', 'delete', 'media']);
const NEVER_REMEMBERED_VERBS = new Set(['delete']);
const HASHES_REQUIRED = new Set(['upload', 'media', 'delete']);
const MAX_HASHES = 20;
const CLOCK_SKEW_S = 60;
const HASH_RE = /^[0-9a-f]{64}$/;
const SERVER_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)*$/;

const tagsNamed = (tags, name) => tags.filter(tag => tag[0] === name);

/**
 * Read a Blossom authorization (kind 24242) and say what it asks for, or which
 * rule it fails. Runs on an untrusted event and never throws.
 *
 * @param {*}      event
 * @param {number} now   current time in seconds
 * @returns {{auth: ?{verb: string, expiresAt: number, x: string[], servers: string[]},
 *            problem: ?string, expiresAt?: number}}
 */
export function checkBlossomAuth(event, now) {
    const fail = (problem, extra = {}) => ({ auth: null, problem, ...extra });

    if (!Number.isSafeInteger(now)) return fail('bad_clock');
    if (!isObject(event) || event.kind !== BLOSSOM_KIND) return fail('bad_event');
    const { tags } = event;
    if (!Array.isArray(tags)) return fail('bad_tags');
    if (!tags.every(tag => Array.isArray(tag) && tag.length > 0 && isString(tag[0]))) {
        return fail('bad_tags');
    }
    if (!Number.isSafeInteger(event.created_at) || event.created_at > now + CLOCK_SKEW_S) {
        return fail('bad_created_at');
    }

    // A name that differs from the real one only in case is refused.
    const lookalike = (tag, name) => tag[0] !== name && tag[0].toLowerCase() === name;

    const verbTags = tagsNamed(tags, 't');
    if (verbTags.length !== 1 || tags.some(tag => lookalike(tag, 't'))) return fail('bad_verb');
    const [verbTag] = verbTags;
    if (verbTag.length !== 2 || !isString(verbTag[1]) || !BLOSSOM_VERBS.has(verbTag[1])) {
        return fail('bad_verb');
    }
    const verb = verbTag[1];

    const expiryTags = tagsNamed(tags, 'expiration');
    if (expiryTags.length !== 1 || tags.some(tag => lookalike(tag, 'expiration'))) {
        return fail('bad_expiration');
    }
    const [expiryTag] = expiryTags;
    if (expiryTag.length !== 2 || !isString(expiryTag[1]) || !/^\d+$/.test(expiryTag[1])) {
        return fail('bad_expiration');
    }
    const expiresAt = Number(expiryTag[1]);
    if (!Number.isSafeInteger(expiresAt)) return fail('bad_expiration');
    if (expiresAt <= now) return fail('expired', { expiresAt });
    if (expiresAt > now + MAX_BLOSSOM_TTL_S) return fail('expiry_too_far', { expiresAt });

    const hashTags = tagsNamed(tags, 'x');
    const hashesOk = hashTags.length <= MAX_HASHES
        && hashTags.every(tag => tag.length === 2 && isString(tag[1]) && HASH_RE.test(tag[1]))
        && (HASHES_REQUIRED.has(verb) ? hashTags.length >= 1 : true)
        && (verb === 'list' ? hashTags.length === 0 : true);
    if (!hashesOk) return fail('bad_hashes');

    const serverTags = tagsNamed(tags, 'server');
    if (!serverTags.every(tag => tag.length === 2 && isString(tag[1]) && SERVER_RE.test(tag[1]))) {
        return fail('bad_server');
    }

    return {
        auth: {
            verb,
            expiresAt,
            x: hashTags.map(tag => tag[1]),
            servers: serverTags.map(tag => tag[1]),
        },
        problem: null,
    };
}

/**
 * @returns {?object} what the token asks for, or null if it fails any rule
 */
export function parseBlossomAuth(event, now) {
    return checkBlossomAuth(event, now).auth;
}

/** Does any tag named t, in any case, carry delete, wherever it sits? */
function namesDelete(tags) {
    if (!Array.isArray(tags)) return false;
    const isDelete = value => isString(value) && value.toLowerCase() === 'delete';
    return tags.some(tag => Array.isArray(tag)
        && isString(tag[0])
        && tag[0].toLowerCase() === 't'
        && tag.slice(1).some(isDelete));
}

/**
 * How much a request needs flagging on the prompt. This does not depend on the
 * request passing checkBlossomAuth: a media server request that names delete is
 * danger whatever else is wrong with it, and any other that fails is warn.
 *
 * @param {*}      event
 * @param {number} now   current time in seconds
 * @returns {'danger'|'warn'|'neutral'}
 */
export function blossomRisk(event, now) {
    if (!isObject(event) || event.kind !== BLOSSOM_KIND) return 'neutral';
    if (namesDelete(event.tags)) return 'danger';
    return parseBlossomAuth(event, now) ? 'neutral' : 'warn';
}

/**
 * The key a grant for this request is stored under, or null when the request
 * cannot be classified. A null key means no grant lookup and nothing remembered.
 * Kind 24242 has one key per verb; there is no key for the bare kind.
 *
 * @param {string} kind    the request method
 * @param {*}      payload whatever the page sent
 * @param {number} now     current time in seconds
 * @returns {?string}
 */
export function grantKeyFor(kind, payload, now) {
    if (!Number.isSafeInteger(now) || !validateRequest(kind, payload)) return null;
    if (kind !== 'signEvent') return kind;
    if (payload.kind !== BLOSSOM_KIND) return `signEvent:${payload.kind}`;
    const auth = parseBlossomAuth(payload, now);
    return auth ? `signEvent:${BLOSSOM_KIND}:${auth.verb}` : null;
}

/**
 * Read a stored grant key back into its parts.
 *
 * @param {*} key
 * @returns {?{method: string, kind: ?number, verb: ?string}} null if it is not a
 *          key this version understands
 */
export function parseGrantKey(key) {
    if (!isString(key)) return null;
    if (REQUEST_METHODS.has(key)) return { method: key, kind: null, verb: null };

    const match = /^signEvent:(0|[1-9]\d*)(?::(.+))?$/.exec(key);
    if (!match) return null;
    const kind = Number(match[1]);
    if (kind > MAX_EVENT_KIND) return null;
    const verb = match[2] ?? null;
    if (verb !== null && (kind !== BLOSSOM_KIND || !BLOSSOM_VERBS.has(verb))) return null;
    return { method: 'signEvent', kind, verb };
}

/**
 * The kinds a site may be remembered for: things a named client sends again and
 * again, where one wrong signature costs little and can be undone. A kind is
 * listed here by hand, never because it has a label. Anything not listed always
 * asks. Kind 24242 is not listed: its grants are per verb, see canRemember.
 */
// prettier-ignore
export const REMEMBERABLE_KINDS = new Set([
    0, 1, 2, 3, 4, 6, 7, 8, 13, 14, 16, 20, 21, 22, 40, 41, 42, 43, 44,
    1059, 1063, 1111, 1311, 1984, 1985, 4550, 7000,
    9041, 9734, 9735, 9802,
    10000, 10001, 10002, 10003, 10063, 13194,
    22242, 23194, 23195, 24133, 27235,
    30000, 30001, 30003, 30008, 30009, 30017, 30018, 30023, 30024, 30078,
    30311, 30315, 30402, 30403,
    31922, 31923, 31924, 31925, 31989, 31990, 34550,
]);

export const REMEMBERABLE_METHODS = REQUEST_METHODS;

/**
 * May a grant be stored under this key?
 *
 * @param {?string} key    from grantKeyFor
 * @param {string}  method the request method
 * @returns {boolean}
 */
export function canRemember(key, method) {
    const grant = parseGrantKey(key);
    if (!grant || grant.method !== method) return false;
    if (method !== 'signEvent') return REMEMBERABLE_METHODS.has(method);
    if (grant.kind === null) return false;
    if (grant.kind === BLOSSOM_KIND) {
        return grant.verb !== null && !NEVER_REMEMBERED_VERBS.has(grant.verb);
    }
    return REMEMBERABLE_KINDS.has(grant.kind);
}

// A stored allow under any of these keys is ignored: the request asks, and a
// restored backup leaves it out. A stored deny stands. One key per line, so each
// can be released alone.
const NEVER_GRANTED = new Set([
    'signEvent:5',
    'signEvent:62',
    'signEvent:24242:delete',
]);

/**
 * @param {string} key a grant key
 * @returns {boolean} true if a stored allow under this key is ignored
 */
export function isNeverGranted(key) {
    return NEVER_GRANTED.has(key);
}

/**
 * What a stored answer means in practice, for showing it in a list.
 *
 * @param {string} key   a grant key
 * @param {*}      value what is stored under it
 * @param {number} [now] unix seconds
 * @returns {'allow'|'deny'|'ask'}
 */
export function grantState(key, value, now = Math.floor(Date.now() / 1000)) {
    value = resolveGrant(value, now);
    const grant = parseGrantKey(key);
    if (grant?.kind === BLOSSOM_KIND && grant.verb === null) return 'ask';
    if (value === 'deny' || value === 'reject') return 'deny';
    return value === 'allow' && !isNeverGranted(key) ? 'allow' : 'ask';
}

/**
 * The same profiles with the allows under those keys taken out.
 *
 * @param {*} profiles
 * @returns {*} a new list, or whatever was passed if it is not a list
 */
export function withoutNeverGranted(profiles) {
    if (!Array.isArray(profiles)) return profiles;
    return profiles.map((profile) => {
        if (!isObject(profile) || !isObject(profile.hosts)) return profile;
        const hosts = {};
        for (const [host, grants] of Object.entries(profile.hosts)) {
            hosts[host] = isObject(grants)
                ? Object.fromEntries(Object.entries(grants).filter(([key, value]) => !(isNeverGranted(key) && (value === 'allow' || value?.v === 'allow'))))
                : grants;
        }
        return { ...profile, hosts };
    });
}

/**
 * The limit on requests answered from a grant, per site and key. `deleteMax` and
 * the delete branches below are reserved for deletes allowed from the app list.
 * A delete always asks in this version, so they are not reached.
 */
export const GRANT_RATE = Object.freeze({ windowMs: 60_000, max: 60, deleteMax: 5 });

const BLOSSOM_DELETE_GRANT = 'signEvent:24242:delete';

/** How many requests a grant allows per window under this key. */
export function grantLimit(key) {
    return key === BLOSSOM_DELETE_GRANT ? GRANT_RATE.deleteMax : GRANT_RATE.max;
}

/** How much of that limit this request takes: reserved, a delete would take one per blob. */
export function grantSlots(key, payload, now) {
    if (key !== BLOSSOM_DELETE_GRANT) return 1;
    return parseBlossomAuth(payload, now)?.x.length ?? 1;
}

/**
 * How long an allow may be remembered, in seconds. 'forever' is stored as the
 * plain string 'allow', as before. Denies are always plain strings.
 */
export const DURATIONS = Object.freeze({ '1h': 3600, '1d': 86400, '30d': 30 * 86400 });

/** Expiry times are unix seconds; anything at or above this is not (it would be milliseconds). */
export const MAX_EXP_S = 1e11;

/**
 * The value to store for an allow remembered for `rememberFor`.
 *
 * @param {*}      rememberFor '1h', '1d', '30d' or 'forever'
 * @param {number} now         unix seconds
 * @returns {string|{v:'allow',exp:number,d:string}|null} null: not remembered
 */
export function grantValue(rememberFor, now) {
    if (rememberFor === 'forever') return 'allow';
    if (typeof rememberFor !== 'string' || !Object.hasOwn(DURATIONS, rememberFor)) return null;
    if (!Number.isSafeInteger(now)) return null;
    return { v: 'allow', exp: now + DURATIONS[rememberFor], d: rememberFor };
}

/** Remember durations from shortest to longest. */
export const REMEMBER_ORDER = Object.freeze(['1h', '1d', '30d', 'forever']);

// Reading a message, and signing a direct message, may be remembered for at most
// thirty days. A Forever grant stored before this limit still answers.
const MESSAGE_METHODS = new Set(['nip04.decrypt', 'nip44.decrypt']);
const MESSAGE_KINDS = new Set([4, 13, 14, 1059]);

/**
 * The longest a request of this kind may be remembered. The worker enforces
 * whatever this returns.
 *
 * @param {string}  method the request method, e.g. 'nip44.decrypt'
 * @param {?string} [key]  the grant key, from grantKeyFor, for a signEvent
 * @returns {string} one of REMEMBER_ORDER
 */
export function maxRememberFor(method, key) {
    if (MESSAGE_METHODS.has(method)) return '30d';
    if (method === 'signEvent') {
        const grant = parseGrantKey(key);
        if (grant && grant.method === 'signEvent' && MESSAGE_KINDS.has(grant.kind)) return '30d';
    }
    return 'forever';
}

/**
 * The longest a prompt may offer to remember this request, or null when it
 * always asks.
 *
 * @returns {?string} one of REMEMBER_ORDER, or null
 */
export function rememberLimit(key, method) {
    return canRemember(key, method) ? maxRememberFor(method, key) : null;
}

/**
 * Limit a requested remember duration to a maximum. A duration longer than the
 * maximum comes down to it; anything that is not a known duration (or a
 * maximum that is not one) gives null: not remembered. Never widens.
 *
 * @returns {string|null}
 */
export function clampRememberFor(rememberFor, max) {
    const want = REMEMBER_ORDER.indexOf(rememberFor);
    const cap = REMEMBER_ORDER.indexOf(max);
    if (want < 0 || cap < 0) return null;
    return REMEMBER_ORDER[Math.min(want, cap)];
}

/**
 * What a stored grant value means right now. Strings are returned as stored.
 * An expiring allow is 'allow' only while it is well formed and unexpired;
 * anything else, including an expired one, reads as 'ask'. Evaluated at
 * lookup, so nothing needs a timer.
 *
 * @param {*}      value what is stored under a grant key
 * @param {number} now   unix seconds
 * @returns {*} the stored string, or 'allow' / 'ask' for an object value
 */
export function resolveGrant(value, now) {
    if (typeof value === 'string') return value;
    if (!isObject(value) || Array.isArray(value)) return 'ask';
    const { v, exp, d } = value;
    if (v !== 'allow') return 'ask';
    if (typeof d !== 'string' || !Object.hasOwn(DURATIONS, d)) return 'ask';
    if (!Number.isSafeInteger(exp) || exp <= 0 || exp >= MAX_EXP_S) return 'ask';
    if (!Number.isFinite(now)) return 'ask';
    if (now >= exp) return 'ask';
    // Further off than its own duration: the clock moved back or the value was not ours.
    if (exp - now > DURATIONS[d]) return 'ask';
    return 'allow';
}

/**
 * How long an expiring allow has left, in words, or null for a Forever allow
 * or anything that does not answer now.
 *
 * @param {*}      value what is stored under a grant key
 * @param {number} now   unix seconds
 * @returns {?string} e.g. '3 days left', '5 hours left', '12 min left'
 */
export function grantTimeLeft(value, now) {
    if (typeof value === 'string' || resolveGrant(value, now) !== 'allow') return null;
    const s = value.exp - now;
    const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'} left`;
    if (s >= 86400) return plural(Math.floor(s / 86400), 'day');
    if (s >= 3600) return plural(Math.floor(s / 3600), 'hour');
    return `${Math.max(1, Math.floor(s / 60))} min left`;
}

/**
 * Who a revoke goes to, checked at click time against who the list was drawn
 * for. `painted` is { pubkey, index } captured when the list was painted;
 * `nowAtIndex` is the public key of the profile at that index now; `foundIndex`
 * is where the painted public key lives now (-1 when it is gone). Returns the
 * target, or null when the identity the list showed no longer exists, so the
 * caller refuses and repaints instead of removing someone else's grant.
 */
export function resolveRevokeTarget(painted, nowAtIndex, foundIndex) {
    const want = painted?.pubkey ? String(painted.pubkey).toLowerCase() : null;
    const now = nowAtIndex ? String(nowAtIndex).toLowerCase() : null;
    if (!want) return now === null ? { pubkey: null, index: painted?.index ?? null } : null;
    if (now === want) return { pubkey: want, index: painted.index };
    if (Number.isInteger(foundIndex) && foundIndex >= 0) return { pubkey: want, index: foundIndex };
    return null;
}

/**
 * What to store when an allow is remembered for `rememberFor`, cut to the
 * longest this request may be remembered. The worker (a prompt answer) and the
 * site list (an extension page) both store through this, so neither can keep an
 * allow longer than the kind's maximum. null means nothing is stored.
 *
 * @param {string}  rememberFor one of REMEMBER_ORDER
 * @param {string}  method      the request method
 * @param {?string} key         the grant key
 * @param {number}  now         unix seconds
 * @returns {*} a grant value, or null
 */
export function rememberedValue(rememberFor, method, key, now) {
    const kept = clampRememberFor(rememberFor, maxRememberFor(method, key));
    return kept ? grantValue(kept, now) : null;
}

/**
 * The actions the site list offers to set for a site, in display order. A
 * stored key that is not listed here still shows and can be changed.
 */
export const LIST_ACTIONS = Object.freeze([
    'getPubKey', 'getRelays',
    'signEvent:1', 'signEvent:7', 'signEvent:0', 'signEvent:3',
    'signEvent:24242:upload', 'signEvent:24242:media', 'signEvent:24242:get',
    'signEvent:24242:list', 'signEvent:24242:delete',
    'nip44.encrypt', 'nip44.decrypt', 'nip04.encrypt', 'nip04.decrypt',
]);

/**
 * The answers the site list may set for a grant key: always Ask and Deny, and
 * Allow for each duration up to the kind's maximum when it may be remembered.
 * Nothing at all for a key this version does not understand.
 *
 * @param {string} key a grant key
 * @returns {string[]} e.g. ['ask', '1h', '1d', '30d', 'deny']
 */
export function grantChoices(key) {
    const grant = parseGrantKey(key);
    if (!grant) return [];
    if (grant.kind === BLOSSOM_KIND && grant.verb === null) return [];
    if (!canRemember(key, grant.method) || isNeverGranted(key)) return ['ask', 'deny'];
    const max = REMEMBER_ORDER.indexOf(maxRememberFor(grant.method, key));
    return ['ask', ...REMEMBER_ORDER.slice(0, max + 1), 'deny'];
}

/**
 * What the site list stores for a choice, or null when that choice may not be
 * stored for this key. 'ask' is not stored (it is a revoke). An allow goes
 * through rememberedValue, so it never outlasts the kind's maximum.
 *
 * @param {string} choice one of grantChoices(key)
 * @param {string} key    a grant key
 * @param {number} now    unix seconds
 * @returns {*} 'deny', an allow value, or null
 */
export function listGrantValue(choice, key, now) {
    if (choice === 'ask' || !grantChoices(key).includes(choice)) return null;
    if (choice === 'deny') return 'deny';
    return rememberedValue(choice, parseGrantKey(key).method, key, now);
}

/**
 * A site typed into the list, as the origin grants are stored under, or null
 * when it is not one. A bare name gets https://. Only https, and http for
 * localhost and loopback addresses. A scheme other than those, a user name or
 * password, or anything that does not parse is refused; a path, query or
 * fragment is dropped. International names come back in punycode, as stored.
 *
 * @param {*} input what was typed
 * @returns {?string} e.g. 'https://jumble.social'
 */
export function normaliseOrigin(input) {
    if (!isString(input)) return null;
    const text = input.trim();
    if (!text || text.length > 2048 || /\s/.test(text)) return null;
    let withScheme = text;
    // Decide on a scheme before parsing: 'jumble.social:8080' parses as a scheme.
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) {
        if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(text)) return null; // blob:, data:, javascript:
        if (text.startsWith('/')) return null;
        withScheme = `https://${text}`;
    }
    let url;
    try { url = new URL(withScheme); } catch { return null; }
    if (url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (!host || host.endsWith('.')) return null;
    const loopback = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
    if (url.protocol === 'http:' && !loopback) return null;
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!loopback && !host.includes('.') && !host.startsWith('[')) return null;
    const origin = url.origin;
    return origin && origin !== 'null' ? origin : null;
}
