# NostrKey Browser Plugin — TODO

> **Where things stand (2026-06-06)**
> Plugin is at **v1.6.2** (released 2026-04-07), 166 tests, full QA. It's parked at a clean stopping point — not mid-flight.
> **nsecBunker (nBunker) is SHIPPED**, not planned — both client and server modes are wired end-to-end (see below). What remains there is refinement, not build.
> The big open *new* direction is the **HTTP-402 / NWC + Cashu** payments research. Everything else is housekeeping.

| Area | State |
|---|---|
| Core extension (NIP-07 signer, vault, profiles, sync) | **Shipped** v1.6.2 |
| nsecBunker remote signing (client + server) | **Shipped** — see §1; refinements remain |
| HTTP-402 micropayments (NWC + Cashu) | **Research** — not started, see §2 |
| Housekeeping (deps, gitignore, stale docs) | **Open** — see §3 |

---

## 1. nsecBunker (nBunker) — SHIPPED, with refinements remaining

**Status:** Implemented and wired end-to-end in v1.6.2. This section used to read "Planned" — that was stale. The work landed across commits `108488b` (Phase 2 end-to-end), `adb9443` (server mode), `1810a3e` (Bunker URL card).

### What's actually built
- **Client mode** (`src/utilities/nip46.js`, 537 LOC) — connect *to* a remote nsecBunker via NIP-46. UI: the **Bunker Connection** panel + **nsecBunker Profiles** in `full_settings.html`; bunker URL form (`bunker://<pubkey>?relay=...&secret=...`).
- **Server mode** (`src/utilities/bunker-server.js`, 254 LOC) — the extension *is* the bunker. Subscribes for kind-24133 requests tagged to the user's pubkey, derives the NIP-44 conversation key, decrypts, dispatches `connect` / `get_public_key` / `sign_event` / `nip44_encrypt`, signs with `finalizeEvent`, encrypts + returns. Rejects unauthenticated clients for everything except `connect`.
- **UI surface** — bunker status indicator in `popup.html`, Bunker URL card in the Apps tab (sidepanel).

### The relay model (one Worker, two hostnames)
The bunker defaults to **`wss://relay.nostrkey.com`**. That hostname and **`wss://relay.nostrkeep.app`** are routed by Cloudflare to the **same Worker** — one deployed relay, two brand faces (NostrKey front, NostrKeep backend). This is intentional, not a config drift: code can keep `relay.nostrkey.com` and docs should describe the dual-hostname routing rather than treat the two names as a conflict. Backend: `nostrkey.srvr.relay.src` (CF Workers + Durable Objects + D1; ambient usage, no event storage; forwards ephemeral NIP-46 events).

### Current signing model + the refinement
Today the server uses **secret-auth then auto-sign**: a client authenticates with the shared `secret` (the `&secret=` in the bunker URL); once authenticated, `sign_event` signs automatically with **no per-request prompt**. The secret is the auth boundary.

**Decision (2026-06-06): the target is a HYBRID per-kind model**, so the auto-sign is *interim*. Refinement tasks:
- [ ] Per-kind permission memory: auto-sign event kinds the user has "always allowed".
- [ ] Prompt (Approve / Deny / Always-allow-this-kind) for any **unknown** kind before signing.
- [ ] Surface the per-kind permissions in settings (view / revoke).
- [ ] **Harden before any public "remote signing" messaging** — auto-sign-anything-with-the-secret is a different promise than "you approve each request."

### Other remaining nBunker work
- [ ] **Mirror the bunker UX to iOS and Android apps** (still open — the one genuinely unbuilt piece).
- [ ] Default-relay UX: make `relay.nostrkey.com` the visible default with an override field (the field exists; confirm the default + copy/QR for the bunker address).

> A longer-term hardened nBunker architecture is tracked **internally** (confidential design — not detailed in this public repo). That is the **destination**; this section is **what ships today**.

---

## 2. HTTP 402 Micropayments via NWC + Cashu (NUT-24) — RESEARCH

**Status:** Research / exploration. Not started in the plugin.
**Reference:** https://402fordummies.dev/ · **Specs:** NUT-24 (HTTP 402 + Cashu), NUT-18 (payment requests), NUT-10 (lock conditions), NIP-47 (Nostr Wallet Connect)

> **Before building:** whether to pursue Cashu-based 402 at all is a business/monetization call, tracked privately — not here. This section is **technical feasibility only.**

### Concept
Intercept HTTP 402 ("Payment Required") responses in the browser and handle micropayments via a connected wallet. The server returns a 402 with an `X-Cashu` header containing a NUT-18 payment request. NostrKey decodes it, pays via a connected NWC wallet, and retries with a `cashuB` token. Content unlocks seamlessly. NostrKey already holds the user's Nostr identity — adding a wallet-connection layer turns it into a unified identity + payments extension.

### Payment flow (5-step handshake)
1. Client requests a protected resource (normal HTTP GET)
2. Server responds 402 + `X-Cashu` header with NUT-18 payment request
3. NostrKey decodes the header → amount, unit, accepted mints, lock conditions
4. NostrKey sends a pay request to the connected wallet via NWC (NIP-47) → gets proof/token
5. NostrKey retries with `X-Cashu: cashuB...` → server validates → 200 OK

### Wallet connection via NWC (NIP-47)
NostrKey does NOT become a wallet — it connects to an external one via NWC (encrypted Nostr events: kind 23194 request / 23195 response over a relay). **User setup:** paste a `nostr+walletconnect://` URI from their wallet. One implementation covers all NWC wallets (Coinos, Alby Hub, Zeus, Nutstash, Alby Go, …) — "the USB-C of Bitcoin wallets."

### UX direction
Wallet connection is an **outbound** connection (NostrKey → Wallet), the inverse of a Connected App (App → NostrKey). So it gets **its own Settings section**, separate from the Apps tab — infrastructure you configure once. Main-popup indicator: small `⚡ <wallet>` with a green dot.

### Components to build
- [ ] **NWC connection manager** — paste/scan `nostr+walletconnect://`, parse + store secret securely
- [ ] **NWC client** — NIP-47 requests (23194) over the configured relay, listen for 23195. Evaluate `@getalby/sdk` vs `@nostr-dev-kit/ndk` vs minimal custom (bundle size)
- [ ] **402 interceptor** — `chrome.webRequest.onHeadersReceived` catching 402s, parsing `X-Cashu`
- [ ] **NUT-18 decoder** — decode `creqA...` (amount, unit, mints, NUT-10 lock conditions)
- [ ] **Payment approval UX** — amount + mint, approve/deny, optional "auto-approve under ___ sats"
- [ ] **Wallet dropdown in settings** — known wallets + logos + setup links, generic "Other"
- [ ] **Popup wallet indicator**

### Research questions
- Should NostrKey ever hold Cashu tokens directly (embedded wallet), or always delegate via NWC?
- Can NostrKey sign NUT-10 proofs locked to a Nostr pubkey natively?
- Fallback UX when no wallet is connected and a 402 hits?
- Does the 402 interceptor work in Safari (different extension APIs)?
- How does Alby's extension handle this — what to learn / differentiate?

### Technical positioning
This would be the first extension combining **Nostr key management + NWC wallet connection + HTTP-402 interception** in one package. Alby does WebLN + NWC but not Nostr identity; NostrKey does identity but not payments — this bridges the gap. (Product/monetization rationale is tracked privately, not in this open-source repo.)

### Apple compliance (research before implementing)
- [ ] **Guideline 3.1.5** — does NWC-connecting trigger Apple's crypto-app rules? (NostrKey is a bridge, not a wallet — but Apple may not see it that way.)
- [ ] **IAP-bypass risk** — could 402 payments read as circumventing In-App Purchase? (Payments go to third-party content providers, not us.)
- [ ] **Safari API gaps** — does Safari WebExtension support 402 interception + header modification like Chrome?
- [ ] **Feature-flag strategy** — if Apple blocks it, gate NWC behind a build/remote flag: ship in Chrome/Firefox, omit from Safari/iOS, unified code.
- See `nostrkey.app.ios.src/TODO.md` for the iOS-specific breakdown.

---

## 3. Housekeeping

- [ ] **Dependency drift** — `package.json` pins `nostr-crypto-utils@^0.6.0`, but **0.7.0** (Noble 2.0) is published. `^0.6.0` won't pull it. Bump + re-test (166 tests are the safety net).
- [ ] **gitignore hygiene** — add `test-results/` and `web-ext-artifacts/` to `.gitignore` (currently untracked build artifacts showing in the working tree). `distros/*.zip` is already ignored; the modified Chrome zips in the tree are timestamp-only build noise.
- [ ] **Retire `docs_project_info/TODO.md`** — it still says "submit v1.6.1 to stores," which shipped. Folded into this file / current store status; delete or stub it.
