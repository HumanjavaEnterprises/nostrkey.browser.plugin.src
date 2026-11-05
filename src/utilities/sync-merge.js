/**
 * Shared tombstone-aware merge.
 *
 * One rule for every place remote data meets local data (the storage.sync
 * mirror and both relay pulls, vault documents and API keys): a remote item is
 * dropped when a tombstone for its key is dated at or after the remote item's
 * own timestamp. Deletion wins ties. A copy written after the deletion (a
 * re-create) carries a newer timestamp and is kept.
 *
 * Tombstones are never pruned here.
 */

/**
 * Is `item` superseded by the tombstone for `key`?
 * @param {Object} tombstones - { key: deletedAtSeconds }
 * @param {string} key
 * @param {number} time - the item's timestamp in seconds
 */
export function isTombstoned(tombstones, key, time) {
    if (!tombstones || typeof tombstones !== 'object') return false;
    const ts = tombstones[key];
    return ts != null && (time || 0) <= ts;
}

/**
 * Merge a remote map into a local map.
 *
 * @param {Object} local - { key: item }
 * @param {Object} remote - { key: item }
 * @param {Object} tombstones - { key: deletedAtSeconds }
 * @param {Object} [opts]
 * @param {(item:Object)=>number} [opts.timeOf] - item timestamp (default updatedAt)
 * @returns {{ merged: Object, changed: boolean }}
 */
export function mergeRemote(local, remote, tombstones, opts = {}) {
    const timeOf = opts.timeOf || ((item) => (item && item.updatedAt) || 0);
    const merged = { ...(local || {}) };
    let changed = false;
    for (const [key, item] of Object.entries(remote || {})) {
        if (!item) continue;
        if (isTombstoned(tombstones, key, timeOf(item))) continue;
        const mine = merged[key];
        if (!mine || timeOf(item) > timeOf(mine)) {
            merged[key] = item;
            changed = true;
        }
    }
    for (const key of Object.keys(merged)) {
        if (isTombstoned(tombstones, key, timeOf(merged[key]))) {
            delete merged[key];
            changed = true;
        }
    }
    return { merged, changed };
}

/**
 * Collect deletion times from the author's own kind 5 events (NIP-09) for the
 * given d-tags. Accepts `a` tags `30078:<pubkey>:<dtag>`, and the earlier
 * `30078::<dtag>` shape this extension used to write (the author is already
 * verified by the caller). Also maps `e` tags through `eventIdToDtag`.
 *
 * @param {Array<Object>} deletions - verified kind 5 events by `pubkey`
 * @param {string} pubkey
 * @param {Object} [eventIdToDtag] - { eventId: dtag }
 * @returns {Object} { dtag: latestDeletionCreatedAt }
 */
export function deletionTombstones(deletions, pubkey, eventIdToDtag = {}) {
    const out = {};
    const note = (dtag, ts) => {
        if (out[dtag] == null || ts > out[dtag]) out[dtag] = ts;
    };
    for (const ev of deletions || []) {
        if (!ev || ev.kind !== 5 || ev.pubkey !== pubkey) continue;
        for (const tag of ev.tags || []) {
            if (tag[0] === 'a' && typeof tag[1] === 'string') {
                const full = `30078:${pubkey}:`;
                const legacy = '30078::';
                if (tag[1].startsWith(full)) note(tag[1].slice(full.length), ev.created_at);
                else if (tag[1].startsWith(legacy)) note(tag[1].slice(legacy.length), ev.created_at);
            } else if (tag[0] === 'e' && eventIdToDtag[tag[1]]) {
                note(eventIdToDtag[tag[1]], ev.created_at);
            }
        }
    }
    return out;
}
