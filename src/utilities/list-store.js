/**
 * An identity's replaceable lists (kinds 0, 3, 10000, 10002), kept on this
 * device: the newest verified copy, and a short history of distinct versions
 * so an older one can be restored and a slow shrink can be seen.
 *
 * Keyed by (pubkey, kind). Lives in IndexedDB, never in `profiles` (which
 * syncs) and never in a backup. Only events signed by that pubkey are kept;
 * the newest copy is only replaced by a newer one (tie: lower id). Events
 * dated more than FUTURE_LIMIT_S ahead are refused.
 *
 * History: versions deduped by id, newest first. Each records firstSeenAt and
 * lastSeenAt (ms) and `seen`: true once relays returned it or it was published,
 * false while it is only signed here ("Signed, not seen on relays"). A version
 * whose tags and content match the newest one is not added again; the newest
 * one's lastSeenAt moves on instead. When a newer seen version arrives, the
 * previous seen one is stamped as current until then.
 *
 * Keeping: the HISTORY_CAP newest, plus versions the cap must not push out so a
 * site cannot flush the record by signing many copies: the baseline (below),
 * an approved version, the newest version last current before the window, and
 * the newest version for each of the last KEEP_DAYS calendar days.
 *
 * Slow-shrink baseline (used by the effect preview for kinds 3, 10000, 10002):
 * the oldest SEEN version still current within the last 24 hours, or the
 * version the user last approved with "I understand" if that is newer. Limits:
 * it only reaches back 24 hours, so a list shrunk one step a day is not caught;
 * on a fresh device or after the history is cleared there is no baseline until
 * a version has been seen; and it only knows versions this device saw.
 *
 * Where IndexedDB is missing (tests, odd engines) it falls back to memory.
 */
import { openDB } from 'idb';
import { isOwnEvent, pickNewest } from '../profiles/kind0.js';

export const LIST_KINDS = Object.freeze(new Set([0, 3, 10000, 10002]));
export const HISTORY_CAP = 10;
export const BASELINE_WINDOW_MS = 24 * 60 * 60 * 1000;
export const FUTURE_LIMIT_S = 600;
export const KEEP_DAYS = 7;
const APPROVAL_TTL_MS = 2 * 60 * 1000;

const keyOf = (pubkey, kind) => `${String(pubkey).toLowerCase()}:${kind}`;
const newestFirst = (a, b) => (b.event.created_at - a.event.created_at) || (a.event.id < b.event.id ? -1 : 1);
const sameBody = (a, b) => a.content === b.content && JSON.stringify(a.tags) === JSON.stringify(b.tags);
const dayOf = (ms) => new Date(ms).toDateString();

/**
 * A store over a backend with get/put/del(key) for the newest copy and
 * getHistory/putHistory/delHistory(key) for the history and its markers.
 */
export function createListStore(backend, { verify = isOwnEvent, now = () => Date.now() } = {}) {
    const hasHistory = typeof backend.getHistory === 'function' && typeof backend.putHistory === 'function';
    // Approvals waiting for their signed event: key -> [{ tags, content, until }].
    const approvals = new Map();

    async function readHistory(key) {
        if (!hasHistory) return [];
        const v = await backend.getHistory(key);
        return Array.isArray(v) ? v.filter(x => x && x.event) : [];
    }
    async function readAck(key) {
        if (!hasHistory) return null;
        const v = await backend.getHistory(`${key}#ack`);
        return v && typeof v.id === 'string' ? v : null;
    }

    function pickBaseline(versions, ack, at) {
        const since = at - BASELINE_WINDOW_MS;
        const acked = ack ? versions.find(v => v.event.id === ack.id) : null;
        let pool = versions.filter(v => v.seen && (v.lastSeenAt || 0) >= since);
        if (acked) pool = pool.filter(v => newestFirst(v, acked) <= 0); // not older than the approved one
        else if (ack) pool = pool.filter(v => (v.firstSeenAt || 0) >= ack.at);
        const oldest = pool.length ? pool[pool.length - 1] : null;
        if (acked && (!oldest || newestFirst(acked, oldest) >= 0)) return acked;
        return oldest;
    }

    /** Which versions to keep: the cap's newest plus the protected ones. */
    function keep(versions, ack, at) {
        const kept = new Set(versions.slice(0, HISTORY_CAP));
        const base = pickBaseline(versions, ack, at);
        if (base) kept.add(base);
        if (ack) versions.filter(v => v.event.id === ack.id).forEach(v => kept.add(v));
        const before = versions.find(v => v.seen && (v.lastSeenAt || 0) < at - BASELINE_WINDOW_MS);
        if (before) kept.add(before);
        const days = new Set();
        for (const v of versions) {
            const t = v.firstSeenAt || v.lastSeenAt || 0;
            if (t < at - KEEP_DAYS * BASELINE_WINDOW_MS) continue;
            const d = dayOf(t);
            if (!days.has(d)) { days.add(d); kept.add(v); }
        }
        return versions.filter(v => kept.has(v));
    }

    function takeApproval(key, event, at) {
        const list = (approvals.get(key) || []).filter(a => a.until > at);
        const i = list.findIndex(a => sameBody(a, event));
        if (i >= 0) list.splice(i, 1);
        if (list.length) approvals.set(key, list); else approvals.delete(key);
        return i >= 0;
    }

    // History writes for one key run one at a time, so none is lost.
    const queues = new Map();
    function serial(key, fn) {
        const run = (queues.get(key) || Promise.resolve()).then(fn);
        const tail = run.catch(() => {});
        queues.set(key, tail);
        tail.then(() => { if (queues.get(key) === tail) queues.delete(key); });
        return run;
    }

    async function rememberNow(key, event, at, seen) {
        if (!hasHistory) return;
        const versions = (await readHistory(key)).sort(newestFirst);
        let ack = await readAck(key);
        const same = versions.find(v => v.event.id === event.id);
        if (same) {
            same.lastSeenAt = Math.max(same.lastSeenAt || 0, at);
            if (seen) same.seen = true;
        } else if (versions.length && sameBody(versions[0].event, event) && pickNewest([versions[0].event, event]) === event) {
            // Same list signed again with a new date: not a new version.
            versions[0].lastSeenAt = Math.max(versions[0].lastSeenAt || 0, at);
            if (seen) versions[0].seen = true;
        } else {
            if (seen) {
                const prior = versions.find(v => v.seen);
                if (prior && pickNewest([prior.event, event]) === event) prior.lastSeenAt = Math.max(prior.lastSeenAt || 0, at);
            }
            versions.push({ event, firstSeenAt: at, lastSeenAt: at, seen: !!seen });
            versions.sort(newestFirst);
        }
        if (takeApproval(key, event, at)) {
            const kept = versions.find(v => v.event.id === event.id) || versions.find(v => sameBody(v.event, event));
            if (kept) { ack = { id: kept.event.id, at }; await backend.putHistory(`${key}#ack`, ack); }
        }
        await backend.putHistory(key, keep(versions, ack, at));
    }

    return {
        /** The stored newest event, or null. */
        async get(pubkey, kind) {
            try { return (await backend.get(keyOf(pubkey, kind)))?.event ?? null; } catch (_) { return null; }
        },
        /**
         * Record `event` if it is a verified list event by its own author and not
         * dated in the future: in the history, and as the newest copy when it is
         * newer than the stored one. `seen`: relays returned it or accepted it.
         * Returns true when it became the newest copy.
         */
        async put(event, { seen = false } = {}) {
            if (!event || !LIST_KINDS.has(event.kind) || typeof event.pubkey !== 'string') return false;
            const at = now();
            if (typeof event.created_at !== 'number' || event.created_at > at / 1000 + FUTURE_LIMIT_S) return false;
            if (!(await verify(event, event.pubkey, event.kind))) return false;
            const key = keyOf(event.pubkey, event.kind);
            try { await serial(key, () => rememberNow(key, event, at, seen)); } catch (_) { /* history is best effort */ }
            try {
                const stored = (await backend.get(key))?.event ?? null;
                if (stored && stored.id === event.id) return false;
                if (stored && pickNewest([stored, event]) !== event) return false;
                await backend.put(key, { event, savedAt: at });
                return true;
            } catch (_) {
                return false;
            }
        },
        /** Versions newest first: [{ event, firstSeenAt, lastSeenAt, seen }]. */
        async history(pubkey, kind) {
            try { return (await readHistory(keyOf(pubkey, kind))).sort(newestFirst); } catch (_) { return []; }
        },
        /** One version by event id, or null. */
        async version(pubkey, kind, id) {
            return (await this.history(pubkey, kind)).find(v => v.event.id === id) || null;
        },
        /** What the list looked like about a day ago (see the file comment). Null when unknown. */
        async baseline(pubkey, kind) {
            const key = keyOf(pubkey, kind);
            try { return pickBaseline(await this.history(pubkey, kind), await readAck(key), now()); } catch (_) { return null; }
        },
        /**
         * The user approved this list with "I understand". When the signed event
         * for it is stored (put), that version becomes the baseline. Nothing
         * changes if it is never signed.
         */
        approve(pubkey, kind, { tags, content }) {
            const key = keyOf(pubkey, kind);
            const list = approvals.get(key) || [];
            list.push({ tags: tags || [], content: content || '', until: now() + APPROVAL_TTL_MS });
            approvals.set(key, list);
        },
        /** The approved version is this stored event (restore, after it was published). */
        async acknowledge(pubkey, kind, id) {
            const key = keyOf(pubkey, kind);
            try { await serial(key, () => (hasHistory ? backend.putHistory(`${key}#ack`, { id, at: now() }) : null)); } catch (_) { /* best effort */ }
        },
        /** Forget everything kept for an identity (it was deleted). */
        async forget(pubkey) {
            for (const kind of LIST_KINDS) {
                const key = keyOf(pubkey, kind);
                approvals.delete(key);
                try {
                    await serial(key, async () => {
                        await backend.del?.(key);
                        await backend.delHistory?.(key);
                        await backend.delHistory?.(`${key}#ack`);
                    });
                } catch (_) { /* best effort */ }
            }
        },
    };
}

export function memoryBackend() {
    const latest = new Map();
    const hist = new Map();
    return {
        async get(key) { return latest.get(key); },
        async put(key, value) { latest.set(key, value); },
        async del(key) { latest.delete(key); },
        async getHistory(key) { return structuredClone(hist.get(key)); },
        async putHistory(key, value) { hist.set(key, structuredClone(value)); },
        async delHistory(key) { hist.delete(key); },
    };
}

function idbBackend() {
    let dbp = null;
    const db = () => (dbp ??= openDB('lists', 2, {
        upgrade(d) {
            if (!d.objectStoreNames.contains('latest')) d.createObjectStore('latest');
            if (!d.objectStoreNames.contains('history')) d.createObjectStore('history');
        },
    }));
    return {
        async get(key) { return (await db()).get('latest', key); },
        async put(key, value) { await (await db()).put('latest', value, key); },
        async del(key) { await (await db()).delete('latest', key); },
        async getHistory(key) { return (await db()).get('history', key); },
        async putHistory(key, value) { await (await db()).put('history', value, key); },
        async delHistory(key) { await (await db()).delete('history', key); },
    };
}

let shared = null;
/** The device store. */
export function listStore() {
    shared ??= createListStore(typeof indexedDB !== 'undefined' ? idbBackend() : memoryBackend());
    return shared;
}
