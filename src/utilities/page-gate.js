/**
 * The questions a page asks the worker before it can draw anything. The worker
 * can answer them with a refusal object, and an object is truthy, so a page that
 * reads it as a yes shows the wrong screen. Pages ask through askGate instead:
 * a refusal replaces the page with a plain message and stops its start-up.
 */

import { api } from './browser-polyfill';

export const START_ERROR = 'NostrKey could not start this page. Reload or reinstall.';

export class GateRefused extends Error {}

export function isRefused(answer) {
    return !!answer && typeof answer === 'object' && answer.success === false;
}

export function showStartError() {
    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.dataset.startError = '';
    message.textContent = START_ERROR;
    message.style.padding = '16px';
    document.body.replaceChildren(message);
}

/** Ask the worker. On a refusal, show the message and throw GateRefused. */
export async function askGate(kind) {
    const answer = await api.runtime.sendMessage({ kind });
    if (isRefused(answer)) {
        showStartError();
        throw new GateRefused();
    }
    return answer;
}

/** Run a page's start-up. A refusal has already been shown, so it ends here. */
export async function startPage(init) {
    try {
        await init();
    } catch (e) {
        if (!(e instanceof GateRefused)) throw e;
    }
}
