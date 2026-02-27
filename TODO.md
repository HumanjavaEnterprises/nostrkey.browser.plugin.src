# NostrKey Browser Plugin TODO

## NIP-46 nsecBunker UX — Remote Signing via NostrKeep Relay

**Status:** Planned
**Depends on:** `relay.nostrkeep.app` deployment (`nostrkeep.srvr.relay.src` Phase 1 complete)
**Related:** `nostrkeep.bizdocs.src` TODO (business model + relay details)

### Summary

Add a Remote Signing (nsecBunker) settings panel to NostrKey. Default bunker relay is `wss://relay.nostrkeep.app` (free, provided by NostrKeep). Users can override with their own relay URL. The nsec never leaves the device — NostrKeep only carries encrypted NIP-46 messages.

### UX Reference

#### Settings Panel

```
┌─────────────────────────────────────────────┐
│  Remote Signing (nsecBunker)                │
│                                             │
│  ✅ Enable remote signing                   │
│                                             │
│  Bunker relay:                              │
│  ┌─────────────────────────────────────┐    │
│  │ wss://relay.nostrkeep.app           │    │
│  └─────────────────────────────────────┘    │
│  Free relay provided by NostrKeep.          │
│  Or enter your own relay URL.               │
│                                             │
│  Your bunker address:                       │
│  ┌─────────────────────────────────────┐    │
│  │ bunker://5189fd3b...?relay=wss://   │    │
│  │ relay.nostrkeep.app                 │    │
│  └─────────────────────────────────────┘    │
│  [Copy]  [QR Code]                          │
│                                             │
│  Paste this into any Nostr client that      │
│  supports NIP-46 login. Your private key    │
│  stays on this device.                      │
└─────────────────────────────────────────────┘
```

#### Signing Request Approval

```
┌─────────────────────────────────────────────┐
│  🔔 Signing Request                         │
│                                             │
│  Primal wants to sign:                      │
│  Kind 1 (note)                              │
│  "Just posted from Primal using my..."      │
│                                             │
│  [Approve]  [Approve All Kind 1]  [Deny]    │
└─────────────────────────────────────────────┘
```

### Key Design Decisions

- **NostrKey is the bunker** (holds key, signs) — **NostrKeep is the relay** (carries messages)
- NIP-46 messages are NIP-44 encrypted end-to-end — relay cannot read them
- Default relay: `wss://relay.nostrkeep.app` (free, ephemeral events cost ~nothing)
- Editable text field for users who want their own relay
- Bunker address auto-generated from active profile pubkey + relay URL
- Copy button + QR code for easy sharing
- Signing approval with per-kind "always allow" option

### Implementation Notes

- NIP-46 uses kind 24133 (ephemeral range) — relay already bypasses allowlist for these
- Bunker connection string format: `bunker://<pubkey>?relay=<relay-url>`
- Subscribe to kind 24133 events addressed to active profile pubkey
- Decrypt requests with NIP-44, sign requested events, encrypt + publish response
- Extension already has NIP-46 support — this adds the UX layer + NostrKeep default relay

### Tasks

- [ ] Add "Remote Signing" section to settings page
- [ ] Bunker relay URL field with `wss://relay.nostrkeep.app` default
- [ ] Auto-generate bunker address from active profile + relay URL
- [ ] Copy-to-clipboard + QR code for bunker address
- [ ] Signing request notification/approval UI
- [ ] Per-kind "always allow" permission management
- [ ] Connect to bunker relay WebSocket when remote signing is enabled
- [ ] Handle NIP-46 request/response lifecycle (decrypt → sign → encrypt → publish)
- [ ] Mirror UX to iOS and Android apps

---

## TODO-RESEARCH: HTTP 402 Micropayments via NWC + Cashu (NUT-24)

**Status:** Research / Exploration
**Reference:** https://402fordummies.dev/
**Specs:** NUT-24 (HTTP 402 + Cashu), NUT-18 (payment requests), NUT-10 (lock conditions), NIP-47 (Nostr Wallet Connect)

### Concept

Intercept HTTP 402 ("Payment Required") responses in the browser and handle micropayments automatically via a connected wallet. The server returns a 402 with an `X-Cashu` header containing a NUT-18 encoded payment request. NostrKey decodes it, pays via a connected NWC wallet, and retries the request with a `cashuB` token. Content unlocks seamlessly.

NostrKey already holds the user's Nostr identity — adding a wallet connection layer turns it into a unified identity + payments extension. NUT-10 lock conditions can require proofs locked to a Nostr pubkey, which NostrKey can sign natively.

### Payment Flow (5-Step Handshake)

1. Client requests a protected resource (normal HTTP GET)
2. Server responds 402 + `X-Cashu` header with NUT-18 payment request
3. NostrKey decodes the header → extracts amount, unit, accepted mints, lock conditions
4. NostrKey sends pay request to connected wallet via NWC (NIP-47) → gets proof/token back
5. NostrKey retries original request with `X-Cashu: cashuB...` → server validates → 200 OK

### Wallet Connection via NWC (NIP-47)

NostrKey does NOT become a wallet. It connects to an external wallet via NWC — a Nostr-native protocol where communication happens over relays using encrypted events (kind 23194 requests, kind 23195 responses).

**User setup:** Paste a `nostr+walletconnect://` URI from their wallet into NostrKey settings. That's it.

**NWC-compatible wallets (known):**
- Coinos (coinos.io) — web-based, Lightning + Cashu, open-source NWC: `github.com/coinos/coinos-server/blob/master/lib/nwc.ts`
- Alby Hub — most popular NWC wallet, self-hostable, multiple backends (LDK, LND, Cashu, Phoenixd)
- Zeus — mobile multi-wallet with embedded node, NWC from v0.10+
- Nutstash — Cashu ecash wallet with experimental NWC
- Alby Go — simple mobile NWC interface
- Any future NWC-compatible wallet (protocol is standardized)

One implementation covers all wallets — NWC is "the USB-C of Bitcoin wallets."

### UX Direction (from discussion)

**Wallet connection is NOT a Connected App** — it's an outbound connection (NostrKey → Wallet), not inbound (App → NostrKey). Connected Apps = apps asking NostrKey to sign. NWC = NostrKey asking a wallet to pay. The directionality is flipped.

**Preferred approach (Option B):** Wallet gets its own section in Settings, separate from the Apps tab. It's infrastructure (configure once, forget until a 402 hits), not an app relationship.

**Settings panel concept:**
- "Connect Wallet" button → modal with paste field for NWC URI (or QR scan on mobile)
- Dropdown of known wallets (Coinos, Alby Hub, Zeus, Nutstash, Other) with logos + "How to connect" link for each
- Auto-detect wallet name from NWC info event
- Connection status indicator (green/red dot)
- Optional auto-approve threshold: "Auto-approve payments under ___ sats"
- Disconnect per connection

**Main popup indicator:** Small `⚡ Coinos` with green dot in header bar — always visible, minimal footprint.

### Components to Build

- [ ] **NWC connection manager** — UI to paste/scan `nostr+walletconnect://` URI, parse + store secret securely in extension storage
- [ ] **NWC client** — send NIP-47 encrypted requests (kind 23194) over configured relay, listen for responses (kind 23195). Evaluate `@getalby/sdk` or `@nostr-dev-kit/ndk` for existing NWC support
- [ ] **402 interceptor** — `chrome.webRequest.onHeadersReceived` listener catching 402 responses, parsing `X-Cashu` headers
- [ ] **NUT-18 decoder** — decode `creqA...` payment request format (amount, unit, mints, NUT-10 lock conditions)
- [ ] **Payment approval UX** — popup/badge notification showing amount + mint, approve/deny, optional auto-approve under threshold
- [ ] **Wallet dropdown in settings** — known wallets with logos + setup instructions, generic "Other" option
- [ ] **Popup wallet indicator** — small status badge in main extension popup header

### Research Questions

- Should NostrKey ever hold Cashu tokens directly (embedded wallet), or always delegate to external wallets via NWC?
- How do NUT-10 lock conditions interact with Nostr pubkey signing? Can NostrKey sign proofs natively?
- What's the fallback UX when no wallet is connected and a 402 is encountered? (Toast notification with "Connect a wallet to pay" link?)
- Can the 402 interceptor work in Safari (different extension APIs)?
- Evaluate `@getalby/sdk` vs `@nostr-dev-kit/ndk` vs minimal custom NWC client for bundle size
- How does Alby's existing browser extension handle this? What can we learn / differentiate?

### Strategic Angle

NostrKey would be the first extension combining **Nostr key management + NWC wallet connection + HTTP 402 payment interception** in one package. Identity, payments, and access control — unified. Alby does WebLN + NWC but doesn't manage Nostr identity. NostrKey does identity but doesn't do payments. This bridges the gap.

Also relevant for gating access to The Factory / Lx7.ca and NostrKeep premium features without any traditional payment processor.

### Apple Compliance — Safari Extension + iOS App

**Critical research before implementation.** See also: `nostrkey.app.ios.src/TODO.md` for full iOS-specific breakdown.

Apple may require NWC features to be hidden or omitted from Safari extension and iOS app builds:

- [ ] **App Store Review Guideline 3.1.5** — does connecting to an external wallet via NWC trigger Apple's crypto app rules? NostrKey is NOT a wallet (just a bridge), but Apple may not see it that way.
- [ ] **IAP bypass risk** — could Apple view NWC-powered 402 payments as circumventing In-App Purchase? Payments go to third-party content providers, not to us.
- [ ] **Safari extension API gaps** — does Safari's WebExtension API support intercepting 402 responses and modifying request headers the same way Chrome does?
- [ ] **Precedent** — how do Zeus, Alby Go, and other NWC/Lightning apps handle Apple review?
- [ ] **Feature flag strategy** — if Apple blocks it, gate NWC behind a build-time or remote config flag. Ship in Chrome/Firefox, omit from Safari/iOS. Code stays unified, feature availability varies by platform.
