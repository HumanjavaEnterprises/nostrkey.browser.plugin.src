/**
 * What the side panel shows for a bunker profile, from the worker's status and
 * the saved address. A stored session reconnects on its own when next needed, so
 * it is not the same thing as being disconnected.
 */

import { bunkerUrlHasSecret } from './bunker-url.js';

/**
 * @param {?{connected: boolean, hasSession: boolean}} status from bunker.status
 * @param {string} bunkerUrl the saved address
 */
export function bunkerPanelState(status, bunkerUrl) {
    const connected = !!status?.connected;
    const hasSession = !!status?.hasSession;
    const live = connected || hasSession;
    return {
        connected,
        led: connected ? 'led--green' : hasSession ? 'led--amber' : 'led--red',
        label: connected ? 'Connected' : hasSession ? 'Reconnects when needed' : 'Disconnected',
        showNoSecretNote: !live && !!bunkerUrl && !bunkerUrlHasSecret(bunkerUrl),
        canConnect: !connected,
        canDisconnect: live,
        canPing: live,
    };
}

export function bunkerStatusHtml(view) {
    return `<div class="module-row">
                <span class="row-label">Status</span>
                <span class="row-value led-label"><span class="led ${view.led}"></span> ${view.label}</span>
            </div>`;
}

export function bunkerNoteHtml(view) {
    if (!view.showNoSecretNote) return '';
    return '<p id="pd-bunker-no-secret" class="hint-text">This saved address has no secret. If your signer needs one, paste a new connection string.</p>';
}
