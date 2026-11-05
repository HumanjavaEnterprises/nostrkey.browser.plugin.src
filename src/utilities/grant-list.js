/**
 * The one grant list. The side panel (Apps tab, profile view) and the profile
 * tab's Connected sites section all draw a site's grants through
 * renderGrantList, from the same store: the identity's `hosts` in storage.
 *
 * Writes from here go through setPermission, by public key, and listGrantValue,
 * which uses the same clamp as the worker, so a page can never store an allow
 * longer than the kind's maximum. Removals go through revokePermission, behind
 * the destructive confirmation. No message is sent to the worker.
 */
import {
    getPermissions,
    getProfile,
    revokePermission,
    findProfileByPubkey,
    profileIdentity,
    setPermission,
} from './utils';
import {
    grantState,
    grantTimeLeft,
    resolveRevokeTarget,
    grantChoices,
    listGrantValue,
    normaliseOrigin,
    LIST_ACTIONS,
} from './consent-policy.js';
import { grantKindNum, grantLabel, isRiskyGrant } from '../permission/kind-labels.js';
import { insConfirm } from '../ins-confirm.js';

function esc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** How each answer reads in the list's picker. */
export const CHOICE_LABELS = Object.freeze({
    ask: 'Ask',
    '1h': 'Allow for 1 hour',
    '1d': 'Allow for 1 day',
    '30d': 'Allow for 30 days',
    forever: 'Allow forever',
    deny: 'Deny',
});

/** Every site with at least one stored grant for this identity, sorted. */
export async function readGrantApps(index) {
    try {
        const hosts = await getPermissions(index);
        return Object.entries(hosts || {}).filter(([, grants]) => grants && Object.keys(grants).length > 0).map(([origin, grants]) => ({
            origin,
            grants: Object.entries(grants || {})
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([action, value]) => ({ action, value })),
        })).sort((a, b) => a.origin.localeCompare(b.origin));
    } catch {
        return [];
    }
}

/**
 * Who a grant list belongs to: the identity's public key when it can be read,
 * and the row's profile index for when it cannot (locked, no cached key).
 * The caller passes the profile it is showing; nothing here is implicit.
 */
export async function grantOwner(index) {
    let profile = null;
    try { profile = await getProfile(index); } catch { /* revoke still resolves by index */ }
    return { pubkey: profileIdentity(profile), index };
}

/** Ask before removing a grant. Cancel keeps it. */
export function confirmRevoke(origin, all = false) {
    return insConfirm({
        title: all ? 'Remove every grant for this app?' : 'Remove this grant?',
        body: `${origin} will ask again next time.`,
        confirmLabel: all ? 'Remove all' : 'Remove',
        destructive: true,
    });
}

/**
 * Store a list answer for one site and action, as `pubkey`. Returns a message
 * in words when nothing was stored. The origin must already be in the form
 * normaliseOrigin gives (https, or http for localhost); the answer must be one
 * grantChoices offers for the key. 'ask' is a revoke and is refused here.
 */
export async function writeListGrant(pubkey, origin, key, choice) {
    if (!pubkey) return "This identity can't be read right now, so nothing was changed.";
    if (normaliseOrigin(origin) !== origin) return 'Only https sites, or http on localhost, can be set here.';
    const value = listGrantValue(choice, key, Math.floor(Date.now() / 1000));
    if (value == null) return 'That answer is not available for this action.';
    try {
        await setPermission(pubkey, origin, key, value);
    } catch {
        return 'That identity is no longer on this device, so nothing was changed.';
    }
    return null;
}

/**
 * A grant that runs out while the list is open turns to ask without a click:
 * the list redraws once a minute while visible and whenever the page is shown
 * again. Page-side only; the worker keeps no timers for this. One timer per
 * container; the latest paint's repaint is the one it calls.
 */
function keepGrantListFresh(container, repaint) {
    container._grantRepaint = repaint;
    if (container._grantFresh) return;
    container._grantFresh = true;
    const tick = () => {
        if (document.visibilityState !== 'visible' || !container.isConnected) return;
        if (container.querySelector('.grant-left')) container._grantRepaint?.();
    };
    setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', tick);
}

function choiceOptions(key, selected, legacy = false) {
    // A site saved in an older form (http off loopback, or a bare host) can't
    // take a new answer from here, so offer only what it has and Revoke.
    if (legacy) {
        return `<option value="${esc(selected)}" selected>${esc(CHOICE_LABELS[selected] || 'Ask')}</option>`
            + (selected === 'ask' ? '' : '<option value="ask">Revoke</option>');
    }
    return grantChoices(key).map(c =>
        `<option value="${esc(c)}"${c === selected ? ' selected' : ''}>${esc(CHOICE_LABELS[c])}</option>`).join('');
}

/** The picker value that matches what is stored now. */
function currentChoice(value, state) {
    if (state === 'deny') return 'deny';
    if (state !== 'allow') return 'ask';
    return value && typeof value === 'object' ? value.d : 'forever';
}

/**
 * Draw the grant list for the identity at `index` into `container`.
 * Default-deny: a lit point is an active grant; clicking it asks, then removes
 * it. Options (or a bare function, for `stillCurrent`):
 *   stillCurrent  drop a paint that arrives after the caller moved on
 *   edit          per action Ask / Allow (duration) / Deny pickers
 *   activity      async (origin) => [{ text, when }] recent activity, edit mode
 *   expectPubkey  draw only if the identity at `index` is this key
 */
export async function renderGrantList(index, container, opts = {}) {
    const options = typeof opts === 'function' ? { stillCurrent: opts } : opts;
    const stillCurrent = options.stillCurrent || (() => true);
    const apps = await readGrantApps(index);
    // Actions added from "Set another action" show at Ask until an answer is
    // picked; Ask stores nothing, so they live on the page only.
    const pending = container._pendingAdds || (container._pendingAdds = new Map());
    if (options.edit) {
        for (const app of apps) {
            const keys = pending.get(app.origin);
            if (!keys) continue;
            for (const k of keys) {
                if (app.grants.some(g => g.action === k)) keys.delete(k);
                else app.grants.push({ action: k, value: 'ask', pending: true });
            }
        }
    }
    // The identity this list is drawn for, checked again at every revoke.
    const painted = await grantOwner(index);
    if (!stillCurrent()) return;
    if (options.expectPubkey && painted.pubkey !== String(options.expectPubkey).toLowerCase()) {
        container.innerHTML = '<p class="empty-note">This identity is not on this device.</p>';
        return;
    }
    const repaint = () => renderGrantList(index, container, options);
    keepGrantListFresh(container, repaint);
    // Revoke only from the identity the list showed. If it moved, follow its
    // public key; if it is gone, remove nothing and redraw.
    const revokeFor = async (origin, actions) => {
        const now = await grantOwner(index);
        const found = painted.pubkey && now.pubkey !== painted.pubkey
            ? await findProfileByPubkey(painted.pubkey) : -1;
        const target = resolveRevokeTarget(painted, now.pubkey, found);
        if (!target) {
            await repaint();
            container.insertAdjacentHTML('afterbegin',
                '<p class="empty-note" role="status">That identity changed in another window, so nothing was removed. The list is up to date now.</p>');
            return false;
        }
        await revokePermission(target, origin, actions);
        return true;
    };

    if (apps.length === 0) {
        container.innerHTML = options.edit
            ? '<p class="empty-note">No sites connected yet. Every request asks first. Add a site above, or approve one when it asks.</p>'
            : '<p class="empty-note">No apps connected yet. Every request is denied by ' +
            'default. When you approve one, a patch point appears here for that app ' +
            'and kind only, so you can remove it any time.</p>';
        return;
    }

    const now = Math.floor(Date.now() / 1000);
    const activity = options.edit && options.activity
        ? await Promise.all(apps.map(app => options.activity(app.origin).catch(() => [])))
        : [];
    if (!stillCurrent()) return;
    container.innerHTML = apps.map((app, ai) => {
        const rows = app.grants.map((g, gi) => {
            const risky = isRiskyGrant(g.action);
            const kindNum = grantKindNum(g.action);
            const grant = grantState(g.action, g.value, now);
            const allowed = grant === 'allow';
            const denied = grant === 'deny';
            const stateWord = allowed ? 'ALLOW' : denied ? 'DENY' : 'ASK';
            const left = allowed ? grantTimeLeft(g.value, now) : null;
            if (options.edit) {
                const label = grantLabel(g.action);
                return `
            <div class="grant-row${risky ? ' grant-row--danger' : ''}" data-app="${ai}" data-grant="${gi}">
                <span class="grant-row-label">${kindNum !== null ? `<span class="kind-num mono">${kindNum}</span>` : ''}${esc(label)}</span>
                <span class="patch-state mono">${stateWord}</span>
                ${left ? `<span class="grant-left mono">${esc(left)}</span>` : '<span class="grant-left-none"></span>'}
                <select class="grant-choice" aria-label="${esc(`${label} on ${app.origin}`)}">${choiceOptions(g.action, currentChoice(g.value, grant), normaliseOrigin(app.origin) !== app.origin)}</select>
            </div>`;
            }
            const title = allowed
                ? `Granted${left ? `, ${left}` : ''}. Click to remove (asks again)`
                : denied
                    ? 'Denied. Click to clear (back to ask)'
                    : 'Will ask each time';
            return `
            <button type="button"
                class="patch-point grant-patch${risky ? ' patch-point--danger' : ''}${denied ? ' patch-point--denied' : ''}"
                aria-pressed="${allowed ? 'true' : 'false'}"
                data-app="${ai}" data-grant="${gi}"
                title="${esc(title)}">
                <span class="patch-jack" aria-hidden="true"></span>
                ${kindNum !== null ? `<span class="kind-num mono">${kindNum}</span>` : ''}
                <span>${esc(grantLabel(g.action))}</span>
                <span class="patch-state mono">${stateWord}</span>
                ${left ? `<span class="grant-left mono">${esc(left)}</span>` : ''}
            </button>`;
        }).join('');
        if (options.edit) {
            const legacy = normaliseOrigin(app.origin) !== app.origin;
            const have = new Set(app.grants.map(g => g.action));
            const more = LIST_ACTIONS.filter(k => !have.has(k));
            const recent = activity[ai] || [];
            return `
        <div class="app-module site-module" data-origin="${esc(app.origin)}">
            <div class="module-header">
                <span class="app-origin" title="${esc(app.origin)}">${esc(app.origin)}</span>
                <span class="header-end">
                    <button type="button" class="btn btn--sm grant-revoke-all" data-app="${ai}" title="Remove every grant for this site">Revoke</button>
                </span>
            </div>
            <div class="grant-rows">${rows}</div>
            ${legacy ? '<p class="empty-note grant-legacy-note">This site was saved in an older form, so it can only be revoked here. To allow it again, revoke it and add it by its https address.</p>' : ''}
            ${more.length && !legacy ? `
            <div class="grant-add-action" data-app="${ai}">
                <select class="grant-add-key" aria-label="${esc(`Another action for ${app.origin}`)}">
                    <option value="">Set another action...</option>
                    ${more.map(k => `<option value="${esc(k)}">${esc(grantLabel(k))}</option>`).join('')}
                </select>
            </div>` : ''}
            <div class="site-activity">
                <span class="micro-label">Recent activity</span>
                ${recent.length
                    ? `<ul>${recent.map(r => `<li><span>${esc(r.text)}</span> <span class="mono">${esc(r.when)}</span></li>`).join('')}</ul>`
                    : '<p class="empty-note">Nothing signed for this site yet.</p>'}
            </div>
        </div>`;
        }
        return `
        <div class="app-module">
            <div class="module-header">
                <span class="app-origin" title="${esc(app.origin)}">${esc(app.origin)}</span>
                <span class="header-end">
                    <span class="led led--green" aria-label="Connected"></span>
                    <button type="button" class="button button--sm button--muted grant-revoke-all" data-app="${ai}" title="Remove every grant for this app">Revoke all</button>
                </span>
            </div>
            <div class="patch-bay">${rows || '<p class="empty-note">No grants stored.</p>'}</div>
        </div>`;
    }).join('');

    const notice = (text) => container.insertAdjacentHTML('afterbegin',
        `<p class="empty-note grant-note" role="status">${esc(text)}</p>`);

    container.querySelectorAll('.grant-patch').forEach(btn => {
        btn.addEventListener('click', async () => {
            const app = apps[parseInt(btn.dataset.app, 10)];
            const grant = app?.grants[parseInt(btn.dataset.grant, 10)];
            if (!app || !grant) return;
            if (grant.value === 'ask') return; // nothing stored to clear
            if (!(await confirmRevoke(app.origin))) return;
            try {
                if (!(await revokeFor(app.origin, grant.action))) return;
            } catch (e) {
                console.error('Failed to update permission:', e);
            }
            await repaint();
        });
    });

    container.querySelectorAll('.grant-revoke-all').forEach(btn => {
        btn.addEventListener('click', async () => {
            const app = apps[parseInt(btn.dataset.app, 10)];
            if (!app) return;
            if (!(await confirmRevoke(app.origin, true))) return;
            try {
                if (!(await revokeFor(app.origin, app.grants.map(g => g.action)))) return;
            } catch (e) {
                console.error('Failed to revoke permissions:', e);
            }
            await repaint();
        });
    });

    // Edit mode: set one action. Ask removes it (behind the confirmation);
    // anything else is stored for the identity the list was drawn for.
    const setChoice = async (app, key, choice) => {
        const added = pending.get(app.origin);
        if (added?.has(key)) {
            if (choice === 'ask') return repaint(); // still nothing stored
            added.delete(key);
        }
        if (choice === 'ask') {
            if (!(await confirmRevoke(app.origin))) return repaint();
            try {
                if (!(await revokeFor(app.origin, key))) return;
            } catch (e) {
                console.error('Failed to update permission:', e);
            }
            return repaint();
        }
        const now = await grantOwner(index);
        const moved = painted.pubkey && now.pubkey !== painted.pubkey
            && (await findProfileByPubkey(painted.pubkey)) < 0;
        const problem = moved
            ? 'That identity changed in another window, so nothing was changed.'
            : await writeListGrant(painted.pubkey, app.origin, key, choice);
        await repaint();
        if (problem) notice(problem);
    };

    container.querySelectorAll('.grant-choice').forEach(sel => {
        sel.addEventListener('change', () => {
            const row = sel.closest('.grant-row');
            const app = apps[parseInt(row.dataset.app, 10)];
            const grant = app?.grants[parseInt(row.dataset.grant, 10)];
            if (app && grant) setChoice(app, grant.action, sel.value);
        });
    });

    container.querySelectorAll('.grant-add-key').forEach(sel => {
        sel.addEventListener('change', () => {
            const app = apps[parseInt(sel.closest('.grant-add-action').dataset.app, 10)];
            // A new action starts at Ask, the default everywhere else; nothing
            // is stored until an answer is picked on its row.
            if (!app || !sel.value) return;
            if (!pending.has(app.origin)) pending.set(app.origin, new Set());
            pending.get(app.origin).add(sel.value);
            repaint();
        });
    });
}
