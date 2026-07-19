# CLAUDE.md — nostrkey.browser.plugin.src

## What This Is
NostrKey browser extension — cross-browser Nostr key management, encrypted vault, and identity layer. The core codebase that also powers the iOS and Android apps.

## Ecosystem Position
NostrKey is **the hand that holds the baseball card**. It manages your private keys, signs events, encrypts data, and connects you to your NostrKeep relay and npub.bio identity. Free, open source (MIT), forked from ursuscamp/nostore.

## Current Version
v1.7.0 (staged 2026-07-19, branch `fix/security-audit-2026-07`) — **major security hardening release.** Closes a malicious-page→key-theft chain (consent moved fully to the extension-owned surface; bunker + key-export no longer page-reachable), encrypts all secrets at rest by default (non-extractable device-key vault) and stops syncing any plaintext, replaces the bunker's auto-sign-anything with per-connection + per-kind default-deny signing, verifies inbound relay/request events (kills replay/rollback), and fixes NIP-06 seed derivation (12-word phrases now import correctly) + bumps nostr-crypto-utils to 0.8.0. **236 tests, CI now runs them.** Requires nostr-crypto-utils 0.8.0 on npm before store submission. Prior: v1.6.2 (2026-04-07).

## Where things stand (2026-07-19)
**v1.7.0 security release staged** on `fix/security-audit-2026-07` (5 commits, not yet pushed/published). An 8-agent security audit found ~40 issues incl. critical malicious-page→key-theft; all fixed + tested. Full detail in the gitignored `docs/security-audit-2026-07/` (FIX-PLAN.md, UX-SECURITY-BRIEF.md). **nsecBunker is SHIPPED and now HARDENED**: the interim "secret-auth then auto-sign" is REPLACED by the agreed **hybrid per-kind model** — per-connection records, single-use secrets, default-deny per-kind allowlist (Tier-A auto once granted, Tier-B always prompt), verify-before-act + replay protection (`TODO.md` §1 DONE).
Release blocker: nostr-crypto-utils 0.8.0 must publish to npm first (plugin pins ^0.8.0, currently a local dev symlink). Then rebuild + submit Chrome/Firefox/Safari.
UX rethink is next (research brief + Ableton/Massive "infrastructure instrument" visual direction captured in `docs/security-audit-2026-07/UX-SECURITY-BRIEF.md`). The *new*-feature direction after that is HTTP-402 / NWC + Cashu payments (`TODO.md` §2).

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
dev/qa/                 # QA automation (screenshot capture/resize)
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

## Xcode Cloud
- `ci_scripts/ci_post_clone.sh` exists as backup but `distros/safari/` is tracked in git, so Xcode Cloud builds work without running it.
- Builds auto-trigger on push to `main`.
- Archives both iOS and macOS targets.

## Safari / App Store Build
```bash
# Archive for macOS
xcodebuild archive -project dev/apple/NostrKey.xcodeproj \
  -scheme "NostrKey (macOS)" -configuration Release \
  -archivePath dev/qa/archives/NostrKey-macOS.xcarchive

# Archive for iOS
xcodebuild archive -project dev/apple/NostrKey.xcodeproj \
  -scheme "NostrKey (iOS)" -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath dev/qa/archives/NostrKey-iOS.xcarchive

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
- `nostrkey.bizdocs.src` — business strategy + architecture docs
- `npub-bio.landingpage.src` — npub.bio (uses NostrKey for NIP-07 connect)
