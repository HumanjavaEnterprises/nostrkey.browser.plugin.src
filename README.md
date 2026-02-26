# NostrKey

> Cross-browser Nostr key management, encrypted document vault, and identity layer.
> Forked from [ursuscamp/nostore](https://github.com/ursuscamp/nostore) (archived Feb 2025).
>
> **Website:** [nostrkey.com](https://nostrkey.com) · **Current release:** [v1.5.5](https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src/releases/tag/v1.5.5) · **License:** MIT

> **NostrKey and Humanjava Enterprises Inc. do not have a cryptocurrency, token, or coin. Nor will there be one.** If anyone suggests or sells a cryptocurrency associated with this project, they are acting fraudulently. [Report scams](https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src/issues).

## What It Does

NostrKey is a free, open-source browser extension that manages your Nostr private keys so they never touch the websites you use. It signs events, encrypts messages, and stores documents — all client-side.

- **NIP-07 signing** — `window.nostr` API for any Nostr web app (Chrome + Safari)
- **NIP-46 nsecBunker** — remote signing, your private key never touches the browser
- **NIP-44 encryption** — modern ChaCha20-Poly1305 (replaces deprecated NIP-04)
- **Zero-knowledge .md vault** — encrypted documents stored on Nostr relays, unreadable by relay operators
- **API key vault** — encrypted secret storage, relay-synced
- **Cross-device sync** — profiles, vault, and settings sync via Google account (Chrome) or iCloud (Safari 16+)
- **Master password** — keys encrypted at rest with configurable auto-lock (5/15/30/60 min or never)
- **NIP-49 export/import** — ncryptsec encrypted key backup and restore
- **Multi-profile** — manage multiple Nostr identities with per-site permissions

## Get NostrKey

| Platform | Install | Status |
|----------|---------|--------|
| **Chrome / Brave / Edge** | [Chrome Web Store](https://chromewebstore.google.com/detail/nostrkey/cggakcmbihnpmcddkkfmoglgaocnmaop) | Live |
| **Android** | [Google Play](https://play.google.com/store/apps/details?id=com.nostrkey.app) | Live |
| **Safari (macOS + iOS)** | App Store | Submission in progress |
| **iOS** | App Store | Submission in progress |

## Architecture

```
┌──────────────────────┐      ┌──────────────┐
│  NostrKey Extension   │─────▶│  nsecBunker  │
│  (Chrome/Safari/PWA)  │◀─────│  (signing)   │
│                       │      └──────────────┘
│  • Sign events        │
│  • Encrypt/decrypt    │      ┌──────────────┐
│  • .md vault          │─────▶│ Nostr Relays │
│  • API key vault      │◀─────│ (encrypted   │
│  • Share to room      │      │  blobs only) │
└──────────────────────┘      └──────────────┘
```

Documents are encrypted client-side before publishing. Relays store ciphertext. Only your key can decrypt.

## The Humanjava Ecosystem

NostrKey is the key management layer for the Humanjava product stack. It connects to everything else.

```
npub.bio ($7/year)           Sovereign identity (NIP-05, Lightning, bunker)
    │                        Uses NostrKey for NIP-07 connect
    ▼
NostrKeep ($5-7/month)       Private relay + Blossom media server
    │                        NostrKey points your keys at your relay
    ▼
NostrKey (free)              ◀── You are here
    │                        Key management, signing, vault
    ▼
Lx7 / Vaiku                 LLM.being infrastructure
```

| Product | What it does | URL |
|---------|-------------|-----|
| **NostrKey** | Key management browser extension (NIP-07, NIP-46, vault) | [nostrkey.com](https://nostrkey.com) |
| **npub.bio** | Sovereign Nostr identity — NIP-05, Lightning address, profile pages | [npub.bio](https://npub.bio) |
| **NostrKeep** | Private Nostr relay + Blossom media server (subscription) | [nostrkeep.com](https://nostrkeep.com) |

### How They Work Together

1. **NostrKey** manages your private keys in the browser
2. **npub.bio** gives you a human-readable identity (`alice@npub.bio`) — verified via NIP-07 connect through NostrKey
3. **NostrKeep** gives you a private relay — NostrKey points your signing at your own infrastructure
4. Your data lives on your relay, your identity resolves through npub.bio, your keys never leave NostrKey

## NIPs Implemented

| NIP | Feature | Status |
|-----|---------|--------|
| [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) | Basic protocol | Done |
| [NIP-04](https://github.com/nostr-protocol/nips/blob/master/04.md) | Encrypted DMs v1 | Done (deprecated, kept for compat) |
| [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md) | Browser extension API | Done |
| [NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md) | Bech32 encoding | Done |
| [NIP-42](https://github.com/nostr-protocol/nips/blob/master/42.md) | Client auth | Planned |
| [NIP-44](https://github.com/nostr-protocol/nips/blob/master/44.md) | Encrypted messaging v2 | Done |
| [NIP-46](https://github.com/nostr-protocol/nips/blob/master/46.md) | Nostr Connect (bunker) | Done |
| [NIP-49](https://github.com/nostr-protocol/nips/blob/master/49.md) | Encrypted key export | Done |
| [NIP-59](https://github.com/nostr-protocol/nips/blob/master/59.md) | Gift wrap | Planned |
| [NIP-78](https://github.com/nostr-protocol/nips/blob/master/78.md) | App-specific data | Done |

## Feature Status

### Shipped
- NIP-07 `window.nostr` (getPublicKey, signEvent)
- NIP-04 encrypt/decrypt (deprecated, kept for compat)
- NIP-19 bech32 key encoding
- NIP-44 encryption (ChaCha20-Poly1305)
- NIP-46 nsecBunker client (remote signing)
- NIP-49 encrypted key export/import (ncryptsec)
- Encrypted .md vault (NIP-78)
- API key vault (encrypted, relay-synced)
- Multi-profile management with per-site permissions
- Master password with configurable auto-lock
- Event history + audit log
- Cross-device sync via storage.sync (Google/iCloud, chunked, priority-based budget)
- Profile read-only view with npub/nsec display
- QR code generation for npub (with Copy as PNG)
- Manage Nostr Keys page (master-detail, export JSON, import nsec/JSON)
- Settings page: accordion sections grouped by App / Profile / General
- Security page: accordion layout with hash-based deep linking
- Material-style toggle switches for relay read/write
- Vault detection & restore after extension reload (three-tier: flag check → deep scan → manual)
- Chrome MV3 message passing fix (sendResponse callback pattern)
- WCAG AA accessibility (contrast, focus, ARIA, reduced motion, semantic HTML)
- Alpine.js removed — all UI is vanilla JS

### Planned
- Encrypted cloud backup (iCloud/Google Drive snapshots)
- Firefox extension
- P2P room sharing (NIP-59 gift wrap)
- PWA at nostrkey.app
- Login with Nostr auth flow
- EN/FR/ES localization
- Bottom sheet permission UI (overlay instead of new tab)
- App Group + Keychain sharing for iOS native app integration
- Enhanced Vault with file attachments
- API key auto-fill for supported services
- Multiple relay sets per profile

## Related Repositories

| Repo | What | Status |
|------|------|--------|
| [nostrkey.browser.plugin.src](https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src) | Browser extension (this repo) | v1.5.5 |
| [nostrkey.app.android.src](https://github.com/HumanjavaEnterprises/nostrkey.app.android.src) | Android app (WebView wrapper) | v1.1.1 |
| [nostrkey.app.ios.src](https://github.com/HumanjavaEnterprises/nostrkey.app.ios.src) | iOS app (WKWebView wrapper) | v1.1.1 |

Mobile apps use dual-WebView architectures (background + UI) with platform-specific bridges (`AndroidBridge.kt` / `IOSBridge.swift`) to translate Chrome extension APIs into native functionality.

## Development

### Prerequisites
- Node.js 20+
- npm
- Xcode (for Safari builds only)

### Setup
```bash
git clone https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src.git
cd nostrkey.browser.plugin.src
npm install
```

### Build
```bash
npm run build           # Safari: Tailwind CSS + esbuild
npm run build:chrome    # Chrome: dev build → distros/chrome/
npm run build:all       # Both targets (Chrome + Safari)
npm run build:all:prod  # Both targets, minified
npm run watch           # Watch mode (JS, Safari only)
npm run watch-tailwind  # Watch mode (CSS)
```

### Chrome Development
1. `npm run build:chrome`
2. Open `chrome://extensions/`, enable **Developer mode**
3. Click **Load unpacked** → select the `distros/chrome/` folder
4. After rebuilding, click the reload arrow on the extension card

See [docs_project_info/CHROME-DEV.md](docs_project_info/CHROME-DEV.md) for full details.

### Safari Development (requires macOS + Xcode)
1. Open `apple/NostrKey.xcodeproj` in Xcode
2. Run `npm run watch` in terminal
3. Build & Run in Xcode
4. Enable unsigned extensions: Safari → Settings → Advanced → Show Develop menu
5. Develop → Allow Unsigned Extensions → enable NostrKey

### Tech Stack
- Vanilla JS (no framework — Alpine.js was removed)
- esbuild bundler
- Tailwind CSS
- nostr-crypto-utils for protocol operations
- Chrome Manifest V3

## Privacy

NostrKey does not collect any user data or transmit any data over a network connection except to Nostr relays you explicitly configure. All private key data is encrypted and stored locally. When using nsecBunker mode, no private key material is stored in the extension at all.

## Acknowledgements

- [ursuscamp](https://github.com/ursuscamp) — Original Nostore extension
- [fiatjaf](https://github.com/fiatjaf) — nostr-tools, nos2x, and Nostr itself
- [nostr-crypto-utils](https://github.com/HumanjavaEnterprises/nostr-crypto-utils) — Crypto foundation

## License

MIT — see [LICENSE](LICENSE)

A product by [Humanjava Enterprises Inc](https://humanjava.com) · British Columbia, Canada
