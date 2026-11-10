# Changelog

All notable changes to the NostrKey browser extension are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [1.8.7]

**The "see it before you sign it" release.** NostrKey now tells you what a
change to your follows, mute list, relays or profile will do before you sign
it, and keeps earlier versions so you can put one back.

### Added
- **See what will change.** Before you sign a change to your follows, mute
  list, relay list or profile, the prompt says what it does in plain words,
  such as how many people it removes or which fields it clears. A big removal
  needs you to tick "I understand" first, even for a site you have allowed.
- **Saved versions and restore.** The History section of the profile page
  keeps earlier versions of your follows, mute list, relay list and profile on
  this device. Pick one to see what restoring it would change, then put it
  back.
- **Draft labels.** Saved drafts are named in the prompt, and signing one
  always asks.

### Changed
- **Sign-in checks.** NostrKey checks that sign-in requests are for the right
  place. A sign-in for another address names that address, and remembering it
  applies only to that address.
- **Remote apps get the same preview.** Apps connected through the remote
  signer see the same what-will-change description and the same tick.
- **Copied secrets clear after 60 seconds** while the page you copied from is
  open.

### Fixed
- Profile and list changes saved at the same moment no longer overwrite each
  other.
- A site that asks before NostrKey has an identity (right after install, or
  after Reset Everything) now gets a clear "not set up yet" answer, instead of
  a prompt that could not work.

### Security
- Updated the cryptography library NostrKey uses.

## [1.8.6]

**The "your profile, your sites" release.** Each identity now has its own
profile page, and the sites you trust are listed there with how long each
permission lasts.

### Added
- **A profile page for each identity.** See your public profile as your relays
  have it, with a status for each field: a check when it is confirmed, `?` while
  checking or unknown, `!` when a check fails. Your Nostr address, lightning
  address, picture and banner are checked for you.
- **Edit your profile safely.** Editing opens only once your relays have
  answered. Fields NostrKey does not show are kept, and if a newer profile turns
  up while you edit, NostrKey stops and shows it instead of overwriting it. You
  see how many relays accepted the save.
- **Connected sites.** The profile page lists the sites connected to that
  identity. For each action, choose Ask, Allow for 1 hour, 1 day, 30 days or
  forever, or Deny, and see how long is left. You can add a site by its address.
  The list applies to this device only.
- **Choose how long to remember an approval** right in the prompt. Reading
  messages and direct messages are remembered for at most 30 days.
- **Allow a site to delete media files.** From the connected sites list, a site
  can be allowed to delete files from a media server without asking. Without
  that, a delete always asks. Deleting notes always asks.
- **Lookalike key warning.** NostrKey warns before you add a key that reads
  like one you already have.
- **The iPhone, iPad and Mac app screen shows the installed version.**

### Changed
- **Auto-lock counts only your own actions.** Sites signing with a remembered
  permission no longer keep NostrKey unlocked. An open request holds the lock
  for at most 40 seconds past its time.
- **Removing a site asks first,** and the site leaves the list completely.
- **Sites get a clear error** when you deny a request ("NostrKey: request
  denied") or it times out ("NostrKey: request timed out"). If you build a
  site, make sure your calls handle a rejection.
- **An approval tab you are using stays open** until you answer or it times out.
- **Publishing reports each relay's answer.**
- **Key wording** now allows for encrypted sync and backup.
- **Remote signer default relay** is relay.nostrkey.com.

### Fixed
- Deleted vault items and API keys stay deleted after syncing from relays.
- Every short npub on screen is cut the same way, and long keys wrap in
  confirmation sheets so you can compare them in full.
- Your own relay list keeps working as typed, including home and self-hosted
  relays.
- The test page's Fire All runs each method in turn.

### Security
- Requests from NostrKey's own pages and from sites are kept apart more
  strictly, and remote signer answers are checked more closely.

### Notes
- Restoring from a backup file does not bring back media delete permissions;
  allow them again from the connected sites list.

## [1.8.5]

**The "remember this site" release.** Sites that upload media no longer have to
ask every time, and NostrKey now handles several requests at once without
tripping over itself.

### Added
- **Remember media uploads for a site.** When a site like Jumble asks to sign an
  upload, you can choose to remember it for that site, on this device, for this
  identity. Fetching and listing files can be remembered the same way. Deleting
  from a media server always asks.
- **Choose where approvals open.** Approvals appear on the page, and sensitive
  ones like deletes open in a tab. A new setting opens every approval in a tab
  if you prefer.
- **Prompts that are easier to read.** Media server requests now say what they
  do, how many files, which servers, and how long the request stays valid. Your
  media server list, comments, highlights, bookmarks and picture and video posts
  have plain labels too and can be remembered. The app list names each permission
  the same way.

### Changed
- **Tabs moved to the top.** Easier to reach on every device, including when the
  keyboard is open on iPhone.
- **Approve, Deny and Remember stay on screen** on smaller windows.
- **Delete and vanish requests open in their own tab,** so you can read them
  with nothing else around them.
- **Remembered sites are faster.** A site you have trusted no longer waits behind
  other prompts, and pasting several files works after you turn on Remember.
  There is still a limit per site. Before you turn it on, only five prompts can
  open in a minute, so paste one file first if you plan to paste many.
- **With a remote signer, remembered sites respect your lock.** If NostrKey is
  locked, it asks first, unless you have turned on access while locked.
- **Sites now get an error when a request fails.** A failed `window.nostr` call
  now rejects with an error instead of finishing with an error object as its
  answer. If you build a site, make sure your calls handle a rejection.

### Fixed
- **Auto-lock counts your activity.** Using NostrKey's own pages, declining a request
  and sites you have remembered signing now hold off auto-lock, as approving
  already did, so it no longer locks while you are working.
- **The API Keys page works again.**
- **API keys keep their secret across devices.** A device that cannot read a key
  no longer shares it, and an empty copy from a relay no longer replaces a good
  one.
- **The newest copy of a vault document wins** when relays hold more than one,
  and your API keys no longer show up as a vault document.
- **Reliability.** A malformed request now gets an error back, and requests are
  handled more reliably when several arrive at once.
- **Remember could fail silently** on a profile that arrived by sync. Fixed.
- **A page that cannot start now says so** instead of showing the lock screen.

### Security
- **Remote signer answers are checked.** NostrKey now checks each answer from a
  remote signer against what it asked for, and refuses anything else.
- **Remote signer connection strings are handled more carefully.** NostrKey no
  longer keeps the secret part of a connection string with your profile. Your
  existing connection keeps working. As good practice, we recommend creating a
  fresh connection string in your signer and reconnecting, then removing the old
  one. If you ever reconnect from the saved address, your signer may ask for a
  new string.

If you use a remote signer, remember that it has its own settings. NostrKey will
not ask, but your signer may.

## [1.8.4] - 2026-09-18

**The "deletes that stay deleted" release.** When you delete something it now
stays gone across all your devices, signing always uses the right key after you
remove a profile, and you can switch your active profile straight from the
manage list.

### Fixed
- **Deleted items no longer reappear on your other devices.** Deleting a vault
  note, a stored API key, or a whole profile could be undone when another of your
  devices synced back an older copy. Deletions are now recorded and carried
  across sync, so a delete stays a delete everywhere. Deletion history is kept so
  the record cannot be lost; NostrKey nudges you to trim it at 8 entries and more
  firmly at 16, with a one-tap "Clear deletion history".
- **The right key, every time, after deleting a profile.** Removing a profile
  from the middle of your list could, in rare cases, pair a signing request with
  a different identity's key. NostrKey now confirms the key belongs to the
  profile before it is ever used, and refuses rather than risk a mismatch.
- **A second device no longer locks itself out.** A synced field could make a
  freshly set-up device believe it needed a password it did not have. Fixed.

### Added
- **Switch your active profile from Manage Profiles.** Every non-active profile
  now has a "Make Active" button, so you can change identities without leaving
  the manage screen.

### Changed
- The automated suite grew to 632 tests, adding cross-device deletion journeys
  and delete-then-switch key-safety checks that drive the whole system the way a
  user would.

## [1.8.3] — 2026-08-13

**The "honest lock state" release.** The vault now tells the truth about every
state it can be in, and password changes can no longer silently orphan a key.

### Advisory — if you removed your master password on 1.8.1
Removing a master password on version 1.8.1 could leave some keys secured under
that old password while NostrKey reported no password was set. **Your keys were
never lost or exposed — they stayed encrypted the whole time.** This update
detects that state, says so plainly on every screen, and restores access when
you enter that old password once. If your lock screen mentions an old password,
that is this: enter it once and you are done.

### Fixed
- **A key protected by a different password is now reported, never silently
  stranded.** Removing or changing your master password used to quietly skip any
  key it could not open while the settings page claimed no password was set —
  the popover said Locked, settings said unencrypted, and both were half right.
  Now the skipped keys are counted and shown, the lock screen offers recovery
  with the old password, and every surface reads the same state.
- **Honest at-rest wording.** The passwordless tier was described as
  "unencrypted" — it never was. Keys without a master password are encrypted at
  rest with a device key, and every screen now says so.
- **iOS: the popup no longer clips off the right edge of the half-screen
  sheet.** The Add button and card borders were cut off on iPhone; the layout
  now fits the sheet exactly. Desktop popovers are unchanged.

### Changed
- Lock, unlock, and recovery states are covered by new permanent tests
  (588 total), including the cross-surface consistency the fix restores.

## [1.8.2] — 2026-08-13

**The "key integrity" release.** Fixes for how private keys are stored and
re-secured, found by hardening our own tests. If you have used NostrKey normally,
your keys are fine and updating is routine.

### Fixed
- **Removing your master password could leave your keys unopenable.** After
  removing a master password, keys were in some cases still secured with that
  password while the app reported none was set — so they could not be unlocked.
  Keys are now correctly re-secured to the passwordless tier during removal, and
  the same fix covers stored API keys and vault notes, not just identities.
- **If you already hit this on a previous version, your keys were never lost.**
  They remained encrypted with the password you removed. Open NostrKey and, if it
  detects this state, it will ask for that password once and restore access.
- Signing and decryption requests are reliably refused while the vault is locked.
- The vault key is fully cleared from memory the moment the vault locks.

### Changed
- Substantially expanded the automated test suite around key storage, master
  password handling, and cryptographic randomness, so a future regression in any
  of these is caught in CI rather than in the field.

## [1.8.1] — 2026-08-04

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
