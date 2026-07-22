# CLAUDE.md — nostrkey.browser.plugin.src

## What This Is
NostrKey browser extension — cross-browser Nostr key management, encrypted vault, and identity layer. The core codebase that also powers the iOS and Android apps.

## Ecosystem Position
NostrKey is **the hand that holds the baseball card**. It manages your private keys, signs events, encrypts data, and connects you to your NostrKeep relay and npub.bio identity. Free, open source (MIT), forked from ursuscamp/nostore.

## Current Version
v1.8.0 (2026-07) — the **"Instrument" UX** release: a redesigned signing surface,
an object model (per-profile feature-objects), three looks (Console / Instrument /
Analog) × light/dark/system with user accessibility controls, appearance-aware
in-page signing consent, and folder-based cloud backup/recovery — carried on top of
the staged security hardening (encrypted-at-rest key storage, default-deny
per-connection + per-kind signing permissions, inbound-event verification, a NIP-06
seed-derivation fix) and nostr-crypto-utils 0.9.x. Covered by an automated test
suite in CI. Prior public release: v1.6.2 (2026-04-07); v1.7.0 was staged
internally and never shipped. Security specifics are tracked privately.

## Where things stand
The **v1.8.0 "Instrument" UX** release is prepared on `feat/instrument-ux`: object
model (per-profile feature-objects), redesigned signing surface, themes +
accessibility, appearance-aware signing consent, and cloud backup — plus the staged
security-hardening pass (hardened nsecBunker: per-connection records, single-use
secrets, a default-deny per-kind allowlist, verify-before-act). Pending the
coordinated store cut (Chrome / Firefox / Safari). Roadmap and any product strategy
are tracked privately, not here.

## Relay model (one Worker, two hostnames)
The bunker defaults to `wss://relay.nostrkey.com`. That hostname and `wss://relay.nostrkeep.app` are both routed by Cloudflare to the **same Worker** — one deployed relay, two brand faces (NostrKey front / NostrKeep backend). Backend repo: `nostrkey.srvr.relay.src` (CF Workers + Durable Objects + D1; ambient usage, no event storage). Not a config conflict — intentional dual-hostname routing.

## Tech Stack
- Vanilla JS (Alpine.js was removed)
- esbuild bundler
- Tailwind CSS
- nostr-crypto-utils for protocol operations
- Chrome Manifest V3

## Build Commands
```bash
npm install
npm run build           # Safari: Tailwind + esbuild
npm run build:chrome    # Chrome → distros/chrome/
npm run build:all       # Both targets
npm run build:all:prod  # Both, minified
npm run watch           # Watch mode (JS, Safari)
npm run watch-tailwind  # Watch mode (CSS)
```

**Important:** After changing extension source code, run `npm run build` and commit the updated `distros/safari/` along with your source changes. Xcode Cloud needs `distros/safari/` in the repo.

## Chrome Dev
1. `npm run build:chrome`
2. `chrome://extensions/` → Developer mode → Load unpacked → `distros/chrome/`

## NIPs Implemented
NIP-01, NIP-04 (deprecated), NIP-07, NIP-19, NIP-44, NIP-46, NIP-49, NIP-78

## Key Features
- NIP-07 `window.nostr` signing
- NIP-46 nsecBunker (remote signing)
- NIP-44 encryption (ChaCha20-Poly1305)
- Encrypted .md vault + API key vault (NIP-78)
- Multi-profile with per-site permissions
- Master password with auto-lock
- Cross-device sync via storage.sync
- WCAG AA accessibility

## Repo Structure
```
src/                    # Extension source (JS, CSS, HTML)
dev/apple/              # Xcode project (Safari/iOS wrapper)
distros/safari/         # Safari build output (TRACKED in git for Xcode Cloud)
distros/chrome/         # Chrome build output (gitignored)
distros/firefox/        # Firefox build output (gitignored)
docs/                   # Website (nostrkey.com), privacy, terms
docs/python.html        # Python SDK docs page (nostrkey.com/python)
docs/test.html          # Extension test page (nostrkey.com/test)
docs_project_info/      # Project docs (testing, submission, vision)
ci_scripts/             # Xcode Cloud CI scripts
build.js                # esbuild config
tailwind.config.js      # Tailwind config
```

QA/screenshot automation is maintained internally (not part of this repo).

## Xcode Cloud
- `ci_scripts/ci_post_clone.sh` exists as backup but `distros/safari/` is tracked in git, so Xcode Cloud builds work without running it.
- Builds auto-trigger on push to `main`.
- Archives both iOS and macOS targets.

## Safari / App Store Build
```bash
# Archive for macOS
xcodebuild archive -project dev/apple/NostrKey.xcodeproj \
  -scheme "NostrKey (macOS)" -configuration Release \
  -archivePath dev/apple/archives/NostrKey-macOS.xcarchive

# Archive for iOS
xcodebuild archive -project dev/apple/NostrKey.xcodeproj \
  -scheme "NostrKey (iOS)" -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath dev/apple/archives/NostrKey-iOS.xcarchive

# Upload via Xcode Organizer → Distribute App → App Store Connect
```

**Bundle IDs** (must match across platforms for unified listing):
- App: `com.nostrkey`
- Extension: `com.nostrkey.Extension`
- Team: `H48PW6TC25`

**macOS Entitlements** (Guideline 2.4.5(i)):
- `com.apple.security.app-sandbox` — required
- `com.apple.security.network.client` — outgoing WebSocket connections
- Do NOT add `network.server` — Apple rejects it (NostrKey is client-only)

## Architecture
**Object model** (containment hierarchy — plugin → profiles → feature-objects; the rule for where any control belongs): see `docs/OBJECT-MODEL.md`.

Extension uses background service worker + sidepanel UI. Mobile apps (iOS/Android) wrap this in dual-WebView architecture with native bridges (IOSBridge.swift / AndroidBridge.kt).

## Conventions
- Vanilla JS, no frameworks
- kebab-case file names
- Chrome Web Store zips go in `distros/` folder
- Xcode project lives at `dev/apple/NostrKey.xcodeproj`
- WCAG AA contrast, aria-labels, reduced-motion support

## Analytics
Plausible (privacy-friendly, cookieless) on all public docs pages. Script: `pa-IB1d6aIMpkIZgRxSc6Med.js`.

## Related Repos — the NostrKey ecosystem
**Four builds, one crypto core** (all interop on the same npub/nsec):
- `nostrkey.browser.plugin.src` — **this repo**, the browser extension (humans). Also powers iOS/Android.
- `nostrkey.app.OC-python.src` — Python SDK for OpenClaw agents (`pip install nostrkey`, v0.3.2, 81 tests, red-team audited)
- `nostrkey.app.HA-python.src` — **NostrKey for Hermes Agent** — Hermes plugin (v0.2.0, 7 gated tools, 3-level reveal protocol)
- `NostrKey-app-beta` — Capacitor mobile/web app (React+Vite / Express / Drizzle+Postgres, biometric/WebAuthn) — the native-app conversion of the vault

Apps + infra:
- `nostrkey.app.ios.src` — iOS app (WKWebView wrapper)
- `nostrkey.app.android.src` — Android app (WebView wrapper)
- `nostrkey.srvr.relay.src` — the relay Worker (CF Workers + DO + D1; ambient usage, no storage; NIP-46 forwarding; Apple Wallet `.pkpass` cards). Served at both `relay.nostrkey.com` and `relay.nostrkeep.app` (same Worker).
- `npub-bio.landingpage.src` — npub.bio (uses NostrKey for NIP-07 connect)
