/**
 * copy-secret.js — copy a secret (nsec, seed phrase, bunker URI with a
 * secret, API key secret) and clear the clipboard after 60 seconds.
 *
 * The clear runs only while the page that copied is still open: no
 * offscreen document, no new permissions. Clearing is best effort; if the
 * clipboard refuses the write, nothing is thrown.
 *
 * Public values (npub, hex pubkey) use a plain clipboard write, not this.
 */

export const SECRET_CLEAR_MS = 60000;

let pendingClear = null;

/**
 * @param {string} text
 * @param {{ clipboard?: { writeText(s: string): Promise<void> }, delayMs?: number }} [opts]
 * @returns {Promise<void>} resolves once copied; rejects if the copy fails
 */
export async function copySecret(text, opts = {}) {
    const clipboard = opts.clipboard
        || (typeof navigator !== 'undefined' ? navigator.clipboard : undefined);
    if (!clipboard?.writeText) throw new Error('Clipboard unavailable');
    await clipboard.writeText(text);
    if (pendingClear) clearTimeout(pendingClear);
    pendingClear = setTimeout(() => {
        pendingClear = null;
        try {
            Promise.resolve(clipboard.writeText('')).catch(() => {});
        } catch (_) { /* best effort */ }
    }, opts.delayMs ?? SECRET_CLEAR_MS);
}
