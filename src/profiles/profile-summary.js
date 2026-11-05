/**
 * A short summary of each identity's public profile (its name and when it was
 * published), written by the profile tab whenever it loads a confirmed profile,
 * so the side panel profile view shows the same profile and follows edits made
 * in the tab. Public data only. Kept per device.
 */
export const SUMMARY_KEY = '_publicProfileSummary';
const HEX64 = /^[0-9a-f]{64}$/;
const MAX_NAME = 64;

/** The name a profile shows, cut to a safe length, or ''. */
export function summaryName(content) {
    if (!content || typeof content !== 'object') return '';
    const pick = [content.display_name, content.name].find(v => typeof v === 'string' && v.trim());
    return pick ? pick.trim().slice(0, MAX_NAME) : '';
}

/** Store the summary for `pubkey` unless an equal or newer one is already kept. */
export async function rememberSummary(api, pubkey, event, content) {
    const pk = String(pubkey || '').toLowerCase();
    const at = event && Number.isSafeInteger(event.created_at) ? event.created_at : null;
    if (!HEX64.test(pk) || at == null) return false;
    const got = (await api.storage.local.get({ [SUMMARY_KEY]: {} }))[SUMMARY_KEY] || {};
    const prev = got[pk];
    const name = summaryName(content);
    if (prev && prev.at >= at && prev.name === name) return false;
    if (prev && prev.at > at) return false;
    await api.storage.local.set({ [SUMMARY_KEY]: { ...got, [pk]: { name, at } } });
    return true;
}

/** The kept summary for `pubkey`, or null. */
export async function readSummary(api, pubkey) {
    const pk = String(pubkey || '').toLowerCase();
    if (!HEX64.test(pk)) return null;
    try {
        const got = (await api.storage.local.get({ [SUMMARY_KEY]: {} }))[SUMMARY_KEY] || {};
        const s = got[pk];
        return s && typeof s.name === 'string' && Number.isSafeInteger(s.at) ? s : null;
    } catch (_) { return null; }
}
