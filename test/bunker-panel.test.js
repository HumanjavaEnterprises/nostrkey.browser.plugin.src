// @vitest-environment jsdom
/**
 * The side panel's status row and no-secret note, rendered into a real DOM from
 * the same fragments the panel uses.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { bunkerPanelState, bunkerStatusHtml, bunkerNoteHtml } from '../src/utilities/bunker-panel.js';

const PK = 'a'.repeat(64);
const ADDRESS = `bunker://${PK}?relay=wss://relay.example.com`;
const NOTE = 'This saved address has no secret. If your signer needs one, paste a new connection string.';

function render(status, bunkerUrl) {
    const root = document.createElement('div');
    const view = bunkerPanelState(status, bunkerUrl);
    root.innerHTML = bunkerStatusHtml(view) + bunkerNoteHtml(view);
    return { root, view };
}

describe('the bunker panel', () => {
    it('shows the note when nothing is stored and the address has no secret', () => {
        const { root } = render({ connected: false, hasSession: false }, ADDRESS);
        expect(root.querySelector('#pd-bunker-no-secret').textContent).toBe(NOTE);
        expect(root.querySelector('.row-value').textContent.trim()).toBe('Disconnected');
        expect(root.querySelector('.led').classList.contains('led--red')).toBe(true);
    });

    it('shows no note for a stored session, and does not call it disconnected', () => {
        const { root, view } = render({ connected: false, hasSession: true }, ADDRESS);
        expect(root.querySelector('#pd-bunker-no-secret')).toBeNull();
        expect(root.textContent).not.toContain('Disconnected');
        expect(root.querySelector('.led').classList.contains('led--amber')).toBe(true);
        expect(view.canPing).toBe(true);
        expect(view.canDisconnect).toBe(true);
        expect(view.canConnect).toBe(true);
    });

    it('shows no note while connected', () => {
        const { root, view } = render({ connected: true, hasSession: true }, ADDRESS);
        expect(root.querySelector('#pd-bunker-no-secret')).toBeNull();
        expect(root.querySelector('.row-value').textContent.trim()).toBe('Connected');
        expect(view.canConnect).toBe(false);
    });

    it('shows no note for an address that carries a secret', () => {
        const { root } = render({ connected: false, hasSession: false }, `${ADDRESS}&secret=abc`);
        expect(root.querySelector('#pd-bunker-no-secret')).toBeNull();
    });

    it('shows no note with no address saved', () => {
        const { root } = render({ connected: false, hasSession: false }, '');
        expect(root.querySelector('#pd-bunker-no-secret')).toBeNull();
    });

    it('the panel renders through these fragments', () => {
        const source = readFileSync(resolve('src/sidepanel.js'), 'utf8');
        expect(source).toContain('${bunkerStatusHtml(view)}');
        expect(source).toContain('${bunkerNoteHtml(view)}');
    });
});
