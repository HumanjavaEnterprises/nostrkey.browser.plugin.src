# Changelog

All notable changes to the NostrKey browser extension are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [1.7.0] — Unreleased (staged)

**Security hardening release.**

Hardened key handling, at-rest encryption, and remote-signing (NIP-46) permissioning; fixed NIP-06 seed-phrase import; updated the crypto dependency. Full details will be published together with the store release.

- Hardened private-key handling.
- At-rest encryption is now the default for all secrets.
- Tightened remote-signing (NIP-46 / nsecBunker) permissioning — hybrid per-kind model.
- Fixed NIP-06 seed-phrase import (standard 12-word phrases now import correctly).
- Updated `nostr-crypto-utils` to 0.8.0.
- Test suite expanded to 236 tests; CI now runs them on every push.

> **Release note:** v1.7.0 is staged, not yet published to the stores. It depends on `nostr-crypto-utils@^0.8.0`, which must publish to npm before v1.7.0 can be built for store submission. The full security notes will accompany the store release.

## [1.6.2] — 2026-04-07

- Current published release across Chrome, Android, and Safari (macOS + iOS).
- NIP-07 signing, NIP-44 encryption, NIP-46 nsecBunker, NIP-49 export/import.
- Encrypted `.md` vault and API-key vault, multi-profile management, cross-device sync.
