# NostrKey

> Cross-browser Nostr key management, encrypted document vault, and identity layer.
> Forked from [ursuscamp/nostore](https://github.com/ursuscamp/nostore) (archived Feb 2025).

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

## Domains

| Domain | Purpose |
|--------|---------|
| [nostrkey.app](https://nostrkey.app) | PWA + extension downloads |
| [nostrkey.com](https://nostrkey.com) | Marketing + docs |
| [nostrkey.dev](https://nostrkey.dev) | Developer integration docs |
| [loginwithnostr.com](https://loginwithnostr.com) | NIP-46 auth gateway |

## Status

🔧 **In Development** — Rebuilding from Nostore v1.2.0 foundation.

See [docs/PROJECT-VISION.md](docs/PROJECT-VISION.md) for the full roadmap.

### Inherited from Nostore (Working)
- [x] NIP-07 `window.nostr` (getPublicKey, signEvent)
- [x] NIP-04 encrypt/decrypt (deprecated, kept for compat)
- [x] NIP-19 bech32 key encoding
- [x] Multi-profile management
- [x] Per-site permissions (allow/deny/ask)
- [x] Event history + audit log
- [x] Safari extension (iOS + macOS)
- [x] Manifest V3

### Building
- [ ] Chrome extension target
- [ ] NIP-44 encryption
- [ ] NIP-46 nsecBunker client
- [ ] Encrypted .md vault (NIP-78)
- [ ] API key vault
- [ ] Master password (keys encrypted at rest)
- [ ] P2P room sharing (NIP-59 gift wrap)
- [ ] PWA at nostrkey.app
- [ ] Login with Nostr auth flow

## NIPs Implemented

| NIP | Feature | Status |
|-----|---------|--------|
| [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) | Basic protocol | ✅ |
| [NIP-04](https://github.com/nostr-protocol/nips/blob/master/04.md) | Encrypted DMs v1 | ✅ (deprecated) |
| [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md) | Browser extension | ✅ |
| [NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md) | Bech32 encoding | ✅ |
| [NIP-42](https://github.com/nostr-protocol/nips/blob/master/42.md) | Client auth | 🔧 Planned |
| [NIP-44](https://github.com/nostr-protocol/nips/blob/master/44.md) | Encrypted messaging v2 | 🔧 Planned |
| [NIP-46](https://github.com/nostr-protocol/nips/blob/master/46.md) | Nostr Connect (bunker) | 🔧 Planned |
| [NIP-59](https://github.com/nostr-protocol/nips/blob/master/59.md) | Gift wrap | 🔧 Planned |
| [NIP-78](https://github.com/nostr-protocol/nips/blob/master/78.md) | App-specific data | 🔧 Planned |

## Development

### Prerequisites
- Node.js 20+
- npm
- Xcode (for Safari builds only)

### Setup
```bash
git clone https://github.com/vveerrgg/nostrkey.browser.plugin.git
cd nostrkey.browser.plugin
npm install
```

### Build
```bash
npm run build        # Tailwind CSS + esbuild bundle
npm run watch        # Watch mode (JS)
npm run watch-tailwind  # Watch mode (CSS)
```

### Safari Development
1. Open `Nostore.xcodeproj` in Xcode
2. Run `npm run watch` in terminal
3. Build & Run in Xcode
4. Enable unsigned extensions: Safari → Settings → Advanced → Show Develop menu
5. Develop → Allow Unsigned Extensions → enable NostrKey

### Chrome Development
*(Coming soon)*

## Privacy

This extension does not collect any user data or transmit any data over a network connection except to Nostr relays you explicitly configure. All private key data is encrypted and stored locally. When using nsecBunker mode, no private key material is stored in the extension at all.

## Acknowledgements

- [ursuscamp](https://github.com/ursuscamp) — Original Nostore extension
- [fiatjaf](https://github.com/fiatjaf) — nostr-tools, nos2x, and Nostr itself
- [nostr-tools](https://github.com/nbd-wtf/nostr-tools) — Crypto foundation

## License

ISC
