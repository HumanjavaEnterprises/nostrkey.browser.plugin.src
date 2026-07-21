# Settings persistence — cross-browser test coverage

Save & recover of appearance + accessibility settings, per target. The key fact:
**the settings LOGIC is one shared code path** (`src/a11y.js` + `utilities/browser-polyfill.js`
abstract `chrome.*` vs `browser.*`). The only per-browser difference is which backend
`storage.sync` writes to (Chrome→Google, Firefox→Firefox Sync, Safari→iCloud). So:

| Layer | What it proves | Chrome | Firefox | Safari (mac) | Safari (iOS) |
|---|---|---|---|---|---|
| **Unit** `test/settings-persistence.test.js` | the real save/recover/sanitize/skin-resolution logic (browser-agnostic) | ✅ | ✅ | ✅ | ✅ |
| **E2E** `test/e2e/settings-persistence.spec.js` | real extension + real `storage`, reload-and-recover, cross-surface | ✅ auto | ⚠️ manual/web-ext | ⚠️ XCUITest/manual | ⚠️ manual |
| Manual checklist (below) | end-to-end in the actual browser | — | ✅ | ✅ | ✅ |

The unit suite runs in CI on every commit (`npm test`) and covers the logic for **all**
targets. The Chrome E2E is the one fully-automatable real-browser check.

## Chrome — automated
```
npm run build:chrome
npx playwright test test/e2e/settings-persistence.spec.js   # headed; needs a display
```

## Firefox — semi-automated (web-ext) + shared-logic covered
Playwright can't load a WebExtension into Firefox, so there's no Playwright project for it.
The same `a11y.js` runs via the `browser.*` namespace (covered by the unit suite). To verify
the real Firefox storage backend:
```
npm run build:firefox
npx web-ext run --target=firefox-desktop --source-dir=distros/firefox
# then run the manual checklist below
```
Full Firefox automation would use `web-ext` + geckodriver/Selenium (Marionette) — not set up
here; the unit tests + Chrome E2E + this manual pass are the coverage.

## Safari (macOS + iOS) — manual / XCUITest
Safari App Extensions run inside the app's WKWebView; the same `a11y.js` logic runs (unit-covered).
UI automation is only possible via **XCUITest** driving the Safari app in Xcode (macOS) or the
iOS Simulator. Until that's set up, use the manual checklist. Build first:
`npm run build && open dev/apple/NostrKey.xcodeproj` → run the macOS/iOS scheme.

## Manual checklist (Firefox / Safari mac / Safari iOS)
Do this in each target after loading the extension:

1. Open **Full Settings → Appearance**.
2. Change **Look** to *Analog*, **Mode** to *Light*, **Density** to *Compact*, **Text size** to *XL*.
   → the whole UI restyles immediately (warm cream, mono, tight, larger text).
3. **Close and reopen** the popup/side panel (or reload the page).
   → the same look/size is still applied. *(save + recover)*
4. Open a **different surface** (side panel vs popup vs a signing prompt).
   → it opens already wearing the chosen look. *(cross-surface)*
5. Toggle **High contrast** and **Reduce motion** on → reopen → still on.
6. Set **Mode = System**, then flip the OS light/dark setting.
   → the extension follows the OS live, without reopening.
7. **Sync (optional):** with the same account signed in on a second device/profile, confirm the
   appearance choice appears there (Chrome→Google, Firefox→Sync, Safari→iCloud).

Any step that doesn't hold is a persistence regression — capture the target + the failing step.
