# NostrKey Test Map

Maps every test file to the feature it validates. Run `npm test` to verify the
whole suite; CI runs it on every push and gates the build on a green run.

## Unit / functional suite (`test/*.test.js`)

| Feature area | Test file | What it validates |
|---|---|---|
| Trusted-sender validation | `sender-gate.test.js`, `ios-sender-gate.test.js` | **Real worker** — every kind in the worker's switch, unless named as open, answers only our own surfaces on Chrome and Firefox: a tab, a page with no tab, the consent sheet framed in a website. Content scripts, other extensions, other extension origins, a tab reported as ours and a look-alike origin are turned away. New-vault `setPassword` on the iOS `browser` namespace |
| Request origin | `sender-origin.test.js` | **Real worker** — a request belongs to the origin the browser reports for its sender, on engines that state an origin and on those that give only a frame address; grants and refusals of any other origin do not apply; a bare-host grant from an older version still works; a sender with no origin is answered and nothing is shown |
| Security boundaries | `security-boundary.test.js` | **Source-assertion** — profile export and bunker server controls are out of the page API and the content-script allowlist and on the gate's list; consent runs inside the extension frame; the permission store writes only for a live request; injected overlays are isolated; page-world messages are source-checked and token-bound |
| Content script messages | `content-messages.test.js` | **Real** `content.js` in jsdom — a page message from its own window reaches the worker with its origin; one from another window, from none, or of a kind off the list does not |
| Page allowlist | `page-allowlist.test.js` | **Source-assertion** — the content-script allowlist equals its nine `window.nostr` kinds, compared whole |
| Master password & lock | `password-lock.test.js` | Set / lock / unlock / change / remove; wrong-password rejection; auto-lock timeout |
| Encrypted-at-rest storage | `storage-at-rest.test.js` | Keys wrapped at rest; nothing sensitive stored in plaintext |
| Key operations | `keys.test.js` | Hex + bech32 (npub/nsec) validation; key generation + pubkey derivation; bech32 round-trip |
| Seed phrases (BIP-39) | `seed-phrases.test.js` | **Real worker** — `seedPhrase.validate` (checksum, wordlist, length, case and spacing); a key written as words comes back through the legacy reading; a remote signer profile has none to write out |
| Seed derivation (NIP-06) | `seedphrase-nip06.test.js` | **Real** `seedphrase.js` — NIP-06 vectors; legacy entropy-as-key recovery |
| ncryptsec (NIP-49) | `ncryptsec.test.js` | **Real worker** — opens the spec's worked example; only the sealing password opens a key; a remote signer profile has none to seal |
| NIP-07 signing | `nip07-signing.test.js` | **Real** `finalizeEvent`, against shared vectors: kinds 0 and 1 kept, deterministic event id, tags bound into the id, a changed event fails verification |
| NIP-04 encryption | `nip04-encryption.test.js` | **Real worker** — opens a fixed ciphertext; both directions against independent AES-256-CBC from `node:crypto` |
| NIP-44 encryption | `nip44-encryption.test.js` | **Real** `nip44` against the official vectors: conversation key, encrypt/decrypt byte-exact, padded length, and an exchange between two parties |
| Relay management | `relays.test.js` | **Real worker** — `addRelay`/`getRelays` under a grant: wss only, a repeat add is a success that stores nothing new, URLs stored as the parser writes them |
| Per-site / per-kind grants | `grants-worker.test.js` | **Real worker** — no grant prompts; allow signs and deny declines with no prompt; kinds, origins and profiles stay separate; legacy bare-host grant; remember writes; list and revoke; the 5/60 s and 5/10 s prompt limits; granted requests answered at once beside an open prompt; the grant limit; allows never acted on, at both reads and on restore, while a stored deny stands; grants while locked; signing-while-locked after a restore |
| Set a grant | `set-permission-index.test.js` | **Real** `setPermission`: explicit profile index, a profile with no `hosts` map, a missing index |
| API keys across devices | `api-key-relay.test.js` | Real store and real page on two devices: only readable keys go to the relay, and an import with no usable secret leaves the stored one alone |
| Vault document names | `vault-reserved-name.test.js` | Real page and store: the API key store's name cannot be saved as a document, and an older stored copy is not listed |
| Pages when the worker refuses | `page-gate.test.js` | Each real page shows one plain error for a refused first question, and normal locked and open states are unchanged |
| Vault and API keys | `vault-worker.test.js` | **Real worker**, relay stand-in and fake signer — what is published (kind, address, seal, signature), read back and deleted, on local and remote signer profiles; a signer that changes the kind publishes nothing; nothing opens while locked; `apikeys.encrypt` and `apikeys.decrypt` round trip; a remote signer profile hands back no private key; `saveProfileName` |
| Request robustness | `consent-worker-robustness.test.js` | **Real worker** — every malformed request is answered and later requests still run; a request past the 2 MiB sanity limit is refused, and signs under a grant; a sheet that never reports ready moves to a tab once, and a surface that still does not is declined and the queue moves on; a prompt that cannot open; queue numbers after early exits; background restart mid-prompt; a sync-adopted profile can remember a site |
| Worker log | `log-redaction.test.js` | **Real worker** — a message carrying a connection string, seed phrase or key is logged by kind only; encryption requests are logged without their text |
| Page API | `page-api.test.js` | **Real** `src/nostr.js`: every method rejects on a reply carrying an error, with a fixed message and code; other replies resolve unchanged; how long a page waits |
| Release version sync | `version-sync.test.js` | package.json, lockfile (both spots), 4 manifests and all 8 Xcode `MARKETING_VERSION` entries agree |
| Consent overlay (ins-confirm) | `consent-ins-confirm.test.js` | **Real import** of `src/ins-confirm.js` in jsdom — sheet-vs-popover proportionality, destructive `alertdialog` + Cancel-first focus, exact per-path dismissal return values, focus trap/restore, textContent-only (XSS-safe) render, queue serialization, reduced-motion synchronous teardown |
| Kind/method readout tiers | `consent-kind-tiers.test.js` | **Real import** of `src/permission/kind-labels.js` — consequence-first labels (no "kind N"), Tier-B non-rememberable gate, loud unknown-kind decode warning |
| Signing-approval readout | `consent-readout-logic.test.js` | **Real permission page** in jsdom — the remote-client chip and warning, far-off timestamps, an undecodable event, the 400-character preview and its empty and non-text states |
| Auto-decline countdown | `consent-countdown.test.js` | **Real permission page** with fake timers — counts to the worker's deadline across a reopen, turns urgent at 10 s, rounds up, and at the deadline reads Expired and takes Approve away |
| Background prompt lifecycle | `consent-prompt-timer.test.js` | **Real worker** — unknown-uuid postbacks write nothing, queue numbers (no silent drop), fail-closed auto-decline and re-arm on escalation, plus source pins for the countdown URL; the page's wait covers the queue, a prompt moved to a tab and a remote signer; a request that waited too long for its turn is answered, not shown |
| Locked-vault request gate | `locked-gate-e2e.test.js` | **Real worker** — key-bearing requests refused while locked, grants do not outrank the lock, read-only requests still answered, remote-signer skip, `nostrAccessWhileLocked`, locked-sheet dispatch |
| Redress suppression predicate | `consent-redress-predicate.test.js` | The shipped `styleSuppresses` taken from `content.js` source and run over plain computed-style objects: which CSS properties count. Not real compositing; the browser half is `consent-redress.e2e.spec.js` |
| Consent trust-boundary wiring | `consent-guard-wiring.test.js` | **Source-assertion** (reads `content.js`/`background.js`/`permission.js` text) — verifies the guards still exist (closed shadow root, `!important` z-index pin, MutationObserver, cross-origin iframe isolation, timeout arming). Asserts wiring is present; does NOT execute it |
| Bunker URL check | `bunker.test.js` | **Real worker** — `bunker.validateUrl` accepts and refuses with the reason; a profile that never connected has no session |
| Prompt ownership | `consent-prompt-lifecycle.test.js` | **Real worker** — allowed, denied, close, timer and dead tabs act only on the open prompt; an unknown uuid does not release; closing a prompt declines it; a remember write finishes first; inbound approvals follow the same rules; a request that waited follows a stored deny, the lock rule of the active profile, and frees the queue on failure |
| Permission page | `permission-page.test.js` | The real page and HTML in jsdom — Remember follows the worker's answer; a media server request's action, identity, file count, servers and time left; a delete stays red, always asks, and its warning sits with the decision; a request that fails a rule but names delete is still red; a request the page cannot draw still has a live Deny; a request the worker no longer has shows as ended, with no Approve; direction controls drawn as marks and blank runs cut down in the preview and raw JSON; the rule a request failed; remote signer, lock and inbound notes |
| Grant labels | `grant-labels.test.js` | How a stored grant reads and which are red, for every Blossom action and kinds 13, 14 and 1059 |
| Sheet visibility | `sheet-visibility.test.js` | The rules for the browser's in-view reports: held from the start, let go after a quiet time, held at once on losing view, moved to a tab if out of view too long; nothing changes where the browser has no such report |
| What a prompt is told | `consent-prompt-query.test.js` | **Real worker** — the key, whether it can be remembered and the identity go to the page in the query; the query holds no part of the request, and the page reads the event back by uuid from extension pages only, and only while its prompt is open; a delete, erase or media server delete opens in a tab and never on the page |
| Held requests | `consent-held-request.test.js` | **Real worker** — a prompt acts on the worker's record, not on fields in the answer; what may not be remembered writes nothing; a choice lands on the identity shown; nothing stays held after any exit |
| Blossom upload journey | `journey-blossom-upload.test.js` | **Ring 2.5, real worker + fake signer** — first paste asks, later pastes do not, each goes to the signer; same on a sync-adopted profile with a stored session |
| Request rules | `consent-policy.test.js` | Reading a Blossom authorization (real client shapes, refused shapes, time window), grant keys, the literal lists of what may be remembered, kind labels, how a stored answer reads in the list |
| Remote signer identity | `bunker-identity-binding.test.js` | **Real worker + fake signer** — a session stays with its profile when another is removed, a signature from any other key is an error, a session for another identity is not used; grants clear when a profile's identity changes and stay with the same one; a burst opens one session, and a late open replaces nothing; a connect stops if its profile moves or goes, and keeps nothing; only a valid key from the signer is accepted, and stored keys compare in either case; sessions and unlocked keys stay with their profiles when a sync removes or moves profiles; a stored session learns its identity once, and keeps it; closing a session answers what was waiting on it |
| Remote signer tidying | `signer-answer-shapes.test.js` | The event shapes real signers return (hashtags, mentions, generated `d`, `client`, reset time on replaceable kinds) are accepted; anything else is refused; kinds whose tags are a permission, proof or payment come back exactly |
| Remote signer answers | `remote-signer-answers.test.js` | **Real worker + fake signer** — an answer must be validly signed and be the event asked for before it reaches the site or the event history, which get it as signed; a signer's own time is bounded; a local profile signs as itself; vault and API key publishes and deletes hold to the same checks |
| Which identity answers | `identity-binding.test.js` | **Real worker** — a grant or prompt answers as its own identity or not at all; the active profile is moved before every storage read of the granted, waited and prompted paths; a token that runs out while waiting asks; a prompt shown while locked answers once unlocked, only as the profile it was shown for |
| NostrKey as a remote signer | `bunker-server-identity.test.js` | **Real worker + real server, stand-in relay and client** — serves the identity it started for, whatever pubkey the client's event names; stops after a switch or key change, and status, connections and revoke say so; an approval that waited through a switch is declined with no prompt; a new start replaces the running server |
| Remote signer address | `bunker-url-storage.test.js`, `bunker-panel.test.js` | **Real worker + fake signer** — a profile keeps only the signer's address across connect, startup, sync, merge, backup and restore; a stored session keeps signing |
| NIP-46 bunker security | `bunker-security.test.js` | Per-connection records, single-use secrets, default-deny per-kind allowlist, verify-before-act |
| Vault docs (NIP-78) | `vault.test.js` | **Real** `vault-store.js` — create / read / update / delete; newest-first; vault relays |
| Backup / restore (file) | `backup.test.js` | **Real worker** — export needs an unlocked session and is sealed; import restores onto a wiped extension; a wrong password changes nothing; format and version refused; access while locked stays off |
| Folder cloud-backup — engine | `cloud-backup.test.js` | Engine alone, with the extension API and folder target stood in for: enable/disable, debounced auto-save, freshness/dirty, restore through `backup.import` |
| Folder cloud-backup — shim | `folder-target.test.js` | Per-browser target: File System Access API path + Save/Open-file fallback; permission re-grant |
| Settings | `settings.test.js` | **Real worker** — safe defaults before and after startup, frame blocking and access while locked persist, turning access off while locked drops the keys, the auto-lock window drives the alarm |
| Crypto properties | `crypto-properties.test.js` | **Real** `crypto.js` — PBKDF2 work factor, key extractability opt-in, a fresh IV and salt per blob, password compare on decoded bytes |
| Device-key tier | `device-key-strategy.test.js` | **Real** `secret-vault` and worker — a new key never lands on IndexedDB, the strategy is sticky, decrypt falls back both ways, reset drops memoised handles, Safari, adopting a seed from another context, the at-rest move off a legacy key |
| Session vault | `session-vault.test.js` | **Real worker** — a password vault never holds a device blob, one damaged blob does not fail an unlock, self-heal, the session survives a worker restart, real errors reach the caller, `savePrivateKey` and key-material kinds stay on the gate |
| Worker restarts | `lifecycle-reincarnation.test.js` | **Real worker** killed and reborn over the same storage, with whole-vault invariants checked after every life |
| Storage regressions | `security-regressions.test.js` | **Real** storage modules and worker — removing a password leaves device blobs, setting one does not double-wrap, a stale encrypted flag, API-key imports never store plain secrets, a session past its auto-lock deadline, reads refused once locked |
| Stale key cache | `getplaintextprivkey-stale-cache.test.js` | **Real worker** — a restored backup gets its pubKeys back, so a cached key from a shifted index is refused |
| Active profile | `active-profile-switch.test.js` | **Real** `utils.js` — switching the active profile |
| Sync merge | `sync-merge.test.js` | **Real** `sync-manager` and stores — tombstones for docs, keys and profiles, what a push suppresses, a newer recreate survives |
| Npub guard | `npub-guard.test.js` | **Real import** — different keys that read the same once truncated are found, one to one and across a list |
| Test harness | `fake-chrome-contract.test.js` | The fake `chrome` itself behaves like the browser where the suites rely on it |
| Settings persistence | `settings-persistence.test.js` | Appearance + accessibility prefs save/recover (real `a11y.js`, jsdom) |
| Reset / wipe | `reset-data.test.js` | **Real worker** — storage back to a first run, no password asked, decrypted keys and the session key gone, security settings back to defaults, websites turned away |

Fixtures: `test/vectors/` (nostr test vectors), `test/helpers/` (fake `chrome` harness; `boot-worker.js` boots the real background worker on it; `permission-page.js` opens the real permission page in jsdom).

## Cross-browser end-to-end (`test/e2e/`)

Real-browser harnesses that load the actual extension / real engine. See
[`e2e/CROSS-BROWSER.md`](e2e/CROSS-BROWSER.md) for the coverage matrix and run commands.

| Target | Harness |
|---|---|
| Chrome | `extension.spec.js`, `settings-persistence.spec.js` (Playwright, real extension) |
| Chrome — key and vault pages | `key-and-vault-pages.e2e.spec.js` (Playwright, real extension, relay stand-in in the worker): a private key shown in the side panel and key page; vault and API keys saved, read back and deleted with the events checked; every page and the framed sheet answered; frames carry no `window.nostr`; the origin Chromium reports |
| Chrome — tab bar | `sidepanel-tabs.e2e.spec.js` (Playwright, real extension): first child and top of the view, focus order, phone widths with touch emulation, a stand-in keyboard |
| Chrome — consent surface | `consent-redress.e2e.spec.js`, `consent-sheet-lifecycle.e2e.spec.js`, `consent-surface.e2e.spec.js`, `consent-failures.e2e.spec.js`, `consent-address.e2e.spec.js`, `grant-list.e2e.spec.js` (Playwright, real extension) |
| Firefox | `firefox-settings.mjs` (Selenium + geckodriver, headless) |
| Safari (macOS / WebKit) | `safari-settings.mjs` + `safari-harness.html` (safaridriver) |

**Consent-surface Ring-2 (`consent-*.e2e.spec.js`)** — the properties jsdom cannot prove,
run against the real extension in Chromium (helper: `e2e/helpers/consent-harness.js`, seeds a
disposable demo profile via the service worker):
- **Surface guard** — when the injected consent host stops being plainly visible, the fail-closed
  guard trips: the in-page sheet is destroyed, the request moves to a tab, and no
  signature is produced. With the guard disabled in source this test fails.
- **Frame origin** — the real consent frame is extension-origin; a button drawn by the page cannot sign.
- **Minimize** — Minimize and a backdrop click collapse the sheet to the FAB with the request
  **still pending** (never approve/deny); the FAB re-opens it and it can still be approved.
- **baseline** — a real Approve inside the extension iframe signs (id + BIP-340 sig), which also
  exercises the live `isExtensionSender(sender.url)` path that jsdom cannot reach.

Run: `npx playwright test test/e2e/consent-*.e2e.spec.js` (headed — needs a display).
