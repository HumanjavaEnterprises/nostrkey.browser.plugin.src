# NostrKey Test Map

Maps every test file to the feature it validates. Run `npm test` to verify the
whole suite; CI runs it on every push and gates the build on a green run.

## Unit / functional suite (`test/*.test.js`)

| Feature area | Test file | What it validates |
|---|---|---|
| Trusted-sender validation | `security.test.js` | Extension surfaces trusted; content scripts / wrong extension IDs blocked; sensitive ops refused from non-extension contexts |
| Security boundaries | `security-boundary.test.js` | Cross-context isolation — privileged operations cannot be reached from untrusted origins |
| Profile CRUD | `profiles.test.js` | Create / rename / switch / delete; unique IDs; full lifecycle |
| Master password & lock | `password-lock.test.js` | Set / lock / unlock / change / remove; wrong-password rejection; auto-lock timeout |
| Encrypted-at-rest storage | `storage-at-rest.test.js` | Keys wrapped at rest; nothing sensitive stored in plaintext |
| Key operations | `keys.test.js` | Hex + bech32 (npub/nsec) validation; key generation + pubkey derivation; bech32 round-trip |
| Seed phrases (BIP-39) | `seed-phrases.test.js` | Mnemonic generation / import / round-trip |
| Seed derivation (NIP-06) | `seedphrase-nip06.test.js` | NIP-06 account derivation from a seed |
| ncryptsec (NIP-49) | `ncryptsec.test.js` | Password-encrypted private-key format |
| NIP-07 signing | `nip07-signing.test.js` | Sign kinds 0/1; deterministic event id; tags affect id |
| NIP-04 encryption | `nip04-encryption.test.js` | Legacy (deprecated) encrypt/decrypt round-trip |
| NIP-44 encryption | `nip44-encryption.test.js` | ChaCha20-Poly1305 encrypt/decrypt; unicode / long / empty; random nonce; wrong-key rejection |
| Relay management | `relays.test.js` | Add / remove; scheme validation; dedupe; trailing-slash normalization; local `ws://` allowed |
| Per-site / per-kind permissions | `permissions.test.js` | Default-ask; grant session/always; deny; per-kind grants; revoke per-site / globally |
| Consent overlay (ins-confirm) | `consent-ins-confirm.test.js` | **Real import** of `src/ins-confirm.js` in jsdom — sheet-vs-popover proportionality, destructive `alertdialog` + Cancel-first focus, exact per-path dismissal return values, focus trap/restore, textContent-only (XSS-safe) render, queue serialization, reduced-motion synchronous teardown |
| Kind/method readout tiers | `consent-kind-tiers.test.js` | **Real import** of `src/permission/kind-labels.js` — consequence-first labels (no "kind N"), Tier-B non-rememberable gate, loud unknown-kind decode warning |
| Signing-approval readout logic | `consent-readout-logic.test.js` | **Logic-mirror** (helpers copied verbatim from `permission.js` w/ cited line ranges) — bunker-claim parse, timestamp skew/suspicious flag, decode-error danger object. Mirror of the pure helpers, not the live DOM readout |
| Auto-decline countdown math | `consent-countdown.test.js` | **Logic-mirror** of `startCountdown`/`tick` (`permission.js`) driven with fake timers over the real element ids — deadline-based readout stays correct across minimize→reopen |
| Background prompt lifecycle | `consent-prompt-timer.test.js` | **Logic-mirror** of `background.js` prompt fns (verbatim, cited) — forged-UUID poisoning guard, pending-queue accounting (no silent drop), 40s fail-closed auto-decline. Mirror, not the live service worker |
| Locked-vault request gate | `consent-locked-state.test.js` | **Logic-mirror** of the `ask()` lock gate (`background.js`) with injected deps — read-only bypass, bunker skip, needs-private-key branch, fail-closed `validations` delete, locked-sheet dispatch |
| Redress suppression predicate | `consent-redress-predicate.test.js` | **Logic-mirror** of the `styleSuppresses` decision table (`content.js`, verbatim) over synthetic computed-styles — which CSS props count as suppression evidence. Does NOT prove real compositing/occlusion (that is Ring-2 e2e / Ring-3 manual) |
| Consent trust-boundary wiring | `consent-guard-wiring.test.js` | **Source-assertion** (reads `content.js`/`background.js`/`permission.js` text) — verifies the guards still exist (closed shadow root, `!important` z-index pin, MutationObserver, cross-origin iframe isolation, timeout arming). Asserts wiring is present; does NOT execute it |
| NIP-46 bunker | `bunker.test.js` | Remote-signer client flow (connect, sign requests) |
| NIP-46 bunker security | `bunker-security.test.js` | Per-connection records, single-use secrets, default-deny per-kind allowlist, verify-before-act |
| Vault docs (NIP-78) | `vault.test.js` | Create / read / update / delete; newest-first; vault relays; lifecycle |
| API-key vault | `apikeys.test.js` | Store / fetch / update API secrets (ciphertext at rest) |
| Backup / restore (file) | `backup.test.js` | Encrypted export + import round-trip; version/format validation |
| Folder cloud-backup — engine | `cloud-backup.test.js` | Enable/disable, debounced auto-save, freshness/dirty, restore via `backup.import` (CB-##) |
| Folder cloud-backup — shim | `folder-target.test.js` | Per-browser target: File System Access API path + Save/Open-file fallback; permission re-grant |
| Settings | `settings.test.js` | Settings read/write behavior |
| Settings persistence | `settings-persistence.test.js` | Appearance + accessibility prefs save/recover (real `a11y.js`, jsdom) |
| Reset / wipe | `reset-data.test.js` | Full data reset returns the extension to a clean first-run state |

Fixtures: `test/vectors/` (nostr test vectors), `test/helpers/` (fake `chrome` harness).

## Cross-browser end-to-end (`test/e2e/`)

Real-browser harnesses that load the actual extension / real engine. See
[`e2e/CROSS-BROWSER.md`](e2e/CROSS-BROWSER.md) for the coverage matrix and run commands.

| Target | Harness |
|---|---|
| Chrome | `extension.spec.js`, `settings-persistence.spec.js` (Playwright, real extension) |
| Chrome — consent surface | `consent-redress.e2e.spec.js`, `consent-sheet-lifecycle.e2e.spec.js` (Playwright, real extension) |
| Firefox | `firefox-settings.mjs` (Selenium + geckodriver, headless) |
| Safari (macOS / WebKit) | `safari-settings.mjs` + `safari-harness.html` (safaridriver) |

**Consent-surface Ring-2 (`consent-*.e2e.spec.js`)** — the properties jsdom cannot prove,
run against the real extension in Chromium (helper: `e2e/helpers/consent-harness.js`, seeds a
disposable demo profile via the service worker):
- **CS-15 redress** — re-parenting the injected consent host under a near-transparent filter
  group trips the fail-closed guard: the in-page sheet is destroyed, the request escalates to a
  redress-immune tab, and **no signature is produced** by the attack. A source-mutation check
  (guard disabled → this test fails) confirms it is load-bearing, not incidental.
- **CS-16** — the real consent frame is extension-origin; a page-drawn lookalike button cannot sign.
- **CS-03 / CS-04** — Minimize and a backdrop click collapse the sheet to the FAB with the request
  **still pending** (never approve/deny); the FAB re-opens it and it can still be approved.
- **baseline** — a real Approve inside the extension iframe signs (id + BIP-340 sig), which also
  exercises the live `isExtensionSender(sender.url)` path that jsdom cannot reach.

Run: `npx playwright test test/e2e/consent-*.e2e.spec.js` (headed — needs a display).
