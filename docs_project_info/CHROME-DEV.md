# Chrome Extension Development

## Prerequisites

- Node.js (v20+)
- npm

## Building for Chrome

```bash
# Install dependencies (first time only)
npm install

# Dev build (with source maps)
npm run build:chrome

# Production build (minified, no source maps)
npm run build:chrome:prod

# Build both Safari and Chrome at once
npm run build:all
```

The Chrome build outputs to `distros/chrome/`. This folder contains
everything Chrome needs to load the extension.

## Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the `distros/chrome/` folder inside the project root.
5. The NostrKey extension icon should appear in the toolbar.

## Reloading after changes

After rebuilding (`npm run build:chrome`), go back to
`chrome://extensions/` and click the reload arrow on the NostrKey card,
or press the keyboard shortcut shown on that page.

## Differences from the Safari build

| Aspect | Safari | Chrome |
|---|---|---|
| Background | Background page (`background.html`) | Service worker (`background-sw.build.js`) |
| API namespace | `browser.*` (native) | `chrome.*` (normalised by `browser-polyfill.js`) |
| Manifest extras | `browser_specific_settings.safari` | `host_permissions`, `open_in_tab` on options |
| Output location | `distros/safari/` | `distros/chrome/` |

## Troubleshooting

- **"Service worker registration failed"** -- Make sure you ran
  `npm run build:chrome` so that `background-sw.build.js` exists in
  `distros/chrome/`.
- **CSP errors in the console** -- Chrome MV3 requires `script-src 'self'`
  for extension pages. The Chrome manifest already includes this.
- **Icons missing** -- Verify the `images/` folder was copied into
  `distros/chrome/`. The build script handles this automatically.
- **Stale code after editing** -- Remember to rebuild *and* reload the
  extension in `chrome://extensions/`.

### Message passing returns `undefined` (Chrome MV3)

If the background service worker logs correct processing but the caller
(sidepanel, options page, etc.) receives `undefined`, the cause is almost
certainly a **Promise-return vs sendResponse** mismatch.

**Root cause:** Our `browser-polyfill.js` wraps `chrome.runtime.sendMessage`
with a callback via `promisify()`. Chrome only delivers `sendResponse()`
calls to that callback — values resolved from a returned Promise are silently
lost.

**Broken pattern (do NOT use):**
```js
case 'myAction':
  return (async () => {
    const result = await doSomething();
    return result; // ❌ caller gets undefined
  })();
```

**Correct pattern:**
```js
case 'myAction':
  reply(sendResponse, async () => {
    const result = await doSomething();
    return result; // ✅ reply() calls sendResponse(result)
  });
  return true; // keep the message channel open
```

The `reply(sendResponse, asyncFn)` helper in `background.js` wraps async
work and calls `sendResponse` with the resolved value (or `undefined` on
error). Every handler in the `onMessage` switch must either:

- Use `reply(sendResponse, async () => { ... }); return true;` for async work
- Use `sendResponse(value); return true;` for sync responses
- Use `return false;` in the default case (message not handled)

**Symptom checklist:**
1. Background console shows the handler ran and produced correct output
2. Caller receives `undefined` instead of the expected value
3. No errors in either console — the value is silently dropped

This applies to ALL message handlers, not just lock/encryption ones. See
`src/background.js` for the full implementation.

### Vault not detected after extension reload

After reloading the extension from `chrome://extensions/`, the service
worker restarts and in-memory state (`encryptionEnabled`, `locked`) resets.
The `isEncrypted` flag in storage should restore this, but timing issues can
cause it to fail.

NostrKey uses three-tier vault detection to handle this:

1. **Flag check** — `isEncrypted` in `browser.storage.local` (fast, best case)
2. **Deep scan** — `hasEncryptedData` message scans `passwordHash` and profile
   `privKey` fields for encrypted blobs (automatic fallback in sidepanel init)
3. **Manual button** — "Check for Existing Vault" in the Secure Your Vault card
   (user-triggered fallback if both auto paths fail)

If the deep scan finds encrypted data, it self-heals the `isEncrypted` flag
so subsequent loads work instantly.

### Platform sync (storage.sync)

NostrKey uses `storage.sync` to mirror data across devices:
- Chrome: syncs via the user's Google account
- Safari 16+: syncs via iCloud

The `"storage"` permission covers both `storage.local` and `storage.sync`.

**Architecture:**
- `storage.local` is always the source of truth
- `SyncManager` (`src/utilities/sync-manager.js`) handles push/pull/merge
- Writes to `storage.local` in `background.js` auto-trigger a 2-second debounced push
- On startup, `initSync()` pulls from sync and merges into local
- `storage.onChanged` listener picks up remote changes in real-time

**Limits:** 100 KB total, 8 KB per item, 512 items max. Values exceeding
8 KB are transparently chunked (`_chunk:key:0`, `_chunk:key:1`, etc.).

**Debugging:**
- Open DevTools → Application → Storage → Extension Storage (sync)
- Console logs prefixed with `[SyncManager]` show push/pull/merge activity
- If sync seems stuck, check that `platformSyncEnabled` is `true` in local storage
- Budget exhaustion warnings appear as `console.warn` messages

**DB version:** v6 adds `updatedAt` timestamps to profiles for conflict resolution.
