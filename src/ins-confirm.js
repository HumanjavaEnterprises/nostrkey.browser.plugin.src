/**
 * ins-confirm.js — the shared consent overlay for extension pages.
 *
 * One implementation of the consent-surface standard: a dimmed backdrop plus
 * either a bottom SHEET (default; destructive / irreversible acts) or a
 * centered POPOVER (low-stakes, reversible acts). Replaces native
 * confirm()/alert() on every extension-page surface.
 *
 *   insConfirm({ title, body, confirmLabel, cancelLabel, destructive, variant })
 *       → Promise<boolean>   (true = confirmed; Escape/backdrop/cancel = false)
 *   insNotice({ title, body, dismissLabel })
 *       → Promise<void>
 *
 * Styling comes entirely from instrument.css (section 18 + the .btn family),
 * so skin / mode / contrast / density / text-size arrive via the page's
 * stamped data-ins-* attributes — no storage access, no messaging here.
 *
 * Safety: title/body may contain user data (key labels, vault paths); the DOM
 * is built with createElement + textContent ONLY — never innerHTML.
 */

// Serialize overlapping calls so a second dialog never double-renders on top
// of (or interleaves with) an open one.
let queue = Promise.resolve();

let idCounter = 0;

function motionOff() {
    if (document.documentElement.getAttribute('data-ins-motion') === 'off') return true;
    try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {
        return false;
    }
}

/**
 * Build, show and settle one dialog. Resolves true (confirm) or false
 * (cancel / Escape / backdrop click).
 */
function openDialog({ title, body, confirmLabel, cancelLabel, destructive, variant, notice }) {
    return new Promise((resolve) => {
        const prevFocus = document.activeElement;

        const root = document.createElement('div');
        root.className = 'ins-consent-root';

        const backdrop = document.createElement('div');
        backdrop.className = 'ins-consent-backdrop';

        const isSheet = variant !== 'popover';
        const dialog = document.createElement('div');
        dialog.className = isSheet ? 'ins-consent-sheet' : 'ins-consent-popover';
        dialog.setAttribute('role', (destructive || notice) ? 'alertdialog' : 'dialog');
        dialog.setAttribute('aria-modal', 'true');

        if (isSheet) {
            const handle = document.createElement('div');
            handle.className = 'ins-consent-handle';
            dialog.appendChild(handle);
        }

        const uid = ++idCounter;
        const titleEl = document.createElement('h2');
        titleEl.className = 'ins-consent-title';
        titleEl.id = `ins-consent-title-${uid}`;
        titleEl.textContent = title || '';
        dialog.appendChild(titleEl);
        dialog.setAttribute('aria-labelledby', titleEl.id);

        const bodyEl = document.createElement('p');
        bodyEl.className = 'ins-consent-body';
        bodyEl.id = `ins-consent-body-${uid}`;
        bodyEl.textContent = body || '';
        dialog.appendChild(bodyEl);
        dialog.setAttribute('aria-describedby', bodyEl.id);

        const actions = document.createElement('div');
        actions.className = 'ins-consent-actions';

        const buttons = [];
        let cancelBtn = null;
        const confirmBtn = document.createElement('button');
        confirmBtn.type = 'button';
        confirmBtn.textContent = confirmLabel;
        if (notice) {
            confirmBtn.className = 'btn';
        } else {
            cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn btn--ghost';
            cancelBtn.textContent = cancelLabel;
            actions.appendChild(cancelBtn);
            buttons.push(cancelBtn);
            confirmBtn.className = destructive ? 'btn btn--destructive' : 'btn btn--primary';
        }
        actions.appendChild(confirmBtn);
        buttons.push(confirmBtn);
        dialog.appendChild(actions);

        root.appendChild(backdrop);
        root.appendChild(dialog);

        let settled = false;
        function settle(result) {
            if (settled) return;
            settled = true;
            document.removeEventListener('keydown', onKeydown, true);
            backdrop.classList.remove('is-open');
            dialog.classList.remove('is-open');
            const finish = () => {
                root.remove();
                try {
                    if (prevFocus && typeof prevFocus.focus === 'function' && document.contains(prevFocus)) {
                        prevFocus.focus();
                    }
                } catch (_) { /* focus restore is best-effort */ }
                resolve(result);
            };
            if (motionOff()) finish();
            else setTimeout(finish, 250);
        }

        function onKeydown(ev) {
            if (ev.key === 'Escape') {
                ev.preventDefault();
                settle(false);
                return;
            }
            if (ev.key === 'Tab') {
                // Trap focus across the dialog's buttons only.
                ev.preventDefault();
                const idx = buttons.indexOf(document.activeElement);
                const dir = ev.shiftKey ? -1 : 1;
                buttons[(idx + dir + buttons.length) % buttons.length].focus();
            }
        }

        backdrop.addEventListener('click', () => settle(false));
        if (cancelBtn) cancelBtn.addEventListener('click', () => settle(false));
        confirmBtn.addEventListener('click', () => settle(true));
        document.addEventListener('keydown', onKeydown, true);

        document.body.appendChild(root);
        requestAnimationFrame(() => {
            backdrop.classList.add('is-open');
            dialog.classList.add('is-open');
            // Destructive acts start on Cancel so Enter can't rush the delete;
            // everything else starts on the confirming action.
            const initial = notice ? confirmBtn : (destructive ? cancelBtn : confirmBtn);
            (initial || confirmBtn).focus();
        });
    });
}

export function insConfirm({
    title,
    body,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    destructive = false,
    variant = 'sheet',
} = {}) {
    const result = queue.then(() =>
        openDialog({ title, body, confirmLabel, cancelLabel, destructive, variant, notice: false }));
    queue = result.catch(() => {});
    return result;
}

export function insNotice({ title, body, dismissLabel = 'OK' } = {}) {
    const result = queue.then(() =>
        openDialog({
            title,
            body,
            confirmLabel: dismissLabel,
            cancelLabel: '',
            destructive: false,
            variant: 'sheet',
            notice: true,
        }).then(() => undefined));
    queue = result.catch(() => {});
    return result;
}
