/**
 * Fetch an identity's public profile (kind 0) and relay list (kind 10002)
 * from its relays, keeping only events that are genuinely its own.
 *
 * Every event a relay returns is checked: right kind, right author, id
 * recomputed, Schnorr signature verified. Of the survivors the newest
 * `created_at` wins; on a tie the lowest id wins (NIP-01 replaceable rule).
 *
 * The result `state` is:
 *   - 'confirmed'   a verified kind 0 was found;
 *   - 'none'        every queried relay answered (EOSE) and none had one;
 *   - 'partial'     some relays answered empty but others timed out, closed or
 *                   refused; treated like 'unreachable' (editing locked, Retry);
 *   - 'unreachable' no relay answered, so nothing is known and editing must
 *                   stay locked so nothing gets overwritten.
 *
 * Pure: relays are opened through an injected `openRelay(url)` that returns an
 * object with connect(), subscribe(subId, filters, onEvent, onEose),
 * unsubscribe(subId) and close() (RelayConnection in nip46.js).
 */
import { calculateEventId, verifySignature } from 'nostr-crypto-utils';

export const FETCH_TIMEOUT_MS = 8000;
export const MAX_CONTENT_BYTES = 64 * 1024;
export const MAX_EVENTS_PER_RELAY = 20;
const HEX64 = /^[0-9a-f]{64}$/;

/** True only if `event` is a well-formed `kind` event by `pubkey` with a valid id and signature. */
export async function isOwnEvent(event, pubkey, kind) {
    if (!event || typeof event !== 'object' || event.kind !== kind) return false;
    if (typeof pubkey !== 'string' || event.pubkey !== pubkey.toLowerCase()) return false;
    if (typeof event.id !== 'string' || !HEX64.test(event.id) || typeof event.sig !== 'string' ||
        typeof event.created_at !== 'number' || !Array.isArray(event.tags) ||
        typeof event.content !== 'string') return false;
    try {
        if ((await calculateEventId(event)) !== event.id) return false;
        return (await verifySignature(event)) === true;
    } catch (_) {
        return false;
    }
}

/** Newest by created_at; on a tie, lowest id. */
export function pickNewest(events) {
    let best = null;
    for (const e of events) {
        if (!best || e.created_at > best.created_at ||
            (e.created_at === best.created_at && e.id < best.id)) best = e;
    }
    return best;
}

/** Parse kind 0 content into an object; null when it is not a JSON object. */
export function parseProfileContent(event) {
    if (!event) return null;
    try {
        const v = JSON.parse(event.content);
        return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
    } catch (_) {
        return null;
    }
}

/** Ask one relay; resolves { answered, events } and never rejects. */
function askRelay(openRelay, url, filters, timeoutMs) {
    return new Promise((resolve) => {
        let relay;
        let done = false;
        const events = [];
        const subId = `pf-${Math.random().toString(36).slice(2, 10)}`;
        const finish = (answered) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            try { relay?.unsubscribe(subId); } catch (_) {}
            try { relay?.close(); } catch (_) {}
            resolve({ url, answered, events });
        };
        const timer = setTimeout(() => finish(false), timeoutMs);
        (async () => {
            try {
                relay = openRelay(url);
                await relay.connect();
                if (done) { try { relay.close(); } catch (_) {} return; }
                relay.subscribe(subId, filters,
                    (ev) => {
                        if (done || events.length >= MAX_EVENTS_PER_RELAY) return;
                        if (!ev || typeof ev.content !== 'string' || ev.content.length > MAX_CONTENT_BYTES) return;
                        events.push(ev);
                    },
                    () => finish(true));
            } catch (_) {
                finish(false);
            }
        })();
    });
}

/**
 * @param {{pubkey: string, urls: string[], openRelay: (url: string) => object, timeoutMs?: number}} opts
 * @returns {Promise<{state: 'confirmed'|'none'|'partial'|'unreachable', event: object|null,
 *   content: object|null, relayListEvent: object|null, answered: number, asked: number}>}
 */
export async function fetchProfile({ pubkey, urls, openRelay, timeoutMs = FETCH_TIMEOUT_MS }) {
    const pk = typeof pubkey === 'string' ? pubkey.toLowerCase() : '';
    if (!HEX64.test(pk)) throw new Error('Invalid pubkey');
    const list = Array.isArray(urls) ? urls : [];
    const filters = [{ kinds: [0], authors: [pk], limit: 5 }, { kinds: [10002], authors: [pk], limit: 5 }];
    const replies = await Promise.all(list.map(u => askRelay(openRelay, u, filters, timeoutMs)));

    const answered = replies.filter(r => r.answered).length;
    // Verify every event first, then dedupe survivors by id, so a forged copy
    // reusing a genuine id can never displace the real event.
    // Events from a relay that timed out still count if they verify.
    const seen = new Set();
    const k0 = [];
    const k10002 = [];
    for (const r of replies) for (const e of r.events) {
        if (!e || typeof e.id !== 'string' || seen.has(e.id)) continue;
        if (e.kind === 0 && await isOwnEvent(e, pk, 0)) { seen.add(e.id); k0.push(e); }
        else if (e.kind === 10002 && await isOwnEvent(e, pk, 10002)) { seen.add(e.id); k10002.push(e); }
    }
    const event = pickNewest(k0);
    const relayListEvent = pickNewest(k10002);
    let state;
    if (event) state = 'confirmed';
    else if (list.length > 0 && answered === list.length) state = 'none';
    else if (answered > 0) state = 'partial';
    else state = 'unreachable';
    return { state, event, content: parseProfileContent(event), relayListEvent, answered, asked: list.length };
}

/** Should `incoming` replace the stored kind 10002? Only when strictly newer (tie: lower id). */
export function isNewerRelayList(incoming, stored) {
    if (!incoming) return false;
    if (!stored || typeof stored.created_at !== 'number') return true;
    if (incoming.created_at !== stored.created_at) return incoming.created_at > stored.created_at;
    return typeof stored.id === 'string' && incoming.id < stored.id;
}
