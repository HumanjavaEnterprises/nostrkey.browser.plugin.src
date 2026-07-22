/**
 * consent-locked-state — Locked-vault request gate (CS-14 / UC-28)
 *
 * LOGIC MIRROR of the ask() lock gate in src/background.js:1598-1629.
 * background.js is a service worker with import-time side effects and is not
 * cleanly importable, so this file re-implements the exact lock-gate branch
 * verbatim (see runLockGate below, which cites the mirrored source lines) with
 * injectable stand-ins for its runtime dependencies:
 *   - getProfileIndex / getProfile   (profile lookup; drives isBunker)
 *   - checkLockState                 (async lock probe)
 *   - nostrAccessWhileLocked flag + sessionKeys map (the deliberate bypass)
 *   - api.tabs.query / api.tabs.sendMessage (showLockedSheet dispatch)
 *   - validations map                (uuid -> sendResponse; fail-closed delete)
 *
 * No real crypto and no keys — the gate is pure control flow. Demo identities
 * only, matching the shared vectors' alice/bob when a pubkey label is needed.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Verbatim mirror of src/background.js:1598-1629 ─────────────────────────
// The only edits vs. source: (a) dependencies are read off `deps` instead of
// module-scope closures, and (b) the source's bare `return` (which returns from
// ask()) is expressed as `return { outcome: 'rejected', response }`; falling off
// the end returns `{ outcome: 'proceeded' }`. The branch conditions, the
// needsPrivateKey computation, the isFirstUnlock computation, the delete, and
// the dispatched message are copied character-for-character.
async function runLockGate(uuid, { kind }, deps) {
    const {
        getProfileIndex, getProfile, checkLockState,
        nostrAccessWhileLocked, sessionKeys, api, validations,
    } = deps;

    // Bunker profiles don't need local key decryption — skip lock check
    const pi = await getProfileIndex();
    const profile = await getProfile(pi);
    const isBunker = profile?.type === 'bunker';

    // Read-only operations (getPubKey, getRelays) work from cached data and
    // don't need the private key, so they bypass the lock check entirely.
    const needsPrivateKey = kind !== 'getPubKey' && kind !== 'getRelays' && kind !== 'addRelay';

    // If the extension is locked, reject signing/encryption requests (local profiles only)
    if (!isBunker && needsPrivateKey) {
        const isLocked = await checkLockState();
        if (isLocked) {
            if (!(nostrAccessWhileLocked && sessionKeys.has(pi))) {
                // No keys available — show locked notification and reject
                const isFirstUnlock = sessionKeys.size === 0;
                try {
                    const [activeTab] = await api.tabs.query({ active: true, currentWindow: true });
                    if (activeTab?.id) {
                        api.tabs.sendMessage(activeTab.id, { kind: 'showLockedSheet', firstUnlock: isFirstUnlock }).catch(() => {});
                    }
                } catch (_) {}
                const sendResponse = validations[uuid];
                delete validations[uuid];
                const response = { error: 'locked', message: 'Extension is locked. Please unlock with your master password.' };
                sendResponse?.(response);
                return { outcome: 'rejected', response };
            }
            // Keys available despite lock — proceed with permission check
        }
    }

    return { outcome: 'proceeded' };
}
// ───────────────────────────────────────────────────────────────────────────

// Test harness: builds a fresh set of injectable deps + spies per scenario.
function makeDeps({
    profileType = 'local',
    pi = 0,
    locked = true,
    nostrAccessWhileLocked = false,
    sessionKeysEntries = [], // array of pi keys currently cached in-session
    activeTabId = 42,
} = {}) {
    const sessionKeys = new Map(sessionKeysEntries.map(k => [k, { fake: true }]));
    const sendMessage = vi.fn(() => Promise.resolve());
    const tabsQuery = vi.fn(() => Promise.resolve(activeTabId == null ? [] : [{ id: activeTabId }]));
    const validations = {};
    const captured = {};
    // Record every sendResponse invocation and the object it received.
    function register(uuid) {
        validations[uuid] = vi.fn((resp) => { captured[uuid] = resp; });
        return validations[uuid];
    }
    return {
        deps: {
            getProfileIndex: vi.fn(() => Promise.resolve(pi)),
            getProfile: vi.fn(() => Promise.resolve({ type: profileType })),
            checkLockState: vi.fn(() => Promise.resolve(locked)),
            nostrAccessWhileLocked,
            sessionKeys,
            api: { tabs: { query: tabsQuery, sendMessage } },
            validations,
        },
        sessionKeys, sendMessage, tabsQuery, validations, captured, register,
    };
}

describe('needsPrivateKey computation (background.js:1607) — reads bypass the lock', () => {
    // CS-14: reads still succeed while locked. getPubKey/getRelays/addRelay must
    // NOT trip the locked reject even with the vault locked and no cached keys.
    for (const kind of ['getPubKey', 'getRelays', 'addRelay']) {
        it(`'${kind}' proceeds while locked (needsPrivateKey false)`, async () => {
            const h = makeDeps({ locked: true, sessionKeysEntries: [] });
            h.register('u1');
            const res = await runLockGate('u1', { kind }, h.deps);

            expect(res.outcome).toBe('proceeded');
            // No locked reject was sent, and the uuid is left intact for the
            // normal (proceed) path to consume.
            expect(h.validations['u1']).not.toHaveBeenCalled();
            expect('u1' in h.validations).toBe(true);
            // No locked sheet dispatched for a read.
            expect(h.sendMessage).not.toHaveBeenCalled();
        });
    }

    it("'signEvent' is treated as needing the private key (does NOT bypass)", async () => {
        const h = makeDeps({ locked: true, sessionKeysEntries: [] });
        h.register('u1');
        const res = await runLockGate('u1', { kind: 'signEvent' }, h.deps);
        expect(res.outcome).toBe('rejected');
    });
});

describe('signEvent while locked, fail-closed reject (UC-28)', () => {
    it("produces error 'locked' with a message, dispatches showLockedSheet, deletes the uuid", async () => {
        const h = makeDeps({
            locked: true,
            nostrAccessWhileLocked: false,
            sessionKeysEntries: [], // no cached key for pi
            activeTabId: 42,
        });
        const sendResponse = h.register('sig-1');

        const res = await runLockGate('sig-1', { kind: 'signEvent' }, h.deps);

        // 1. gate rejected with the locked error object + human message
        expect(res.outcome).toBe('rejected');
        expect(res.response).toEqual({
            error: 'locked',
            message: 'Extension is locked. Please unlock with your master password.',
        });

        // 2. showLockedSheet dispatched to the ACTIVE tab
        expect(h.tabsQuery).toHaveBeenCalledWith({ active: true, currentWindow: true });
        expect(h.sendMessage).toHaveBeenCalledTimes(1);
        expect(h.sendMessage).toHaveBeenCalledWith(42, { kind: 'showLockedSheet', firstUnlock: true });

        // 3. fail-closed: the site's call is answered promptly (never hung) …
        expect(sendResponse).toHaveBeenCalledTimes(1);
        expect(h.captured['sig-1']).toBe(res.response);
        // … and the uuid is removed from validations so it can never resolve twice.
        expect('sig-1' in h.validations).toBe(false);
    });

    it('does not dispatch a locked sheet when there is no active tab', async () => {
        const h = makeDeps({ locked: true, sessionKeysEntries: [], activeTabId: null });
        h.register('sig-2');
        const res = await runLockGate('sig-2', { kind: 'signEvent' }, h.deps);
        // Still fail-closed rejects, but no sendMessage (no tab to show it on).
        expect(res.outcome).toBe('rejected');
        expect(h.sendMessage).not.toHaveBeenCalled();
        expect('sig-2' in h.validations).toBe(false);
    });
});

describe('isFirstUnlock flag = (sessionKeys.size === 0) (background.js:1615,1619)', () => {
    it('true when no keys are cached in-session', async () => {
        const h = makeDeps({ locked: true, sessionKeysEntries: [] });
        h.register('u1');
        await runLockGate('u1', { kind: 'signEvent' }, h.deps);
        expect(h.sendMessage).toHaveBeenCalledWith(42, { kind: 'showLockedSheet', firstUnlock: true });
    });

    it('false when at least one key is cached (but not for the active pi)', async () => {
        // sessionKeys has an entry for a DIFFERENT profile index (99), so
        // sessionKeys.has(pi=0) is false -> still locked-rejects, but size>0 -> firstUnlock false.
        const h = makeDeps({
            locked: true,
            nostrAccessWhileLocked: false,
            pi: 0,
            sessionKeysEntries: [99],
        });
        h.register('u1');
        const res = await runLockGate('u1', { kind: 'signEvent' }, h.deps);
        expect(res.outcome).toBe('rejected');
        expect(h.sendMessage).toHaveBeenCalledWith(42, { kind: 'showLockedSheet', firstUnlock: false });
    });
});

describe('deliberate bypass: nostrAccessWhileLocked && sessionKeys.has(pi) (background.js:1613)', () => {
    it('proceeds (no locked reject) when both hold true while locked', async () => {
        const h = makeDeps({
            locked: true,
            nostrAccessWhileLocked: true,
            pi: 0,
            sessionKeysEntries: [0], // key for the active profile is cached
        });
        const sendResponse = h.register('u1');
        const res = await runLockGate('u1', { kind: 'signEvent' }, h.deps);

        expect(res.outcome).toBe('proceeded');
        expect(sendResponse).not.toHaveBeenCalled();
        expect(h.sendMessage).not.toHaveBeenCalled();
        expect('u1' in h.validations).toBe(true); // uuid preserved for the proceed path
    });

    it('does NOT bypass when nostrAccessWhileLocked is false even if the key is cached', async () => {
        const h = makeDeps({
            locked: true,
            nostrAccessWhileLocked: false,
            pi: 0,
            sessionKeysEntries: [0],
        });
        h.register('u1');
        const res = await runLockGate('u1', { kind: 'signEvent' }, h.deps);
        expect(res.outcome).toBe('rejected');
    });

    it('does NOT bypass when the key for the active pi is absent even if the flag is on', async () => {
        const h = makeDeps({
            locked: true,
            nostrAccessWhileLocked: true,
            pi: 0,
            sessionKeysEntries: [7], // wrong profile cached
        });
        h.register('u1');
        const res = await runLockGate('u1', { kind: 'signEvent' }, h.deps);
        expect(res.outcome).toBe('rejected');
    });
});

describe('bunker profile short-circuits the lock branch (background.js:1601,1610)', () => {
    it('signEvent proceeds even while locked when profile.type === "bunker"', async () => {
        const h = makeDeps({
            profileType: 'bunker',
            locked: true,
            nostrAccessWhileLocked: false,
            sessionKeysEntries: [],
        });
        const sendResponse = h.register('u1');
        const res = await runLockGate('u1', { kind: 'signEvent' }, h.deps);

        expect(res.outcome).toBe('proceeded');
        expect(sendResponse).not.toHaveBeenCalled();
        expect(h.sendMessage).not.toHaveBeenCalled();
        // A bunker gate never even probes lock state.
        expect(h.deps.checkLockState).not.toHaveBeenCalled();
    });
});

describe('locked reject removes the uuid exactly once (no double-delete / crash)', () => {
    it('captures the {error:"locked"} object and leaves validations without the uuid', async () => {
        const h = makeDeps({ locked: true, sessionKeysEntries: [] });
        h.register('once');
        const res = await runLockGate('once', { kind: 'signEvent' }, h.deps);

        expect(res.response.error).toBe('locked');
        expect(h.captured['once']).toEqual(res.response);
        expect('once' in h.validations).toBe(false);

        // Re-running the gate for the SAME uuid (its sendResponse already gone)
        // must not throw and must not double-invoke a stale responder.
        const res2 = await runLockGate('once', { kind: 'signEvent' }, h.deps);
        expect(res2.outcome).toBe('rejected');
        // sendResponse is now undefined -> optional-chaining no-op, no crash.
        expect(res2.response.error).toBe('locked');
    });
});

describe('not-locked path is untouched by the gate', () => {
    it('signEvent proceeds normally when the vault is unlocked', async () => {
        const h = makeDeps({ locked: false, sessionKeysEntries: [] });
        const sendResponse = h.register('u1');
        const res = await runLockGate('u1', { kind: 'signEvent' }, h.deps);
        expect(res.outcome).toBe('proceeded');
        expect(sendResponse).not.toHaveBeenCalled();
        expect(h.sendMessage).not.toHaveBeenCalled();
    });
});
