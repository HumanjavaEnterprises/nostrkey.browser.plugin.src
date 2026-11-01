/**
 * The worker's own record of each request waiting on an answer, by uuid. What a
 * prompt signs and remembers comes from here, not from the permission surface.
 */

const held = new Map();

/**
 * @param {string} uuid
 * @param {{host: string, method: string, payload: *, key: ?string, rememberable: boolean,
 *          profileIndex: ?number, pubkey: ?string, unreadKey?: ?string,
 *          shownForActive?: boolean}} record
 *        `profileIndex` and `pubkey` are the identity that answers this request;
 *        `unreadKey` is its stored key when that identity could not be read.
 *        `shownForActive` means a prompt named it, so it must still be the active one.
 */
export function holdRequest(uuid, record) {
    held.set(uuid, record);
}

/** Update a held record: which identity answers it, or what it now asks for. */
export function stampHeld(uuid, fields) {
    const record = held.get(uuid);
    if (record) Object.assign(record, fields);
}

/** Hand back a request's record and forget it. */
export function takeHeld(uuid) {
    const record = held.get(uuid) ?? null;
    held.delete(uuid);
    return record;
}

export function heldCount() {
    return held.size;
}
