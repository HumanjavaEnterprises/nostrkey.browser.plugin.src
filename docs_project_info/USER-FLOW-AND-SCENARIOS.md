# NostrKey User Flows and Scenarios

This document captures the key user flows, scenarios, and security model for the NostrKey browser extension.

---

## Security Model Overview

### What Requires Unlocking?

| Action | Requires Master Password? |
|--------|---------------------------|
| View profile names | No |
| Rename profile (e.g., "Alice" → "Alicia") | No |
| View npub (public key) | No (cached on profile) |
| View/copy nsec (private key) | **Yes** |
| Sign events | **Yes** |
| Encrypt/decrypt messages (NIP-04, NIP-44) | **Yes** |
| Access Vault features | **Yes** |
| Access API Keys | **Yes** |
| Add/remove relays | No |
| View permissions | No |

### Data Storage

- **Profile names**: Stored in plaintext (metadata, not sensitive)
- **Public keys (npub)**: Cached on profile for access when locked
- **Private keys (nsec)**: Encrypted with master password when encryption is enabled
- **Vault data**: Requires master password to access
- **API keys**: Requires master password to access

---

## Extension States

### 1. Fresh Install (No Master Password)

**Sidepanel shows:**
- **"Secure Your Vault" card** with lock icon and two stacked buttons:
  - **Check for Existing Vault** — deep-scans storage for encrypted data (useful after extension reload)
  - **Create New Vault & Password** — opens security.html to set a master password
- Profile list with "Default Nostr Profile"
- No lock button visible
- Vault tab shows "Set a master password" prompt

**User can:**
- Create/edit profiles
- Add private keys (stored in plaintext)
- Use signing features
- Configure relays

**Security note:** Private keys are stored in plaintext in browser storage until a master password is set. The vault status card encourages users to either set a master password or check for an existing encrypted vault.

### 2. Master Password Set + Unlocked

**Sidepanel shows:**
- Profile list
- Lock button visible (top right)
- Vault tab shows vault features (Encrypted Vault, API Keys)

**User can:**
- All features available
- View/copy private keys
- Access vault
- Lock extension manually

### 3. Master Password Set + Locked

**Sidepanel shows:**
- Full-screen unlock form with password input
- "Forgot password? Start fresh" option

**Vault tab shows:**
- "Vault Locked" message
- Inline unlock form with password input
- Can unlock directly from vault tab

**User can:**
- View profile names (metadata only)
- View npub (public key)
- Cannot access private keys or sign events

---

## User Scenarios

### Scenario 1: First-Time Setup

1. User installs extension
2. Opens sidepanel → sees "Default Nostr Profile"
3. Can immediately start using with a generated key
4. No master password required initially

### Scenario 2: Setting Master Password

1. User goes to Settings → Security (or Vault tab → "Set Master Password")
2. Opens security.html page
3. Enters new password (min 8 characters)
4. Confirms password
5. Keys are encrypted, user is automatically unlocked
6. Vault tab now shows vault features
7. Lock button appears in sidepanel

### Scenario 3: Using the Extension While Locked

1. User has master password set
2. Extension auto-locks after inactivity (or manual lock)
3. User opens sidepanel → sees unlock screen
4. OR user navigates to Vault tab → sees inline unlock form
5. User enters password → extension unlocks
6. All features available again

### Scenario 4: Renaming a Profile

1. User selects profile "Alice" in sidepanel
2. Clicks to edit profile
3. Changes name to "Alicia"
4. Saves → **No password required** (name is metadata)

### Scenario 5: Viewing Private Key

1. User selects a profile
2. Clicks to view profile details
3. Private key is hidden by default (••••••)
4. Clicks eye icon to reveal
5. **If locked**: Must enter master password first
6. **If unlocked**: Key is revealed

### Scenario 6: Forgot Password - Reset

1. User has master password set but forgot it
2. Opens sidepanel → locked screen
3. Clicks "Forgot password? Start fresh"
4. Confirmation dialog appears with warning
5. User confirms "Delete Everything"
6. All data cleared, extension reset to fresh state
7. User starts over with new profile

### Scenario 7: Returning User with Existing Vault

1. User has previously set master password
2. Extension starts in locked state
3. Sidepanel shows unlock form
4. User enters password → unlocks
5. **On unlock**: Public keys are cached for any profiles missing them
6. All features available

### Scenario 7a: Extension Reload / Service Worker Restart

1. User has existing encrypted vault (master password was set)
2. User reloads the extension from `chrome://extensions/` or Chrome restarts
3. **Best case**: Sidepanel init detects `isEncrypted=true` → shows locked view immediately
4. **Fallback**: If `isEncrypted` fails (service worker timing), init runs `hasEncryptedData` deep scan
   - Deep scan checks for `passwordHash` in storage and encrypted `privKey` blobs on profiles
   - If found → self-heals `isEncrypted` flag, sets `locked=true`, shows locked view
5. **Manual fallback**: If both auto-detect paths fail, user sees "Secure Your Vault" card
   - Clicks "Check for Existing Vault" → triggers same `hasEncryptedData` deep scan
   - Vault detected → locked view appears → user enters password → unlocks
6. This three-tier detection (flag check → deep scan → manual button) ensures vault is never lost

### Scenario 7b: Returning User Opens Security Settings

1. User has existing encrypted vault
2. Opens security settings (from Settings or Vault tab)
3. Sees **"Existing Vault Detected"** screen with:
   - Message explaining vault exists
   - Password input to **"Restore Vault"**
   - OR **"Forgot Password?"** section with delete option
4. If restores: unlocks and shows change/remove password options
5. If deletes: clears all data, shows "Set Master Password" form

### Scenario 8: Switching Tabs While Locked

1. User is on Home tab, extension is locked
2. Switches to Vault tab
3. Vault tab shows inline unlock form (not "Set password")
4. User can unlock directly from Vault tab
5. Vault features become available

### Scenario 9: Signing Request While Locked

1. Web app requests signature via NIP-07
2. Extension checks lock state
3. **If locked**: Request rejected with "Extension is locked" error
4. User must unlock extension first
5. Then retry the signature request

---

## Security Settings Page States

| Condition | Display |
|-----------|---------|
| No password exists | "Set Master Password" form |
| Password exists + locked | **"Existing Vault Detected"** with restore form + delete option |
| Password exists + unlocked | "Change Password" / "Remove Password" options |

---

## Vault Tab States

| Condition | Display |
|-----------|---------|
| No master password set | "Set a master password" + button to security settings |
| Password set + locked | "Vault Locked" + inline unlock form |
| Password set + unlocked | Vault features (Encrypted Vault, API Keys) |

---

## Sidepanel Home Tab States

| Condition | Display |
|-----------|---------|
| No master password detected | "Secure Your Vault" card (Check for Existing Vault / Create New Vault & Password) + profile list |
| Password set + locked | Full-screen unlock form + "Forgot password?" option |
| Password set + unlocked | Profile list + lock button (top right) |

---

## Auto-Lock Behavior

- Default: 15 minutes of inactivity
- Configurable: 5, 15, 30, 60 minutes, or Never
- Only available when master password is set
- Timer resets on any user activity
- On lock: All decrypted keys cleared from memory

---

## Technical Notes

### Public Key Caching

To allow `getNpub` to work even when locked:
- Public key (`pubKey`) is cached on the profile when:
  - A new private key is saved
  - Encryption is first enabled
  - User unlocks (backfills for older profiles)
- `getNpub` checks for cached `pubKey` first, falls back to deriving from private key

### Session State

Background script maintains:
- `sessionKeys`: Map of decrypted private keys (cleared on lock)
- `sessionPassword`: Current password (cleared on lock)
- `locked`: Boolean lock state
- `encryptionEnabled`: Cached flag for quick checks

### Message Passing

Key messages between UI and background:
- `isEncrypted` → Queries storage for `isEncrypted` flag, self-heals if `passwordHash` exists
- `isLocked` → Returns current lock state via `checkLockState()`
- `hasEncryptedData` → Deep scan: checks `passwordHash` + scans profile `privKey` fields for encrypted blobs. Returns `{ found, hasPasswordHash, encryptedProfiles }`. Self-heals `isEncrypted` flag if encrypted data found.
- `unlock` → Decrypts keys into session, caches pubKeys if missing
- `lock` → Clears session, sets locked state
- `setPassword` → Caches pubKeys, encrypts all keys, enables encryption
- `removePassword` → Decrypts all keys, disables encryption
- `resetAllData` → Clears everything, fresh start with default profile

**Critical Chrome MV3 Pattern:** All message handlers in `background.js` use `sendResponse(value)` + `return true` (callback pattern). Returning a Promise from the `onMessage` listener does NOT reliably deliver responses on Chrome because our `browser-polyfill.js` wraps `sendMessage` with a callback. The `reply(sendResponse, asyncFn)` helper standardizes this pattern. See `conventions.md` for details.

### Reset/Delete Flow

When user chooses to delete vault and start fresh:
1. `resetAllData` message sent to background
2. Background clears all storage
3. Resets to default profile with empty keys
4. Sets `isEncrypted: false`, clears session state
5. Broadcasts `dataReset` message
6. UI refreshes to show "Set Master Password" form

---

## UI Color Palette (Monokai Theme)

| Element | Color | Hex |
|---------|-------|-----|
| Accent (green) | Primary buttons, active states | `#a6e22e` |
| Warning (amber) | Non-critical warnings | `#cca066` |
| Error (pink) | Errors, destructive actions | `#f92672` |
| Orange | Urgent warnings | `#fd971f` |
| Background | Main bg | `#272822` |
| Background light | Cards, sections | `#3e3d32` |
| Background lighter | Inputs, borders | `#49483e` |
| Text | Primary text | `#f8f8f2` |
| Text muted | Secondary text | `#b0b0a8` |
