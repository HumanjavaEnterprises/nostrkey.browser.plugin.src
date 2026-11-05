/**
 * A relay behind the worker's WebSocket: keeps what is published and serves back
 * whatever a suite puts in `events`, filtered as a relay filters.
 */

import { vi } from 'vitest';

/** @returns {{ published: object[], events: object[], cap?: number }} replaced until vi.unstubAllGlobals() */
export function installRelay() {
    const relay = { published: [], events: [] };

    class RelaySocket {
        constructor() { queueMicrotask(() => this.onopen?.()); }

        send(frame) {
            const [type, a, ...filters] = JSON.parse(frame);
            const filter = filters[0];
            if (type === 'EVENT') {
                relay.published.push(a);
                this.onmessage?.({ data: JSON.stringify(['OK', a.id, true, '']) });
            } else if (type === 'REQ') {
                const tagOk = (f, name, event) => {
                    const want = f[`#${name}`];
                    return !want || event.tags.some(t => t[0] === name && want.includes(t[1]));
                };
                const matches = (f, event) => f.kinds.includes(event.kind)
                    && f.authors.includes(event.pubkey)
                    && tagOk(f, 'd', event) && tagOk(f, 'a', event) && tagOk(f, 'e', event);
                // Like a real relay: newest first, at most `relay.cap` per filter.
                const out = new Map();
                for (const f of filters) {
                    const hits = relay.events.filter(e => matches(f, e))
                        .sort((x, y) => y.created_at - x.created_at)
                        .slice(0, relay.cap ?? Infinity);
                    for (const e of hits) out.set(e.id, e);
                }
                for (const event of out.values()) {
                    this.onmessage?.({ data: JSON.stringify(['EVENT', a, event]) });
                }
                this.onmessage?.({ data: JSON.stringify(['EOSE', a]) });
            }
        }

        close() {}
    }

    vi.stubGlobal('WebSocket', RelaySocket);
    return relay;
}
