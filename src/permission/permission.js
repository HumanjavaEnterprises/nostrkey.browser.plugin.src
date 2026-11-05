import { api } from '../utilities/browser-polyfill';
import { blossomProblemText, describeKind, describeMethod, durationWords, requestAction, visibleJson, visibleText } from './kind-labels';
import { checkBlossomAuth } from '../utilities/consent-policy.js';
import { trackVisibility } from './sheet-visibility.js';

const state = {
    host: '',
    permission: '',
    key: '',
    event: null,
    remember: false,
    profileType: 'local',
    queuePosition: 0,
    queueTotal: 0,
    decodeError: false,   // payload failed to parse — say so loudly, never remember
    rawPayload: '',       // payload as the worker sent it (shown when decode fails)
    // Decided by the worker and carried in the query. The page never works these out.
    grantKey: '',
    rememberable: false,
    parsedAt: 0,          // the time, in seconds, the worker read the request at
    profileName: '',
    inbound: false,       // from a client of NostrKey acting as a remote signer
    lockedGrant: false,   // a stored allow the lock is holding back
    requestRisk: '',      // 'danger', 'warn' or 'neutral', valid request or not
};

// Inbound NIP-46 bunker requests arrive with a synthesized host string built in
// background.js: `bunker client <pk12>… (claimed — not verified)`.
const BUNKER_HOST_RE = /^bunker client (.+?)\s*\(claimed — not verified\)$/;

function bunkerClaim() {
    const m = typeof state.host === 'string' ? state.host.match(BUNKER_HOST_RE) : null;
    return m ? m[1] : null;
}

/** The signing readout for a signEvent request (null for other methods). */
function eventKindInfo() {
    if (state.permission !== 'signEvent') return null;
    if (state.decodeError || !state.event || typeof state.event !== 'object') {
        return {
            kind: NaN,
            label: 'Cannot decode this event',
            risk: 'danger',
            rememberable: false,
            known: false,
            nip: 'https://github.com/nostr-protocol/nips',
            warning: 'NostrKey could not decode this event. Signing it is signing something you cannot read.',
        };
    }
    return describeKind(state.event.kind);
}

/** What a media server request asks for, as read when the worker read it. */
function blossomRequest() {
    if (state.permission !== 'signEvent' || state.event?.kind !== 24242) return null;
    return checkBlossomAuth(state.event, state.parsedAt);
}

/** created_at sanity: flag events whose timestamp is far from now. */
function timestampInfo() {
    const ts = state.event?.created_at;
    if (typeof ts !== 'number' || !Number.isFinite(ts)) return null;
    const skewSec = Math.round(ts - Date.now() / 1000);
    const iso = new Date(ts * 1000).toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
    const suspicious = Math.abs(skewSec) > 900; // > 15 min from now
    return { iso, skewSec, suspicious };
}

function addWarnStrip(container, text, level) {
    const div = document.createElement('div');
    div.className = `warn-strip warn-strip--${level === 'danger' ? 'red' : 'amber'}`;
    div.textContent = text;
    container.appendChild(div);
}

// Approve needs this long with no press or key anywhere in the frame.
const APPROVE_QUIET_MS = 450;
// `unseen` is true while the browser does not report the sheet as in view.
const approveHold = { held: false, unseen: false, timer: null, pressRefused: false };

function showApproveHold() {
    const button = document.getElementById('allow-btn');
    if (!button) return;
    if (approveHold.held || approveHold.unseen) button.setAttribute('aria-disabled', 'true');
    else button.removeAttribute('aria-disabled');
}

/** Is this the press or key that activates Approve, rather than a repeat of one? */
function pressesApprove(event, button) {
    if (!button.contains(event.target)) return false;
    return event.type === 'pointerdown'
        || (!event.repeat && (event.key === 'Enter' || event.key === ' '));
}

/**
 * Every press and key in the frame starts the quiet time again. The one that
 * activates an already armed Approve is let through, so a normal click or Enter
 * works. Approve keeps focus during the hold, so the keyboard can still reach it.
 */
function restartApproveHold(event) {
    const button = document.getElementById('allow-btn');
    if (!button) return;
    const onApprove = pressesApprove(event, button);
    if (onApprove) {
        approveHold.pressRefused = approveHold.held || approveHold.unseen || button.disabled;
        if (!approveHold.pressRefused) return;
    }
    approveHold.held = true;
    showApproveHold();
    clearTimeout(approveHold.timer);
    approveHold.timer = setTimeout(() => {
        approveHold.held = false;
        showApproveHold();
    }, APPROVE_QUIET_MS);
}

/** In the sheet, Approve waits on the browser's report that the sheet is in view. */
function watchSheet() {
    if (window.top === window.self) return;
    trackVisibility(document.documentElement, {
        onHold(held) {
            approveHold.unseen = held;
            showApproveHold();
        },
        onUnseen() {
            api.runtime.sendMessage({ kind: 'permissionSheetCompromised' })?.catch?.(() => {});
        },
    });
}

function setRow(rowId, valueId, value) {
    const row = document.getElementById(rowId);
    if (row) row.hidden = !value;
    const el = document.getElementById(valueId);
    if (el && value) el.textContent = value;
}

function renderBlossomRows(blossom) {
    const auth = blossom?.auth;
    const files = auth?.x.length;
    setRow('files-row', 'perm-files', files ? `${files} ${files === 1 ? 'file' : 'files'}` : '');
    setRow('servers-row', 'perm-servers', auth ? (auth.servers.join(', ') || 'any server') : '');
    const left = auth ? auth.expiresAt - Math.floor(Date.now() / 1000) : 0;
    setRow('valid-row', 'perm-valid', auth ? durationWords(Math.max(0, left)) : '');
}

/**
 * Draw the request. If it cannot be drawn, say so loudly; if even that fails, take
 * Approve away, since nothing on screen says what it would do. Deny stays.
 */
function draw() {
    try {
        render();
        return;
    } catch (e) {
        console.error('Could not draw this request:', e);
    }
    state.event = null;
    state.decodeError = true;
    try {
        render();
    } catch (_) {
        const danger = document.getElementById('perm-danger');
        if (danger) {
            danger.textContent = '';
            addWarnStrip(danger, 'Could not decode this request. Deny it.', 'danger');
        }
        document.getElementById('allow-btn')?.remove();
    }
}

function render() {
    const hostEl = document.getElementById('perm-host');
    const permEl = document.getElementById('perm-type');
    const glyphEl = document.getElementById('origin-glyph');
    const claimEl = document.getElementById('origin-claim');
    const bunkerNotice = document.getElementById('bunker-notice');
    const warningsEl = document.getElementById('perm-warnings');
    const dangerEl = document.getElementById('perm-danger');
    const queueEl = document.getElementById('perm-queue');

    const methodInfo = describeMethod(state.permission);
    const kindInfo = eventKindInfo();
    const claimed = bunkerClaim();
    const isSigningEvent = state.permission === 'signEvent';
    const action = isSigningEvent ? requestAction(state.grantKey, state.requestRisk) : null;
    const blossom = blossomRequest();

    // --- Queue counter ----------------------------------------------------
    if (queueEl) {
        queueEl.textContent =
            state.queueTotal > 1 ? `${state.queuePosition}/${state.queueTotal}` : '';
    }

    // --- Requesting origin (favicon-glyph + origin; bunker = claimed chip) -
    if (hostEl) hostEl.textContent = claimed ? `bunker client ${claimed}` : (state.host || 'unknown origin');
    if (claimEl) claimEl.hidden = !claimed;
    if (glyphEl) {
        if (claimed) {
            glyphEl.textContent = '◆';
            glyphEl.classList.add('origin-glyph--bunker');
        } else {
            const bare = String(state.host || '?').replace(/^[a-z]+:\/\//i, '');
            glyphEl.textContent = bare.charAt(0) || '?';
        }
    }

    // --- Action / kind readout --------------------------------------------
    if (permEl) {
        permEl.textContent = action?.label ?? (blossom ? kindInfo.label : methodInfo.label);
        permEl.classList.toggle('readout-val--danger', action?.risk === 'danger');
    }
    setRow('identity-row', 'perm-identity', state.profileName);
    renderBlossomRows(blossom);

    const eventKindRow = document.getElementById('event-kind-row');
    if (eventKindRow) eventKindRow.hidden = !isSigningEvent;

    if (isSigningEvent && kindInfo) {
        const kindChannel = document.getElementById('kind-channel');
        const kindNum = document.getElementById('kind-num');
        const kindLabel = document.getElementById('kind-label');
        const kindLink = document.getElementById('event-kind-link');
        if (kindNum) kindNum.textContent = Number.isNaN(kindInfo.kind) ? '?' : String(kindInfo.kind);
        if (kindLabel) kindLabel.textContent = kindInfo.label;
        if (kindChannel) {
            kindChannel.classList.toggle('kind-channel--warn', kindInfo.risk === 'warn' || state.requestRisk === 'warn');
            kindChannel.classList.toggle('kind-channel--danger', kindInfo.risk === 'danger' || action?.risk === 'danger');
        }
        if (kindLink) kindLink.href = kindInfo.nip;
    }

    // --- Timestamp row -----------------------------------------------------
    const createdRow = document.getElementById('event-created-row');
    const createdEl = document.getElementById('event-created');
    const tsInfo = isSigningEvent ? timestampInfo() : null;
    if (createdRow) createdRow.hidden = !tsInfo;
    if (createdEl && tsInfo) {
        createdEl.textContent = tsInfo.iso;
        createdEl.classList.toggle('param-stamp--warn', tsInfo.suspicious);
    }

    // --- Bunker outbound notice (this profile signs remotely) --------------
    if (bunkerNotice) bunkerNotice.hidden = state.profileType !== 'bunker';

    // --- Warning strips (tiered, worst first). A danger strip stays by the
    // decision; the rest scroll with the details.
    if (dangerEl) {
        dangerEl.textContent = '';
        if (state.decodeError) {
            addWarnStrip(dangerEl, 'Could not decode this request payload. Approve only if you trust this source completely.', 'danger');
        }
        if (action?.warning) {
            addWarnStrip(dangerEl, action.warning, 'danger');
        }
        if (kindInfo?.warning && kindInfo.risk === 'danger') {
            addWarnStrip(dangerEl, kindInfo.warning, 'danger');
        }
    }
    if (warningsEl) {
        warningsEl.textContent = '';
        if (blossom?.problem) {
            const expiresIn = blossom.expiresAt ? blossom.expiresAt - state.parsedAt : null;
            addWarnStrip(warningsEl, blossomProblemText(blossom.problem, expiresIn), 'warn');
        }
        if (kindInfo?.warning && kindInfo.risk !== 'danger') {
            addWarnStrip(warningsEl, kindInfo.warning, 'warn');
        }
        if (!isSigningEvent && methodInfo.warning) {
            addWarnStrip(warningsEl, methodInfo.warning, 'warn');
        }
        if (claimed) {
            addWarnStrip(warningsEl, 'Remote client — the name it reports is claimed, not verified. Approve only if you just initiated this connection.', 'warn');
        }
        if (tsInfo?.suspicious) {
            const mins = Math.round(Math.abs(tsInfo.skewSec) / 60);
            addWarnStrip(warningsEl, `Event timestamp is ${mins} min ${tsInfo.skewSec > 0 ? 'ahead of' : 'behind'} the current time.`, 'warn');
        }
    }

    // --- Content preview + raw JSON ----------------------------------------
    renderPreview(isSigningEvent);
    const previewTitle = document.getElementById('event-preview-title');
    if (previewTitle) previewTitle.textContent = blossom ? "App's note" : 'Event content';

    // --- Remember patch-point (per-site × per-kind, default-deny) ----------
    renderPatchPoint(methodInfo, kindInfo, isSigningEvent, action);
}

function renderPreview(isSigningEvent) {
    const previewModule = document.getElementById('event-preview');
    const contentEl = document.getElementById('content-preview');
    const rawPre = document.getElementById('event-preview-pre');
    if (!previewModule) return;

    previewModule.hidden = !isSigningEvent;
    if (!isSigningEvent) return;

    if (contentEl) {
        contentEl.classList.remove('content-preview--empty');
        if (state.decodeError || !state.event || typeof state.event !== 'object') {
            contentEl.textContent = '(cannot decode — see raw payload below)';
            contentEl.classList.add('content-preview--empty');
        } else if (typeof state.event.content !== 'string') {
            contentEl.textContent = '(content is not text — inspect the raw JSON)';
            contentEl.classList.add('content-preview--empty');
        } else if (state.event.content.length === 0) {
            contentEl.textContent = '(no content)';
            contentEl.classList.add('content-preview--empty');
        } else {
            const c = visibleText(state.event.content);
            contentEl.textContent = c.length > 400 ? `${c.slice(0, 400)}…` : c;
        }
    }

    if (rawPre) {
        rawPre.textContent = state.decodeError
            ? visibleText(state.rawPayload)
            : visibleJson(state.event);
    }
}

const CAP_LABELS = Object.freeze({ '1h': '1 hour', '1d': '1 day', '30d': '30 days' });

function patchLabelText(methodInfo, kindInfo, isSigningEvent, action) {
    const scope = state.inbound ? 'this connection' : 'this site';
    if (action?.remember && !state.inbound) return action.remember;
    // A capped request says how long it is kept, not a standing grant.
    const capped = CAP_LABELS[state.maxDuration];
    if (capped) return `Remember for ${capped} · ${scope}`;
    return isSigningEvent && kindInfo && !Number.isNaN(kindInfo.kind)
        ? `Remember for ${scope} · kind ${kindInfo.kind}`
        : `Remember for ${scope} · ${methodInfo.label}`;
}

function patchNoteText(rememberable, action) {
    if (state.lockedGrant) return 'NostrKey is locked, so this asks';
    if (!rememberable) return 'This always asks here';
    if (state.profileType === 'bunker') return "NostrKey won't ask. Your remote signer may.";
    if (state.inbound) return 'Off by default. Applies to this connection and this kind only.';
    if (action) return 'Off by default. Applies to this site and this action only.';
    return 'Off by default. Applies to this site and this kind only.';
}

function renderPatchPoint(methodInfo, kindInfo, isSigningEvent, action) {
    const patch = document.getElementById('remember-patch');
    const patchLabel = document.getElementById('remember-patch-label');
    const note = document.getElementById('remember-note');
    if (!patch) return;

    const rememberable = state.rememberable && !state.decodeError;

    if (patchLabel) patchLabel.textContent = patchLabelText(methodInfo, kindInfo, isSigningEvent, action);

    const danger = kindInfo?.risk === 'danger' || action?.risk === 'danger';
    patch.disabled = !rememberable || state.lockedGrant || state.revoked;
    // A red request that always asks has nothing to offer here, not even a label.
    patch.hidden = state.lockedGrant || state.revoked || (danger && !rememberable);
    if (danger) patch.classList.add('patch-point--danger');

    if (note) {
        note.textContent = patchNoteText(rememberable, action);
        note.classList.toggle('perm-patch-note--locked', !rememberable || state.lockedGrant);
    }
}

function toggleRemember() {
    const patch = document.getElementById('remember-patch');
    if (!patch || patch.disabled || state.revoked) return;
    state.remember = !state.remember;
    patch.setAttribute('aria-pressed', state.remember ? 'true' : 'false');
}

function toggleRawJson() {
    const pre = document.getElementById('event-preview-pre');
    const btn = document.getElementById('raw-json-toggle');
    if (!pre || !btn) return;
    const show = pre.hidden;
    pre.hidden = !show;
    btn.setAttribute('aria-expanded', show ? 'true' : 'false');
}

async function allow() {
    if (approveHold.held || approveHold.unseen || approveHold.pressRefused) return;
    console.log('allowing');
    await api.runtime.sendMessage({
        kind: 'allowed',
        payload: state.key,
        remember: state.remember,
    });
    console.log('closing');
    await closeTab();
}

async function deny() {
    await api.runtime.sendMessage({
        kind: 'denied',
        payload: state.key,
        remember: state.remember,
    });
    await closeTab();
}

async function closeTab() {
    // In-page bottom sheet: we're inside an extension iframe. The background
    // dismisses the sheet (closePermissionSheet → content.js); this covers a worker
    // that has restarted and no longer knows about it.
    if (window.top !== window.self) {
        window.parent.postMessage({ __nostrkey_perm: 'close' }, '*');
        return;
    }
    // Standalone tab fallback: return the user to the opener and close.
    const tab = await api.tabs.getCurrent();
    if (!tab) return;
    if (tab.openerTabId != null) {
        try { await api.tabs.update(tab.openerTabId, { active: true }); } catch (_) {}
    }
    window.close();
}

// Minimise (in-page sheet only): tell the content script to collapse the sheet
// to a floating "Review signing request" button. The request stays pending.
function minimize() {
    if (window.top !== window.self) window.parent.postMessage({ __nostrkey_perm: 'minimize' }, '*');
}

async function openNip() {
    const info = eventKindInfo();
    if (info?.nip) {
        await api.tabs.create({ url: info.nip, active: true });
    }
}

/** Read what this request asks from the worker, and say it is loaded. */
async function loadRequest() {
    let reply = null;
    try {
        reply = await api.runtime.sendMessage({ kind: 'promptReady', payload: state.key });
    } catch (_) { /* no worker to answer: treated as ended */ }
    if (typeof reply?.payload !== 'string') return false;
    state.rawPayload = reply.payload;
    try {
        state.event = JSON.parse(state.rawPayload);
    } catch (_) {
        // Never let a malformed payload take down the approval surface —
        // render a loud decode warning instead (and keep Deny reachable).
        state.event = null;
        state.decodeError = state.permission === 'signEvent';
    }
    return true;
}

/** The worker no longer has this request. There is nothing left to decide. */
function showEnded() {
    document.getElementById('allow-btn')?.remove();
    const set = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    set('perm-host', state.host || 'unknown origin');
    set('perm-type', 'This request has ended');
    set('deny-btn', 'Close');
    const danger = document.getElementById('perm-danger');
    if (danger) addWarnStrip(danger, 'This request is no longer open.', 'danger');
    const patch = document.getElementById('remember-patch');
    if (patch) { patch.disabled = true; patch.hidden = true; }
    document.getElementById('remember-note')?.remove();
}

/**
 * If this site is revoked while the prompt is open, say so and stop offering
 * remember: approving then answers this one request and does not bring the
 * grant back (the worker enforces that too).
 */
function watchRevocation() {
    try {
        api.storage?.onChanged?.addListener((changes, area) => {
            if (area && area !== 'local') return;
            const next = changes?.siteRevocations?.newValue;
            if (!next || state.revoked) return;
            const prev = changes.siteRevocations.oldValue || {};
            let bare = null;
            try { bare = new URL(state.host).host; } catch { /* not a full origin */ }
            // Only a revocation of this site made now counts, not an older one
            // still in the map when another site is revoked.
            const fresh = k => k && next[k] != null && next[k] !== prev[k];
            if (!fresh(state.host) && !fresh(bare)) return;
            showRevoked();
        });
    } catch { /* no storage events here; the worker still refuses to store it */ }
}

function showRevoked() {
    state.revoked = true;
    state.remember = false;
    const patch = document.getElementById('remember-patch');
    if (patch) { patch.disabled = true; patch.hidden = true; patch.setAttribute('aria-pressed', 'false'); }
    document.getElementById('remember-note')?.remove();
    const warnings = document.getElementById('perm-warnings');
    if (warnings) addWarnStrip(warnings, 'This site was revoked while this request was open. Approving answers this request only.', 'warn');
}

async function init() {
    const qs = new URLSearchParams(location.search);
    state.host = qs.get('host');
    state.permission = qs.get('kind');
    state.key = qs.get('uuid');
    state.queuePosition = parseInt(qs.get('queuePosition')) || 0;
    state.queueTotal = parseInt(qs.get('queueTotal')) || 0;
    state.profileType = qs.get('profileType') || 'local';
    state.profileName = qs.get('profileName') || '';
    state.grantKey = qs.get('grantKey') || '';
    state.rememberable = qs.get('rememberable') === '1';
    state.maxDuration = qs.get('maxDuration') || '';
    state.inbound = qs.get('inbound') === '1';
    state.lockedGrant = qs.get('lockedGrant') === '1';
    state.requestRisk = qs.get('requestRisk') || '';
    state.parsedAt = Number(qs.get('parsedAt')) || Math.floor(Date.now() / 1000);

    // Inside the in-page sheet the frame is the surface: no page margin around it.
    if (window.top !== window.self) document.documentElement.classList.add('perm-in-sheet');

    // Bind events (MV3 CSP: no inline handlers). Deny comes first and everything
    // comes before the draw, so a request the page cannot draw can still be answered.
    document.getElementById('deny-btn')?.addEventListener('click', deny);
    document.getElementById('allow-btn')?.addEventListener('click', allow);
    document.getElementById('minimize-btn')?.addEventListener('click', minimize);
    // Minimize only applies to the in-page sheet; hide it in the tab fallback.
    if (window.top === window.self) {
        const mb = document.getElementById('minimize-btn');
        if (mb) mb.style.display = 'none';
    }
    const allowBtn = document.getElementById('allow-btn');
    if (allowBtn) allowBtn.disabled = true;
    document.addEventListener('pointerdown', restartApproveHold, true);
    document.addEventListener('keydown', restartApproveHold, true);
    document.getElementById('remember-patch')?.addEventListener('click', toggleRemember);
    document.getElementById('raw-json-toggle')?.addEventListener('click', toggleRawJson);
    document.getElementById('event-kind-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        openNip();
    });

    if (!(await loadRequest())) {
        showEnded();
        return;
    }
    draw();
    watchRevocation();
    watchSheet();
    // Anti-clickjack settle: arm Approve only after the sheet has been visible briefly.
    if (allowBtn) { allowBtn.disabled = true; setTimeout(() => { allowBtn.disabled = false; }, 450); }
    // Same delay, so this runs straight after the line above: a request that ran
    // out during the settle never offers Approve.
    const deadline = Number(qs.get('deadline')) || 0;
    if (allowBtn && deadline) {
        setTimeout(() => { if (Date.now() >= deadline) allowBtn.disabled = true; }, 450);
    }

    startCountdown(qs);
}

// Live auto-decline countdown. background.js arms a timer that denies the request
// at `deadline`; here we mirror it so the user sees exactly how long they have.
// Using an absolute deadline (not a fresh duration) keeps the count correct when
// the in-page sheet is minimized to the FAB and later re-opened.
// Safari suspends an idle background page after about 30 seconds, and the request
// this surface is deciding lives in that page. A note every 10 seconds keeps it
// awake for as long as a decision can still be made.
const HOLD_NOTE_MS = 10_000;
let lastHoldNote = 0;

// While someone is using it, the note comes sooner, so the worker knows.
const IN_USE_NOTE_MS = 2_000;

/** A prompt in its own tab that has focus is in use. */
const inOwnTab = () => window.top === window.self;
const inUse = () => inOwnTab() && document.hasFocus();

function holdRequest(soon = false) {
    if (Date.now() - lastHoldNote < (soon ? IN_USE_NOTE_MS : HOLD_NOTE_MS)) return;
    lastHoldNote = Date.now();
    api.runtime.sendMessage({ kind: 'holdPrompt', payload: state.key, inUse: inUse() })?.catch?.(() => {});
}

let expired = false;
for (const type of ['focus', 'pointerdown', 'keydown', 'input']) {
    window.addEventListener(type, () => { if (!expired) holdRequest(true); }, true);
}

// A tab whose request ran out closes, but not while someone is using it: then it
// closes once it loses focus.
function closeExpiredTab() {
    if (!inOwnTab()) return;
    if (!document.hasFocus()) { closeTab(); return; }
    window.addEventListener('blur', () => closeTab(), { once: true });
}

function startCountdown(qs) {
    const deadline = Number(qs.get('deadline')) || 0;
    const ttl = Number(qs.get('ttl')) || 0;
    if (!deadline || !ttl) return;
    const cdEl = document.getElementById('perm-countdown');
    const barEl = document.getElementById('perm-timebar-fill');
    const allowBtn = document.getElementById('allow-btn');
    let timer = null;
    const tick = () => {
        const remaining = deadline - Date.now();
        if (remaining <= 0) {
            if (cdEl) { cdEl.textContent = 'Expired'; cdEl.classList.add('is-expired'); cdEl.classList.remove('is-urgent'); }
            if (barEl) barEl.style.width = '0%';
            if (allowBtn) allowBtn.disabled = true; // background has already declined
            if (timer) clearInterval(timer);
            if (!expired) { expired = true; closeExpiredTab(); }
            return;
        }
        holdRequest();
        const secs = Math.ceil(remaining / 1000);
        if (cdEl) {
            cdEl.textContent = `${secs}s`;
            cdEl.title = `Auto-declines in ${secs}s`;
            cdEl.classList.toggle('is-urgent', remaining <= 10000);
        }
        if (barEl) {
            barEl.style.width = `${Math.max(0, Math.min(100, (remaining / ttl) * 100))}%`;
            barEl.classList.toggle('is-urgent', remaining <= 10000);
        }
    };
    tick();
    timer = setInterval(tick, 250);
}

window.addEventListener('beforeunload', () => {
    // Only the standalone tab reports closePrompt on unload. In the in-page sheet,
    // minimize/re-open destroys and recreates this iframe, and the request must
    // stay pending — content.js + background own the sheet lifecycle.
    if (window.top === window.self) api.runtime.sendMessage({ kind: 'closePrompt', payload: state.key });
    return true;
});

document.addEventListener('DOMContentLoaded', init, { once: true });
