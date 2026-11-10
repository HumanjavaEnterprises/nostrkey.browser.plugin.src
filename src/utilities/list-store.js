/**
 * An identity's replaceable lists (kinds 0, 3, 10000, 10002), kept on this
 * device: the newest verified copy, and a short history of distinct versions
 * so an older one can be restored and a slow shrink can be seen.
 *
 * Keyed by (pubkey, kind). Lives in IndexedDB, never in `profiles` (which
 * syncs) and never in a backup. Only events signed by that pubkey are kept;
 * the newest copy is only replaced by a newer one (tie: lower id).
 *
 * History: up to HISTORY_CAP versions per key, deduped by id, newest first.
 * Each version records firstSeenAt and lastSeenAt (ms). lastSeenAt moves on
 * when the version is seen again, and when a newer version replaces it (it
 * was current until then).
 *
 * Where IndexedDB is missing (tests, odd engines) it falls back to memory.
 */
import { openDB } from 'idb';
import { isOwnEvent, pickNewest } from '../profiles/kind0.js';

export const LIST_KINDS = Object.freeze(new Set([0, 3, 10000, 10002]));
export const HISTORY_CAP = 10;
export const BASELINE_WINDOW_MS = 24 * 60 * 60 * 1000;

const keyOf = (pubkey, kind) => `${String(pubkey).toLowerCase()}:${kind}`;
const newestFirst = (a, b) => (b.event.created_at - a.event.created_at) || (a.event.id < b.event.id ? -1 : 1);

/**
 * A store over a backend with get(key)/put(key, value) for the newest copy and
 * getHistory(key)/putHistory(key, versions) for the history.
 */
export function createListStore(backend, { verify = isOwnEvent, now = () => Date.now() } = {}) {
    async function readHistory(key) {
        if (typeof backend.getHistory !== 'function') return [];
        const v = await backend.getHistory(key);
        return Array.isArray(v) ? v.filter(x => x && x.event) : [];
    }

    // History writes for one key run one at a time, so none is lost.
    const queues = new Map();
    function remember(event, at) {
        const key = keyOf(event.pubkey, event.kind);
        const run = (queues.get(key) || Promise.resolve()).then(() => rememberNow(key, event, at));
        const tail = run.catch(() => {});
        queues.set(key, tail);
        tail.then(() => { if (queues.get(key) === tail) queues.delete(key); });
        return run;
    }

    async function rememberNow(key, event, at) {
        if (typeof backend.putHistory !== 'function') return;
        const versions = await readHistory(key);
        const same = versions.find(v => v.event.id === event.id);
        if (same) {
            same.lastSeenAt = Math.max(same.lastSeenAt || 0, at);
        } else {
            // The version this one replaces was current until now.
            const prior = versions.length ? versions.slice().sort(newestFirst)[0] : null;
            if (prior && pickNewest([prior.event, event]) === event) prior.lastSeenAt = Math.max(prior.lastSeenAt || 0, at);
            versions.push({ event, firstSeenAt: at, lastSeenAt: at });
        }
        versions.sort(newestFirst);
        await backend.putHistory(key, versions.slice(0, HISTORY_CAP));
    }

    return {
        /** The stored newest event, or null. */
        async get(pubkey, kind) {
            try { return (await backend.get(keyOf(pubkey, kind)))?.event ?? null; } catch (_) { return null; }
        },
        /**
         * Record `event` if it is a verified list event by its own author: always
         * in the history, and as the newest copy when it is newer than the stored
         * one. Returns true when it became the newest copy.
         */
        async put(event) {
            if (!event || !LIST_KINDS.has(event.kind) || typeof event.pubkey !== 'string') return false;
            if (!(await verify(event, event.pubkey, event.kind))) return false;
            const at = now();
            try { await remember(event, at); } catch (_) { /* history is best effort */ }
            const key = keyOf(event.pubkey, event.kind);
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
        /** Versions newest first: [{ event, firstSeenAt, lastSeenAt }]. */
        async history(pubkey, kind) {
            try { return (await readHistory(keyOf(pubkey, kind))).sort(newestFirst); } catch (_) { return []; }
        },
        /**
         * The user knowingly approved a big change ("I understand"). Versions
         * seen before now no longer count toward the baseline, so the next
         * small change is not flagged again for the one already approved.
         */
        async acknowledge(pubkey, kind) {
            try { if (typeof backend.putHistory === 'function') await backend.putHistory(`${keyOf(pubkey, kind)}#ack`, now()); } catch (_) { /* best effort */ }
        },
        /** One version by event id, or null. */
        async version(pubkey, kind, id) {
            return (await this.history(pubkey, kind)).find(v => v.event.id === id) || null;
        },
        /**
         * The oldest version that was still current within the window: what the
         * list looked like about a day ago. Null when nothing is that recent.
         */
        async baseline(pubkey, kind, windowMs = BASELINE_WINDOW_MS) {
            const since = now() - windowMs;
            let ackAt = 0;
            try { ackAt = (typeof backend.getHistory === 'function' && await backend.getHistory(`${keyOf(pubkey, kind)}#ack`)) || 0; } catch (_) { ackAt = 0; }
            const recent = (await this.history(pubkey, kind))
                .filter(v => (v.lastSeenAt || 0) >= since && (v.firstSeenAt || 0) >= ackAt);
            return recent.length ? recent[recent.length - 1] : null;
        },
    };
}

export function memoryBackend() {
    const latest = new Map();
    const hist = new Map();
    return {
        async get(key) { return latest.get(key); },
        async put(key, value) { latest.set(key, value); },
        async getHistory(key) { return structuredClone(hist.get(key)); },
        async putHistory(key, value) { hist.set(key, structuredClone(value)); },
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
        async getHistory(key) { return (await db()).get('history', key); },
        async putHistory(key, value) { await (await db()).put('history', value, key); },
    };
}

let shared = null;
/** The device store. */
export function listStore() {
    shared ??= createListStore(typeof indexedDB !== 'undefined' ? idbBackend() : memoryBackend());
    return shared;
}
