# Apple App Store Submission Guide

This document contains all the information needed to submit NostrKey to the Apple App Store (Safari extension for macOS and iOS).

## Prerequisites

- [ ] Apple Developer account ($99/year)
- [ ] Xcode with valid signing certificate
- [ ] App Store Connect access
- [ ] Screenshots for macOS and iOS
- [ ] App icon (1024x1024px)
- [ ] Privacy Policy URL
- [ ] Built Safari extension via Xcode

## App Store Listing

### App Name (30 chars max)
**NostrKey**

### Subtitle (30 chars max)
**Nostr Key Manager & Signer**

### Promotional Text (170 chars, can update without new build)
```
Securely manage your Nostr keys and sign events without exposing private keys to websites. Encrypted vault, nsecBunker support, and auto-lock protection.
```

### Keywords (100 chars, comma-separated)
```
nostr,nip-07,signing,encryption,nsec,npub,keys,vault,nsecbunker,privacy,crypto
```

### Description (4000 chars max)
```
NostrKey is a Safari extension for macOS and iOS that manages your Nostr identities and signs events on your behalf — your private keys never touch the websites you visit.

Features:
• NIP-07 signing — works with any Nostr web app
• NIP-46 nsecBunker — remote signing, your key never leaves the bunker
• NIP-44 encryption — modern ChaCha20-Poly1305 messaging
• Encrypted document vault — zero-knowledge storage on Nostr relays
• API key vault — encrypted secret storage
• Master password — keys encrypted at rest with auto-lock
• Multi-profile support — manage multiple Nostr identities
• Per-site permissions — control which sites can request signatures
• iCloud sync — profiles, settings, and vault data sync across your Apple devices via storage.sync (Safari 16+, user-toggleable)

Your keys. Your control. No data collection. No tracking. Fully open source.
```

### Category
**Utilities**

### Secondary Category
**Social Networking**

## Privacy Details (App Store Connect)

### Data Collection
**We do NOT collect any user data.**

Apple requires you to declare data practices in App Store Connect. Select:

- **Data Not Collected** — NostrKey does not collect any data from users

### Privacy Policy URL
**https://nostrkey.com/privacy.html**

### Privacy Nutrition Label
| Data Type | Collected | Linked to Identity | Tracking |
|-----------|-----------|-------------------|----------|
| All types | No | No | No |

## Required Assets

### App Icon
- 1024x1024px (required for App Store)
- Existing icons in `src/images/` can be scaled up or recreated

### Screenshots

Screenshots are captured showing the Safari extension on nostrkey.com/test.
QA/screenshot automation is maintained internally; screenshots are produced
locally and are not tracked in this repo.

#### macOS (2560x1600) — 8 screenshots
Captured by resizing Safari to 1280x800 via AppleScript, then `screencapture` + `sips` crop.
```bash
osascript -e 'tell application "Safari" to set bounds of front window to {0, 0, 1280, 800}'
screencapture screenshots/macos/locked-vault.png
sips --cropOffset 50 0 --cropToHeightWidth 1600 2560 screenshots/macos/locked-vault.png
```

#### iPhone (1284x2778) — 8 screenshots
Simulator: **iPhone 13 Pro Max** (ID: `SIM-UDID-REDACTED`)
```bash
xcrun simctl io SIMUDID1 screenshot screenshots/iphone/locked-vault.png
```

**WRONG simulators (rejected):** iPhone 17 Pro Max (1320x2868), iPhone 14 Pro Max (1290x2796).

#### iPad (2048x2732) — 8 screenshots
Simulator: **iPad Pro 12.9-inch 6th gen** (ID: `SIM-UDID-REDACTED`)
```bash
xcrun simctl io SIMUDID2 screenshot screenshots/ipad/locked-vault.png
```

#### Screenshot Set (same 8 screens on each platform)
1. `locked-vault.png` — Extension locked, password prompt
2. `unlocked-vault.png` — Profile with QR code
3. `vault.png` — Encrypted Vault, API Keys, Nostr Keys
4. `apps.png` — App permissions
5. `relays.png` — Relay connections
6. `settings.png` — Security, Sync, Advanced
7. `signing-prompt.png` — Permission Request (Allow/Deny)
8. `signed-event.png` — Signed event JSON result

### Preview Video (optional)
- Up to 30 seconds
- Show the signing flow in action

## App Review Information

### Demo Account
Not applicable — NostrKey generates its own keys locally.

### Review Notes
```
NostrKey is a Safari Web Extension that implements the NIP-07 standard for Nostr key management. It allows users to:

1. Generate or import Nostr private keys (nsec/hex format)
2. Sign events requested by Nostr-compatible websites via the window.nostr API
3. Encrypt/decrypt messages using NIP-44
4. Connect to remote signers via NIP-46 (nsecBunker)
5. Store encrypted documents in a zero-knowledge vault
6. Sync profiles, settings, and vault data across Apple devices via iCloud (storage.sync, Safari 16+)

To test:
1. Install the extension and enable it in Safari → Settings → Extensions
2. Visit a Nostr web app (e.g., https://snort.social or https://nostrudel.ninja)
3. The app will detect window.nostr and prompt for key access
4. NostrKey will show a permission dialog for user approval

No account or login is needed — the extension generates keys locally.
```

### Contact Information
- **Website:** https://nostrkey.com
- **Support URL:** https://nostrkey.com/support.html
- **GitHub:** https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src

## Xcode Build & Archive

### Build for Distribution
```bash
# 1. Build the Safari extension source
npm run build:all

# 2. Archive macOS
xcodebuild archive \
  -project dev/apple/NostrKey.xcodeproj \
  -scheme "NostrKey (macOS)" \
  -configuration Release \
  -archivePath dev/apple/archives/NostrKey-macOS.xcarchive

# 3. Archive iOS
xcodebuild archive \
  -project dev/apple/NostrKey.xcodeproj \
  -scheme "NostrKey (iOS)" \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath dev/apple/archives/NostrKey-iOS.xcarchive

# 4. Upload via Xcode Organizer
#    Window → Organizer → select archive → Distribute App → App Store Connect
```

### Signing & Bundle IDs
- Requires Apple Developer certificate (distribution)
- Team ID: `H48PW6TC25`
- **Bundle IDs must match across iOS and macOS for unified listing:**
  - App: `com.nostrkey` (both platforms)
  - Extension: `com.nostrkey.Extension` (both platforms)
- Previously macOS used `com.nostrkey.plugin` — was changed to `com.nostrkey` on 2026-03-03
- Automatic signing with "Apple Distribution: Humanjava Enterprises (H48PW6TC25)"

## Submission Checklist

- [ ] Apple Developer account active
- [ ] App Store Connect entry created
- [ ] App name reserved: "NostrKey"
- [ ] Bundle ID registered
- [ ] Fill out app description, subtitle, keywords
- [ ] Upload promotional text
- [ ] Set categories (Utilities + Social Networking)
- [ ] Upload screenshots (macOS required, iOS if applicable)
- [ ] Set privacy declarations (Data Not Collected)
- [ ] Add privacy policy URL
- [ ] Add support URL
- [ ] Add review notes (see above)
- [ ] Archive and upload build from Xcode
- [ ] Select build in App Store Connect
- [ ] Submit for review

## Review Timeline

- Initial review: 1-3 days typically
- Safari extensions may receive additional review for:
  - Content script injection (`<all_urls>`)
  - Cryptographic functionality
  - Key storage practices
- Be prepared to explain NIP-07 standard and why `<all_urls>` is required

## Post-Submission

### If Approved
- Update README.md with App Store link
- Update nostrkey.com with App Store badge
- Update support.html with installation link
- Announce on social media / Nostr

### If Rejected
- Review feedback in Resolution Center
- Common issues:
  - Missing functionality explanation → update review notes
  - Privacy concerns → clarify local-only storage
  - `<all_urls>` justification → reference NIP-07 standard and MetaMask/Alby precedent
- Resubmit via App Store Connect

## Terms and Conditions

**URL:** https://nostrkey.com/terms.html

## Additional Resources

- [App Store Connect](https://appstoreconnect.apple.com)
- [Safari Web Extension Guide](https://developer.apple.com/documentation/safariservices/safari_web_extensions)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [NIP-07 Specification](https://github.com/nostr-protocol/nips/blob/master/07.md)

---

*Last updated: March 3, 2026*
*Published by Humanjava Enterprises Inc*
