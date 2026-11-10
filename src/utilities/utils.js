import { getPublicKeySync, nip19, bytesToHex } from 'nostr-crypto-utils';
import { api } from './browser-polyfill';
import { isRefused } from './page-gate';
import { encrypt, decrypt, hashPassword, verifyPassword } from './crypto';
import { looksLikeSeedPhrase, isValidSeedPhrase } from './seedphrase';
import { scheduleSyncPush } from './sync-manager';
import { updateProfiles } from './profiles-store.js';
import { bunkerSessionsAfterDelete, redactBunkerUrl } from './bunker-url.js';
import { parseGrantKey, resolveGrant } from './consent-policy.js';
import { BLOSSOM_ACTIONS } from './blossom-labels.js';
import {
    encryptWithDeviceKey,
    isDeviceKeyBlob,
    isCiphertext,
    decryptWithDeviceKey,
    resetDeviceKey,
    clearSession as clearVaultSession,
    setUnlocked as setVaultUnlocked,
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
    [13, 'Seal', 'https://github.com/nostr-protocol/nips/blob/master/59.md'],
    [14, 'Private Direct Message', 'https://github.com/nostr-protocol/nips/blob/master/17.md'],
    [16, 'Generic Repost', 'https://github.com/nostr-protocol/nips/blob/master/18.md'],
    [20, 'Picture', 'https://github.com/nostr-protocol/nips/blob/master/68.md'],
    [21, 'Video', 'https://github.com/nostr-protocol/nips/blob/master/71.md'],
    [22, 'Short Video', 'https://github.com/nostr-protocol/nips/blob/master/71.md'],
    [40, 'Channel Creation', 'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [41, 'Channel Metadata', 'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [42, 'Channel Message', 'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [43, 'Channel Hide Message', 'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [44, 'Channel Mute User', 'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [62, 'Request to Vanish', 'https://github.com/nostr-protocol/nips/blob/master/62.md'],
    [1059, 'Gift Wrap', 'https://github.com/nostr-protocol/nips/blob/master/59.md'],
    [1063, 'File Metadata', 'https://github.com/nostr-protocol/nips/blob/master/94.md'],
    [1111, 'Comment', 'https://github.com/nostr-protocol/nips/blob/master/22.md'],
    [1311, 'Live Chat Message', 'https://github.com/nostr-protocol/nips/blob/master/53.md'],
    [1984, 'Reporting', 'https://github.com/nostr-protocol/nips/blob/master/56.md'],
    [1985, 'Label', 'https://github.com/nostr-protocol/nips/blob/master/32.md'],
    [4550, 'Community Post Approval', 'https://github.com/nostr-protocol/nips/blob/master/72.md'],
    [7000, 'Job Feedback', 'https://github.com/nostr-protocol/nips/blob/master/90.md'],
    [9041, 'Zap Goal', 'https://github.com/nostr-protocol/nips/blob/master/75.md'],
    [9734, 'Zap Request', 'https://github.com/nostr-protocol/nips/blob/master/57.md'],
    [9735, 'Zap', 'https://github.com/nostr-protocol/nips/blob/master/57.md'],
    [9802, 'Highlight', 'https://github.com/nostr-protocol/nips/blob/master/84.md'],
    [10000, 'Mute List', 'https://github.com/nostr-protocol/nips/blob/master/51.md'],
    [10001, 'Pin List', 'https://github.com/nostr-protocol/nips/blob/master/51.md'],
    [10002, 'Relay List Metadata', 'https://github.com/nostr-protocol/nips/blob/master/65.md'],
    [10003, 'Bookmark List', 'https://github.com/nostr-protocol/nips/blob/master/51.md'],
    [10063, 'Media Server List', 'https://github.com/nostr-protocol/nips/blob/master/B7.md'],
    [13194, 'Wallet Info', 'https://github.com/nostr-protocol/nips/blob/master/47.md'],
    [22242, 'Client Authentication', 'https://github.com/nostr-protocol/nips/blob/master/42.md'],
    [23194, 'Wallet Request', 'https://github.com/nostr-protocol/nips/blob/master/47.md'],
    [23195, 'Wallet Response', 'https://github.com/nostr-protocol/nips/blob/master/47.md'],
    [24133, 'Nostr Connect', 'https://github.com/nostr-protocol/nips/blob/master/46.md'],
    [24242, 'Blossom Authorization', 'https://github.com/nostr-protocol/nips/blob/master/B7.md'],
    [27235, 'HTTP Auth', 'https://github.com/nostr-protocol/nips/blob/master/98.md'],
    [30000, 'Categorized People List', 'https://github.com/nostr-protocol/nips/blob/master/51.md'],
    [30001, 'Categorized Bookmark List', 'https://github.com/nostr-protocol/nips/blob/master/51.md'],
    [30003, 'Bookmark Set', 'https://github.com/nostr-protocol/nips/blob/master/51.md'],
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
        await updateProfiles(profiles => { profiles.forEach(profile => (profile.hosts = {})); }, { storage });
        return version + 1;
    }

    if (version === 1) {
        console.log('migrating to version 2.');
        await updateProfiles(() => {}, { storage });
        return version + 1;
    }

    if (version === 2) {
        console.log('Migrating to version 3.');
        await updateProfiles(profiles => { profiles.forEach(profile => (profile.relayReminder = true)); }, { storage });
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
        await updateProfiles(profiles => {
            profiles.forEach(profile => {
                if (!profile.type) profile.type = 'local';
                if (profile.bunkerUrl === undefined) profile.bunkerUrl = null;
                if (profile.remotePubkey === undefined) profile.remotePubkey = null;
            });
        }, { storage });
        return version + 1;
    }

    if (version === 5) {
        console.log('Migrating to version 6 (platform sync support).');
        const now = Math.floor(Date.now() / 1000);
        await updateProfiles(profiles => {
            profiles.forEach(profile => {
                if (profile.updatedAt === undefined) profile.updatedAt = now;
            });
            return { platformSyncEnabled: true };
        }, { storage });
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
    // The splice, the index shift, the tombstone and the bunker-session reindex
    // land in one ordered write against a fresh read.
    let emptied = false;
    await updateProfiles((profiles, data) => {
        if (index < 0 || index >= profiles.length) return false;
        // Capture the deleted identity BEFORE the splice so we can tombstone it
        // (issue #3): a deleted profile must not resurrect from the sync mirror.
        const removed = profiles[index];
        const identityKey = (removed && (removed.pubKey || removed.remotePubkey)) || null;
        if (profiles.length === 1) { emptied = true; return false; }
        profiles.splice(index, 1);
        const profileIndex = data.profileIndex;
        // Keep the ACTIVE identity active across the splice:
        //  - deleted the active profile itself → step to the previous slot;
        //  - deleted a profile ORDERED BEFORE the active one → shift the index
        //    down by one so it still points at the same identity;
        //  - deleted a profile after the active one → index unchanged.
        let newIndex;
        if (profileIndex === index) newIndex = Math.max(index - 1, 0);
        else if (index < profileIndex) newIndex = profileIndex - 1;
        else newIndex = profileIndex;
        const write = { profileIndex: newIndex };
        if (identityKey) {
            const deletedProfiles = data.deletedProfiles || {};
            deletedProfiles[identityKey] = Math.floor(Date.now() / 1000);
            write.deletedProfiles = deletedProfiles;
        }
        if (data.bunkerSessions) write.bunkerSessions = bunkerSessionsAfterDelete(data.bunkerSessions, index);
        return write;
    }, { storage, keys: { profileIndex: 0, deletedProfiles: {}, bunkerSessions: null } });
    if (emptied) {
        // Deleting the LAST profile is a "start fresh" reset, not a syncable
        // deletion — clearData wipes storage (any tombstone included) and
        // initialize mints a new default. No profile tombstone is written here.
        await clearData(); // If we have deleted all of the profiles, let's just start fresh with all new data
        await initialize();
    } else {
        // Propagate the deletion (incl. the tombstone) to the storage.sync mirror.
        scheduleSyncPush();
    }
    // sessionKeys and the open remote sessions in the background are keyed by
    // profile INDEX; a mid-list delete shifts every higher index down by one. Ask
    // the background to reindex so a shifted profile still resolves its own key
    // and session without a re-unlock. Privileged, sender-gated kind. Best-effort:
    // both fail CLOSED (each checks the identity it is used for) if this does not run.
    try {
        await api.runtime.sendMessage({ kind: 'reindexSessionKeys', payload: index });
    } catch { /* background unavailable (e.g. tests) — safe to ignore */ }
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
 * have no idea whether a master password session is unlocked, so a tier-agnostic
 * wrap here would ALWAYS device-wrap and quietly drop a device blob into a
 * password-protected vault (the 1.8.0 mixed-state bug). The wrapping decision
 * therefore belongs to the background: when a password is set we ask it to wrap,
 * and it refuses while locked rather than downgrading the blob.
 */
async function wrapPrivKeyForStorage(hex) {
    if (!(await isEncrypted())) {
        // Passwordless (default tier) — the DEVICE key is the correct answer and
        // needs no round trip. Named explicitly rather than left to a
        // tier-choosing helper, so this site keeps producing a device blob
        // whatever ambient session state a future caller sets up.
        if (typeof hex !== 'string' || hex.length === 0) return hex;
        return encryptWithDeviceKey(hex);
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
    await updateProfiles(profiles => {
        if (!profiles[index]) return false;
        profiles[index].name = profileName;
        profiles[index].updatedAt = Math.floor(Date.now() / 1000);
    }, { storage });
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
    const newProfile = await generateProfile('New Profile');
    return appendProfile(newProfile);
}

export async function newBunkerProfile(name = 'New Bunker', bunkerUrl = null) {
    const profile = await generateProfile(name, 'bunker');
    profile.bunkerUrl = bunkerUrl ? redactBunkerUrl(bunkerUrl) : null;
    return appendProfile(profile);
}

/** Append a finished profile in one ordered write; returns its index. */
async function appendProfile(profile) {
    let at = -1;
    await updateProfiles((profiles, data) => {
        profiles.push(profile);
        at = profiles.length - 1;
        return withProfileTombstoneCleared({}, profile, data.deletedProfiles);
    }, { storage, keys: { deletedProfiles: {} } });
    return at;
}

/**
 * Clear-on-recreate for profile tombstones (issue #3): if `profile` has an
 * identity that carries a deletion tombstone, fold a cleared `deletedProfiles`
 * into `write` so re-adding that identity drops its tombstone in the same write.
 * Returns the (possibly extended) write object. A brand-new local key has a
 * fresh random pubkey that won't match a prior tombstone; this matters for a
 * bunker/import recreate of a previously-deleted identity.
 */
function withProfileTombstoneCleared(write, profile, stored) {
    const id = (profile && (profile.pubKey || profile.remotePubkey)) || null;
    if (!id) return write;
    const deletedProfiles = stored || {};
    if (deletedProfiles[id] != null) {
        delete deletedProfiles[id];
        return { ...write, deletedProfiles };
    }
    return write;
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
    await updateProfiles(profiles => {
        const profile = profiles[profileIndex];
        if (!profile) return false;
        profile.relays = fixedRelays;
        profile.updatedAt = Math.floor(Date.now() / 1000);
    }, { storage });
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

export async function getPermission(host, action, index = null) {
    if (index == null) index = await getProfileIndex();
    let profile = await getProfile(index);
    const hosts = profile?.hosts || {};
    const now = Math.floor(Date.now() / 1000);
    // NK-03: grants are now keyed on the full origin (scheme+host[:port]).
    // A present full-origin entry decides, even an expired one: it never falls
    // through to an older bare-host allow.
    if (hosts[host]?.[action] != null) return resolveGrant(hosts[host][action], now);
    // Transition: accept legacy grants that were keyed on the bare hostname.
    try {
        const legacy = new URL(host).host;
        if (legacy && hosts[legacy]?.[action] != null) return resolveGrant(hosts[legacy][action], now);
    } catch { /* host was not a full origin; nothing to migrate */ }
    return 'ask';
}

/** What is stored for this site and action, found the same way getPermission finds it. */
export async function getStoredGrant(host, action, index = null) {
    if (index == null) index = await getProfileIndex();
    const hosts = (await getProfile(index))?.hosts || {};
    if (hosts[host]?.[action] != null) return hosts[host][action];
    try {
        const legacy = new URL(host).host;
        if (legacy && hosts[legacy]?.[action] != null) return hosts[legacy][action];
    } catch { /* not a full origin */ }
    return null;
}

/** The identity a profile is for, when it can be read without the key. */
export function profileIdentity(profile) {
    const id = (profile && (profile.pubKey || profile.remotePubkey)) || null;
    return id ? String(id).toLowerCase() : null;
}

/**
 * Every profile index whose identity is `pubkey`. Two entries can share one key
 * (a local and a bunker profile of the same key, say), and a site's grants
 * apply to the identity, so all of them are returned. `identityOf` reads a
 * profile whose public key is not cached (the background passes its own).
 */
export async function findProfilesByPubkey(pubkey, { identityOf = null, profiles = null } = {}) {
    if (!pubkey) return [];
    const want = String(pubkey).toLowerCase();
    const list = profiles || await getProfiles();
    const found = [];
    for (let i = 0; i < list.length; i++) {
        let id = profileIdentity(list[i]);
        if (!id && identityOf) {
            try { id = (await identityOf(i, list[i]))?.toLowerCase() || null; } catch { id = null; }
        }
        if (id === want) found.push(i);
    }
    return found;
}

/** The first profile index for `pubkey`, or -1. */
export async function findProfileByPubkey(pubkey, opts = {}) {
    const found = await findProfilesByPubkey(pubkey, opts);
    return found.length ? found[0] : -1;
}

function writeGrant(profile, origin, action, value) {
    // A profile adopted from sync arrives without its per-device grants.
    profile.hosts ||= {};
    profile.hosts[origin] = { ...(profile.hosts[origin] || {}), [action]: value };
    // Grants are per device and never sync, so they leave the sync timestamp alone.
    // Bumping it could also let a grant revive a profile deleted on another device.
}

/**
 * Store a site's answer for an identity. The grant lands on every profile with
 * that public key, resolved now, so a list position that moved since the
 * request was made cannot send it to someone else. There is no fallback to the
 * active profile: an unknown identity throws.
 */
export async function setPermission(pubkey, origin, action, value, { identityOf = null } = {}) {
    if (!pubkey) throw new Error('setPermission: an identity public key is required');
    // Identities that need the key to read are worked out first; the write
    // then matches profiles on a fresh read, by identity, never by position.
    const idOf = await identityResolver(identityOf);
    const want = String(pubkey).toLowerCase();
    let found = 0;
    await updateProfiles(profiles => {
        for (const p of profiles) {
            if (idOf(p) === want) { writeGrant(p, origin, action, value); found++; }
        }
        if (found === 0) return false;
    }, { storage });
    if (found === 0) throw new Error('setPermission: no profile has that public key');
}

/**
 * A synchronous identity reader for use inside a profiles write. Profiles with
 * no cached public key are read now (that can need the key), and remembered by
 * their stored key blob so the lookup still holds on a fresh read.
 */
async function identityResolver(identityOf) {
    const byBlob = new Map();
    if (identityOf) {
        const profiles = await getProfiles();
        for (let i = 0; i < profiles.length; i++) {
            const p = profiles[i];
            if (profileIdentity(p) || !p?.privKey) continue;
            let id = null;
            try { id = (await identityOf(i, p))?.toLowerCase() || null; } catch { id = null; }
            byBlob.set(p.privKey, id);
        }
    }
    return (p) => profileIdentity(p) ?? (p?.privKey && byBlob.has(p.privKey) ? byBlob.get(p.privKey) : null);
}

/**
 * Store an answer on the one profile at `index`. Only for a request whose
 * identity could not be read (locked, no cached public key) after the caller
 * has checked that the stored key is still the one the request was stamped
 * with. Everything else writes by public key.
 */
export async function setPermissionForUnreadIdentity(index, origin, action, value, { unreadKey = null } = {}) {
    let found = false;
    await updateProfiles(profiles => {
        const profile = profiles[index];
        if (!profile) return false;
        // The slot must still hold the key the request was stamped with; a
        // delete or reorder since then must not hand the grant to someone else.
        if (unreadKey != null && profile.privKey !== unreadKey) return false;
        found = true;
        writeGrant(profile, origin, action, value);
    }, { storage });
    if (!found) throw new Error(`setPermission: no profile at index ${index} with that key`);
}

/** When each site last had a grant revoked, by stored origin key (ms). Not synced. */
export const SITE_REVOCATIONS_KEY = 'siteRevocations';

/** Was `host` revoked at or after `since` (ms)? Matches the full origin and its legacy bare host. */
export function wasRevokedSince(revocations, host, since) {
    if (!revocations || !host || since == null) return false;
    let bare = null;
    try { bare = new URL(host).host; } catch { /* not a full origin */ }
    return [host, bare].some(k => k && revocations[k] != null && revocations[k] >= since);
}

/**
 * Revoke a site's grant(s). This never fails for want of an identity: it
 * resolves by public key when that can be read (`identityOf` reads a profile
 * with no cached key, as the write side does), else by the row's profile index.
 * A profile whose identity cannot be read at all might be the same key, so it
 * is lowered too: a revoke errs toward removing. It only ever lowers a grant to
 * 'ask', never raises one, writes every action in one storage write, and notes
 * the revocation so an open prompt for the site cannot quietly put it back.
 */
export async function revokePermission({ pubkey = null, index = null, unreadKey = null } = {}, origin, actions, { identityOf = null } = {}) {
    const list = Array.isArray(actions) ? actions : [actions];
    const idOf = pubkey ? await identityResolver(identityOf) : null;
    // The grant is removed, under the full origin and its legacy bare host, so an
    // older entry cannot answer once the newer one is gone.
    // A bare host also clears its https and http full-origin twins.
    let twins = [];
    try { twins = [new URL(origin).host || null]; } catch { twins = [`https://${origin}`, `http://${origin}`]; }
    const keys = [origin, ...twins].filter((k, n, all) => k && all.indexOf(k) === n);
    let targets = new Set();
    await updateProfiles((profiles, data) => {
        targets = new Set();
        if (pubkey) {
            const want = String(pubkey).toLowerCase();
            for (let i = 0; i < profiles.length; i++) {
                const id = idOf(profiles[i]);
                if (id === want || id === null) targets.add(i);
            }
        }
        if (index != null && profiles[index] && targets.size === 0
            && (unreadKey == null || profiles[index].privKey === unreadKey)) targets.add(index);
        for (const i of targets) {
            for (const host of keys) {
                const grants = profiles[i].hosts?.[host];
                if (!grants || typeof grants !== 'object') continue;
                for (const action of list) {
                    if (Object.hasOwn(grants, action)) delete grants[action];
                }
                // A site with nothing left is removed, so it no longer lists.
                if (Object.keys(grants).length === 0) delete profiles[i].hosts[host];
            }
        }
        const revocations = data[SITE_REVOCATIONS_KEY] || {};
        const at = Date.now();
        for (const k of keys) revocations[k] = at;
        return { [SITE_REVOCATIONS_KEY]: revocations };
    }, { storage, keys: { [SITE_REVOCATIONS_KEY]: {} } });
    return [...targets].sort((a, b) => a - b);
}

/** The public key typed into an import box (hex or nsec), or null if it is not a key. */
/** npub for a hex pubkey, or null when it is not one. */
export function npubOfPubkey(hex) {
    if (typeof hex !== 'string' || !/^[0-9a-f]{64}$/i.test(hex)) return null;
    try { return nip19.npubEncode(hex.toLowerCase()); } catch { return null; }
}

export function pubkeyFromKeyInput(input) {
    const raw = String(input || '').trim();
    let hex = raw;
    if (raw.toLowerCase().startsWith('nsec1')) {
        try {
            const decoded = nip19.decode(raw.toLowerCase());
            if (decoded.type !== 'nsec') return null;
            hex = typeof decoded.data === 'string' ? decoded.data : bytesToHex(decoded.data);
        } catch { return null; }
    }
    if (!/^[0-9a-f]{64}$/i.test(hex)) return null;
    try { return getPublicKeySync(hex.toLowerCase()).toLowerCase(); } catch { return null; }
}

export function humanPermission(p) {
    // Handle special case where event signing includes a kind number
    if (p.startsWith('signEvent:')) {
        const target = parseGrantKey(p)?.target;
        if (target) return `Sign in to ${target.replace(/^https:\/\//, '')}`;
        const verb = parseGrantKey(p)?.verb;
        if (verb) return `Sign event: ${BLOSSOM_ACTIONS[verb].label}`;
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
        case 'addRelay':
            return 'Add a relay';
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
    await updateProfiles((profiles, data) => {
        if (!profiles[data.profileIndex]) return false;
        profiles[data.profileIndex].relayReminder = false;
    }, { storage, keys: { profileIndex: 0 } });
}

export async function getNpub(index = null) {
    // Accept an explicit profile index (e.g. the Manage Profiles page listing
    // every profile); default to the active profile for existing callers.
    if (index === null || index === undefined) {
        index = await getProfileIndex();
    }
    const npub = await api.runtime.sendMessage({
        kind: 'getNpub',
        payload: index,
    });
    return isRefused(npub) ? null : npub;
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
 * Re-wrap profile keys with slow crypto outside the profiles lock, and write
 * them with one locked write that also carries `extra` (a new verifier, say).
 *
 * A profile added or re-keyed while the crypto ran would otherwise keep its old
 * wrapping while the new verifier went live. So the locked write first looks
 * for keys that still need the change and were never tried; if there are any it
 * writes nothing and goes round again. After `attempts` rounds it writes what it
 * has and hands those keys back so the caller can report them.
 *
 * `candidate(p)` says a stored key needs the change; `convert(p, i)` returns
 * `{privKey, pubKey?}` or null (the caller notes its own failures);
 * `beforeWrite()` returns the extra keys to write, or false to write nothing.
 *
 * @returns {Promise<{written: boolean, missed: Array<{index:number,name:string}>}>}
 */
async function rewrapProfileKeys({ candidate, convert, beforeWrite = async () => ({}), attempts = 3 }) {
    const changes = new Map();
    const tried = new Set();
    const needs = (p) => p && p.type !== 'bunker' && p.privKey && !tried.has(p.privKey) && candidate(p);
    for (let round = 1; ; round++) {
        const profiles = await getProfiles();
        for (let i = 0; i < profiles.length; i++) {
            const p = profiles[i];
            if (!needs(p)) continue;
            tried.add(p.privKey);
            const out = await convert(p, i);
            if (out) changes.set(p.privKey, out);
        }
        const extra = await beforeWrite();
        if (extra === false) return { written: false, missed: [] };
        let retry = false;
        let missed = [];
        await updateProfiles((list) => {
            missed = [];
            list.forEach((p, i) => { if (needs(p)) missed.push({ index: i, name: p.name || `Profile ${i + 1}` }); });
            if (missed.length && round < attempts) { retry = true; return false; }
            for (const p of list) {
                if (!p || !p.privKey || !changes.has(p.privKey)) continue;
                const c = changes.get(p.privKey);
                if (c.pubKey && !p.pubKey) p.pubKey = c.pubKey;
                if (c.privKey) p.privKey = c.privKey;
            }
            return extra || undefined;
        }, { storage });
        if (!retry) return { written: true, missed };
    }
}

/**
 * Remove master password protection — clears the verifier and re-wraps every
 * secret the password was wrapping (profile keys, API-key secrets, note bodies)
 * onto the DEVICE tier.
 *
 * The password is validated first, so a wrong one leaves the vault exactly as
 * it was. After that the vault session is dropped to the device tier BEFORE any
 * key is re-wrapped, and the re-wrap names `encryptWithDeviceKey` directly
 * rather than going through a helper that chooses a tier from ambient session
 * state: both layers must independently produce a device blob, because the key
 * being removed is the one the session would otherwise wrap under.
 *
 * A profile key that does not open under this password (a blob wrapped under a
 * DIFFERENT password) is left byte-identical and reported in `skipped[]` — it is
 * now a stranded blob, recoverable later with the password it is actually under.
 *
 * @returns {Promise<{skipped: Array<{index:number,name:string}>}>}
 */
export async function removePasswordProtection(password) {
    const valid = await checkPassword(password);
    if (!valid) throw new Error('Invalid password');

    // Device tier from here on: no session key, and not "locked" either.
    clearVaultSession();
    setVaultUnlocked(null);

    // Keys we could not open with this password are left byte-identical (never
    // downgraded, never dropped). We REPORT them so the caller can tell the user
    // instead of silently stranding them — a removePassword skip is genuinely
    // stranded and recoverable later with the password it is actually wrapped under.
    const skipped = [];
    let secondary = null;
    const { missed } = await rewrapProfileKeys({
        candidate: () => true,
        convert: async (p, i) => {
            // Decrypt to hex, then RE-WRAP under the device key. Removing the
            // password must never downgrade a key to plaintext at rest (T0-4).
            // A blob wrapped under a DIFFERENT password makes toHexPrivKey throw
            // (AEAD auth failure), so catch it: that key is left byte-identical and
            // reported, never dropped and never allowed to fail the whole removal.
            let hex = null;
            try { hex = await toHexPrivKey(p.privKey, password); } catch { hex = null; }
            if (hex) return { privKey: await encryptWithDeviceKey(hex) };
            // Only a genuine unopened PASSWORD blob counts. Empty ('') and
            // device-wrapped keys are neither re-wrapped nor skipped — this
            // predicate mirrors findStrandedPasswordKeys exactly so the reported
            // count never disagrees with the stranded count.
            if (isEncryptedBlob(p.privKey)) skipped.push({ index: i, name: p.name || `Profile ${i + 1}` });
            return null;
        },
        // Profile keys are not the only secrets a password session wraps: API-key
        // secrets and note bodies are written through the tier-agnostic helper, so
        // any of them saved while unlocked is a password blob too. They move to the
        // device tier in the SAME write.
        beforeWrite: async () => {
            secondary ??= await devicifySecondaryStores(password);
            return { ...secondary.updates, isEncrypted: false, passwordHash: null, passwordSalt: null };
        },
    });
    skipped.push(...missed);
    // Additive, advisory return. When every key opened, skipped is []; callers
    // that ignore it see the same success as before (never throws on the happy path).
    return { skipped };
}
/**
 * Move every master-password blob in the secondary secret stores — API-key
 * secrets and vault-note bodies — onto the DEVICE tier, using `password`.
 *
 * A password blob carries its own salt and authentication tag, so the blob
 * itself verifies the password; no stored verifier is needed. Each item is
 * converted independently, and one that does not open is left byte-identical:
 * a secret wrapped under some other password is preserved, never overwritten.
 *
 * Returns a storage patch rather than writing, so the caller can fold it into
 * its own single `storage.set` and keep the conversion all-or-nothing.
 *
 * @returns {Promise<{updates: Object, converted: number, failed: number}>}
 */
async function devicifySecondaryStores(password) {
    const data = await storage.get({ apiKeyVault: null, vaultDocs: null });
    const updates = {};
    let converted = 0;
    let failed = 0;

    /** Returns the device blob, or null to leave the original in place. */
    async function devicify(value) {
        if (!isEncryptedBlob(value)) return null;
        try {
            const plain = await decrypt(value, password);
            if (!plain) return null;
            const wrapped = await encryptWithDeviceKey(plain);
            converted++;
            return wrapped;
        } catch {
            failed++;
            return null;
        }
    }

    if (data.apiKeyVault && data.apiKeyVault.keys) {
        let changed = false;
        for (const key of Object.values(data.apiKeyVault.keys)) {
            if (!key || !key.secret) continue;
            const fresh = await devicify(key.secret);
            if (fresh) { key.secret = fresh; changed = true; }
        }
        if (changed) updates.apiKeyVault = data.apiKeyVault;
    }

    if (data.vaultDocs && typeof data.vaultDocs === 'object') {
        let changed = false;
        for (const doc of Object.values(data.vaultDocs)) {
            if (!doc || !doc.content) continue;
            const fresh = await devicify(doc.content);
            if (fresh) { doc.content = fresh; changed = true; }
        }
        if (changed) updates.vaultDocs = data.vaultDocs;
    }

    return { updates, converted, failed };
}

/**
 * Find profile keys that are wrapped under a master password for which the
 * vault holds no verifier.
 *
 * Only a vault with NO verifier qualifies: while `isEncrypted` / `passwordHash`
 * are on file, those blobs belong to the ordinary unlock path.
 *
 * @returns {Promise<{stranded: number[], usable: number}>} indices of the
 *   stranded profiles, and how many other profiles still hold a readable key.
 */
export async function findStrandedPasswordKeys() {
    const data = await storage.get({ isEncrypted: false, passwordHash: null, profiles: [] });
    if (data.isEncrypted || data.passwordHash) return { stranded: [], usable: 0 };
    const profiles = Array.isArray(data.profiles) ? data.profiles : [];
    const stranded = [];
    let usable = 0;
    for (let i = 0; i < profiles.length; i++) {
        const p = profiles[i];
        if (!p || p.type === 'bunker' || !p.privKey) continue;
        if (isEncryptedBlob(p.privKey)) stranded.push(i);
        else usable++;
    }
    return { stranded, usable };
}

/**
 * Re-wrap stranded profile keys — and any stranded API-key secret or note body
 * — onto the DEVICE tier, using the master password they were wrapped under.
 *
 * The blobs verify the password themselves, which is what makes this possible
 * without a verifier. Per profile try/catch: a blob that does not open is left
 * byte-identical, and nothing at all is written unless at least one profile key
 * opened, so a wrong password changes nothing. The vault stays passwordless —
 * this restores access, it does not re-establish a master password.
 *
 * @returns {Promise<{stranded:number, recovered:number,
 *                    failed:Array<{index:number,name:string}>}>}
 */
export async function recoverStrandedKeys(password) {
    const { stranded } = await findStrandedPasswordKeys();
    if (stranded.length === 0) return { stranded: 0, recovered: 0, failed: [] };

    // Device tier for every write below — the password supplied here is the one
    // the vault no longer keeps, and nothing may be wrapped under it again.
    clearVaultSession();
    setVaultUnlocked(null);

    const failed = [];
    let recovered = 0;
    let secondary = null;
    const { missed } = await rewrapProfileKeys({
        candidate: (p) => isEncryptedBlob(p.privKey),
        convert: async (p, i) => {
            try {
                const hex = await decrypt(p.privKey, password);
                if (!hex) throw new Error('empty key');
                const change = { privKey: await encryptWithDeviceKey(hex) };
                if (!p.pubKey) {
                    try { change.pubKey = getPublicKeySync(hex); } catch { /* leave uncached */ }
                }
                recovered++;
                return change;
            } catch {
                // T0-6: name the profile, never the blob.
                failed.push({ index: i, name: p.name || `Profile ${i + 1}` });
                return null;
            }
        },
        beforeWrite: async () => {
            // Nothing at all is written unless at least one profile key opened.
            if (recovered === 0) return false;
            secondary ??= await devicifySecondaryStores(password);
            return secondary.updates;
        },
    });
    failed.push(...missed);
    return { stranded: stranded.length, recovered, failed };
}
/**
 * Encrypt all profile private keys with a master password.
 */
export async function encryptAllKeys(password) {
    const { hash, salt } = await hashPassword(password);
    const { missed } = await rewrapProfileKeys({
        candidate: (p) => !isEncryptedBlob(p.privKey), // already password-encrypted
        convert: async (p) => {
            // Unwrap device-wrapped or plaintext keys to hex, then password-encrypt.
            const hex = isDeviceKeyBlob(p.privKey) ? await decryptWithDeviceKey(p.privKey) : p.privKey;
            return hex ? { privKey: await encrypt(hex, password) } : null;
        },
        // The verifier goes live in the same write as the keys it covers.
        beforeWrite: async () => ({ passwordHash: hash, passwordSalt: salt, isEncrypted: true }),
    });
    if (missed.length) console.warn(`[encryptAllKeys] ${missed.length} profile key(s) changed while encrypting and were left as they were`);
}
/**
 * Re-encrypt all keys with a new password (requires the old password).
 *
 * A key that does not open under `oldPassword` is left byte-identical and
 * REPORTED in the returned `skipped[]`. Note the important difference from
 * removePassword: a changePassword skip is orphaned under an even-OLDER password
 * while the NEW verifier goes live, so it is NOT stranded (findStrandedPasswordKeys
 * returns [] while a verifier is present) and recoverStrandedKeys cannot open it.
 * Recovery is a two-step remove-then-recover, so callers must NOT word this as
 * "unlock to recover". Reported, never swallowed, never throws on the happy path.
 *
 * @returns {Promise<{skipped: Array<{index:number,name:string}>}>}
 */
export async function changePasswordForKeys(oldPassword, newPassword) {
    const skipped = [];
    const { hash, salt } = await hashPassword(newPassword);
    const { missed } = await rewrapProfileKeys({
        candidate: () => true,
        convert: async (p, i) => {
            // A blob under an even-older password throws here (AEAD auth failure);
            // catch it and leave it byte-identical rather than failing the change.
            let hex = null;
            try { hex = await toHexPrivKey(p.privKey, oldPassword); } catch { hex = null; }
            if (!hex) {
                // Same isEncryptedBlob gate as removePassword: empty ('') and
                // device-wrapped keys are not "skipped", only genuine password blobs.
                if (isEncryptedBlob(p.privKey)) skipped.push({ index: i, name: p.name || `Profile ${i + 1}` });
                return null;
            }
            return { privKey: await encrypt(hex, newPassword) };
        },
        beforeWrite: async () => ({ passwordHash: hash, passwordSalt: salt, isEncrypted: true }),
    });
    skipped.push(...missed);
    return { skipped };
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
