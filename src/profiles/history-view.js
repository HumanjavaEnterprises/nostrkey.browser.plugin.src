/**
 * Profile tab, History section: the device's saved versions of each list,
 * turned into rows. Pure, so it can be tested without a browser. Rendering
 * uses textContent only.
 */

export const KIND_TITLES = Object.freeze({
    0: 'Profile', 3: 'Follow list', 10000: 'Mute list', 10002: 'Relay list',
});

export const HISTORY_NOTE = 'Earlier versions seen on this device. Kept here only, not synced or backed up.';

/** "Nov 9, 2026, 14:05" in the user's locale. */
export function whenText(createdAt) {
    if (typeof createdAt !== 'number' || !createdAt) return 'Unknown date';
    try {
        return new Date(createdAt * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch (_) { return new Date(createdAt * 1000).toISOString(); }
}

/**
 * @param {{kinds: {kind: number, versions: {id, created_at, summary, current}[]}[]}|null} res
 * @param {{locked?: boolean}} o
 * @returns {{groups: {kind, title, rows: {id, when, summary, current, canRestore}[]}[], empty: boolean, reason: string}}
 */
export function buildHistory(res, { locked = false } = {}) {
    const groups = [];
    for (const k of Array.isArray(res?.kinds) ? res.kinds : []) {
        if (!KIND_TITLES[k.kind] || !Array.isArray(k.versions) || !k.versions.length) continue;
        groups.push({
            kind: k.kind,
            title: KIND_TITLES[k.kind],
            rows: k.versions.map(v => ({
                id: String(v.id || ''),
                when: whenText(v.created_at),
                summary: typeof v.summary === 'string' ? v.summary : '',
                current: !!v.current,
                canRestore: !v.current && !locked,
            })),
        });
    }
    return {
        groups,
        empty: groups.length === 0,
        reason: locked ? 'Unlock NostrKey to restore.' : '',
    };
}

/** Fill #pd-history inside `doc`; `onRestore(kind, id, label)` is called per click. */
export function renderHistory(doc, view, onRestore) {
    const box = doc.getElementById('pd-history');
    box.replaceChildren();
    if (view.empty) {
        const p = doc.createElement('p');
        p.className = 'help-text';
        p.textContent = 'No saved versions yet.';
        box.append(p);
        return;
    }
    for (const g of view.groups) {
        const group = doc.createElement('div');
        group.className = 'pd-history-group';
        group.dataset.kind = String(g.kind);
        const h = doc.createElement('h3');
        h.className = 'micro-label';
        h.textContent = g.title;
        const list = doc.createElement('ul');
        list.className = 'pd-history-list';
        for (const r of g.rows) {
            const li = doc.createElement('li');
            li.className = 'pd-history-row';
            li.dataset.id = r.id;
            const when = doc.createElement('span');
            when.className = 'pd-history-when';
            when.textContent = r.when;
            const summary = doc.createElement('span');
            summary.className = 'pd-history-summary';
            summary.textContent = r.summary;
            li.append(when, summary);
            if (r.current) {
                const cur = doc.createElement('span');
                cur.className = 'pd-history-current help-text';
                cur.textContent = 'Current';
                li.append(cur);
            } else {
                const btn = doc.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn--sm pd-history-restore';
                btn.textContent = 'Restore';
                btn.disabled = !r.canRestore;
                btn.setAttribute('aria-label', `Restore ${g.title.toLowerCase()} from ${r.when}`);
                if (view.reason) btn.title = view.reason;
                btn.addEventListener('click', () => onRestore(g.kind, r.id, `${g.title} from ${r.when}`));
                li.append(btn);
            }
            list.append(li);
        }
        group.append(h, list);
        box.append(group);
    }
}
