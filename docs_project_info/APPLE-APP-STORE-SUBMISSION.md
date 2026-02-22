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

#### macOS (required)
- At least 1 screenshot
- Recommended sizes: 2880x1800, 1280x800
- Show: profile management, signing flow, vault, security settings

#### iOS (required if supporting iPhone/iPad)
- 6.7" display: 1290x2796
- 6.5" display: 1284x2778 or 1242x2688
- Show: popup interface, key management, permission dialog

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

# 2. Open in Xcode
open apple/NostrKey.xcodeproj

# 3. In Xcode:
#    - Select "Any Mac" or "Any iOS Device" as destination
#    - Product → Archive
#    - Window → Organizer → Distribute App → App Store Connect
```

### Signing
- Requires Apple Developer certificate (distribution)
- Bundle ID should match App Store Connect entry
- Enable "Safari Web Extension" capability

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

*Last updated: February 22, 2026*
*Published by Humanjava Enterprises Inc*
