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
 *   4. Extension verifies the request event, decrypts, gates it, executes,
 *      encrypts the response, publishes back
 *
 * Connection string format:
 *   bunker://<user-pubkey>?relay=wss://...&secret=<random>
 *
 * SECURITY MODEL (security audit 2026-07 — T0-7 / BUNK-01..10)
 * -----------------------------------------------------------------------------
 * - Per-connection records (BUNK-02/06/07/08): every connected client gets its
 *   own record (id + secret + granted perms + timestamps + optional expiry).
 *   Connect secrets are single-use and ≥128-bit (crypto.getRandomValues).
 *   Records are independently revocable. There is no shared static secret.
 * - Default-DENY per-kind signing (T0-7 / BUNK-01): a connected client may NOT
 *   sign arbitrary kinds. Tier-A kinds auto-sign only once the user has granted
 *   that `sign_event:<kind>` permission; Tier-B kinds (DMs, gift-wrap, deletes,
 *   all nip04/nip44 crypto, decrypt_zap_event, unknown kinds) ALWAYS route
 *   through a blocking user-approval prompt and are never permanently remembered.
 *   With no approval UI wired, unknown/ungranted requests are rejected.
 * - Inbound verification + replay protection (BUNK-04/05, T1-3): every kind-24133
 *   request has its id recomputed and its Schnorr signature verified, its kind
 *   asserted, is deduped by event id, and is checked against a created_at
 *   freshness window BEFORE it is decrypted or acted upon.
 * - Constant-time secret comparison (BUNK-03).
 */

import {
    finalizeEvent,
    bytesToHex,
    nip04,
    calculateEventId,
    verifySignature,
} from 'nostr-crypto-utils';
import * as nip44 from 'nostr-crypto-utils/nip44';
import { RelayConnection } from './nip46.js';

const log = msg => console.log('BunkerServer: ', msg);

// Reject request events whose created_at drifts more than this many seconds
// from local time (in either direction). Bounds replay + clock-skew abuse.
const FRESHNESS_WINDOW_SECS = 300;

// Cap on remembered event ids for replay dedupe (bounded memory).
const MAX_SEEN_EVENTS = 5000;

/**
 * Tier-A signing kinds: high-frequency, low-risk events that MAY be auto-signed
 * once the user has explicitly granted the matching `sign_event:<kind>` perm.
 * (UX-SECURITY-BRIEF §2)
 */
const TIER_A_SIGN_KINDS = new Set([
    1,      // short text note
    6,      // repost
    7,      // reaction
    16,     // generic repost
    0,      // profile metadata
    3,      // contact list
    10002,  // relay list
    9734,   // zap request
    22242,  // NIP-42 relay auth
    27235,  // NIP-98 HTTP auth
    30023,  // long-form content
]);

// Signing kinds that always route through a user prompt and are never
// remembered (DMs 4/14, seal 13, gift-wrap 1059, delete 5). Any kind NOT in
// TIER_A_SIGN_KINDS is treated as Tier-B regardless; this set documents the
// well-known sensitive ones. Delete (5) must never become a standing grant.

/**
 * Constant-time string comparison for secrets (BUNK-03). Avoids leaking match
 * progress through early-exit timing. Length mismatch returns false.
 */
export function constantTimeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}

/**
 * Generate a ≥128-bit connect secret from the CSPRNG (BUNK-07).
 */
export function generateSecret() {
    return bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
}

/**
 * Classify an incoming request into a permission grammar string + a tier.
 *
 * @returns {{ perm: string, tier: 'A'|'B'|'control', canRemember: boolean }}
 */
export function classifyRequest(method, signKind) {
    switch (method) {
        case 'connect':
        case 'get_public_key':
        case 'ping':
            return { perm: method, tier: 'control', canRemember: false };

        case 'sign_event': {
            const perm = `sign_event:${signKind}`;
            if (TIER_A_SIGN_KINDS.has(signKind)) {
                return { perm, tier: 'A', canRemember: true };
            }
            // Explicit Tier-B kinds (DMs/seal/gift-wrap/delete) and ANY unknown
            // kind → always prompt, never remember. Deletes especially
            // (NEVER_REMEMBER_SIGN_KINDS) must never become a standing grant.
            return { perm, tier: 'B', canRemember: false };
        }

        // All nip04/nip44 crypto (encrypt AND decrypt) is Tier-B: always prompt,
        // never permanently remembered (reading/writing DMs).
        case 'nip04_encrypt':
        case 'nip04_decrypt':
        case 'nip44_encrypt':
        case 'nip44_decrypt':
        case 'decrypt_zap_event':
            return { perm: method, tier: 'B', canRemember: false };

        default:
            // Unknown method → always prompt, never remember.
            return { perm: method, tier: 'B', canRemember: false };
    }
}

export class BunkerServer {
    /**
     * @param {Object} opts
     * @param {string[]} opts.relayUrls  - relay URLs to connect to
     * @param {string}   opts.userPubkey - hex pubkey of the local user
     * @param {string}   [opts.secret]   - initial single-use connect secret;
     *                                      generated if omitted
     */
    constructor({ relayUrls, userPubkey, secret }) {
        this.relayUrls = relayUrls;
        this.userPubkey = userPubkey;

        // The currently-offered single-use connect secret (embedded in the
        // bunker:// string). Regenerated per accepted connection.
        this.secret = secret || generateSecret();

        // Pending single-use connect secrets: secret -> { createdAt, used }.
        this._pendingSecrets = new Map();
        this._addPendingSecret(this.secret);

        // Per-connection records (BUNK-02): clientPubkey -> record.
        // record = { id, clientPubkey, secret, perms:Set, createdAt, lastUsed, expiry }
        this.connections = new Map();

        // Replay dedupe (BUNK-04): event id -> created_at.
        this._seenEvents = new Map();

        this.relays = [];
        this.subId = `bunker-srv-${crypto.randomUUID().slice(0, 8)}`;
        this.active = false;

        // Injected by start()
        this._getPrivKey = null;
        this._requestApproval = null;
    }

    _addPendingSecret(secret) {
        if (typeof secret !== 'string' || secret.length === 0) return;
        this._pendingSecrets.set(secret, { createdAt: Date.now(), used: false });
    }

    /** Backwards-compatible view for status UIs. */
    get clientCount() {
        return this.connections.size;
    }

    /**
     * Start the bunker server.
     * @param {Object} opts
     * @param {Function} opts.getPrivKey       - async () => Uint8Array (user's private key)
     * @param {Function} [opts.requestApproval] - async (detail) => { approved, remember }
     *   Routes Tier-B and ungranted Tier-A requests to an extension-owned
     *   approval surface. When absent, such requests are rejected (default-deny).
     */
    async start({ getPrivKey, requestApproval }) {
        this._getPrivKey = getPrivKey;
        this._requestApproval = requestApproval || null;

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
        this.connections.clear();
        this._pendingSecrets.clear();
        this._seenEvents.clear();
        this.active = false;
        this._getPrivKey = null;
        this._requestApproval = null;
        log('Bunker server stopped');
    }

    /**
     * Revoke a single connection (BUNK-08). Its future requests are rejected;
     * other connections are unaffected. Its consumed connect secret is not
     * reusable, so it cannot silently re-authenticate.
     */
    revokeConnection(clientPubkey) {
        const existed = this.connections.delete(clientPubkey);
        if (existed) log(`Revoked connection ${clientPubkey.slice(0, 8)}...`);
        return existed;
    }

    /** Revoke every connection. */
    revokeAll() {
        this.connections.clear();
    }

    /** Snapshot of connections for a dashboard UI. */
    listConnections() {
        return [...this.connections.values()].map(c => ({
            id: c.id,
            clientPubkey: c.clientPubkey,
            perms: [...c.perms],
            createdAt: c.createdAt,
            lastUsed: c.lastUsed,
            expiry: c.expiry,
        }));
    }

    /**
     * Generate a fresh single-use connect secret and make it the offered one.
     * Use this to pair an additional client.
     */
    rotateSecret() {
        this.secret = generateSecret();
        this._addPendingSecret(this.secret);
        return this.secret;
    }

    /**
     * Generate the bunker:// connection string.
     */
    getConnectionString() {
        const relayParams = this.relayUrls.map(u => `relay=${encodeURIComponent(u)}`).join('&');
        return `bunker://${this.userPubkey}?${relayParams}&secret=${this.secret}`;
    }

    // --- Replay / freshness helpers ------------------------------------------

    _rememberEvent(id, createdAt) {
        this._seenEvents.set(id, createdAt);
        if (this._seenEvents.size > MAX_SEEN_EVENTS) {
            // Drop the oldest ~10% to stay bounded.
            const drop = Math.ceil(MAX_SEEN_EVENTS * 0.1);
            let i = 0;
            for (const key of this._seenEvents.keys()) {
                this._seenEvents.delete(key);
                if (++i >= drop) break;
            }
        }
    }

    /**
     * Structurally + cryptographically validate an inbound request event
     * (BUNK-04/05, T1-3). Returns true only for a fresh, unseen, correctly
     * signed kind-24133 event.
     */
    async _verifyRequestEvent(event) {
        if (!event || typeof event !== 'object') return false;
        if (event.kind !== 24133) { log('Reject: wrong kind'); return false; }
        if (typeof event.id !== 'string' || typeof event.sig !== 'string' ||
            typeof event.pubkey !== 'string' || typeof event.created_at !== 'number') {
            log('Reject: malformed event'); return false;
        }

        const now = Math.floor(Date.now() / 1000);
        if (Math.abs(now - event.created_at) > FRESHNESS_WINDOW_SECS) {
            log('Reject: stale/future created_at'); return false;
        }

        if (this._seenEvents.has(event.id)) { log('Reject: replayed event id'); return false; }

        let recomputedId;
        try {
            recomputedId = await calculateEventId(event);
        } catch (e) {
            log(`Reject: id recompute failed: ${e.message}`); return false;
        }
        if (recomputedId !== event.id) { log('Reject: event id mismatch'); return false; }

        let sigOk = false;
        try {
            sigOk = await verifySignature(event);
        } catch (e) {
            log(`Reject: sig verify threw: ${e.message}`); return false;
        }
        if (!sigOk) { log('Reject: bad signature'); return false; }

        return true;
    }

    /**
     * Handle an incoming NIP-46 request event.
     */
    async _handleRequest(event) {
        // BUNK-04/05 + T1-3: verify BEFORE decrypting or acting.
        if (!(await this._verifyRequestEvent(event))) return;
        // Mark seen only after passing verification so a forged id can't
        // suppress the real event.
        this._rememberEvent(event.id, event.created_at);

        const clientPubkey = event.pubkey;

        let privKey;
        try {
            privKey = await this._getPrivKey();
        } catch (e) {
            log(`Cannot get private key (locked?): ${e.message}`);
            return;
        }

        let conversationKey;
        try {
            conversationKey = nip44.v2.utils.getConversationKey(privKey, clientPubkey);
        } catch (e) {
            log(`Failed to derive conversation key: ${e.message}`);
            return;
        }

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

        // connect is the only method allowed before authentication.
        const conn = this.connections.get(clientPubkey);
        if (method !== 'connect' && !conn) {
            await this._sendResponse(privKey, clientPubkey, conversationKey, {
                id, result: null, error: 'Unauthorized: send connect first',
            });
            return;
        }

        // Enforce per-connection expiry (BUNK-02).
        if (conn && conn.expiry && Date.now() > conn.expiry) {
            this.revokeConnection(clientPubkey);
            await this._sendResponse(privKey, clientPubkey, conversationKey, {
                id, result: null, error: 'Connection expired — reconnect required',
            });
            return;
        }
        if (conn) conn.lastUsed = Date.now();

        let result = null;
        let error = null;

        try {
            switch (method) {
                case 'connect': {
                    // params[0] = remote pubkey (should be ours), params[1] = secret
                    const clientSecret = params && params[1];
                    error = this._authenticateConnect(clientPubkey, clientSecret);
                    if (!error) {
                        result = 'ack';
                        log(`Client authenticated: ${clientPubkey.slice(0, 8)}...`);
                    }
                    break;
                }

                case 'get_public_key':
                    result = this.userPubkey;
                    break;

                case 'ping':
                    result = 'pong';
                    break;

                case 'sign_event': {
                    const unsigned = JSON.parse(params[0]);
                    const decision = await this._gate(clientPubkey, 'sign_event', unsigned.kind, { unsigned });
                    if (!decision.allowed) { error = decision.error; break; }
                    const signed = await finalizeEvent(unsigned, privKey);
                    result = JSON.stringify(signed);
                    break;
                }

                case 'nip44_encrypt': {
                    const decision = await this._gate(clientPubkey, 'nip44_encrypt', null, {});
                    if (!decision.allowed) { error = decision.error; break; }
                    const ck = nip44.v2.utils.getConversationKey(privKey, params[0]);
                    result = nip44.v2.encrypt(params[1], ck);
                    break;
                }

                case 'nip44_decrypt': {
                    const decision = await this._gate(clientPubkey, 'nip44_decrypt', null, {});
                    if (!decision.allowed) { error = decision.error; break; }
                    const ck = nip44.v2.utils.getConversationKey(privKey, params[0]);
                    result = nip44.v2.decrypt(params[1], ck);
                    break;
                }

                case 'nip04_encrypt': {
                    const decision = await this._gate(clientPubkey, 'nip04_encrypt', null, {});
                    if (!decision.allowed) { error = decision.error; break; }
                    result = await nip04.encryptMessage(params[1], bytesToHex(privKey), params[0]);
                    break;
                }

                case 'nip04_decrypt': {
                    const decision = await this._gate(clientPubkey, 'nip04_decrypt', null, {});
                    if (!decision.allowed) { error = decision.error; break; }
                    result = await nip04.decryptMessage(params[1], bytesToHex(privKey), params[0]);
                    break;
                }

                default:
                    // Unknown method → default-deny, prompt if a UI is available.
                    {
                        const decision = await this._gate(clientPubkey, method, null, {});
                        if (!decision.allowed) { error = decision.error || `Unsupported method: ${method}`; break; }
                        error = `Unsupported method: ${method}`;
                    }
            }
        } catch (e) {
            error = e.message;
            log(`Error handling ${method}: ${e.message}`);
        }

        await this._sendResponse(privKey, clientPubkey, conversationKey, { id, result, error });
    }

    /**
     * Validate a connect secret (single-use, constant-time) and create the
     * per-connection record. Returns an error string, or null on success.
     */
    _authenticateConnect(clientPubkey, clientSecret) {
        // BUNK-06: empty / falsy secret must never authenticate.
        if (typeof clientSecret !== 'string' || clientSecret.length === 0) {
            return 'Invalid secret';
        }

        // Constant-time match against a pending, unused secret (BUNK-03/07).
        let matched = null;
        for (const [secret, meta] of this._pendingSecrets) {
            if (constantTimeEqual(secret, clientSecret) && !meta.used) {
                matched = secret;
                break;
            }
        }
        if (!matched) return 'Invalid secret';

        // Single-use (BUNK-02): consume the secret so it cannot be replayed to
        // authenticate a second client.
        this._pendingSecrets.get(matched).used = true;

        this.connections.set(clientPubkey, {
            id: crypto.randomUUID(),
            clientPubkey,
            secret: matched,
            perms: new Set(),
            createdAt: Date.now(),
            lastUsed: Date.now(),
            expiry: null,
        });
        return null;
    }

    /**
     * Per-kind default-DENY gate (T0-7 / BUNK-01).
     *
     * @returns {Promise<{ allowed: boolean, error?: string }>}
     */
    async _gate(clientPubkey, method, signKind, detail) {
        const conn = this.connections.get(clientPubkey);
        if (!conn) return { allowed: false, error: 'Unauthorized' };

        const { perm, tier, canRemember } = classifyRequest(method, signKind);

        // Tier-A: auto-approve ONLY when already granted.
        if (tier === 'A' && conn.perms.has(perm)) {
            return { allowed: true };
        }

        // Everything else needs a fresh user decision. Default-deny when no
        // approval surface is available.
        if (typeof this._requestApproval !== 'function') {
            return { allowed: false, error: 'Request requires user approval (no approval UI available)' };
        }

        let decision;
        try {
            decision = await this._requestApproval({
                clientPubkey,
                connectionId: conn.id,
                method,
                perm,
                tier,
                kind: signKind,
                unsigned: detail.unsigned || null,
            });
        } catch (e) {
            return { allowed: false, error: `Approval failed: ${e.message}` };
        }

        if (!decision || !decision.approved) {
            return { allowed: false, error: 'User denied request' };
        }

        // Persist the grant only for remember-eligible Tier-A perms.
        if (tier === 'A' && canRemember && decision.remember) {
            conn.perms.add(perm);
        }
        return { allowed: true };
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
