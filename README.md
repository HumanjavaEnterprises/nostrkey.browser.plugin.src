# NostrKey

> Cross-browser Nostr key management, encrypted document vault, and identity layer.
> Forked from [ursuscamp/nostore](https://github.com/ursuscamp/nostore) (archived Feb 2025).
>
> **Website:** [nostrkey.com](https://nostrkey.com) · **Current release:** [v1.2.0](https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src/releases/tag/v1.2.0)

## What It Does

- **NIP-07 signing** — `window.nostr` API for any Nostr web app (Chrome + Safari)
- **NIP-46 nsecBunker** — remote signing, your private key never touches the browser
- **NIP-44 encryption** — modern ChaCha20-Poly1305 (replaces deprecated NIP-04)
- **Zero-knowledge .md vault** — encrypted documents stored on Nostr relays, unreadable by relay operators
- **API key vault** — encrypted secret storage, synced across devices via relays
- **P2P document sharing** — send encrypted files to chat rooms with temporary access
- **Login with Nostr** — NIP-42 authentication for web apps

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

## Status

See [docs/PROJECT-VISION.md](docs/PROJECT-VISION.md) for the full roadmap.

### Working
- [x] NIP-07 `window.nostr` (getPublicKey, signEvent)
- [x] NIP-04 encrypt/decrypt (deprecated, kept for compat)
- [x] NIP-19 bech32 key encoding
- [x] Multi-profile management
- [x] Per-site permissions (allow/deny/ask)
- [x] Event history + audit log
- [x] Safari extension (iOS + macOS)
- [x] Chrome extension (Manifest V3)
- [x] NIP-44 encryption (ChaCha20-Poly1305)
- [x] NIP-46 nsecBunker client (remote signing)
- [x] Encrypted .md vault (NIP-78)
- [x] API key vault (encrypted, relay-synced)
- [x] Master password (keys encrypted at rest, auto-lock)
- [x] Profile read-only view with npub/nsec display
- [x] QR code generation for npub (with Copy as PNG)
- [x] Modern permission page styling
- [x] Options pages open in same tab (no tab clutter)
- [x] Close buttons on all options pages
- [x] Standalone security settings page (master password + auto-lock)
- [x] Configurable auto-lock timeout (5/15/30/60 min or never)
- [x] Alpine.js removed — all UI is vanilla JS (smaller bundles, no framework dep)

### Planned
- [ ] P2P room sharing (NIP-59 gift wrap)
- [ ] PWA at nostrkey.app
- [ ] Login with Nostr auth flow
- [ ] Bottom sheet permission UI (overlay instead of new tab)
- [ ] App Group + Keychain sharing for iOS native app integration
- [ ] Enhanced Vault integration with file attachments
- [ ] API key auto-fill for supported services
- [ ] Backup/restore profiles to encrypted file
- [ ] Multiple relay sets per profile

## NIPs Implemented

| NIP | Feature | Status |
|-----|---------|--------|
| [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) | Basic protocol | ✅ |
| [NIP-04](https://github.com/nostr-protocol/nips/blob/master/04.md) | Encrypted DMs v1 | ✅ (deprecated) |
| [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md) | Browser extension | ✅ |
| [NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md) | Bech32 encoding | ✅ |
| [NIP-42](https://github.com/nostr-protocol/nips/blob/master/42.md) | Client auth | 🔧 Planned |
| [NIP-44](https://github.com/nostr-protocol/nips/blob/master/44.md) | Encrypted messaging v2 | ✅ |
| [NIP-46](https://github.com/nostr-protocol/nips/blob/master/46.md) | Nostr Connect (bunker) | ✅ |
| [NIP-59](https://github.com/nostr-protocol/nips/blob/master/59.md) | Gift wrap | 🔧 Planned |
| [NIP-78](https://github.com/nostr-protocol/nips/blob/master/78.md) | App-specific data | ✅ |

## Install

### From GitHub Releases (sideload)
1. Download the latest zip from [Releases](https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src/releases)
2. **Chrome:** Unzip → `chrome://extensions/` → Developer mode → Load unpacked → select the folder
3. **Safari:** Build from source (see below)

### Chrome Web Store
Coming soon — submission in progress.

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

See [docs/CHROME-DEV.md](docs/CHROME-DEV.md) for full details.

### Safari Development (requires macOS + Xcode)
1. Open `apple/NostrKey.xcodeproj` in Xcode
2. Run `npm run watch` in terminal
3. Build & Run in Xcode
4. Enable unsigned extensions: Safari → Settings → Advanced → Show Develop menu
5. Develop → Allow Unsigned Extensions → enable NostrKey

## Privacy

This extension does not collect any user data or transmit any data over a network connection except to Nostr relays you explicitly configure. All private key data is encrypted and stored locally. When using nsecBunker mode, no private key material is stored in the extension at all.

## Acknowledgements

- [ursuscamp](https://github.com/ursuscamp) — Original Nostore extension
- [fiatjaf](https://github.com/fiatjaf) — nostr-tools, nos2x, and Nostr itself
- [nostr-tools](https://github.com/nbd-wtf/nostr-tools) — Crypto foundation

## License

ISC
