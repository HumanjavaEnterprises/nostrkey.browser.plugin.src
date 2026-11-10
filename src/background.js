import { copySecret } from './utilities/copy-secret.js';
import { selectRelayUrls } from './utilities/relay-select.js';
import { fetchProfile, fetchLatest, isNewerRelayList, isOwnEvent, pickNewest, parseProfileContent } from './profiles/kind0.js';
import { describeEffect, effectBlocksGrant, EFFECT_KINDS } from './permission/effect-preview.js';
import { listStore, LIST_KINDS } from './utilities/list-store.js';
import { validateChanges, mergeContent, isStale, buildKind0, futureDated, clip } from './profiles/profile-edit.js';
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
    validateRequest,
    checkAuthTarget,
    parseGrantKey,
    RELAY_AUTH_KIND,
    senderOrigin,
    blossomRisk,
    fitsPrompt,
    grantKeyFor,
    canRemember,
    grantLimit,
    grantSlots,
    isNeverGranted,
    isOptInKey,
    isOptedIn,
    withoutNeverGranted,
    rememberedValue,
    rememberLimit,
    GRANT_RATE,
} from './utilities/consent-policy';
import { holdRequest, stampHeld, takeHeld } from './utilities/held-requests';
import { describeKind } from './permission/kind-labels';
import { redactBunkerUrl, redactProfiles } from './utilities/bunker-url.js';
import {
    getProfileIndex,
    get,
    getProfile,
    getProfiles,
    getPermission,
    getStoredGrant,
    setPermission,
    setPermissionForUnreadIdentity,
    SITE_REVOCATIONS_KEY,
    wasRevokedSince,
    revokePermission,
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
    findProfilesByPubkey,
} from './utilities/utils';
import { checkFields } from './profiles/field-checks.js';
import { forgetProfileTab } from './profiles/profile-tabs.js';
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
import { saveEvent, newestEventOf, eventKindsById } from './utilities/db';
import { api } from './utilities/browser-polyfill';
import { initSync, scheduleSyncPush, setProfileMoveHandler } from './utilities/sync-manager';
import {
    RelayConnection,
    publishToRelays,
    confirmSessionUser,
    getOrCreateSession,
    commitSession,
    openPendingSession,
    disconnectSession,
    discardSession,
    indexEpoch,
    isSessionActive,
    moveSessions,
    parsePubkey,
    profileChangedError,
    reindexSessionsAfterDelete,
    samePubkey,
    signedAsRequested,
    validateBunkerUrl,
} from './utilities/nip46';
import { BunkerServer, generateSecret } from './utilities/bunker-server';
import { checkNewKey, newKeyWarning } from './utilities/npub-guard.js';
import {
    buildVaultEvent,
    buildVaultDeletion,
    buildVaultFilter,
    parseVaultEvent,
    API_KEYS_PATH,
    vaultDtag,
} from './utilities/nip78';
import { deletionTombstones, isTombstoned } from './utilities/sync-merge';
import { updateProfiles as updateProfilesIn, applyKeyChanges as applyKeyChangesIn, withProfilesLock } from './utilities/profiles-store.js';

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

// Every profiles write in the worker goes through these: a fresh read and a
// synchronous change under one lock, written through the sync-aware storage.
const updateProfiles = (mutator, opts = {}) => updateProfilesIn(mutator, { storage, ...opts });
const applyKeyChanges = (changes, opts = {}) => applyKeyChangesIn(changes, { storage, ...opts });

/** What each profile's key fields were, to diff against after slow work. */
const keySnapshot = (profiles) => profiles.map(p => ({ privKey: p?.privKey, pubKey: p?.pubKey }));

/** Key changes made in place on `profiles` since `before`, keyed by the old blob. */
function keyChangesSince(before, profiles) {
    const changes = new Map();
    profiles.forEach((p, i) => {
        const was = before[i];
        if (!p || !was || !was.privKey) return;
        const change = {};
        if (p.privKey !== was.privKey) change.privKey = p.privKey;
        if (p.pubKey && !was.pubKey) change.pubKey = p.pubKey;
        if (Object.keys(change).length) changes.set(was.privKey, change);
    });
    return changes;
}
const API_KEYS_DTAG = `nostrkey:${API_KEYS_PATH}`;
const RESERVED_PATH_ERROR = 'NostrKey keeps this name for itself. Choose another title.';

// T0-6: message kinds whose payload carries a secret (master password, private
// key, seed phrase, ncryptsec, backup blob, connection string). Their payload must NEVER be logged
// — we redact at the source rather than relying on prod builds dropping console.
const SECRET_LOG_KINDS = new Set([
    'unlock', 'setPassword', 'changePassword', 'removePassword',
    'savePrivateKey', 'backup.import', 'backup.export',
    'apikeys.encrypt', 'apikeys.decrypt', 'apikeys.publish',
    'vault.publish', 'importSeedPhrase', 'importKey', 'wrapPrivKey',
    // A connection string holds the signer's secret until it has been used.
    'bunker.connect', 'bunker.validateUrl', 'copy',
    'seedPhrase.toKey', 'seedPhrase.validate', 'calcPubKey',
    'ncryptsec.encrypt', 'ncryptsec.decrypt',
]);

// Message kinds whose payload is logged without the text being encrypted or decrypted.
const TEXT_LOG_KINDS = new Set(['nip04.encrypt', 'nip04.decrypt', 'nip44.encrypt', 'nip44.decrypt']);

/**
 * Log an inbound message without ever emitting a secret-bearing payload.
 * For sensitive kinds we log only the kind; for encryption requests the message
 * without its text; otherwise the message as-is.
 */
function logMessage(message) {
    if (message && typeof message === 'object' && SECRET_LOG_KINDS.has(message.kind)) {
        log(`{ kind: '${message.kind}', payload: '[redacted]' }`);
        return;
    }
    if (TEXT_LOG_KINDS.has(message?.kind) && typeof message.payload === 'object' && message.payload) {
        const { plainText, cipherText, ...payload } = message.payload;
        log({ ...message, payload });
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
    // Running until the surface of the open prompt reports that it loaded.
    readyTimer: null,
    // Kept so a compromised sheet can rebuild + reopen the SAME prompt as a tab.
    // `pending.shown` is what its surface reads back by uuid, as JSON.
    baseUrl: null, pending: null,
    // When the open prompt's own tab last said someone is using it.
    inUseAt: 0,
};

// A tab that said it is in use within this long is kept, even if the browser
// cannot find it for a moment. It still ends on an answer or its timeout.
const PROMPT_IN_USE_MS = 15_000;
let pendingQueue = { total: 0, processed: 0 };
let activeBunkerServer = null;
// The profile a running bunker server was started for: { index, pubkey }.
let bunkerServerIdentity = null;

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

// Rate limiter: max 5 requests that may prompt, per host, per 10-second window.
// Requests answered from a stored grant use grantBuckets instead.
const rateLimits = new Map();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 10000;

// How long a pending signing prompt stays open before it auto-declines. Surfaced
// to the consent UI as a live countdown (permission.html reads ?deadline=&ttl=).
const PROMPT_TIMEOUT_MS = 40_000;

// The longest a request may wait for its turn before it is answered instead of
// shown: the prompt ahead of it on a sheet, then a tab, then a remote signer. With
// this in place a page's wait (PAGE_TIMEOUT_MS in nostr.js) always outlasts any
// prompt it asked for, so nothing is signed after the page has stopped listening.
const PROMPT_WAIT_MS = 110_000;

// How long a surface has to report that it loaded. One that does not is declined,
// so a frame that never drew cannot hold up the requests behind it.
const PROMPT_READY_MS = 6_000;

// Arm (or re-arm) the auto-decline timer for the current prompt and stamp the
// deadline the consent UI counts down to. Re-arming (e.g. on tab escalation)
// clears the previous timer so there is always exactly one pending decline.
function armPromptTimeout(uuid) {
    if (prompt.denyTimer) { clearTimeout(prompt.denyTimer); prompt.denyTimer = null; }
    prompt.deadline = Date.now() + PROMPT_TIMEOUT_MS;
    prompt.denyTimer = setTimeout(() => {
        prompt.denyTimer = null;
        // Deny the still-pending request on timeout instead of silently releasing.
        if (validations[uuid]) {
            deny({ payload: uuid, timedOut: true });
        }
        releaseIfCurrent(uuid);
    }, PROMPT_TIMEOUT_MS);
}

/**
 * If the open prompt's surface does not report ready in time, a sheet moves to a
 * tab, once. Any other surface is declined.
 */
function armPromptReady(uuid) {
    clearTimeout(prompt.readyTimer);
    prompt.readyTimer = setTimeout(() => {
        prompt.readyTimer = null;
        if (prompt.pending?.uuid !== uuid) return;
        if (prompt.sheetTabId !== null && prompt.baseUrl) {
            log('Prompt sheet did not load; moving to a tab');
            showInTab(uuid, api.tabs.create({ url: leaveSheet(uuid) }));
            return;
        }
        log('Prompt surface did not load; declining');
        declineOpenPrompt();
    }, PROMPT_READY_MS);
}

/**
 * Take the open prompt off its sheet, ready for a tab: the tab gets a fresh full
 * window and the wait for a ready report starts again.
 *
 * @returns {string} the address for the tab
 */
function leaveSheet(uuid) {
    const tid = prompt.sheetTabId;
    prompt.sheetTabId = null;
    prompt.sheetUrl = null;
    api.tabs.sendMessage(tid, { kind: 'closePermissionSheet' }).catch(() => {});
    armPromptTimeout(uuid);
    armPromptReady(uuid);
    return `${prompt.baseUrl}&deadline=${prompt.deadline}`;
}

/** Note the tab now showing a prompt. If it could not open, the prompt is declined. */
function showInTab(uuid, created) {
    created.then(t => setPromptTab(uuid, t.id)).catch((e) => {
        log(`Prompt tab did not open: ${e?.message}`);
        if (prompt.pending?.uuid === uuid) declineOpenPrompt();
    });
}

/** Stop the wait for a ready report, if it belongs to this prompt. */
function clearPromptReady(uuid) {
    if (prompt.pending?.uuid !== uuid) return;
    clearTimeout(prompt.readyTimer);
    prompt.readyTimer = null;
}

/** Stop this prompt's timers, if it is the open one. */
function clearPromptTimer(uuid) {
    clearPromptReady(uuid);
    if (prompt.pending?.uuid === uuid && prompt.denyTimer) {
        clearTimeout(prompt.denyTimer);
        prompt.denyTimer = null;
    }
}

/**
 * End the open prompt, if this uuid is the open prompt. Anything else is a no-op,
 * so a late or unknown uuid cannot touch whoever holds the prompt now.
 *
 * @returns {boolean} whether this uuid was the open prompt
 */
function releaseIfCurrent(uuid) {
    if (!uuid || prompt.pending?.uuid !== uuid) return false;
    clearPromptTimer(uuid);
    promptEffects.delete(uuid);
    const { release } = prompt;
    prompt.pending = null;
    prompt.tabId = null;
    prompt.baseUrl = null;
    prompt.release = null;
    prompt.inUseAt = 0;
    release?.();
    autoLockIfHeldAndIdle();
    return true;
}

/** Note the tab showing a prompt, unless that prompt has already ended. */
function setPromptTab(uuid, tabId) {
    if (prompt.pending?.uuid === uuid) prompt.tabId = tabId;
}

/** Decline whatever the open prompt is asking, and end it. */
function declineOpenPrompt() {
    const uuid = prompt.pending?.uuid;
    if (!uuid) return;
    if (resolveBunkerApproval(uuid, BUNKER_DECLINED)) return;
    // If deny did not take it, an approval already has and ends the prompt itself.
    deny({ payload: uuid })
        .catch((e) => { log(`Prompt decline failed: ${e?.message}`); return true; })
        .then((took) => { if (took) releaseIfCurrent(uuid); });
}

/**
 * Finish an allowed/denied postback: end the prompt only if this postback decided
 * it, and only after any remember write, then answer the page.
 */
function finishPrompt(uuid, decided, sendResponse) {
    decided
        .catch((e) => { log(`Prompt answer failed: ${e?.message}`); return true; })
        .then((took) => {
            if (took) releaseIfCurrent(uuid);
            sendResponse(true);
        });
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
// Off: approvals appear on the page, and the most serious open in a tab. On: all do.
let approvalsInTab = false;

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

// Per-origin limit on requests that may prompt (see ask())
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

// A request may arrive before startup has worked out whether the vault is locked.
// It waits for that, but never past this long: until then the vault reads as locked.
const STARTUP_WAIT_MS = 2000;
let startupSettled = false;
let settleStartup;
const startupReady = new Promise((resolve) => {
    settleStartup = () => { startupSettled = true; resolve(); };
});

async function waitForStartup() {
    if (startupSettled) return;
    let timer;
    const limit = new Promise((resolve) => { timer = setTimeout(resolve, STARTUP_WAIT_MS); });
    await Promise.race([startupReady, limit]);
    clearTimeout(timer);
}

// Load persisted state on startup
(async () => {
    log('[STARTUP] Reading persisted state...');
    // Restrict the session area to extension-privileged contexts before anything
    // is written to it (Chrome-only; a no-op elsewhere).
    api.storage.session?.setAccessLevel?.({ accessLevel: 'TRUSTED_CONTEXTS' }).catch(() => {});
    const data = await storage.get({ autoLockMinutes: 15, isEncrypted: false, passwordHash: null, nostrAccessWhileLocked: false, blockCrossOriginFrames: true, approvalsInTab: false });
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
        approvalsInTab = data.approvalsInTab === true;
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

        // A profile keeps only its remote signer's address. Older versions stored
        // the whole connection string.
        try {
            await updateProfiles((profiles) => {
                const clean = redactProfiles(profiles);
                if (clean === profiles) return false;
                profiles.splice(0, profiles.length, ...clean);
            });
        } catch (e) {
            log(`[STARTUP] Profile address cleanup error (non-fatal): ${e.message}`);
        }
    } finally {
        startupRelease();
        settleStartup();
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
                let mergedAny = false;
                await updateProfiles((profiles) => {
                    const merged = mergeSharedProfiles(profiles, response.profiles);
                    if (!merged.changed) return false;
                    profiles.splice(0, profiles.length, ...merged.profiles);
                    mergedAny = true;
                });
                if (mergedAny) {
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
})().catch((e) => {
    log(`[STARTUP] Failed: ${e?.message}`);
    settleStartup();
});

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

    // Profile keys are worked out here and written on their own below, matched
    // by the blob they replace, so a write that landed meanwhile is kept.
    let profileKeyChanges = null;
    if (Array.isArray(data.profiles)) {
        const before = keySnapshot(data.profiles);
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
            } else if (isDeviceKeyBlob(p.privKey) && !encryptionEnabled) {
                // Opportunistic upgrade: re-wrap blobs that only decrypt under a
                // legacy (pre-1.8.1) IndexedDB key so they survive on the
                // strategy this context actually persists to.
                const fresh = await rewrapLegacyDeviceBlob(
                    p.privKey, `profile ${i} privKey`,
                );
                if (fresh) p.privKey = fresh;
            }
        }
        profileKeyChanges = keyChangesSince(before, data.profiles);
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

    if (profileKeyChanges && profileKeyChanges.size > 0) {
        await applyKeyChanges(profileKeyChanges);
        log('[MIGRATION] Wrapped plaintext secrets at rest: profiles');
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
    clearAutoLockHold();

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
        autoLockTimer = setTimeout(() => { autoLockDue(); }, autoLockTimeout);
    }
    // The alarms API is still the single locking authority; storage.session only
    // carries the deadline forward so a restart cannot silently extend it.
    persistSessionState(Date.now() + autoLockTimeout);
}

// Listen for the alarm to fire
if (api.alarms?.onAlarm) {
    api.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === AUTO_LOCK_ALARM) {
            autoLockDue();
        }
    });
}

// When the auto-lock came due while a request was waiting on the person, and
// the timer that locks at the latest allowed moment.
let autoLockDueAt = 0;
let autoLockHoldTimer = null;

function clearAutoLockHold() {
    autoLockDueAt = 0;
    if (autoLockHoldTimer) { clearTimeout(autoLockHoldTimer); autoLockHoldTimer = null; }
}

/** Is any site request still waiting for an answer? */
const requestsWaiting = () => prompt.pending !== null || Object.keys(validations).length > 0;

/**
 * The auto-lock is due. While a request is waiting on the person the lock waits
 * too, but never past the original deadline plus one prompt timeout, however
 * many requests queue or re-arm. Then it locks and declines everything held.
 */
function autoLockDue() {
    if (locked) { clearAutoLockHold(); return; }
    const now = Date.now();
    if (!autoLockDueAt) autoLockDueAt = now;
    const latest = autoLockDueAt + PROMPT_TIMEOUT_MS;
    if (requestsWaiting() && now < latest) {
        if (autoLockHoldTimer) clearTimeout(autoLockHoldTimer);
        autoLockHoldTimer = setTimeout(() => { autoLockHoldTimer = null; autoLockDue(); }, latest - now);
        return;
    }
    clearAutoLockHold();
    lockAndDeclineHeld();
}

/** Once the last waiting request is answered, a held auto-lock locks. */
function autoLockIfHeldAndIdle() {
    if (!autoLockDueAt) return;
    if (!requestsWaiting()) autoLockDue();
}

const LOCKED_REPLY = Object.freeze({ error: 'locked', message: 'Extension is locked. Please unlock with your master password.' });

/** Lock now, and decline the open prompt and every request still held. */
async function lockAndDeclineHeld() {
    clearAutoLockHold();
    await lockSession();
    declineOpenPrompt();
    for (const uuid of Object.keys(validations)) {
        if (prompt.pending?.uuid === uuid) continue;
        settleRequest(uuid, LOCKED_REPLY);
    }
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
        const keysBefore = keySnapshot(profiles);
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
            await applyKeyChanges(keyChangesSince(keysBefore, profiles));
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
    'setApprovalsInTab',
    'backup.export', 'backup.import', 'unlock',
    // A raw private key crosses this boundary — extension UI only.
    // `savePrivateKey` WRITES that key into a profile, so it belongs here just
    // as much as wrapPrivKey does (pre-existing gap, closed in 1.8.1).
    'wrapPrivKey', 'savePrivateKey',
    // Security: NIP-46 bunker controls must come from the extension UI only.
    'bunkerServer.start', 'bunkerServer.stop', 'bunkerServer.status',
    'bunkerServer.connections', 'bunkerServer.revoke',
    // Security: private-key export must come from the extension UI only.
    'exportProfile',
    // These four RETURN or ACCEPT raw key material (nsec/hex/seed words) —
    // extension UI only. Content scripts never call them legitimately.
    'ncryptsec.encrypt', 'ncryptsec.decrypt',
    'seedPhrase.fromKey', 'seedPhrase.toKey',
    // NK-04: consent control messages must come from the extension-owned
    // permission surface, not from a content script / web page.
    'allowed', 'denied', 'closePrompt', 'promptReady', 'promptEffect', 'holdPrompt',
    // Reindexes the in-memory index-keyed session key cache after a profile
    // delete — mutates privileged session state, extension UI only.
    'reindexSessionKeys', 'profilesMoved',
    // Everything else the extension's own pages use. A website reaches the
    // window.nostr methods and nothing more, so anything not named here is one of
    // those or a note from the content script (holdMinimizedPrompt,
    // permissionSheetCompromised).
    // Keys and addresses.
    'generatePrivateKey', 'getNpub', 'getNsec', 'identityPubkeys', 'calcPubKey', 'npubEncode', 'copy',
    // Lock state and settings.
    'isLocked', 'isEncrypted', 'hasEncryptedData', 'lock',
    'getAutoLockTimeout', 'getNostrAccessWhileLocked', 'getBlockCrossOriginFrames',
    'getApprovalsInTab',
    'getActiveProfileInfo', 'getProfileType', 'seedPhrase.validate',
    // The remote signer connection.
    'bunker.connect', 'bunker.confirmConnect', 'bunker.cancelConnect',
    'bunker.disconnect', 'bunker.status', 'bunker.ping', 'bunker.validateUrl',
    // The vault and API key stores.
    'vault.publish', 'vault.fetch', 'vault.delete', 'vault.getRelays',
    'apikeys.publish', 'apikeys.fetch', 'apikeys.delete', 'apikeys.encrypt', 'apikeys.decrypt',
    // The profile detail tab (1.8.6).
    'profile.fetch', 'profile.checkAddresses',
    // Signs and publishes kind 0 for one of the user's identities.
    'profile.publish',
    // Device-only saved versions, and restoring one (signs and publishes).
    'profile.history', 'profile.restorePreview', 'profile.restore',
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
    // No tab: the popup, the side panel and other extension pages not in a tab.
    // When the runtime reports the sending URL it must be one of our own pages.
    if (sender.url) return sender.url.startsWith(api.runtime.getURL(''));
    // No tab and no URL: some engines omit sender.url for our own pages, notably
    // the Safari iOS bridge (see test/ios-sender-gate.test.js). The id check
    // above is what holds here.
    return true;
}

// --- Message handler --------------------------------------------------------

// A closed profile tab must never be focused again by a remembered id.
try { api.tabs?.onRemoved?.addListener((tabId) => { forgetProfileTab(api, tabId).catch(() => {}); }); } catch (_) { /* no tabs API */ }

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
            if (message.payload && prompt.pending?.uuid === message.payload) declineOpenPrompt();
            sendResponse(true);
            return true;
        case 'promptReady': {
            // The surface reads its request here. Nothing comes back for one that has
            // ended, or for any uuid but the open prompt's.
            const open = prompt.pending?.uuid === message.payload ? prompt.pending : null;
            clearPromptReady(message.payload);
            const effect = open && promptEffects.get(message.payload);
            sendResponse(open && (effect ? { payload: open.shown, effect: effect.value ?? { pending: true } } : { payload: open.shown }));
            return true;
        }
        case 'promptEffect': {
            // What the open prompt would change, once it has been worked out.
            const effect = prompt.pending?.uuid === message.payload ? promptEffects.get(message.payload) : null;
            if (!effect) { sendResponse(null); return true; }
            effect.promise.then(v => sendResponse(v), () => sendResponse(null));
            return true;
        }
        case 'holdPrompt':
            // Receiving this is the point: it keeps a suspendable background awake
            // while a prompt is open. See HOLD_NOTE_MS in permission.js. A tab
            // that is focused or being typed in also says so.
            if (message.inUse === true && prompt.pending?.uuid === message.payload
                && _sender?.tab?.id != null && _sender.tab.id === prompt.tabId) {
                prompt.inUseAt = Date.now();
            }
            sendResponse(prompt.pending?.uuid === message.payload);
            return true;
        case 'holdMinimizedPrompt':
            // The same keep-awake note, from the minimized FAB in the page. It has
            // no effect beyond arriving, and the reply says nothing about the prompt.
            sendResponse(true);
            return true;
        case 'permissionSheetCompromised':
            // The in-page consent sheet detected redress tampering and tore itself
            // down. Reopen the SAME pending prompt as a dedicated, redress-immune
            // tab. Gated to the tab that currently hosts the sheet so a page cannot
            // use this to spawn tabs or interfere with another tab's prompt.
            if (prompt.baseUrl && prompt.pending && _sender.tab && _sender.tab.id === prompt.sheetTabId) {
                const { uuid: escalated } = prompt.pending;
                const url = leaveSheet(escalated);
                showInTab(escalated, api.tabs.create({ url }));
            }
            sendResponse(true);
            return true;
        case 'allowed':
            resetAutoLock();
            {
                const answer = () => {
                    if (resolveBunkerApproval(message.payload, { approved: true, remember: !!message.remember })) {
                        sendResponse(true);
                        return;
                    }
                    finishPrompt(message.payload, complete(message), sendResponse);
                };
                // A destructive change is approved only with the "I understand"
                // tick, from a site or from a remote app alike.
                const effect = promptEffects.get(message.payload);
                if (!effect) {
                    answer();
                    return true;
                }
                effect.promise.then((v) => {
                    if (v?.destructive && message.understood !== true) { sendResponse(false); return; }
                    // Takes effect only when the signed event is stored (signEvent_, bunker onSigned).
                    if (v?.destructive && effect.ack) listStore().approve(effect.ack.pk, effect.ack.kind, effect.ack);
                    answer();
                }, () => sendResponse(false));
            }
            return true;
        case 'denied':
            resetAutoLock();
            if (resolveBunkerApproval(message.payload, { approved: false, remember: false })) {
                sendResponse(true);
                return true;
            }
            finishPrompt(message.payload, deny({ payload: message.payload, remember: message.remember }), sendResponse);
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
        case 'reindexSessionKeys':
            // Sender-gated above. Shift the index-keyed session cache after a
            // profile delete so higher profiles keep resolving without re-unlock.
            try {
                reindexSessionKeysAfterDelete(Number(message.payload));
                reindexSessionsAfterDelete(Number(message.payload));
                sendResponse({ success: true });
            } catch (e) {
                sendResponse({ success: false, error: e.message });
            }
            return true;
        case 'profilesMoved':
            // Sender-gated above. A sync merge in an extension page moved profiles.
            applyProfileMoves(message.payload);
            sendResponse({ success: true });
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
                const write = message.secret
                    ? copySecret(message.payload)
                    : navigator.clipboard.writeText(message.payload);
                write.then(() => sendResponse(true)).catch(() => sendResponse(false));
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
            lockAndDeclineHeld().then(() => sendResponse(true));
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
                    // Clear all extension data and reset to fresh state. The clear and
                    // the fresh default land in one locked step, so no profiles write
                    // can slip in between them.
                    await withProfilesLock(async () => {
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
                        approvalsInTab = false;
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
            // Only NostrKey's own pages count as activity; a note from a website's
            // tab (content script) never keeps the vault unlocked.
            if (isExtensionSender(_sender)) resetAutoLock();
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
        case 'getApprovalsInTab':
            sendResponse(approvalsInTab);
            return true;
        case 'setApprovalsInTab':
            approvalsInTab = message.payload === true;
            storage.set({ approvalsInTab });
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
                    const isTarget = await connectTarget(bi);
                    // Only the newest connect for a profile may be kept.
                    const token = crypto.randomUUID();
                    latestConnect.set(bi, token);
                    // The profile's current session stays in place until the
                    // new key has been compared and, if needed, confirmed.
                    const session = await openPendingSession(bunkerUrl);
                    const profiles = await getProfiles();
                    if (!isTarget(profiles[bi])) {
                        session.disconnect();
                        throw profileChangedError();
                    }
                    const storedUrl = redactBunkerUrl(bunkerUrl);
                    const warning = await connectWarning(profiles, bi, session.userPubkey);
                    if (warning) {
                        const pendingId = holdPendingConnect({ session, bi, storedUrl, isTarget, token });
                        return { success: true, needsConfirm: true, pendingId, remotePubkey: session.userPubkey, warning };
                    }
                    return await keepConnect({ session, bi, storedUrl, isTarget, token });
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'bunker.confirmConnect':
            reply(sendResponse, async () => {
                const pending = takePendingConnect(message.payload);
                if (!pending) return { success: false, error: 'This connection request expired. Please connect again.' };
                try {
                    return await keepConnect(pending);
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'bunker.cancelConnect':
            reply(sendResponse, async () => {
                takePendingConnect(message.payload)?.session.disconnect();
                return { success: true };
            });
            return true;
        case 'identityPubkeys':
            reply(sendResponse, async () => identityPubkeys(await getProfiles()));
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
                const { bunkerSessions } = await storage.get({ bunkerSessions: {} });
                return { connected: isSessionActive(bi), hasSession: !!bunkerSessions?.[bi] };
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
                    stopBunkerServer();
                    const bound = await activeProfile();
                    const pubkey = await getPubKey(bound);
                    // Security: restrict bunker relays to a user-derived allowlist
                    // (the NostrKey defaults + the active profile's own relays),
                    // never arbitrary caller-supplied relay URLs.
                    const relayUrls = await resolveBunkerRelays(message.payload?.relayUrls);
                    // BUNK-07: ≥128-bit CSPRNG connect secret (was ~60-bit UUID slice).
                    const secret = generateSecret();
                    const server = new BunkerServer({ relayUrls, userPubkey: pubkey, secret });
                    // BUNK-01/T0-7: route ungranted/Tier-B bunker requests through
                    // the extension-owned approval surface.
                    await server.start({ getPrivKey: bunkerServerKey, requestApproval: requestBunkerApproval, effectOf: bunkerEffectOf, onSigned: keepListVersion });
                    activeBunkerServer = server;
                    bunkerServerIdentity = { index: bound.index, pubkey };
                    return { success: true, uri: server.getConnectionString() };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'bunkerServer.stop':
            reply(sendResponse, async () => {
                stopBunkerServer();
                return { success: true };
            });
            return true;
        case 'bunkerServer.status':
            reply(sendResponse, async () => {
                await bunkerServerForActiveProfile();
                return {
                    active: !!activeBunkerServer?.active,
                    uri: activeBunkerServer?.getConnectionString() || null,
                    clientCount: activeBunkerServer?.clientCount || 0,
                };
            });
            return true;
        case 'bunkerServer.connections':
            // BUNK-08: enumerate live per-connection records for a revoke UI.
            reply(sendResponse, async () => {
                await bunkerServerForActiveProfile();
                return { connections: activeBunkerServer?.listConnections() || [] };
            });
            return true;
        case 'bunkerServer.revoke':
            // BUNK-08: revoke a single connection (others unaffected).
            reply(sendResponse, async () => {
                await bunkerServerForActiveProfile();
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
                    if (path === API_KEYS_PATH) return { success: false, error: RESERVED_PATH_ERROR };
                    const pubkey = await getPubKey();
                    const encrypted = await nip44Encrypt({ pubKey: pubkey, plainText: content });
                    const unsigned = buildVaultEvent(path, encrypted);

                    const pi = await getProfileIndex();
                    const profile = await getProfile(pi);
                    let signed;
                    if (profile.type === 'bunker') {
                        const session = await getOrCreateSession(pi);
                        signed = await signRemotely(session, profile, unsigned);
                    } else {
                        const sk = await getPrivKey();
                        signed = await finalizeEvent(unsigned, sk);
                    }

                    await withRelays('write', async (relays) => {
                        for (const relay of relays) {
                            try { void relay.publish(signed); } catch (_) {} // result not awaited: reply is not held for relay OKs
                        }
                    });
                    return { success: true, eventId: signed.id, createdAt: signed.created_at };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'profile.fetch':
            reply(sendResponse, () => fetchIdentityProfile(message.payload?.pubkey));
            return true;
        case 'profile.publish':
            reply(sendResponse, () => publishIdentityProfile(message.payload?.pubkey, message.payload));
            return true;
        case 'profile.history':
            reply(sendResponse, () => identityHistory(message.payload?.pubkey));
            return true;
        case 'profile.restorePreview':
            reply(sendResponse, () => restorePreview(message.payload?.pubkey, message.payload?.kind, message.payload?.id));
            return true;
        case 'profile.restore':
            reply(sendResponse, () => restoreVersion(message.payload?.pubkey, message.payload));
            return true;
        case 'profile.checkAddresses':
            reply(sendResponse, () => checkIdentityAddresses(message.payload?.pubkey, message.payload?.content));
            return true;
        case 'vault.fetch':
            reply(sendResponse, async () => {
                try {
                    const pubkey = await getPubKey();
                    const filter = buildVaultFilter(pubkey);
                    const allEvents = await pullEvents([filter], 'vault');

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
                        if (!parsed || parsed.path === API_KEYS_PATH) continue;
                        const existing = byDtag.get(parsed.path);
                        if (!existing || parsed.createdAt > existing.parsed.createdAt) {
                            byDtag.set(parsed.path, { event, parsed });
                        }
                    }

                    // Drop documents the author has deleted with kind 5 since.
                    // The kind 5 request is scoped to the addresses and ids of
                    // these documents (plus the paths this device holds), so
                    // a relay's result cap cannot crowd a vault deletion out.
                    const idToDtag = {};
                    for (const { parsed } of byDtag.values()) idToDtag[parsed.eventId] = vaultDtag(parsed.path);
                    const localPaths = Array.isArray(message.payload?.paths)
                        ? message.payload.paths.filter(p => typeof p === 'string' && p !== API_KEYS_PATH)
                        : [];
                    const dtags = [...new Set([...byDtag.keys(), ...localPaths])].map(vaultDtag);
                    const deletions = await pullDeletions(pubkey, dtags, Object.keys(idToDtag), 'vault-del');
                    const relayTombstones = deletionTombstones(deletions, pubkey, idToDtag);
                    for (const [path, { parsed }] of [...byDtag.entries()]) {
                        if (isTombstoned(relayTombstones, vaultDtag(path), parsed.createdAt)) byDtag.delete(path);
                    }
                    // Deletions by path, so a page can drop a copy it already holds.
                    const deleted = {};
                    for (const [dtag, ts] of Object.entries(relayTombstones)) {
                        const path = dtag.startsWith('nostrkey:') ? dtag.slice('nostrkey:'.length) : null;
                        if (path && path !== API_KEYS_PATH) deleted[path] = ts;
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
                    return { success: true, documents, deleted };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });
            return true;
        case 'vault.delete':
            reply(sendResponse, async () => {
                try {
                    const { path, eventId } = message.payload;
                    if (path === API_KEYS_PATH) return { success: false, error: RESERVED_PATH_ERROR };
                    const unsigned = buildVaultDeletion(eventId, path, await getPubKey());

                    const pi = await getProfileIndex();
                    const profile = await getProfile(pi);
                    let signed;
                    if (profile.type === 'bunker') {
                        const session = await getOrCreateSession(pi);
                        signed = await signRemotely(session, profile, unsigned);
                    } else {
                        const sk = await getPrivKey();
                        signed = await finalizeEvent(unsigned, sk);
                    }

                    await withRelays('write', async (relays) => {
                        for (const relay of relays) {
                            try { void relay.publish(signed); } catch (_) {} // result not awaited: reply is not held for relay OKs
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
                    const unsigned = buildVaultEvent(API_KEYS_PATH, encrypted);

                    const pi = await getProfileIndex();
                    const profile = await getProfile(pi);
                    let signed;
                    if (profile.type === 'bunker') {
                        const session = await getOrCreateSession(pi);
                        signed = await signRemotely(session, profile, unsigned);
                    } else {
                        const sk = await getPrivKey();
                        signed = await finalizeEvent(unsigned, sk);
                    }

                    await withRelays('write', async (relays) => {
                        for (const relay of relays) {
                            try { void relay.publish(signed); } catch (_) {} // result not awaited: reply is not held for relay OKs
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
                        '#d': [API_KEYS_DTAG],
                    };
                    const allEvents = await pullEvents([filter], 'apikeys');

                    // T1-3: verify author + kind + exact d-tag + id + sig before
                    // trusting; dedupe by id. Rejects relay-injected / tampered /
                    // created_at-rolled events. Then take latest by created_at.
                    let latest = null;
                    const seenIds = new Set();
                    for (const event of allEvents) {
                        if (seenIds.has(event.id)) continue;
                        seenIds.add(event.id);
                        if (!(await verifyStoredEvent(event, {
                            pubkey, kind: 30078, dTag: API_KEYS_DTAG,
                        }))) continue;
                        if (!latest || event.created_at > latest.created_at) {
                            latest = event;
                        }
                    }

                    if (latest) {
                        const deletions = await pullDeletions(pubkey, [API_KEYS_DTAG], [latest.id], 'apikeys-del');
                        const relayTombstones = deletionTombstones(deletions, pubkey, { [latest.id]: API_KEYS_DTAG });
                        if (isTombstoned(relayTombstones, API_KEYS_DTAG, latest.created_at)) latest = null;
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
                    const unsigned = buildVaultDeletion(eventId, API_KEYS_PATH, await getPubKey());

                    const pi = await getProfileIndex();
                    const profile = await getProfile(pi);
                    let signed;
                    if (profile.type === 'bunker') {
                        const session = await getOrCreateSession(pi);
                        signed = await signRemotely(session, profile, unsigned);
                    } else {
                        const sk = await getPrivKey();
                        signed = await finalizeEvent(unsigned, sk);
                    }

                    await withRelays('write', async (relays) => {
                        for (const relay of relays) {
                            try { void relay.publish(signed); } catch (_) {} // result not awaited: reply is not held for relay OKs
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
                    approvalsInTab: false,
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
                    if (data.profiles) data.profiles = withoutNeverGranted(redactProfiles(data.profiles));
                    // Off unless the backup says on. Written back so a value missing
                    // from the backup cannot leave a different one in storage.
                    data.nostrAccessWhileLocked = data.nostrAccessWhileLocked === true;
                    data.approvalsInTab = data.approvalsInTab === true;
                    // Write all backed-up keys to storage (a whole replace, in order
                    // with every other profiles write).
                    await withProfilesLock(() => storage.set(data));
                    const restoredKeysBefore = Array.isArray(data.profiles) ? keySnapshot(data.profiles) : [];
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
                    nostrAccessWhileLocked = data.nostrAccessWhileLocked;
                    blockCrossOriginFrames = data.blockCrossOriginFrames !== false;
                    approvalsInTab = data.approvalsInTab;
                    if (typeof data.autoLockMinutes === 'number') {
                        autoLockTimeout = data.autoLockMinutes * 60 * 1000;
                    }
                    // Populate session key cache
                    sessionKeys.clear();
                    // Restored data.profiles can predate pubKey caching and carry
                    // pubKey='' verbatim. sessionKeys is keyed by profile INDEX, and a
                    // later mid-list deleteProfile() splices the array WITHOUT
                    // reindexing this Map — so an entry cached here without a pubKey
                    // would slip past the B1 stale-cache guard (which needs a pubKey to
                    // detect a wrong-identity key). Co-populate pubKey for every profile
                    // whose key we cache, exactly as unlockSession does (~line 842), so
                    // NO sessionKeys entry is ever created without a verifiable pubKey.
                    let restoredPubKeyNeedsSave = false;
                    if (Array.isArray(data.profiles)) {
                        for (let i = 0; i < data.profiles.length; i++) {
                            const p = data.profiles[i];
                            if (p.type === 'bunker' || !p.privKey) continue;
                            let hex;
                            if (isEncryptedBlob(p.privKey)) {
                                try {
                                    hex = await decryptBlob(p.privKey, password);
                                } catch (_) {
                                    continue; // undecryptable blob — cache nothing for this slot
                                }
                            } else {
                                hex = p.privKey;
                            }
                            sessionKeys.set(i, hex);
                            if (!p.pubKey && hex) {
                                try {
                                    p.pubKey = getPublicKeySync(hex);
                                    restoredPubKeyNeedsSave = true;
                                } catch (e) {
                                    console.error(`Failed to cache pubKey for restored profile ${i}:`, e);
                                }
                            }
                        }
                    }
                    // storage.set(data) above persisted the profiles verbatim; write
                    // back the co-populated pubKeys so the on-disk profiles match the
                    // cache (and stay verifiable after a reload).
                    if (restoredPubKeyNeedsSave) {
                        await applyKeyChanges(keyChangesSince(restoredKeysBefore, data.profiles));
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
            // non-extension sender via SENSITIVE_KINDS.
            validations[uuid] = sendResponse;
            if (Object.keys(validations).length === 1) {
                pendingQueue = { total: 0, processed: 0 };
            }
            pendingQueue.total++;
            // ask() arms the auto-decline timer once a surface is shown.
            // The site is what the browser says sent this, never what the message says.
            ask(uuid, { kind: message.kind, payload: message.payload, host: senderOrigin(_sender) }).catch((e) => {
                log(`Request failed: ${e?.message}`);
                settleRequest(uuid, { error: 'request_failed', message: 'This request could not be shown. Please try again.' });
            });
            return true;
        default:
            return false;
    }
});

/**
 * What a connect holds on to while it waits on a remote signer.
 *
 * @param {number} index
 * @returns {Promise<(profile: *) => boolean>} is this still the profile asked for?
 */
// Connections waiting on the lookalike warning. Nothing here is the profile's
// session until it is confirmed.
const pendingConnects = new Map();
const PENDING_CONNECT_MS = 60 * 1000;
// profileIndex -> token of the newest connect started for it.
const latestConnect = new Map();

function holdPendingConnect(pending) {
    // A newer connect for the same profile replaces any older one still waiting.
    for (const [oldId, old] of pendingConnects) {
        if (old.bi === pending.bi) takePendingConnect(oldId)?.session.disconnect();
    }
    const id = crypto.randomUUID();
    pending.timer = setTimeout(() => takePendingConnect(id)?.session.disconnect(), PENDING_CONNECT_MS);
    pendingConnects.set(id, pending);
    return id;
}

function takePendingConnect(id) {
    const pending = pendingConnects.get(id);
    if (!pending) return null;
    pendingConnects.delete(id);
    clearTimeout(pending.timer);
    return pending;
}

/**
 * Each profile's hex pubkey: the cached one, else derived from a local key that
 * is unlocked now. Null where neither is available. Never returns a secret.
 */
async function identityPubkeys(profiles) {
    return Promise.all((profiles || []).map(async (p, i) => {
        const id = identityOf(p);
        if (id) return String(id).toLowerCase();
        if (!p || p.type === 'bunker') return null;
        try { return getPublicKeySync(await getPlaintextPrivKey(i, p)); } catch { return null; }
    }));
}

/** Warning text when the signer's key looks like another identity here or replaces this profile's key. */
async function connectWarning(profiles, bi, remotePubkey) {
    const toNpub = (hex) => { try { return hex ? nip19.npubEncode(hex) : null; } catch { return null; } };
    const candidate = toNpub(remotePubkey);
    const known = (await identityPubkeys(profiles)).map(toNpub).filter(Boolean);
    const previous = toNpub(profiles[bi]?.remotePubkey);
    return newKeyWarning(candidate, checkNewKey(candidate, known, { previous }), { previous });
}

async function keepConnect({ session, bi, storedUrl, isTarget, token }) {
    if (latestConnect.get(bi) !== token) {
        session.disconnect();
        throw new Error('A newer connection for this profile replaced this one. Please connect again.');
    }
    await commitSession(bi, session, async () => isTarget(await getProfile(bi)));
    const remotePubkey = session.userPubkey;
    let stillTarget = false;
    await updateProfiles((profiles) => {
        if (!isTarget(profiles[bi])) return false;
        stillTarget = true;
        // Grants belong to an identity, not to a slot in the list.
        if (!samePubkey(profiles[bi].remotePubkey, remotePubkey)) profiles[bi].hosts = {};
        profiles[bi].remotePubkey = remotePubkey;
        profiles[bi].bunkerUrl = storedUrl;
    });
    if (!stillTarget) {
        await discardSession(session);
        throw profileChangedError();
    }
    if (latestConnect.get(bi) === token) latestConnect.delete(bi);
    return { success: true, remotePubkey };
}

async function connectTarget(index) {
    const epoch = indexEpoch(index);
    const asked = await getProfile(index);
    if (asked?.type !== 'bunker') throw new Error('This is not a remote signer profile.');
    const identity = identityOf(asked);
    return (profile) => indexEpoch(index) === epoch
        && profile?.type === 'bunker'
        && samePubkey(identityOf(profile), identity);
}

function stopBunkerServer() {
    activeBunkerServer?.stop();
    activeBunkerServer = null;
    bunkerServerIdentity = null;
}

/**
 * A running bunker server serves the identity it was started for, while that is
 * the active one. Once it is not, the server stops: its clients connected to that
 * identity and reconnect by a new connection string.
 *
 * @returns {Promise<?{index: number, profile: object}>} the profile it serves, if running
 */
async function bunkerServerForActiveProfile() {
    if (!activeBunkerServer) return null;
    const pin = bunkerServerIdentity;
    const active = await activeProfile();
    if (active.index === pin?.index && await identityAt(active.index, active.profile) === pin.pubkey) {
        return active;
    }
    stopBunkerServer();
    return null;
}

async function bunkerServerKey() {
    const bound = await bunkerServerForActiveProfile();
    if (!bound) throw identityError();
    return privKeyOf(bound);
}

async function forceRelease() {
    const { tabId } = prompt;
    if (tabId !== null) {
        try {
            // If the previous prompt is still open, then this won't do anything.
            // If it's not open, it will throw an error and get caught.
            await api.tabs.get(tabId);
        } catch (error) {
            // If the tab is closed, but somehow escaped our event handling, we can clean it up here
            // before attempting to open the next tab.
            // A tab someone is using right now is not given up on.
            if (prompt.tabId === tabId && Date.now() - prompt.inUseAt >= PROMPT_IN_USE_MS) {
                prompt.tabId = null;
                declineOpenPrompt();
            }
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
const BUNKER_DECLINED = Object.freeze({ approved: false, remember: false });

function resolveBunkerApproval(uuid, decision) {
    const entry = bunkerApprovals[uuid];
    if (!entry) return false;
    delete bunkerApprovals[uuid];
    releaseIfCurrent(uuid);
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
async function requestBunkerApproval({ clientPubkey, method, kind, unsigned, rememberable, effect = null }) {
    // Map the NIP-46 method to the permission page's vocabulary so it renders a
    // meaningful prompt (and, for sign_event, the decoded event preview).
    let permKind = method;
    let event = false;
    if (method === 'sign_event') { permKind = 'signEvent'; event = unsigned || { kind }; }
    else if (method === 'nip04_encrypt') permKind = 'nip04.encrypt';
    else if (method === 'nip04_decrypt') permKind = 'nip04.decrypt';
    else if (method === 'nip44_encrypt') permKind = 'nip44.encrypt';
    else if (method === 'nip44_decrypt') permKind = 'nip44.decrypt';

    if (!fitsPrompt(event)) return BUNKER_DECLINED;

    const shortPk = typeof clientPubkey === 'string' ? clientPubkey.slice(0, 12) : 'unknown';
    const host = `bunker client ${shortPk}… (claimed — not verified)`;

    await forceRelease();
    const release = await prompt.mutex.acquire();

    // This waited its turn, so the server may no longer be serving the identity
    // the client connected to. A prompt already showing carries on as that identity.
    let serving = null;
    try {
        serving = await bunkerServerForActiveProfile();
    } finally {
        if (!serving) release();
    }
    if (!serving) return BUNKER_DECLINED;
    prompt.release = release;

    const parsedAt = Math.floor(Date.now() / 1000);
    const { profile: shownProfile } = serving;

    return new Promise((resolve) => {
        const uuid = crypto.randomUUID();
        let settled = false;
        const finish = (val) => {
            if (settled) return;
            settled = true;
            resolve(val);
        };
        bunkerApprovals[uuid] = { resolve: finish };
        prompt.pending = { uuid, kind: permKind, host, bunker: true, shown: JSON.stringify(event || false) };
        // Worked out by the server before it asked; shown with its tick as for a site.
        if (effect) promptEffects.set(uuid, { value: effect, promise: Promise.resolve(effect), ack: ackKeyOf(shownProfile, event) });
        armPromptReady(uuid);

        const qs = new URLSearchParams({
            uuid,
            kind: permKind,
            host,
            queuePosition: 1,
            queueTotal: 1,
            inbound: '1',
            rememberable: rememberable ? '1' : '0',
            grantKey: grantKeyFor(permKind, permKind === 'signEvent' ? event : {}, parsedAt) || '',
            requestRisk: blossomRisk(event, parsedAt),
            parsedAt: String(parsedAt),
            profileName: shownProfile?.name || '',
            profileType: shownProfile?.type || 'local',
            lockedGrant: '0',
        });

        api.tabs.getCurrent()
            .then(tab => api.tabs.create({
                url: api.runtime.getURL(`permission/permission.html?${qs.toString()}`),
                openerTabId: tab?.id,
            }))
            .then(p => setPromptTab(uuid, p.id))
            .catch(() => {});

        // Fail closed if the user never answers.
        setTimeout(() => resolveBunkerApproval(uuid, BUNKER_DECLINED), 60_000);
    });
}

/**
 * Answer a request and forget it. No-op once it has been answered.
 */
function settleRequest(uuid, response) {
    const sendResponse = validations[uuid];
    if (!sendResponse) return;
    takeHeld(uuid);
    delete validations[uuid];
    if (Object.keys(validations).length === 0) {
        pendingQueue = { total: 0, processed: 0 };
    }
    sendResponse(response);
}

/**
 * Take a request answered before its turn at the prompt out of the total the
 * consent UI shows. Comes before the answer, because answering the last request
 * resets the queue.
 */
function shortenQueue() {
    pendingQueue.total = Math.max(0, pendingQueue.total - 1);
}

function leaveQueue(uuid, response) {
    shortenQueue();
    settleRequest(uuid, response);
}

// A media server delete signs with no prompt only when the site is opted in for
// it in the connected sites list, and never while locked.
const BLOSSOM_DELETE_KEY = 'signEvent:24242:delete';

// Requests that need the key. getPubKey, getRelays and addRelay work from cached
// data, so they never depend on the lock.
const needsPrivateKey = (method) => method !== 'getPubKey' && method !== 'getRelays' && method !== 'addRelay';

/**
 * May a stored allow be acted on with no prompt right now? While locked, a remote
 * signer profile needs the "while locked" setting and a local one also needs its
 * key still in memory. A request bigger than its whole limit asks. An opted-in
 * delete never signs with no prompt while locked.
 */
async function grantMayAutoSign(profile, pi, method, key, payload) {
    if (grantSlots(key, payload, Math.floor(Date.now() / 1000)) > grantLimit(key)) return false;
    if (!needsPrivateKey(method)) return true;
    if (!(await checkLockState())) return true;
    if (key === BLOSSOM_DELETE_KEY) return false;
    if (!nostrAccessWhileLocked) return false;
    return profile?.type === 'bunker' || sessionKeys.has(pi);
}

/**
 * An opted-in delete that was not signed with no prompt, because NostrKey was
 * locked or the site was over its limit, is listed in event history as refused.
 * Nothing is signed: the entry holds the request and why it was refused.
 */
async function logRefusedDelete(uuid, host, key, payload, reason) {
    if (key !== BLOSSOM_DELETE_KEY) return;
    try {
        const { id: _id, sig: _sig, ...unsigned } = payload ?? {};
        await saveEvent({
            event: { ...unsigned, id: `refused-${uuid}` },
            metadata: { host, signed_at: Math.round(Date.now() / 1000), refused: reason },
        });
    } catch (_) { /* history is a record, never a reason to fail the reply */ }
}

// Requests answered from a grant, per site and grant: `${host} ${key}` → timestamps.
const grantBuckets = new Map();

/**
 * Take this request's slots in the grant limit. A request takes one, and one that
 * does not fit takes none. An opted-in delete takes one per blob it names.
 *
 * @returns {boolean} false if the request is over the limit
 */
function takeGrantSlots(host, key, payload) {
    const now = Date.now();
    const slots = grantSlots(key, payload, Math.floor(now / 1000));
    const bucket = `${host} ${key}`;
    const recent = (grantBuckets.get(bucket) || []).filter(t => now - t < GRANT_RATE.windowMs);
    const fits = recent.length + slots <= grantLimit(key);
    if (fits) for (let i = 0; i < slots; i++) recent.push(now);
    grantBuckets.set(bucket, recent);
    return fits;
}

/** The stored answer for this request on this profile: 'allow', 'deny' or 'ask'. */
async function storedAnswer(host, key, index) {
    if (!key) return 'ask';
    const answer = await getPermission(host, key, index);
    if (answer !== 'allow' || !isNeverGranted(key)) return answer;
    // Only a list opt-in answers for these; any other allow under them asks.
    return isOptInKey(key) && isOptedIn(key, await getStoredGrant(host, key, index)) ? 'allow' : 'ask';
}

/** A request this serious is never answered from a sheet the page sits around. */
function needsOwnTab(kind, payload, now) {
    return approvalsInTab || kind === 'signEvent'
        && (describeKind(payload.kind).risk === 'danger' || blossomRisk(payload, now) === 'danger');
}

const GRANT_LIMITED = { error: 'rate_limited', message: 'Too many requests. Please wait a moment.' };

/**
 * Is this request refused because the vault is locked? Local profiles only: a
 * remote signer has no local key to protect. While locked, a key-bearing request
 * goes ahead only with "access while locked" on and that key still in memory.
 * A refusal shows the locked sheet in the active tab.
 */
async function lockedOut(profile, pi, kind) {
    if (profile?.type === 'bunker' || !needsPrivateKey(kind)) return false;
    if (!(await checkLockState())) return false;
    if (nostrAccessWhileLocked && sessionKeys.has(pi)) return false;
    const isFirstUnlock = sessionKeys.size === 0;
    try {
        const [activeTab] = await api.tabs.query({ active: true, currentWindow: true });
        if (activeTab?.id) {
            api.tabs.sendMessage(activeTab.id, { kind: 'showLockedSheet', firstUnlock: isFirstUnlock }).catch(() => {});
        }
    } catch (_) {}
    return true;
}

// What each open prompt would change: uuid -> { value, promise }.
const promptEffects = new Map();

// How long a prompt waits on relays for the current list.
const EFFECT_FETCH_MS = 3000;

/**
 * The identity's current version of this kind, newest of what relays return
 * (verified, 3 s cap), the local list store and event history. Null when none.
 */
async function currentVersionOf(pk, kind, profile) {
    const store = listStore();
    const candidates = [];
    let fetched = null;
    try {
        const urls = await selectRelayUrls('read', await get('profiles'), await getProfileIndex(), { pubkey: pk });
        fetched = (await fetchLatest({ pubkey: pk, kind, urls, openRelay: (u) => new RelayConnection(u), timeoutMs: EFFECT_FETCH_MS })).event;
    } catch (_) { /* no relays answered */ }
    if (fetched) { candidates.push(fetched); await store.put(fetched, { seen: true }).catch(() => {}); }
    let kept = null;
    if (kind === 10002 && profile?.relayListEvent && await isOwnEvent(profile.relayListEvent, pk, 10002)) {
        kept = profile.relayListEvent;
        candidates.push(kept);
    }
    const stored = await store.get(pk, kind);
    if (stored) candidates.push(stored);
    const fromHistory = kind === 0 ? await newestEventOf(pk, 0) : null;
    if (fromHistory) candidates.push(fromHistory);
    const event = pickNewest(candidates);
    if (event) {
        const basis = event === fetched || event === kept ? 'relays'
            : event === fromHistory && event !== stored ? 'history' : 'local';
        return { event, basis };
    }
    if (kind === 10002 && Array.isArray(profile?.relays) && profile.relays.length) {
        return { relays: profile.relays, basis: 'local' };
    }
    return null;
}

// Kinds where a slow shrink is checked against the version from about a day ago.
const SHRINK_KINDS = new Set([3, 10000, 10002]);

/** Which (identity, kind) a ticked approval resets the shrink baseline for. */
function ackKeyOf(profile, event) {
    const pk = (identityOf(profile) || '').toLowerCase();
    if (!pk || !event || !SHRINK_KINDS.has(event.kind)) return null;
    return { pk, kind: event.kind, tags: event.tags, content: event.content };
}

/** What a remote app's event would change for the identity the bunker serves. */
async function bunkerEffectOf(unsigned) {
    if (!unsigned || !EFFECT_KINDS.has(unsigned.kind)) return null;
    const profile = bunkerServerIdentity ? await getProfile(bunkerServerIdentity.index) : null;
    return effectFor(unsigned, profile);
}

/**
 * Keep a list event in the device history. `seen`: relays returned it or
 * accepted it; a copy only signed here is kept as not seen. Never throws.
 */
async function keepListVersion(event, { seen = false } = {}) {
    if (event && LIST_KINDS.has(event.kind)) await listStore().put(event, { seen }).catch(() => {});
}

/** What signing this event would change for this profile's identity. Never throws. */
async function effectFor(event, profile) {
    try {
        if (event.kind === 5) {
            const ids = (event.tags || []).filter(t => Array.isArray(t) && t[0] === 'e' && typeof t[1] === 'string').map(t => t[1].toLowerCase());
            return describeEffect(5, event, null, { historyKinds: await eventKindsById(ids) });
        }
        const pk = (identityOf(profile) || '').toLowerCase();
        const current = pk ? await currentVersionOf(pk, event.kind, profile) : null;
        const baseline = pk && SHRINK_KINDS.has(event.kind) ? await listStore().baseline(pk, event.kind) : null;
        return describeEffect(event.kind, event, current, { baseline });
    } catch (e) {
        log(`Could not work out the effect: ${e?.message}`);
        try { return describeEffect(event.kind, event, null); } catch (_) { return null; }
    }
}

async function ask(uuid, { kind, host, payload }) {
    // Set once this request holds the prompt mutex.
    let ownRelease = null;
    const askedAt = Date.now();

    try {
        await waitForStartup();

        // Answer a malformed request, or one with no site behind it, up front.
        if (!host || !validateRequest(kind, payload)) {
            leaveQueue(uuid, { error: 'invalid_request', message: 'This request is not valid.' });
            return;
        }

        // An auth event for the wrong place is refused. One for another site
        // signs from a grant only if it was remembered for that exact target,
        // and is shown with its target named. NostrKey's own relay always asks.
        const authCheck = kind === 'signEvent'
            ? checkAuthTarget(payload, host, Math.floor(Date.now() / 1000), DEFAULT_BUNKER_RELAYS)
            : { verdict: 'ok', target: null };
        if (authCheck.verdict === 'refuse') {
            leaveQueue(uuid, { error: 'bad_auth_target', message: 'NostrKey: auth event for the wrong place.' });
            return;
        }
        const crossTarget = authCheck.reason === 'cross_origin' ? authCheck.target : null;
        const keyFits = (k) => !crossTarget || parseGrantKey(k)?.target === crossTarget;
        const noGrant = authCheck.reason === 'own_relay';
        const authTarget = authCheck.reason === 'cross_origin' || payload?.kind === RELAY_AUTH_KIND
            ? authCheck.target || '' : '';

        const key = grantKeyFor(kind, payload, Math.floor(Date.now() / 1000), host);
        const crossSite = noGrant || !keyFits(key);
        holdRequest(uuid, {
            host,
            method: kind,
            payload,
            key,
            rememberable: !crossSite && canRemember(key, kind),
            authTarget: crossTarget,
            profileIndex: null,
            pubkey: null,
            askedAt: Date.now(),
        });

        // A stored answer needs no prompt, so it does not wait for one or touch
        // the prompt state: no mutex, no prompt limits.
        const pi = await getProfileIndex();
        const profile = await getProfile(pi);
        const stored = await storedAnswer(host, key, pi);

        if (stored === 'deny') {
            shortenQueue();
            await deny({ payload: uuid });
            return;
        }

        // A list or profile change is worked out first: a destructive one asks
        // even with a grant (Decision 1).
        const previews = kind === 'signEvent' && EFFECT_KINDS.has(payload?.kind);
        let effect = null;
        if (stored === 'allow' && previews) effect = await effectFor(payload, profile);

        if (stored === 'allow' && !crossSite && !effectBlocksGrant(effect) && await grantMayAutoSign(profile, pi, kind, key, payload)) {
            if (!takeGrantSlots(host, key, payload)) {
                await logRefusedDelete(uuid, host, key, payload, 'rate_limited');
                leaveQueue(uuid, GRANT_LIMITED);
                return;
            }
            stampHeld(uuid, await identityStamp(pi, profile));
            shortenQueue();
            // A site request is never activity: only the person's own actions keep
            // NostrKey unlocked, so a remembered grant neither resets the auto-lock
            // timer nor clears a held prompt's deadline.
            await complete({ payload: uuid, remember: false });
            return;
        }

        if (stored === 'allow' && key === BLOSSOM_DELETE_KEY && await checkLockState()) {
            await logRefusedDelete(uuid, host, key, payload, 'locked');
        }

        // Everything else may prompt.
        if (!fitsPrompt(payload)) {
            leaveQueue(uuid, { error: 'request_too_large', message: 'This request is too large to show for approval.' });
            return;
        }

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
                leaveQueue(uuid, { error: 'rate_limited', message: 'Too many requests. Please wait a moment.' });
                return;
            }
        }

        // If the extension is locked, reject signing/encryption requests (local
        // profiles only). A remote signer profile has no local key to protect,
        // and a grant on one was held back above, so it asks instead.
        if (await lockedOut(profile, pi, kind)) {
            leaveQueue(uuid, LOCKED_REPLY);
            return;
        }

        // Rate limit permission prompts per host
        if (isRateLimited(host)) {
            leaveQueue(uuid, { error: 'rate_limited', message: 'Too many requests. Please wait.' });
            log(`Rate limited: ${host}`);
            return;
        }

        await forceRelease(); // Clean up previous tab if it closed without cleaning itself up
        ownRelease = await prompt.mutex.acquire();
        prompt.release = ownRelease;

        if (Date.now() - askedAt > PROMPT_WAIT_MS) {
            settleRequest(uuid, { error: 'timed_out', message: 'This request waited too long.' });
            ownRelease();
            return;
        }

        pendingQueue.processed++;
        const queuePosition = pendingQueue.processed;
        const queueTotal = pendingQueue.total;

        // The answer may have been stored while this request waited its turn. The
        // same rules apply here, and the prompt state was never set, so the release
        // stays a direct one.
        const shownIndex = await getProfileIndex();
        const shownProfile = await getProfile(shownIndex);
        const shownAt = Math.floor(Date.now() / 1000);
        const shownKey = grantKeyFor(kind, payload, shownAt, host);
        if (shownKey !== key) {
            stampHeld(uuid, { key: shownKey, rememberable: !noGrant && keyFits(shownKey) && canRemember(shownKey, kind) });
        }
        const permission = await storedAnswer(host, shownKey, shownIndex);
        const shownStamp = await identityStamp(shownIndex, shownProfile);

        // Answered while it waited (a lock declines everything held).
        if (!validations[uuid]) {
            ownRelease();
            return;
        }
        // The vault may have locked while this waited its turn. Check again, for
        // the identity it would now be shown for.
        if (await lockedOut(shownProfile, shownIndex, kind)) {
            if (permission === 'allow') await logRefusedDelete(uuid, host, shownKey, payload, 'locked');
            settleRequest(uuid, LOCKED_REPLY);
            ownRelease();
            return;
        }
        if (previews && (!effect || shownIndex !== pi)) {
            effect = permission === 'allow' ? await effectFor(payload, shownProfile) : null;
        }
        if (permission === 'allow' && !noGrant && keyFits(shownKey) && !effectBlocksGrant(effect) && await grantMayAutoSign(shownProfile, shownIndex, kind, shownKey, payload)) {
            if (takeGrantSlots(host, shownKey, payload)) {
                stampHeld(uuid, shownStamp);
                await complete({ payload: uuid, remember: false });
            } else {
                await logRefusedDelete(uuid, host, shownKey, payload, 'rate_limited');
                settleRequest(uuid, GRANT_LIMITED);
            }
            ownRelease();
            return;
        }

        if (permission === 'deny') {
            await deny({ payload: uuid });
            ownRelease();
            return;
        }

        // The answer and any remembered choice belong to the identity shown.
        stampHeld(uuid, { ...shownStamp, shownForActive: true });

        // Security: consent is ALWAYS collected in an extension-owned surface
        // (permission/permission.html), never via an in-page sheet. A web page
        // controls its own DOM, so any Allow/Deny button rendered inside the page
        // could be clicked by the page itself (no isTrusted guarantee). The
        // extension permission tab runs in the extension origin and can only be
        // driven by a real user, and its allowed/denied messages are gated behind
        // isExtensionSender (SENSITIVE_KINDS).
        // Arm the auto-decline timer now that we are actually going to prompt, and
        // stamp the deadline into the URL so the consent UI shows a matching countdown.
        armPromptTimeout(uuid);
        // Only an event is shown. Text to encrypt or decrypt stays here.
        prompt.pending = { uuid, kind, host, shown: JSON.stringify(kind === 'signEvent' ? payload : false) };
        if (previews) {
            // Shown on the surface when ready; "Checking..." until then.
            const entry = { value: effect, promise: null, ack: kind === 'signEvent' ? ackKeyOf(shownProfile, payload) : null };
            entry.promise = effect ? Promise.resolve(effect) : effectFor(payload, shownProfile);
            entry.promise.then((v) => { entry.value = v; });
            promptEffects.set(uuid, entry);
        }
        armPromptReady(uuid);

        let qs = new URLSearchParams({
            uuid,
            kind,
            host,
            queuePosition,
            queueTotal,
            ttl: String(PROMPT_TIMEOUT_MS),
            rememberable: !noGrant && keyFits(shownKey) && canRemember(shownKey, kind) ? '1' : '0',
            authTarget: authTarget.replace(/^[a-z]+:\/\//i, ''),
            authKind: authTarget ? (payload.kind === RELAY_AUTH_KIND ? 'relay' : 'site') : '',
            maxDuration: rememberLimit(shownKey, kind) || '',
            grantKey: shownKey || '',
            requestRisk: blossomRisk(payload, shownAt),
            parsedAt: String(shownAt),
            profileName: shownProfile?.name || '',
            profileType: shownProfile?.type || 'local',
            lockedGrant: permission === 'allow' && needsPrivateKey(kind) && await checkLockState() ? '1' : '0',
        });
        const baseUrl = api.runtime.getURL(`permission/permission.html?${qs.toString()}`);
        prompt.baseUrl = baseUrl; // deadline appended per-surface so escalation can refresh it
        const url = `${baseUrl}&deadline=${prompt.deadline}`;

        // Prefer an in-page dimmed bottom sheet in the requesting tab (informed
        // consent — the site stays visible behind a 50% backdrop). The sheet is an
        // EXTENSION-OWNED iframe, so the page still can't drive Allow/Deny.
        // Fall back to a dedicated tab for contexts a content script can't reach
        // (chrome://, PDF viewer, and the NIP-46 bunker flow which has no page), for
        // the most serious requests on every browser, and for every request if the
        // user chose that in Settings.
        let sheetTab = null;
        let requestingTab = null;
        try {
            const [activeTab] = await api.tabs.query({ active: true, currentWindow: true });
            requestingTab = activeTab?.id ?? null;
            if (!needsOwnTab(kind, payload, shownAt) && activeTab && activeTab.id != null && /^https?:/i.test(activeTab.url || '')) {
                sheetTab = activeTab.id;
                prompt.sheetTabId = sheetTab;
                prompt.sheetUrl = url; // kept so a compromised sheet can escalate to a tab
                // Wrap release so finishing the prompt (allow / deny / timeout) also
                // dismisses the sheet + any minimized FAB in the page.
                const origRelease = prompt.release;
                prompt.release = () => {
                    clearPromptTimer(uuid);
                    const tid = prompt.sheetTabId;
                    prompt.sheetTabId = null;
                    prompt.sheetUrl = null;
                    if (tid != null) { try { api.tabs.sendMessage(tid, { kind: 'closePermissionSheet' }).catch(() => {}); } catch (_) {} }
                    if (origRelease) origRelease();
                };
                // A page too busy to take this has already been moved to a tab by
                // the time it does. The close sent then arrives after this.
                await api.tabs.sendMessage(sheetTab, { kind: 'showPermissionSheet', url });
                return true;
            }
        } catch (_) { /* fall through to the tab fallback */ }

        // The prompt has moved on while the sheet was failing to open.
        if (prompt.pending?.uuid !== uuid) return true;
        if (sheetTab !== null) {
            if (prompt.sheetTabId !== sheetTab) return true;
            prompt.sheetTabId = null;
            prompt.sheetUrl = null;
        }

        let tab = await api.tabs.getCurrent();
        let p = await api.tabs.create({ url, openerTabId: tab?.id ?? requestingTab ?? undefined });
        setPromptTab(uuid, p.id);
        return true;
    } catch (e) {
        // Nothing can be shown for this request. Undo what it set up and
        // answer the page.
        log(`Request failed before a prompt was shown: ${e?.message}`);
        releaseIfCurrent(uuid);
        const response = { error: 'request_failed', message: 'This request could not be shown. Please try again.' };
        if (ownRelease) {
            ownRelease();
            settleRequest(uuid, response);
        } else {
            leaveQueue(uuid, response);
        }
    }
}

const identityOf = (profile) => profile?.pubKey || profile?.remotePubkey || null;

/** The identity of the profile at this index, from its key if none is cached. */
async function identityAt(index, profile) {
    const known = identityOf(profile);
    if (known || !profile?.privKey) return known;
    try {
        return getPublicKeySync(await getPlaintextPrivKey(index, profile));
    } catch {
        return null;
    }
}

/**
 * Which identity a held request belongs to. While a local profile is locked with
 * no cached public key its identity cannot be read, so the stored key stands in.
 */
async function identityStamp(index, profile) {
    const pubkey = await identityAt(index, profile);
    return { profileIndex: index, pubkey, unreadKey: pubkey === null ? profile?.privKey || null : null };
}

/** Is this profile still the identity the request was stamped with? */
async function isStampedIdentity(held, profile) {
    if (await identityAt(held.profileIndex, profile) === held.pubkey) return true;
    return !!held.unreadKey && profile.privKey === held.unreadKey;
}

/**
 * Store the answer to a held request, for the identity it was asked of. Writes
 * by `held.pubkey`. When that could not be read (locked, no cached public key)
 * the stamped profile index stands in, but only once the stored key is checked
 * to be the one stamped. An allow for a site revoked while the prompt was open
 * is not stored: the click answers that one request. Any failure drops the
 * remember; the request is still answered by the caller.
 */
async function rememberAnswer(held, value) {
    try {
        if (!held?.rememberable || held.profileIndex == null) return false;
        // Sign-in to another site is remembered only under a key for that target.
        if (held.authTarget && parseGrantKey(held.key)?.target !== held.authTarget) return false;
        const isAllow = value === 'allow' || value?.v === 'allow';
        if (isAllow && await revokedWhileOpen(held)) return false;
        if (held.pubkey) {
            await setPermission(held.pubkey, held.host, held.key, value, { identityOf: identityAt });
            // A revoke that landed between the check above and this write must win.
            if (isAllow && await revokedWhileOpen(held)) {
                await revokePermission({ pubkey: held.pubkey, index: held.profileIndex }, held.host, held.key, { identityOf: identityAt });
                return false;
            }
            return true;
        }
        const profile = await getProfile(held.profileIndex);
        if (!profile || !held.unreadKey || profile.privKey !== held.unreadKey) return false;
        await setPermissionForUnreadIdentity(held.profileIndex, held.host, held.key, value, { unreadKey: held.unreadKey });
        if (isAllow && await revokedWhileOpen(held)) {
            await revokePermission({ index: held.profileIndex, unreadKey: held.unreadKey }, held.host, held.key);
            return false;
        }
        return true;
    } catch (e) {
        log(`Could not remember this choice: ${e?.message}`);
        return false;
    }
}

/** Was this request's site revoked after its prompt opened? */
async function revokedWhileOpen(held) {
    if (held.askedAt == null) return false;
    const revocations = (await storage.get({ [SITE_REVOCATIONS_KEY]: {} }))[SITE_REVOCATIONS_KEY];
    return wasRevokedSince(revocations, held.host, held.askedAt);
}

/**
 * The profile this request is answered as, or an error if it is no longer the
 * identity its grant or prompt was for.
 */
async function boundTo(held) {
    const { profileIndex: index, shownForActive } = held;
    const profile = await getProfile(index);
    if (!profile || !(await isStampedIdentity(held, profile))) throw identityError();
    if (shownForActive && await getProfileIndex() !== index) throw identityError();
    return { index, profile };
}

/** Do what the request asks, as the identity it is bound to. */
async function perform(held) {
    const bound = await boundTo(held);
    const { method, payload, host } = held;
    switch (method) {
        case 'getPubKey': return getPubKey(bound);
        case 'signEvent': return signEvent_(payload, host, bound);
        case 'nip04.encrypt': return nip04Encrypt(payload, bound);
        case 'nip04.decrypt': return nip04Decrypt(payload, bound);
        case 'nip44.encrypt': return nip44Encrypt(payload, bound);
        case 'nip44.decrypt': return nip44Decrypt(payload, bound);
        case 'getRelays': return getRelays(bound);
        case 'addRelay': return addRelay(payload.url, bound);
    }
}

/**
 * What to store for an allow the person asked to remember. `rememberFor` is one
 * of '1h', '1d', '30d', 'forever'; left out, it means forever (the prompt before
 * the duration picker). Any other value means not remembered. The worker, not
 * the prompt, holds the line: the duration is cut to the kind's maximum.
 */
function allowToRemember(rememberFor, method, key) {
    const asked = rememberFor === undefined ? 'forever' : rememberFor;
    return rememberedValue(asked, method, key, Math.floor(Date.now() / 1000));
}

async function complete({ payload, remember, rememberFor }) {
    const sendResponse = validations[payload];
    // Ignore any postback that doesn't match a LIVE pending request. payload is an
    // unguessable crypto.randomUUID() minted per real prompt, so requiring it to
    // exist here stops a framed/forged permission page (permission.html is now a
    // web-accessible resource) from writing the persistent allow-list via
    // setPermission or perturbing queue state with a fabricated uuid+host.
    if (!sendResponse) return false;
    const held = takeHeld(payload);
    const { method: origKind, host } = held;
    clearPromptTimer(payload);
    delete validations[payload];
    if (Object.keys(validations).length === 0) {
        pendingQueue = { total: 0, processed: 0 };
    }

    const value = remember ? allowToRemember(rememberFor, origKind, held.key) : null;
    if (value) await rememberAnswer(held, value);

    perform(held).then(r => sendResponse(r)).catch((e) => {
        log(`Error in ${origKind}: ${e.message}`);
        sendResponse({ error: e.code || 'bunker_error', message: e.message });
    });
    return true;
}

async function deny({ payload, remember, timedOut }) {
    const sendResponse = validations[payload];
    // Same guard as complete(): only a live pending request may write the
    // persistent deny-list. A forged/framed postback with an unknown uuid is
    // ignored so it cannot poison (host,kind)→deny entries.
    if (!sendResponse) return false;
    const held = takeHeld(payload);
    clearPromptTimer(payload);
    delete validations[payload];
    if (Object.keys(validations).length === 0) {
        pendingQueue = { total: 0, processed: 0 };
    }

    if (remember) await rememberAnswer(held, 'deny');

    // The site gets a coded error, never a silent undefined (nos2x rejects too).
    // A prompt nobody answered before its deadline reads as timed out.
    sendResponse(timedOut
        ? { error: 'timed_out', message: 'This request waited too long.' }
        : { error: 'denied', message: 'The request was denied.' });
    return true;
}

/**
 * Cache pubKeys for all local profiles (call before encrypting keys).
 * This ensures npub is available even when the extension is locked.
 */
async function cachePubKeysForAllProfiles() {
    const profiles = await getProfiles();
    const changes = new Map();
    for (let i = 0; i < profiles.length; i++) {
        const profile = profiles[i];
        if (profile.type === 'bunker') continue;
        if (profile.pubKey) continue; // Already cached
        if (!profile.privKey || isCiphertext(profile.privKey)) continue;
        try {
            changes.set(profile.privKey, { pubKey: getPublicKeySync(profile.privKey) });
        } catch (e) {
            console.error(`Failed to cache pubKey for profile ${i}:`, e);
        }
    }
    await applyKeyChanges(changes);
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
    let wrapped;

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
        wrapped = await encryptWithKey(hexKey, sessionCryptoKey, sessionKeySalt);
    } else {
        // Passwordless tier — name the device key explicitly so this write
        // cannot follow some other module's session state.
        wrapped = await encryptWithDeviceKey(hexKey);
    }

    // The crypto is done; the write is a fresh read and a quick change.
    let saved = false;
    await updateProfiles((list) => {
        const p = list[index];
        if (!p || p.type === 'bunker') return false;
        // Grants belong to an identity, not to a slot in the list.
        if (p.pubKey !== pubKey) p.hosts = {};
        p.pubKey = pubKey;
        p.privKey = wrapped;
        saved = true;
    });
    if (!saved) throw new Error('Invalid profile index');
    if (encrypted) sessionKeys.set(index, hexKey);
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
            const cached = sessionKeys.get(index);
            // sessionKeys is keyed by profile INDEX, but deleteProfile() splices the
            // profiles array WITHOUT reindexing this Map. After a mid-list delete the
            // entry at `index` can belong to a DIFFERENT identity — returning it would
            // sign with the wrong key. When the profile carries a cached pubKey (every
            // profile that has been unlocked does — see unlock, which co-populates it),
            // verify the cached key derives THAT pubKey. A positive mismatch proves the
            // entry is stale/wrong-identity: drop it and refuse rather than sign with
            // someone else's key. (No cached pubKey = a legacy/parked profile we cannot
            // verify against; behave as before rather than break read-only resume.)
            if (profile.pubKey) {
                let derived = null;
                try {
                    derived = getPublicKeySync(cached);
                } catch (e) {
                    derived = null; // unverifiable against a known pubKey = treat as mismatch
                }
                if (derived !== profile.pubKey) {
                    sessionKeys.delete(index);
                    throw new Error('Extension is locked — cannot access private key');
                }
            }
            return cached;
        }
        throw new Error('Extension is locked — cannot access private key');
    }
    return profile.privKey;
}

async function privKeyOf({ index, profile }) {
    return hexToBytes(await getPlaintextPrivKey(index, profile));
}

async function getPrivKey() {
    return privKeyOf(await activeProfile());
}

/**
 * Reindex the in-memory `sessionKeys` map after a profile at `deletedIndex` was
 * removed. The map is keyed by profile INDEX, and deleteProfile() splices the
 * profiles array WITHOUT touching this map — so after a mid-list delete every
 * entry above the removed index is off by one and belongs to a different
 * identity. Drop the removed entry and shift every higher entry down by one so
 * the shifted profiles keep resolving their own key without a re-unlock.
 *
 * Safety net only: getPlaintextPrivKey independently verifies the cached key
 * derives the profile's pubKey and refuses on mismatch, so a missed reindex can
 * only ever cause a "locked — re-unlock" refusal, never a wrong-key signature.
 */
function reindexSessionKeysAfterDelete(deletedIndex) {
    if (typeof deletedIndex !== 'number' || deletedIndex < 0) return;
    moveSessionKeys((index) => {
        if (index === deletedIndex) return null;       // the removed profile's key
        return index > deletedIndex ? index - 1 : index;
    });
}

/**
 * Keep unlocked keys on their own profiles after the list changed.
 *
 * @param {(index: number) => ?number} newIndexOf where a profile went, null if gone
 */
function moveSessionKeys(newIndexOf) {
    const entries = [...sessionKeys.entries()];
    if (entries.every(([index]) => newIndexOf(index) === index)) return;
    sessionKeys.clear();
    for (const [index, hex] of entries) {
        const moved = newIndexOf(index);
        if (moved !== null) sessionKeys.set(moved, hex);
    }
    // Re-park the shifted session so an MV3 worker eviction restores the
    // corrected mapping (no-op while locked / passwordless).
    persistSessionState(Date.now() + autoLockTimeout);
    log(`[SESSION] Moved sessionKeys; ${sessionKeys.size} key(s) retained`);
}

/**
 * What is held in memory by profile index follows a sync merge that moved profiles.
 *
 * @param {Array<[number, ?number]>} moves each profile that moved, and to where; null if gone
 */
function applyProfileMoves(moves) {
    const validIndex = (value) => Number.isInteger(value) && value >= 0;
    const valid = Array.isArray(moves) && moves.every((move) => Array.isArray(move)
        && validIndex(move[0]) && (move[1] === null || validIndex(move[1])));
    if (!valid) return;
    const moved = new Map(moves);
    const newIndexOf = (index) => (moved.has(index) ? moved.get(index) : index);
    moveSessions(newIndexOf);
    moveSessionKeys(newIndexOf);
}
setProfileMoveHandler(applyProfileMoves);

async function getPubKey(bound) {
    const { index: pi, profile } = bound ?? await activeProfile();

    if (profile.type === 'bunker') {
        // Return cached remotePubkey, or live-query and cache
        if (profile.remotePubkey) return profile.remotePubkey;
        const session = await getOrCreateSession(pi);
        const pubkey = parsePubkey(await session.getPublicKey());
        await updateProfiles((profiles) => {
            const asked = profiles[pi];
            if (asked?.type !== 'bunker' || asked.remotePubkey) return false;
            asked.remotePubkey = pubkey;
        });
        return pubkey;
    }

    // Use cached pubKey if available (works even when locked)
    if (profile.pubKey) return profile.pubKey;

    // Fallback: derive from private key (requires unlocked state)
    let privKey = await privKeyOf({ index: pi, profile });
    let pubKey = getPublicKeySync(bytesToHex(privKey));
    return pubKey;
}

async function currentProfile() {
    return (await activeProfile()).profile;
}

async function activeProfile() {
    const index = await getProfileIndex();
    const profiles = await get('profiles');
    return { index, profile: profiles[index] };
}

/**
 * A remote session for this profile, or an error if it cannot be tied to the
 * profile's identity. `confirm` asks the signer when the session does not know
 * who it signs for; a signature shows that for itself, an encryption does not.
 */
async function sessionFor(index, profile, { confirm = false } = {}) {
    if (!profile.remotePubkey) throw identityError();
    const session = await getOrCreateSession(index);
    if (confirm && !session.userPubkey) await confirmSessionUser(session);
    if (session.userPubkey && !samePubkey(session.userPubkey, profile.remotePubkey)) throw identityError();
    return session;
}

function identityError() {
    return Object.assign(
        new Error('This request is not for the current identity. Please try again.'),
        { code: 'identity_mismatch' },
    );
}

function signerMismatchError() {
    return Object.assign(
        new Error('The remote signer did not sign what was asked for.'),
        { code: 'signer_mismatch' },
    );
}

/**
 * Have a remote signer sign this event. The answer must be from the profile's
 * identity, when known, and be the event asked for, apart from the small changes
 * signers make on their own (see matchesRequest). The event is returned as signed,
 * and only its checked fields are kept.
 */
async function signRemotely(session, profile, event) {
    const signed = await session.signEvent(event);
    if (profile.remotePubkey && !samePubkey(signed?.pubkey, profile.remotePubkey)) throw identityError();
    if (!(await signedAsRequested(signed, event))) throw signerMismatchError();
    const { id, pubkey, created_at, kind, tags, content, sig } = signed;
    return { id, pubkey, created_at, kind, tags, content, sig };
}

async function signEvent_(event, host, bound) {
    event = JSON.parse(JSON.stringify(event));

    const { index: pi, profile } = bound ?? await activeProfile();

    if (profile.type === 'bunker') {
        const session = await sessionFor(pi, profile);
        event = await signRemotely(session, profile, event);
    } else {
        let sk = await privKeyOf({ index: pi, profile });
        // A local profile signs as itself, whatever the event claims.
        delete event.pubkey;
        event = await finalizeEvent(event, sk);
    }

    saveEvent({
        event,
        metadata: { host, signed_at: Math.round(Date.now() / 1000) },
    });
    if (LIST_KINDS.has(event.kind)) await listStore().put(event).catch(() => {});
    return event;
}

async function nip04Encrypt({ pubKey, plainText }, bound) {
    const { index: pi, profile } = bound ?? await activeProfile();

    if (profile.type === 'bunker') {
        const session = await sessionFor(pi, profile, { confirm: true });
        return session.nip04Encrypt(pubKey, plainText);
    }

    let privKey = await privKeyOf({ index: pi, profile });
    return nip04.encryptMessage(plainText, bytesToHex(privKey), pubKey);
}

async function nip04Decrypt({ pubKey, cipherText }, bound) {
    const { index: pi, profile } = bound ?? await activeProfile();

    if (profile.type === 'bunker') {
        const session = await sessionFor(pi, profile, { confirm: true });
        return session.nip04Decrypt(pubKey, cipherText);
    }

    let privKey = await privKeyOf({ index: pi, profile });
    return nip04.decryptMessage(cipherText, bytesToHex(privKey), pubKey);
}

async function nip44Encrypt({ pubKey, plainText }, bound) {
    const { index: pi, profile } = bound ?? await activeProfile();

    if (profile.type === 'bunker') {
        const session = await sessionFor(pi, profile, { confirm: true });
        return session.nip44Encrypt(pubKey, plainText);
    }

    let privKey = await privKeyOf({ index: pi, profile });
    let conversationKey = nip44.v2.utils.getConversationKey(privKey, pubKey);
    return nip44.v2.encrypt(plainText, conversationKey);
}

async function nip44Decrypt({ pubKey, cipherText }, bound) {
    const { index: pi, profile } = bound ?? await activeProfile();

    if (profile.type === 'bunker') {
        const session = await sessionFor(pi, profile, { confirm: true });
        return session.nip44Decrypt(pubKey, cipherText);
    }

    let privKey = await privKeyOf({ index: pi, profile });
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

// Security: the only relays a bunker may run on are the NostrKey defaults plus the
// active profile's own configured relays. Caller-supplied URLs outside this set
// are dropped, so a request can't point the signer at an attacker relay.
const DEFAULT_BUNKER_RELAYS = ['wss://relay.nostrkey.com'];

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

async function getRelays(bound) {
    const { profile } = bound ?? await activeProfile();
    let relays = profile.relays;
    let relayObj = {};
    // The getRelays call expects this to be returned as an object, not array
    relays.forEach(relay => {
        let { url, read, write } = relay;
        relayObj[url] = { read, write };
    });
    return relayObj;
}

async function addRelay(url, bound) {
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

    const { index: pi, profile: asked } = bound ?? await activeProfile();
    let outcome = 'added';
    await updateProfiles((profiles) => {
        const profile = profiles[pi];
        if (identityOf(profile) !== identityOf(asked)) { outcome = 'moved'; return false; }
        // Check for duplicates
        if ((profile.relays || []).some(r => r.url === parsed.href)) { outcome = 'exists'; return false; }
        if (!profile.relays) profile.relays = [];
        profile.relays.push({ url: parsed.href, read: true, write: true });
        profile.updatedAt = Math.floor(Date.now() / 1000);
    });
    if (outcome === 'moved') throw identityError();
    if (outcome === 'exists') return { success: true, message: 'Relay already exists' };
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
 * Read every event matching `filters` from the read relays (15 s per relay).
 * @returns {Promise<object[]>} raw, unverified events
 */
async function pullEvents(filters, prefix) {
    const allEvents = [];
    await withRelays('read', async (relays) => {
        const perRelay = relays.map(relay => new Promise((resolve) => {
            const subId = `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
            const timeout = setTimeout(() => {
                try { relay.unsubscribe(subId); } catch (_) {}
                resolve();
            }, 15000);
            relay.subscribe(
                subId,
                filters,
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
    return allEvents;
}

/**
 * The author's own verified kind 5 events that name one of these d tags (by
 * full or legacy address) or one of these event ids. Scoped so that a large
 * history of unrelated deletions cannot push these past a relay's result cap.
 */
async function pullDeletions(pubkey, dtags, eventIds, prefix) {
    const addresses = [];
    for (const d of dtags) addresses.push(`30078:${pubkey}:${d}`, `30078::${d}`);
    const filters = [];
    if (addresses.length) filters.push({ kinds: [5], authors: [pubkey], '#a': addresses });
    if (eventIds.length) filters.push({ kinds: [5], authors: [pubkey], '#e': eventIds });
    if (!filters.length) return [];
    const seen = new Set();
    const out = [];
    for (const event of await pullEvents(filters, prefix)) {
        if (!event || seen.has(event.id)) continue;
        seen.add(event.id);
        if (await verifyStoredEvent(event, { pubkey, kind: 5 })) out.push(event);
    }
    return out;
}

/**
 * profile.fetch: an identity's kind 0 and kind 10002 from its write relays,
 * verified. A newer verified kind 10002 is kept on the profile as
 * `relayListEvent`. Extension pages only (SENSITIVE_KINDS).
 */
/**
 * The user's own profile for this pubkey (local key or bunker remote pubkey),
 * found the same way grants are (RF2). Null when it is not one of theirs.
 */
async function ownIdentity(pubkey) {
    if (typeof pubkey !== 'string' || !/^[0-9a-fA-F]{64}$/.test(pubkey)) throw new Error('Invalid pubkey');
    const pk = pubkey.toLowerCase();
    const profiles = await getProfiles();
    const found = await findProfilesByPubkey(pk, { identityOf: identityAt, profiles });
    return found.length ? { pk, index: found[0], profile: profiles[found[0]] } : null;
}

const localNameOf = (profile) => (typeof profile?.name === 'string' ? profile.name.slice(0, 80) : '');

async function fetchIdentityProfile(pubkey) {
    const own = await ownIdentity(pubkey);
    if (!own) return { state: 'not-mine' };
    const pk = own.pk;
    const index = await getProfileIndex();
    const urls = await selectRelayUrls('write', await get('profiles'), index, { pubkey: pk });
    const openRelay = (u) => new RelayConnection(u);
    // The follow and mute lists too, so the history covers lists made in other apps.
    const lists = Promise.allSettled([3, 10000].map(kind =>
        fetchLatest({ pubkey: pk, kind, urls, openRelay, timeoutMs: EFFECT_FETCH_MS }).then(r => keepListVersion(r.event, { seen: true }))));
    const result = await fetchProfile({ pubkey: pk, urls, openRelay });
    await Promise.all([keepListVersion(result.event, { seen: true }), keepListVersion(result.relayListEvent, { seen: true }), lists]);
    if (result.relayListEvent) {
        await updateProfiles((profiles) => {
            const p = profiles.find(x => (identityOf(x) || '').toLowerCase() === pk);
            if (!p || !isNewerRelayList(result.relayListEvent, p.relayListEvent)) return false;
            p.relayListEvent = result.relayListEvent;
        });
    }
    const signer = own.profile?.type === 'bunker' ? await bunkerReady(own.index, own.profile) : { ready: true };
    return { state: result.state, event: result.event, content: result.content,
        answered: result.answered, asked: result.asked, localName: localNameOf(own.profile), signer };
}

const PROFILE_SIGNER_MS = 8000;
const within = (promise, ms, message) => Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error(message)), ms)),
]);

/** Can this bunker identity's remote signer be reached right now? */
async function bunkerReady(index, profile) {
    try {
        const session = await within(sessionFor(index, profile, { confirm: true }), PROFILE_SIGNER_MS, 'timeout');
        await within(session.ping(), PROFILE_SIGNER_MS, 'timeout');
        return { ready: true };
    } catch (e) {
        if (e && e.code === 'identity_mismatch') return { ready: false, reason: 'Your remote signer answers for a different identity.' };
        return { ready: false, reason: "Couldn't reach your remote signer. Editing is locked until it answers." };
    }
}

/**
 * profile.publish: merge the user's edits into the newest kind 0 and publish it
 * for this identity only. Re-fetches first; if a newer kind 0 than the one the
 * edit started from exists, nothing is signed and the newer one is returned.
 * Signed directly for the identity (local key, or its own remote signer), never
 * through signEvent or a site grant. Extension pages only (SENSITIVE_KINDS).
 */
const profilePublishing = new Set();

async function publishIdentityProfile(pubkey, payload = {}) {
    const own = await ownIdentity(pubkey);
    if (!own) return { success: false, code: 'not-mine', error: 'Not one of your identities.' };
    // One save per identity at a time, even if the page was closed or cancelled.
    const lockKey = String(own.pk).toLowerCase();
    if (profilePublishing.has(lockKey)) {
        return { success: false, code: 'busy', error: 'A save for this profile is still running. Wait for it to finish.' };
    }
    profilePublishing.add(lockKey);
    try {
        return await publishIdentityProfileOnce(own, payload);
    } finally {
        profilePublishing.delete(lockKey);
    }
}

async function publishIdentityProfileOnce(own, payload) {
    if (await checkLockState()) return { success: false, code: 'locked', error: 'NostrKey is locked. Unlock NostrKey to save.' };
    // A restore brings back a whole earlier version (content and tags), not field edits.
    const restoring = payload && payload.restore && typeof payload.restore.content === 'string' ? payload.restore : null;
    const changes = payload && payload.changes;
    const errors = restoring ? {} : validateChanges(changes);
    if (Object.keys(errors).length) return { success: false, code: 'invalid', errors, error: 'Some fields need fixing.' };
    const { pk, index, profile } = own;

    const urls = await selectRelayUrls('write', await get('profiles'), await getProfileIndex(), { pubkey: pk });
    if (!urls.length) return { success: false, code: 'no-relays', error: 'No write relays are set for this identity.' };
    const latest = await fetchProfile({ pubkey: pk, urls, openRelay: (u) => new RelayConnection(u) });
    if (latest.state !== 'confirmed' && latest.state !== 'none') {
        return { success: false, code: 'unreachable', error: "Couldn't reach your relays. Nothing was saved." };
    }
    if (isStale(payload.baseId, latest.event)) {
        return { success: false, code: 'stale', state: latest.state, event: latest.event, content: latest.content,
            error: 'Your profile changed elsewhere. The newer version is loaded and your edits are kept. Check them and save again.' };
    }
    if (latest.state === 'confirmed' && !latest.content && !restoring) {
        return { success: false, code: 'unreadable', error: "Your current profile can't be read, so it is not overwritten." };
    }
    if (futureDated(latest.event)) {
        return { success: false, code: 'future-dated',
            error: 'Your current profile is dated in the future, so relays would ignore or refuse a new one. Nothing was saved. Fix the clock of the app that published it, or wait until that date.' };
    }
    const content = restoring ? parseProfileContent({ content: restoring.content }) : mergeContent(latest.content || {}, changes);
    const unsigned = restoring
        ? { ...buildKind0({}, latest.event), content: restoring.content, tags: JSON.parse(JSON.stringify(restoring.tags || [])) }
        : buildKind0(content, latest.event);

    let signed;
    try {
        if (profile.type === 'bunker') {
            const session = await within(sessionFor(index, profile), PROFILE_SIGNER_MS * 4, 'Your remote signer did not answer.');
            signed = await within(signRemotely(session, profile, unsigned), PROFILE_SIGNER_MS * 8, 'Your remote signer did not answer.');
        } else {
            signed = await finalizeEvent(unsigned, await privKeyOf({ index, profile }));
        }
    } catch (e) {
        return { success: false, code: 'sign-failed', error: e && e.code === 'identity_mismatch'
            ? 'Your remote signer signed as a different identity. Nothing was published.'
            : `Couldn't sign: ${clip(e && e.message ? e.message : 'unknown error')}` };
    }
    if (!signed || !samePubkey(signed.pubkey, pk) || signed.kind !== 0 || signed.content !== unsigned.content
        || signed.created_at !== unsigned.created_at || JSON.stringify(signed.tags) !== JSON.stringify(unsigned.tags)) {
        return { success: false, code: 'sign-failed', error: 'The signature is not from this identity. Nothing was published.' };
    }

    // Check once more after signing (a remote signer can take a while).
    const again = await fetchProfile({ pubkey: pk, urls, openRelay: (u) => new RelayConnection(u) });
    if (again.state !== 'confirmed' && again.state !== 'none') {
        return { success: false, code: 'unreachable', error: "Couldn't reach your relays. Nothing was saved." };
    }
    if (isStale(latest.event ? latest.event.id : null, again.event)) {
        return { success: false, code: 'stale', state: again.state, event: again.event, content: again.content,
            error: 'Your profile changed elsewhere. The newer version is loaded and your edits are kept. Check them and save again.' };
    }

    const relays = [];
    await Promise.allSettled(urls.map(async (url) => {
        const relay = new RelayConnection(url);
        try { await relay.connect(); relays.push(relay); } catch (_) { /* counted as not accepted */ }
    }));
    let results;
    try { results = await publishToRelays(relays, signed); } finally { for (const r of relays) { try { r.close(); } catch (_) {} } }
    const accepted = results.filter(r => r && r.ok).length;
    if (accepted > 0) {
        saveEvent({ event: signed, metadata: { host: 'NostrKey profile', signed_at: Math.round(Date.now() / 1000) } });
        await keepListVersion(signed, { seen: true });
    }
    return {
        success: accepted > 0, code: accepted > 0 ? 'published' : 'no-relay-accepted',
        accepted, total: urls.length, results: results.map(r => ({ url: r.url, ok: !!r.ok, message: clip(r.message || '') })),
        event: accepted > 0 ? signed : null, content: accepted > 0 ? content : null,
        error: accepted > 0 ? '' : 'No relay accepted the update. Your edits are kept.',
    };
}

// --- History and restore (device-only snapshots) --------------------------

/** One line about a version: "450 follows", "6 relays", a profile name. */
function versionSummary(event) {
    const tags = Array.isArray(event?.tags) ? event.tags.filter(Array.isArray) : [];
    const count = (pred) => new Set(tags.filter(pred).map(t => String(t[1]).toLowerCase())).size;
    const n = (k, one, many) => `${k} ${k === 1 ? one : many}`;
    switch (event?.kind) {
        case 0: {
            const c = parseProfileContent(event) || {};
            const name = [c.name, c.display_name].find(v => typeof v === 'string' && v.trim());
            return name ? `Name: ${clip(name.trim(), 60)}` : `${n(Object.keys(c).length, 'field', 'fields')}`;
        }
        case 3: return n(count(t => t[0] === 'p' && typeof t[1] === 'string'), 'follow', 'follows');
        case 10000: {
            const k = count(t => ['p', 't', 'word', 'e'].includes(t[0]) && typeof t[1] === 'string');
            return `${n(k, 'muted item', 'muted items')}${event.content ? ', plus a private part' : ''}`;
        }
        case 10002: return n(count(t => t[0] === 'r' && typeof t[1] === 'string'), 'relay', 'relays');
        default: return '';
    }
}

/** profile.history: this device's saved versions per kind for one identity. */
async function identityHistory(pubkey) {
    const own = await ownIdentity(pubkey);
    if (!own) return { state: 'not-mine', kinds: [] };
    const store = listStore();
    const kinds = [];
    for (const kind of [0, 3, 10000, 10002]) {
        const versions = await store.history(own.pk, kind);
        const currentId = versions.find(v => v.seen)?.event.id ?? null;
        kinds.push({ kind, versions: versions.map((v) => ({
            id: v.event.id, created_at: v.event.created_at, seenAt: v.firstSeenAt || 0,
            summary: versionSummary(v.event), current: v.event.id === currentId, seen: !!v.seen,
        })) });
    }
    return { state: 'ok', kinds };
}

/**
 * The plan for restoring one saved version: the snapshot (checked to be this
 * identity's own signed event), the event to sign (same tags and content, a
 * fresh created_at newer than the current one) and what it would change.
 */
async function restorePlan(pubkey, kind, id) {
    const own = await ownIdentity(pubkey);
    if (!own) return { error: { success: false, code: 'not-mine', error: 'Not one of your identities.' } };
    if (!LIST_KINDS.has(kind) || typeof id !== 'string') return { error: { success: false, code: 'invalid', error: 'Not a saved version.' } };
    const saved = await listStore().version(own.pk, kind, id);
    if (!saved || !(await isOwnEvent(saved.event, own.pk, kind))) {
        return { error: { success: false, code: 'not-own', error: 'This saved version is not signed by this identity. Nothing was published.' } };
    }
    const current = await currentVersionOf(own.pk, kind, own.profile);
    const nowS = Math.floor(Date.now() / 1000);
    const prevAt = current?.event?.created_at || 0;
    // Newer than the current version, but never more than a minute ahead: if
    // the current one is dated in the future, use now.
    const createdAt = prevAt + 1 > nowS + 60 ? nowS : Math.max(nowS, prevAt + 1);
    const unsigned = {
        kind, created_at: createdAt,
        tags: JSON.parse(JSON.stringify(saved.event.tags)), content: saved.event.content,
    };
    const baseline = SHRINK_KINDS.has(kind) ? await listStore().baseline(own.pk, kind) : null;
    const effect = describeEffect(kind, unsigned, current, { baseline });
    if (kind === 10000 && unsigned.content) effect.lines.push('The private part is restored as it was. NostrKey does not read it.');
    return { own, saved, unsigned, current, effect };
}

/** profile.restorePreview: what restoring this version would change. */
async function restorePreview(pubkey, kind, id) {
    const plan = await restorePlan(pubkey, kind, id);
    if (plan.error) return plan.error;
    return { success: true, effect: plan.effect, baseId: plan.current?.event?.id || null };
}

const restoreInFlight = new Set();

/** profile.restore: re-sign a saved version for this identity and publish it. */
async function restoreVersion(pubkey, payload = {}) {
    if (await checkLockState()) return { success: false, code: 'locked', error: 'NostrKey is locked. Unlock NostrKey to restore.' };
    const kind = payload.kind;
    const plan = await restorePlan(pubkey, kind, payload.id);
    if (plan.error) return plan.error;
    if (plan.effect?.destructive && payload.understood !== true) {
        return { success: false, code: 'needs-understood', effect: plan.effect, error: 'Tick "I understand" to restore this version.' };
    }
    const { own, unsigned } = plan;
    if (kind === 0) {
        return publishIdentityProfile(own.pk, { baseId: payload.baseId ?? null, restore: { content: unsigned.content, tags: unsigned.tags } });
    }
    const lockKey = `${own.pk}:${kind}`;
    if (restoreInFlight.has(lockKey)) return { success: false, code: 'busy', error: 'A restore for this list is still running.' };
    restoreInFlight.add(lockKey);
    try {
        return await signAndPublishList(own, unsigned, !!plan.effect?.destructive);
    } finally {
        restoreInFlight.delete(lockKey);
    }
}

async function signAndPublishList(own, unsigned, approved = false) {
    const { pk, index, profile } = own;
    const urls = await selectRelayUrls('write', await get('profiles'), await getProfileIndex(), { pubkey: pk });
    if (!urls.length) return { success: false, code: 'no-relays', error: 'No write relays are set for this identity.' };
    let signed;
    try {
        if (profile.type === 'bunker') {
            const session = await within(sessionFor(index, profile), PROFILE_SIGNER_MS * 4, 'Your remote signer did not answer.');
            signed = await within(signRemotely(session, profile, unsigned), PROFILE_SIGNER_MS * 8, 'Your remote signer did not answer.');
        } else {
            signed = await finalizeEvent({ ...unsigned }, await privKeyOf({ index, profile }));
        }
    } catch (e) {
        return { success: false, code: 'sign-failed', error: `Couldn't sign: ${clip(e && e.message ? e.message : 'unknown error')}` };
    }
    if (!signed || !samePubkey(signed.pubkey, pk) || signed.kind !== unsigned.kind || signed.content !== unsigned.content
        || signed.created_at !== unsigned.created_at || JSON.stringify(signed.tags) !== JSON.stringify(unsigned.tags)) {
        return { success: false, code: 'sign-failed', error: 'The signature is not from this identity. Nothing was published.' };
    }
    const relays = [];
    await Promise.allSettled(urls.map(async (url) => {
        const relay = new RelayConnection(url);
        try { await relay.connect(); relays.push(relay); } catch (_) { /* counted as not accepted */ }
    }));
    let results;
    try { results = await publishToRelays(relays, signed); } finally { for (const r of relays) { try { r.close(); } catch (_) {} } }
    const accepted = results.filter(r => r && r.ok).length;
    if (accepted > 0) {
        saveEvent({ event: signed, metadata: { host: 'NostrKey restore', signed_at: Math.round(Date.now() / 1000) } });
        await keepListVersion(signed, { seen: true });
        // The user approved this version with the tick: it becomes the baseline.
        if (approved && SHRINK_KINDS.has(signed.kind)) await listStore().acknowledge(pk, signed.kind, signed.id);
        if (signed.kind === 10002) {
            await updateProfiles((profiles) => {
                const p = profiles.find(x => (identityOf(x) || '').toLowerCase() === pk);
                if (!p || !isNewerRelayList(signed, p.relayListEvent)) return false;
                p.relayListEvent = signed;
            });
        }
    }
    return {
        success: accepted > 0, code: accepted > 0 ? 'published' : 'no-relay-accepted',
        accepted, total: urls.length, event: accepted > 0 ? signed : null,
        error: accepted > 0 ? '' : 'No relay accepted the restore.',
    };
}

/**
 * profile.checkAddresses: the NIP-05 and lightning address checks, run here so
 * every browser makes them with the worker's host access (Safari pages cannot).
 * Same rules as field-checks.js: no redirects, no credentials, size cap, no
 * private hosts. Only for the user's own identities. Extension pages only.
 */
async function checkIdentityAddresses(pubkey, content) {
    const own = await ownIdentity(pubkey);
    if (!own) return { state: 'not-mine', checks: {} };
    const c = content && typeof content === 'object' && !Array.isArray(content) ? content : {};
    const subset = {};
    for (const k of ['nip05', 'lud16']) if (typeof c[k] === 'string') subset[k] = c[k];
    return { state: 'ok', checks: await checkFields(subset, own.pk, { only: ['nip05', 'lud16'] }) };
}

/**
 * Open ephemeral relay connections, execute callback, then disconnect.
 * Correct for Chrome MV3 service worker lifecycle (no persistent pool).
 *
 * @param {'read'|'write'} mode - Which relay subset to connect to
 * @param {function(RelayConnection[]): Promise} callback
 * @param {{pubkey?: string}} [options] - identity whose relays to use; default the active profile
 */
async function withRelays(mode, callback, { pubkey = null } = {}) {
    const index = await getProfileIndex();
    const profiles = await get('profiles');
    const urls = await selectRelayUrls(mode, profiles, index, { pubkey });

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
