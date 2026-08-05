import { getPublicKeySync } from 'nostr-crypto-utils';
import { api } from './browser-polyfill';
import { encrypt, decrypt, hashPassword, verifyPassword } from './crypto';
import { looksLikeSeedPhrase, isValidSeedPhrase } from './seedphrase';
import {
    wrapSecret,
    isDeviceKeyBlob,
    isCiphertext,
    decryptWithDeviceKey,
    resetDeviceKey,
} from './secret-vault';

export { isDeviceKeyBlob, isCiphertext };

const DB_VERSION = 6;
const storage = api.storage.local;
export const RECOMMENDED_RELAYS = [
    new URL('wss://relay.damus.io'),
    new URL('wss://relay.primal.net'),
    new URL('wss://relay.snort.social'),
    new URL('wss://relay.getalby.com/v1'),
    new URL('wss://nos.lol'),
];
// prettier-ignore
export const KINDS = [
    [0, 'Metadata', 'https://github.com/nostr-protocol/nips/blob/master/01.md'],
    [1, 'Text', 'https://github.com/nostr-protocol/nips/blob/master/01.md'],
    [2, 'Recommend Relay', 'https://github.com/nostr-protocol/nips/blob/master/01.md'],
    [3, 'Contacts', 'https://github.com/nostr-protocol/nips/blob/master/02.md'],
    [4, 'Encrypted Direct Messages', 'https://github.com/nostr-protocol/nips/blob/master/04.md'],
    [5, 'Event Deletion', 'https://github.com/nostr-protocol/nips/blob/master/09.md'],
    [6, 'Repost', 'https://github.com/nostr-protocol/nips/blob/master/18.md'],
    [7, 'Reaction', 'https://github.com/nostr-protocol/nips/blob/master/25.md'],
    [8, 'Badge Award', 'https://github.com/nostr-protocol/nips/blob/master/58.md'],
    [16, 'Generic Repost', 'https://github.com/nostr-protocol/nips/blob/master/18.md'],
    [40, 'Channel Creation', 'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [41, 'Channel Metadata', 'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [42, 'Channel Message', 'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [43, 'Channel Hide Message', 'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [44, 'Channel Mute User', 'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [1063, 'File Metadata', 'https://github.com/nostr-protocol/nips/blob/master/94.md'],
    [1311, 'Live Chat Message', 'https://github.com/nostr-protocol/nips/blob/master/53.md'],
    [1984, 'Reporting', 'https://github.com/nostr-protocol/nips/blob/master/56.md'],
    [1985, 'Label', 'https://github.com/nostr-protocol/nips/blob/master/32.md'],
    [4550, 'Community Post Approval', 'https://github.com/nostr-protocol/nips/blob/master/72.md'],
    [7000, 'Job Feedback', 'https://github.com/nostr-protocol/nips/blob/master/90.md'],
    [9041, 'Zap Goal', 'https://github.com/nostr-protocol/nips/blob/master/75.md'],
    [9734, 'Zap Request', 'https://github.com/nostr-protocol/nips/blob/master/57.md'],
    [9735, 'Zap', 'https://github.com/nostr-protocol/nips/blob/master/57.md'],
    [10000, 'Mute List', 'https://github.com/nostr-protocol/nips/blob/master/51.md'],
    [10001, 'Pin List', 'https://github.com/nostr-protocol/nips/blob/master/51.md'],
    [10002, 'Relay List Metadata', 'https://github.com/nostr-protocol/nips/blob/master/65.md'],
    [13194, 'Wallet Info', 'https://github.com/nostr-protocol/nips/blob/master/47.md'],
    [22242, 'Client Authentication', 'https://github.com/nostr-protocol/nips/blob/master/42.md'],
    [23194, 'Wallet Request', 'https://github.com/nostr-protocol/nips/blob/master/47.md'],
    [23195, 'Wallet Response', 'https://github.com/nostr-protocol/nips/blob/master/47.md'],
    [24133, 'Nostr Connect', 'https://github.com/nostr-protocol/nips/blob/master/46.md'],
    [27235, 'HTTP Auth', 'https://github.com/nostr-protocol/nips/blob/master/98.md'],
    [30000, 'Categorized People List', 'https://github.com/nostr-protocol/nips/blob/master/51.md'],
    [30001, 'Categorized Bookmark List', 'https://github.com/nostr-protocol/nips/blob/master/51.md'],
    [30008, 'Profile Badges', 'https://github.com/nostr-protocol/nips/blob/master/58.md'],
    [30009, 'Badge Definition', 'https://github.com/nostr-protocol/nips/blob/master/58.md'],
    [30017, 'Create or update a stall', 'https://github.com/nostr-protocol/nips/blob/master/15.md'],
    [30018, 'Create or update a product', 'https://github.com/nostr-protocol/nips/blob/master/15.md'],
    [30023, 'Long-Form Content', 'https://github.com/nostr-protocol/nips/blob/master/23.md'],
    [30024, 'Draft Long-form Content', 'https://github.com/nostr-protocol/nips/blob/master/23.md'],
    [30078, 'Application-specific Data', 'https://github.com/nostr-protocol/nips/blob/master/78.md'],
    [30311, 'Live Event', 'https://github.com/nostr-protocol/nips/blob/master/53.md'],
    [30315, 'User Statuses', 'https://github.com/nostr-protocol/nips/blob/master/38.md'],
    [30402, 'Classified Listing', 'https://github.com/nostr-protocol/nips/blob/master/99.md'],
    [30403, 'Draft Classified Listing', 'https://github.com/nostr-protocol/nips/blob/master/99.md'],
    [31922, 'Date-Based Calendar Event', 'https://github.com/nostr-protocol/nips/blob/master/52.md'],
    [31923, 'Time-Based Calendar Event', 'https://github.com/nostr-protocol/nips/blob/master/52.md'],
    [31924, 'Calendar', 'https://github.com/nostr-protocol/nips/blob/master/52.md'],
    [31925, 'Calendar Event RSVP', 'https://github.com/nostr-protocol/nips/blob/master/52.md'],
    [31989, 'Handler recommendation', 'https://github.com/nostr-protocol/nips/blob/master/89.md'],
    [31990, 'Handler information', 'https://github.com/nostr-protocol/nips/blob/master/89.md'],
    [34550, 'Community Definition', 'https://github.com/nostr-protocol/nips/blob/master/72.md'],
];

export async function initialize() {
    await getOrSetDefault('profileIndex', 0);
    // Lazy: only mint a key when there is genuinely no profile list. The eager
    // form generated (and threw away) a fresh key on EVERY initialize() call,
    // which also meant a locked vault could not run initialize() at all once
    // key wrapping became password-aware.
    await getOrSetDefaultLazy('profiles', () => generateProfile().then(p => [p]));
    let version = (await storage.get({ version: 0 })).version;
    console.log('DB version: ', version);
    while (version < DB_VERSION) {
        version = await migrate(version, DB_VERSION);
        await storage.set({ version });
    }
}

async function migrate(version, goal) {
    if (version === 0) {
        console.log('Migrating to version 1.');
        let profiles = await getProfiles();
        profiles.forEach(profile => (profile.hosts = {}));
        await storage.set({ profiles });
        return version + 1;
    }

    if (version === 1) {
        console.log('migrating to version 2.');
        let profiles = await getProfiles();
        await storage.set({ profiles });
        return version + 1;
    }

    if (version === 2) {
        console.log('Migrating to version 3.');
        let profiles = await getProfiles();
        profiles.forEach(profile => (profile.relayReminder = true));
        await storage.set({ profiles });
        return version + 1;
    }

    if (version === 3) {
        console.log('Migrating to version 4 (encryption support).');
        // No data transformation needed — existing plaintext keys stay as-is.
        // Encryption only activates when the user sets a master password.
        // We just ensure the isEncrypted flag exists and defaults to false.
        let data = await storage.get({ isEncrypted: false });
        if (!data.isEncrypted) {
            await storage.set({ isEncrypted: false });
        }
        return version + 1;
    }

    if (version === 4) {
        console.log('Migrating to version 5 (NIP-46 bunker support).');
        let profiles = await getProfiles();
        profiles.forEach(profile => {
            if (!profile.type) profile.type = 'local';
            if (profile.bunkerUrl === undefined) profile.bunkerUrl = null;
            if (profile.remotePubkey === undefined) profile.remotePubkey = null;
        });
        await storage.set({ profiles });
        return version + 1;
    }

    if (version === 5) {
        console.log('Migrating to version 6 (platform sync support).');
        const now = Math.floor(Date.now() / 1000);
        let profiles = await getProfiles();
        profiles.forEach(profile => {
            if (profile.updatedAt === undefined) profile.updatedAt = now;
        });
        await storage.set({ profiles, platformSyncEnabled: true });
        return version + 1;
    }
}

export async function getProfiles() {
    let profiles = await storage.get({ profiles: [] });
    return profiles.profiles;
}

export async function getProfile(index) {
    let profiles = await getProfiles();
    return profiles[index];
}

export async function getProfileNames() {
    let profiles = await getProfiles();
    return profiles.map(p => p.name);
}

export async function getProfileIndex() {
    const index = await storage.get({ profileIndex: 0 });
    return index.profileIndex;
}

export async function setProfileIndex(profileIndex) {
    await storage.set({ profileIndex });
}

export async function deleteProfile(index) {
    let profiles = await getProfiles();
    let profileIndex = await getProfileIndex();
    profiles.splice(index, 1);
    if (profiles.length == 0) {
        await clearData(); // If we have deleted all of the profiles, let's just start fresh with all new data
        await initialize();
    } else {
        // If the index deleted was the active profile, change the active profile to the next one
        let newIndex =
            profileIndex === index ? Math.max(index - 1, 0) : profileIndex;
        await storage.set({ profiles, profileIndex: newIndex });
    }
}

export async function clearData() {
    let ignoreInstallHook = await storage.get({ ignoreInstallHook: false });
    await storage.clear();
    // The device-key seed and its sticky strategy lived in the storage we just
    // wiped. Drop secret-vault's memoised handles so the next wrap mints a NEW
    // persisted key instead of reusing one with no backing material.
    resetDeviceKey();
    await storage.set(ignoreInstallHook);
}

async function generatePrivateKey() {
    return await api.runtime.sendMessage({ kind: 'generatePrivateKey' });
}

/**
 * Wrap a freshly minted / imported private key for storage.
 *
 * generateProfile runs in the side panel, options and popup — contexts that
 * have no idea whether a master password session is unlocked, so calling
 * wrapSecret() here would ALWAYS device-wrap and quietly drop a device blob
 * into a password-protected vault (the 1.8.0 mixed-state bug). The wrapping
 * decision therefore belongs to the background: when a password is set we ask
 * it to wrap, and it refuses while locked rather than downgrading the blob.
 */
async function wrapPrivKeyForStorage(hex) {
    if (!(await isEncrypted())) {
        // Passwordless (default tier) — device wrap is the correct answer and
        // needs no round trip.
        return wrapSecret(hex);
    }
    const result = await api.runtime.sendMessage({ kind: 'wrapPrivKey', payload: hex });
    if (!result || !result.success || !result.blob) {
        throw new Error(result?.error || 'Could not encrypt the new key — unlock NostrKey and try again.');
    }
    return result.blob;
}

export async function generateProfile(name = 'Default Nostr Profile', type = 'local') {
    // T0-4: never persist a private key as plaintext hex. A new local key is
    // wrapped at rest immediately — device key when passwordless, password
    // session key (via the background) when a master password is set. The
    // public key is cached so npub display works without unwrapping.
    let privKey = '';
    let pubKey = '';
    if (type === 'local') {
        const hex = await generatePrivateKey();
        try { pubKey = getPublicKeySync(hex); } catch { /* leave uncached */ }
        privKey = await wrapPrivKeyForStorage(hex);
    }
    return {
        name,
        privKey,
        pubKey,
        hosts: {},
        relays: RECOMMENDED_RELAYS.map(r => ({ url: r.href, read: true, write: true })),
        relayReminder: false,
        type,
        bunkerUrl: null,
        remotePubkey: null,
        updatedAt: Math.floor(Date.now() / 1000),
    };
}

async function getOrSetDefault(key, def) {
    let val = (await storage.get(key))[key];
    if (val == null || val == undefined) {
        await storage.set({ [key]: def });
        return def;
    }

    return val;
}

/** getOrSetDefault whose default is only computed when it is actually needed. */
async function getOrSetDefaultLazy(key, makeDefault) {
    let val = (await storage.get(key))[key];
    if (val == null || val == undefined) {
        const def = await makeDefault();
        await storage.set({ [key]: def });
        return def;
    }

    return val;
}

export async function saveProfileName(index, profileName) {
    let profiles = await getProfiles();
    profiles[index].name = profileName;
    profiles[index].updatedAt = Math.floor(Date.now() / 1000);
    await storage.set({ profiles });
}

export async function savePrivateKey(index, privateKey) {
    const result = await api.runtime.sendMessage({
        kind: 'savePrivateKey',
        payload: [index, privateKey],
    });
    // The background refuses rather than writing a key the master password
    // could never open — surface that instead of reporting a silent success.
    if (result && result.success === false) {
        throw new Error(result.error || 'Could not save the private key.');
    }
    return true;
}

export async function newProfile() {
    let profiles = await getProfiles();
    const newProfile = await generateProfile('New Profile');
    profiles.push(newProfile);
    await storage.set({ profiles });
    return profiles.length - 1;
}

export async function newBunkerProfile(name = 'New Bunker', bunkerUrl = null) {
    let profiles = await getProfiles();
    const profile = await generateProfile(name, 'bunker');
    profile.bunkerUrl = bunkerUrl;
    profiles.push(profile);
    await storage.set({ profiles });
    return profiles.length - 1;
}

export async function getRelays(profileIndex) {
    let profile = await getProfile(profileIndex);
    return profile.relays || [];
}

export async function saveRelays(profileIndex, relays) {
    // Having an Alpine proxy object as a sub-object does not serialize correctly in storage,
    // so we are pre-serializing here before assigning it to the profile, so the proxy
    // obj doesn't bug out.
    let fixedRelays = JSON.parse(JSON.stringify(relays));
    let profiles = await getProfiles();
    let profile = profiles[profileIndex];
    profile.relays = fixedRelays;
    profile.updatedAt = Math.floor(Date.now() / 1000);
    await storage.set({ profiles });
}

export async function get(item) {
    return (await storage.get(item))[item];
}

export async function getPermissions(index = null) {
    if (index == null) {
        index = await getProfileIndex();
    }
    let profile = await getProfile(index);
    let hosts = await profile.hosts;
    return hosts;
}

export async function getPermission(host, action) {
    let index = await getProfileIndex();
    let profile = await getProfile(index);
    const hosts = profile?.hosts || {};
    // NK-03: grants are now keyed on the full origin (scheme+host[:port]).
    if (hosts[host]?.[action]) return hosts[host][action];
    // Transition: accept legacy grants that were keyed on the bare hostname.
    try {
        const legacy = new URL(host).host;
        if (legacy && hosts[legacy]?.[action]) return hosts[legacy][action];
    } catch { /* host was not a full origin; nothing to migrate */ }
    return 'ask';
}

export async function setPermission(host, action, perm, index = null) {
    let profiles = await getProfiles();
    if (!index) {
        index = await getProfileIndex();
    }
    let profile = profiles[index];
    let newPerms = profile.hosts[host] || {};
    newPerms = { ...newPerms, [action]: perm };
    profile.hosts[host] = newPerms;
    profile.updatedAt = Math.floor(Date.now() / 1000);
    profiles[index] = profile;
    await storage.set({ profiles });
}

export function humanPermission(p) {
    // Handle special case where event signing includes a kind number
    if (p.startsWith('signEvent:')) {
        let [e, n] = p.split(':');
        n = parseInt(n);
        let nname = KINDS.find(k => k[0] === n)?.[1] || `Unknown (Kind ${n})`;
        return `Sign event: ${nname}`;
    }

    switch (p) {
        case 'getPubKey':
            return 'Read public key';
        case 'signEvent':
            return 'Sign event';
        case 'getRelays':
            return 'Read relay list';
        case 'nip04.encrypt':
            return 'Encrypt private message (NIP-04)';
        case 'nip04.decrypt':
            return 'Decrypt private message (NIP-04)';
        case 'nip44.encrypt':
            return 'Encrypt private message (NIP-44)';
        case 'nip44.decrypt':
            return 'Decrypt private message (NIP-44)';
        default:
            return 'Unknown';
    }
}

export function validateKey(key) {
    const hexMatch = /^[\da-f]{64}$/i.test(key);
    const b32Match = /^nsec1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58}$/.test(key);

    return hexMatch || b32Match || isNcryptsec(key) || isValidSeedPhrase(key);
}

export { looksLikeSeedPhrase };
export const isSeedPhrase = isValidSeedPhrase;

export function isNcryptsec(key) {
    return /^ncryptsec1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/.test(key);
}

export async function feature(name) {
    let fname = `feature:${name}`;
    let f = await api.storage.local.get({ [fname]: false });
    return f[fname];
}

export async function relayReminder() {
    let index = await getProfileIndex();
    let profile = await getProfile(index);
    return profile.relayReminder;
}

export async function toggleRelayReminder() {
    let index = await getProfileIndex();
    let profiles = await getProfiles();
    profiles[index].relayReminder = false;
    await storage.set({ profiles });
}

export async function getNpub(index = null) {
    // Accept an explicit profile index (e.g. the Manage Profiles page listing
    // every profile); default to the active profile for existing callers.
    if (index === null || index === undefined) {
        index = await getProfileIndex();
    }
    return await api.runtime.sendMessage({
        kind: 'getNpub',
        payload: index,
    });
}

// --- Master password encryption helpers -------------------------------------

/**
 * Check whether master password encryption is active.
 *
 * Defensive: checks multiple indicators, not just the boolean flag.
 * If passwordHash or encrypted key blobs exist but the isEncrypted flag
 * is false (inconsistent state from service worker crash, race condition,
 * etc.), self-heals by setting the flag back to true.
 */
export async function isEncrypted() {
    const data = await storage.get({ isEncrypted: false, passwordHash: null });
    if (data.isEncrypted) return true;

    // Fallback: passwordHash exists but flag is stale
    if (data.passwordHash) {
        await storage.set({ isEncrypted: true });
        return true;
    }

    // NOTE: we deliberately do NOT infer "encrypted" from the presence of an
    // encrypted key blob. Since v1.7.0 every private key is encrypted at rest by
    // default (device-key vault) even for the passwordless Level-0 user. A
    // master-password lock is proven only by `isEncrypted`/`passwordHash`, never
    // by ciphertext at rest. Treating a stray password-style blob (e.g. from an
    // interrupted password change or a cross-device sync that carries profiles
    // but not the local passwordHash) as "password-protected" would latch the
    // vault into a lockable state with no recoverable password — surfacing as a
    // dead-end unlock screen after the next service-worker restart.
    return false;
}

/**
 * Store the password verification hash (never the password itself).
 */
export async function setPasswordHash(password) {
    const { hash, salt } = await hashPassword(password);
    await storage.set({
        passwordHash: hash,
        passwordSalt: salt,
        isEncrypted: true,
    });
}

/**
 * Verify a password against the stored hash.
 */
export async function checkPassword(password) {
    const data = await storage.get({
        passwordHash: null,
        passwordSalt: null,
    });
    if (!data.passwordHash || !data.passwordSalt) return false;
    return verifyPassword(password, data.passwordHash, data.passwordSalt);
}

/**
 * Remove master password protection — clears hash and decrypts all keys.
 */
export async function removePasswordProtection(password) {
    const valid = await checkPassword(password);
    if (!valid) throw new Error('Invalid password');

    let profiles = await getProfiles();
    for (let i = 0; i < profiles.length; i++) {
        if (profiles[i].type === 'bunker') continue;
        // Decrypt to hex, then RE-WRAP under the device key. Removing the
        // password must never downgrade a key to plaintext at rest (T0-4).
        const hex = await toHexPrivKey(profiles[i].privKey, password);
        if (hex) profiles[i].privKey = await wrapSecret(hex);
    }
    await storage.set({
        profiles,
        isEncrypted: false,
        passwordHash: null,
        passwordSalt: null,
    });
}

/**
 * Encrypt all profile private keys with a master password.
 */
export async function encryptAllKeys(password) {
    let profiles = await getProfiles();
    for (let i = 0; i < profiles.length; i++) {
        if (profiles[i].type === 'bunker') continue;
        if (isEncryptedBlob(profiles[i].privKey)) continue; // already password-encrypted
        // Unwrap device-wrapped or plaintext keys to hex, then password-encrypt.
        const hex = isDeviceKeyBlob(profiles[i].privKey)
            ? await decryptWithDeviceKey(profiles[i].privKey)
            : profiles[i].privKey;
        if (hex) profiles[i].privKey = await encrypt(hex, password);
    }
    await setPasswordHash(password);
    await storage.set({ profiles });
}

/**
 * Re-encrypt all keys with a new password (requires the old password).
 */
export async function changePasswordForKeys(oldPassword, newPassword) {
    let profiles = await getProfiles();
    for (let i = 0; i < profiles.length; i++) {
        if (profiles[i].type === 'bunker') continue;
        const hex = await toHexPrivKey(profiles[i].privKey, oldPassword);
        if (!hex) continue;
        profiles[i].privKey = await encrypt(hex, newPassword);
    }
    const { hash, salt } = await hashPassword(newPassword);
    await storage.set({
        profiles,
        passwordHash: hash,
        passwordSalt: salt,
        isEncrypted: true,
    });
}

/**
 * Decrypt a single profile's private key, returning the hex string.
 * Handles password blobs (via password), device-wrapped blobs (via device key),
 * and legacy plaintext (returned as-is).
 */
export async function getDecryptedPrivKey(profile, password) {
    if (profile.type === 'bunker') return '';
    return toHexPrivKey(profile.privKey, password);
}

/**
 * Resolve any stored private-key representation to raw hex.
 * @param {string} stored   password blob | device blob | plaintext hex
 * @param {string} password master password (only needed for password blobs)
 */
export async function toHexPrivKey(stored, password) {
    if (!stored) return stored;
    if (isEncryptedBlob(stored)) return decrypt(stored, password);
    if (isDeviceKeyBlob(stored)) return decryptWithDeviceKey(stored);
    return stored;
}

/**
 * Check whether a stored value looks like an encrypted blob.
 * Encrypted blobs are JSON strings containing {salt, iv, ciphertext}.
 */
export function isEncryptedBlob(value) {
    if (typeof value !== 'string') return false;
    try {
        const parsed = JSON.parse(value);
        return !!(parsed.salt && parsed.iv && parsed.ciphertext);
    } catch {
        return false;
    }
}
