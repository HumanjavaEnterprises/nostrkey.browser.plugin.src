/**
 * Whether the browser says the sheet can be seen, where it can say so. Only Chromium
 * reports this today. Elsewhere nothing here runs and the sheet works as it did.
 */

// The browser allows no less than 100 ms between reports.
const REPORT_DELAY_MS = 100;

// How long the sheet has to have been in view before it counts.
export const SEEN_QUIET_MS = 450;

// How long the sheet may stay out of view before the request moves to a tab. Long
// enough for its slide-in on a busy page.
export const UNSEEN_LIMIT_MS = 1500;

/**
 * @param {Window} [win]
 * @returns {boolean} true if this browser reports whether content can be seen
 */
export function canTrackVisibility(win = window) {
    return typeof win.IntersectionObserver === 'function'
        && typeof win.IntersectionObserverEntry === 'function'
        && 'isVisible' in win.IntersectionObserverEntry.prototype;
}

/**
 * Hold until the sheet is reported in view, and again as soon as it is not. Each
 * report arrives up to REPORT_DELAY_MS late, so this cannot catch a change made in
 * the last moment before a click.
 *
 * @param {Element} target
 * @param {{onHold: (held: boolean) => void, onUnseen: () => void}} handlers
 *        `onHold` hears every change, and `onUnseen` fires once, when the sheet has
 *        been out of view for too long.
 * @param {Window} [win]
 * @returns {() => void} stops watching
 */
export function trackVisibility(target, { onHold, onUnseen }, win = window) {
    if (!canTrackVisibility(win)) return () => {};

    let held = false;
    let seenTimer = null;
    let unseenTimer = null;
    let gaveUp = false;

    const setHeld = (value) => {
        if (held === value) return;
        held = value;
        onHold(value);
    };
    const armUnseen = () => {
        clearTimeout(unseenTimer);
        unseenTimer = setTimeout(() => {
            // A tab in the background is out of view, but nothing is covering it.
            if (win.document.visibilityState !== 'visible') {
                armUnseen();
                return;
            }
            gaveUp = true;
            onUnseen();
        }, UNSEEN_LIMIT_MS);
    };
    const onReport = (entries) => {
        if (gaveUp) return;
        const seen = entries[entries.length - 1].isVisible;
        clearTimeout(seenTimer);
        if (seen) {
            clearTimeout(unseenTimer);
            seenTimer = setTimeout(() => setHeld(false), SEEN_QUIET_MS);
            return;
        }
        setHeld(true);
        armUnseen();
    };

    const observer = new win.IntersectionObserver(onReport, {
        threshold: [0, 1],
        trackVisibility: true,
        delay: REPORT_DELAY_MS,
    });
    setHeld(true);
    armUnseen();
    observer.observe(target);

    return () => {
        clearTimeout(seenTimer);
        clearTimeout(unseenTimer);
        observer.disconnect();
    };
}
