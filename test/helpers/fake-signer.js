/**
 * A remote signer behind a fake relay: stands in for the WebSocket a bunker
 * session opens and answers NIP-46 requests the way a real signer does.
 *
 * Demo material only: SIGNER_HEX is a secp256k1 generator multiple.
 */

import { vi } from 'vitest';
import { finalizeEvent, getPublicKeySync, hexToBytes, nip44 } from 'nostr-crypto-utils';

export const SIGNER_HEX = '0000000000000000000000000000000000000000000000000000000000000003';
export const SIGNER_PUB = getPublicKeySync(SIGNER_HEX);
export const OTHER_SIGNER_HEX = '0000000000000000000000000000000000000000000000000000000000000004';
export const OTHER_SIGNER_PUB = getPublicKeySync(OTHER_SIGNER_HEX);

/**
 * Replace WebSocket until the suite calls vi.unstubAllGlobals().
 * @returns {{ requests: {method: string, params: string[]}[], published: object[], refuse: Object<string, string>,
 *            signAsHex: string, sockets: number, closed: number }}
 *          what the signer saw; set `refuse[method]` to answer that method with an
 *          error, `signAsHex` to change the key it signs with, `signAnswer` to answer
 *          sign_event with that text, `pubAnswer` to answer get_public_key with that
 *          value, and `beforeAnswer(method)` to run first. Anything else sent to the
 *          relay lands in `published`
 */
export function installFakeSigner() {
    const signer = { requests: [], published: [], refuse: {}, signAsHex: SIGNER_HEX, sockets: 0, closed: 0 };
    const conversationKey = (peer) => nip44.v2.utils.getConversationKey(hexToBytes(SIGNER_HEX), peer);

    const answer = async ({ method, params }) => {
        switch (method) {
            case 'connect': return 'ack';
            case 'get_public_key': return signer.pubAnswer ?? SIGNER_PUB;
            case 'sign_event':
                if (signer.signAnswer !== undefined) return signer.signAnswer;
                return JSON.stringify(await finalizeEvent(JSON.parse(params[0]), hexToBytes(signer.signAsHex)));
            case 'nip04_encrypt':
            case 'nip44_encrypt':
            case 'nip04_decrypt':
            case 'nip44_decrypt':
                return `${method}:${params[1]}`;
            default: throw new Error(`fake signer: no ${method}`);
        }
    };

    class FakeRelaySocket {
        constructor(url) {
            this.url = url;
            this.subId = null;
            signer.sockets++;
            queueMicrotask(() => this.onopen?.());
        }

        async send(frame) {
            const [type, a] = JSON.parse(frame);
            if (type === 'REQ') { this.subId = a; return; }
            if (type !== 'EVENT') return;
            if (a.kind !== 24133) { signer.published.push(a); return; }

            const key = conversationKey(a.pubkey);
            const request = JSON.parse(nip44.v2.decrypt(a.content, key));
            signer.requests.push({ method: request.method, params: request.params });
            await signer.beforeAnswer?.(request.method);
            const refusal = signer.refuse[request.method];
            const body = refusal
                ? { id: request.id, error: refusal }
                : { id: request.id, result: await answer(request) };
            const reply = await finalizeEvent({
                kind: 24133,
                content: nip44.v2.encrypt(JSON.stringify(body), key),
                tags: [['p', a.pubkey]],
                created_at: Math.floor(Date.now() / 1000),
            }, hexToBytes(SIGNER_HEX));
            this.onmessage?.({ data: JSON.stringify(['EVENT', this.subId, reply]) });
        }

        close() { signer.closed++; }
    }

    vi.stubGlobal('WebSocket', FakeRelaySocket);
    return signer;
}
