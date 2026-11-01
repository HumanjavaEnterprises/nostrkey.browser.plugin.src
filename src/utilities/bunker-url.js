/**
 * bunker:// connection strings. No imports, so anything that handles profiles
 * can use this without loading the relay code.
 *
 * Format: bunker://<pubkey>?relay=wss://...&relay=wss://...&secret=<optional>
 */

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
 * A relay value without credentials: no userinfo, no `secret` param, no fragment.
 * Other query params stay. A value with none of those comes back unchanged.
 */
function cleanRelay(relay) {
    const url = new URL(relay);
    const names = [...url.searchParams.keys()].filter(name => name.toLowerCase() === 'secret');
    if (!url.username && !url.password && !url.hash && names.length === 0) return relay;
    url.username = '';
    url.password = '';
    url.hash = '';
    for (const name of names) url.searchParams.delete(name);
    return url.href;
}

/**
 * Does this connection string carry a secret redactBunkerUrl would remove, in its
 * `secret` param or inside a relay value? Never throws.
 */
export function bunkerUrlHasSecret(url) {
    try {
        const { secret, relays } = parseBunkerUrl(url);
        return !!secret || relays.some(relay => cleanRelay(relay) !== relay);
    } catch {
        return false;
    }
}

const encodeRelay = (relay) =>
    encodeURIComponent(relay).replace(/%3A/g, ':').replace(/%2F/g, '/');

/**
 * The signer's address alone: bunker://<pubkey>?relay=...&relay=...
 * Rebuilt from the parsed fields, so of the connection string only the pubkey and
 * the relay values survive. Each relay value loses its userinfo, `secret` param
 * and fragment, and keeps any other query params it has.
 *
 * @param {*} url a connection string, or anything else
 * @returns {string} the address, or '' if `url` is not a valid connection string
 */
export function redactBunkerUrl(url) {
    let parsed;
    try {
        parsed = parseBunkerUrl(url);
    } catch {
        return '';
    }
    const relays = parsed.relays.map(relay => `relay=${encodeRelay(cleanRelay(relay))}`).join('&');
    return `bunker://${parsed.remotePubkey}?${relays}`;
}

/**
 * The same profile list with each bunkerUrl reduced to its address.
 *
 * @param {*} profiles a profile list; anything else is returned as it is
 * @returns the same list when nothing needed changing, so a caller can skip a
 *          write by comparing references
 */
export function redactProfiles(profiles) {
    if (!Array.isArray(profiles)) return profiles;
    let changed = false;
    const clean = profiles.map((profile) => {
        if (!profile?.bunkerUrl) return profile;
        const bunkerUrl = redactBunkerUrl(profile.bunkerUrl);
        if (bunkerUrl === profile.bunkerUrl) return profile;
        changed = true;
        return { ...profile, bunkerUrl };
    });
    return changed ? clean : profiles;
}

/**
 * Stored sessions are keyed by profile position. Removing a profile takes its
 * session with it and moves later sessions down with their profiles.
 *
 * @param {Object<string, *>} bunkerSessions
 * @param {number} removedIndex
 * @returns {Object<string, *>}
 */
export function bunkerSessionsAfterDelete(bunkerSessions, removedIndex) {
    const shifted = {};
    for (const [position, session] of Object.entries(bunkerSessions || {})) {
        const index = Number(position);
        if (index === removedIndex) continue;
        shifted[index > removedIndex ? index - 1 : index] = session;
    }
    return shifted;
}

/**
 * The same, for any change of position.
 *
 * @param {Object<string, *>} bunkerSessions
 * @param {Array<[number, ?number]>} moves each profile that moved, and to where; null if gone
 * @returns {Object<string, *>}
 */
export function bunkerSessionsAfterMoves(bunkerSessions, moves) {
    const moved = new Map(moves);
    const placed = {};
    for (const [position, session] of Object.entries(bunkerSessions || {})) {
        const index = Number(position);
        const to = moved.has(index) ? moved.get(index) : index;
        if (to !== null) placed[to] = session;
    }
    return placed;
}
