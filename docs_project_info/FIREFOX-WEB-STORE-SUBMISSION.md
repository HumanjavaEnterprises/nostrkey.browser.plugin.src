# Firefox Add-on Store (AMO) Submission Guide

This document contains all the information needed to submit NostrKey to the Firefox Add-on Store (addons.mozilla.org).

## Status

**Submitted:** v1.5.7 — Awaiting Review (March 7, 2026)
**Add-on UUID:** nostrkey@nostrkey.com
**Author:** vergel@humanjava.com (Owner)

## Prerequisites

- [x] Firefox Account (free)
- [x] Built Firefox extension (ZIP file ready)
- [x] Source code ZIP (required for bundled extensions)
- [ ] Screenshots (at least 1) — **TODO: add screenshots**
- [x] Icon images (included in manifest)
- [x] Privacy Policy URL

## AMO Submission URL

https://addons.mozilla.org/en-US/developers/

## Add-on Details

### Name
**NostrKey**

### Add-on URL
https://addons.mozilla.org/…/nostrkey

### Summary (250 characters max)
**Nostr key manager and signer. Store your private keys securely and sign events without exposing them.**

### Description

```
NostrKey — Secure Nostr Key Management for Your Browser

NostrKey is a browser extension that safely manages your Nostr private keys and signs events for Nostr-enabled web applications. Your keys never leave your device and are never exposed to websites.

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

🔑 Encrypted Vault
- Store sensitive documents and API keys
- End-to-end encrypted with your master password
- Cross-device sync via Nostr relays

🔒 Privacy & Security
- Keys are stored locally in your browser
- No data sent to external servers
- Open source and auditable
- Support for nostr: protocol links

Supports: NIP-01, NIP-04, NIP-07, NIP-44, NIP-46, NIP-49
```

### Experimental Add-on
**No** — This add-on is not experimental.

### Requires Payment
**No** — This add-on does not require payment, non-free services or software, or additional hardware.

### Categories (up to 3)
1. **Privacy & Security** — Primary category (key management and encryption)
2. **Social & Communication** — Secondary (Nostr is a social protocol)

### Support Email
support@nostrkey.com

### Support Website
https://nostrkey.com/support.html

### Tags
password manager, privacy, security, social media

### License
**MIT License**

## Firefox Manifest Configuration

### Gecko-Specific Settings
```json
"browser_specific_settings": {
    "gecko": {
        "id": "nostrkey@nostrkey.com",
        "strict_min_version": "140.0",
        "data_collection_permissions": {
            "required": ["none"]
        }
    }
}
```

### Key Differences from Chrome
- **Background scripts** use `"scripts": ["background.build.js"]` instead of service worker
- **No side panel** — Firefox lacks the sidePanel API; popup used instead (`default_popup: "sidepanel.html"`)
- **No sidePanel permission** — not available in Firefox
- **Gecko add-on ID** — `nostrkey@nostrkey.com` (permanent, cannot change after submission)
- **Minimum version** — Firefox 140.0 (MV3 support)
- **Data collection** — Declared as `"none"` via `data_collection_permissions`

## Permission Justifications

### Storage Permission

**Justification:**
```
Storage permission is required to securely save user's Nostr private keys, relay configurations, multi-profile settings, and per-application permissions locally in the browser. All cryptographic key material and user preferences must persist between browser sessions to maintain functionality.
```

**What we store:**
- Private keys (optionally encrypted with master password)
- User profiles (multiple identity support)
- Relay configurations
- Per-application permission settings
- Encrypted vault data
- Encrypted API keys

### ClipboardWrite Permission

**Justification:**
```
Clipboard write permission is required to allow users to copy their Nostr public keys (npub), relay URLs, and encrypted key exports to their clipboard for easy sharing and backup. This is a core user convenience feature that enables users to quickly copy their public identity information and configuration data. Only writes to clipboard when user clicks "Copy" buttons — no automatic or background clipboard access.
```

### Host Permissions (All URLs)

**Justification:**
```
Host permissions are required to inject the NIP-07 window.nostr API into web pages, enabling Nostr-compatible websites to request cryptographic signing operations. The extension must communicate with web pages to receive signing requests and return signed events, which is the core functionality of a Nostr key management extension. Access is only used for providing the standard Nostr browser extension API — no data collection or tracking occurs.
```

## Privacy Policy

**Required:** Yes (we handle sensitive cryptographic keys)

**Has Privacy Policy:** Yes

**URL:** https://nostrkey.com/privacy.html

**Privacy Policy Content (for AMO field):**
```
NostrKey does not collect, transmit, or share any user data. All private keys, profiles, and settings are stored locally in the browser using the browser's storage API. The extension only connects to user-configured Nostr relays for signing and syncing operations initiated by the user. No analytics, tracking, or third-party services are used. Full privacy policy at https://nostrkey.com/privacy.html
```

## Notes to Reviewer

```
NostrKey is a Nostr protocol key management extension, similar to how MetaMask manages Ethereum keys. It implements the NIP-07 standard (https://github.com/nostr-protocol/nips/blob/master/07.md) which defines how browser extensions provide signing capabilities to Nostr web applications.

The extension injects a window.nostr API into web pages, allowing Nostr-compatible sites to request event signing. Users must explicitly approve each signing request through the extension's permission system.

Key technical details:
- All cryptographic operations happen locally in the browser
- Private keys never leave the extension's storage context
- WebSocket connections (wss://) are used solely for communicating with user-configured Nostr relays
- The host_permissions (<all_urls>) are required because the NIP-07 API must be available on any website the user visits — we cannot predict which domains will be Nostr-enabled
- Source code is open source: https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src

Build instructions for source code review:
1. npm install
2. npm run build:firefox:prod
3. Output is in distros/firefox/
```

## Source Code Submission

AMO requires source code upload for bundled/minified extensions so reviewers can verify the build output matches the source.

### What to Include in Source ZIP
- `src/` — All source files
- `build.js` — Build script
- `package.json` — Dependencies
- `package-lock.json` — Dependency lock file
- `tailwind.config.js` — Tailwind CSS config
- `.env.example` — Environment template (NOT `.env`)

### Build Instructions (include in submission)
```
1. Ensure Node.js 18+ is installed
2. Run: npm install
3. Run: npm run build:firefox:prod
4. Built extension is in: distros/firefox/
5. AMO-ready ZIP is at: distros/nostrkey-firefox-v{version}.zip
```

### What NOT to Include
- `node_modules/`
- `.env` (contains secrets)
- `distros/` (build output)
- `.git/`

## Required Assets

### Icons (already in manifest)
- 16x16px — `images/toolbar-16.png`
- 48x48px — `images/icon-48.png`
- 96x96px — `images/icon-96.png`
- 128x128px — `images/icon-128.png`
- 256x256px — `images/icon-256.png`
- 512x512px — `images/icon-512.png`

### Screenshots
- [ ] At least 1 screenshot
- [ ] Show key features: profile management, signing requests, vault
- [ ] Recommended: 3-5 screenshots showing different features
- [ ] AMO recommended dimensions: 1280x800 or similar

## Build & Upload Steps

1. Build the Firefox production ZIP:
   ```
   npm run build:firefox:prod
   ```
   Output: `distros/nostrkey-firefox-v1.5.7.zip`

2. Prepare source code ZIP:
   ```
   zip -r nostrkey-source.zip src/ build.js package.json package-lock.json tailwind.config.js .env.example -x '*.DS_Store'
   ```

3. Go to https://addons.mozilla.org/en-US/developers/
4. Click "Submit a New Add-on"
5. Upload `distros/nostrkey-firefox-v1.5.7.zip`
6. When prompted, upload `nostrkey-source.zip` with build instructions
7. Fill in the "Describe Add-on" form using the details above
8. Submit for review

## Submission Checklist

- [x] Create Firefox Account at addons.mozilla.org
- [x] Build production ZIP (`npm run build:firefox:prod`)
- [x] Prepare source code ZIP (exclude node_modules, .env, distros, .git)
- [ ] Prepare screenshots (minimum 1, recommended 3-5) — **TODO**
- [x] Verify privacy policy is live at https://nostrkey.com/privacy.html
- [x] Upload extension ZIP to AMO
- [x] Upload source code ZIP with build instructions
- [x] Fill out listing: name, summary, description
- [x] Select categories: Privacy & Security, Social & Communication
- [x] Select license: MIT License
- [x] Add privacy policy URL and inline policy text
- [x] Add developer comments / technical notes
- [x] Add tags: password manager, privacy, security, social media
- [x] Submit for review (v1.5.7 — Awaiting Review)

## Review Timeline

- Automated scan: immediate
- Human review: typically 1-14 days
- Extensions with `<all_urls>` and cryptographic functionality may take longer
- Be prepared to answer follow-up questions from reviewers

## Post-Submission

### If Approved
- Extension will be published on AMO
- Update README.md with AMO link
- Update nostrkey.com with Firefox install link
- Announce on social media / Nostr

### If Rejected
- Review feedback carefully
- Address any concerns (common: justification for host permissions)
- Update and resubmit
- Consider security audit if cryptographic concerns raised

## Ongoing Maintenance

### Updates
- Build new version: `npm run build:firefox:prod`
- Upload new ZIP through AMO developer dashboard
- Source code re-upload required for each update
- Updates go through review process (usually faster than initial)

### Useful Tools
- **web-ext** — Mozilla's CLI for local testing and AMO uploads
  - `npx web-ext run -s distros/firefox/` — Load extension temporarily in Firefox
  - `npx web-ext lint -s distros/firefox/` — Validate extension before upload
  - `npx web-ext sign` — Sign and upload via CLI (requires API credentials)

## Additional Resources

- [AMO Developer Hub](https://addons.mozilla.org/en-US/developers/)
- [Extension Workshop](https://extensionworkshop.com/)
- [Add-on Policies](https://extensionworkshop.com/documentation/publish/add-on-policies/)
- [Source Code Submission](https://extensionworkshop.com/documentation/publish/source-code-submission/)
- [web-ext CLI](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/)
- [NIP-07 Specification](https://github.com/nostr-protocol/nips/blob/master/07.md)
