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

shouldInject().then(inject => {
    if (!inject) return;
    let script = document.createElement('script');
    script.setAttribute('src', api.runtime.getURL('nostr.build.js'));
    document.body.appendChild(script);
});

// Permission bottom sheet
let permissionSheet = null;
let permissionResolve = null;

function createPermissionSheet() {
    if (permissionSheet) return;
    
    const sheet = document.createElement('div');
    sheet.id = 'nostrkey-permission-sheet';
    sheet.innerHTML = `
        <style>
            #nostrkey-permission-sheet {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                pointer-events: none;
            }
            #nostrkey-permission-sheet.active {
                pointer-events: auto;
            }
            #nostrkey-permission-sheet .nk-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            #nostrkey-permission-sheet.active .nk-backdrop {
                opacity: 1;
            }
            #nostrkey-permission-sheet .nk-sheet {
                position: relative;
                background: #3e3d32;
                border-radius: 16px 16px 0 0;
                padding: 24px;
                transform: translateY(100%);
                transition: transform 0.3s ease;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
            }
            #nostrkey-permission-sheet.active .nk-sheet {
                transform: translateY(0);
            }
            #nostrkey-permission-sheet .nk-handle {
                width: 40px;
                height: 4px;
                background: #8f908a;
                border-radius: 2px;
                margin: 0 auto 16px;
            }
            #nostrkey-permission-sheet .nk-title {
                color: #a6e22e;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 12px;
                text-align: center;
            }
            #nostrkey-permission-sheet .nk-host {
                color: #66d9ef;
                font-weight: 600;
            }
            #nostrkey-permission-sheet .nk-permission {
                color: #a6e22e;
                font-weight: 600;
            }
            #nostrkey-permission-sheet .nk-text {
                color: #f8f8f2;
                font-size: 14px;
                text-align: center;
                margin-bottom: 8px;
                line-height: 1.5;
            }
            #nostrkey-permission-sheet .nk-buttons {
                display: flex;
                gap: 12px;
                margin-top: 20px;
            }
            #nostrkey-permission-sheet .nk-btn {
                flex: 1;
                padding: 14px;
                border-radius: 8px;
                border: 1px solid #a6e22e;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            #nostrkey-permission-sheet .nk-btn-allow {
                background: rgba(166,226,46,0.1);
                color: #a6e22e;
            }
            #nostrkey-permission-sheet .nk-btn-allow:hover {
                background: rgba(166,226,46,0.2);
            }
            #nostrkey-permission-sheet .nk-btn-deny {
                background: transparent;
                border-color: #f92672;
                color: #f92672;
            }
            #nostrkey-permission-sheet .nk-btn-deny:hover {
                background: rgba(249,38,114,0.1);
            }
            #nostrkey-permission-sheet .nk-remember {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin-top: 16px;
                color: #8f908a;
                font-size: 13px;
            }
            #nostrkey-permission-sheet .nk-remember input {
                accent-color: #a6e22e;
            }
        </style>
        <div class="nk-backdrop"></div>
        <div class="nk-sheet">
            <div class="nk-handle"></div>
            <div class="nk-title">Permission Request <span id="nk-queue" style="color: #8f908a; font-size: 14px; font-weight: 400;"></span></div>
            <div class="nk-text">
                <span class="nk-host" id="nk-host"></span> wants to:
            </div>
            <div class="nk-text" style="font-size:16px;">
                <span class="nk-permission" id="nk-permission"></span>
            </div>
            <div class="nk-buttons">
                <button class="nk-btn nk-btn-allow" id="nk-allow">Allow</button>
                <button class="nk-btn nk-btn-deny" id="nk-deny">Deny</button>
            </div>
            <div class="nk-remember">
                <input type="checkbox" id="nk-remember">
                <label for="nk-remember">Remember this choice</label>
            </div>
        </div>
    `;
    document.body.appendChild(sheet);
    permissionSheet = sheet;
    
    sheet.querySelector('#nk-allow').addEventListener('click', () => {
        handlePermissionResponse(true);
    });
    sheet.querySelector('#nk-deny').addEventListener('click', () => {
        handlePermissionResponse(false);
    });
    sheet.querySelector('.nk-backdrop').addEventListener('click', () => {
        handlePermissionResponse(false);
    });
}

function handlePermissionResponse(allowed) {
    if (!permissionResolve) return;
    const remember = permissionSheet.querySelector('#nk-remember').checked;
    permissionSheet.classList.remove('active');
    permissionSheet.querySelector('#nk-remember').checked = false;
    permissionResolve({ allowed, remember });
    permissionResolve = null;
}

function getHumanPermission(kind) {
    switch (kind) {
        case 'getPubKey': return 'Read your public key';
        case 'signEvent': return 'Sign an event';
        case 'getRelays': return 'Read your relay list';
        case 'nip04.encrypt': return 'Encrypt a message (NIP-04)';
        case 'nip04.decrypt': return 'Decrypt a message (NIP-04)';
        case 'nip44.encrypt': return 'Encrypt a message (NIP-44)';
        case 'nip44.decrypt': return 'Decrypt a message (NIP-44)';
        default: return kind;
    }
}

function showPermissionSheet(host, kind, queuePosition, queueTotal) {
    createPermissionSheet();
    permissionSheet.querySelector('#nk-host').textContent = host;
    permissionSheet.querySelector('#nk-permission').textContent = getHumanPermission(kind);
    const queueEl = permissionSheet.querySelector('#nk-queue');
    if (queueEl) {
        queueEl.textContent = queueTotal > 1 ? `(${queuePosition} of ${queueTotal})` : '';
    }
    permissionSheet.classList.add('active');
    
    return new Promise(resolve => {
        permissionResolve = resolve;
    });
}

// Locked notification sheet — shown when a site needs the private key
// but the extension is locked. Shows every time until unlocked.
let lockedSheetEl = null;
let lockedSheetTimer = null;

function showLockedSheet() {
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
                background: #3e3d32;
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
                background: #8f908a;
                border-radius: 2px;
                margin: 0 auto 16px;
            }
            #nostrkey-locked-sheet .nk-icon {
                font-size: 32px;
                text-align: center;
                margin-bottom: 12px;
            }
            #nostrkey-locked-sheet .nk-title {
                color: #e6db74;
                font-size: 18px;
                font-weight: 600;
                text-align: center;
                margin-bottom: 8px;
            }
            #nostrkey-locked-sheet .nk-text {
                color: #f8f8f2;
                font-size: 14px;
                text-align: center;
                line-height: 1.5;
                margin-bottom: 4px;
            }
            #nostrkey-locked-sheet .nk-muted {
                color: #8f908a;
                font-size: 13px;
                text-align: center;
            }
            #nostrkey-locked-sheet .nk-btn {
                display: block;
                width: 100%;
                padding: 14px;
                border-radius: 8px;
                border: 1px solid #a6e22e;
                background: rgba(166,226,46,0.1);
                color: #a6e22e;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                margin-top: 20px;
                transition: background 0.15s ease;
            }
            #nostrkey-locked-sheet .nk-btn:hover {
                background: rgba(166,226,46,0.2);
            }
        </style>
        <div class="nk-backdrop"></div>
        <div class="nk-sheet">
            <div class="nk-handle"></div>
            <div class="nk-icon">&#x1F512;</div>
            <div class="nk-title">NostrKey is Locked</div>
            <div class="nk-text">This site needs your key to sign or encrypt.</div>
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
    if (message.kind === 'showPermissionSheet') {
        showPermissionSheet(message.host, message.permissionKind, message.queuePosition, message.queueTotal).then(result => {
            sendResponse(result);
        });
        return true; // Keep channel open for async response
    }
    if (message.kind === 'showLockedSheet') {
        showLockedSheet();
        sendResponse(true);
        return true;
    }
});

window.addEventListener('message', async message => {
    // C3 fix: Only accept messages from the top-level page context
    if (message.source !== window) return;

    const validEvents = [
        'getPubKey',
        'signEvent',
        'getRelays',
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
            host: window.location.host,
        });
    } catch (e) {
        payload = { error: 'connection_error', message: e.message || 'Failed to reach extension background' };
    }

    kind = `return_${kind}`;

    window.postMessage({ kind, reqId, payload }, '*');
});
