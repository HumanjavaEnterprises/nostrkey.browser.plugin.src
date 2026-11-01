/**
 * The real permission page, loaded from its real HTML into jsdom, with the worker
 * stood in for by what the suite sets. A suite needs `// @vitest-environment jsdom`.
 * Works on the real clock or on fake timers.
 */

import { vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Every message the page sent, in order. */
export const sent = [];

// What the worker answers the page's ready report with.
const worker = { held: null };

const html = readFileSync(resolve('src/permission/permission.html'), 'utf8');

function mockApi() {
    vi.doMock('../../src/utilities/browser-polyfill', () => ({
        api: {
            runtime: {
                sendMessage: async (m) => {
                    sent.push(m);
                    if (m.kind === 'promptReady') {
                        if (worker.held instanceof Error) throw worker.held;
                        return worker.held;
                    }
                    return m.kind === 'getProfileType' ? 'local' : true;
                },
            },
            tabs: { getCurrent: async () => undefined },
            storage: { local: { get: async (keys) => keys ?? {}, set: async () => {} } },
        },
    }));
}

/** Open the page as the worker would, with `query` in its URL. */
export async function open({ payload = 'false', ...query }, held = { payload }) {
    vi.resetModules();
    mockApi();
    sent.length = 0;
    worker.held = held;
    document.documentElement.innerHTML = html.replace(/<script[\s\S]*?<\/script>/g, '');
    window.history.pushState({}, '', `/permission.html?${new URLSearchParams(query)}`);
    await import('../../src/permission/permission.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    if (vi.isFakeTimers()) await vi.advanceTimersByTimeAsync(0);
    else await new Promise(r => setTimeout(r, 0));
}
