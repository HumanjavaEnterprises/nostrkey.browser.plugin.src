import {
    nip04,
    nip44,
    nip19,
    getPublicKey,
    finalizeEvent,
} from 'nostr-tools';
import { encrypt as nip49Encrypt, decrypt as nip49Decrypt } from 'nostr-tools/nip49';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
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
    getDecryptedPrivKey,
    isEncryptedBlob,
} from './utilities/utils';
import { encrypt as encryptBlob } from './utilities/crypto';
import { saveEvent } from './utilities/db';
import { api } from './utilities/browser-polyfill';
import {
    RelayConnection,
    getOrCreateSession,
    createSession,
    disconnectSession,
    isSessionActive,
    validateBunkerUrl,
} from './utilities/nip46';
import {
    buildVaultEvent,
    buildVaultDeletion,
    buildVaultFilter,
    parseVaultEvent,
} from './utilities/nip78';

const storage = api.storage.local;
const log = msg => console.log('Background: ', msg);
const validations = {};
let prompt = { mutex: new Mutex(), release: null, tabId: null };

// Rate limiter: max 5 permission prompts per host per 10-second window
const rateLimits = new Map();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 10000;

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
        if (profiles[i].type === 'bunker') continue;
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
        case 'savePrivateKey':
            resetAutoLock();
            return savePrivateKey(message.payload);
        case 'getNpub':
            resetAutoLock();
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

        // --- NIP-49 ncryptsec handlers ---
        case 'ncryptsec.decrypt':
            return (async () => {
                try {
                    const { ncryptsec, password } = message.payload;
                    const hexKey = bytesToHex(nip49Decrypt(ncryptsec, password));
                    return { success: true, hexKey };
                } catch (e) {
                    return { success: false, error: e.message || 'Decryption failed' };
                }
            })();
        case 'ncryptsec.encrypt':
            return (async () => {
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
            })();

        // --- NIP-46 Bunker handlers ---
        case 'getProfileType':
            return (async () => {
                const pi = message.payload ?? await getProfileIndex();
                const profile = await getProfile(pi);
                return profile?.type || 'local';
            })();
        case 'bunker.connect':
            return (async () => {
                try {
                    const { profileIndex: bi, bunkerUrl } = message.payload;
                    const session = await createSession(bi, bunkerUrl);
                    const remotePubkey = await session.getPublicKey();
                    // Cache remotePubkey on the profile
                    const profiles = await getProfiles();
                    profiles[bi].remotePubkey = remotePubkey;
                    profiles[bi].bunkerUrl = bunkerUrl;
                    await storage.set({ profiles });
                    return { success: true, remotePubkey };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            })();
        case 'bunker.disconnect':
            return (async () => {
                try {
                    const bi = message.payload;
                    await disconnectSession(bi);
                    return { success: true };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            })();
        case 'bunker.status':
            return (async () => {
                const bi = message.payload ?? await getProfileIndex();
                return { connected: isSessionActive(bi) };
            })();
        case 'bunker.ping':
            return (async () => {
                try {
                    const bi = message.payload ?? await getProfileIndex();
                    const session = await getOrCreateSession(bi);
                    const result = await session.ping();
                    return { success: true, result };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            })();
        case 'bunker.validateUrl':
            return Promise.resolve(validateBunkerUrl(message.payload));

        // --- Vault handlers ---
        case 'vault.publish':
            return (async () => {
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
                        signed = finalizeEvent(unsigned, sk);
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
            })();
        case 'vault.fetch':
            return (async () => {
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

                    // Deduplicate by d-tag — latest created_at wins (NIP-33)
                    const byDtag = new Map();
                    for (const event of allEvents) {
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
            })();
        case 'vault.delete':
            return (async () => {
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
                        signed = finalizeEvent(unsigned, sk);
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
            })();
        case 'vault.getRelays':
            return (async () => {
                try {
                    const profile = await currentProfile();
                    const relays = profile.relays || [];
                    const read = relays.filter(r => r.read).map(r => r.url);
                    const write = relays.filter(r => r.write).map(r => r.url);
                    return { read, write };
                } catch (e) {
                    return { read: [], write: [] };
                }
            })();

        // --- API Key Vault handlers ---
        case 'apikeys.publish':
            return (async () => {
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
                        signed = finalizeEvent(unsigned, sk);
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
            })();
        case 'apikeys.fetch':
            return (async () => {
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

                    // Take latest by created_at (single d-tag, NIP-33 dedup)
                    let latest = null;
                    for (const event of allEvents) {
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
            })();
        case 'apikeys.delete':
            return (async () => {
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
                        signed = finalizeEvent(unsigned, sk);
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
            })();
        case 'apikeys.encrypt':
            return (async () => {
                try {
                    const { plainText } = message.payload;
                    const pubkey = await getPubKey();
                    const cipherText = await nip44Encrypt({ pubKey: pubkey, plainText });
                    return { success: true, cipherText };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            })();
        case 'apikeys.decrypt':
            return (async () => {
                try {
                    const { cipherText } = message.payload;
                    const pubkey = await getPubKey();
                    const plainText = await nip44Decrypt({ pubKey: pubkey, cipherText });
                    return { success: true, plainText };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            })();

        // nostr: protocol URL handler — no key access needed, no permission prompt
        case 'replaceURL':
            return (async () => {
                const { protocol_handler } = await storage.get(['protocol_handler']);
                if (!protocol_handler) return false;
                const { url } = message.payload;
                const raw = url.split('nostr:')[1];
                if (!raw) return false;
                try {
                    const { type, data } = nip19.decode(raw);
                    const replacements = {
                        raw,
                        hrp: type,
                        hex:
                            type === 'npub' || type === 'note'
                                ? data
                                : type === 'nprofile'
                                  ? data.pubkey
                                  : type === 'nevent'
                                    ? data.id
                                    : type === 'naddr'
                                      ? data.pubkey
                                      : raw,
                        p_or_e: { npub: 'p', note: 'e', nprofile: 'p', nevent: 'e', naddr: 'a' }[type] || '',
                        u_or_n: { npub: 'u', note: 'n', nprofile: 'u', nevent: 'n', naddr: 'n' }[type] || '',
                        relay0: data?.relays?.[0] || '',
                        relay1: data?.relays?.[1] || '',
                        relay2: data?.relays?.[2] || '',
                    };
                    let result = protocol_handler;
                    for (const [pattern, value] of Object.entries(replacements)) {
                        result = result.replace(new RegExp(`\\{ *${pattern} *\\}`, 'g'), value);
                    }
                    return result;
                } catch {
                    return false;
                }
            })();

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
    const keyPair = await generateKeyPair();
    return keyPair.privateKey;
}

async function ask(uuid, { kind, host, payload }) {
    // Bunker profiles don't need local key decryption — skip lock check
    const pi = await getProfileIndex();
    const profile = await getProfile(pi);
    const isBunker = profile?.type === 'bunker';

    // If the extension is locked, reject signing/encryption requests (local profiles only)
    if (!isBunker) {
        const isLocked = await checkLockState();
        if (isLocked) {
            const sendResponse = validations[uuid];
            delete validations[uuid];
            sendResponse?.({ error: 'locked', message: 'Extension is locked. Please unlock with your master password.' });
            return;
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

    // Try to show bottom sheet in the active tab's content script
    try {
        const [activeTab] = await api.tabs.query({ active: true, currentWindow: true });
        if (activeTab?.id) {
            const result = await api.tabs.sendMessage(activeTab.id, {
                kind: 'showPermissionSheet',
                host,
                permissionKind: kind,
            });
            
            if (result) {
                if (result.allowed) {
                    complete({
                        payload: uuid,
                        origKind: kind,
                        event: payload,
                        remember: result.remember,
                        host,
                    });
                } else {
                    deny({
                        payload: uuid,
                        origKind: kind,
                        event: payload,
                        remember: result.remember,
                        host,
                    });
                }
                prompt.release();
                return;
            }
        }
    } catch (e) {
        // Content script not available, fall back to tab
        log('Bottom sheet unavailable, falling back to tab:', e.message);
    }

    // Fallback to permission tab
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
            const decoded = nip19.decode(privKey).data;
            hexKey = bytesToHex(decoded);
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

    if (profile.type === 'bunker') return null;

    let hexKey = await getPlaintextPrivKey(index, profile);
    let nsec = nip19.nsecEncode(hexToBytes(hexKey));
    return nsec;
}

async function getNpub(index) {
    let profile = await getProfile(index);

    if (!profile) return null;

    if (profile.type === 'bunker') {
        if (profile.remotePubkey) return nip19.npubEncode(profile.remotePubkey);
        return null;
    }

    try {
        let hexKey = await getPlaintextPrivKey(index, profile);
        if (!hexKey || typeof hexKey !== 'string' || hexKey.length !== 64) {
            return null;
        }
        let pubKey = getPublicKey(hexToBytes(hexKey));
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

    const pi = await getProfileIndex();
    const profile = await getProfile(pi);

    if (profile.type === 'bunker') {
        const session = await getOrCreateSession(pi);
        event = await session.signEvent(event);
    } else {
        let sk = await getPrivKey();
        event = finalizeEvent(event, sk);
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
    return nip04.encrypt(privKey, pubKey, plainText);
}

async function nip04Decrypt({ pubKey, cipherText }) {
    const pi = await getProfileIndex();
    const profile = await getProfile(pi);

    if (profile.type === 'bunker') {
        const session = await getOrCreateSession(pi);
        return session.nip04Decrypt(pubKey, cipherText);
    }

    let privKey = await getPrivKey();
    return nip04.decrypt(privKey, pubKey, cipherText);
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
