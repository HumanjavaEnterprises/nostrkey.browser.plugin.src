/**
 * What signing this event would change, in plain words, compared with the
 * identity's current version. Covers kinds 0, 3, 10000, 10002 and 5.
 *
 * Pure: the worker gathers the current version and hands it in.
 *
 *   describeEffect(kind, next, current, { historyKinds })
 *     next     the event about to be signed
 *     current  null when no current version could be found, else
 *              { event, basis } or, for 10002 only, { relays, basis } where
 *              relays is [{ url, read, write }] and basis is
 *              'relays' | 'history' | 'local'
 *     historyKinds  for kind 5: Map or object of event id -> kind, from event history
 *
 *   -> { lines: string[], destructive: boolean, basis: 'relays'|'history'|'local'|'none' }
 *
 * Big lists are summarised; never more than a few entries are named.
 */
import { nip19 } from 'nostr-crypto-utils';
import { truncateNpub } from '../utilities/npub-guard.js';

export const EFFECT_KINDS = Object.freeze(new Set([0, 3, 5, 10000, 10002]));

/** Kind 3 / 10000 count as destructive above either threshold (Decision 2). */
export const REMOVE_COUNT_LIMIT = 10;
export const REMOVE_SHARE_LIMIT = 0.10;
const MAX_NAMED = 3;
const MAX_LABEL = 40;

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const clip = (s) => (s.length > MAX_LABEL ? `${s.slice(0, MAX_LABEL - 1)}…` : s);

function shortNpub(hex) {
    try { return truncateNpub(nip19.npubEncode(hex)); } catch (_) { return clip(hex); }
}

const tagsOf = (event) => (Array.isArray(event?.tags) ? event.tags.filter(Array.isArray) : []);

/** "a, b, c and 9 more" */
function named(labels, total) {
    const shown = labels.slice(0, MAX_NAMED);
    const rest = total - shown.length;
    return rest > 0 ? `${shown.join(', ')} and ${rest} more` : shown.join(', ');
}

// --- kind 3 / 10000 -------------------------------------------------------

const HEX64 = /^[0-9a-f]{64}$/i;

/** Public entries of a follow or mute list: Map key -> label. */
function listEntries(event, kind) {
    const out = new Map();
    for (const t of tagsOf(event)) {
        const [type, value] = t;
        if (typeof value !== 'string' || !value) continue;
        if (type === 'p' && HEX64.test(value)) {
            const pk = value.toLowerCase();
            const pet = typeof t[3] === 'string' && t[3].trim() ? clip(t[3].trim()) : null;
            const key = `p:${pk}`;
            if (!out.has(key) || pet) out.set(key, pet || shortNpub(pk));
        } else if (kind === 10000 && type === 't') {
            out.set(`t:${value.toLowerCase()}`, `#${clip(value)}`);
        } else if (kind === 10000 && type === 'word') {
            out.set(`word:${value.toLowerCase()}`, `"${clip(value)}"`);
        } else if (kind === 10000 && type === 'e' && HEX64.test(value)) {
            out.set(`e:${value.toLowerCase()}`, 'a thread');
        }
    }
    return out;
}

function describeList(kind, next, current) {
    const noun = kind === 3 ? ['follow', 'follows'] : ['muted item', 'muted items'];
    const listName = kind === 3 ? 'follow list' : 'mute list';
    const after = listEntries(next, kind);

    if (!current?.event) {
        return {
            lines: [
                `Could not check your current ${listName}, so this can't be compared.`,
                `This replaces your whole ${listName} with ${plural(after.size, ...noun)}.`,
            ],
            destructive: true,
            basis: 'none',
        };
    }

    const before = listEntries(current.event, kind);
    const removed = [...before.keys()].filter(k => !after.has(k));
    const added = [...after.keys()].filter(k => !before.has(k));
    const lines = [];

    if (removed.length && added.length) {
        lines.push(`Removes ${removed.length} of your ${plural(before.size, ...noun)}, adds ${added.length}.`);
    } else if (removed.length) {
        lines.push(`Removes ${removed.length} of your ${plural(before.size, ...noun)}.`);
    } else if (added.length) {
        lines.push(`Adds ${plural(added.length, ...noun)}.`);
    } else {
        lines.push(`No change to your ${noun[1]}.`);
    }
    if (removed.length) lines.push(`Removes: ${named(removed.map(k => before.get(k)), removed.length)}.`);
    if (added.length) lines.push(`Adds: ${named(added.map(k => after.get(k)), added.length)}.`);
    if (removed.length || added.length) lines.push(`After this: ${plural(after.size, ...noun)}.`);

    if (kind === 10000 && (next?.content || '') !== (current.event.content || '')) {
        lines.push('The private part also changes.');
    }

    const destructive = removed.length > REMOVE_COUNT_LIMIT
        || (before.size > 0 && removed.length / before.size > REMOVE_SHARE_LIMIT);
    return { lines, destructive, basis: current.basis || 'local' };
}

// --- kind 10002 -----------------------------------------------------------

const normUrl = (u) => u.trim().replace(/\/+$/, '').toLowerCase();

/** Map url -> { read, write } from r tags (NIP-65). */
function relaysOfEvent(event) {
    const out = new Map();
    for (const t of tagsOf(event)) {
        if (t[0] !== 'r' || typeof t[1] !== 'string' || !t[1].trim()) continue;
        const marker = t[2];
        if (marker !== undefined && marker !== 'read' && marker !== 'write') continue;
        const url = normUrl(t[1]);
        const seen = out.get(url) || { read: false, write: false };
        out.set(url, { read: seen.read || marker !== 'write', write: seen.write || marker !== 'read' });
    }
    return out;
}

function relaysOfList(list) {
    const out = new Map();
    for (const r of Array.isArray(list) ? list : []) {
        if (typeof r?.url !== 'string' || !r.url.trim()) continue;
        const url = normUrl(r.url);
        const seen = out.get(url) || { read: false, write: false };
        out.set(url, { read: seen.read || !!r.read, write: seen.write || !!r.write });
    }
    return out;
}

const modeWords = ({ read, write }) => (read && write ? 'read and write' : write ? 'write only' : read ? 'read only' : 'unused');
const bare = (url) => url.replace(/^wss?:\/\//, '');

function describeRelays(next, current) {
    const after = relaysOfEvent(next);
    const writesAfter = [...after.values()].filter(r => r.write).length;
    const noWrite = 'No write relays left. Apps will not know where to find your posts.';

    if (!current || (!current.event && !Array.isArray(current.relays))) {
        const lines = [
            "Could not check your current relay list, so this can't be compared.",
            `This replaces your whole relay list with ${plural(after.size, 'relay', 'relays')}.`,
        ];
        if (writesAfter === 0) lines.push(noWrite);
        return { lines, destructive: true, basis: 'none' };
    }

    const before = current.event ? relaysOfEvent(current.event) : relaysOfList(current.relays);
    const removed = [...before.keys()].filter(u => !after.has(u));
    const added = [...after.keys()].filter(u => !before.has(u));
    const changed = [...after.keys()].filter(u => before.has(u)
        && (before.get(u).read !== after.get(u).read || before.get(u).write !== after.get(u).write));
    const lines = [];

    if (removed.length) lines.push(`Removes ${plural(removed.length, 'relay', 'relays')}: ${named(removed.map(bare), removed.length)}.`);
    if (added.length) lines.push(`Adds ${plural(added.length, 'relay', 'relays')}: ${named(added.map(bare), added.length)}.`);
    for (const u of changed.slice(0, MAX_NAMED)) {
        lines.push(`Changes ${bare(u)} from ${modeWords(before.get(u))} to ${modeWords(after.get(u))}.`);
    }
    if (changed.length > MAX_NAMED) lines.push(`Changes ${changed.length - MAX_NAMED} more relays.`);
    if (!lines.length) lines.push('No change to your relays.');
    if (writesAfter === 0) lines.push(noWrite);

    const lostWrite = [...before.entries()].some(([u, r]) => r.write && !after.get(u)?.write);
    return { lines, destructive: lostWrite || writesAfter === 0, basis: current.basis || 'local' };
}

// --- kind 0 ---------------------------------------------------------------

function parseContent(event) {
    if (!event || typeof event.content !== 'string') return null;
    try {
        const v = JSON.parse(event.content);
        return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
    } catch (_) {
        return null;
    }
}

const hasValue = (v) => v !== undefined && v !== null && v !== '' && v !== false;
const fieldList = (keys) => named(keys.map(k => clip(String(k))), keys.length);

function describeProfile(next, current) {
    const after = parseContent(next);
    if (!after) {
        return {
            lines: ["The new profile can't be read. Signing it may blank your profile."],
            destructive: true,
            basis: current?.event ? (current.basis || 'local') : 'none',
        };
    }
    const setFields = Object.keys(after).filter(k => hasValue(after[k]));

    if (!current?.event) {
        return {
            lines: [
                "Could not check your current profile, so this can't be compared.",
                setFields.length ? `Sets ${fieldList(setFields)}.` : 'The new profile is empty.',
            ],
            destructive: false,
            basis: 'none',
        };
    }

    const before = parseContent(current.event) || {};
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
    const cleared = keys.filter(k => hasValue(before[k]) && !hasValue(after[k]));
    const added = keys.filter(k => !hasValue(before[k]) && hasValue(after[k]));
    const changed = keys.filter(k => hasValue(before[k]) && hasValue(after[k])
        && JSON.stringify(before[k]) !== JSON.stringify(after[k]));
    const lines = [];

    if (changed.length) lines.push(`Changes ${fieldList(changed)}.`);
    if (added.length) lines.push(`Adds ${fieldList(added)}.`);
    if (cleared.length) lines.push(`Clears ${fieldList(cleared)}.`);
    if (!lines.length) lines.push('No change to your profile.');

    return { lines, destructive: cleared.length > 0, basis: current.basis || 'local' };
}

// --- kind 5 ---------------------------------------------------------------

const KIND_NOUNS = Object.freeze({
    0: ['profile', 'profiles'], 1: ['note', 'notes'], 3: ['follow list', 'follow lists'],
    4: ['direct message', 'direct messages'], 6: ['repost', 'reposts'], 7: ['reaction', 'reactions'],
    16: ['repost', 'reposts'], 1111: ['comment', 'comments'], 10000: ['mute list', 'mute lists'],
    10002: ['relay list', 'relay lists'], 30023: ['article', 'articles'],
});
const kindNoun = (k, n) => (KIND_NOUNS[k] ? plural(n, ...KIND_NOUNS[k]) : plural(n, `kind ${k} event`, `kind ${k} events`));

function describeDelete(next, historyKinds) {
    const known = historyKinds instanceof Map ? historyKinds : new Map(Object.entries(historyKinds || {}));
    const tags = tagsOf(next);
    const ids = [...new Set(tags.filter(t => t[0] === 'e' && typeof t[1] === 'string').map(t => t[1].toLowerCase()))];
    const addrs = [...new Set(tags.filter(t => t[0] === 'a' && typeof t[1] === 'string').map(t => t[1]))];
    const kinds = [...new Set(tags.filter(t => t[0] === 'k' && typeof t[1] === 'string').map(t => t[1]))];
    const lines = [];

    if (ids.length) lines.push(`Asks relays to delete ${plural(ids.length, 'event', 'events')}.`);
    const counts = new Map();
    for (const id of ids) {
        const k = known.get(id);
        if (Number.isInteger(k)) counts.set(k, (counts.get(k) || 0) + 1);
    }
    if (counts.size) {
        const parts = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => kindNoun(k, n));
        lines.push(`From your history: ${named(parts, parts.length)}.`);
    }
    if (addrs.length) {
        lines.push(`Deletes every version of ${plural(addrs.length, 'item', 'items')} by address, not just one copy.`);
    }
    if (kinds.length && !counts.size) lines.push(`Kinds named: ${named(kinds.map(clip), kinds.length)}.`);
    if (!ids.length && !addrs.length) lines.push('Names nothing to delete.');
    lines.push('Relays may keep copies. A deletion cannot be undone.');

    return { lines, destructive: true, basis: counts.size ? 'history' : 'none' };
}

// --- entry point ----------------------------------------------------------

export function describeEffect(kind, next, current, { historyKinds } = {}) {
    switch (kind) {
        case 3:
        case 10000: return describeList(kind, next, current);
        case 10002: return describeRelays(next, current);
        case 0: return describeProfile(next, current);
        case 5: return describeDelete(next, historyKinds);
        default: return null;
    }
}
