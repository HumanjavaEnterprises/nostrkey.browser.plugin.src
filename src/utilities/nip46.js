/**
 * NIP-46 Nostr Connect (nsecBunker) Client
 *
 * Implements the client side of NIP-46 for remote signing.
 * The extension connects to a bunker via Nostr relays.
 * The bunker holds the nsec and performs signing operations.
 *
 * Flow:
 *   1. User provides a bunker:// connection string
 *   2. Client generates an ephemeral keypair for the session
 *   3. Client connects to the relay specified in the connection string
 *   4. Client sends NIP-44 encrypted requests to the bunker pubkey
 *   5. Bunker responds with NIP-44 encrypted results
 *   6. Client decrypts and returns the result
 *
 * Connection string format:
 *   bunker://<remote-signer-pubkey>?relay=wss://...&relay=wss://...&secret=<optional>
 */

import {
    finalizeEvent,
    bytesToHex,
    hexToBytes,
    calculateEventId,
    nip19,
    verifySignature,
} from 'nostr-crypto-utils';
import { generateKeyPair } from './keys.js';
import * as nip44 from 'nostr-crypto-utils/nip44';
import { api } from './browser-polyfill';
import { encryptWithDeviceKey, decryptWithDeviceKey, isDeviceKeyBlob } from './secret-vault';
import { parseBunkerUrl } from './bunker-url.js';
import { matchesRequest } from './signer-answer.js';

export { parseBunkerUrl };

const storage = api.storage.local;
const log = msg => console.log('NIP-46: ', msg);

// How long a remote signer has to answer one request. The page's own wait in
// nostr.js has to cover this, see PROMPT_WAIT_MS in background.js.
const REMOTE_REQUEST_MS = 30_000;

// Reject bunker responses whose created_at drifts more than this from local
// time (BUNK-09 replay/freshness guard).
const RESPONSE_FRESHNESS_SECS = 300;

// When a request gives no created_at the signer fills in its own clock, which must
// fall within this many seconds of ours, the same allowance as a response event.
const SIGNER_CLOCK_SECS = RESPONSE_FRESHNESS_SECS;

/** Are these the same public key? Hex case does not matter. */
export function samePubkey(a, b) {
    return String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();
}

/**
 * A public key as a signer gave it, in lower case.
 *
 * @param {*} value
 * @returns {string}
 * @throws if it is not 64 hex characters
 */
export function parsePubkey(value) {
    if (typeof value !== 'string' || !/^[0-9a-f]{64}$/i.test(value)) {
        throw new Error('The remote signer did not give a valid public key.');
    }
    return value.toLowerCase();
}

/**
 * Is this what a signer should have answered `request` with? The result must be a
 * validly signed event of the request's kind, carrying what was asked for, apart
 * from the small changes matchesRequest allows. Left-out content and tags mean empty.
 *
 * @param {*}      signed  what the signer answered
 * @param {object} request the event that was authorised
 * @returns {Promise<boolean>}
 */
export async function signedAsRequested(signed, request) {
    if (!signed || typeof signed !== 'object') return false;
    if (typeof signed.pubkey !== 'string' || !/^[0-9a-f]{64}$/.test(signed.pubkey)) return false;
    if (signed.kind !== request.kind) return false;
    const now = Math.floor(Date.now() / 1000);
    if (!matchesRequest(signed, request, { now, clockSecs: SIGNER_CLOCK_SECS, decode: nip19.decode })) return false;
    try {
        if (await calculateEventId(signed) !== signed.id) return false;
        return (await verifySignature(signed)) === true;
    } catch {
        return false;
    }
}

// Active bunker sessions keyed by profile index
const sessions = new Map();

/**
 * A single WebSocket connection to a Nostr relay
 */
/** How long publish() waits for a relay's OK before reporting a timeout. */
export const PUBLISH_OK_MS = 8000;

/**
 * Publish to every relay and gather each one's answer.
 * Resolves to [{ url, ok, message }], one per relay, never rejects.
 */
export async function publishToRelays(relays, event, opts = {}) {
    return Promise.all(relays.map(async (relay) => {
        try {
            return await relay.publish(event, opts);
        } catch (e) {
            return { url: relay.url, ok: false, message: e?.message || 'publish failed' };
        }
    }));
}

export class RelayConnection {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.subscriptions = new Map();
        this.eoseCallbacks = new Map();
        this.pendingOks = new Map();
        this.connected = false;
        this.reconnectTimer = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);
            } catch (e) {
                reject(new Error(`Failed to create WebSocket: ${e.message}`));
                return;
            }

            const timeout = setTimeout(() => {
                this.ws?.close();
                reject(new Error(`Connection timeout: ${this.url}`));
            }, 10000);

            this.ws.onopen = () => {
                clearTimeout(timeout);
                this.connected = true;
                this.reconnectAttempts = 0;
                log(`Connected to ${this.url}`);
                resolve();
            };

            this.ws.onerror = (err) => {
                clearTimeout(timeout);
                log(`WebSocket error: ${this.url}`);
                reject(new Error(`WebSocket error: ${this.url}`));
            };

            this.ws.onclose = () => {
                this.connected = false;
                log(`Disconnected from ${this.url}`);
                this.scheduleReconnect();
            };

            this.ws.onmessage = (msg) => {
                try {
                    const data = JSON.parse(msg.data);
                    this.handleMessage(data);
                } catch (e) {
                    log(`Failed to parse message: ${e.message}`);
                }
            };
        });
    }

    handleMessage(data) {
        const [type, subId, ...rest] = data;

        if (type === 'EVENT' && subId && rest[0]) {
            const event = rest[0];
            const handler = this.subscriptions.get(subId);
            if (handler) {
                handler(event);
            }
        } else if (type === 'EOSE' && subId) {
            const eoseHandler = this.eoseCallbacks.get(subId);
            if (eoseHandler) {
                this.eoseCallbacks.delete(subId);
                eoseHandler();
            }
        } else if (type === 'OK') {
            // NIP-01: ["OK", <event id>, <true|false>, <message>]
            const settle = this.pendingOks.get(subId);
            if (settle) settle(rest[0] === true, typeof rest[1] === 'string' ? rest[1] : '');
        } else if (type === 'NOTICE') {
            log(`Relay notice: ${rest[0]}`);
        }
    }

    subscribe(subId, filters, onEvent, onEose = null) {
        if (!this.connected || !this.ws) {
            throw new Error('Not connected');
        }
        this.subscriptions.set(subId, onEvent);
        if (onEose) {
            this.eoseCallbacks.set(subId, onEose);
        }
        this.ws.send(JSON.stringify(['REQ', subId, ...filters]));
    }

    unsubscribe(subId) {
        if (this.ws && this.connected) {
            this.ws.send(JSON.stringify(['CLOSE', subId]));
        }
        this.subscriptions.delete(subId);
        this.eoseCallbacks.delete(subId);
    }

    /**
     * Send an event. Returns a promise that always resolves to
     * { url, ok, message }: the relay's NIP-01 OK answer, or ok:false with
     * 'timeout' if it says nothing within `timeoutMs`. Throws synchronously
     * only when not connected (as before), so callers may ignore the result.
     */
    publish(event, { timeoutMs = PUBLISH_OK_MS } = {}) {
        if (!this.connected || !this.ws) {
            throw new Error('Not connected');
        }
        const id = event?.id;
        const result = new Promise((resolve) => {
            let timer = null;
            let entry = null;
            const settle = (ok, message) => {
                clearTimeout(timer);
                if (this.pendingOks.get(id) === entry) this.pendingOks.delete(id);
                resolve({ url: this.url, ok, message });
            };
            // A second publish of the same id answers the earlier wait too.
            const earlier = this.pendingOks.get(id);
            entry = (ok, message) => {
                if (earlier) earlier(ok, message);
                settle(ok, message);
            };
            this.pendingOks.set(id, entry);
            timer = setTimeout(() => settle(false, 'timeout'), timeoutMs);
        });
        this.ws.send(JSON.stringify(['EVENT', event]));
        return result;
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            log(`Max reconnect attempts reached for ${this.url}`);
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;

        this.reconnectTimer = setTimeout(() => {
            log(`Reconnecting to ${this.url} (attempt ${this.reconnectAttempts})`);
            this.connect().catch(() => {});
        }, delay);
    }

    close() {
        clearTimeout(this.reconnectTimer);
        this.maxReconnectAttempts = 0; // Prevent further reconnects
        this.subscriptions.clear();
        this.eoseCallbacks.clear();
        for (const settle of [...this.pendingOks.values()]) settle(false, 'connection closed');
        this.pendingOks.clear();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
    }
}

/**
 * NIP-46 Bunker Session
 *
 * Manages a session with a remote signer (nsecBunker).
 * Uses an ephemeral keypair for encrypted communication.
 */
export class BunkerSession {
    constructor({ remotePubkey, relays, secret }) {
        this.remotePubkey = remotePubkey;
        this.relayUrls = relays;
        this.secret = secret;

        // Keypair will be initialized in init()
        this.sessionPrivkey = null;
        this.sessionPubkey = null;
        this.conversationKey = null;

        this.relays = [];
        this.pendingRequests = new Map();
        this.connected = false;
        this.subId = `nostrkey-${crypto.randomUUID().slice(0, 8)}`;

        // BUNK-09: replay dedupe for inbound bunker responses.
        this._seenResponseIds = new Set();

        // A get_public_key already on its way, shared by everyone waiting on it.
        this.confirming = null;
    }

    /**
     * Initialize the ephemeral session keypair (async)
     */
    async init() {
        if (this.sessionPrivkey) return; // Already initialized

        // Generate ephemeral session keypair
        const keyPair = await generateKeyPair();
        this.sessionPrivkey = hexToBytes(keyPair.privateKey);
        this.sessionPubkey = keyPair.publicKey;

        // Derive NIP-44 conversation key
        this.conversationKey = nip44.v2.utils.getConversationKey(
            this.sessionPrivkey,
            this.remotePubkey
        );
    }

    /**
     * Connect to all relays and subscribe for responses
     */
    async connect() {
        // Ensure keypair is initialized
        await this.init();

        // Connect to relays
        const connections = this.relayUrls.map(url => {
            const relay = new RelayConnection(url);
            return relay.connect().then(() => {
                this.relays.push(relay);
                return relay;
            });
        });

        // Wait for at least one connection
        const results = await Promise.allSettled(connections);
        const connected = results.filter(r => r.status === 'fulfilled');

        if (connected.length === 0) {
            throw new Error('Failed to connect to any relay');
        }

        log(`Connected to ${connected.length}/${this.relayUrls.length} relays`);

        // Subscribe for NIP-46 responses (kind 24133 addressed to our session pubkey)
        for (const relay of this.relays) {
            relay.subscribe(
                this.subId,
                [{ kinds: [24133], '#p': [this.sessionPubkey] }],
                (event) => this.handleResponse(event)
            );
        }

        this.connected = true;

        // Send connect request if secret is provided
        if (this.secret) {
            await this.sendRequest('connect', [this.remotePubkey, this.secret]);
        } else {
            await this.sendRequest('connect', [this.remotePubkey]);
        }
    }

    /**
     * Verify an inbound bunker response event before trusting it (BUNK-09).
     * Confirms: kind 24133, well-formed, from the pinned remote signer pubkey,
     * a fresh created_at, an unseen event id, a recomputed id match, and a valid
     * Schnorr signature. A malicious relay cannot forge or replay a response.
     */
    async _verifyResponseEvent(event) {
        if (!event || typeof event !== 'object') return false;
        if (event.kind !== 24133) return false;
        if (typeof event.id !== 'string' || typeof event.sig !== 'string' ||
            typeof event.pubkey !== 'string' || typeof event.created_at !== 'number') {
            return false;
        }
        // Must be from the pinned remote signer.
        if (event.pubkey !== this.remotePubkey) {
            log(`Ignoring event from unknown pubkey: ${event.pubkey}`);
            return false;
        }
        const now = Math.floor(Date.now() / 1000);
        if (Math.abs(now - event.created_at) > RESPONSE_FRESHNESS_SECS) return false;
        if (this._seenResponseIds.has(event.id)) return false;

        let recomputed;
        try {
            recomputed = await calculateEventId(event);
        } catch { return false; }
        if (recomputed !== event.id) return false;

        try {
            if (!(await verifySignature(event))) return false;
        } catch { return false; }

        return true;
    }

    /**
     * Handle an incoming NIP-46 response event
     */
    async handleResponse(event) {
        // BUNK-09: verify signature/id/pubkey/freshness before decrypting.
        if (!(await this._verifyResponseEvent(event))) {
            log('Ignoring unverifiable/replayed bunker response');
            return;
        }
        this._seenResponseIds.add(event.id);

        try {
            // Decrypt the response
            const plaintext = nip44.v2.decrypt(event.content, this.conversationKey);
            const response = JSON.parse(plaintext);

            log(`Response: ${response.id} -> ${response.result ? 'ok' : response.error}`);

            // Correlate to a request we actually issued.
            const pending = this.pendingRequests.get(response.id);
            if (pending) {
                this.pendingRequests.delete(response.id);

                if (response.error) {
                    pending.reject(new Error(response.error));
                } else {
                    pending.resolve(response.result);
                }
            }
        } catch (e) {
            log(`Failed to handle response: ${e.message}`);
        }
    }

    /**
     * Send an encrypted NIP-46 request to the bunker
     */
    async sendRequest(method, params = []) {
        if (!this.connected && method !== 'connect') {
            throw new Error('Not connected to bunker');
        }

        const id = crypto.randomUUID();

        const request = JSON.stringify({ id, method, params });
        const encrypted = nip44.v2.encrypt(request, this.conversationKey);

        // Create and sign the event
        const event = await finalizeEvent({
            kind: 24133,
            content: encrypted,
            tags: [['p', this.remotePubkey]],
            created_at: Math.floor(Date.now() / 1000),
        }, this.sessionPrivkey);

        // Publish to all connected relays
        for (const relay of this.relays) {
            try {
                void relay.publish(event); // the bunker reply, not the OK, is what this waits on
            } catch (e) {
                log(`Failed to publish to ${relay.url}: ${e.message}`);
            }
        }

        // Wait for response with timeout
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(id);
                reject(new Error(`Request timeout: ${method}`));
            }, REMOTE_REQUEST_MS);

            this.pendingRequests.set(id, {
                resolve: (result) => {
                    clearTimeout(timeout);
                    resolve(result);
                },
                reject: (error) => {
                    clearTimeout(timeout);
                    reject(error);
                },
            });
        });
    }

    /**
     * NIP-46 Methods
     */

    async getPublicKey() {
        return await this.sendRequest('get_public_key');
    }

    async signEvent(event) {
        const result = await this.sendRequest('sign_event', [JSON.stringify(event)]);
        return JSON.parse(result);
    }

    async nip04Encrypt(thirdPartyPubkey, plaintext) {
        return await this.sendRequest('nip04_encrypt', [thirdPartyPubkey, plaintext]);
    }

    async nip04Decrypt(thirdPartyPubkey, ciphertext) {
        return await this.sendRequest('nip04_decrypt', [thirdPartyPubkey, ciphertext]);
    }

    async nip44Encrypt(thirdPartyPubkey, plaintext) {
        return await this.sendRequest('nip44_encrypt', [thirdPartyPubkey, plaintext]);
    }

    async nip44Decrypt(thirdPartyPubkey, ciphertext) {
        return await this.sendRequest('nip44_decrypt', [thirdPartyPubkey, ciphertext]);
    }

    async ping() {
        return await this.sendRequest('ping');
    }

    /**
     * Get session info for persistence.
     *
     * BUNK-10: the ephemeral session private key (and the connect secret) must
     * never be persisted to storage.local in cleartext. We wrap them under the
     * non-extractable device key (A2's secret-vault). The stored blob is opaque;
     * only this device can unwrap it.
     */
    async getSessionInfo() {
        return {
            remotePubkey: this.remotePubkey,
            relayUrls: this.relayUrls,
            userPubkey: this.userPubkey ?? null,
            secret: this.secret ? await encryptWithDeviceKey(this.secret) : this.secret,
            sessionPrivkey: await encryptWithDeviceKey(bytesToHex(this.sessionPrivkey)),
            sessionPubkey: this.sessionPubkey,
            enc: 'device-v1',
        };
    }

    /**
     * Disconnect from all relays
     */
    disconnect() {
        for (const relay of this.relays) {
            relay.unsubscribe(this.subId);
            relay.close();
        }
        this.relays = [];
        this.connected = false;
        // No answer can arrive now, so nobody waits out the timeout.
        const pending = [...this.pendingRequests.values()];
        this.pendingRequests.clear();
        for (const request of pending) request.reject(new Error('The remote session closed.'));
        log('Disconnected from bunker');
    }
}

/**
 * Restore a session from persisted session info.
 *
 * BUNK-10: unwrap the device-encrypted session key/secret. Legacy plaintext
 * blobs (pre-patch) are still accepted so existing users aren't logged out;
 * they get re-wrapped on the next persistence write.
 */
export async function restoreSession(sessionInfo) {
    const secret = isDeviceKeyBlob(sessionInfo.secret)
        ? await decryptWithDeviceKey(sessionInfo.secret)
        : sessionInfo.secret;
    const sessionPrivkeyHex = isDeviceKeyBlob(sessionInfo.sessionPrivkey)
        ? await decryptWithDeviceKey(sessionInfo.sessionPrivkey)
        : sessionInfo.sessionPrivkey;

    const session = new BunkerSession({
        remotePubkey: sessionInfo.remotePubkey,
        relays: sessionInfo.relayUrls,
        secret,
    });

    // Restore the original session keypair instead of generating new one
    session.sessionPrivkey = hexToBytes(sessionPrivkeyHex);
    session.sessionPubkey = sessionInfo.sessionPubkey;
    session.userPubkey = sessionInfo.userPubkey ?? null;
    session.conversationKey = nip44.v2.utils.getConversationKey(
        session.sessionPrivkey,
        session.remotePubkey
    );

    return session;
}

/**
 * Session Manager — manages active bunker sessions per profile
 */

// Sessions being opened, by profile index, so a burst shares one.
const opening = new Map();

// Moves on when the profile at an index does, so work that holds an index across
// an await can tell it no longer means the same profile.
const indexEpochs = new Map();

export function indexEpoch(index) {
    if (!indexEpochs.has(index)) indexEpochs.set(index, 0);
    return indexEpochs.get(index);
}

export async function getOrCreateSession(profileIndex) {
    const active = sessions.get(profileIndex);
    if (active?.connected) return active;

    const pending = opening.get(profileIndex);
    if (pending) return pending.result;

    if (active) {
        active.disconnect();
        sessions.delete(profileIndex);
    }

    const attempt = {};
    attempt.result = openStoredSession(profileIndex, attempt).finally(() => {
        if (opening.get(profileIndex) === attempt) opening.delete(profileIndex);
    });
    opening.set(profileIndex, attempt);
    return attempt.result;
}

/**
 * Open the session stored for a profile. A connect, disconnect or profile change
 * while this runs takes `attempt` out of `opening`; the result is then dropped,
 * so a late open never replaces what happened since.
 */
async function openStoredSession(profileIndex, attempt) {
    const data = await storage.get({ bunkerSessions: {} });
    const sessionInfo = data.bunkerSessions?.[profileIndex];

    if (!sessionInfo) {
        throw new Error('No bunker session configured for this profile');
    }

    const session = await restoreSession(sessionInfo);
    try {
        await session.connect();
    } catch (e) {
        session.disconnect();
        throw e;
    }
    if (opening.get(profileIndex) !== attempt) {
        session.disconnect();
        throw new Error('This remote session changed. Please try again.');
    }
    sessions.set(profileIndex, session);
    return session;
}

/**
 * Connect to a signer and learn its key without touching the profile's current
 * session, in memory or in storage. The result is kept only if passed to
 * `commitSession`; otherwise disconnect it and the old session carries on.
 *
 * @param {string} bunkerUrl
 * @returns {Promise<BunkerSession>} with `userPubkey` and `sessionInfo` set
 */
export async function openPendingSession(bunkerUrl) {
    const config = parseBunkerUrl(bunkerUrl);
    const session = new BunkerSession(config);
    try {
        await session.connect();
        session.userPubkey = parsePubkey(await session.getPublicKey());
        // Device-encrypted at rest.
        session.sessionInfo = await session.getSessionInfo();
    } catch (e) {
        session.disconnect();
        throw e;
    }
    return session;
}

/**
 * Make a pending session the profile's session, replacing the existing one in
 * memory and in storage.
 *
 * @param {number} profileIndex
 * @param {BunkerSession} session from `openPendingSession`
 * @param {() => Promise<boolean>} [stillCurrent] is `profileIndex` still the profile
 *        this connect was for? If not, nothing is kept.
 */
export async function commitSession(profileIndex, session, stillCurrent = async () => true) {
    let bunkerSessions;
    try {
        bunkerSessions = (await storage.get({ bunkerSessions: {} })).bunkerSessions || {};
        if (!(await stillCurrent())) throw profileChangedError();
    } catch (e) {
        session.disconnect();
        throw e;
    }

    opening.delete(profileIndex);
    if (sessions.has(profileIndex)) {
        sessions.get(profileIndex).disconnect();
        sessions.delete(profileIndex);
    }

    bunkerSessions[profileIndex] = session.sessionInfo;
    await storage.set({ bunkerSessions });

    // An open that began during that write is stale; one that finished is replaced.
    opening.delete(profileIndex);
    sessions.get(profileIndex)?.disconnect();
    sessions.set(profileIndex, session);
    return session;
}

/**
 * Open a new session for a profile. It replaces the existing one, in memory and
 * in storage, only once the signer has answered get_public_key with a valid key,
 * so a reconnect that fails leaves an authorised session as it was.
 */
export async function createSession(profileIndex, bunkerUrl, stillCurrent = async () => true) {
    const session = await openPendingSession(bunkerUrl);
    return commitSession(profileIndex, session, stillCurrent);
}

export function profileChangedError() {
    return new Error('This profile changed while connecting. Please try again.');
}

/** Close a session and forget it, wherever it is now kept. */
export async function discardSession(session) {
    session.disconnect();
    for (const [index, open] of [...sessions]) {
        if (open === session) sessions.delete(index);
    }
    const { bunkerSessions } = await storage.get({ bunkerSessions: {} });
    const position = Object.keys(bunkerSessions || {})
        .find(key => bunkerSessions[key]?.sessionPubkey === session.sessionPubkey);
    if (position === undefined) return;
    delete bunkerSessions[position];
    await storage.set({ bunkerSessions });
}

export async function disconnectSession(profileIndex) {
    opening.delete(profileIndex);
    if (sessions.has(profileIndex)) {
        sessions.get(profileIndex).disconnect();
        sessions.delete(profileIndex);
    }

    // Remove persisted session
    const data = await storage.get({ bunkerSessions: {} });
    const bunkerSessions = data.bunkerSessions || {};
    delete bunkerSessions[profileIndex];
    await storage.set({ bunkerSessions });
}

/**
 * Keep open sessions on their own profiles after the profile at `removedIndex`
 * was removed: its session closes and later ones move down with their profiles.
 */
export function reindexSessionsAfterDelete(removedIndex) {
    moveSessions((index) => {
        if (index === removedIndex) return null;
        return index > removedIndex ? index - 1 : index;
    });
}

/**
 * Keep open sessions on their own profiles after the list changed. Anything in
 * progress at an index that moved stops, and a session whose profile is gone closes.
 *
 * @param {(index: number) => ?number} newIndexOf where a profile went, null if gone
 */
export function moveSessions(newIndexOf) {
    for (const index of [...indexEpochs.keys()]) {
        if (newIndexOf(index) !== index) indexEpochs.set(index, indexEpochs.get(index) + 1);
    }
    for (const index of [...opening.keys()]) {
        if (newIndexOf(index) !== index) opening.delete(index);
    }
    const entries = [...sessions.entries()];
    sessions.clear();
    for (const [index, session] of entries) {
        const moved = newIndexOf(index);
        if (moved === null) session.disconnect();
        else sessions.set(moved, session);
    }
}

/**
 * Learn which identity a session signs for, asking the signer once however many
 * requests are waiting, and keep the answer with the stored session.
 *
 * @param {BunkerSession} session
 * @throws if the signer refuses or does not give a valid key
 */
export function confirmSessionUser(session) {
    session.confirming ??= (async () => {
        session.userPubkey = parsePubkey(await session.getPublicKey());
        await storeSessionUser(session);
    })().finally(() => { session.confirming = null; });
    return session.confirming;
}

async function storeSessionUser(session) {
    try {
        const { bunkerSessions } = await storage.get({ bunkerSessions: {} });
        const stored = Object.values(bunkerSessions || {})
            .find(info => info?.sessionPubkey === session.sessionPubkey);
        if (!stored) return;
        stored.userPubkey = session.userPubkey;
        await storage.set({ bunkerSessions });
    } catch (e) {
        log(`Could not store the session's identity: ${e.message}`);
    }
}

export function isSessionActive(profileIndex) {
    return sessions.has(profileIndex) && sessions.get(profileIndex).connected;
}

/**
 * Validate a bunker URL without connecting
 */
export function validateBunkerUrl(url) {
    try {
        parseBunkerUrl(url);
        return { valid: true, error: null };
    } catch (e) {
        return { valid: false, error: e.message };
    }
}
