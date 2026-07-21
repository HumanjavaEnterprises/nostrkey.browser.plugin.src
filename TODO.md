# NostrKey Browser Plugin — TODO

> **Where things stand (2026-07-19)**
> Live on the stores: **v1.6.2** (released 2026-04-07). Staged next: **v1.7.0 — a security-hardening release** on branch `fix/security-audit-2026-07`, 236 tests, CI-gated. It is *staged, not yet published* — release is blocked on the crypto dependency publishing first (see §4).
> **v1.7.0 completes the hybrid per-kind nsecBunker** (§1 is now DONE — the interim auto-sign is gone). It also makes at-rest encryption the default and fixes NIP-06 seed import. Public detail on that release stays high-level until it ships to the stores.
> The big open *new* direction is the **HTTP-402 / NWC + Cashu** payments research (§2). Before that, a **UX rethink** (§2.5). Housekeeping in §3, release train in §4.

| Area | State |
|---|---|
| Core extension (NIP-07 signer, vault, profiles, sync) | **Shipped** v1.6.2 |
| nsecBunker remote signing (client + server) | **Shipped**; hybrid per-kind model **DONE** in v1.7.0 — see §1 |
| Security hardening (v1.7.0) | **Staged** — release-blocked on crypto dep, see §4 |
| UX rethink (per-kind UI, show-the-event, backup guidance, L0–L3 ladder) | **Next** — see §2.5 |
| HTTP-402 micropayments (NWC + Cashu) | **Research** — not started, see §2 |
| Housekeeping (deps, gitignore, stale docs) | **Open** — see §3 |

---

## 1. nsecBunker (nBunker) — SHIPPED + HARDENED (hybrid per-kind DONE)

**Status:** Wired end-to-end in v1.6.2; the **hybrid per-kind signing model is DONE in v1.7.0** (staged). The interim "secret-auth then auto-sign-anything" is **removed**. The client/server work landed across commits `108488b` (Phase 2 end-to-end), `adb9443` (server mode), `1810a3e` (Bunker URL card); the hardening landed in `0970fbe` (per-connection + per-kind default-deny).

### What's actually built
- **Client mode** (`src/utilities/nip46.js`, 537 LOC) — connect *to* a remote nsecBunker via NIP-46. UI: the **Bunker Connection** panel + **nsecBunker Profiles** in `full_settings.html`; bunker URL form (`bunker://<pubkey>?relay=...&secret=...`).
- **Server mode** (`src/utilities/bunker-server.js`, 254 LOC) — the extension *is* the bunker. Subscribes for kind-24133 requests tagged to the user's pubkey, derives the NIP-44 conversation key, decrypts, dispatches `connect` / `get_public_key` / `sign_event` / `nip44_encrypt`, signs with `finalizeEvent`, encrypts + returns. Rejects unauthenticated clients for everything except `connect`.
- **UI surface** — bunker status indicator in `popup.html`, Bunker URL card in the Apps tab (sidepanel).

### The relay model (one Worker, two hostnames)
The bunker defaults to **`wss://relay.nostrkey.com`**. That hostname and **`wss://relay.nostrkeep.app`** are routed by Cloudflare to the **same Worker** — one deployed relay, two brand faces (NostrKey front, NostrKeep backend). This is intentional, not a config drift: code can keep `relay.nostrkey.com` and docs should describe the dual-hostname routing rather than treat the two names as a conflict. Backend: `nostrkey.srvr.relay.src` (CF Workers + Durable Objects + D1; ambient usage, no event storage; forwards ephemeral NIP-46 events).

### Signing model — hybrid per-kind (DONE in v1.7.0)
The old model (secret-auth then auto-sign-anything) is **gone**. v1.7.0 ships the agreed **hybrid per-kind model**:
- [x] **Per-connection records** with **single-use secrets** — the shared `&secret=` is no longer a standing auth boundary.
- [x] **Default-deny per-kind allowlist** — a kind signs automatically only once the user has granted it; anything not granted **prompts** (Approve / Deny / Always-allow-this-kind).
- [x] **Verify-before-act + replay protection** on inbound requests.
- [x] Per-kind permissions surfaced in settings (view / revoke).
- [x] Public "remote signing" messaging now matches the implementation ("you approve each request / each kind").

### Other remaining nBunker work
- [ ] **Mirror the bunker UX to iOS and Android apps** (still open — the one genuinely unbuilt piece).
- [ ] Default-relay UX: make `relay.nostrkey.com` the visible default with an override field (the field exists; confirm the default + copy/QR for the bunker address).

> The hardened nBunker architecture is now **shipped in v1.7.0** (staged). Full design detail remains tracked **internally** (not enumerated in this public repo until the store release lands).

---

## 2.5 UX rethink — NEXT (research-backed)

**Status:** Next up after v1.7.0 ships. A research brief and visual direction are captured internally (Ableton/Massive-inspired "infrastructure instrument" look). The security hardening moved the invariants into place; this makes them legible and teachable to users.

- [ ] **Per-kind permissions done right** — a clear, non-scary UI for the default-deny per-kind allowlist (grant / revoke / "always allow this kind").
- [ ] **Show-the-event-before-signing** — render what's actually being signed, not just "an app wants to sign."
- [ ] **Guided NIP-06 / NIP-49 backup** — walk the user through seed-phrase and ncryptsec backup as a first-class flow, not a hidden setting.
- [ ] **L0–L3 progressive-security ladder** — surface the trust ladder (auto-key → app backup → bunker/vault) as a visible, opt-in progression.
- [ ] **Supply-chain hardening** — dependency provenance / pinning discipline as a shipped posture, surfaced in docs.
- [ ] **npub-poisoning detection** — warn on lookalike / substituted npubs before the user acts on them.
- [ ] **Visual direction** — "infrastructure instrument" aesthetic (Ableton/Massive-inspired) across the permission and backup surfaces.

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

- [x] **Dependency drift** — `package.json` now pins `nostr-crypto-utils@^0.8.0` (see §4 for the publish gate). Re-tested against the 236-test suite.
- [x] **Dependency freshening pass (2026-07-21)** — bumped `@scure/bip39` 2.0.1→2.2.0 (dedupes `@noble/hashes` to a single 2.2.0; BIP-39/NIP-06 vectors reverified), `vitest` 4.1.3→4.1.10 (**clears all 3 HIGH transitive `vite` advisories** — `npm audit` now reports **0 vulnerabilities**), plus `esbuild` 0.27→0.28.1, `@playwright/test` 1.59→1.61.1, `prettier` 3.3→3.9.6, `sharp` 0.34→0.35.3, `chrome-webstore-upload-cli` 3→4. CI moved to **Node 24** (`.nvmrc`) + latest action majors; the Ring-2 consent e2e now gates every push under `xvfb`. Verified 415 vitest + 5 Ring-2 e2e green. Crypto kernel confirmed at latest, no advisories. `chrome-webstore-upload-cli` v4 needs a real `PUBLISHER_ID` (Dev Dashboard) validated locally before the next store push.

### Tailwind CSS v3 → v4 migration (DEFERRED — do AFTER v1.8 ships to stores)

**Why deferred, not skipped:** `tailwindcss@3.4.19` is the **maintained v3-lts** (dist-tag `v3-lts`) with **no advisory** — none of the resolved audit vulns relate to it, so this is *not* a freshness/security gap. v4 is a full engine rewrite with broad UI-regression risk, and doing it immediately after the v1.8 "Instrument" redesign is the wrong time. Schedule it as its **own QA'd migration window once v1.8 is updated and launched successfully.**

**Migration checklist (each item is a real breaking change to handle):**
- [ ] **Build scripts (~10) break first.** v4 removed the `tailwindcss` bin; the CLI moved to a separate `@tailwindcss/cli` package. Every script that invokes bare `tailwindcss -i … -o …` (`build`, `build:prod`, `build:chrome[:prod]`, `build:firefox[:prod]`, `build:all[:prod]`, `watch-tailwind`) must switch to `@tailwindcss/cli` (or the Vite/PostCSS plugin).
- [ ] **CSS entry directives.** `src/options.css` lines 1–3 (`@tailwind base/components/utilities`) are removed in v4 → replace with `@import "tailwindcss";`.
- [ ] **JS config no longer auto-loaded.** v4 ignores `tailwind.config.js` unless you add `@config "…"` or migrate the theme to CSS-first `@theme`. Our config carries content globs, the monokai palette, and the deliberate **accessibility fontSize overrides** + custom spacing — all must be ported, or a11y contrast/sizing regresses.
- [ ] **Default-style shifts (Preflight).** border color `gray-200`→`currentColor`; ring `3px/blue`→`1px/currentColor`; revised placeholder + button-cursor defaults. These can visually regress the just-shipped Instrument UI across popup / sidepanel / full_settings — generated utilities are load-bearing (`flex`×57, `hidden`×46, `w-full`×37, …).
- [ ] **Browser floor rises** — v4 requires Safari 16.4+ / Chrome 111+ / Firefox 128+. Confirm acceptable for the store targets.
- [ ] **Build trust surface** — v4 adds the Rust `@tailwindcss/oxide` native engine; vet it (key-management project supply-chain discipline).
- [ ] **Process:** start with `npx @tailwindcss/upgrade`, then review **every** diff by hand and do a full visual QA pass in all three browsers. Never relax a CSS-dependent e2e assertion to force styling green.
- [ ] **gitignore hygiene** — add `test-results/` and `web-ext-artifacts/` to `.gitignore` (currently untracked build artifacts showing in the working tree). `distros/*.zip` is already ignored; the modified Chrome zips in the tree are timestamp-only build noise.
- [ ] **Retire `docs_project_info/TODO.md`** — it still says "submit v1.6.1 to stores," which shipped. Folded into this file / current store status; delete or stub it.

---

## 4. v1.7.0 release train

**Status:** v1.7.0 is **staged** on `fix/security-audit-2026-07` — built, tested (236, CI-gated), and committed, but **not yet pushed or submitted to the stores**.

- [ ] **Blocker: crypto dependency must publish first.** The plugin pins `nostr-crypto-utils@^0.8.0`, which is **staged, pending npm publish** (publish is OTP-gated). v1.7.0 cannot be built for submission until 0.8.0 is live on npm.
- [ ] Once 0.8.0 publishes: rebuild Chrome / Firefox / Safari and submit all three as one coordinated release.
- [ ] Publish the full v1.7.0 security notes alongside the store release (kept high-level in public docs until then).
