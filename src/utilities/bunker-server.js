/**
 * NIP-46 Bunker Server
 *
 * The inverse of BunkerSession in nip46.js — this makes the NostrKey
 * extension act as a NIP-46 remote signer (bunker).
 *
 * Flow:
 *   1. Extension generates a connection secret and opens a WebSocket to the relay
 *   2. Extension subscribes for kind 24133 events tagged with the user's pubkey
 *   3. A remote client sends an encrypted request (connect, sign_event, etc.)
 *   4. Extension decrypts, executes, encrypts the response, publishes back
 *
 * Connection string format:
 *   bunker://<user-pubkey>?relay=wss://...&secret=<random>
 */

import {
    finalizeEvent,
    bytesToHex,
    nip04,
} from 'nostr-crypto-utils';
import * as nip44 from 'nostr-crypto-utils/nip44';
import { RelayConnection } from './nip46.js';

const log = msg => console.log('BunkerServer: ', msg);

export class BunkerServer {
    /**
     * @param {Object} opts
     * @param {string[]} opts.relayUrls  - relay URLs to connect to
     * @param {string}   opts.userPubkey - hex pubkey of the local user
     * @param {string}   opts.secret     - shared secret for connect handshake
     */
    constructor({ relayUrls, userPubkey, secret }) {
        this.relayUrls = relayUrls;
        this.userPubkey = userPubkey;
        this.secret = secret;

        this.relays = [];
        this.authenticatedClients = new Set();
        this.subId = `bunker-srv-${crypto.randomUUID().slice(0, 8)}`;
        this.active = false;

        // Will be set by start()
        this._getPrivKey = null;
    }

    /**
     * Start the bunker server.
     * @param {Object} opts
     * @param {Function} opts.getPrivKey - async () => Uint8Array (user's private key)
     */
    async start({ getPrivKey }) {
        this._getPrivKey = getPrivKey;

        // Connect to relays
        const connections = this.relayUrls.map(url => {
            const relay = new RelayConnection(url);
            return relay.connect().then(() => {
                this.relays.push(relay);
                return relay;
            });
        });

        const results = await Promise.allSettled(connections);
        const connected = results.filter(r => r.status === 'fulfilled');

        if (connected.length === 0) {
            throw new Error('Failed to connect to any relay');
        }

        log(`Connected to ${connected.length}/${this.relayUrls.length} relays`);

        // Subscribe for incoming NIP-46 requests (kind 24133 tagged with our pubkey)
        for (const relay of this.relays) {
            relay.subscribe(
                this.subId,
                [{ kinds: [24133], '#p': [this.userPubkey], since: Math.floor(Date.now() / 1000) - 5 }],
                (event) => this._handleRequest(event)
            );
        }

        this.active = true;
        log('Bunker server started');
    }

    /**
     * Stop the bunker server.
     */
    stop() {
        for (const relay of this.relays) {
            relay.unsubscribe(this.subId);
            relay.close();
        }
        this.relays = [];
        this.authenticatedClients.clear();
        this.active = false;
        this._getPrivKey = null;
        log('Bunker server stopped');
    }

    /**
     * Generate the bunker:// connection string.
     */
    getConnectionString() {
        const relayParams = this.relayUrls.map(u => `relay=${encodeURIComponent(u)}`).join('&');
        return `bunker://${this.userPubkey}?${relayParams}&secret=${this.secret}`;
    }

    /**
     * Handle an incoming NIP-46 request event.
     */
    async _handleRequest(event) {
        const clientPubkey = event.pubkey;

        let privKey;
        try {
            privKey = await this._getPrivKey();
        } catch (e) {
            log(`Cannot get private key (locked?): ${e.message}`);
            return;
        }

        // Derive conversation key with the requesting client
        let conversationKey;
        try {
            conversationKey = nip44.v2.utils.getConversationKey(privKey, clientPubkey);
        } catch (e) {
            log(`Failed to derive conversation key: ${e.message}`);
            return;
        }

        // Decrypt the request
        let request;
        try {
            const plaintext = nip44.v2.decrypt(event.content, conversationKey);
            request = JSON.parse(plaintext);
        } catch (e) {
            log(`Failed to decrypt request: ${e.message}`);
            return;
        }

        const { id, method, params } = request;
        log(`Request: ${method} (id=${id}) from ${clientPubkey.slice(0, 8)}...`);

        // Security: reject unauthenticated clients for everything except connect
        if (method !== 'connect' && !this.authenticatedClients.has(clientPubkey)) {
            await this._sendResponse(privKey, clientPubkey, conversationKey, {
                id,
                result: null,
                error: 'Unauthorized: send connect first',
            });
            return;
        }

        // Dispatch
        let result = null;
        let error = null;

        try {
            switch (method) {
                case 'connect': {
                    // params[0] = remote pubkey (should match ours), params[1] = secret
                    const clientSecret = params[1];
                    if (this.secret && clientSecret !== this.secret) {
                        error = 'Invalid secret';
                    } else {
                        this.authenticatedClients.add(clientPubkey);
                        result = 'ack';
                        log(`Client authenticated: ${clientPubkey.slice(0, 8)}...`);
                    }
                    break;
                }

                case 'get_public_key':
                    result = this.userPubkey;
                    break;

                case 'sign_event': {
                    const unsigned = JSON.parse(params[0]);
                    const signed = await finalizeEvent(unsigned, privKey);
                    result = JSON.stringify(signed);
                    break;
                }

                case 'nip44_encrypt': {
                    const thirdPartyPubkey = params[0];
                    const plaintext = params[1];
                    const ck = nip44.v2.utils.getConversationKey(privKey, thirdPartyPubkey);
                    result = nip44.v2.encrypt(plaintext, ck);
                    break;
                }

                case 'nip44_decrypt': {
                    const thirdPartyPubkey = params[0];
                    const ciphertext = params[1];
                    const ck = nip44.v2.utils.getConversationKey(privKey, thirdPartyPubkey);
                    result = nip44.v2.decrypt(ciphertext, ck);
                    break;
                }

                case 'nip04_encrypt': {
                    const thirdPartyPubkey = params[0];
                    const plaintext = params[1];
                    result = await nip04.encryptMessage(plaintext, bytesToHex(privKey), thirdPartyPubkey);
                    break;
                }

                case 'nip04_decrypt': {
                    const thirdPartyPubkey = params[0];
                    const ciphertext = params[1];
                    result = await nip04.decryptMessage(ciphertext, bytesToHex(privKey), thirdPartyPubkey);
                    break;
                }

                case 'ping':
                    result = 'pong';
                    break;

                default:
                    error = `Unsupported method: ${method}`;
            }
        } catch (e) {
            error = e.message;
            log(`Error handling ${method}: ${e.message}`);
        }

        await this._sendResponse(privKey, clientPubkey, conversationKey, { id, result, error });
    }

    /**
     * Encrypt and publish a NIP-46 response.
     */
    async _sendResponse(privKey, clientPubkey, conversationKey, response) {
        const encrypted = nip44.v2.encrypt(JSON.stringify(response), conversationKey);

        const event = await finalizeEvent({
            kind: 24133,
            content: encrypted,
            tags: [['p', clientPubkey]],
            created_at: Math.floor(Date.now() / 1000),
        }, privKey);

        for (const relay of this.relays) {
            try {
                relay.publish(event);
            } catch (e) {
                log(`Failed to publish response to ${relay.url}: ${e.message}`);
            }
        }

        log(`Response sent: ${response.id} ${response.error ? 'ERROR' : 'OK'}`);
    }
}
