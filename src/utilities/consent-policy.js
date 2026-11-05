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
 * @returns {'allow'|'deny'|'ask'}
 */
export function grantState(key, value) {
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
                ? Object.fromEntries(Object.entries(grants).filter(([key, value]) => !(isNeverGranted(key) && value === 'allow')))
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
