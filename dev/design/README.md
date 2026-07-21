# dev/design — render the extension surfaces (for Figma + app-store shots)

The NostrKey UI surfaces draw their content from the live extension (`chrome.storage`
+ the background worker). Served as plain pages they render **empty**. This folder
makes them render **fully populated** in a normal browser tab — which unlocks two
things that have always been painful:

1. **Design source of truth** — capture every screen into Figma as editable frames.
2. **App-store screenshots** — render at exact device sizes and screencapture, instead
   of wrestling the iOS Simulator.

## The piece that makes it work

`mock-extension.js` — a fake WebExtension environment. It defines `window.browser`
(and `window.chrome`) with an in-memory `storage` + a background-message router,
pre-seeded with a representative identity (two profiles, relays, vault docs, API
keys, backup state). The extension's browser-polyfill prefers `browser`, so every
page transparently talks to the mock. Demo keys are the canonical secp256k1
generator multiples (priv = 1, 2) — public test values, **no real secrets**.

## How to render a populated screen

```bash
npm run build:chrome                         # build the pages
cd distros/chrome && python3 -m http.server 8777 &   # serve them

# inject the mock as the FIRST <head> script of the page(s) you want:
#   <script src="/mock-extension.js"></script>
cp ../../dev/design/mock-extension.js .      # serve it at /mock-extension.js
```

Then open the page **in Chrome** (Safari's WebExtension polyfill hard-throws with no
`chrome`/`browser` global and blanks the panel — always use Chrome):

```bash
open -a "Google Chrome" "http://127.0.0.1:8777/sidepanel.html"
```

The page renders with Alice/Work profiles, npub + QR, relays, backup status, etc.

## → Figma (design source of truth)

Use the Figma MCP `generate_figma_design` (local-capture / script-tag flow): inject
its `capture.js`, open the page in Chrome with the `#figmacapture=…` hash, poll until
done. Each surface lands as an **editable** frame. File:
`Figma → NostrKey - Full Designs` (fileKey `ttkxA9bk2xP6ADGEX8HH77`). Ten surfaces
captured 2026-07-21: Full Settings, Side Panel, Key Protection, Manage Profiles,
Popup, Vault, API Keys, Nostr Keys, Permission Prompt, Event History.

Re-run after any UI tweak → the frames come back updated. (Tweak the code, point at
the result — no need to describe each change.)

## → App-store screenshots (the day-1 problem)

Render each surface in a Chrome window sized to the store's required viewport, then
`screencapture`. The mock guarantees the screen is populated and on-brand every time,
so the shot set is repeatable — no simulator, no per-device UDID hunting. Pairs with
the store-submission apparatus in `nostrkey.bizdocs.src/qa/release-qa-process.md`.

## Notes

- The injected `mock-extension.js` + `capture.js` live only in `distros/chrome/`
  (a build artifact) — a fresh `npm run build:chrome` strips them; re-copy/inject as
  above. The **source of truth** is `dev/design/mock-extension.js` (this folder).
- Extend the mock's seed data / message router in `mock-extension.js` as new surfaces
  or message kinds appear.
