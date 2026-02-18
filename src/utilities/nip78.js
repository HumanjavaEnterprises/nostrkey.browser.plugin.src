/**
 * NIP-78 Encrypted Vault Protocol
 *
 * Pure functions for building/parsing kind 30078 (parameterized replaceable)
 * events used as an encrypted markdown document vault.
 *
 * d-tag prefix "nostrkey:" namespaces our vault items from other NIP-78 apps.
 * Relays see file paths but not content (NIP-44 encrypted to self).
 */

const KIND_APP_DATA = 30078;
const KIND_DELETION = 5;
const DTAG_PREFIX = 'nostrkey:';
const CLIENT_TAG = 'nostrkey';

/**
 * Build an unsigned kind 30078 vault event.
 * Caller must sign (finalizeEvent or bunker session.signEvent).
 *
 * @param {string} path - Document path (e.g. "notes/todo.md")
 * @param {string} encryptedContent - NIP-44 encrypted content string
 * @returns {object} Unsigned event template
 */
export function buildVaultEvent(path, encryptedContent) {
    return {
        kind: KIND_APP_DATA,
        content: encryptedContent,
        tags: [
            ['d', `${DTAG_PREFIX}${path}`],
            ['client', CLIENT_TAG],
        ],
        created_at: Math.floor(Date.now() / 1000),
    };
}

/**
 * Build an unsigned kind 5 deletion event (NIP-09) for a vault document.
 *
 * @param {string} eventId - The event id to delete
 * @param {string} path - Document path (for the a-tag reference)
 * @returns {object} Unsigned deletion event template
 */
export function buildVaultDeletion(eventId, path) {
    return {
        kind: KIND_DELETION,
        content: 'vault document deleted',
        tags: [
            ['e', eventId],
            ['a', `${KIND_APP_DATA}::${DTAG_PREFIX}${path}`],
        ],
        created_at: Math.floor(Date.now() / 1000),
    };
}

/**
 * Build a REQ filter for fetching all vault documents for a pubkey.
 *
 * @param {string} pubkey - Hex public key
 * @returns {object} Nostr REQ filter
 */
export function buildVaultFilter(pubkey) {
    return {
        kinds: [KIND_APP_DATA],
        authors: [pubkey],
    };
}

/**
 * Parse a kind 30078 event into a vault document descriptor.
 * Returns null if the event is not a nostrkey vault event.
 *
 * @param {object} event - Nostr event
 * @returns {{ path: string, content: string, createdAt: number, eventId: string } | null}
 */
export function parseVaultEvent(event) {
    if (event.kind !== KIND_APP_DATA) return null;

    const dTag = event.tags?.find(t => t[0] === 'd');
    if (!dTag || !dTag[1]?.startsWith(DTAG_PREFIX)) return null;

    const path = dTag[1].slice(DTAG_PREFIX.length);
    if (!path) return null;

    return {
        path,
        content: event.content,
        createdAt: event.created_at,
        eventId: event.id,
    };
}
