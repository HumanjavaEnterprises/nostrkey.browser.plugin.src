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
    generateSecretKey,
    getPublicKey,
    finalizeEvent,
} from 'nostr-tools';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import * as nip44 from 'nostr-tools/nip44';
import { api } from './browser-polyfill';

const storage = api.storage.local;
const log = msg => console.log('NIP-46: ', msg);

// Active bunker sessions keyed by profile index
const sessions = new Map();

/**
 * Parse a bunker:// connection string
 * Format: bunker://<pubkey>?relay=wss://...&relay=wss://...&secret=<optional>
 */
export function parseBunkerUrl(url) {
    if (!url.startsWith('bunker://')) {
        throw new Error('Invalid bunker URL: must start with bunker://');
    }

    const parsed = new URL(url);
    const remotePubkey = parsed.hostname || parsed.pathname.replace('//', '');

    if (!/^[0-9a-f]{64}$/i.test(remotePubkey)) {
        throw new Error('Invalid bunker URL: pubkey must be 64 hex characters');
    }

    const relays = parsed.searchParams.getAll('relay');
    if (relays.length === 0) {
        throw new Error('Invalid bunker URL: at least one relay is required');
    }

    // Validate relay URLs
    for (const relay of relays) {
        try {
            const r = new URL(relay);
            if (r.protocol !== 'wss:' && r.protocol !== 'ws:') {
                throw new Error(`Invalid relay protocol: ${r.protocol}`);
            }
        } catch (e) {
            throw new Error(`Invalid relay URL: ${relay}`);
        }
    }

    const secret = parsed.searchParams.get('secret') || null;

    return { remotePubkey, relays, secret };
}

/**
 * A single WebSocket connection to a Nostr relay
 */
class RelayConnection {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.subscriptions = new Map();
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
            // End of stored events — we only care about real-time events for NIP-46
        } else if (type === 'OK') {
            // Event accepted
        } else if (type === 'NOTICE') {
            log(`Relay notice: ${rest[0]}`);
        }
    }

    subscribe(subId, filters, onEvent) {
        if (!this.connected || !this.ws) {
            throw new Error('Not connected');
        }
        this.subscriptions.set(subId, onEvent);
        this.ws.send(JSON.stringify(['REQ', subId, ...filters]));
    }

    unsubscribe(subId) {
        if (this.ws && this.connected) {
            this.ws.send(JSON.stringify(['CLOSE', subId]));
        }
        this.subscriptions.delete(subId);
    }

    publish(event) {
        if (!this.connected || !this.ws) {
            throw new Error('Not connected');
        }
        this.ws.send(JSON.stringify(['EVENT', event]));
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

        // Generate ephemeral session keypair
        this.sessionPrivkey = generateSecretKey();
        this.sessionPubkey = getPublicKey(this.sessionPrivkey);

        // Derive NIP-44 conversation key
        this.conversationKey = nip44.v2.utils.getConversationKey(
            this.sessionPrivkey,
            this.remotePubkey
        );

        this.relays = [];
        this.pendingRequests = new Map();
        this.connected = false;
        this.subId = `nostrkey-${crypto.randomUUID().slice(0, 8)}`;
    }

    /**
     * Connect to all relays and subscribe for responses
     */
    async connect() {
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
     * Handle an incoming NIP-46 response event
     */
    handleResponse(event) {
        // Must be from the remote signer
        if (event.pubkey !== this.remotePubkey) {
            log(`Ignoring event from unknown pubkey: ${event.pubkey}`);
            return;
        }

        try {
            // Decrypt the response
            const plaintext = nip44.v2.decrypt(event.content, this.conversationKey);
            const response = JSON.parse(plaintext);

            log(`Response: ${response.id} -> ${response.result ? 'ok' : response.error}`);

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
        const event = finalizeEvent({
            kind: 24133,
            content: encrypted,
            tags: [['p', this.remotePubkey]],
            created_at: Math.floor(Date.now() / 1000),
        }, this.sessionPrivkey);

        // Publish to all connected relays
        for (const relay of this.relays) {
            try {
                relay.publish(event);
            } catch (e) {
                log(`Failed to publish to ${relay.url}: ${e.message}`);
            }
        }

        // Wait for response with timeout
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(id);
                reject(new Error(`Request timeout: ${method}`));
            }, 30000);

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
     * Get session info for persistence
     */
    getSessionInfo() {
        return {
            remotePubkey: this.remotePubkey,
            relayUrls: this.relayUrls,
            secret: this.secret,
            sessionPrivkey: bytesToHex(this.sessionPrivkey),
            sessionPubkey: this.sessionPubkey,
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
        this.pendingRequests.clear();
        this.connected = false;
        log('Disconnected from bunker');
    }
}

/**
 * Restore a session from persisted session info
 */
export function restoreSession(sessionInfo) {
    const session = new BunkerSession({
        remotePubkey: sessionInfo.remotePubkey,
        relays: sessionInfo.relayUrls,
        secret: sessionInfo.secret,
    });

    // Restore the original session keypair instead of generating new one
    session.sessionPrivkey = hexToBytes(sessionInfo.sessionPrivkey);
    session.sessionPubkey = sessionInfo.sessionPubkey;
    session.conversationKey = nip44.v2.utils.getConversationKey(
        session.sessionPrivkey,
        session.remotePubkey
    );

    return session;
}

/**
 * Session Manager — manages active bunker sessions per profile
 */

export async function getOrCreateSession(profileIndex) {
    // Check if we have an active session
    if (sessions.has(profileIndex)) {
        const session = sessions.get(profileIndex);
        if (session.connected) {
            return session;
        }
        // Session disconnected, clean up
        session.disconnect();
        sessions.delete(profileIndex);
    }

    // Try to restore from persisted session info
    const data = await storage.get({ bunkerSessions: {} });
    const sessionInfo = data.bunkerSessions?.[profileIndex];

    if (!sessionInfo) {
        throw new Error('No bunker session configured for this profile');
    }

    const session = restoreSession(sessionInfo);
    await session.connect();
    sessions.set(profileIndex, session);
    return session;
}

export async function createSession(profileIndex, bunkerUrl) {
    // Disconnect existing session
    if (sessions.has(profileIndex)) {
        sessions.get(profileIndex).disconnect();
        sessions.delete(profileIndex);
    }

    const config = parseBunkerUrl(bunkerUrl);
    const session = new BunkerSession(config);
    await session.connect();

    // Persist session info
    const data = await storage.get({ bunkerSessions: {} });
    const bunkerSessions = data.bunkerSessions || {};
    bunkerSessions[profileIndex] = session.getSessionInfo();
    await storage.set({ bunkerSessions });

    sessions.set(profileIndex, session);
    return session;
}

export async function disconnectSession(profileIndex) {
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
