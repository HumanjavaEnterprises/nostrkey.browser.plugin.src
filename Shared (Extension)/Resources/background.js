import {
    nip04,
    nip44,
    nip19,
    generateSecretKey,
    getPublicKey,
    finalizeEvent,
} from 'nostr-tools';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
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
    getDecryptedPrivKey,
    isEncryptedBlob,
} from './utilities/utils';
import { encrypt as encryptBlob } from './utilities/crypto';
import { saveEvent } from './utilities/db';
import { api } from './utilities/browser-polyfill';

const storage = api.storage.local;
const log = msg => console.log('Background: ', msg);
const validations = {};
let prompt = { mutex: new Mutex(), release: null, tabId: null };

// --- Session state for master password encryption ---------------------------
// Decrypted keys are held in memory only while unlocked.
// Map of profileIndex -> hex private key string
const sessionKeys = new Map();
let sessionPassword = null; // held in memory to re-encrypt new keys during session
let locked = true; // start locked; determined on first isLocked check
let autoLockTimeout = 15 * 60 * 1000; // 15 minutes default
let autoLockTimer = null;

/**
 * Reset the auto-lock inactivity timer.
 */
function resetAutoLock() {
    if (autoLockTimer) clearTimeout(autoLockTimer);
    if (!locked) {
        autoLockTimer = setTimeout(() => {
            lockSession();
        }, autoLockTimeout);
    }
}

/**
 * Lock the session — clear all decrypted keys from memory.
 */
function lockSession() {
    sessionKeys.clear();
    sessionPassword = null;
    locked = true;
    if (autoLockTimer) {
        clearTimeout(autoLockTimer);
        autoLockTimer = null;
    }
    log('Session locked.');
}

/**
 * Unlock the session — verify password and decrypt all keys into memory.
 */
async function unlockSession(password) {
    const valid = await checkPassword(password);
    if (!valid) return { success: false, error: 'Invalid password' };

    const profiles = await getProfiles();
    for (let i = 0; i < profiles.length; i++) {
        const hex = await getDecryptedPrivKey(profiles[i], password);
        sessionKeys.set(i, hex);
    }
    sessionPassword = password;
    locked = false;
    resetAutoLock();
    log('Session unlocked.');
    return { success: true };
}

/**
 * Check whether the extension is currently in a locked state.
 * If no password is set, we are never locked.
 */
async function checkLockState() {
    const encrypted = await isEncrypted();
    if (!encrypted) {
        locked = false;
        return false;
    }
    return locked;
}

// --- Message handler --------------------------------------------------------

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    log(message);
    let uuid = crypto.randomUUID();
    let sr;

    switch (message.kind) {
        // General
        case 'closePrompt':
            prompt.release?.();
            return Promise.resolve(true);
        case 'allowed':
            resetAutoLock();
            complete(message);
            return Promise.resolve(true);
        case 'denied':
            deny(message);
            return Promise.resolve(true);
        case 'generatePrivateKey':
            return Promise.resolve(generatePrivateKey_());
        case 'savePrivateKey':
            resetAutoLock();
            return savePrivateKey(message.payload);
        case 'getNpub':
            resetAutoLock();
            return getNpub(message.payload);
        case 'getNsec':
            resetAutoLock();
            return getNsec(message.payload);
        case 'calcPubKey':
            return Promise.resolve(getPublicKey(message.payload));
        case 'npubEncode':
            return Promise.resolve(nip19.npubEncode(message.payload));
        case 'copy':
            // navigator.clipboard is unavailable in Chrome service workers.
            // The caller (popup/options) should handle clipboard directly when
            // possible; this path is kept for Safari background-page compat.
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                return navigator.clipboard.writeText(message.payload);
            }
            return Promise.resolve(false);

        // --- Master password / lock handlers ---
        case 'isLocked':
            return checkLockState();
        case 'isEncrypted':
            return isEncrypted();
        case 'unlock':
            return unlockSession(message.payload);
        case 'lock':
            lockSession();
            return Promise.resolve(true);
        case 'setPassword':
            return (async () => {
                await encryptAllKeys(message.payload);
                // After setting password, unlock the session immediately
                return unlockSession(message.payload);
            })();
        case 'changePassword':
            return (async () => {
                const { oldPassword, newPassword } = message.payload;
                const valid = await checkPassword(oldPassword);
                if (!valid) return { success: false, error: 'Invalid current password' };
                await changePasswordForKeys(oldPassword, newPassword);
                // Re-unlock with new password
                return unlockSession(newPassword);
            })();
        case 'removePassword':
            return (async () => {
                try {
                    await removePasswordProtection(message.payload);
                    sessionKeys.clear();
                    sessionPassword = null;
                    locked = false;
                    return { success: true };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            })();
        case 'setAutoLockTimeout':
            autoLockTimeout = message.payload * 60 * 1000; // payload in minutes
            resetAutoLock();
            return Promise.resolve(true);
        case 'resetAutoLock':
            resetAutoLock();
            return Promise.resolve(true);

        // window.nostr
        case 'getPubKey':
        case 'signEvent':
        case 'nip04.encrypt':
        case 'nip04.decrypt':
        case 'nip44.encrypt':
        case 'nip44.decrypt':
        case 'getRelays':
            validations[uuid] = sendResponse;
            ask(uuid, message);
            setTimeout(() => {
                // H4 fix: deny pending request on timeout instead of silently releasing
                if (validations[uuid]) {
                    deny({ payload: uuid, origKind: message.kind, host: message.host });
                }
                prompt.release?.();
            }, 10_000);
            return true;
        default:
            return Promise.resolve();
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
    const sk = generateSecretKey();
    return bytesToHex(sk);
}

async function ask(uuid, { kind, host, payload }) {
    // If the extension is locked, reject signing/encryption requests
    const isLocked = await checkLockState();
    if (isLocked) {
        const sendResponse = validations[uuid];
        delete validations[uuid];
        sendResponse?.({ error: 'locked', message: 'Extension is locked. Please unlock with your master password.' });
        return;
    }

    resetAutoLock();
    await forceRelease(); // Clean up previous tab if it closed without cleaning itself up
    prompt.release = await prompt.mutex.acquire();

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

    let qs = new URLSearchParams({
        uuid,
        kind,
        host,
        payload: JSON.stringify(payload || false),
    });
    let tab = await api.tabs.getCurrent();
    let p = await api.tabs.create({
        url: api.runtime.getURL(`permission/permission.html?${qs.toString()}`),
        openerTabId: tab?.id,
    });
    prompt.tabId = p.id;
    return true;
}

function complete({ payload, origKind, event, remember, host }) {
    const sendResponse = validations[payload];
    delete validations[payload];

    if (remember) {
        let mKind =
            origKind === 'signEvent' ? `signEvent:${event.kind}` : origKind;
        setPermission(host, mKind, 'allow');
    }

    if (sendResponse) {
        switch (origKind) {
            case 'getPubKey':
                getPubKey().then(pk => {
                    sendResponse(pk);
                });
                break;
            case 'signEvent':
                signEvent_(event, host).then(e => sendResponse(e));
                break;
            case 'nip04.encrypt':
                nip04Encrypt(event).then(e => sendResponse(e));
                break;
            case 'nip04.decrypt':
                nip04Decrypt(event).then(e => sendResponse(e));
                break;
            case 'nip44.encrypt':
                nip44Encrypt(event).then(e => sendResponse(e));
                break;
            case 'nip44.decrypt':
                nip44Decrypt(event).then(e => sendResponse(e));
                break;
            case 'getRelays':
                getRelays().then(e => sendResponse(e));
                break;
        }
    }
}

function deny({ origKind, host, payload, remember, event }) {
    const sendResponse = validations[payload];
    delete validations[payload];

    if (remember) {
        let mKind =
            origKind === 'signEvent' ? `signEvent:${event.kind}` : origKind;
        setPermission(host, mKind, 'deny');
    }

    sendResponse?.(undefined);
    return false;
}

// Options
async function savePrivateKey([index, privKey]) {
    if (privKey.startsWith('nsec')) {
        privKey = nip19.decode(privKey).data;
    }
    let hexKey = bytesToHex(privKey);
    let profiles = await get('profiles');

    // If encryption is active, re-encrypt the new key using the session password
    const encrypted = await isEncrypted();
    if (encrypted && sessionPassword) {
        profiles[index].privKey = await encryptBlob(hexKey, sessionPassword);
        sessionKeys.set(index, hexKey);
    } else {
        profiles[index].privKey = hexKey;
    }

    await storage.set({ profiles });
    return true;
}

async function getNsec(index) {
    let profile = await getProfile(index);
    let hexKey = await getPlaintextPrivKey(index, profile);
    let nsec = nip19.nsecEncode(hexToBytes(hexKey));
    return nsec;
}

async function getNpub(index) {
    let profile = await getProfile(index);
    let hexKey = await getPlaintextPrivKey(index, profile);
    let pubKey = getPublicKey(hexToBytes(hexKey));
    let npub = nip19.npubEncode(pubKey);
    return npub;
}

/**
 * Get the plaintext hex private key for a profile.
 * Uses session cache if encryption is active, otherwise reads from storage directly.
 */
async function getPlaintextPrivKey(index, profile) {
    if (isEncryptedBlob(profile.privKey)) {
        // Key is encrypted — must use session cache
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
    let privKey = await getPrivKey();
    let pubKey = getPublicKey(privKey);
    return pubKey;
}

async function currentProfile() {
    let index = await getProfileIndex();
    let profiles = await get('profiles');
    return profiles[index];
}

async function signEvent_(event, host) {
    event = JSON.parse(JSON.stringify(event));
    let sk = await getPrivKey();
    event = finalizeEvent(event, sk);
    saveEvent({
        event,
        metadata: { host, signed_at: Math.round(Date.now() / 1000) },
    });
    return event;
}

async function nip04Encrypt({ pubKey, plainText }) {
    let privKey = await getPrivKey();
    return nip04.encrypt(privKey, pubKey, plainText);
}

async function nip04Decrypt({ pubKey, cipherText }) {
    let privKey = await getPrivKey();
    return nip04.decrypt(privKey, pubKey, cipherText);
}

async function nip44Encrypt({ pubKey, plainText }) {
    let privKey = await getPrivKey();
    let conversationKey = nip44.v2.utils.getConversationKey(privKey, pubKey);
    return nip44.v2.encrypt(plainText, conversationKey);
}

async function nip44Decrypt({ pubKey, cipherText }) {
    let privKey = await getPrivKey();
    let conversationKey = nip44.v2.utils.getConversationKey(privKey, pubKey);
    return nip44.v2.decrypt(cipherText, conversationKey);
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
