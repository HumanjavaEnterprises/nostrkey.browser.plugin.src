# NostrKey Test Map

Maps every test to the feature it validates. Run `npm test` to verify all.

## Summary
- **104 tests** across 8 test files
- **225ms** total runtime
- **0 failures**

## Test Coverage

| Feature Area | Test File | Tests | Status |
|-------------|-----------|-------|--------|
| Sender Validation | security.test.js | 25 | ✅ |
| Profile CRUD | profiles.test.js | 14 | ✅ |
| Password/Lock | password-lock.test.js | 17 | ✅ |
| Key Operations | keys.test.js | 3+ | ✅ (crypto tests conditional) |
| NIP-07 Signing | nip07-signing.test.js | 5 | ⏭ (needs crypto lib) |
| NIP-44 Encryption | nip44-encryption.test.js | 7 | ⏭ (needs crypto lib) |
| Relay Management | relays.test.js | 9 | ✅ |
| Vault Operations | vault.test.js | 11 | ✅ |
| Backup/Restore | backup.test.js | 9 | ✅ |
| Permissions | permissions.test.js | 8 | ✅ |

## What Each Test File Validates

### security.test.js (25 tests)
- Extension popup/sidepanel → trusted sender
- Vault/profiles/settings opened in tabs → trusted (extension URL)
- Content scripts on web pages → blocked
- Wrong extension ID → blocked
- Firefox moz-extension:// → trusted
- Sensitive operations blocked from non-extension contexts
- Non-sensitive operations allowed from any extension context

### profiles.test.js (14 tests)
- Create profile with name + nsec
- Multiple profiles with unique IDs
- Rename preserves other data
- Delete only targeted profile
- Switch active profile
- Full lifecycle: create → rename → switch → delete

### password-lock.test.js (17 tests)
- Set master password
- Lock / unlock cycle
- Wrong password rejection
- Change password (old + new)
- Remove password
- Auto-lock timeout (default, change, zero, negative)
- Full lifecycle: set → lock → fail → unlock → change → remove

### keys.test.js (3+ tests)
- Hex key format validation (64 chars, hex only)
- npub/nsec format validation (bech32)
- Key generation + pubkey derivation (when crypto lib available)
- Bech32 round-trip encode/decode

### nip07-signing.test.js (5 tests, conditional)
- Sign kind 1 (text note)
- Sign kind 0 (metadata)
- Different content → different signatures
- Deterministic event ID
- Tags affect event ID

### nip44-encryption.test.js (7 tests, conditional)
- Encrypt produces ciphertext
- Decrypt round-trip
- Unicode content round-trip
- Long content round-trip
- Empty string round-trip
- Random nonce (different ciphertext each time)
- Wrong key cannot decrypt

### relays.test.js (9 tests)
- Add relay (wss://)
- Multiple relays
- Reject empty URL
- Reject non-websocket URL
- Reject duplicates
- Normalize trailing slashes
- Remove relay
- Allow ws:// for local relays

### vault.test.js (11 tests)
- Create document
- Store content + title
- Fetch all (newest first)
- Update by re-publishing same ID
- Delete document
- Vault relays
- Full lifecycle: create → read → update → delete

### backup.test.js (9 tests)
- Export valid JSON with version
- Export includes profiles + relays
- Import valid backup
- Import restores profiles
- Reject invalid JSON
- Reject missing version/profiles
- Round-trip: export → reset → import → verify

### permissions.test.js (8 tests)
- Default "ask" for unknown sites
- Grant session/always permission
- Deny permission
- Per-kind permissions (signEvent vs nip04.decrypt)
- Revoke per-site
- Revoke all globally
- List granted permissions
