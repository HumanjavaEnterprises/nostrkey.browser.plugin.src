/**
 * Which relay URLs to open for a read or write, and for which identity.
 *
 * With no `pubkey`, the active profile's own relay list is used (the
 * behaviour every caller had before). With a `pubkey`, the profile for that
 * identity is used instead: its NIP-65 relay list (kind 10002, kept on the
 * profile as `relayListEvent`) when that event is genuinely the identity's
 * own (id and signature check out, right author, right kind) and names at
 * least one relay for the mode; otherwise its own relay list.
 *
 * Every URL, from either source, must be a safe relay address: wss://, or
 * ws:// only to this machine; no credentials; no private-network addresses.
 * URLs are normalised, deduplicated and capped at MAX_RELAYS.
 */
import { calculateEventId, verifySignature } from 'nostr-crypto-utils';

export const MAX_RELAYS = 20;

const profileIdentity = (p) => (p && (p.pubKey || p.remotePubkey)) || null;

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function isPrivateIpLiteral(host) {
    const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (v4) {
        const [a, b] = [Number(v4[1]), Number(v4[2])];
        return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
            (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
            (a === 100 && b >= 64 && b <= 127);
    }
    if (host.startsWith('[')) {
        const h = host.slice(1, -1).toLowerCase();
        return h === '::' || h === '::1' || h.startsWith('fc') || h.startsWith('fd') ||
            /^fe[89ab]/.test(h) || h.startsWith('::ffff:');
    }
    return false;
}

/** A safe, normalised relay URL, or null if it must not be used. */
export function normaliseRelayUrl(raw) {
    if (typeof raw !== 'string' || raw.length > 512) return null;
    let u;
    try { u = new URL(raw.trim()); } catch (_) { return null; }
    if (u.username || u.password) return null;
    const host = u.hostname.toLowerCase();
    if (!host) return null;
    const loopback = LOOPBACK_HOSTS.has(host);
    if (u.protocol === 'ws:') {
        if (!loopback) return null;
    } else if (u.protocol !== 'wss:') {
        return null;
    } else if (!loopback && isPrivateIpLiteral(host)) {
        return null;
    }
    u.hash = '';
    let s = u.toString();
    if (s.endsWith('/')) s = s.slice(0, -1);
    return s;
}

/** Validate, normalise, merge duplicates (OR the flags) and cap a relay list. */
export function sanitiseRelayList(list) {
    const byUrl = new Map();
    for (const r of Array.isArray(list) ? list : []) {
        const url = normaliseRelayUrl(r?.url);
        if (!url) continue;
        const seen = byUrl.get(url);
        if (seen) {
            seen.read = seen.read || !!r.read;
            seen.write = seen.write || !!r.write;
        } else {
            if (byUrl.size >= MAX_RELAYS) continue;
            byUrl.set(url, { url, read: !!r.read, write: !!r.write });
        }
    }
    return [...byUrl.values()];
}

/** Read/write URLs from a kind 10002 event's `r` tags (NIP-65). */
export function relaysFromKind10002(event) {
    if (!event || event.kind !== 10002 || !Array.isArray(event.tags)) return null;
    const out = [];
    for (const tag of event.tags) {
        if (!Array.isArray(tag) || tag[0] !== 'r' || typeof tag[1] !== 'string') continue;
        const marker = tag[2];
        // NIP-65 knows only no marker (both), 'read' and 'write'; anything else is ignored.
        if (marker !== undefined && marker !== 'read' && marker !== 'write') continue;
        out.push({
            url: tag[1],
            read: marker !== 'write',
            write: marker !== 'read',
        });
    }
    return sanitiseRelayList(out);
}

/** True only if the event is a kind 10002 by `pubkey` with a valid id and signature. */
export async function isOwnRelayListEvent(event, pubkey) {
    if (!event || typeof event !== 'object' || event.kind !== 10002) return false;
    if (typeof event.pubkey !== 'string' || typeof pubkey !== 'string' ||
        event.pubkey.toLowerCase() !== pubkey.toLowerCase()) return false;
    if (typeof event.id !== 'string' || typeof event.sig !== 'string' ||
        typeof event.created_at !== 'number' || !Array.isArray(event.tags)) return false;
    try {
        if ((await calculateEventId(event)) !== event.id) return false;
        return (await verifySignature(event)) === true;
    } catch (_) {
        return false;
    }
}

const pick = (list, mode) => list.filter(r => mode === 'read' ? r.read : r.write).map(r => r.url);

export async function selectRelayUrls(mode, profiles, activeIndex,
    { pubkey = null, identityOf = profileIdentity, verify = isOwnRelayListEvent } = {}) {
    const list = Array.isArray(profiles) ? profiles : [];
    let profile;
    if (pubkey) {
        const want = String(pubkey).toLowerCase();
        profile = list.find(p => (identityOf(p) || '').toLowerCase() === want);
        if (!profile) throw new Error('No profile for that identity');
    } else {
        profile = list[activeIndex];
    }
    const own = pick(sanitiseRelayList(profile?.relays), mode);
    if (!pubkey || !profile?.relayListEvent) return own;
    if (!(await verify(profile.relayListEvent, identityOf(profile)))) return own;
    const fromNip65 = pick(relaysFromKind10002(profile.relayListEvent) || [], mode);
    return fromNip65.length ? fromNip65 : own;
}
