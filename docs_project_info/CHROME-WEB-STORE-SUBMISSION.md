# Chrome Web Store Submission Guide

This document contains all the information needed to submit NostrKey to the Chrome Web Store.

## Prerequisites

- [ ] Google Account
- [ ] $5 one-time developer registration fee
- [ ] Built Chrome extension (ZIP file ready)
- [ ] Screenshots (at least 1, up to 5)
- [ ] Icon images (128x128px required)
- [ ] Privacy Policy URL

## Extension Details

### Name
**NostrKey**

### Summary (132 characters max)
**Nostr key manager and signer for web apps. Securely store your private keys and sign events without exposing them to websites.**

### Category
**Social & Communication**

### Single Purpose
**Manage Nostr cryptographic keys and sign events for decentralized social applications**

### Description

```
Nostrkey - Secure Nostr Key Management for Your Browser

Nostrkey is a browser extension that safely manages your Nostr private keys and signs events for Nostr-enabled web applications. Your keys never leave your device and are never exposed to websites.

Key Features:

🔐 Secure Key Storage
- Store multiple Nostr profiles with nsec or hex private keys
- Optional master password encryption for keys at rest
- NIP-49 encrypted key import/export (ncryptsec)
- QR code generation for easy key sharing

🔗 Remote Signer Support
- Connect to nsecBunker via NIP-46
- Use remote signing without storing keys locally

⚙️ Granular Permissions
- Control which websites can access your keys
- Set permissions per app and per action type
- Choose "Allow", "Deny", or "Ask" for each request

📡 Relay Management
- Configure relay preferences per profile
- Set read/write permissions for each relay
- Recommended relay suggestions included

🔒 Privacy & Security
- Keys are stored locally in your browser
- No data sent to external servers
- Open source and auditable
- Support for nostr: protocol links

Perfect for:
- Nostr users who want secure key management
- Anyone using multiple Nostr web clients
- Users who need to manage multiple Nostr identities
- Privacy-conscious individuals

Supports: NIP-01, NIP-04, NIP-07, NIP-44, NIP-46, NIP-49
```

## Trader Account Status

**This is a trader account**

Reason: The extension is published by Humanjava Enterprises Inc, a registered business entity.

## Permission Justifications

### Storage Permission

**Justification:**
```
Storage permission is required to securely save user's Nostr private keys, relay configurations, multi-profile settings, and per-application permissions locally in the browser. All cryptographic key material and user preferences must persist between browser sessions to maintain functionality. No data is transmitted to external servers - all storage is local only.
```

**What we store:**
- Private keys (optionally encrypted with master password)
- User profiles (multiple identity support)
- Relay configurations
- Per-application permission settings
- Encrypted vault data
- Encrypted API keys

**Privacy assurance:**
- All storage is local to the browser
- No external data transmission
- Optional master password encryption
- No tracking or analytics

### ClipboardWrite Permission

**Justification:**
```
Clipboard write permission is required to allow users to copy their Nostr public keys (npub), relay URLs, and encrypted key exports to their clipboard for easy sharing and backup. This is a core user convenience feature that enables users to quickly copy their public identity information and configuration data.
```

**What we copy:**
- Public keys (npub format)
- Relay URLs
- Encrypted key exports (ncryptsec)
- Configuration data

**User control:**
- Only writes to clipboard when user clicks "Copy" buttons
- No automatic or background clipboard access
- User-initiated actions only

### SidePanel Permission

**Justification:**
```
Side panel permission is required to provide users with persistent access to their Nostr profiles, vault, event history, and settings while browsing. This allows users to manage their identity, view signing requests, and access encrypted documents without leaving their current page, improving usability and workflow efficiency.
```

**What the side panel provides:**
- Profile management interface
- Event history viewing
- Encrypted vault access
- Settings management
- Real-time signing request monitoring

**User benefit:**
- Non-intrusive access to key management
- No need to open new tabs
- Better workflow for managing multiple profiles
- Real-time visibility of signing requests

### Host Permissions (All URLs)

**Justification:**
```
Host permissions are required to inject the NIP-07 window.nostr API into web pages, enabling Nostr-compatible websites to request cryptographic signing operations. The extension must communicate with web pages to receive signing requests and return signed events, which is the core functionality of a Nostr key management extension. Access is only used for providing the standard Nostr browser extension API - no data collection or tracking occurs.
```

**Technical necessity:**
- Implements NIP-07 standard browser extension API
- Injects `window.nostr` object into web pages
- Receives signing requests from Nostr applications
- Returns signed events to applications
- Cannot predict which domains users will visit

**Privacy assurance:**
- No data collection or tracking
- Only used for API injection and message passing
- All signing requires user approval
- Follows established Nostr protocol standards

**Similar extensions:**
- MetaMask (Ethereum wallet)
- Alby (Bitcoin Lightning/Nostr)
- Other crypto signing extensions require similar permissions

## Privacy Practices

### Data Collection
**We do NOT collect any user data**

### Data Usage
- All data stored locally in browser
- Private keys never leave the device (except in bunker mode where user explicitly connects to remote signer)
- No analytics or tracking
- No external server communication (except to user-configured Nostr relays)

### Data Handling
- Private keys encrypted with optional master password
- All storage is local using Chrome's storage API
- No third-party services
- Open source and auditable

## Required Assets

### Icons
- ✅ 128x128px (located in `src/images/icon-128.png`)
- ✅ 48x48px (located in `src/images/icon-48.png`)
- ✅ 16x16px (located in `src/images/icon-16.png`)

### Screenshots
- [ ] At least 1 screenshot (1280x800 or 640x400)
- [ ] Show key features: profile management, signing requests, vault
- [ ] Recommended: 3-5 screenshots showing different features

### Promotional Images (Optional but Recommended)
- [ ] Small tile: 440x280
- [ ] Marquee: 1400x560

## Privacy Policy

**Required:** Yes (we handle sensitive cryptographic keys)

**URL:** https://humanjavaenterprises.github.io/nostrkey.browser.plugin.src/privacy.html

**Key points included:**
- ✅ What data we store (keys, profiles, settings)
- ✅ Where data is stored (locally only)
- ✅ What we don't do (no tracking, no external transmission)
- ✅ User control (master password, key deletion)
- ✅ Open source nature
- ✅ GDPR and CCPA compliance
- ✅ User rights and data portability

## Terms and Conditions

**URL:** https://humanjavaenterprises.github.io/nostrkey.browser.plugin.src/terms.html

**Key sections included:**
- ✅ Extension description and scope
- ✅ User eligibility and responsibilities
- ✅ Open source "as-is" disclaimer
- ✅ Private key security warnings
- ✅ No backup/recovery services
- ✅ Acceptable use policy
- ✅ Limitation of liability
- ✅ Indemnification
- ✅ Governing law (British Columbia, Canada)

## Support & Contact Information

**Website:** https://humanjava.com

**Support Email:** [Add support email]

**GitHub:** https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src

**Documentation:** https://humanjavaenterprises.github.io/nostrkey.browser.plugin.src/support.html

## Submission Checklist

- [ ] Register as Chrome Web Store developer ($5 fee)
- [ ] Create ZIP file of `distros/chrome/` folder
- [ ] Prepare screenshots (minimum 1, recommended 3-5)
- [ ] Create and host privacy policy
- [ ] Fill out store listing with description above
- [ ] Add all permission justifications
- [ ] Upload icon images
- [ ] Set category to "Social & Communication"
- [ ] Declare as trader account
- [ ] Submit for review

## Review Timeline

- Initial review: 1-7 days typically
- May take longer for extensions with sensitive permissions
- Be prepared to answer questions about cryptographic functionality
- Security-focused extensions may receive additional scrutiny

## Post-Submission

### If Approved
- Extension will be published to Chrome Web Store
- Update README.md with Chrome Web Store link
- Update support.html with installation link
- Announce on social media / Nostr

### If Rejected
- Review feedback carefully
- Address any concerns
- Update justifications if needed
- Consider security audit if cryptographic concerns raised
- Resubmit with changes

## Notes

- Chrome Web Store reviews are stricter for extensions handling cryptographic keys
- Be thorough and transparent in all justifications
- Emphasize privacy and security features
- Reference NIP-07 standard to show this is an established protocol
- Consider mentioning similar extensions (Alby, nos2x) as precedent

## Additional Resources

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Extension Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)
- [Permission Warnings](https://developer.chrome.com/docs/extensions/mv3/permission_warnings/)
- [NIP-07 Specification](https://github.com/nostr-protocol/nips/blob/master/07.md)
