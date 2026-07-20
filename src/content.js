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

// Locked notification sheet — shown when a site needs the private key
// but the extension is locked. Shows every time until unlocked.
let lockedSheetEl = null;
let lockedSheetTimer = null;

function showLockedSheet(firstUnlock) {
    // If already visible, reset the auto-dismiss timer
    if (lockedSheetEl && lockedSheetEl.classList.contains('active')) {
        if (lockedSheetTimer) clearTimeout(lockedSheetTimer);
        lockedSheetTimer = setTimeout(dismissLockedSheet, 5000);
        return;
    }

    // Remove any stale sheet
    if (lockedSheetEl) lockedSheetEl.remove();

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
                background: #16181D;
                border-top: 1px solid #2A2E37;
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
                background: #2A2E37;
                border-radius: 2px;
                margin: 0 auto 16px;
            }
            #nostrkey-locked-sheet .nk-icon {
                font-size: 32px;
                text-align: center;
                margin-bottom: 12px;
            }
            #nostrkey-locked-sheet .nk-title {
                color: #E7E9EE;
                font-size: 18px;
                font-weight: 600;
                text-align: center;
                margin-bottom: 8px;
            }
            #nostrkey-locked-sheet .nk-text {
                color: #E7E9EE;
                font-size: 14px;
                text-align: center;
                line-height: 1.5;
                margin-bottom: 4px;
            }
            #nostrkey-locked-sheet .nk-muted {
                color: #8A90A0;
                font-size: 13px;
                text-align: center;
            }
            #nostrkey-locked-sheet .nk-btn {
                display: block;
                width: 100%;
                padding: 14px;
                border-radius: 8px;
                border: 1px solid #c084fc;
                background: rgba(192,132,252,0.16);
                color: #c084fc;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                margin-top: 20px;
                transition: background 0.15s ease;
            }
            #nostrkey-locked-sheet .nk-btn:hover {
                background: rgba(192,132,252,0.26);
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
    document.body.appendChild(sheet);
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
    const el = lockedSheetEl;
    lockedSheetEl = null;
    setTimeout(() => el.remove(), 300);
}

// Listen for requests from background
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // NOTE: consent (Allow/Deny) is intentionally NOT rendered in the page DOM
    // any more. A page could click its own "Allow" button. The only consent
    // authority is the extension-owned permission tab (permission/permission.html),
    // which the background opens directly. See security audit T0-1.
    if (message.kind === 'showLockedSheet') {
        showLockedSheet(message.firstUnlock || false);
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
