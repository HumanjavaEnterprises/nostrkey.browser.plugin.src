# Settings persistence — cross-browser test coverage

Save & recover of appearance + accessibility settings, per target. The settings LOGIC
is one shared code path (`src/a11y.js` + the browser polyfill abstract `chrome.*`/`browser.*`);
the only per-browser difference is which backend `storage.sync` writes to. So the unit
suite covers the logic for **all** targets, and each browser harness proves it in that
browser's real engine.

| Target | Automated test | Status |
|---|---|---|
| **Logic (all browsers)** | `test/settings-persistence.test.js` (vitest+jsdom, real a11y.js) | ✅ CI, 11 tests |
| **Chrome** | `test/e2e/settings-persistence.spec.js` (Playwright, real extension + real chrome.storage) | ✅ automated *(headed — needs a display)* |
| **Firefox** | `test/e2e/firefox-settings.mjs` (Selenium + geckodriver, real extension, headless) | ✅ automated, **runs headless** |
| **Safari (macOS / WebKit)** | `test/e2e/safari-settings.mjs` + `safari-harness.html` (safaridriver, real WebKit engine) | ✅ automated |
| **iOS Simulator (WebKit)** | `dev/apple/tests/SettingsPersistenceWebKitTests.swift` (XCTest + WKWebView) | ⚙️ ready — add a test target (steps in the file) |

## Run them
```
npm test                      # unit suite (all-browser logic), runs everywhere
npm run test:e2e:settings     # Chrome (Playwright, headed)
npm run test:e2e:firefox      # Firefox (Selenium + geckodriver, headless)
npm run test:e2e:safari       # Safari macOS/WebKit (safaridriver; one-time: sudo safaridriver --enable)
npm run test:cross-browser    # build:all + Firefox + Safari back-to-back
```
For iOS: add a Unit-Testing-Bundle target to `dev/apple/NostrKey.xcodeproj`, add
`SettingsPersistenceWebKitTests.swift` + (as resources) `src/a11y.js` and
`test/e2e/safari-harness.html`, then `xcodebuild test -scheme "NostrKey (iOS)"
-destination 'platform=iOS Simulator,name=iPhone 17 Pro'`. See the file header.

## What each proves
- **Unit** — defaults, save+persist, theme×mode→skin, density, text/contrast/motion,
  RECOVERY on fresh load, save→reload round-trip, corrupt-pref sanitization,
  system-mode OS follow, sync→local fallback. Browser-agnostic.
- **Chrome / Firefox** — the *real extension* saving to the *real* `storage.sync`, then
  reload-and-recover and cross-surface (settings → sidepanel) in the real browser.
- **Safari macOS / iOS** — the real `a11y.js` running in the actual **WebKit** engine
  (an in-memory `chrome.storage` mock re-initialised in-page, since Safari's WebDriver
  session disables localStorage and injects its own empty `browser` global). iOS Safari
  IS this same WebKit, so the macOS test already validates the iOS engine's behaviour;
  the XCTest extends it to the iOS Simulator for full-stack confidence.

## Manual checklist (real extension in Firefox / Safari mac / Safari iOS)
For the parts automation can't reach (the actual Safari **extension** storage backend,
and real cross-device sync), do this in each target after loading the extension:

1. Open **Full Settings → Appearance**.
2. Set **Look = Analog, Mode = Light, Density = Compact, Text size = XL** → the UI restyles instantly.
3. **Close & reopen** the popup/side panel → same look/size. *(save + recover)*
4. Open a **different surface** → it opens already wearing the chosen look. *(cross-surface)*
5. Toggle **High contrast** + **Reduce motion** → reopen → still on.
6. **Mode = System**, flip the OS light/dark → the extension follows live.
7. **Sync (optional):** same account on a 2nd device/profile shows the choice
   (Chrome→Google, Firefox→Sync, Safari→iCloud).
