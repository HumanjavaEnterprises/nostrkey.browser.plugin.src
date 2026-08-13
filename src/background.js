import {
    nip04,
    nip44,
    nip19,
    getPublicKeySync,
    finalizeEvent,
    bytesToHex,
    hexToBytes,
    calculateEventId,
    verifySignature,
} from 'nostr-crypto-utils';
import { encrypt as nip49Encrypt, decrypt as nip49Decrypt } from 'nostr-crypto-utils/nip49';
import { keyToSeedPhrase, seedPhraseToKey, seedPhraseToKeyLegacy, isValidSeedPhrase } from './utilities/seedphrase.js';
import { generateKeyPair } from './utilities/keys.js';
import { Mutex } from 'async-mutex';
import {
    getProfileIndex,
    get,
    getProfile,
    getProfiles,
    getPermission,
    setPermission,
    isEncrypted,
    checkPassword,
    encryptAllKeys,
    changePasswordForKeys,
    removePasswordProtection,
    findStrandedPasswordKeys,
    recoverStrandedKeys,
    getDecryptedPrivKey,
    isEncryptedBlob,
    isDeviceKeyBlob,
    isCiphertext,
} from './utilities/utils';
import {
    encrypt as encryptBlob,
    decrypt as decryptBlob,
    encryptWithKey,
    deriveKey,
    exportKeyBase64,
    importKeyBase64,
    bytesToBase64,
    base64ToBytes,
} from './utilities/crypto';
import {
    encryptWithDeviceKey,
    decryptWithDeviceKey,
    decryptDeviceBlobForRewrap,
    setSessionKey as setVaultSessionKey,
    clearSession as clearVaultSession,
    setUnlocked as setVaultUnlocked,
    resetDeviceKey,
} from './utilities/secret-vault';
import { saveEvent } from './utilities/db';
import { api } from './utilities/browser-polyfill';
import { initSync, scheduleSyncPush } from './utilities/sync-manager';
import {
    RelayConnection,
    getOrCreateSession,
    createSession,
    disconnectSession,
    isSessionActive,
    validateBunkerUrl,
} from './utilities/nip46';
import { BunkerServer, generateSecret } from './utilities/bunker-server';
import {
    buildVaultEvent,
    buildVaultDeletion,
    buildVaultFilter,
    parseVaultEvent,
} from './utilities/nip78';

// Wrap storage.local with an interceptor that auto-triggers sync push on writes
const _rawStorage = api.storage.local;
const storage = {
    get: (...args) => _rawStorage.get(...args),
    set: (...args) => {
        const result = _rawStorage.set(...args);
        result.then(() => scheduleSyncPush()).catch(() => {});
        return result;
    },
    clear: (...args) => _rawStorage.clear(...args),
    remove: (...args) => _rawStorage.remove(...args),
};
const log = msg => console.log('Background: ', msg);

// T0-6: message kinds whose payload carries a secret (master password, private
// key, seed phrase, ncryptsec, backup blob). Their payload must NEVER be logged
// — we redact at the source rather than relying on prod builds dropping console.
const SECRET_LOG_KINDS = new Set([
    'unlock', 'setPassword', 'changePassword', 'removePassword',
    'savePrivateKey', 'backup.import', 'backup.export',
    'apikeys.encrypt', 'apikeys.decrypt', 'apikeys.publish',
    'vault.publish', 'importSeedPhrase', 'importKey', 'wrapPrivKey',
]);

/**
 * Log an inbound message without ever emitting a secret-bearing payload.
 * For sensitive kinds we log only the kind; otherwise the message as-is.
 */
function logMessage(message) {
    if (message && typeof message === 'object' && SECRET_LOG_KINDS.has(message.kind)) {
        log(`{ kind: '${message.kind}', payload: '[redacted]' }`);
        return;
    }
    log(message);
}
const validations = {};
// BUNK-01/T0-7: pending NIP-46 bunker approval decisions, keyed by the prompt
// uuid. Resolved by the extension-owned permission page's allowed/denied
// messages (isExtensionSender-gated), never by a web page.
const bunkerApprovals = {};
let prompt = {
    mutex: new Mutex(), release: null, tabId: null, sheetTabId: null, sheetUrl: null,
    // Auto-decline timer + the countdown deadline the consent UI mirrors.
    denyTimer: null, deadline: 0,
    // Kept so a compromised sheet can rebuild + reopen the SAME prompt as a tab.
    baseUrl: null, pending: null,
};
let pendingQueue = { total: 0, processed: 0 };
let activeBunkerServer = null;

/**
 * Helper: run an async function and deliver the result via sendResponse.
 * Chrome MV3 does not reliably deliver Promise-return values from onMessage
 * listeners — only the sendResponse callback pattern works.  Use this with
 * `return true;` in the switch case to keep the message channel open.
 */
function reply(sendResponse, fn) {
    fn().then(r => sendResponse(r)).catch(e => {
        console.error('reply() error:', e);
        // Surface the real failure instead of masking it as undefined — the
        // popup renders `error`, and "Service worker not ready" was hiding
        // genuine exceptions (see 1.8.1 unlock-failure investigation).
        sendResponse({ success: false, error: `Internal: ${e && e.message ? e.message : String(e)}` });
    });
}

// Rate limiter: max 5 permission prompts per host per 10-second window
const rateLimits = new Map();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 10000;

// How long a pending signing prompt stays open before it auto-declines. Surfaced
// to the consent UI as a live countdown (permission.html reads ?deadline=&ttl=).
const PROMPT_TIMEOUT_MS = 40_000;

// Arm (or re-arm) the auto-decline timer for the current prompt and stamp the
// deadline the consent UI counts down to. Re-arming (e.g. on tab escalation)
// clears the previous timer so there is always exactly one pending decline.
function armPromptTimeout(uuid, kind, host) {
    if (prompt.denyTimer) { clearTimeout(prompt.denyTimer); prompt.denyTimer = null; }
    prompt.deadline = Date.now() + PROMPT_TIMEOUT_MS;
    prompt.denyTimer = setTimeout(() => {
        prompt.denyTimer = null;
        // Deny the still-pending request on timeout instead of silently releasing.
        if (validations[uuid]) {
            deny({ payload: uuid, origKind: kind, host });
        }
        prompt.release?.();
    }, PROMPT_TIMEOUT_MS);
}

function isRateLimited(host) {
    const now = Date.now();
    let timestamps = rateLimits.get(host) || [];
    timestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
    if (timestamps.length >= RATE_LIMIT_MAX) {
        rateLimits.set(host, timestamps);
        return true;
    }
    timestamps.push(now);
    rateLimits.set(host, timestamps);
    return false;
}

// --- Session state for master password encryption ---------------------------
// Decrypted keys are held in memory only while unlocked.
// Map of profileIndex -> hex private key string
const sessionKeys = new Map();
let sessionCryptoKey = null; // derived AES-256-GCM key (opaque CryptoKey, not raw password)
let sessionKeySalt = null;   // salt used to derive sessionCryptoKey
// Base64 raw bytes of sessionCryptoKey, kept ONLY so the unlocked session can be
// parked in storage.session and fully restored after an MV3 worker eviction.
// Never persisted to disk; cleared on lock. See persistSessionState.
let sessionKeyRaw = null;
let locked = true; // start locked; determined on first isLocked check
let encryptionEnabled = false; // cached encryption state for fast lookups
let autoLockTimeout = 15 * 60 * 1000; // 15 minutes default
let autoLockTimer = null;
let nostrAccessWhileLocked = false;

let blockCrossOriginFrames = true;

// Brute-force protection for unlock attempts
let unlockAttempts = 0;
let unlockCooldownUntil = 0;

// Profiles whose key is wrapped under a master password the vault holds no
// verifier for. `null` = not resolved yet; resolved once at startup and again
// after a recovery. `strandedOnly` means NO profile holds a readable key, which
// is what makes the unlock surface worth offering on a passwordless vault.
let strandedProfiles = null;
let strandedOnly = false;

// Permission request rate limiting per origin
const permissionRateMap = new Map(); // host → { count, resetAt }

/**
 * Mutex that serializes lockSession / unlockSession / startup state resolution
 * so the auto-lock timer callback (or an early `unlock` message that arrives
 * while the worker is still booting) cannot interleave with an in-progress
 * unlock. Declared here — ahead of the startup IIFE — because startup takes it.
 */
const sessionMutex = new Mutex();

// --- Session survival across service-worker eviction (D3) -------------------
// Chrome MV3 evicts the worker after ~30s idle, which used to drop every
// decrypted key and force a re-unlock regardless of the user's auto-lock
// setting. storage.session is memory-backed, browser-managed and never written
// to disk, so it is the right (and only) place to park the decrypted keys for
// the life of the browser session. It is feature-detected: where it does not
// exist (Safari background page, older Firefox) behaviour is unchanged and the
// user still re-unlocks after a restart.
const SESSION_STATE_KEY = 'nkSessionState';

/**
 * Serializes every write to the parked session state. A park and a clear are
 * both fire-and-forget, so without this the clear issued by lockSession can
 * complete while a park issued a moment earlier is still in flight, and the
 * park lands last — leaving a locked vault's session key parked for the next
 * worker start. Chaining makes "clear after park" hold in issue order.
 */
let sessionParkChain = Promise.resolve();

/**
 * Mirror the current unlocked session into storage.session.
 * `lockAt` is the absolute epoch-ms auto-lock deadline (0 = no auto-lock), so a
 * resumed worker inherits the ORIGINAL deadline instead of extending it.
 */
function persistSessionState(lockAt) {
    if (!api.storage.session || !encryptionEnabled || locked) return;
    // SECURITY NOTE: `keyRaw` is the raw AES bytes of the password-derived
    // session key. That is the SAME exposure tier as the hex private keys
    // already parked in `keys` — storage.session is memory-backed, never hits
    // disk, dies with the browser session, and is restricted to
    // TRUSTED_CONTEXTS. No new tier is introduced by carrying it. Without it a
    // resumed worker is only half-unlocked (can read, cannot wrap), which is
    // the 1.8.1 half-unlocked bug. Blobs written after a resume still carry
    // their own salt, so the master password re-derives them at the next real
    // unlock.
    const parked = {
        [SESSION_STATE_KEY]: {
            keys: [...sessionKeys.entries()],
            lockAt: lockAt || 0,
            keyRaw: sessionKeyRaw || null,
            salt: sessionKeySalt ? bytesToBase64(sessionKeySalt) : null,
        },
    };
    sessionParkChain = sessionParkChain
        .catch(() => {})
        .then(() => api.storage.session.set(parked))
        .catch(e => log(`[SESSION] persist failed: ${e.message}`));
}

function clearPersistedSessionState() {
    if (!api.storage.session) return;
    sessionParkChain = sessionParkChain
        .catch(() => {})
        .then(() => api.storage.session.remove(SESSION_STATE_KEY))
        .catch(e => log(`[SESSION] clear failed: ${e.message}`));
}

/**
 * Wrap a secret for the tier this vault is actually in, decided HERE from this
 * module's own state instead of from a helper's ambient precedence: a password
 * blob while a master-password session is live, a device blob otherwise.
 *
 * Every background site that persists a secret goes through this, so the tier a
 * write lands on is a property of the call site's own module state and cannot
 * change because some other file's session wiring changed. Refuses outright
 * rather than emitting a device blob into a password-protected vault (F1).
 */
async function wrapSecretForCurrentTier(plaintext) {
    if (encryptionEnabled) {
        if (!sessionCryptoKey) {
            throw new Error('NostrKey is locked — cannot wrap a secret without a session key.');
        }
        return encryptWithKey(plaintext, sessionCryptoKey, sessionKeySalt);
    }
    return encryptWithDeviceKey(plaintext);
}

/**
 * Restore a session parked by a previous instance of this worker.
 * Returns true when the session was resumed (caller stays unlocked).
 *
 * Restores BOTH halves: the profileIndex→hex map AND the password-derived
 * session key (re-imported non-extractable from its parked raw bytes). A
 * resumed worker is therefore FULLY unlocked — wrapPrivKey, key creation,
 * import and export all work, where before they failed with "locked" until the
 * user manually locked and unlocked again.
 */
async function restoreSessionState() {
    if (!api.storage.session) return false;
    try {
        const got = await api.storage.session.get({ [SESSION_STATE_KEY]: null });
        const st = got?.[SESSION_STATE_KEY];
        if (!st || !Array.isArray(st.keys) || st.keys.length === 0) return false;
        if (st.lockAt && Date.now() >= st.lockAt) {
            log('[SESSION] Parked session is past its auto-lock deadline — staying locked');
            clearPersistedSessionState();
            return false;
        }
        sessionKeys.clear();
        for (const [i, hex] of st.keys) sessionKeys.set(Number(i), hex);
        // Rebuild the session CryptoKey so writes resume too, not just reads.
        if (st.keyRaw && st.salt) {
            try {
                sessionCryptoKey = await importKeyBase64(st.keyRaw);
                sessionKeySalt = base64ToBytes(st.salt);
                sessionKeyRaw = st.keyRaw;
                // Tier-agnostic vault writes (notes, API keys) must produce
                // password blobs again in this context.
                setVaultSessionKey(sessionCryptoKey, sessionKeySalt);
            } catch (e) {
                // Keys still resume; only the write path degrades.
                log(`[SESSION] session key restore failed: ${e.message}`);
            }
        }
        // Re-arm the alarm for the REMAINING time, not a fresh full interval.
        if (st.lockAt && api.alarms) {
            api.alarms.create(AUTO_LOCK_ALARM, {
                delayInMinutes: Math.max((st.lockAt - Date.now()) / 60000, 0.5),
            });
        }
        log(`[SESSION] Resumed ${sessionKeys.size} key(s) from storage.session`);
        return true;
    } catch (e) {
        log(`[SESSION] restore failed: ${e.message}`);
        return false;
    }
}

// Load persisted state on startup
(async () => {
    log('[STARTUP] Reading persisted state...');
    // Restrict the session area to extension-privileged contexts before anything
    // is written to it (Chrome-only; a no-op elsewhere).
    api.storage.session?.setAccessLevel?.({ accessLevel: 'TRUSTED_CONTEXTS' }).catch(() => {});
    const data = await storage.get({ autoLockMinutes: 15, isEncrypted: false, passwordHash: null, nostrAccessWhileLocked: false, blockCrossOriginFrames: true });
    log(`[STARTUP] isEncrypted=${data.isEncrypted}, passwordHash=${data.passwordHash ? 'EXISTS' : 'null'}, autoLockMinutes=${data.autoLockMinutes}`);
    autoLockTimeout = data.autoLockMinutes * 60 * 1000;
    // Defensive: if passwordHash exists but flag is stale, self-heal
    if (!data.isEncrypted && data.passwordHash) {
        log('[STARTUP] Self-healing: passwordHash exists but isEncrypted=false → fixing');
        await storage.set({ isEncrypted: true });
        data.isEncrypted = true;
    }
    // Resolve the lock state under the session mutex: an `unlock` message can
    // land while this IIFE is still awaiting, and the old unconditional
    // `locked = encryptionEnabled` would stomp it back to locked.
    const startupRelease = await sessionMutex.acquire();
    try {
        encryptionEnabled = data.isEncrypted;
        nostrAccessWhileLocked = !!data.nostrAccessWhileLocked;
        blockCrossOriginFrames = data.blockCrossOriginFrames !== false;
        // An `unlock` message can arrive AND COMPLETE while this IIFE is still
        // awaiting storage — it takes the same mutex, so it either ran fully
        // before us or is still queued behind us. A live sessionCryptoKey means
        // it already ran: leave `locked` alone and do not touch the vault
        // session, or we stomp a real unlock back to locked (the 1.8.1
        // "unlocked then instantly locked" report).
        const alreadyUnlocked = sessionCryptoKey !== null;
        let resumed = false;
        if (alreadyUnlocked) {
            log('[STARTUP] An unlock completed before startup finished — keeping it');
        } else {
            // If encryption is enabled we start locked — unless a previous
            // instance of this worker parked a live session in storage.session.
            resumed = encryptionEnabled ? await restoreSessionState() : false;
            locked = encryptionEnabled && !resumed;
            if (!encryptionEnabled) {
                setVaultUnlocked(null); // passwordless: never locked, device wrapping
            } else if (resumed) {
                // restoreSessionState already handed the vault its session key
                // when one was parked; this covers the older parked shape that
                // carried only the decrypted hex keys.
                if (!sessionCryptoKey) setVaultUnlocked(true);
            } else {
                clearVaultSession();
            }
        }
        log(`[STARTUP] Final state: encryptionEnabled=${encryptionEnabled}, locked=${locked}, resumed=${resumed}, alreadyUnlocked=${alreadyUnlocked}`);
    } finally {
        startupRelease();
    }

    // Initialize platform sync (pull from sync, register listener)
    try {
        await initSync();
        log('[STARTUP] Platform sync initialized');
    } catch (e) {
        log(`[STARTUP] Platform sync init error (non-fatal): ${e.message}`);
    }

    // Check for profiles shared from the iOS app via App Groups (Safari only)
    try {
        if (typeof browser !== 'undefined' && browser.runtime.sendNativeMessage) {
            const response = await browser.runtime.sendNativeMessage(
                'com.nostrkey.Extension',
                { action: 'getSharedProfiles' }
            );
            if (response && response.profiles && response.profiles.length > 0) {
                const local = await storage.get({ profiles: [] });
                const merged = mergeSharedProfiles(local.profiles, response.profiles);
                if (merged.changed) {
                    await storage.set({ profiles: merged.profiles });
                    log(`[STARTUP] Merged ${response.profiles.length} shared profile(s) from iOS app`);
                }
            }
        }
    } catch (e) {
        // Not Safari, or shared storage unavailable — ignore
        log(`[STARTUP] Shared profiles check skipped: ${e.message}`);
    }

    // T0-4: transparently migrate any pre-existing plaintext secrets to
    // encrypted-at-rest form. Runs after the iOS-shared-profile merge so freshly
    // imported plaintext keys are wrapped too. Password-encrypted values are
    // left untouched (one-way upgrade — never downgrades ciphertext).
    try {
        await migrateSecretsAtRest();
    } catch (e) {
        log(`[STARTUP] At-rest migration error (non-fatal): ${e.message}`);
    }

    // Resolve whether any profile key is wrapped under a master password this
    // vault no longer has a verifier for (see refreshStrandedState).
    try {
        await refreshStrandedState();
    } catch (e) {
        log(`[STARTUP] Stranded-key check skipped (non-fatal): ${e.message}`);
    }
})();

/**
 * Re-resolve which profile keys are stranded — wrapped under a master password
 * the vault holds no verifier for. `unlock` takes such a password and moves
 * those keys onto the device key (see recoverStrandedSession).
 */
async function refreshStrandedState() {
    const { stranded, usable } = await findStrandedPasswordKeys();
    strandedProfiles = stranded;
    strandedOnly = stranded.length > 0 && usable === 0;
    if (stranded.length > 0) {
        // T0-6: counts only — never a blob, never a name's key material.
        log(`[RECOVERY] ${stranded.length} profile key(s) are wrapped under a master password that is no longer on file; unlock with that password to move them onto the device key`);
    }
    return stranded;
}

/**
 * One-way at-rest migration: wrap any plaintext private key, API-key secret, or
 * vault note that is not already ciphertext. Private keys / secrets are wrapped
 * under the device key (or, if a password session is active, savePrivateKey has
 * already produced password blobs). Existing encrypted blobs are preserved.
 *
 * It ALSO re-wraps every device blob that only opens under a legacy (pre-1.8.1)
 * IndexedDB key onto the strategy this context actually persists to. That arm
 * covers all four stores — profile private keys, API-key secrets, vault-note
 * bodies, and NIP-46 bunker session secrets / session private keys — because on
 * Safari a legacy IDB-wrapped blob can become unreadable after a reinstall, so
 * every device blob is moved onto the persistent seed while the IDB key is
 * still reachable. Each item is repaired independently (one bad blob must never
 * abort the pass) and each store is written back at most once.
 */
async function migrateSecretsAtRest() {
    const data = await storage.get({
        profiles: [], apiKeyVault: null, vaultDocs: null, bunkerSessions: null,
    });
    const updates = {};
    // T0-6: counts and key/profile NAMES only — never a value, never a blob.
    let rewrapped = 0;
    let rewrapFailed = 0;
    const rewrapNames = [];

    /**
     * Re-wrap one legacy device blob onto the CURRENT device-key strategy.
     * Returns the replacement blob, or null when there is nothing to do (the
     * blob is already current) or it could not be read here — in which case the
     * caller leaves the original untouched. Never destroys a value.
     */
    async function rewrapLegacyDeviceBlob(value, label) {
        try {
            const { rewrapped: fresh } = await decryptDeviceBlobForRewrap(value);
            if (!fresh) return null;
            rewrapped++;
            rewrapNames.push(label);
            return fresh;
        } catch (e) {
            rewrapFailed++;
            log(`[MIGRATION] ${label} could not be re-wrapped: ${e.message}`);
            return null;
        }
    }

    if (Array.isArray(data.profiles)) {
        let changed = false;
        for (let i = 0; i < data.profiles.length; i++) {
            const p = data.profiles[i];
            if (!p || p.type === 'bunker') continue;
            if (p.privKey && !isCiphertext(p.privKey)) {
                // A password-protected vault must never receive a device blob.
                // While locked we have no session key to wrap with, so leave the
                // plaintext alone — healSecretWrapping() picks it up on unlock.
                if (encryptionEnabled && !sessionCryptoKey) continue;
                try { if (!p.pubKey) p.pubKey = getPublicKeySync(p.privKey); } catch { /* ignore */ }
                p.privKey = await wrapSecretForCurrentTier(p.privKey);
                changed = true;
            } else if (isDeviceKeyBlob(p.privKey) && !encryptionEnabled) {
                // Opportunistic upgrade: re-wrap blobs that only decrypt under a
                // legacy (pre-1.8.1) IndexedDB key so they survive on the
                // strategy this context actually persists to.
                const fresh = await rewrapLegacyDeviceBlob(
                    p.privKey, `profile ${i} privKey`,
                );
                if (fresh) { p.privKey = fresh; changed = true; }
            }
        }
        if (changed) updates.profiles = data.profiles;
    }

    if (data.apiKeyVault && data.apiKeyVault.keys) {
        let changed = false;
        for (const [id, key] of Object.entries(data.apiKeyVault.keys)) {
            if (!key || !key.secret) continue;
            if (!isCiphertext(key.secret)) {
                if (encryptionEnabled && !sessionCryptoKey) continue;
                key.secret = await wrapSecretForCurrentTier(key.secret);
                changed = true;
            } else if (isDeviceKeyBlob(key.secret) && !encryptionEnabled) {
                // Same legacy-IDB upgrade the profiles arm gets. Without it an
                // API-key secret stays IDB-wrapped and can become unreadable
                // after a Safari reinstall.
                const fresh = await rewrapLegacyDeviceBlob(
                    key.secret, `apiKey ${key.label || id}`,
                );
                if (fresh) { key.secret = fresh; changed = true; }
            }
        }
        if (changed) updates.apiKeyVault = data.apiKeyVault;
    }

    if (data.vaultDocs && typeof data.vaultDocs === 'object') {
        let changed = false;
        for (const [path, doc] of Object.entries(data.vaultDocs)) {
            if (!doc || !doc.content) continue;
            if (!isCiphertext(doc.content)) {
                if (encryptionEnabled && !sessionCryptoKey) continue;
                doc.content = await wrapSecretForCurrentTier(doc.content);
                changed = true;
            } else if (isDeviceKeyBlob(doc.content) && !encryptionEnabled) {
                const fresh = await rewrapLegacyDeviceBlob(
                    doc.content, `vaultDoc ${path}`,
                );
                if (fresh) { doc.content = fresh; changed = true; }
            }
        }
        if (changed) updates.vaultDocs = data.vaultDocs;
    }

    // BUNK-10 persists the connect secret and the ephemeral session private key
    // device-wrapped (nip46.js getSessionInfo). They were never read by this
    // migration, so on Safari an IDB-wrapped session could stop restoring after
    // a reinstall. They are always device blobs by design — there is no
    // plaintext arm here, only the re-wrap.
    if (data.bunkerSessions && typeof data.bunkerSessions === 'object') {
        let changed = false;
        for (const [profileIndex, s] of Object.entries(data.bunkerSessions)) {
            // NOT gated on `encryptionEnabled`: nip46 device-wraps these whether
            // or not a master password is set (see nip46.js getSessionInfo), and
            // re-wrapping is device→device (decryptDeviceBlobForRewrap always
            // uses encryptWithDeviceKey), so it can never downgrade a password
            // blob. Gating here left password-vault users' bunker sessions on
            // the legacy key — the very exposure this migration exists to close.
            if (!s) continue;
            if (isDeviceKeyBlob(s.secret)) {
                const fresh = await rewrapLegacyDeviceBlob(
                    s.secret, `bunkerSession ${profileIndex} secret`,
                );
                if (fresh) { s.secret = fresh; changed = true; }
            }
            if (isDeviceKeyBlob(s.sessionPrivkey)) {
                const fresh = await rewrapLegacyDeviceBlob(
                    s.sessionPrivkey, `bunkerSession ${profileIndex} sessionPrivkey`,
                );
                if (fresh) { s.sessionPrivkey = fresh; changed = true; }
            }
        }
        if (changed) updates.bunkerSessions = data.bunkerSessions;
    }

    if (Object.keys(updates).length > 0) {
        await storage.set(updates);
        log(`[MIGRATION] Wrapped plaintext secrets at rest: ${Object.keys(updates).join(', ')}`);
    }
    if (rewrapped > 0 || rewrapFailed > 0) {
        log(`[MIGRATION] Re-wrapped ${rewrapped} legacy device blob(s) onto the current strategy; ${rewrapFailed} failed. Repaired: ${rewrapNames.join(', ')}`);
    }
}

/**
 * Merge profiles shared from the iOS app into the local profile list.
 * For each shared profile, if no local profile has the same pubKey, add it.
 * If a local profile has the same pubKey, keep the one with the newer updatedAt.
 * @returns {{ profiles: Array, changed: boolean }}
 */
function mergeSharedProfiles(localProfiles, sharedProfiles) {
    let changed = false;
    const profiles = [...localProfiles];

    for (const shared of sharedProfiles) {
        if (!shared.pubKey) continue;

        const localIndex = profiles.findIndex(p => p.pubKey === shared.pubKey);

        if (localIndex === -1) {
            // New profile from app — add it
            profiles.push({
                name: shared.name || 'Shared Profile',
                privKey: shared.privKey || '',
                pubKey: shared.pubKey,
                hosts: {},
                relays: shared.relays || [],
                type: 'local',
                updatedAt: shared.lastSyncedAt ? new Date(shared.lastSyncedAt).getTime() : Date.now(),
            });
            changed = true;
        } else {
            // Existing profile — update if shared is newer and has a key we don't
            const local = profiles[localIndex];
            const localTime = local.updatedAt || 0;
            const sharedTime = shared.lastSyncedAt ? new Date(shared.lastSyncedAt).getTime() : 0;

            if (sharedTime > localTime && shared.privKey && !local.privKey) {
                profiles[localIndex] = {
                    ...local,
                    privKey: shared.privKey,
                    name: shared.name || local.name,
                    relays: shared.relays || local.relays,
                    updatedAt: sharedTime,
                };
                changed = true;
            }
        }
    }

    return { profiles, changed };
}

/**
 * Reset the auto-lock inactivity timer.
 */
const AUTO_LOCK_ALARM = 'nostrkey-auto-lock';

function resetAutoLock() {
    // Clear any existing timer (setTimeout fallback)
    if (autoLockTimer) { clearTimeout(autoLockTimer); autoLockTimer = null; }

    if (locked || autoLockTimeout <= 0) {
        // No timer needed — also clear any pending alarm
        api.alarms?.clear(AUTO_LOCK_ALARM).catch(() => {});
        // Still mirror the session so a worker restart resumes an unlocked
        // vault that the user configured to never auto-lock.
        persistSessionState(0);
        return;
    }

    // Prefer chrome.alarms (survives MV3 service-worker eviction)
    if (api.alarms) {
        api.alarms.create(AUTO_LOCK_ALARM, { delayInMinutes: autoLockTimeout / 60000 });
    } else {
        // Fallback for environments without alarms API (Safari background page)
        autoLockTimer = setTimeout(() => { lockSession(); }, autoLockTimeout);
    }
    // The alarms API is still the single locking authority; storage.session only
    // carries the deadline forward so a restart cannot silently extend it.
    persistSessionState(Date.now() + autoLockTimeout);
}

// Listen for the alarm to fire
if (api.alarms?.onAlarm) {
    api.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === AUTO_LOCK_ALARM) {
            lockSession();
        }
    });
}

/**
 * Lock the session — clear all decrypted keys from memory.
 * (`sessionMutex` is declared with the startup state above.)
 */
async function lockSession() {
    const release = await sessionMutex.acquire();
    try {
        if (!nostrAccessWhileLocked) {
            sessionKeys.clear();
        }
        sessionCryptoKey = null;
        sessionKeyRaw = null;
        sessionKeySalt = null;
        locked = true;
        // Secret-vault must stop preferring the (now gone) password key and
        // refuse secret reads.
        clearVaultSession();
        clearPersistedSessionState();
        if (autoLockTimer) {
            clearTimeout(autoLockTimer);
            autoLockTimer = null;
        }
        log(`Session locked. Keys retained: ${nostrAccessWhileLocked && sessionKeys.size > 0}`);
    } finally {
        release();
    }
}

/**
 * F3 self-heal: with a password session active, no profile key may remain a
 * device blob (or plaintext). 1.8.0 wrapped keys created AFTER password setup
 * under the device key, leaving a password-protected vault holding blobs that
 * the master password cannot open — and that die outright on iOS. Re-wrap them
 * under the session key. Per-profile try/catch: one bad blob must not abort the
 * pass. Caller persists `profiles` once.
 *
 * @returns {{ repaired: number, failed: number }}
 */
async function healSecretWrapping(profiles) {
    if (!sessionCryptoKey) return { repaired: 0, failed: 0 };
    let repaired = 0;
    let failed = 0;
    for (let i = 0; i < profiles.length; i++) {
        const p = profiles[i];
        if (!p || p.type === 'bunker' || !p.privKey) continue;
        if (isEncryptedBlob(p.privKey)) continue; // already a password blob
        try {
            const hex = isDeviceKeyBlob(p.privKey)
                ? await decryptWithDeviceKey(p.privKey)
                : p.privKey; // legacy plaintext
            if (!hex) continue;
            p.privKey = await encryptWithKey(hex, sessionCryptoKey, sessionKeySalt);
            sessionKeys.set(i, hex);
            repaired++;
        } catch (e) {
            failed++;
            // T0-6: name the profile, never the blob or the key.
            log(`[SELF-HEAL] profile ${i} could not be re-wrapped: ${e.message}`);
        }
    }
    return { repaired, failed };
}

/**
 * Restore a passwordless vault whose profile keys are still wrapped under a
 * master password it holds no verifier for: re-wrap them onto the device key
 * with the password the user supplies at the unlock surface.
 *
 * Returns null when nothing is stranded, or when the password opened none of it
 * — the caller then treats the attempt as an ordinary failed unlock, cooldown
 * included. Called with `sessionMutex` held.
 */
async function recoverStrandedSession(password) {
    if (strandedProfiles === null) await refreshStrandedState();
    if (!strandedProfiles.length) return null;

    const result = await recoverStrandedKeys(password);
    if (result.recovered === 0) return null;

    await refreshStrandedState();
    encryptionEnabled = false;
    locked = false;
    setVaultUnlocked(null); // passwordless tier: never locked, device wrapping
    unlockAttempts = 0;
    unlockCooldownUntil = 0;
    log(`[RECOVERY] Moved ${result.recovered} profile key(s) onto the device key; ${result.failed.length} did not open`);
    return { success: true, recovered: result.recovered, warnings: result.failed };
}

/**
 * Unlock the session — verify password and decrypt all keys into memory.
 */
async function unlockSession(password) {
    const release = await sessionMutex.acquire();
    try {
        // Brute-force protection: cooldown after 3 failed attempts
        const now = Date.now();
        if (now < unlockCooldownUntil) {
            const waitSec = Math.ceil((unlockCooldownUntil - now) / 1000);
            return { success: false, error: `Too many attempts. Try again in ${waitSec} seconds.` };
        }

        const valid = await checkPassword(password);
        if (!valid) {
            // There may be no verifier to check against while profile keys are
            // still password blobs. Those blobs verify the password themselves,
            // so this is a recovery attempt rather than a failed unlock.
            const recovered = await recoverStrandedSession(password);
            if (recovered) return recovered;
            unlockAttempts++;
            if (unlockAttempts >= 3) {
                // Cooldown: 30s after 3, 60s after 6, 120s after 9, etc.
                const cooldownMs = 30000 * Math.pow(2, Math.floor((unlockAttempts - 3) / 3));
                unlockCooldownUntil = Date.now() + cooldownMs;
                log(`[SECURITY] ${unlockAttempts} failed attempts. Cooldown: ${cooldownMs / 1000}s`);
            }
            return { success: false, error: 'Invalid password' };
        }

        // Reset on successful unlock
        unlockAttempts = 0;
        unlockCooldownUntil = 0;

        const profiles = await getProfiles();
        let needsSave = false;
        // A single damaged blob must not lock the user out of every profile —
        // decrypt each one independently and report the casualties.
        const warnings = [];
        for (let i = 0; i < profiles.length; i++) {
            if (profiles[i].type === 'bunker') continue;
            let hex;
            try {
                hex = await getDecryptedPrivKey(profiles[i], password);
            } catch (e) {
                warnings.push({ index: i, name: profiles[i].name || `Profile ${i + 1}` });
                // T0-6: the profile name is safe to log; the blob is not.
                log(`[UNLOCK] profile ${i} could not be decrypted: ${e.message}`);
                continue;
            }
            sessionKeys.set(i, hex);
            // Cache pubKey if not already cached (for profiles encrypted before this fix)
            if (!profiles[i].pubKey && hex) {
                try {
                    profiles[i].pubKey = getPublicKeySync(hex);
                    needsSave = true;
                } catch (e) {
                    console.error(`Failed to cache pubKey for profile ${i}:`, e);
                }
            }
        }
        // Derive a session CryptoKey so we never hold the raw password in memory.
        // The salt is random per session; decrypt() still uses the password at
        // next unlock to re-derive from whatever salt was stored in each blob.
        // Derived ONCE as extractable so the raw bytes can be parked in
        // storage.session (see persistSessionState), then re-imported
        // non-extractable: the key we actually keep cannot be exported again,
        // and the 600k-iteration PBKDF2 still runs only once per unlock.
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const exportableKey = await deriveKey(password, salt, { extractable: true });
        sessionKeyRaw = await exportKeyBase64(exportableKey);
        sessionCryptoKey = await importKeyBase64(sessionKeyRaw);
        sessionKeySalt = salt;
        // password is now only on the call stack and will be GC'd
        locked = false;
        // Hand the session key to the secret vault so its tier-agnostic writes
        // (notes, API-key secrets) produce password blobs, never device blobs,
        // for as long as we are unlocked (F1). Private keys do not rely on this:
        // every site that persists one names its tier outright.
        setVaultSessionKey(sessionCryptoKey, sessionKeySalt);

        // F3: repair any device-wrapped / plaintext key sitting in a
        // password-protected vault (the 1.8.0 mixed state).
        const healed = await healSecretWrapping(profiles);
        if (healed.repaired > 0 || healed.failed > 0) {
            log(`[SELF-HEAL] re-wrapped ${healed.repaired} profile key(s) under the master password; ${healed.failed} failed`);
        }
        if (needsSave || healed.repaired > 0) {
            await storage.set({ profiles });
        }
        resetAutoLock();
        log(`Session unlocked.${warnings.length ? ` ${warnings.length} profile(s) undecryptable.` : ''}`);
        return { success: true, warnings };
    } finally {
        release();
    }
}

/**
 * Check whether the extension is currently in a locked state.
 * If no password is set, we are never locked.
 */
async function checkLockState() {
    const encrypted = await isEncrypted();
    log(`[checkLockState] isEncrypted()=${encrypted}, locked=${locked}`);
    if (!encrypted) {
        // Passwordless tier: never locked, and the vault should device-wrap.
        setVaultUnlocked(null);
        if (strandedOnly) {
            // No verifier, but every profile key is still a password blob —
            // nothing here can be read. Report locked so the unlock surface is
            // reachable; `unlock` recovers those keys (recoverStrandedSession).
            locked = true;
            return true;
        }
        locked = false;
        return false;
    }
    return locked;
}

// --- Sender validation -------------------------------------------------------

const SENSITIVE_KINDS = new Set([
    'setPassword', 'changePassword', 'removePassword', 'resetAllData',
    'setAutoLockTimeout', 'setNostrAccessWhileLocked', 'setBlockCrossOriginFrames',
    'backup.export', 'backup.import', 'unlock',
    // A raw private key crosses this boundary — extension UI only.
    // `savePrivateKey` WRITES that key into a profile, so it belongs here just
    // as much as wrapPrivKey does (pre-existing gap, closed in 1.8.1).
    'wrapPrivKey', 'savePrivateKey',
    // T0-2: NIP-46 bunker controls must come from the extension UI only.
    'bunkerServer.start', 'bunkerServer.stop', 'bunkerServer.status',
    'bunkerServer.connections', 'bunkerServer.revoke',
    // T0-3: private-key export must come from the extension UI only.
    'exportProfile',
    // These four RETURN or ACCEPT raw key material (nsec/hex/seed words) —
    // extension UI only. Content scripts never call them legitimately.
    'ncryptsec.encrypt', 'ncryptsec.decrypt',
    'seedPhrase.fromKey', 'seedPhrase.toKey',
    // NK-04: consent control messages must come from the extension-owned
    // permission surface, not from a content script / web page.
    'allowed', 'denied', 'closePrompt',
]);

function isExtensionSender(sender) {
    // Messages from extension pages (popup, sidepanel, options, vault) have our ID.
    // Content scripts inject into web pages — they have sender.tab but their URL
    // is the web page URL, not our extension URL. Extension pages opened in tabs
    // (like vault.html) also have sender.tab but their URL starts with our origin.
    if (sender.id !== api.runtime.id) return false;
    // If it came from a framed/tabbed context, the SENDING FRAME's own URL must be
    // our extension origin. We check sender.url (the frame that actually sent the
    // message), NOT sender.tab.url (the top-level tab): our consent sheet is an
    // extension iframe embedded in an arbitrary web page, so its sender.tab.url is
    // the host page while sender.url is chrome-extension://<id>/permission.html.
    // A web-page content script's sender.url is the page URL, so it still fails —
    // this widens the gate to our own embedded iframe, not to any page.
    if (sender.tab) {
        // Derive our origin from the runtime instead of hardcoding schemes:
        // chrome-extension://<id>/ on Chrome, moz-extension://<uuid>/ on Firefox,
        // safari-web-extension://<uuid>/ on Safari (iOS + macOS). The old
        // hardcoded pair silently rejected every extension page opened in a tab
        // on Safari ("Unauthorized sender" on Key Protection / Full Settings),
        // and its bare moz-extension:// prefix was broader than needed. This is
        // both correct on all three engines and strictly tighter.
        const extOrigin = api.runtime.getURL('');
        const url = sender.url || '';
        return url.startsWith(extOrigin);
    }
    return true;
}

// --- Message handler --------------------------------------------------------

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    logMessage(message);

    // Block sensitive operations from non-extension contexts
    if (SENSITIVE_KINDS.has(message.kind) && !isExtensionSender(_sender)) {
        log(`[SECURITY] Blocked ${message.kind} from non-extension sender`);
        sendResponse({ success: false, error: 'Unauthorized sender' });
        return true;
    }

    let uuid = crypto.randomUUID();
    let sr;

    switch (message.kind) {
        // General
        case 'closePrompt':
            prompt.release?.();
            sendResponse(true);
            return true;
        case 'permissionSheetCompromised':
            // The in-page consent sheet detected redress tampering and tore itself
            // down. Reopen the SAME pending prompt as a dedicated, redress-immune
            // tab. Gated to the tab that currently hosts the sheet so a page cannot
            // use this to spawn tabs or interfere with another tab's prompt.
            if (prompt.baseUrl && prompt.pending && _sender.tab && _sender.tab.id === prompt.sheetTabId) {
                prompt.sheetTabId = null; // sheet is already gone in the page
                prompt.sheetUrl = null;
                // Give the user a fresh full window to decide in the tab, and stamp
                // the matching deadline into the reopened URL's countdown.
                armPromptTimeout(prompt.pending.uuid, prompt.pending.kind, prompt.pending.host);
                const url = `${prompt.baseUrl}&deadline=${prompt.deadline}`;
                api.tabs.create({ url }).then(t => { prompt.tabId = t.id; }).catch(() => {});
            }
            sendResponse(true);
            return true;
        case 'allowed':
            resetAutoLock();
            if (resolveBunkerApproval(message.payload, { approved: true, remember: !!message.remember })) {
                sendResponse(true);
                return true;
            }
            complete(message);
            prompt.release?.(); // close the sheet/tab + release now, don't wait for timeout
            sendResponse(true);
            return true;
        case 'denied':
            if (resolveBunkerApproval(message.payload, { approved: false, remember: false })) {
                sendResponse(true);
                return true;
            }
            deny(message);
            prompt.release?.();
            sendResponse(true);
            return true;
        case 'generatePrivateKey':
            (async () => {
                try {
                    const result = await generatePrivateKey_();
                    sendResponse(result);
                } catch (e) {
                    console.error('generatePrivateKey error:', e);
                    sendResponse(null);
                }
            })();
            return true; // Keep message channel open for async sendResponse
        case 'wrapPrivKey':
            // The UI contexts (side panel / options / popup) cannot know whether
            // a master-password session is unlocked, so the wrapping decision
            // lives here. Invariant: while isEncrypted is true this NEVER hands
            // back a device blob — it refuses instead (F1).
            reply(sendResponse, async () => {
                const hex = message.payload;
                if (typeof hex !== 'string' || !/^[0-9a-f]{64}$/i.test(hex)) {
                    return { success: false, error: 'Invalid private key' };
                }
                const encrypted = await isEncrypted();
                if (encrypted && !sessionCryptoKey) {
                    return {
                        success: false,
                        error: 'NostrKey is locked — unlock with your master password before creating or importing a key.',
                    };
                }
                resetAutoLock();
                const blob = encrypted
                    ? await encryptWithKey(hex, sessionCryptoKey, sessionKeySalt)
                    : await encryptWithDeviceKey(hex);
                return { success: true, blob };
            });
            return true;
        case 'savePrivateKey':
            resetAutoLock();
            // Was a bare promise return, which Chrome MV3 drops — a refusal
            // (locked vault, bad key) reached the caller as `undefined` and read
            // as success. Go through reply() so the error is delivered.
            reply(sendResponse, async () => {
                await savePrivateKey(message.payload);
                return { success: true };
            });
            return true;
        case 'getNpub':
            (async () => {
                try {
                    const result = await getNpub(message.payload);
                    sendResponse(result);
                } catch (e) {
                    console.error('getNpub error:', e);
                    sendResponse(null);
                }
            })();
            return true;
        case 'getNsec':
            resetAutoLock();
            (async () => {
                try {
                    const result = await getNsec(message.payload);
                    sendResponse(result);
                } catch (e) {
                    console.error('getNsec error:', e);
                    sendResponse(null);
                }
            })();
            return true;
        case 'calcPubKey':
            sendResponse(getPublicKeySync(message.payload));
            return true;
        case 'npubEncode':
            sendResponse(nip19.npubEncode(message.payload));
            return true;
        case 'copy':
            // navigator.clipboard is unavailable in Chrome service workers.
            // The caller (popup/options) should handle clipboard directly when
            // possible; this path is kept for Safari background-page compat.
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(message.payload).then(() => sendResponse(true)).catch(() => sendResponse(false));
            } else {
                sendResponse(false);
            }
            return true;

        // --- Master password / lock handlers ---
        // NOTE: These use sendResponse + return true (callback pattern) because
        // Chrome MV3 does not reliably deliver Promise-return values from
        // onMessage listeners to sendMessage callers.
        case 'isLocked':
            (async () => {
                try {
                    const result = await checkLockState();
                    log(`[isLocked] Sending response: ${result}`);
                    sendResponse(result);
                } catch (e) {
                    log(`[isLocked] Error: ${e.message}`);
                    sendResponse(false);
                }
            })();
            return true;
        case 'isEncrypted':
            (async () => {
                try {
                    const data = await storage.get({ isEncrypted: false, passwordHash: null });
                    log(`[isEncrypted] storage: isEncrypted=${data.isEncrypted}, passwordHash=${data.passwordHash ? 'EXISTS' : 'null'}`);
                    if (!data.isEncrypted && data.passwordHash) {
                        log('[isEncrypted] Self-healing: passwordHash exists but flag=false');
                        await storage.set({ isEncrypted: true });
                        data.isEncrypted = true;
                    }
                    encryptionEnabled = data.isEncrypted;
                    log(`[isEncrypted] Sending response: ${encryptionEnabled}`);
                    sendResponse(encryptionEnabled);
                } catch (e) {
                    log(`[isEncrypted] Error: ${e.message}`);
                    sendResponse(false);
                }
            })();
            return true;
        case 'hasEncryptedData':
            (async () => {
                try {
                    const data = await storage.get({ passwordHash: null, profiles: [] });
                    const hasPasswordHash = !!data.passwordHash;
                    let encryptedProfiles = 0;
                    log(`[hasEncryptedData] passwordHash=${hasPasswordHash}, profiles=${Array.isArray(data.profiles) ? data.profiles.length : 'not-array'}`);
                    if (Array.isArray(data.profiles)) {
                        for (let i = 0; i < data.profiles.length; i++) {
                            const p = data.profiles[i];
                            const isEnc = p.privKey ? isEncryptedBlob(p.privKey) : false;
                            log(`[hasEncryptedData] profile[${i}] name="${p.name}" privKey=${p.privKey ? (isEnc ? 'ENCRYPTED' : 'PLAINTEXT') : 'EMPTY'}`);
                            if (isEnc) encryptedProfiles++;
                        }
                    }
                    // Two vaults answer to a master password at the unlock
                    // surface: one with a passwordHash (that is what `unlock`
                    // verifies against), and one with no verifier whose profile
                    // keys are still password blobs — those blobs verify the
                    // password themselves and `unlock` recovers them onto the
                    // device key. A key that is merely ciphertext at rest (the
                    // default device-key vault) is neither, and must never latch
                    // the user to an unlock screen no password can open.
                    const stranded = (strandedProfiles ?? await refreshStrandedState()).length;
                    const found = hasPasswordHash || stranded > 0;
                    log(`[hasEncryptedData] Result: found=${found}, hasPasswordHash=${hasPasswordHash}, encryptedProfiles=${encryptedProfiles}, stranded=${stranded}`);
                    if (hasPasswordHash && !encryptionEnabled) {
                        log('[hasEncryptedData] Self-healing: passwordHash present, setting isEncrypted=true, locked=true');
                        await storage.set({ isEncrypted: true });
                        encryptionEnabled = true;
                        locked = true;
                    }
                    sendResponse({ found, hasPasswordHash, encryptedProfiles, strandedKeys: stranded });
                } catch (e) {
                    console.error('hasEncryptedData error:', e);
                    sendResponse({ found: false, hasPasswordHash: false, encryptedProfiles: 0, strandedKeys: 0 });
                }
            })();
            return true;
        case 'unlock':
            reply(sendResponse, () => unlockSession(message.payload));
            return true;
        case 'lock':
            lockSession().then(() => sendResponse(true));
            return true;
        case 'setPassword':
            (async () => {
                try {
                    // Cache pubKeys before encryption (need plaintext keys)
                    await cachePubKeysForAllProfiles();
                    await encryptAllKeys(message.payload);
                    encryptionEnabled = true;
                    // A vault with a verifier has no stranded keys by
                    // definition — the ordinary unlock path owns its blobs now.
                    await refreshStrandedState();
                    const result = await unlockSession(message.payload);
                    // Broadcast password state change to all views
                    api.runtime.sendMessage({ kind: 'passwordStateChanged', hasPassword: true }).catch(() => {});
                    api.runtime.sendMessage({ kind: 'backupNeeded' }).catch(() => {});
                    sendResponse(result);
                } catch (e) {
                    sendResponse({ success: false, error: e.message });
                }
            })();
            return true;
        case 'changePassword':
            (async () => {
                try {
                    const { oldPassword, newPassword } = message.payload;
                    const valid = await checkPassword(oldPassword);
                    if (!valid) {
                        sendResponse({ success: false, error: 'Invalid current password' });
                        return;
                    }
                    const { skipped } = await changePasswordForKeys(oldPassword, newPassword);
                    const result = await unlockSession(newPassword);
                    // The vault has a verifier now, so this is a benign no-op that
                    // keeps module state honest (findStrandedPasswordKeys returns []
                    // while a verifier is present). The skip WARNING is driven by
                    // the returned skipped[], NOT by stranded state.
                    await refreshStrandedState();
                    // Broadcast password state change to all views
                    api.runtime.sendMessage({ kind: 'passwordStateChanged', hasPassword: true }).catch(() => {});
                    api.runtime.sendMessage({ kind: 'backupNeeded' }).catch(() => {});
                    sendResponse({ ...result, skipped });
                } catch (e) {
                    sendResponse({ success: false, error: e.message });
                }
            })();
            return true;
        case 'removePassword':
            (async () => {
                try {
                    // Verify FIRST, so a wrong password never touches the live
                    // session (removePasswordProtection verifies again).
                    if (!(await checkPassword(message.payload))) {
                        sendResponse({ success: false, error: 'Invalid password' });
                        return;
                    }
                    // Drop to the passwordless tier BEFORE the keys are re-wrapped:
                    // every subsequent write must land on the device key, not on
                    // the password that is being removed.
                    sessionKeys.clear();
                    sessionCryptoKey = null;
                    sessionKeyRaw = null;
                    sessionKeySalt = null;
                    locked = false;
                    encryptionEnabled = false;
                    clearVaultSession();     // drop the password-derived key...
                    setVaultUnlocked(null);  // ...and go back to "never locked"
                    clearPersistedSessionState();
                    const { skipped } = await removePasswordProtection(message.payload);
                    // Recompute stranded state from what is actually on disk: a key
                    // that could not be converted is now a stranded password blob,
                    // so trust refreshStrandedState rather than hard-clearing to [].
                    await refreshStrandedState();
                    // Broadcast password state change to all views
                    api.runtime.sendMessage({ kind: 'passwordStateChanged', hasPassword: false }).catch(() => {});
                    sendResponse({ success: true, skipped });
                } catch (e) {
                    // Nothing was written if we got here, so re-align the
                    // in-memory flags with what is actually on disk rather than
                    // reporting "passwordless" for a still-encrypted vault.
                    try {
                        encryptionEnabled = await isEncrypted();
                        locked = encryptionEnabled;
                        if (encryptionEnabled) clearVaultSession();
                        else setVaultUnlocked(null);
                    } catch (_) { /* report the original failure */ }
                    sendResponse({ success: false, error: e.message });
                }
            })();
            return true;
        case 'resetAllData':
            (async () => {
                try {
                    // Clear all extension data and reset to fresh state
                    await storage.clear();
                    // The device-key seed + sticky strategy went with it — drop
                    // secret-vault's memoised handles so the next wrap mints a
                    // fresh, actually-persisted device key.
                    resetDeviceKey();
                    sessionKeys.clear();
                    sessionCryptoKey = null;
                    sessionKeyRaw = null;
                    sessionKeySalt = null;
                    locked = false;
                    encryptionEnabled = false;
                    nostrAccessWhileLocked = false;
                    blockCrossOriginFrames = true;
                    strandedProfiles = [];   // the blobs went with the data
                    strandedOnly = false;
                    setVaultUnlocked(null);
                    clearPersistedSessionState();
                    // Re-initialize with default profile
                    await storage.set({
                        profiles: [{ name: 'Default Nostr Profile', privKey: '', pubKey: '' }],
                        profileIndex: 0,
                        isEncrypted: false,
                        passwordHash: null,
                        passwordSalt: null,
                    });
                    api.runtime.sendMessage({ kind: 'dataReset' }).catch(() => {});
                    sendResponse({ success: true });
                } catch (e) {
                    sendResponse({ success: false, error: e.message });
                }
            })();
            return true;
        case 'setAutoLockTimeout': {
            const ALLOWED_LOCK_MINUTES = [0, 5, 15, 30, 60, 90, 180];
            const mins = Number(message.payload);
            if (!ALLOWED_LOCK_MINUTES.includes(mins)) {
                sendResponse(false);
                return true;
            }
            autoLockTimeout = mins * 60 * 1000;
            storage.set({ autoLockMinutes: mins });
            resetAutoLock();
            sendResponse(true);
            return true;
        }
        case 'getAutoLockTimeout':
            reply(sendResponse, async () => {
                const { autoLockMinutes } = await storage.get({ autoLockMinutes: 15 });
                return autoLockMinutes;
            });
            return true;
        case 'resetAutoLock':
            resetAutoLock();
            sendResponse(true);
            return true;

        // --- Nostr access while locked ---
        case 'getNostrAccessWhileLocked':
            sendResponse(nostrAccessWhileLocked);
            return true;
        case 'setNostrAccessWhileLocked':
            nostrAccessWhileLocked = !!message.payload;
            storage.set({ nostrAccessWhileLocked: !!message.payload });
            if (!message.payload && locked) {
                sessionKeys.clear();  // Turning OFF while locked = clear keys immediately
                clearPersistedSessionState();
            }
            sendResponse(true);
            return true;
        case 'getBlockCrossOriginFrames':
            sendResponse(blockCrossOriginFrames);
            return true;
        case 'setBlockCrossOriginFrames':
            blockCrossOriginFrames = !!message.payload;
            storage.set({ blockCrossOriginFrames: !!message.payload });
            sendResponse(true);
            return true;
        case 'getActiveProfileInfo':
            (async () => {
                try {
                    const pi = await getProfileIndex();
                    const profiles = await getProfiles();
                    const profile = profiles[pi];
                    if (!profile) {
                        log('[getActiveProfileInfo] No profile found at index ' + pi);
                        sendResponse({ name: 'Unknown', npub: '', hasKeys: false });
                        return;
                    }
                    let npub = '';
                    if (profile.type === 'bunker' && profile.remotePubkey) {
                        npub = nip19.npubEncode(profile.remotePubkey);
                    } else if (profile.pubKey) {
                        npub = nip19.npubEncode(profile.pubKey);
                    }
                    const result = {
                        name: profile.name || 'Unnamed Profile',
                        npub,
                        hasKeys: sessionKeys.has(pi),
                        isBunker: profile.type === 'bunker',
                    };
                    log('[getActiveProfileInfo] Sending: ' + JSON.stringify(result));
                    sendResponse(result);
                } catch (e) {
                    log('[getActiveProfileInfo] Error: ' + e.message);
                    sendResponse({ name: 'Error', npub: '', hasKeys: false });
                }
            })();
            return true;

        // --- NIP-49 ncryptsec handlers ---
        case 'ncryptsec.decrypt':
            reply(sendResponse, async () => {
                try {
                    const { ncryptsec, password } = message.payload;
                    const hexKey = bytesToHex(nip49Decrypt(ncryptsec, password));
                    return { success: true, hexKey };
                } catch (e) {
                    return { success: false, error: e.message || 'Decryption failed' };
                }
            });
            return true;
        case 'ncryptsec.encrypt':
            reply(sendResponse, async () => {
                try {
                    const { profileIndex: ei, password } = message.payload;
                    const profile = await getProfile(ei);
                    if (profile?.type === 'bunker') {
                        return { success: false, error: 'Cannot export bunker profile as ncryptsec' };
                    }
                    const hexKey = await getPlaintextPrivKey(ei, profile);
                    const ncryptsec = nip49Encrypt(hexToBytes(hexKey), password);
                    return { success: true, ncryptsec };
                } catch (e) {
                    return { success: false, error: e.message || 'Encryption failed' };
                }
            });
            return true;

        // --- BIP39 Seed Phrase handlers ---
        case 'seedPhrase.fromKey':
            reply(sendResponse, async () => {
                try {
                    const ei = message.payload;
                    const profile = await getProfile(ei);
                    if (profile?.type === 'bunker') {
                        return { success: false, error: 'Cannot export bunker profile as seed phrase' };
                    }
                    const hexKey = await getPlaintextPrivKey(ei, profile);
                    const seedPhrase = keyToSeedPhrase(hexKey);
                    return { success: true, seedPhrase };
                } catch (e) {
                    return { success: false, error: e.message || 'Failed to generate seed phrase' };
                }
            });
            return true;
        case 'seedPhrase.toKey':
            reply(sendResponse, async () => {
                try {
                    // payload may be a phrase string (default: standard NIP-06)
                    // or { phrase, mode } where mode 'legacy' recovers a pre-fix
                    // NostrKey entropy-as-key backup.
                    const phrase = typeof message.payload === 'string'
                        ? message.payload
                        : message.payload?.phrase;
                    const mode = typeof message.payload === 'object'
                        ? message.payload?.mode
                        : undefined;
                    if (mode === 'legacy') {
                        const { hexKey, pubKey } = seedPhraseToKeyLegacy(phrase);
                        return { success: true, hexKey, pubKey, derivation: 'legacy' };
                    }
                    const { hexKey, pubKey, legacy } = seedPhraseToKey(phrase);
                    // `legacy` lets the UI offer recovery of an old NostrKey backup.
                    return { success: true, hexKey, pubKey, derivation: 'nip06', legacy };
                } catch (e) {
                    return { success: false, error: e.message || 'Invalid seed phrase' };
                }
            });
            return true;
        case 'seedPhrase.validate':
            sendResponse(isValidSeedPhrase(message.payload));
            return true;

        // --- NIP-46 Bunker handlers ---
        case 'getProfileType':
            reply(sendResponse, async () => {
                const pi = message.payload ?? await getProfileIndex();
                const profile = await getProfile(pi);
                return profile?.type || 'local';
            });
            return true;
        case 'bunker.connect':
            reply(sendResponse, async () => {
                try {
                    const { profileIndex: bi, bunkerUrl } = message.payload;
                    const session = await createSession(bi, bunkerUrl);
                    const remotePubkey = await session.getPublicKey();
                    const profiles = await getProfiles();
                    profiles[bi].remotePubkey = remotePubkey;
                    profiles[bi].bunkerUrl = bunkerUrl;
                    await storage.set({ profiles });
                    return { success: true, remotePubkey };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'bunker.disconnect':
            reply(sendResponse, async () => {
                try {
                    const bi = message.payload;
                    await disconnectSession(bi);
                    return { success: true };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'bunker.status':
            reply(sendResponse, async () => {
                const bi = message.payload ?? await getProfileIndex();
                return { connected: isSessionActive(bi) };
            });
            return true;
        case 'bunker.ping':
            reply(sendResponse, async () => {
                try {
                    const bi = message.payload ?? await getProfileIndex();
                    const session = await getOrCreateSession(bi);
                    const result = await session.ping();
                    return { success: true, result };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'bunker.validateUrl':
            sendResponse(validateBunkerUrl(message.payload));
            return true;

        // --- Bunker Server handlers (extension acts as NIP-46 signer) ---
        case 'bunkerServer.start':
            reply(sendResponse, async () => {
                try {
                    if (activeBunkerServer) {
                        activeBunkerServer.stop();
                        activeBunkerServer = null;
                    }
                    const pubkey = await getPubKey();
                    // T0-2: restrict bunker relays to a user-derived allowlist
                    // (the NostrKey defaults + the active profile's own relays),
                    // never arbitrary caller-supplied relay URLs.
                    const relayUrls = await resolveBunkerRelays(message.payload?.relayUrls);
                    // BUNK-07: ≥128-bit CSPRNG connect secret (was ~60-bit UUID slice).
                    const secret = generateSecret();
                    const server = new BunkerServer({ relayUrls, userPubkey: pubkey, secret });
                    // BUNK-01/T0-7: route ungranted/Tier-B bunker requests through
                    // the extension-owned approval surface.
                    await server.start({ getPrivKey, requestApproval: requestBunkerApproval });
                    activeBunkerServer = server;
                    return { success: true, uri: server.getConnectionString() };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'bunkerServer.stop':
            reply(sendResponse, async () => {
                if (activeBunkerServer) {
                    activeBunkerServer.stop();
                    activeBunkerServer = null;
                }
                return { success: true };
            });
            return true;
        case 'bunkerServer.status':
            sendResponse({
                active: !!activeBunkerServer?.active,
                uri: activeBunkerServer?.getConnectionString() || null,
                clientCount: activeBunkerServer?.clientCount || 0,
            });
            return true;
        case 'bunkerServer.connections':
            // BUNK-08: enumerate live per-connection records for a revoke UI.
            sendResponse({ connections: activeBunkerServer?.listConnections() || [] });
            return true;
        case 'bunkerServer.revoke':
            // BUNK-08: revoke a single connection (others unaffected).
            reply(sendResponse, async () => {
                if (!activeBunkerServer) return { success: false, error: 'No active bunker' };
                const revoked = activeBunkerServer.revokeConnection(message.payload?.clientPubkey);
                return { success: revoked };
            });
            return true;

        // --- Vault handlers ---
        case 'vault.publish':
            reply(sendResponse, async () => {
                try {
                    const { path, content } = message.payload;
                    const pubkey = await getPubKey();
                    const encrypted = await nip44Encrypt({ pubKey: pubkey, plainText: content });
                    const unsigned = buildVaultEvent(path, encrypted);

                    const pi = await getProfileIndex();
                    const profile = await getProfile(pi);
                    let signed;
                    if (profile.type === 'bunker') {
                        const session = await getOrCreateSession(pi);
                        signed = await session.signEvent(unsigned);
                    } else {
                        const sk = await getPrivKey();
                        signed = await finalizeEvent(unsigned, sk);
                    }

                    await withRelays('write', async (relays) => {
                        for (const relay of relays) {
                            try { relay.publish(signed); } catch (_) {}
                        }
                    });
                    return { success: true, eventId: signed.id, createdAt: signed.created_at };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'vault.fetch':
            reply(sendResponse, async () => {
                try {
                    const pubkey = await getPubKey();
                    const filter = buildVaultFilter(pubkey);
                    const allEvents = [];

                    await withRelays('read', async (relays) => {
                        const perRelay = relays.map(relay => new Promise((resolve) => {
                            const subId = `vault-${crypto.randomUUID().slice(0, 8)}`;
                            const timeout = setTimeout(() => {
                                try { relay.unsubscribe(subId); } catch (_) {}
                                resolve();
                            }, 15000);

                            relay.subscribe(
                                subId,
                                [filter],
                                (event) => { allEvents.push(event); },
                                () => {
                                    clearTimeout(timeout);
                                    try { relay.unsubscribe(subId); } catch (_) {}
                                    resolve();
                                }
                            );
                        }));
                        await Promise.all(perRelay);
                    });

                    // T1-3: verify every event (author + kind + id + sig) and
                    // dedupe by event id before trusting any ciphertext. A relay
                    // can inject or tamper events; unverifiable ones are dropped.
                    const seenIds = new Set();
                    const byDtag = new Map();
                    for (const event of allEvents) {
                        if (seenIds.has(event.id)) continue;
                        seenIds.add(event.id);
                        if (!(await verifyStoredEvent(event, { pubkey, kind: 30078 }))) continue;
                        const parsed = parseVaultEvent(event);
                        if (!parsed) continue;
                        const existing = byDtag.get(parsed.path);
                        if (!existing || parsed.createdAt > existing.createdAt) {
                            byDtag.set(parsed.path, { event, parsed });
                        }
                    }

                    // Decrypt each document
                    const documents = [];
                    const pubkey_ = await getPubKey();
                    for (const { event, parsed } of byDtag.values()) {
                        try {
                            const decrypted = await nip44Decrypt({ pubKey: pubkey_, cipherText: event.content });
                            documents.push({
                                path: parsed.path,
                                content: decrypted,
                                createdAt: parsed.createdAt,
                                eventId: parsed.eventId,
                            });
                        } catch (_) {
                            // Skip documents we can't decrypt
                        }
                    }
                    return { success: true, documents };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'vault.delete':
            reply(sendResponse, async () => {
                try {
                    const { path, eventId } = message.payload;
                    const unsigned = buildVaultDeletion(eventId, path);

                    const pi = await getProfileIndex();
                    const profile = await getProfile(pi);
                    let signed;
                    if (profile.type === 'bunker') {
                        const session = await getOrCreateSession(pi);
                        signed = await session.signEvent(unsigned);
                    } else {
                        const sk = await getPrivKey();
                        signed = await finalizeEvent(unsigned, sk);
                    }

                    await withRelays('write', async (relays) => {
                        for (const relay of relays) {
                            try { relay.publish(signed); } catch (_) {}
                        }
                    });
                    return { success: true };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'vault.getRelays':
            reply(sendResponse, async () => {
                try {
                    const profile = await currentProfile();
                    const relays = profile.relays || [];
                    const read = relays.filter(r => r.read).map(r => r.url);
                    const write = relays.filter(r => r.write).map(r => r.url);
                    return { read, write };
                } catch (e) {
                    return { read: [], write: [] };
                }
            });
            return true;

        // --- API Key Vault handlers ---
        case 'apikeys.publish':
            reply(sendResponse, async () => {
                try {
                    const { keys } = message.payload;
                    const pubkey = await getPubKey();
                    const plainText = JSON.stringify(keys);
                    const encrypted = await nip44Encrypt({ pubKey: pubkey, plainText });
                    const unsigned = buildVaultEvent('vault/api-keys', encrypted);

                    const pi = await getProfileIndex();
                    const profile = await getProfile(pi);
                    let signed;
                    if (profile.type === 'bunker') {
                        const session = await getOrCreateSession(pi);
                        signed = await session.signEvent(unsigned);
                    } else {
                        const sk = await getPrivKey();
                        signed = await finalizeEvent(unsigned, sk);
                    }

                    await withRelays('write', async (relays) => {
                        for (const relay of relays) {
                            try { relay.publish(signed); } catch (_) {}
                        }
                    });
                    return { success: true, eventId: signed.id, createdAt: signed.created_at };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'apikeys.fetch':
            reply(sendResponse, async () => {
                try {
                    const pubkey = await getPubKey();
                    const filter = {
                        kinds: [30078],
                        authors: [pubkey],
                        '#d': ['nostrkey:vault/api-keys'],
                    };
                    const allEvents = [];

                    await withRelays('read', async (relays) => {
                        const perRelay = relays.map(relay => new Promise((resolve) => {
                            const subId = `apikeys-${crypto.randomUUID().slice(0, 8)}`;
                            const timeout = setTimeout(() => {
                                try { relay.unsubscribe(subId); } catch (_) {}
                                resolve();
                            }, 15000);

                            relay.subscribe(
                                subId,
                                [filter],
                                (event) => { allEvents.push(event); },
                                () => {
                                    clearTimeout(timeout);
                                    try { relay.unsubscribe(subId); } catch (_) {}
                                    resolve();
                                }
                            );
                        }));
                        await Promise.all(perRelay);
                    });

                    // T1-3: verify author + kind + exact d-tag + id + sig before
                    // trusting; dedupe by id. Rejects relay-injected / tampered /
                    // created_at-rolled events. Then take latest by created_at.
                    let latest = null;
                    const seenIds = new Set();
                    for (const event of allEvents) {
                        if (seenIds.has(event.id)) continue;
                        seenIds.add(event.id);
                        if (!(await verifyStoredEvent(event, {
                            pubkey, kind: 30078, dTag: 'nostrkey:vault/api-keys',
                        }))) continue;
                        if (!latest || event.created_at > latest.created_at) {
                            latest = event;
                        }
                    }

                    if (!latest) {
                        return { success: true, keys: null, eventId: null, createdAt: null };
                    }

                    const decrypted = await nip44Decrypt({ pubKey: pubkey, cipherText: latest.content });
                    const keys = JSON.parse(decrypted);
                    return { success: true, keys, eventId: latest.id, createdAt: latest.created_at };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'apikeys.delete':
            reply(sendResponse, async () => {
                try {
                    const { eventId } = message.payload;
                    const unsigned = buildVaultDeletion(eventId, 'vault/api-keys');

                    const pi = await getProfileIndex();
                    const profile = await getProfile(pi);
                    let signed;
                    if (profile.type === 'bunker') {
                        const session = await getOrCreateSession(pi);
                        signed = await session.signEvent(unsigned);
                    } else {
                        const sk = await getPrivKey();
                        signed = await finalizeEvent(unsigned, sk);
                    }

                    await withRelays('write', async (relays) => {
                        for (const relay of relays) {
                            try { relay.publish(signed); } catch (_) {}
                        }
                    });
                    return { success: true };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'apikeys.encrypt':
            reply(sendResponse, async () => {
                try {
                    const { plainText } = message.payload;
                    const pubkey = await getPubKey();
                    const cipherText = await nip44Encrypt({ pubKey: pubkey, plainText });
                    return { success: true, cipherText };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'apikeys.decrypt':
            reply(sendResponse, async () => {
                try {
                    const { cipherText } = message.payload;
                    const pubkey = await getPubKey();
                    const plainText = await nip44Decrypt({ pubKey: pubkey, cipherText });
                    return { success: true, plainText };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;

        // --- Encrypted vault backup / restore ---
        case 'backup.export':
            reply(sendResponse, async () => {
                if (!sessionCryptoKey) {
                    return { success: false, error: 'Extension must be unlocked to create a backup' };
                }
                const data = await storage.get({
                    profiles: [],
                    profileIndex: 0,
                    isEncrypted: false,
                    passwordHash: null,
                    passwordSalt: null,
                    apiKeyVault: null,
                    vaultDocs: null,
                    nostrAccessWhileLocked: false,
                    blockCrossOriginFrames: true,
                    autoLockMinutes: 15,
                    version: null,
                });
                const plaintext = JSON.stringify(data);
                const encrypted = await encryptWithKey(plaintext, sessionCryptoKey, sessionKeySalt);
                const version = api.runtime.getManifest?.()?.version || 'unknown';
                return {
                    success: true,
                    envelope: {
                        format: 'nostrkey-backup',
                        version: 1,
                        createdAt: new Date().toISOString(),
                        extensionVersion: version,
                        profileCount: Array.isArray(data.profiles) ? data.profiles.length : 0,
                        payload: JSON.parse(encrypted),
                    },
                };
            });
            return true;
        case 'backup.import':
            reply(sendResponse, async () => {
                try {
                    const { envelope, password } = message.payload;
                    if (!envelope || envelope.format !== 'nostrkey-backup') {
                        return { success: false, error: 'Not a valid NostrKey backup file' };
                    }
                    if (typeof envelope.version !== 'number' || envelope.version > 1) {
                        return { success: false, error: 'Backup version not supported. Update NostrKey and try again.' };
                    }
                    const payloadStr = JSON.stringify(envelope.payload);
                    let plaintext;
                    try {
                        plaintext = await decryptBlob(payloadStr, password);
                    } catch (_) {
                        return { success: false, error: 'Wrong password — could not decrypt backup' };
                    }
                    const data = JSON.parse(plaintext);
                    // Write all backed-up keys to storage
                    await storage.set(data);
                    // Update in-memory state
                    encryptionEnabled = !!data.isEncrypted;
                    locked = false;
                    // Derive session key from password, then let password fall out of scope
                    const importSalt = crypto.getRandomValues(new Uint8Array(16));
                    const importedKey = await deriveKey(password, importSalt, { extractable: true });
                    sessionKeyRaw = await exportKeyBase64(importedKey);
                    sessionCryptoKey = await importKeyBase64(sessionKeyRaw);
                    sessionKeySalt = importSalt;
                    // Same F1 wiring as unlockSession: tier-agnostic vault
                    // writes in this context must now use the password key.
                    if (encryptionEnabled) {
                        setVaultSessionKey(sessionCryptoKey, sessionKeySalt);
                    } else {
                        setVaultUnlocked(null);
                    }
                    nostrAccessWhileLocked = data.nostrAccessWhileLocked !== false;
                    blockCrossOriginFrames = data.blockCrossOriginFrames !== false;
                    if (typeof data.autoLockMinutes === 'number') {
                        autoLockTimeout = data.autoLockMinutes * 60 * 1000;
                    }
                    // Populate session key cache
                    sessionKeys.clear();
                    if (Array.isArray(data.profiles)) {
                        for (let i = 0; i < data.profiles.length; i++) {
                            const p = data.profiles[i];
                            if (p.type === 'bunker' || !p.privKey) continue;
                            if (isEncryptedBlob(p.privKey)) {
                                try {
                                    const hex = await decryptBlob(p.privKey, password);
                                    sessionKeys.set(i, hex);
                                } catch (_) {}
                            } else {
                                sessionKeys.set(i, p.privKey);
                            }
                        }
                    }
                    resetAutoLock();
                    const profileCount = Array.isArray(data.profiles) ? data.profiles.length : 0;
                    return { success: true, profileCount };
                } catch (e) {
                    return { success: false, error: e.message || 'Restore failed' };
                }
            });
            return true;

        // nostr: protocol URL handler — no key access needed, no permission prompt
        case 'replaceURL':
            reply(sendResponse, async () => {
                const { protocol_handler } = await storage.get(['protocol_handler']);
                if (!protocol_handler) return false;
                const { url } = message.payload;
                const raw = url.split('nostr:')[1];
                if (!raw) return false;
                try {
                    const decoded = nip19.decode(raw);
                    const { type, data } = decoded;
                    const replacements = {
                        raw,
                        hrp: type,
                        hex:
                            type === 'naddr'
                                ? (decoded.author || raw)
                                : (data || raw),
                        p_or_e: { npub: 'p', note: 'e', nprofile: 'p', nevent: 'e', naddr: 'a' }[type] || '',
                        u_or_n: { npub: 'u', note: 'n', nprofile: 'u', nevent: 'n', naddr: 'n' }[type] || '',
                        relay0: decoded.relays?.[0] || '',
                        relay1: decoded.relays?.[1] || '',
                        relay2: decoded.relays?.[2] || '',
                    };
                    let result = protocol_handler;
                    for (const [pattern, value] of Object.entries(replacements)) {
                        result = result.replace(new RegExp(`\\{ *${pattern} *\\}`, 'g'), value);
                    }
                    return result;
                } catch {
                    return false;
                }
            });
            return true;

        // window.nostr
        case 'getPubKey':
        case 'signEvent':
        case 'nip04.encrypt':
        case 'nip04.decrypt':
        case 'nip44.encrypt':
        case 'nip44.decrypt':
        case 'getRelays':
        case 'addRelay':
            // NOTE: 'exportProfile' is intentionally NOT routed here. It is a
            // privileged, extension-UI-only operation and is blocked for any
            // non-extension sender via SENSITIVE_KINDS. See security audit T0-3.
            validations[uuid] = sendResponse;
            if (Object.keys(validations).length === 1) {
                pendingQueue = { total: 0, processed: 0 };
            }
            pendingQueue.total++;
            ask(uuid, message); // arms the auto-decline timer once a surface is shown
            return true;
        default:
            return false;
    }
});

async function forceRelease() {
    if (prompt.tabId !== null) {
        try {
            // If the previous prompt is still open, then this won't do anything.
            // If it's not open, it will throw an error and get caught.
            await api.tabs.get(prompt.tabId);
        } catch (error) {
            // If the tab is closed, but somehow escaped our event handling, we can clean it up here
            // before attempting to open the next tab.
            prompt.release?.();
            prompt.tabId = null;
        }
    }
}

async function generatePrivateKey_() {
    const keyPair = await generateKeyPair();
    return keyPair.privateKey;
}

/**
 * Resolve a pending bunker approval (called from the allowed/denied handlers).
 * Returns true if the uuid belonged to a bunker approval (so the caller skips
 * the normal window.nostr complete/deny path).
 */
function resolveBunkerApproval(uuid, decision) {
    const entry = bunkerApprovals[uuid];
    if (!entry) return false;
    delete bunkerApprovals[uuid];
    prompt.release?.();
    entry.resolve(decision);
    return true;
}

/**
 * Route a NIP-46 bunker request through the extension-owned permission page and
 * resolve with the user's decision. This reuses the SAME trusted approval
 * surface A1 established for window.nostr (permission/permission.html): a web
 * page cannot drive it, and the allowed/denied replies are isExtensionSender-
 * gated (SENSITIVE_KINDS). BUNK-01 / T0-7.
 *
 * @returns {Promise<{ approved: boolean, remember: boolean }>}
 */
async function requestBunkerApproval({ clientPubkey, method, kind, unsigned }) {
    // Map the NIP-46 method to the permission page's vocabulary so it renders a
    // meaningful prompt (and, for sign_event, the decoded event preview).
    let permKind = method;
    let event = false;
    if (method === 'sign_event') { permKind = 'signEvent'; event = unsigned || { kind }; }
    else if (method === 'nip04_encrypt') permKind = 'nip04.encrypt';
    else if (method === 'nip04_decrypt') permKind = 'nip04.decrypt';
    else if (method === 'nip44_encrypt') permKind = 'nip44.encrypt';
    else if (method === 'nip44_decrypt') permKind = 'nip44.decrypt';

    const shortPk = typeof clientPubkey === 'string' ? clientPubkey.slice(0, 12) : 'unknown';
    const host = `bunker client ${shortPk}… (claimed — not verified)`;

    await forceRelease();
    prompt.release = await prompt.mutex.acquire();

    return new Promise((resolve) => {
        const uuid = crypto.randomUUID();
        let settled = false;
        const finish = (val) => {
            if (settled) return;
            settled = true;
            resolve(val);
        };
        bunkerApprovals[uuid] = { resolve: finish };

        const qs = new URLSearchParams({
            uuid,
            kind: permKind,
            host,
            payload: JSON.stringify(event || false),
            queuePosition: 1,
            queueTotal: 1,
        });

        api.tabs.getCurrent()
            .then(tab => api.tabs.create({
                url: api.runtime.getURL(`permission/permission.html?${qs.toString()}`),
                openerTabId: tab?.id,
            }))
            .then(p => { prompt.tabId = p.id; })
            .catch(() => {});

        // Fail closed if the user never answers.
        setTimeout(() => {
            if (bunkerApprovals[uuid]) {
                delete bunkerApprovals[uuid];
                prompt.release?.();
                finish({ approved: false, remember: false });
            }
        }, 60_000);
    });
}

async function ask(uuid, { kind, host, payload }) {
    // Rate limit permission requests per origin — prevent spam from malicious pages
    if (host) {
        const now = Date.now();
        const rateEntry = permissionRateMap.get(host) || { count: 0, resetAt: now + 60000 };
        if (now > rateEntry.resetAt) {
            rateEntry.count = 0;
            rateEntry.resetAt = now + 60000;
        }
        rateEntry.count++;
        permissionRateMap.set(host, rateEntry);

        if (rateEntry.count > 5) {
            log(`[SECURITY] Rate limited ${host} — ${rateEntry.count} requests in 60s`);
            const sendResponse = validations[uuid];
            delete validations[uuid];
            sendResponse?.({ error: 'rate_limited', message: 'Too many requests. Please wait a moment.' });
            return;
        }
    }

    // Bunker profiles don't need local key decryption — skip lock check
    const pi = await getProfileIndex();
    const profile = await getProfile(pi);
    const isBunker = profile?.type === 'bunker';

    // Read-only operations (getPubKey, getRelays) work from cached data and
    // don't need the private key, so they bypass the lock check entirely.
    // This also fixes Safari's non-persistent background page losing session
    // keys on reload — these operations still work without re-unlocking.
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
                sendResponse?.({ error: 'locked', message: 'Extension is locked. Please unlock with your master password.' });
                return;
            }
            // Keys available despite lock — proceed with permission check
        }
    }

    // Rate limit permission prompts per host
    if (isRateLimited(host)) {
        const sendResponse = validations[uuid];
        delete validations[uuid];
        sendResponse?.({ error: 'rate_limited', message: 'Too many requests. Please wait.' });
        log(`Rate limited: ${host}`);
        return;
    }

    await forceRelease(); // Clean up previous tab if it closed without cleaning itself up
    prompt.release = await prompt.mutex.acquire();

    pendingQueue.processed++;
    const queuePosition = pendingQueue.processed;
    const queueTotal = pendingQueue.total;

    let mKind = kind === 'signEvent' ? `signEvent:${payload.kind}` : kind;
    let permission = await getPermission(host, mKind);
    if (permission === 'allow') {
        complete({
            payload: uuid,
            origKind: kind,
            event: payload,
            remember: false,
            host,
        });
        prompt.release();
        return;
    }

    if (permission === 'deny') {
        deny({ payload: uuid, origKind: kind, host });
        prompt.release();
        return;
    }

    // T0-1: consent is ALWAYS collected in an extension-owned surface
    // (permission/permission.html), never via an in-page sheet. A web page
    // controls its own DOM, so any Allow/Deny button rendered inside the page
    // could be clicked by the page itself (no isTrusted guarantee). The
    // extension permission tab runs in the extension origin and can only be
    // driven by a real user, and its allowed/denied messages are gated behind
    // isExtensionSender (SENSITIVE_KINDS).
    // Arm the auto-decline timer now that we are actually going to prompt, and
    // stamp the deadline into the URL so the consent UI shows a matching countdown.
    armPromptTimeout(uuid, kind, host);
    prompt.pending = { uuid, kind, host };

    let qs = new URLSearchParams({
        uuid,
        kind,
        host,
        payload: JSON.stringify(payload || false),
        queuePosition,
        queueTotal,
        ttl: String(PROMPT_TIMEOUT_MS),
    });
    const baseUrl = api.runtime.getURL(`permission/permission.html?${qs.toString()}`);
    prompt.baseUrl = baseUrl; // deadline appended per-surface so escalation can refresh it
    const url = `${baseUrl}&deadline=${prompt.deadline}`;

    // Prefer an in-page dimmed bottom sheet in the requesting tab (informed
    // consent — the site stays visible behind a 50% backdrop). The sheet is an
    // EXTENSION-OWNED iframe, so the page still can't drive Allow/Deny (T0-1).
    // Fall back to a dedicated tab for contexts a content script can't reach
    // (chrome://, PDF viewer, and the NIP-46 bunker flow which has no page).
    try {
        const [activeTab] = await api.tabs.query({ active: true, currentWindow: true });
        if (activeTab && activeTab.id != null && /^https?:/i.test(activeTab.url || '')) {
            await api.tabs.sendMessage(activeTab.id, { kind: 'showPermissionSheet', url });
            prompt.sheetTabId = activeTab.id;
            prompt.sheetUrl = url; // kept so a compromised sheet can escalate to a tab
            // Wrap release so finishing the prompt (allow / deny / timeout) also
            // dismisses the sheet + any minimized FAB in the page.
            const origRelease = prompt.release;
            prompt.release = () => {
                if (prompt.denyTimer) { clearTimeout(prompt.denyTimer); prompt.denyTimer = null; }
                const tid = prompt.sheetTabId;
                prompt.sheetTabId = null;
                prompt.sheetUrl = null;
                if (tid != null) { try { api.tabs.sendMessage(tid, { kind: 'closePermissionSheet' }).catch(() => {}); } catch (_) {} }
                if (origRelease) origRelease();
            };
            return true;
        }
    } catch (_) { /* fall through to the tab fallback */ }

    let tab = await api.tabs.getCurrent();
    let p = await api.tabs.create({ url, openerTabId: tab?.id });
    prompt.tabId = p.id;
    return true;
}

function complete({ payload, origKind, event, remember, host }) {
    const sendResponse = validations[payload];
    // Ignore any postback that doesn't match a LIVE pending request. payload is an
    // unguessable crypto.randomUUID() minted per real prompt, so requiring it to
    // exist here stops a framed/forged permission page (permission.html is now a
    // web-accessible resource) from writing the persistent allow-list via
    // setPermission or perturbing queue state with a fabricated uuid+host.
    if (!sendResponse) return;
    if (prompt.denyTimer) { clearTimeout(prompt.denyTimer); prompt.denyTimer = null; }
    delete validations[payload];
    if (Object.keys(validations).length === 0) {
        pendingQueue = { total: 0, processed: 0 };
    }

    if (remember) {
        let mKind =
            origKind === 'signEvent' ? `signEvent:${event.kind}` : origKind;
        setPermission(host, mKind, 'allow');
    }

    {
        const onError = (e) => {
            log(`Error in ${origKind}: ${e.message}`);
            sendResponse({ error: 'bunker_error', message: e.message });
        };

        switch (origKind) {
            case 'getPubKey':
                getPubKey().then(pk => sendResponse(pk)).catch(onError);
                break;
            case 'signEvent':
                signEvent_(event, host).then(e => sendResponse(e)).catch(onError);
                break;
            case 'nip04.encrypt':
                nip04Encrypt(event).then(e => sendResponse(e)).catch(onError);
                break;
            case 'nip04.decrypt':
                nip04Decrypt(event).then(e => sendResponse(e)).catch(onError);
                break;
            case 'nip44.encrypt':
                nip44Encrypt(event).then(e => sendResponse(e)).catch(onError);
                break;
            case 'nip44.decrypt':
                nip44Decrypt(event).then(e => sendResponse(e)).catch(onError);
                break;
            case 'getRelays':
                getRelays().then(e => sendResponse(e)).catch(onError);
                break;
            case 'addRelay':
                addRelay(event.url).then(e => sendResponse(e)).catch(onError);
                break;
        }
    }
}

function deny({ origKind, host, payload, remember, event }) {
    const sendResponse = validations[payload];
    // Same guard as complete(): only a live pending request may write the
    // persistent deny-list. A forged/framed postback with an unknown uuid is
    // ignored so it cannot poison (host,kind)→deny entries.
    if (!sendResponse) return false;
    if (prompt.denyTimer) { clearTimeout(prompt.denyTimer); prompt.denyTimer = null; }
    delete validations[payload];
    if (Object.keys(validations).length === 0) {
        pendingQueue = { total: 0, processed: 0 };
    }

    if (remember) {
        let mKind =
            origKind === 'signEvent' ? `signEvent:${event.kind}` : origKind;
        setPermission(host, mKind, 'deny');
    }

    sendResponse(undefined);
    return false;
}

/**
 * Cache pubKeys for all local profiles (call before encrypting keys).
 * This ensures npub is available even when the extension is locked.
 */
async function cachePubKeysForAllProfiles() {
    const profiles = await getProfiles();
    let updated = false;
    for (let i = 0; i < profiles.length; i++) {
        const profile = profiles[i];
        if (profile.type === 'bunker') continue;
        if (profile.pubKey) continue; // Already cached
        if (!profile.privKey || isCiphertext(profile.privKey)) continue;
        try {
            const pubKey = getPublicKeySync(profile.privKey);
            profiles[i].pubKey = pubKey;
            updated = true;
        } catch (e) {
            console.error(`Failed to cache pubKey for profile ${i}:`, e);
        }
    }
    if (updated) {
        await storage.set({ profiles });
    }
}

// Options
async function savePrivateKey([index, privKey]) {
    const profile = await getProfile(index);
    if (profile?.type === 'bunker') {
        throw new Error('Cannot set private key on a bunker profile');
    }

    if (typeof privKey !== 'string' || privKey.length === 0) {
        throw new Error('Invalid private key: must be a non-empty string');
    }

    let hexKey;
    if (privKey.startsWith('nsec')) {
        try {
            hexKey = nip19.decode(privKey).data;
        } catch (e) {
            throw new Error('Invalid nsec key');
        }
    } else {
        // Already a hex string
        hexKey = privKey;
    }

    if (!/^[0-9a-f]{64}$/i.test(hexKey)) {
        throw new Error('Invalid private key: must be 64 hex characters or valid nsec');
    }

    let profiles = await get('profiles');

    if (!profiles || index < 0 || index >= profiles.length) {
        throw new Error('Invalid profile index');
    }

    // Cache the public key so it's available even when locked
    const pubKey = getPublicKeySync(hexKey);
    profiles[index].pubKey = pubKey;

    // If encryption is active, re-encrypt the new key using the session key.
    // Otherwise (passwordless default) wrap under the device key — T0-4 forbids
    // ever persisting the raw hex private key.
    const encrypted = await isEncrypted();
    if (encrypted) {
        // F1 invariant: a password-protected vault never receives a device blob.
        // Without a session key we cannot make a password blob, so refuse rather
        // than write one the master password can never open.
        if (!sessionCryptoKey) {
            throw new Error('NostrKey is locked — unlock with your master password before saving a key.');
        }
        profiles[index].privKey = await encryptWithKey(hexKey, sessionCryptoKey, sessionKeySalt);
        sessionKeys.set(index, hexKey);
    } else {
        // Passwordless tier — name the device key explicitly so this write
        // cannot follow some other module's session state.
        profiles[index].privKey = await encryptWithDeviceKey(hexKey);
    }

    await storage.set({ profiles });
    resetAutoLock(); // also mirrors the updated sessionKeys into storage.session
    return true;
}

async function getNsec(index) {
    let profile = await getProfile(index);

    if (profile.type === 'bunker') return null;

    let hexKey = await getPlaintextPrivKey(index, profile);
    let nsec = nip19.nsecEncode(hexKey);
    return nsec;
}

async function getNpub(index) {
    let profile = await getProfile(index);

    if (!profile) return null;

    if (profile.type === 'bunker') {
        if (profile.remotePubkey) return nip19.npubEncode(profile.remotePubkey);
        return null;
    }

    // Use cached pubKey if available (works even when locked)
    if (profile.pubKey) {
        return nip19.npubEncode(profile.pubKey);
    }

    // Fallback: derive from private key (requires unlocked state)
    try {
        let hexKey = await getPlaintextPrivKey(index, profile);
        if (!hexKey || typeof hexKey !== 'string' || hexKey.length !== 64) {
            return null;
        }
        let pubKey = getPublicKeySync(hexKey);
        let npub = nip19.npubEncode(pubKey);
        return npub;
    } catch (e) {
        console.error('getNpub error:', e);
        return null;
    }
}

/**
 * Get the plaintext hex private key for a profile.
 * Uses session cache if encryption is active, otherwise reads from storage directly.
 */
async function getPlaintextPrivKey(index, profile) {
    // Device-wrapped (passwordless default) — decrypt with the non-extractable
    // device key; available without an unlock, matching the pre-fix UX.
    if (isDeviceKeyBlob(profile.privKey)) {
        return decryptWithDeviceKey(profile.privKey);
    }
    if (isEncryptedBlob(profile.privKey)) {
        // Password blob — must use the in-memory session cache (requires unlock).
        if (sessionKeys.has(index)) {
            return sessionKeys.get(index);
        }
        throw new Error('Extension is locked — cannot access private key');
    }
    return profile.privKey;
}

async function getPrivKey() {
    let index = await getProfileIndex();
    let profile = await currentProfile();
    let hexKey = await getPlaintextPrivKey(index, profile);
    return hexToBytes(hexKey);
}

async function getPubKey() {
    let pi = await getProfileIndex();
    let profile = await getProfile(pi);

    if (profile.type === 'bunker') {
        // Return cached remotePubkey, or live-query and cache
        if (profile.remotePubkey) return profile.remotePubkey;
        const session = await getOrCreateSession(pi);
        const pubkey = await session.getPublicKey();
        const profiles = await get('profiles');
        profiles[pi].remotePubkey = pubkey;
        await storage.set({ profiles });
        return pubkey;
    }

    // Use cached pubKey if available (works even when locked)
    if (profile.pubKey) return profile.pubKey;

    // Fallback: derive from private key (requires unlocked state)
    let privKey = await getPrivKey();
    let pubKey = getPublicKeySync(bytesToHex(privKey));
    return pubKey;
}

async function currentProfile() {
    let index = await getProfileIndex();
    let profiles = await get('profiles');
    return profiles[index];
}

async function signEvent_(event, host) {
    event = JSON.parse(JSON.stringify(event));

    const pi = await getProfileIndex();
    const profile = await getProfile(pi);

    if (profile.type === 'bunker') {
        const session = await getOrCreateSession(pi);
        event = await session.signEvent(event);
    } else {
        let sk = await getPrivKey();
        event = await finalizeEvent(event, sk);
    }

    saveEvent({
        event,
        metadata: { host, signed_at: Math.round(Date.now() / 1000) },
    });
    return event;
}

async function nip04Encrypt({ pubKey, plainText }) {
    const pi = await getProfileIndex();
    const profile = await getProfile(pi);

    if (profile.type === 'bunker') {
        const session = await getOrCreateSession(pi);
        return session.nip04Encrypt(pubKey, plainText);
    }

    let privKey = await getPrivKey();
    return nip04.encryptMessage(plainText, bytesToHex(privKey), pubKey);
}

async function nip04Decrypt({ pubKey, cipherText }) {
    const pi = await getProfileIndex();
    const profile = await getProfile(pi);

    if (profile.type === 'bunker') {
        const session = await getOrCreateSession(pi);
        return session.nip04Decrypt(pubKey, cipherText);
    }

    let privKey = await getPrivKey();
    return nip04.decryptMessage(cipherText, bytesToHex(privKey), pubKey);
}

async function nip44Encrypt({ pubKey, plainText }) {
    const pi = await getProfileIndex();
    const profile = await getProfile(pi);

    if (profile.type === 'bunker') {
        const session = await getOrCreateSession(pi);
        return session.nip44Encrypt(pubKey, plainText);
    }

    let privKey = await getPrivKey();
    let conversationKey = nip44.v2.utils.getConversationKey(privKey, pubKey);
    return nip44.v2.encrypt(plainText, conversationKey);
}

async function nip44Decrypt({ pubKey, cipherText }) {
    const pi = await getProfileIndex();
    const profile = await getProfile(pi);

    if (profile.type === 'bunker') {
        const session = await getOrCreateSession(pi);
        return session.nip44Decrypt(pubKey, cipherText);
    }

    let privKey = await getPrivKey();
    let conversationKey = nip44.v2.utils.getConversationKey(privKey, pubKey);
    return nip44.v2.decrypt(cipherText, conversationKey);
}

/**
 * T1-3: verify a stored NIP-78 event fetched from an (untrusted) relay before
 * trusting its ciphertext. A relay can hand us anything, so we:
 *   - recompute the event id and verify the Schnorr signature (rejects any
 *     forged/tampered event — including one with a bumped created_at, since that
 *     changes the id/sig),
 *   - assert the author is our own pubkey (rejects injected foreign events),
 *   - assert the kind and exact d-tag we asked for.
 * Combined with id-based dedupe at the call site, this kills the vault/api-key
 * injection + created_at-rollback forgery attack. (Full monotonic-version
 * anti-rollback of genuine-but-stale events is a payload-format change tracked
 * separately in the audit.)
 *
 * @returns {Promise<boolean>}
 */
async function verifyStoredEvent(event, { pubkey, kind, dTag }) {
    if (!event || typeof event !== 'object') return false;
    if (event.kind !== kind) return false;
    if (event.pubkey !== pubkey) return false;
    if (typeof event.id !== 'string' || typeof event.sig !== 'string' ||
        typeof event.created_at !== 'number') return false;
    if (dTag) {
        const d = event.tags?.find(t => t[0] === 'd');
        if (!d || d[1] !== dTag) return false;
    }
    try {
        if ((await calculateEventId(event)) !== event.id) return false;
        if (!(await verifySignature(event))) return false;
    } catch (_) {
        return false;
    }
    return true;
}

// T0-2: the only relays a bunker may run on are the NostrKey defaults plus the
// active profile's own configured relays. Caller-supplied URLs outside this set
// are dropped, so a request can't point the signer at an attacker relay.
const DEFAULT_BUNKER_RELAYS = ['wss://relay.nostrkey.com', 'wss://relay.nostrkeep.app'];

async function resolveBunkerRelays(requested) {
    const allow = new Set(DEFAULT_BUNKER_RELAYS);
    try {
        const relays = await getRelays();
        for (const url of Object.keys(relays || {})) {
            if (/^wss:\/\//i.test(url)) allow.add(url);
        }
    } catch { /* fall back to defaults */ }

    if (!Array.isArray(requested) || requested.length === 0) {
        return [...DEFAULT_BUNKER_RELAYS];
    }
    const filtered = requested.filter(u => typeof u === 'string' && allow.has(u));
    return filtered.length ? filtered : [...DEFAULT_BUNKER_RELAYS];
}

async function getRelays() {
    let profile = await currentProfile();
    let relays = profile.relays;
    let relayObj = {};
    // The getRelays call expects this to be returned as an object, not array
    relays.forEach(relay => {
        let { url, read, write } = relay;
        relayObj[url] = { read, write };
    });
    return relayObj;
}

async function addRelay(url) {
    // Validate URL
    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        throw new Error('Invalid URL');
    }
    if (parsed.protocol !== 'wss:') {
        throw new Error('Must be a wss:// URL');
    }

    let profiles = await getProfiles();
    let pi = await getProfileIndex();
    let profile = profiles[pi];
    if (!profile.relays) profile.relays = [];

    // Check for duplicates
    if (profile.relays.some(r => r.url === parsed.href)) {
        return { success: true, message: 'Relay already exists' };
    }

    profile.relays.push({ url: parsed.href, read: true, write: true });
    profile.updatedAt = Math.floor(Date.now() / 1000);
    await storage.set({ profiles });

    return { success: true, message: 'Relay added' };
}

async function exportProfileData() {
    let pi = await getProfileIndex();
    let profile = await getProfile(pi);

    if (!profile) throw new Error('No active profile');
    if (profile.type === 'bunker') {
        // Bunker profiles don't have local keys to export
        return {
            name: profile.name,
            type: 'bunker',
            bunkerUrl: profile.bunkerUrl || '',
            exportedAt: new Date().toISOString(),
            source: 'NostrKey',
        };
    }

    let npub = '';
    if (profile.pubKey) {
        npub = nip19.npubEncode(profile.pubKey);
    }

    let nsec = '';
    try {
        nsec = await getNsec(pi);
    } catch {
        // Key may be encrypted and locked
        throw new Error('Cannot export while locked. Please unlock first.');
    }

    return {
        name: profile.name,
        npub,
        nsec,
        relays: (profile.relays || []).map(r => r.url),
        exportedAt: new Date().toISOString(),
        source: 'NostrKey',
    };
}

/**
 * Open ephemeral relay connections, execute callback, then disconnect.
 * Correct for Chrome MV3 service worker lifecycle (no persistent pool).
 *
 * @param {'read'|'write'} mode - Which relay subset to connect to
 * @param {function(RelayConnection[]): Promise} callback
 */
async function withRelays(mode, callback) {
    const profile = await currentProfile();
    const relayList = profile.relays || [];
    const urls = relayList
        .filter(r => mode === 'read' ? r.read : r.write)
        .map(r => r.url);

    if (urls.length === 0) {
        throw new Error('No relays configured');
    }

    const connections = [];
    const connectPromises = urls.map(async (url) => {
        const relay = new RelayConnection(url);
        try {
            await relay.connect();
            connections.push(relay);
        } catch (_) {
            // Skip relays that fail to connect
        }
    });

    await Promise.allSettled(connectPromises);

    if (connections.length === 0) {
        throw new Error('Failed to connect to any relay');
    }

    try {
        await callback(connections);
    } finally {
        for (const relay of connections) {
            relay.close();
        }
    }
}
