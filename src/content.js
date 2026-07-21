import { api } from './utilities/browser-polyfill';

async function shouldInject() {
    if (window === window.top) return true;
    try {
        const data = await api.storage.local.get({ blockCrossOriginFrames: true });
        if (!data.blockCrossOriginFrames) return true;
    } catch {
        return false;
    }
    try {
        void window.top.location.href; // throws for cross-origin frames
        return true;
    } catch {
        return false;
    }
}

// NK-5: per-page-load channel token shared privately with the injected
// page-world script. Passed via a data attribute that the injected script
// reads and strips synchronously on load. Every response we post back to the
// page carries this token so a same-page script that only saw the request
// broadcast cannot forge a response.
const NK_CHANNEL_TOKEN = crypto.randomUUID();

shouldInject().then(inject => {
    if (!inject) return;
    let script = document.createElement('script');
    script.setAttribute('src', api.runtime.getURL('nostr.build.js'));
    script.dataset.nkToken = NK_CHANNEL_TOKEN;
    document.body.appendChild(script);

    // Reset auto-lock timer when a Nostr-enabled tab gains focus
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            api.runtime.sendMessage({ kind: 'resetAutoLock' }).catch(() => {});
        }
    });
});

// ── Appearance for injected chrome ────────────────────────────────────────
// The injected consent chrome (locked sheet, permission-sheet wrapper, FAB)
// follows the user's Appearance prefs (a11y_prefs → LOOK × MODE + reduce
// motion). SECURITY: storage values only ever SELECT one of these hardcoded
// literal palettes — no storage-derived string is interpolated into injected
// markup. Values copied verbatim from instrument.css skin tokens.
const NK_PALETTES = {
    'instrument-dark':  { base: '#0E0F13', panel: '#16181D', hair: '#2A2E37', text: '#E7E9EE', muted: '#8A90A0', signal: '#c084fc', signalDim: 'rgba(192,132,252,0.16)' },
    'instrument-light': { base: '#F4F5F7', panel: '#FFFFFF', hair: '#DCDFE6', text: '#191B22', muted: '#626878', signal: '#7C3AED', signalDim: 'rgba(124,58,237,0.12)' },
    'analog-dark':      { base: '#141210', panel: '#1C1815', hair: '#352E25', text: '#EDE6DA', muted: '#A2937C', signal: '#fbbf24', signalDim: 'rgba(251,191,36,0.14)' },
    'analog-light':     { base: '#F4EAD6', panel: '#FCF6E8', hair: '#DBCAA4', text: '#33260F', muted: '#72613A', signal: '#984E09', signalDim: 'rgba(152,78,9,0.12)' },
    'console-dark':     { base: '#0B1220', panel: '#111A2B', hair: '#24314A', text: '#E6EDF6', muted: '#8391A8', signal: '#2dd4bf', signalDim: 'rgba(45,212,191,0.15)' },
    'console-light':    { base: '#F1F5F9', panel: '#FFFFFF', hair: '#D2DBE6', text: '#0F172A', muted: '#5B6879', signal: '#0A766C', signalDim: 'rgba(10,118,108,0.12)' },
};

let nkLookPromise = null;

async function readNkLook() {
    let prefs = null;
    try {
        const data = await api.storage.sync.get('a11y_prefs');
        if (data && data.a11y_prefs && typeof data.a11y_prefs === 'object') prefs = data.a11y_prefs;
    } catch (_) { /* sync unavailable — fall through */ }
    if (!prefs) {
        try {
            const data = await api.storage.local.get('a11y_prefs');
            if (data && data.a11y_prefs && typeof data.a11y_prefs === 'object') prefs = data.a11y_prefs;
        } catch (_) { /* storage unavailable — defaults below */ }
    }
    prefs = prefs || {};
    // Mirrors a11y.js sanitize(): unknown values fall back to defaults.
    const theme = ['instrument', 'analog', 'console'].includes(prefs.theme) ? prefs.theme : 'console';
    let mode = ['dark', 'light', 'system'].includes(prefs.mode) ? prefs.mode : 'dark';
    if (mode === 'system') {
        try {
            mode = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        } catch (_) {
            mode = 'dark';
        }
    }
    return {
        p: NK_PALETTES[theme + '-' + mode] || NK_PALETTES['console-dark'],
        reduceMotion: prefs.reduceMotion === true,
    };
}

function getNkLook() {
    if (!nkLookPromise) nkLookPromise = readNkLook();
    return nkLookPromise;
}

// Re-resolve on pref changes (Appearance edited in another surface).
try {
    api.storage.onChanged.addListener((changes, area) => {
        if ((area === 'sync' || area === 'local') && changes.a11y_prefs) nkLookPromise = null;
    });
} catch (_) { /* onChanged unavailable — cache simply persists */ }

// ── Injected-surface isolation (clickjacking / UI-redress defense) ────────────
// Every injected overlay (locked sheet, permission consent sheet, FAB) mounts
// inside a CLOSED shadow root on a hardened host. Two things this buys us:
//   1. Page CSS selectors cannot reach the internal nodes (no restyling the
//      consent iframe — e.g. the classic opacity:.02!important redress attack).
//   2. The host lives in the page's light DOM. Pinning the host's OWN
//      compositing properties inline with !important beats any author stylesheet
//      !important, so the page cannot restyle the host itself transparent /
//      transformed / filtered.
// LIMITS — read before trusting this as anti-clickjacking (it is NOT sufficient):
//   • Inline pins only govern the host's own box. They do NOT defend against an
//     ANCESTOR effect: because the page has DOM write access to document.body,
//     it can wrap or re-parent our host under an attacker element with
//     opacity<1 / filter / transform. Group/compositing effects apply to the
//     whole subtree and a descendant cannot opt out — so the host can still be
//     rendered ~transparent-but-clickable and a click lured onto the real Allow.
//   • A page can also paint its OWN decoy at the same max z-index over the sheet.
// In-page consent embedded by an untrusted page is INHERENTLY redress-exposed;
// only the tab fallback (chrome://, PDF, bunker) is fully redress-immune. The
// shadow root + host pins close the trivial page-CSS restyle, not re-parenting.
// T0-1 still holds regardless — the Allow verb never lives in page DOM, so this
// is a defeat-the-human risk, not a forge-consent-without-a-click one.
function mountShadowHost() {
    const host = document.createElement('div');
    const pin = (prop, val) => host.style.setProperty(prop, val, 'important');
    pin('all', 'initial');
    pin('position', 'fixed');
    pin('top', '0');
    pin('left', '0');
    pin('width', '0');
    pin('height', '0');
    pin('z-index', '2147483647');
    pin('opacity', '1');
    pin('visibility', 'visible');
    pin('display', 'block');
    pin('transform', 'none');
    pin('filter', 'none');
    pin('mix-blend-mode', 'normal');
    pin('pointer-events', 'auto');
    const root = host.attachShadow({ mode: 'closed' });
    // Mount on <html>, not <body>: this makes <html> the ONLY ancestor, shrinking
    // the surface for an ancestor group-effect (opacity/filter/transform) redress
    // to a single element the sheet guard watches.
    document.documentElement.appendChild(host);
    return { host, root };
}

// Locked notification sheet — shown when a site needs the private key
// but the extension is locked. Shows every time until unlocked.
let lockedSheetHost = null;
let lockedSheetEl = null;
let lockedSheetTimer = null;

async function showLockedSheet(firstUnlock) {
    // If already visible, reset the auto-dismiss timer
    if (lockedSheetEl && lockedSheetEl.classList.contains('active')) {
        if (lockedSheetTimer) clearTimeout(lockedSheetTimer);
        lockedSheetTimer = setTimeout(dismissLockedSheet, 5000);
        return;
    }

    const { p, reduceMotion } = await getNkLook();

    // Remove any stale sheet (including one created while we awaited)
    if (lockedSheetHost) lockedSheetHost.remove();

    const { host, root } = mountShadowHost();
    const sheet = document.createElement('div');
    sheet.id = 'nostrkey-locked-sheet';
    sheet.innerHTML = `
        <style>
            #nostrkey-locked-sheet {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                pointer-events: auto;
            }
            #nostrkey-locked-sheet .nk-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            #nostrkey-locked-sheet.active .nk-backdrop {
                opacity: 1;
            }
            #nostrkey-locked-sheet .nk-sheet {
                position: relative;
                background: ${p.panel};
                border-top: 1px solid ${p.hair};
                border-radius: 16px 16px 0 0;
                padding: 24px;
                transform: translateY(100%);
                transition: transform 0.3s ease;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
            }
            #nostrkey-locked-sheet.active .nk-sheet {
                transform: translateY(0);
            }
            #nostrkey-locked-sheet .nk-handle {
                width: 40px;
                height: 4px;
                background: ${p.hair};
                border-radius: 2px;
                margin: 0 auto 16px;
            }
            #nostrkey-locked-sheet .nk-icon {
                font-size: 32px;
                text-align: center;
                margin-bottom: 12px;
            }
            #nostrkey-locked-sheet .nk-title {
                color: ${p.text};
                font-size: 18px;
                font-weight: 600;
                text-align: center;
                margin-bottom: 8px;
            }
            #nostrkey-locked-sheet .nk-text {
                color: ${p.text};
                font-size: 14px;
                text-align: center;
                line-height: 1.5;
                margin-bottom: 4px;
            }
            #nostrkey-locked-sheet .nk-muted {
                color: ${p.muted};
                font-size: 13px;
                text-align: center;
            }
            #nostrkey-locked-sheet .nk-btn {
                display: block;
                width: 100%;
                padding: 14px;
                border-radius: 8px;
                border: 1px solid ${p.signal};
                background: ${p.signalDim};
                color: ${p.signal};
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                margin-top: 20px;
                transition: background 0.15s ease;
            }
            #nostrkey-locked-sheet .nk-btn:hover {
                background: ${p.signalDim};
            }
            ${reduceMotion ? `#nostrkey-locked-sheet .nk-backdrop,
            #nostrkey-locked-sheet .nk-sheet { transition: none; }` : ''}
            @media (prefers-reduced-motion: reduce) {
                #nostrkey-locked-sheet .nk-backdrop,
                #nostrkey-locked-sheet .nk-sheet { transition: none; }
            }
        </style>
        <div class="nk-backdrop"></div>
        <div class="nk-sheet">
            <div class="nk-handle"></div>
            <div class="nk-icon">&#x1F512;</div>
            <div class="nk-title">${firstUnlock ? 'NostrKey Needs to Decrypt Your Keys' : 'NostrKey is Locked'}</div>
            <div class="nk-text">${firstUnlock
                ? 'This site is requesting your Nostr identity. Enter your master password to decrypt your key vault for this session.'
                : 'This site needs your key to sign or encrypt.'}</div>
            <div class="nk-muted">Click the NostrKey icon in your toolbar and enter your master password.</div>
            <button class="nk-btn">Got it</button>
        </div>
    `;
    root.appendChild(sheet);
    lockedSheetHost = host;
    lockedSheetEl = sheet;
    requestAnimationFrame(() => sheet.classList.add('active'));

    sheet.querySelector('.nk-btn').addEventListener('click', dismissLockedSheet);
    sheet.querySelector('.nk-backdrop').addEventListener('click', dismissLockedSheet);

    // Auto-dismiss after 5 seconds
    lockedSheetTimer = setTimeout(dismissLockedSheet, 5000);
}

function dismissLockedSheet() {
    if (lockedSheetTimer) { clearTimeout(lockedSheetTimer); lockedSheetTimer = null; }
    if (!lockedSheetEl) return;
    lockedSheetEl.classList.remove('active');
    const host = lockedSheetHost;
    lockedSheetEl = null;
    lockedSheetHost = null;
    setTimeout(() => host && host.remove(), 300);
}

// ── Permission consent sheet ───────────────────────────────────────────────
// The Allow/Deny UI is an EXTENSION-OWNED iframe (permission/permission.html)
// injected as a dimmed bottom sheet, so the user keeps the site in view for
// informed consent. Because the iframe is a cross-origin extension page, the
// web page CANNOT script into it or click Allow — the T0-1 protection holds.
// The backdrop and the minimized FAB (this file, page DOM) carry NO consent
// action; they only show/hide the sheet, so they are safe to live in the page.
let permSheetHost = null;
let permSheetEl = null;
let permFabHost = null;
let permFabEl = null;
let permSheetSrc = null;

// Generation counter guarding the async gap in showPermissionSheet /
// showPermissionFab: a closePermissionSheet (or a newer show) arriving while
// the appearance read is in flight bumps the counter, so the stale call bails
// instead of resurrecting a sheet the background already closed.
let nkPermGen = 0;

async function showPermissionSheet(src) {
    permSheetSrc = src;
    const gen = ++nkPermGen;
    const { p, reduceMotion } = await getNkLook();
    if (gen !== nkPermGen) return; // superseded while we awaited
    removePermissionFab();
    if (permSheetHost) permSheetHost.remove();
    const { host, root } = mountShadowHost();
    const el = document.createElement('div');
    el.id = 'nostrkey-perm-sheet';
    el.innerHTML = `
        <style>
            #nostrkey-perm-sheet { position: fixed; inset: 0; z-index: 2147483647; }
            #nostrkey-perm-sheet .nk-backdrop {
                position: fixed; inset: 0; background: rgba(0,0,0,0.5);
                opacity: 0;${reduceMotion ? '' : ' transition: opacity .2s ease;'}
            }
            #nostrkey-perm-sheet.active .nk-backdrop { opacity: 1; }
            #nostrkey-perm-sheet .nk-frame-wrap {
                position: fixed; left: 0; right: 0; bottom: 0;
                max-width: 460px; margin: 0 auto;
                transform: translateY(100%);${reduceMotion ? '' : ' transition: transform .3s ease;'}
            }
            #nostrkey-perm-sheet.active .nk-frame-wrap { transform: translateY(0); }
            #nostrkey-perm-sheet iframe {
                display: block; width: 100%; height: 72vh; max-height: 640px;
                border: 0; border-radius: 16px 16px 0 0;
                box-shadow: 0 -6px 28px rgba(0,0,0,.45); background: ${p.base};
            }
            @media (prefers-reduced-motion: reduce) {
                #nostrkey-perm-sheet .nk-backdrop,
                #nostrkey-perm-sheet .nk-frame-wrap { transition: none; }
            }
        </style>
        <div class="nk-backdrop"></div>
        <div class="nk-frame-wrap"><iframe title="NostrKey permission request"></iframe></div>
    `;
    el.querySelector('iframe').src = src; // set via property, not HTML interpolation
    root.appendChild(el);
    permSheetHost = host;
    permSheetEl = el;
    requestAnimationFrame(() => el.classList.add('active'));
    // Backdrop click MINIMISES (request stays pending) rather than dismissing.
    el.querySelector('.nk-backdrop').addEventListener('click', minimizePermissionSheet);
    // Fail-closed redress guard: this is the actual consent surface, so if the page
    // re-parents or visually suppresses it we tear it down (no click can land on a
    // hidden Approve) and escalate the SAME pending request to a redress-immune tab.
    startSheetGuard();
}

function minimizePermissionSheet() {
    if (!permSheetHost) return;
    stopSheetGuard();
    permSheetHost.remove();
    permSheetHost = null;
    permSheetEl = null;
    showPermissionFab();
}

async function showPermissionFab() {
    if (permFabEl || !permSheetSrc) return;
    const gen = ++nkPermGen;
    const { p, reduceMotion } = await getNkLook();
    if (gen !== nkPermGen) return; // superseded while we awaited
    if (permFabEl || !permSheetSrc) return;
    const { host, root } = mountShadowHost();
    const fab = document.createElement('div');
    fab.id = 'nostrkey-perm-fab';
    fab.innerHTML = `
        <style>
            #nostrkey-perm-fab { position: fixed; right: 16px; bottom: 16px; z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            #nostrkey-perm-fab .nk-fab {
                display: inline-flex; align-items: center; gap: 8px; padding: 12px 16px;
                border-radius: 999px; cursor: pointer; border: 1px solid ${p.signal};
                background: ${p.panel}; color: ${p.text}; font-size: 14px; font-weight: 600;
                box-shadow: 0 4px 18px rgba(0,0,0,.4);${reduceMotion ? '' : ' animation: nk-fab-pulse 2s ease-in-out infinite;'}
            }
            #nostrkey-perm-fab .nk-dot { width: 8px; height: 8px; border-radius: 50%; background: ${p.signal}; }
            #nostrkey-perm-fab .nk-fab-cd { font-variant-numeric: tabular-nums; color: ${p.muted}; font-weight: 600; }
            @keyframes nk-fab-pulse { 0%,100%{ box-shadow: 0 4px 18px rgba(0,0,0,.4);} 50%{ box-shadow: 0 4px 24px ${p.signalDim};} }
            @media (prefers-reduced-motion: reduce) {
                #nostrkey-perm-fab .nk-fab { animation: none; }
            }
        </style>
        <button class="nk-fab" type="button"><span class="nk-dot"></span>Review signing request<span class="nk-fab-cd"></span></button>
    `;
    root.appendChild(fab);
    permFabHost = host;
    permFabEl = fab;
    fab.querySelector('.nk-fab').addEventListener('click', () => showPermissionSheet(permSheetSrc));
    startFabCountdown(fab.querySelector('.nk-fab-cd'));
}

// A minimized request keeps counting down; surface the remaining time on the FAB
// so it doesn't silently expire while tucked away. Deadline is read from the
// pending sheet URL that background stamped (?deadline=).
let permFabTimer = null;
function startFabCountdown(cdEl) {
    stopFabCountdown();
    let deadline = 0;
    try { deadline = Number(new URL(permSheetSrc).searchParams.get('deadline')) || 0; } catch (_) { /* no-op */ }
    if (!deadline || !cdEl) return;
    const tick = () => {
        const remaining = deadline - Date.now();
        if (remaining <= 0) { cdEl.textContent = '· expired'; stopFabCountdown(); return; }
        cdEl.textContent = `· ${Math.ceil(remaining / 1000)}s`;
    };
    tick();
    permFabTimer = setInterval(tick, 250);
}
function stopFabCountdown() {
    if (permFabTimer) { clearInterval(permFabTimer); permFabTimer = null; }
}

function removePermissionFab() {
    stopFabCountdown();
    if (permFabHost) { permFabHost.remove(); permFabHost = null; }
    permFabEl = null;
}

function removePermissionUI() {
    nkPermGen++; // invalidate any show* still awaiting its appearance read
    stopSheetGuard();
    if (permSheetHost) { permSheetHost.remove(); permSheetHost = null; permSheetEl = null; }
    removePermissionFab();
    permSheetSrc = null;
}

// ── Sheet redress guard (fail-closed) ────────────────────────────────────────
// The consent iframe lives in page light DOM, so a page with DOM-write access can
// still re-parent our host under a transparent group (opacity/filter) or otherwise
// suppress it while keeping it clickable — luring a click onto the real Approve.
// The inline host pins cannot opt a subtree out of an ANCESTOR group effect. So we
// actively watch: if the surface stops being fully visible / correctly parented,
// we destroy it (nothing left to mis-click) and hand the request to the tab, which
// the page cannot style at all.
let sheetGuardObserver = null;
let sheetGuardTimer = null;

function styleSuppresses(cs) {
    if (!cs) return true;
    return parseFloat(cs.opacity) < 0.9
        || cs.visibility !== 'visible'
        || cs.display === 'none'
        || cs.pointerEvents === 'none'
        || cs.filter !== 'none'
        || cs.transform !== 'none'
        || cs.mixBlendMode !== 'normal'
        || cs.clipPath !== 'none'
        || cs.perspective !== 'none'
        || cs.contentVisibility === 'hidden'
        || (cs.mask && cs.mask !== 'none')
        || (cs.webkitMask && cs.webkitMask !== 'none')
        || (cs.backdropFilter && cs.backdropFilter !== 'none');
}

function sheetLooksCompromised() {
    const host = permSheetHost;
    if (!host || !host.isConnected) return true;
    if (host.parentNode !== document.documentElement) return true; // re-parented
    try {
        if (styleSuppresses(getComputedStyle(host))) return true;       // host box
        if (styleSuppresses(getComputedStyle(document.documentElement))) return true; // sole ancestor
        const iframe = permSheetEl && permSheetEl.querySelector('iframe');
        if (!iframe) return true;
        const ifcs = getComputedStyle(iframe);
        if (parseFloat(ifcs.opacity) < 0.9 || ifcs.visibility !== 'visible') return true;
    } catch (_) {
        return true; // if we can't verify, fail closed
    }
    return false;
}

function onSheetCompromised() {
    stopSheetGuard();
    removePermissionUI(); // destroy the in-page surface — no hidden Approve to click
    // Ask the background to reopen the SAME pending prompt as a dedicated tab.
    api.runtime.sendMessage({ kind: 'permissionSheetCompromised' }).catch(() => {});
}

function startSheetGuard() {
    stopSheetGuard();
    try {
        sheetGuardObserver = new MutationObserver(() => {
            if (sheetLooksCompromised()) onSheetCompromised();
        });
        // childList/subtree catches re-parenting; style/class attrs catch a page
        // dropping a filter/opacity onto <html> or wrapping our host.
        sheetGuardObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style', 'class'],
            childList: true,
            subtree: true,
        });
    } catch (_) { /* observer unavailable — poll still covers us */ }
    // Backstop for effects a mutation can't surface (stylesheet swaps, :hover rules).
    sheetGuardTimer = setInterval(() => {
        if (sheetLooksCompromised()) onSheetCompromised();
    }, 200);
}

function stopSheetGuard() {
    if (sheetGuardObserver) { sheetGuardObserver.disconnect(); sheetGuardObserver = null; }
    if (sheetGuardTimer) { clearInterval(sheetGuardTimer); sheetGuardTimer = null; }
}

// Minimise signal from inside the permission iframe (extension origin). This is a
// harmless UI action (hide the sheet), so confirming it came from OUR iframe is
// enough — no consent decision travels this channel.
window.addEventListener('message', (ev) => {
    if (!permSheetEl) return;
    const iframe = permSheetEl.querySelector('iframe');
    if (!iframe || ev.source !== iframe.contentWindow) return;
    if (ev.data && ev.data.__nostrkey_perm === 'minimize') minimizePermissionSheet();
});

// Listen for requests from background
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // NOTE: consent (Allow/Deny) is NOT rendered in the page DOM. It lives in the
    // extension-owned permission iframe (see showPermissionSheet + audit T0-1);
    // a web page can neither script into it nor click Allow.
    if (message.kind === 'showLockedSheet') {
        showLockedSheet(message.firstUnlock || false);
        sendResponse(true);
        return true;
    }
    if (message.kind === 'showPermissionSheet') {
        showPermissionSheet(message.url);
        sendResponse(true);
        return true;
    }
    if (message.kind === 'closePermissionSheet') {
        removePermissionUI();
        sendResponse(true);
        return true;
    }
});

window.addEventListener('message', async message => {
    // C3 fix: Only accept messages from the top-level page context
    if (message.source !== window) return;

    // Page-reachable methods only. exportProfile and bunkerServer.* are
    // deliberately excluded — those are privileged and may originate ONLY from
    // the extension UI (security audit T0-2 / T0-3).
    const validEvents = [
        'getPubKey',
        'signEvent',
        'getRelays',
        'addRelay',
        'nip04.encrypt',
        'nip04.decrypt',
        'nip44.encrypt',
        'nip44.decrypt',
        'replaceURL',
    ];
    let { kind, reqId, payload } = message.data;
    if (!validEvents.includes(kind)) return;

    try {
        payload = await api.runtime.sendMessage({
            kind,
            payload,
            // NK-03: key permission grants on the full origin (scheme+host[:port]),
            // not the bare host, so http/https and different ports don't share grants.
            host: window.location.origin,
        });
    } catch (e) {
        payload = { error: 'connection_error', message: e.message || 'Failed to reach extension background' };
    }

    kind = `return_${kind}`;

    // NK-5 / NK-6: stamp the private channel token and target this page's own
    // origin so a same-page script can't forge/observe cross-origin.
    window.postMessage({ kind, reqId, payload, token: NK_CHANNEL_TOKEN }, window.location.origin);
});
