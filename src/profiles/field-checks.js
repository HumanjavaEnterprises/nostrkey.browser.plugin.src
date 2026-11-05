/**
 * Checks for the kind 0 fields the profile tab can verify.
 *
 * Every check resolves (never rejects) to { status, label }:
 *   - 'verified'   the field checks out;
 *   - 'mismatch'   the host answered and the answer is wrong (a warning);
 *   - 'unverified' the check could not be made: network or CORS failure,
 *                  a redirect, a timeout, an unreadable reply. Never a warning.
 *   - 'invalid'    the value itself is malformed.
 *   - 'confirmed'  the field has no outside check; it stands with the
 *                  verified profile event.
 * Each check has a timeout, so no field stays on '?'.
 *
 * Pure: `fetch` and `loadImage` are injectable for tests.
 */

export const CHECK_TIMEOUT_MS = 6000;
const HEX64 = /^[0-9a-f]{64}$/;
const LOCAL_PART = /^[a-z0-9\-_.]+$/;
const MAX_BODY = 64 * 1024;

const result = (status, label) => ({ status, label });
const UNVERIFIED = () => result('unverified', "Couldn't verify");

/** Split name@domain; the local part is lowercased. Null when malformed. */
export function splitAddress(value) {
    if (typeof value !== 'string' || value.length > 320) return null;
    const at = value.trim().lastIndexOf('@');
    const v = value.trim();
    if (at <= 0 || at === v.length - 1) return null;
    const name = v.slice(0, at).toLowerCase();
    const domain = v.slice(at + 1).toLowerCase();
    if (!LOCAL_PART.test(name)) return null;
    let u;
    try { u = new URL(`https://${domain}/`); } catch (_) { return null; }
    if (u.hostname !== domain || u.port || !domain.includes('.')) return null;
    return { name, domain };
}

/** GET a JSON object with no redirects, a timeout and a size limit. Null on any failure. */
async function getJson(fetchFn, url, timeoutMs) {
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    let timer;
    const timeout = new Promise((resolve) => {
        timer = setTimeout(() => { try { ctrl?.abort(); } catch (_) {} resolve(null); }, timeoutMs);
    });
    const work = (async () => {
        try {
            const res = await fetchFn(url, {
                redirect: 'error', credentials: 'omit', cache: 'no-store',
                headers: { Accept: 'application/json' }, signal: ctrl?.signal,
            });
            if (!res || !res.ok || res.redirected) return null;
            const text = await res.text();
            if (typeof text !== 'string' || text.length > MAX_BODY) return null;
            const v = JSON.parse(text);
            return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
        } catch (_) {
            return null;
        }
    })();
    try { return await Promise.race([work, timeout]); } finally { clearTimeout(timer); }
}

/** NIP-05: name@domain must map to `pubkey` in https://domain/.well-known/nostr.json. */
export async function checkNip05(value, pubkey, { fetch: fetchFn = globalThis.fetch, timeoutMs = CHECK_TIMEOUT_MS } = {}) {
    const addr = splitAddress(value);
    if (!addr) return result('invalid', 'Not a valid address');
    const pk = typeof pubkey === 'string' ? pubkey.toLowerCase() : '';
    if (!HEX64.test(pk)) return UNVERIFIED();
    const url = `https://${addr.domain}/.well-known/nostr.json?name=${encodeURIComponent(addr.name)}`;
    const body = await getJson(fetchFn, url, timeoutMs);
    if (!body) return UNVERIFIED();
    const names = body.names;
    if (!names || typeof names !== 'object') return result('mismatch', 'Address does not point to this key');
    const found = Object.prototype.hasOwnProperty.call(names, addr.name) ? names[addr.name] : undefined;
    if (typeof found === 'string' && found.toLowerCase() === pk) return result('verified', 'Verified');
    return result('mismatch', 'Address does not point to this key');
}

/** LUD-16: user@domain must serve a payRequest at https://domain/.well-known/lnurlp/user. */
export async function checkLud16(value, { fetch: fetchFn = globalThis.fetch, timeoutMs = CHECK_TIMEOUT_MS } = {}) {
    const addr = splitAddress(value);
    if (!addr) return result('invalid', 'Not a valid lightning address');
    const url = `https://${addr.domain}/.well-known/lnurlp/${encodeURIComponent(addr.name)}`;
    const body = await getJson(fetchFn, url, timeoutMs);
    if (!body) return UNVERIFIED();
    if (body.tag === 'payRequest' && typeof body.callback === 'string') return result('verified', 'Reachable');
    return result('mismatch', 'Does not accept payments');
}

/** Default image loader: resolves true when the browser can decode it. */
function defaultLoadImage(url, timeoutMs) {
    return new Promise((resolve) => {
        if (typeof Image !== 'function') { resolve(null); return; }
        const img = new Image();
        img.referrerPolicy = 'no-referrer';
        const timer = setTimeout(() => { img.src = ''; resolve(null); }, timeoutMs);
        img.onload = () => { clearTimeout(timer); resolve(img.naturalWidth > 0); };
        img.onerror = () => { clearTimeout(timer); resolve(false); };
        img.src = url;
    });
}

/** picture / banner: https only, and the image must load. */
export async function checkImage(value, { loadImage = defaultLoadImage, timeoutMs = CHECK_TIMEOUT_MS } = {}) {
    let u;
    try { u = new URL(String(value)); } catch (_) { return result('invalid', 'Not a valid link'); }
    if (u.protocol !== 'https:' || u.username || u.password) return result('invalid', 'Image links must use https');
    let timer;
    const timeout = new Promise(resolve => { timer = setTimeout(() => resolve(null), timeoutMs); });
    let ok;
    try { ok = await Promise.race([Promise.resolve().then(() => loadImage(u.href, timeoutMs)), timeout]); }
    catch (_) { ok = null; } finally { clearTimeout(timer); }
    if (ok === true) return result('verified', 'Image loads');
    if (ok === false) return result('mismatch', "Image doesn't load");
    return UNVERIFIED();
}

/**
 * Check every field of a verified kind 0 content object. Unknown and
 * uncheckable fields (name, display_name, about, website, the deprecated
 * displayName/username, ...) are 'confirmed' with the profile.
 */
export async function checkFields(content, pubkey, deps = {}) {
    const out = {};
    if (!content || typeof content !== 'object') return out;
    const jobs = Object.entries(content).map(async ([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (typeof value !== 'string') { out[key] = result('confirmed', 'From your profile'); return; }
        if (key === 'nip05') out[key] = await checkNip05(value, pubkey, deps);
        else if (key === 'lud16') out[key] = await checkLud16(value, deps);
        else if (key === 'picture' || key === 'banner') out[key] = await checkImage(value, deps);
        else out[key] = result('confirmed', 'From your profile');
    });
    await Promise.all(jobs);
    return out;
}
