/**
 * One profile tab per identity. Remembered tab ids live in session storage
 * (cleared when the browser restarts, so an id reused by an unrelated tab after
 * a restart is never focused), are dropped when the tab closes (the worker's
 * tabs.onRemoved), and are checked before focusing: when the browser tells us
 * the tab's URL it must still be this identity's profile page.
 */
const KEY = '_profileTabs';
const HEX64 = /^[0-9a-fA-F]{64}$/;

const store = (api) => api.storage.session || api.storage.local;

async function readMap(api) {
    try {
        const got = await store(api).get(KEY);
        const map = got && got[KEY];
        return map && typeof map === 'object' ? map : {};
    } catch (_) { return {}; }
}

const writeMap = (api, map) => store(api).set({ [KEY]: map });

/** Drop a closed tab from the map. */
export async function forgetProfileTab(api, tabId) {
    const map = await readMap(api);
    let changed = false;
    for (const [pk, id] of Object.entries(map)) if (id === tabId) { delete map[pk]; changed = true; }
    if (changed) await writeMap(api, map);
}

/** Open the profile tab for one identity, or focus the one already open. */
export async function openProfileTab(api, pubkey) {
    if (!HEX64.test(pubkey || '')) throw new Error('Invalid pubkey');
    const pk = pubkey.toLowerCase();
    const url = api.runtime.getURL(`profile.html?pubkey=${pk}`);
    const map = await readMap(api);
    const existingId = map[pk];
    if (existingId != null) {
        let tab = null;
        try { tab = await api.tabs.get(existingId); } catch (_) { tab = null; }
        // A URL we can read that is not this page means the id is stale.
        const stale = !tab || (typeof tab.url === 'string' && tab.url !== '' && tab.url !== url);
        if (!stale) {
            try {
                await api.tabs.update(existingId, { active: true });
                if (tab.windowId != null && api.windows && api.windows.update) {
                    await api.windows.update(tab.windowId, { focused: true });
                }
                return existingId;
            } catch (_) { /* fall through and open a fresh tab */ }
        }
        delete map[pk];
    }
    const tab = await api.tabs.create({ url });
    map[pk] = tab.id;
    await writeMap(api, map);
    return tab.id;
}
