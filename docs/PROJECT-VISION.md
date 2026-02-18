# NostrKey — Project Vision

> Forked from [ursuscamp/nostore](https://github.com/ursuscamp/nostore) (archived Feb 2025).
> New home: [vveerrgg/nostrkey.browser.plugin.src](https://github.com/vveerrgg/nostrkey.browser.plugin.src)

## What Is This?

NostrKey is a cross-browser Nostr key management extension and encrypted document vault. It starts where Nostore left off (NIP-07 signing for Safari) and expands into:

1. **Chrome + Safari + PWA** — one codebase, three targets
2. **NIP-46 (nsecBunker)** — remote signing, your nsec never touches the browser
3. **NIP-44** — modern encrypted messaging (replaces deprecated NIP-04)
4. **Zero-knowledge .md vault** — encrypted documents stored on Nostr relays
5. **P2P document sharing** — send encrypted files to chat rooms temporarily
6. **Encrypted API key storage** — portable secret vault synced via relays

## Domain Portfolio

| Domain | Purpose |
|--------|---------|
| **nostrkey.app** | PWA host + extension download landing page |
| **nostrkey.com** | Marketing, docs, brand anchor |
| **nostrkey.dev** | Developer SDK / integration docs |
| **loginwithnostr.com** | NIP-46 auth gateway ("Sign in with Nostr") |
| **loginwithnostr.ca** | Canadian mirror |
| **connexionnostr.com** | French-language branding |
| **connexionnostr.ca** | French-language .ca |
| **nostrkey.ca/.co/.org** | Defensive registrations → redirect to .com |

## How It Fits Into Lx7

NostrKey is the identity and storage layer for the Lx7 platform:

- **Colab Lite ($7/mo)** — nPub + nBunker identity. Install NostrKey, store encrypted .md files on public relays for free. "Login with Nostr" across all Lx7 services.
- **Colab Pro ($27/mo)** — SOUL.md + RAG documents stored as encrypted NIP-78 events. Zero-knowledge uploads.
- **Factory ($111/mo)** — Knowledge graph docs, LoRA training data, all encrypted on relays, shared to dedicated Muse room.
- **Factory Studio ($222/mo)** — Export everything. NostrKey vault = your portable data backpack.

The relay operators (even ours) literally cannot read the content. Users own their data cryptographically, not just by policy.

---

## Architecture

```
┌──────────────────────┐      ┌──────────────┐
│  NostrKey Extension   │─────▶│  nsecBunker  │
│  (Chrome/Safari/PWA)  │◀─────│  (signing)   │
│                       │ NIP-46└──────────────┘
│  • NIP-07 signing     │
│  • .md editor/viewer  │      ┌──────────────┐
│  • NIP-44 encrypt     │─────▶│ Nostr Relays │
│  • NIP-78 store/fetch │◀─────│ (encrypted   │
│  • API key vault      │      │  blobs only) │
│  • Share to room      │      └───────┬──────┘
└──────────┬───────────┘              │
           │                          │
           │  "share to room"         │ fetch + decrypt
           ▼                          ▼
    ┌─────────────────────────────────────┐
    │         colab.lx7.ca room           │
    │  • Receives encrypted .md via relay │
    │  • Decrypts with session/room key   │
    │  • Renders temporarily (no persist) │
    │  • Gossip server = transport layer  │
    └─────────────────────────────────────┘
```

### Data Flow: Zero-Knowledge .md Storage

```
User writes .md in NostrKey
        │
        ▼
NIP-44 encrypt (to self, using own keypair)
        │
        ▼
Publish as kind 30078 event (NIP-78: Application-Specific Data)
  • d-tag = file path (e.g., "vault/SOUL.md")
  • content = encrypted blob
  • tags: [["d", "vault/SOUL.md"], ["client", "nostrkey"]]
        │
        ▼
Relay stores it ── relay CANNOT read it
        │
        ▼
Any device with NostrKey + your key → fetch, decrypt, read
```

### Data Flow: P2P Share to Room

```
User selects .md → "Share to Room"
        │
        ▼
NIP-44 encrypt to recipient's pubkey (or room session key)
        │
        ▼
Send via NIP-59 (Gift Wrap) or custom kind through gossip server
        │
        ▼
Recipient's colab.lx7 room receives event
        │
        ▼
Decrypt → render .md temporarily → discard after session
```

### Data Flow: Login with Nostr

```
User visits colab.lx7.ca → "Login with Nostr" button
        │
        ▼
Redirect to loginwithnostr.com (or inline NIP-46 flow)
        │
        ▼
NostrKey extension intercepts / PWA handles NIP-46 challenge
        │
        ▼
nsecBunker signs auth event (kind 22242, NIP-42)
        │
        ▼
colab.lx7.ca verifies signature → session established
```

---

## Nostr NIPs Used

| NIP | Name | Role in NostrKey |
|-----|------|------------------|
| **NIP-01** | Basic protocol | Event format, relay communication |
| **NIP-07** | Browser Extension | `window.nostr` API for web apps |
| **NIP-19** | Bech32 encoding | nsec/npub/nprofile display |
| **NIP-42** | Client Auth | "Login with Nostr" signature |
| **NIP-44** | Encrypted Messaging v2 | All encryption (files, DMs, vault) |
| **NIP-46** | Nostr Connect | nsecBunker remote signing |
| **NIP-59** | Gift Wrap | Private P2P document delivery |
| **NIP-78** | App-Specific Data (kind 30078) | Encrypted .md file storage |

### Deprecated (to remove)

| NIP | Name | Status |
|-----|------|--------|
| **NIP-04** | Encrypted DMs v1 | Keep for backwards compat, warn users |

---

## Existing Codebase (Inherited from original Nostore)

### What We Start With (Working)
- NIP-07 `window.nostr` API (getPublicKey, signEvent)
- NIP-04 encrypt/decrypt (deprecated but functional)
- NIP-19 bech32 key handling
- Multi-profile key management
- Per-site permission model (allow/deny/ask)
- Event history with IndexedDB audit log
- Safari extension (iOS + macOS) with Swift wrapper
- Manifest V3 (already Chrome-compatible)
- esbuild + Tailwind CSS build chain
- Alpine.js reactive UI

### What We Need to Build

#### Phase 1: Foundation (Week 1)
- [ ] Rename/rebrand to NostrKey
- [ ] Chrome extension target (namespace wrapper, 128px icon, manifest split)
- [ ] NIP-44 encryption support (replace NIP-04 as default)
- [ ] Update nostr-tools to latest
- [ ] Update Node.js requirement (16 → 20+)
- [ ] Enable minification for production builds
- [ ] Master password for local key encryption (keys at rest)

#### Phase 2: nsecBunker (Week 1-2)
- [ ] NIP-46 client implementation
- [ ] Bunker connection string parsing (bunker://pubkey?relay=...)
- [ ] Remote signing flow (connect → auth → sign → disconnect)
- [ ] Profile type: "local key" vs "bunker connection"
- [ ] Bunker session persistence and reconnection
- [ ] Permission model update (bunker approval vs local approval)

#### Phase 3: Encrypted .md Vault (Week 2)
- [ ] NIP-78 event publishing (kind 30078, d-tag file paths)
- [ ] Client-side NIP-44 encryption (encrypt to self)
- [ ] File browser UI (list, search, organize by d-tag)
- [ ] .md viewer/editor in extension popup or tab
- [ ] Sync indicator (relay confirmation)
- [ ] Multi-relay redundancy (publish to N relays)
- [ ] Conflict resolution (latest timestamp wins)

#### Phase 4: API Key Vault (Week 2-3)
- [ ] Encrypted key-value store (kind 30078, d-tag: "vault/api-keys")
- [ ] Add/edit/delete API keys with labels
- [ ] Copy-to-clipboard with auto-clear (30s)
- [ ] Optional relay sync (or local-only mode)
- [ ] Import/export encrypted backup

#### Phase 5: P2P Room Sharing (Week 3)
- [ ] "Share to Room" action on .md files
- [ ] NIP-44 encrypt to recipient pubkey
- [ ] NIP-59 gift wrap delivery
- [ ] Gossip server integration (colab.lx7.ca transport)
- [ ] Temporary access model (session-scoped decryption)
- [ ] Room-side receive + render + discard

#### Phase 6: PWA + Login with Nostr (Week 3-4)
- [ ] nostrkey.app PWA shell
- [ ] NIP-46 in-browser (no extension needed)
- [ ] loginwithnostr.com auth gateway
- [ ] NIP-42 authentication flow
- [ ] colab.lx7.ca integration

---

## Security Model

### Keys at Rest
- Local keys encrypted with master password (PBKDF2 → AES-256-GCM)
- nsecBunker mode: no keys stored locally at all
- IndexedDB encrypted, not plaintext

### Keys in Transit
- NIP-46: signing requests travel encrypted over Nostr relays
- NIP-44: ChaCha20-Poly1305 for all content encryption
- No cleartext ever leaves the extension

### Document Storage
- Relays store encrypted blobs (kind 30078)
- d-tags are visible (file names) — consider hashing for full ZK
- Content is NIP-44 encrypted — relay operators cannot read it
- Deletion: send kind 5 (NIP-09) to request relay deletion

### Permission Model (Inherited + Extended)
- Per-site: allow/deny/ask for each action
- Per-event-kind: fine-grained signing permissions
- Bunker approval: remote confirmation for sensitive operations
- Rate limiting: prevent permission dialog flooding

---

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Crypto | nostr-tools + @noble/* | secp256k1, ChaCha20, PBKDF2 |
| UI Framework | Alpine.js + @alpinejs/csp | Lightweight, CSP-safe |
| Styling | Tailwind CSS | Utility-first |
| Bundler | esbuild | Fast, zero-config |
| Storage | IndexedDB (via idb) | Structured, indexed |
| Safari Wrapper | Swift / SwiftUI | Native app shell |
| Chrome | Manifest V3 | Web extension standard |
| PWA | Vanilla JS + NIP-46 | No framework bloat |

---

## File Structure (Planned)

```
nostrkey/
├── shared/                          # Cross-browser extension code
│   ├── background.js                # Service worker (signing, NIP-46, vault)
│   ├── content.js                   # Page ↔ background bridge
│   ├── nostr-provider.js            # window.nostr API injection
│   ├── popup/                       # Toolbar popup
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── options/                     # Settings page
│   │   ├── options.html
│   │   ├── options.js
│   │   └── options.css
│   ├── vault/                       # .md vault UI
│   │   ├── vault.html
│   │   ├── vault.js
│   │   └── vault.css
│   ├── permission/                  # Permission dialog
│   │   ├── permission.html
│   │   └── permission.js
│   ├── event-history/               # Audit log
│   │   ├── event-history.html
│   │   └── event-history.js
│   ├── lib/                         # Shared utilities
│   │   ├── nip44.js                 # NIP-44 encrypt/decrypt
│   │   ├── nip46.js                 # NIP-46 bunker client
│   │   ├── nip78.js                 # NIP-78 file storage
│   │   ├── nip59.js                 # NIP-59 gift wrap
│   │   ├── storage.js               # Profile/key management
│   │   ├── crypto.js                # Master password encryption
│   │   └── db.js                    # IndexedDB wrapper
│   ├── manifest.chrome.json         # Chrome manifest
│   ├── manifest.safari.json         # Safari manifest
│   └── images/                      # Icons (16-512px)
├── safari/                          # Safari native wrapper
│   ├── App/                         # SwiftUI app
│   └── Extension/                   # Safari extension handler
├── pwa/                             # nostrkey.app PWA
│   ├── index.html
│   ├── sw.js                        # Service worker
│   └── app.js                       # NIP-46 browser client
├── build.js                         # esbuild config
├── tailwind.config.js
├── package.json
└── docs/
    ├── PROJECT-VISION.md            # This document
    ├── ARCHITECTURE.md              # Technical deep-dive
    └── NIP-REFERENCE.md             # NIP implementation notes
```

---

## Prior Art / References

| Project | What We Learn |
|---------|---------------|
| [nostore](https://github.com/ursuscamp/nostore) | Our starting point — Safari NIP-07 |
| [nostash](https://github.com/tyiu/nostash) | Active Nostore fork — NIP-44 additions |
| [nos2x](https://github.com/fiatjaf/nos2x) | OG Chrome NIP-07 — simple reference |
| [nostr-keyx](https://github.com/susumuota/nostr-keyx) | OS keychain integration |
| [Alby](https://getalby.com/) | Full-featured extension (NIP-47, Lightning) |
| [nsecBunker](https://github.com/kind-0/nsecbunkerd) | Reference NIP-46 implementation |

---

## License

ISC (inherited from original Nostore project)

---

*Last updated: February 18, 2026*
*Part of the [Lx7 Platform](https://lx7.ca)*
