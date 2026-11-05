/**
 * The profile tab's Connected sites section. The list is the side panel's
 * grant list (renderGrantList), drawn in edit mode for this tab's identity
 * only: one store, two doors. Grants are per device and never sync.
 */
import { api } from '../utilities/browser-polyfill';
import { findProfileByPubkey } from '../utilities/utils';
import { grantChoices, normaliseOrigin, LIST_ACTIONS } from '../utilities/consent-policy.js';
import { renderGrantList, writeListGrant, CHOICE_LABELS } from '../utilities/grant-list.js';
import { grantLabel } from '../permission/kind-labels.js';
import { sortByIndex } from '../utilities/db';

const RECENT = 3;

function ago(seconds) {
    const s = Math.max(0, Math.floor(Date.now() / 1000) - seconds);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    return `${Math.floor(s / 86400)} d ago`;
}

/** The last few things signed for `origin` as `pubkey`, from event history. */
export async function recentActivity(pubkey, origin) {
    let bare = null;
    try { bare = new URL(origin).host; } catch { /* not a full origin */ }
    const want = String(pubkey).toLowerCase();
    const found = [];
    for (const host of [origin, bare].filter(Boolean)) {
        const rows = await sortByIndex('host', host, false, 50).catch(() => []);
        for (const r of rows) {
            if (r?.event?.pubkey?.toLowerCase() === want) found.push(r);
        }
    }
    found.sort((a, b) => (b.metadata?.signed_at || 0) - (a.metadata?.signed_at || 0));
    return found.slice(0, RECENT).map(r => ({
        text: grantLabel(`signEvent:${r.event.kind}`),
        when: ago(r.metadata?.signed_at || r.event.created_at || 0),
    }));
}

export function initConnectedSites(pubkey) {
    const $ = (id) => document.getElementById(id);
    const list = $('pd-sites');
    const action = $('pd-site-action');
    const choice = $('pd-site-choice');
    const error = $('pd-site-error');
    if (!list || !pubkey) return;

    action.innerHTML = LIST_ACTIONS.map(k => `<option value="${k}">${grantLabel(k).replace(/[<&>"]/g, '')}</option>`).join('');
    const fillChoices = () => {
        const offered = grantChoices(action.value).filter(c => c !== 'ask');
        choice.innerHTML = offered.map(c => `<option value="${c}">${CHOICE_LABELS[c]}</option>`).join('');
        const isDelete = action.value === 'signEvent:24242:delete';
        // Deleting files always asks unless opted in here; the opt-in starts at 1 hour.
        if (isDelete) choice.value = '1h';
        else if (offered.includes('1d')) choice.value = '1d';
        const note = $('pd-site-delete-note');
        if (note) note.hidden = !isDelete;
    };
    action.addEventListener('change', fillChoices);
    action.value = 'getPubKey';
    fillChoices();

    let paint = 0;
    const draw = async () => {
        const mine = ++paint;
        const index = await findProfileByPubkey(pubkey);
        if (mine !== paint) return;
        if (index < 0) {
            list.innerHTML = '<p class="empty-note">This identity is not on this device.</p>';
            return;
        }
        await renderGrantList(index, list, {
            edit: true,
            expectPubkey: pubkey,
            stillCurrent: () => mine === paint,
            activity: (origin) => recentActivity(pubkey, origin),
        });
    };

    const showError = (text) => {
        error.textContent = text || '';
        error.hidden = !text;
    };

    $('pd-site-add').addEventListener('submit', async (e) => {
        e.preventDefault();
        const origin = normaliseOrigin($('pd-site-origin').value);
        if (!origin) {
            showError("That isn't a site address NostrKey can use. Use https, or http on localhost.");
            return;
        }
        const problem = await writeListGrant(pubkey, origin, action.value, choice.value);
        if (problem) { showError(problem); return; }
        showError('');
        $('pd-site-origin').value = '';
        await draw();
    });

    // The side panel writes the same store; follow it.
    try {
        api.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && changes.profiles) draw();
        });
    } catch { /* no change events here; the list still redraws on use */ }
    draw();
}
