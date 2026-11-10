/**
 * The newest verified copy of an identity's replaceable lists (kinds 0, 3,
 * 10000, 10002), kept on this device so the next comparison is instant.
 *
 * Keyed by (pubkey, kind). Lives in IndexedDB, never in `profiles` (which
 * syncs) and never in a backup. Only events signed by that pubkey are kept;
 * a write only replaces a stored copy when it is newer (tie: lower id).
 *
 * Where IndexedDB is missing (tests, odd engines) it falls back to memory.
 */
import { openDB } from 'idb';
import { isOwnEvent, pickNewest } from '../profiles/kind0.js';

export const LIST_KINDS = Object.freeze(new Set([0, 3, 10000, 10002]));

const keyOf = (pubkey, kind) => `${String(pubkey).toLowerCase()}:${kind}`;

/** A store over a backend with get(key) and put(key, value). */
export function createListStore(backend, { verify = isOwnEvent } = {}) {
    return {
        /** The stored event, or null. */
        async get(pubkey, kind) {
            try { return (await backend.get(keyOf(pubkey, kind)))?.event ?? null; } catch (_) { return null; }
        },
        /**
         * Keep `event` if it is a verified list event by its own author and newer
         * than the stored one. Returns true when it was kept.
         */
        async put(event) {
            if (!event || !LIST_KINDS.has(event.kind) || typeof event.pubkey !== 'string') return false;
            if (!(await verify(event, event.pubkey, event.kind))) return false;
            const key = keyOf(event.pubkey, event.kind);
            try {
                const stored = (await backend.get(key))?.event ?? null;
                if (stored && pickNewest([stored, event]) !== event) return false;
                await backend.put(key, { event, savedAt: Date.now() });
                return true;
            } catch (_) {
                return false;
            }
        },
    };
}

export function memoryBackend() {
    const map = new Map();
    return {
        async get(key) { return map.get(key); },
        async put(key, value) { map.set(key, value); },
    };
}

function idbBackend() {
    let dbp = null;
    const db = () => (dbp ??= openDB('lists', 1, {
        upgrade(d) { d.createObjectStore('latest'); },
    }));
    return {
        async get(key) { return (await db()).get('latest', key); },
        async put(key, value) { await (await db()).put('latest', value, key); },
    };
}

let shared = null;
/** The device store. */
export function listStore() {
    shared ??= createListStore(typeof indexedDB !== 'undefined' ? idbBackend() : memoryBackend());
    return shared;
}
