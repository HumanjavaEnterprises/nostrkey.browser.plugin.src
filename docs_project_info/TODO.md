# NostrKey — Store Submission Status

> The active roadmap lives in the repo-root [`TODO.md`](../TODO.md). This file tracks **store submission status only.**

## Current: v1.6.2 (released 2026-04-07)

| Store | State |
|---|---|
| **Chrome Web Store** | v1.6.2 uploaded — pending privacy review |
| **Firefox Add-ons** | v1.6.2 signed — live |
| **Safari / Mac App Store** | Archiving via Xcode (App Store Connect) |

Store credentials live in the desktop machine's `.env` — submit from there.

### Build → submit
```bash
npm run build:all:prod          # both targets, minified
# Chrome: upload distros/nostrkey-chrome-v<ver>.zip via dashboard/API
# Firefox: upload distros/nostrkey-firefox-v<ver>.zip via developer hub/API
# Safari/macOS: Xcode archive → Organizer → Distribute App → App Store Connect
#   (Xcode Cloud auto-triggers on push to main; distros/safari/ is tracked in git)
```

### v1.6.1 → v1.6.2 changelog (for reference)
**1.6.1:** duplicate-profile fix on rapid save; same-key profiles auto-cleaned; delete profiles from the profile view; **Manage Profiles** page (Settings > Profiles) with multi-select bulk delete; clearer first-unlock message; **brute-force protection** (cooldown after 3 failed unlocks); **per-site permission rate limiting**.
**1.6.2:** bug fixes; 166-test suite (154 unit + 12 Playwright E2E); full QA coverage; Firefox manifest bumped to 1.6.2.
