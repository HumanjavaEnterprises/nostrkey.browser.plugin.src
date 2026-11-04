/**
 * kind-labels.js — human-readable event-kind + method vocabulary for the
 * signing-approval readout (SHOW-THE-EVENT differentiator).
 *
 * Every kind gets: a HUMAN label, a risk tier, and whether a durable
 * per-(site × kind) grant may be offered:
 *   risk: 'neutral' | 'warn' (amber) | 'danger' (red)
 *   rememberable: false = Tier-B, the patch-point is disabled (always asks).
 *     Decided by REMEMBERABLE_KINDS alone, never by being in a table here.
 *
 * Unknown kinds are said LOUDLY: "Unknown kind N — cannot decode, sign with
 * caution" and can never be remembered.
 */
import { KINDS, humanPermission } from '../utilities/utils';
import { REMEMBERABLE_KINDS, parseGrantKey } from '../utilities/consent-policy.js';
import { BLOSSOM_ACTIONS } from '../utilities/blossom-labels.js';

const NIP_INDEX = 'https://github.com/nostr-protocol/nips';

// Curated overrides: consequence-first labels + risk tiers.
const KIND_LABELS = {
    0:     { label: 'Update your profile', risk: 'neutral' },
    1:     { label: 'Publish a public note', risk: 'neutral' },
    3:     { label: 'Replace your contact/follow list', risk: 'warn' },
    4:     { label: 'Send a DM (NIP-04)', risk: 'warn' },
    5:     { label: 'Delete events', risk: 'danger' },
    6:     { label: 'Repost a note', risk: 'neutral' },
    7:     { label: 'React to a note', risk: 'neutral' },
    13:    { label: 'Seal a private message', risk: 'warn' },
    14:    { label: 'Send a private DM (NIP-17)', risk: 'warn' },
    16:    { label: 'Repost (generic)', risk: 'neutral' },
    20:    { label: 'Publish a picture', risk: 'neutral' },
    21:    { label: 'Publish a video', risk: 'neutral' },
    22:    { label: 'Publish a short video', risk: 'neutral' },
    62:    { label: 'Ask relays to erase your data', risk: 'danger' },
    1059:  { label: 'Send a gift-wrapped message', risk: 'warn' },
    1111:  { label: 'Post a comment', risk: 'neutral' },
    1984:  { label: 'File a report', risk: 'warn' },
    9734:  { label: 'Request a zap (payment)', risk: 'neutral' },
    3306:  { label: 'Join a community', risk: 'neutral' },
    3313:  { label: 'Send a community invite', risk: 'neutral' },
    9735:  { label: 'Zap receipt', risk: 'neutral' },
    9802:  { label: 'Save a highlight', risk: 'neutral' },
    10000: { label: 'Replace your mute list', risk: 'warn' },
    10002: { label: 'Replace your relay list', risk: 'warn' },
    10003: { label: 'Replace your bookmark list', risk: 'warn' },
    10063: { label: 'Replace your media server list', risk: 'warn' },
    22242: { label: 'Authenticate to a relay', risk: 'neutral' },
    23194: { label: 'Wallet request (NWC)', risk: 'warn' },
    24133: { label: 'Bunker RPC (Nostr Connect)', risk: 'warn' },
    24242: { label: 'Authorize a media server request', risk: 'neutral' },
    27235: { label: 'Authenticate to a server (HTTP)', risk: 'neutral' },
    30003: { label: 'Update a bookmark set', risk: 'neutral' },
    30023: { label: 'Publish a long-form article', risk: 'neutral' },
    30078: { label: 'Save app data', risk: 'neutral' },
};

// Kind-specific warning copy for the warn-strip (falls back to generic).
const KIND_WARNINGS = {
    3: 'This REPLACES your entire follow list. A malicious app can wipe who you follow.',
    4: 'This creates a private message. NIP-04 is a legacy format with weaker privacy.',
    5: 'This asks to DELETE events. Deletion requests propagate to relays and cannot be undone.',
    62: 'This asks relays to erase your data. It cannot be undone.',
    10000: 'This replaces your entire mute list.',
    10002: 'This replaces your relay list — it controls where your events are published.',
    10003: 'This replaces your entire bookmark list.',
    10063: 'This replaces your media server list, which decides where your uploads go.',
    23194: 'This is a wallet request. It may move funds via your connected wallet.',
    24133: 'This is remote-signer (bunker) control traffic.',
};

/**
 * Describe an event kind for the readout.
 * @param {*} kind — the event's kind field (any type; validated here)
 * @returns {{ kind, label, risk, rememberable, known, nip, warning }}
 */
export function describeKind(kind) {
    const n = typeof kind === 'number' && Number.isInteger(kind) ? kind : NaN;
    const spec = Array.isArray(KINDS) ? KINDS.find(([k]) => k === n) : null;
    const nip = spec ? spec[2] : NIP_INDEX;

    const curated = KIND_LABELS[n];
    if (curated) {
        return {
            kind: n,
            label: curated.label,
            risk: curated.risk,
            rememberable: REMEMBERABLE_KINDS.has(n),
            known: true,
            nip,
            warning: KIND_WARNINGS[n] || null,
        };
    }

    if (spec) {
        // Known to the NIP table but not curated.
        return { kind: n, label: spec[1], risk: 'neutral', rememberable: REMEMBERABLE_KINDS.has(n), known: true, nip, warning: null };
    }

    const shown = Number.isNaN(n) ? String(kind) : String(n);
    return {
        kind: n,
        label: `Unknown kind ${shown} — cannot decode, sign with caution`,
        risk: 'warn',
        rememberable: false,
        known: false,
        nip: NIP_INDEX,
        warning: `NostrKey does not recognize kind ${shown}. It cannot tell you what signing this does.`,
    };
}

/**
 * The Blossom action a grant key stands for.
 * @param {?string} key a grant key
 * @returns {?{label: string, remember: ?string, risk: string, warning?: string}}
 */
function describeBlossomAction(key) {
    const verb = parseGrantKey(key)?.verb;
    return verb ? BLOSSOM_ACTIONS[verb] : null;
}

/**
 * The action to show for a request. A request flagged danger by the worker reads
 * as a delete even when it has no grant key, because it failed a rule.
 * @param {?string} key  a grant key
 * @param {string}  risk the worker's flag for this request
 * @returns {?{label: string, remember: ?string, risk: string, warning?: string}}
 */
export function requestAction(key, risk) {
    return risk === 'danger' ? BLOSSOM_ACTIONS.delete : describeBlossomAction(key);
}

/**
 * @param {string} key a grant key
 * @returns {?number} the event kind in it, or null for a method
 */
export function grantKindNum(key) {
    if (!key.startsWith('signEvent:')) return null;
    const kind = parseInt(key.split(':')[1], 10);
    return Number.isNaN(kind) ? null : kind;
}

/**
 * A stored grant in plain words, the same words the prompt uses.
 * @param {string} key a grant key
 * @returns {string}
 */
export function grantLabel(key) {
    const action = describeBlossomAction(key);
    if (action) return action.label;
    const kind = grantKindNum(key);
    if (kind === null) return humanPermission(key);
    const info = describeKind(kind);
    return info.known ? info.label : 'Unknown kind';
}

// Kinds whose grants are drawn red: they reach private messages, or replace or
// remove things that cannot be put back.
const RISKY_GRANT_KINDS = new Set([3, 4, 5, 13, 14, 62, 1059]);

/**
 * @param {string} key a grant key
 * @returns {boolean} true if the list should draw this grant red
 */
export function isRiskyGrant(key) {
    if (/decrypt/i.test(key)) return true;
    if (describeBlossomAction(key)?.risk === 'danger') return true;
    return RISKY_GRANT_KINDS.has(grantKindNum(key));
}

/**
 * A length of time in plain words.
 * @param {number} seconds
 * @returns {string}
 */
export function durationWords(seconds) {
    const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
    if (seconds < 60) return 'under a minute';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return minutes ? `${plural(hours, 'hour')} ${minutes} min` : plural(hours, 'hour');
    }
    return plural(Math.round(seconds / 86400), 'day');
}

/** Which rule a media server request failed, by checkBlossomAuth's name for it. */
const BLOSSOM_PROBLEMS = {
    bad_tags: 'has tags NostrKey cannot read',
    bad_created_at: 'needs a valid creation time that is not ahead of now',
    bad_verb: 'must name exactly one action',
    bad_expiration: 'must carry exactly one expiry time',
    expired: 'has already expired',
    bad_hashes: 'needs a valid list of file hashes',
    bad_server: 'names a server that is not a plain host name',
};

/**
 * @param {string}  problem  from checkBlossomAuth
 * @param {?number} expiresIn seconds left, for a token that runs too long
 * @returns {string} the warning for a media server request that always asks
 */
export function blossomProblemText(problem, expiresIn) {
    if (problem === 'expiry_too_far') return `This request expires in ${durationWords(expiresIn)}, so this asks.`;
    const rule = BLOSSOM_PROBLEMS[problem] || 'could not be read';
    return `This media server request ${rule}, so this asks.`;
}

// Characters that change text direction without drawing anything.
const DIRECTION_CONTROLS = /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
// Blank to the eye, beyond what \s covers.
const BLANK = '\\s\\u115F\\u1160\\u2800\\u3164\\uFFA0';
const LINE_BREAK = /\r\n?|[\n\u2028\u2029]/;
const BLANK_LINE = new RegExp(`^[${BLANK}]*$`);
const BLANK_RUN = new RegExp(`[${BLANK}]{4,}`, 'g');

const markDirectionControls = (text) => text.replace(
    DIRECTION_CONTROLS,
    (char) => `[U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}]`,
);

/**
 * Event text as it should read on a prompt: every direction control drawn as a
 * mark, and blank runs cut down so nothing sits out of view below them.
 * @param {string} text
 * @returns {string}
 */
export function visibleText(text) {
    const lines = [];
    for (const line of markDirectionControls(text).split(LINE_BREAK)) {
        const blank = BLANK_LINE.test(line);
        if (!(blank && lines.at(-1) === '')) lines.push(blank ? '' : line.replace(BLANK_RUN, '   '));
    }
    return lines.join('\n');
}

/**
 * An event as raw JSON, with its strings shown the same way.
 * @param {*} event
 * @returns {string}
 */
export function visibleJson(event) {
    const text = JSON.stringify(event, (_, value) => (typeof value === 'string' ? visibleText(value) : value), 2);
    return markDirectionControls(text ?? '');
}

/**
 * Describe a window.nostr / NIP-46 method (the non-signEvent permissions).
 * @returns {{ label, risk, warning }}
 */
export function describeMethod(perm) {
    switch (perm) {
        case 'getPubKey':
            return { label: 'Read your public key', risk: 'neutral', warning: null };
        case 'signEvent':
            return { label: 'Sign an event', risk: 'neutral', warning: null };
        case 'getRelays':
            return { label: 'Read your relay list', risk: 'neutral', warning: null };
        case 'addRelay':
            return { label: 'Add a relay to your list', risk: 'warn', warning: 'This changes where your events are published.' };
        case 'nip04.encrypt':
            return { label: 'Encrypt a message (NIP-04 — legacy)', risk: 'neutral', warning: null };
        case 'nip04.decrypt':
            return { label: 'Decrypt a private message (NIP-04)', risk: 'warn', warning: 'Grants this site access to private message content.' };
        case 'nip44.encrypt':
            return { label: 'Encrypt a message (NIP-44)', risk: 'neutral', warning: null };
        case 'nip44.decrypt':
            return { label: 'Decrypt a private message (NIP-44)', risk: 'warn', warning: 'Grants this site access to private message content.' };
        default:
            return { label: String(perm), risk: 'warn', warning: 'Unrecognized request type — proceed with caution.' };
    }
}
