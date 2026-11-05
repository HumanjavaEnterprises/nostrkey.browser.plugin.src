/**
 * Profile detail tab, editing (P6). Pure helpers shared by the page and the
 * worker: which fields can be edited, how long they may be, and how edits are
 * merged into the newest kind 0 content without losing anything else in it.
 *
 * The merge starts from the newest content object and changes only the fields
 * the user edited. Every other key (birthday, lud06, bot, custom keys, the
 * deprecated displayName and username) is carried over as it was, in the same
 * order.
 */

export const EDIT_FIELDS = [
    { key: 'name', label: 'Name', max: 100 },
    { key: 'display_name', label: 'Display name', max: 100 },
    { key: 'about', label: 'About', max: 2000, multiline: true },
    { key: 'picture', label: 'Picture link', max: 2000, image: true },
    { key: 'banner', label: 'Banner link', max: 2000, image: true },
    { key: 'website', label: 'Website', max: 2000, url: true },
    { key: 'nip05', label: 'Nostr address', max: 320 },
    { key: 'lud16', label: 'Lightning address', max: 320 },
];

const KEYS = new Set(EDIT_FIELDS.map(f => f.key));
const ADDRESS = /^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

/** An https link with no credentials, or '' when it is not one. */
export function httpsUrl(value) {
    try {
        const u = new URL(String(value));
        return u.protocol === 'https:' && !u.username && !u.password && u.hostname ? u.href : '';
    } catch (_) { return ''; }
}

/** The text a field shows in the editor; null when the stored value is not text. */
export function editableValue(content, key) {
    const v = content && typeof content === 'object' ? content[key] : undefined;
    if (v === undefined || v === null) return '';
    return typeof v === 'string' ? v : null;
}

/**
 * Check one edited value. Returns '' when it is fine, else the error in words.
 * An empty value always passes: it clears the field.
 */
export function validateField(key, value) {
    const f = EDIT_FIELDS.find(x => x.key === key);
    if (!f) return 'Not an editable field.';
    if (typeof value !== 'string') return 'Must be text.';
    const v = value.trim();
    if (v === '') return '';
    if (v.length > f.max) return `Keep it to ${f.max} characters or fewer.`;
    if (f.image && !httpsUrl(v)) return 'Use an https link to the image.';
    if (f.url) {
        try {
            const u = new URL(v);
            if (u.protocol !== 'https:' && u.protocol !== 'http:') return 'Use a web link starting with https://.';
        } catch (_) { return 'Use a web link starting with https://.'; }
    }
    if ((key === 'nip05' || key === 'lud16') && !ADDRESS.test(v)) return 'Use the form name@domain.';
    return '';
}

/** Every error in a set of changes, keyed by field. Empty object when all pass. */
export function validateChanges(changes) {
    const errors = {};
    if (!changes || typeof changes !== 'object' || Array.isArray(changes)) return { _: 'No changes.' };
    for (const [k, v] of Object.entries(changes)) {
        const e = validateField(k, v);
        if (e) errors[k] = e;
    }
    return errors;
}

/**
 * Merge edited fields into the newest content. Unknown keys and unedited
 * fields stay exactly as they were. A field edited to empty is removed.
 */
export function mergeContent(base, changes) {
    const src = base && typeof base === 'object' && !Array.isArray(base) ? base : {};
    const out = {};
    for (const k of Object.keys(src)) out[k] = src[k];
    for (const [k, raw] of Object.entries(changes || {})) {
        if (!KEYS.has(k) || typeof raw !== 'string') continue;
        const v = raw.trim();
        if (v === '') delete out[k];
        else out[k] = v;
    }
    return out;
}

/** The fields whose form value differs from the loaded content. */
export function changedFields(content, form) {
    const out = {};
    for (const f of EDIT_FIELDS) {
        if (!(f.key in (form || {}))) continue;
        const before = editableValue(content, f.key);
        if (before === null) continue; // not text: never edited here
        const now = String(form[f.key]);
        if (now.trim() !== before.trim()) out[f.key] = now;
    }
    return out;
}

/** True when the newest event on the relays is not the one the edit started from. */
export function isStale(baseId, latestEvent) {
    const latest = latestEvent && typeof latestEvent.id === 'string' ? latestEvent.id : null;
    return latest !== (baseId || null);
}

/** The unsigned kind 0 for merged content, always newer than the one it replaces. */
export function buildKind0(content, previous, now = Math.floor(Date.now() / 1000)) {
    const prevAt = previous && typeof previous.created_at === 'number' ? previous.created_at : 0;
    const tags = previous && Array.isArray(previous.tags) ? JSON.parse(JSON.stringify(previous.tags)) : [];
    return { kind: 0, created_at: Math.max(now, prevAt + 1), tags, content: JSON.stringify(content) };
}

/** Allowed clock skew before a previous profile counts as dated in the future. */
export const FUTURE_SKEW_S = 600;

/**
 * True when the previous kind 0 is dated more than FUTURE_SKEW_S ahead. Saving
 * then is refused with a clear message: chasing that date gets the new event
 * rejected by relays that refuse future events, and using now makes it older
 * than the old one so readers keep showing the old profile. Both fail quietly.
 */
export function futureDated(previous, now = Math.floor(Date.now() / 1000)) {
    return !!(previous && typeof previous.created_at === 'number' && previous.created_at > now + FUTURE_SKEW_S);
}

/** Remote text (signer errors, relay messages) shortened before it is shown. */
export function clip(text, max = 200) {
    const s = String(text == null ? '' : text);
    return s.length > max ? `${s.slice(0, max)}...` : s;
}

/** "Published to N of M relays." */
export function publishSummary(accepted, total) {
    return `Published to ${accepted} of ${total} ${total === 1 ? 'relay' : 'relays'}.`;
}
