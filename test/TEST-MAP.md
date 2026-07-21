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
| Firefox | `firefox-settings.mjs` (Selenium + geckodriver, headless) |
| Safari (macOS / WebKit) | `safari-settings.mjs` + `safari-harness.html` (safaridriver) |
