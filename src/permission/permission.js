import { api } from '../utilities/browser-polyfill';
import { describeKind, describeMethod } from './kind-labels';

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
    rawPayload: '',       // original payload string (shown when decode fails)
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

function render() {
    const hostEl = document.getElementById('perm-host');
    const permEl = document.getElementById('perm-type');
    const glyphEl = document.getElementById('origin-glyph');
    const claimEl = document.getElementById('origin-claim');
    const bunkerNotice = document.getElementById('bunker-notice');
    const warningsEl = document.getElementById('perm-warnings');
    const queueEl = document.getElementById('perm-queue');

    const methodInfo = describeMethod(state.permission);
    const kindInfo = eventKindInfo();
    const claimed = bunkerClaim();
    const isSigningEvent = state.permission === 'signEvent';

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
    if (permEl) permEl.textContent = methodInfo.label;

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
            kindChannel.classList.toggle('kind-channel--warn', kindInfo.risk === 'warn');
            kindChannel.classList.toggle('kind-channel--danger', kindInfo.risk === 'danger');
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

    // --- Warning strips (tiered, worst first) ------------------------------
    if (warningsEl) {
        warningsEl.textContent = '';
        if (state.decodeError) {
            addWarnStrip(warningsEl, 'Could not decode this request payload. Approve only if you trust this source completely.', 'danger');
        }
        if (kindInfo?.warning) {
            addWarnStrip(warningsEl, kindInfo.warning, kindInfo.risk === 'danger' ? 'danger' : 'warn');
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

    // --- Remember patch-point (per-site × per-kind, default-deny) ----------
    renderPatchPoint(methodInfo, kindInfo, isSigningEvent);
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
            const c = state.event.content;
            contentEl.textContent = c.length > 400 ? `${c.slice(0, 400)}…` : c;
        }
    }

    if (rawPre) {
        rawPre.textContent = state.decodeError
            ? state.rawPayload
            : JSON.stringify(state.event, null, 2);
    }
}

function renderPatchPoint(methodInfo, kindInfo, isSigningEvent) {
    const patch = document.getElementById('remember-patch');
    const patchLabel = document.getElementById('remember-patch-label');
    const note = document.getElementById('remember-note');
    if (!patch) return;

    // Rememberable? Tier-B kinds (delete, unknown, undecodable) always ask.
    let rememberable = true;
    if (isSigningEvent) {
        rememberable = !!kindInfo?.rememberable && !state.decodeError;
    } else if (methodInfo.label === String(state.permission) && methodInfo.risk === 'warn') {
        rememberable = false; // unrecognized method
    }

    if (patchLabel) {
        patchLabel.textContent =
            isSigningEvent && kindInfo && !Number.isNaN(kindInfo.kind)
                ? `Remember for this site · kind ${kindInfo.kind}`
                : `Remember for this site · ${methodInfo.label}`;
    }

    patch.disabled = !rememberable;
    if (kindInfo?.risk === 'danger') patch.classList.add('patch-point--danger');

    if (note) {
        if (!rememberable) {
            note.textContent = 'This action always asks — it cannot be remembered.';
            note.classList.add('perm-patch-note--locked');
        } else {
            note.textContent = 'Applies your choice to this site only, this kind only. Nothing is remembered unless you patch it.';
            note.classList.remove('perm-patch-note--locked');
        }
    }
}

function toggleRemember() {
    const patch = document.getElementById('remember-patch');
    if (!patch || patch.disabled) return;
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
    console.log('allowing');
    await api.runtime.sendMessage({
        kind: 'allowed',
        payload: state.key,
        origKind: state.permission,
        event: state.event,
        remember: state.remember,
        host: state.host,
    });
    console.log('closing');
    await closeTab();
}

async function deny() {
    await api.runtime.sendMessage({
        kind: 'denied',
        payload: state.key,
        origKind: state.permission,
        event: state.event,
        remember: state.remember,
        host: state.host,
    });
    await closeTab();
}

async function closeTab() {
    const tab = await api.tabs.getCurrent();
    console.log('closing current tab: ', tab.id);
    await api.tabs.update(tab.openerTabId, { active: true });
    window.close();
}

async function openNip() {
    const info = eventKindInfo();
    if (info?.nip) {
        await api.tabs.create({ url: info.nip, active: true });
    }
}

async function init() {
    const qs = new URLSearchParams(location.search);
    console.log(location.search);
    state.host = qs.get('host');
    state.permission = qs.get('kind');
    state.key = qs.get('uuid');
    state.rawPayload = qs.get('payload') || '';
    try {
        state.event = JSON.parse(state.rawPayload);
    } catch (_) {
        // Never let a malformed payload take down the approval surface —
        // render a loud decode warning instead (and keep Deny reachable).
        state.event = null;
        state.decodeError = state.permission === 'signEvent';
    }
    state.queuePosition = parseInt(qs.get('queuePosition')) || 0;
    state.queueTotal = parseInt(qs.get('queueTotal')) || 0;

    state.profileType = await api.runtime.sendMessage({
        kind: 'getProfileType',
    });

    render();

    // Bind events (MV3 CSP: no inline handlers)
    document.getElementById('allow-btn')?.addEventListener('click', allow);
    document.getElementById('deny-btn')?.addEventListener('click', deny);
    document.getElementById('remember-patch')?.addEventListener('click', toggleRemember);
    document.getElementById('raw-json-toggle')?.addEventListener('click', toggleRawJson);
    document.getElementById('event-kind-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        openNip();
    });
}

window.addEventListener('beforeunload', () => {
    api.runtime.sendMessage({ kind: 'closePrompt' });
    return true;
});

document.addEventListener('DOMContentLoaded', init);
