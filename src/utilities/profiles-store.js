/**
 * One ordered write path for the `profiles` array in storage.local.
 *
 * Every writer used to read the whole array, await something (crypto, a relay
 * fetch, another storage read) and write the whole array back. A slow writer
 * then wrote a stale copy over a newer one: a relay edit vanished, or a site
 * permission that had just been revoked came back.
 *
 * Here every change runs as: take the lock, read `profiles` fresh, apply a
 * SYNCHRONOUS mutator that changes only the fields its caller owns, write, let
 * go. Slow work happens before the call, never inside the lock.
 *
 * The lock is the Web Locks API when the context has it. The worker and every
 * extension page share one origin, so one named lock orders writes across all
 * of them without a new message kind. Each context also chains its own calls,
 * which is the whole lock where Web Locks are missing (tests, older engines).
 */
import { api } from './browser-polyfill';

const LOCK_NAME = 'nostrkey:profiles';
let localChain = Promise.resolve();
let warnedNoLocks = false;
// True only while a mutator runs. A mutator is synchronous, so this is exact:
// any profiles write started from inside one would wait on the lock it holds.
let inMutator = false;

function refuseReentry() {
    if (inMutator) {
        throw new Error('profiles-store: a profiles write was started from inside a profiles mutator; it would wait on itself');
    }
}

/** Run `fn` with the profiles lock held. Never call this from inside `fn`. */
export function withProfilesLock(fn) {
    refuseReentry();
    const locks = globalThis.navigator?.locks;
    if (!(locks && typeof locks.request === 'function') && !warnedNoLocks) {
        warnedNoLocks = true;
        console.warn('[profiles-store] navigator.locks is not available; profiles writes are ordered within this context only');
    }
    const task = (locks && typeof locks.request === 'function')
        ? () => locks.request(LOCK_NAME, () => fn())
        : () => fn();
    const run = localChain.then(task, task);
    localChain = run.catch(() => {});
    return run;
}

/**
 * Read `profiles` fresh, apply `mutator(profiles, data)` and write the result.
 *
 * The mutator must be synchronous. It changes the array in place and returns
 * false to skip the write, or an object of other keys to write in the same
 * storage write, or nothing. `keys` names other stored values (with defaults)
 * the mutator needs to read; they arrive in `data`.
 *
 * @returns {Promise<{written: boolean, profiles: Array}>}
 */
export function updateProfiles(mutator, { storage = api.storage.local, keys = {} } = {}) {
    refuseReentry();
    return withProfilesLock(async () => {
        const data = await storage.get({ ...keys, profiles: [] });
        const profiles = Array.isArray(data.profiles) ? data.profiles : [];
        let out;
        inMutator = true;
        try { out = mutator(profiles, data); } finally { inMutator = false; }
        if (out && typeof out.then === 'function') {
            throw new Error('updateProfiles: the mutator must be synchronous');
        }
        if (out === false) return { written: false, profiles };
        await storage.set({ ...(out || {}), profiles });
        return { written: true, profiles };
    });
}

/**
 * Apply private-key changes worked out earlier, matched by the stored blob
 * they replace, so a profile that moved or changed meanwhile is never touched
 * by mistake. `changes` maps an old privKey to `{ privKey?, pubKey? }`; a
 * pubKey is only filled in where none is cached. Returns the update result.
 */
export function applyKeyChanges(changes, { storage, extra = null, writeIfEmpty = false } = {}) {
    if (!(changes instanceof Map) || (changes.size === 0 && !writeIfEmpty)) {
        return Promise.resolve({ written: false, profiles: null });
    }
    return updateProfiles((profiles) => {
        let changed = false;
        for (const p of profiles) {
            if (!p || !p.privKey || !changes.has(p.privKey)) continue;
            const c = changes.get(p.privKey);
            if (c.pubKey && !p.pubKey) { p.pubKey = c.pubKey; changed = true; }
            if (c.privKey && c.privKey !== p.privKey) { p.privKey = c.privKey; changed = true; }
        }
        if (!changed && !writeIfEmpty) return false;
        return extra || undefined;
    }, { storage });
}
