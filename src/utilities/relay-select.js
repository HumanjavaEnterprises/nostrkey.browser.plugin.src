/**
 * Which relay URLs to open for a read or write, and for which identity.
 *
 * With no `pubkey`, the active profile's own relay list is used (the
 * behaviour every caller had before). With a `pubkey`, the profile for that
 * identity is used instead: its NIP-65 relay list (kind 10002, kept on the
 * profile as `relayListEvent`) when one is known, else its own relay list.
 */
const profileIdentity = (p) => (p && (p.pubKey || p.remotePubkey)) || null;

/** Read/write URLs from a kind 10002 event's `r` tags (NIP-65). */
export function relaysFromKind10002(event) {
    if (!event || event.kind !== 10002 || !Array.isArray(event.tags)) return null;
    const out = [];
    for (const tag of event.tags) {
        if (!Array.isArray(tag) || tag[0] !== 'r' || typeof tag[1] !== 'string') continue;
        const marker = tag[2];
        out.push({
            url: tag[1],
            read: marker !== 'write',
            write: marker !== 'read',
        });
    }
    return out;
}

export function selectRelayUrls(mode, profiles, activeIndex, { pubkey = null, identityOf = profileIdentity } = {}) {
    const list = Array.isArray(profiles) ? profiles : [];
    let profile;
    if (pubkey) {
        const want = String(pubkey).toLowerCase();
        profile = list.find(p => (identityOf(p) || '').toLowerCase() === want);
        if (!profile) throw new Error('No profile for that identity');
    } else {
        profile = list[activeIndex];
    }
    const fromNip65 = pubkey ? relaysFromKind10002(profile?.relayListEvent) : null;
    const relayList = (fromNip65 && fromNip65.length) ? fromNip65 : (profile?.relays || []);
    return relayList
        .filter(r => mode === 'read' ? r.read : r.write)
        .map(r => r.url);
}
