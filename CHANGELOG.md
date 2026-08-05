# Changelog

All notable changes to the NostrKey browser extension are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [1.8.1] — Unreleased

**The "unlock integrity" release.** Reliability fixes for the encrypted vault,
found during pre-release testing of the Safari build.

### Fixed
- Keys created after a master password is set are now always wrapped under that
  password. Any key previously left wrapped under the device key is re-secured
  automatically on your next unlock.
- Unlocking is resilient: one unreadable profile no longer blocks the whole
  vault, and the affected profile is named instead of silently skipped.
- The vault no longer re-locks whenever the browser suspends the extension's
  background worker — your auto-lock timer is now the only thing that locks it.
- Device-key storage is persistent across restarts on iOS Safari.
- Unlock errors now show their real cause instead of a generic
  "Service worker not ready — try again."

### Security
- Message kinds that carry raw key material (save, seed-phrase, and ncryptsec
  operations) are now accepted from extension UI pages only.

## [1.8.0] — 2026-08-04

**The "Instrument" release.** A redesigned signing surface, a per-identity object
model, and folder-based backup — carried on top of the security hardening previously
staged as 1.7.0, which was never published. This is the first public release since
1.6.2, which is why there is no 1.7.0 in the stores.

### Signing you can actually read
- Every signing request shows the app, the action in plain language ("Publish a note",
  "⚠ Replace your follow list"), and the full event — before you approve.
- Requests for kinds we can't label are flagged loudly rather than passed through
  silently.
- The consent prompt appears in-page, matches your chosen appearance, and
  auto-declines after 40 seconds if you don't answer.

### One identity, everything it needs
- Per-profile object model — keys, relays, permissions, and bunker settings now live
  on each identity instead of in scattered global settings.
- Permissions are granted per app and per action, and can be reviewed or revoked from
  settings.
- A security-level meter on the home screen shows where you stand (key → backup →
  lock → bunker) and what the next step is, if you want it.

### Backup and recovery
- Folder-based cloud backup with a first-run offer, a freshness nudge, and recovery
  after uninstall.
- Guided BIP-39 seed phrase and encrypted key backup, with reveal gated behind an
  explicit confirmation.

### Look and accessibility
- Three looks — Console, Instrument, Analog — each in light, dark, or system.
- Text size, contrast, density, and reduced-motion controls.

### Identity safety
- Profiles whose npubs look alike at a glance are flagged with a warning badge and
  shown in full, so you can tell them apart before switching or deleting one.

### Under the hood
- Hardened private-key handling; at-rest encryption is now the default for all secrets.
- Remote signing (NIP-46 / nsecBunker) uses per-connection records with single-use
  secrets, and asks before signing a kind you haven't already granted.
- Inbound remote-signing requests are verified before they are acted on.
- Fixed NIP-06 seed-phrase import — standard 12-word phrases now import correctly.
- Updated `nostr-crypto-utils` to 0.9.x.
- Covered by an automated test suite that runs in CI on every push.

> **Note on 1.7.0.** The security hardening in this release was staged as 1.7.0 and
> held back pending a crypto-dependency publish. It was never shipped to any store;
> its contents ship here. Detailed security notes are published alongside the store
> release, once the update is available to users.

## [1.6.2] — 2026-04-07

- Current published release across Chrome, Android, and Safari (macOS + iOS).
- NIP-07 signing, NIP-44 encryption, NIP-46 nsecBunker, NIP-49 export/import.
- Encrypted `.md` vault and API-key vault, multi-profile management, cross-device sync.
