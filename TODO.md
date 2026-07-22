# NostrKey Browser Plugin — TODO

> **Where things stand (2026-07-22)**
> Live on the stores: **v1.6.2** (released 2026-04-07). Prepared next: **v1.8.0 — the "Instrument" release** on branch `feat/instrument-ux`, 427 tests + Ring-2 e2e, CI-gated, **0 audit vulns**. It bundles the staged security hardening (v1.7.0 never shipped publicly) *and* the full Instrument UX redesign into one coordinated cut.
> **v1.8.0 completes the hybrid per-kind nsecBunker** (§1), makes at-rest encryption the default, fixes NIP-06 seed import, and makes the invariants legible via the UX rethink (§2.5 — now LANDED, including npub-poisoning detection). Public security detail stays high-level until it ships to the stores (v1.6.2 is still the live version — see `nostrkey.bizdocs.src/security/release-safety-gate.md`, Category C).
> The big open *new* direction is the **HTTP-402 / NWC + Cashu** payments research (§2). Housekeeping in §3, release train in §4.

| Area | State |
|---|---|
| Core extension (NIP-07 signer, vault, profiles, sync) | **Shipped** v1.6.2 |
| nsecBunker remote signing (client + server) | **Shipped**; hybrid per-kind model **DONE** — see §1 |
| Security hardening + npub-poisoning guard | **Prepared** in v1.8.0 — crypto-dep blocker resolved, see §4 |
| UX rethink (per-kind UI, show-the-event, backup guidance, L0–L3 ladder, lookalike npubs) | **LANDED** in v1.8.0 — see §2.5 |
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

## 2.5 UX rethink — LANDED in v1.8.0 "Instrument"

**Status:** Built out on `feat/instrument-ux` and folded into the **v1.8.0** cut
(the "Instrument" redesign — Ableton/Massive-inspired). This is now a *release*,
not a plan. Reconciled against the branch 2026-07-22:

- [x] **Per-kind permissions done right** — appearance-aware signing-consent sheet + `src/permission/kind-labels.js` (human labels, risk tiers, per-kind warnings) + grant/revoke in settings.
- [x] **Show-the-event-before-signing** — `permission.js` renders the kind label, risk class, warnings, and event content; **unknown kinds are flagged loudly** ("signing something you cannot read").
- [x] **Guided NIP-06 / NIP-49 backup** — per-profile **Keys** feature-object (danger-confirmed nsec reveal) + **Seed phrase (BIP39)** feature-object (reveal / copy / import) + encrypted key backup + first-class **folder cloud-backup** (first-run offer, freshness nudge, recover-after-uninstall).
- [x] **L0–L3 progressive-security ladder** — the home **Security level** meter (L0 key → L1 backup → L2 lock → L3 bunker), visible and opt-in.
- [~] **Supply-chain hardening** — dependency posture done (all deps fresh, **0 audit vulns**, own-libs kernel, `nostr-tools` purged). *Still open:* surfacing that posture in public docs as a stated stance.
- [x] **npub-poisoning detection** — `src/utilities/npub-guard.js` + Manage Profiles **⚠ Lookalike** badge with full-npub disambiguation; the truncation-collision vector (bech32 has no homoglyphs) is detected before the user switches/deletes. 12 Ring-1 tests. *(commit `e2dfc34`)*
- [x] **Visual direction** — "infrastructure instrument" aesthetic shipped across popup / sidepanel / full_settings / permission surfaces.

*Follow-ups deferred past v1.8.0:* extend the lookalike guard to the bunker-connect / import entry points (currently the Manage-Profiles list is the guarded surface); mirror the bunker UX to iOS/Android (§1).

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

## 4. v1.8.0 release train

**Status:** v1.8.0 is **prepared** on `feat/instrument-ux` — built, tested (427 + Ring-2 e2e, CI-gated), version-bumped, and committed, but **not yet merged / pushed / submitted to the stores**. The former v1.7.0 crypto-dep blocker is **resolved** (`nostr-crypto-utils@^0.9.2` is live on npm, includes the NIP-04 shared-secret fix).

- [x] **Crypto dependency published.** `nostr-crypto-utils@0.9.2` live on npm; plugin pins `^0.9.2`.
- [x] **Version bumped** 1.7.0 → **1.8.0** across `package.json` + Safari/Chrome manifests.
- [x] **Feature reconciliation** — §2.5 security items verified landed (see above); the one gap (npub-poisoning) built.
- [ ] **Run the release-safety gate** (`nostrkey.bizdocs.src/security/release-safety-gate.md`) — store-submission first. *(automated scan run 2026-07-22: clean; re-run at submit.)*
- [ ] **App-store screenshots** — v1.8.0 store canvases (Console look), harness in `dev/design/store-canvas.html`. *(exact-size export path still being finalized.)*
- [ ] **Merge `feat/instrument-ux` → main**, rebuild Chrome / Firefox / Safari, submit all three as one coordinated release.
- [ ] Update `nostrkey.com` landing + FAQ (see `nostrkey.bizdocs.src/strategy/nostrkey-com-v1.8.0-launch-TODO.md`) and publish the security notes alongside the store release.
- [ ] Mark LIVE only once verified on each store (per `feedback_fix_live_snapshot`).
