# NostrKey TODO

## Immediate — Submit v1.6.1 to Stores

Store credentials are on the desktop machine (.env). Submit from there.

- [ ] **Chrome Web Store** — upload `distros/nostrkey-chrome-v1.6.1.zip` via developer dashboard or API
- [ ] **Firefox Add-ons** — upload `distros/nostrkey-firefox-v1.6.1.zip` via developer hub or API
- [ ] **Safari / Mac App Store** — build via Xcode, archive, upload via Xcode Organizer. Xcode Cloud auto-triggers on push if configured.

### v1.6.1 Changelog (for store listing)
- Fixed: duplicate profile creation when rapidly clicking save
- Fixed: profiles with the same key are now automatically cleaned up
- New: delete profiles directly from the profile view screen
- New: Manage Profiles page (Settings > Profiles) with multi-select bulk delete
- Improved: first-unlock message explains why password is needed
- Security: brute-force protection on unlock (cooldown after 3 failed attempts)
- Security: rate limiting on permission requests per website (prevents spam)
