# Chrome Extension Development

## Prerequisites

- Node.js (v18+)
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

The Chrome build outputs to `chrome-dist/`. This folder contains
everything Chrome needs to load the extension.

## Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the `chrome-dist/` folder inside the project root.
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
| Output location | In-place under `Shared (Extension)/Resources/` | Copied to `chrome-dist/` |

## Troubleshooting

- **"Service worker registration failed"** -- Make sure you ran
  `npm run build:chrome` so that `background-sw.build.js` exists in
  `chrome-dist/`.
- **CSP errors in the console** -- Chrome MV3 requires `script-src 'self'`
  for extension pages. The Chrome manifest already includes this.
- **Icons missing** -- Verify the `images/` folder was copied into
  `chrome-dist/`. The build script handles this automatically.
- **Stale code after editing** -- Remember to rebuild *and* reload the
  extension in `chrome://extensions/`.
