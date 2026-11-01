/**
 * A relay behind the worker's WebSocket: keeps what is published and serves back
 * whatever a suite puts in `events`, filtered as a relay filters.
 */

import { vi } from 'vitest';

/** @returns {{ published: object[], events: object[] }} replaced until vi.unstubAllGlobals() */
export function installRelay() {
    const relay = { published: [], events: [] };

    class RelaySocket {
        constructor() { queueMicrotask(() => this.onopen?.()); }

        send(frame) {
            const [type, a, filter] = JSON.parse(frame);
            if (type === 'EVENT') {
                relay.published.push(a);
                this.onmessage?.({ data: JSON.stringify(['OK', a.id, true, '']) });
            } else if (type === 'REQ') {
                const d = filter['#d'];
                for (const event of relay.events) {
                    const wanted = filter.kinds.includes(event.kind)
                        && filter.authors.includes(event.pubkey)
                        && (!d || event.tags.some(t => t[0] === 'd' && d.includes(t[1])));
                    if (wanted) this.onmessage?.({ data: JSON.stringify(['EVENT', a, event]) });
                }
                this.onmessage?.({ data: JSON.stringify(['EOSE', a]) });
            }
        }

        close() {}
    }

    vi.stubGlobal('WebSocket', RelaySocket);
    return relay;
}
