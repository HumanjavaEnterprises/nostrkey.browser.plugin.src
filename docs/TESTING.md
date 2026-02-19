# NostrKey Testing Guide

This document provides comprehensive testing instructions for NostrKey to verify functionality before submission and after updates.

## Prerequisites

- Chrome, Edge, Brave, or Safari browser
- Basic understanding of Nostr protocol
- Access to a Nostr web application (e.g., Snort, Primal, Coracle)
- Test private key (DO NOT use your real keys for testing)

## Test Environment Setup

### Generate Test Keys

**Option 1: Using NostrKey**
1. Install the extension
2. Create a new profile
3. Let NostrKey generate a new key pair
4. Export and save the test keys

**Option 2: Using nak CLI**
```bash
# Install nak (if not already installed)
go install github.com/fiatjaf/nak@latest

# Generate a test key
nak key generate
```

**⚠️ IMPORTANT:** Never use real private keys for testing. Always use disposable test keys.

## Installation Testing

### Chrome/Chromium Browsers

1. **Load Unpacked Extension**
   ```
   1. Build the extension: npm run build:chrome
   2. Open chrome://extensions/
   3. Enable "Developer mode"
   4. Click "Load unpacked"
   5. Select distros/chrome/ folder
   ```

2. **Verify Installation**
   - [ ] Extension icon appears in toolbar
   - [ ] No console errors in chrome://extensions/
   - [ ] Clicking icon opens popup
   - [ ] Popup displays correctly

### Safari (macOS)

1. **Build and Run**
   ```
   1. npm install
   2. npm run build
   3. Open apple/NostrKey.xcodeproj in Xcode
   4. Build and Run (⌘R)
   5. Safari → Settings → Extensions → Enable NostrKey
   ```

2. **Verify Installation**
   - [ ] Extension appears in Safari Extensions settings
   - [ ] Extension icon appears in toolbar
   - [ ] Clicking icon opens popup

## Core Functionality Tests

### 1. Profile Management

#### Create Local Profile
- [ ] Click "New Local" button
- [ ] Enter profile name
- [ ] Paste test private key (nsec or hex)
- [ ] Click "Save"
- [ ] Verify public key is displayed correctly
- [ ] Verify npub QR code is generated

#### Create Bunker Profile
- [ ] Click "New Bunker" button
- [ ] Enter profile name
- [ ] Enter valid bunker:// URL (if available)
- [ ] Click "Connect"
- [ ] Verify connection status shows "Connected"

#### Multiple Profiles
- [ ] Create 2-3 test profiles
- [ ] Switch between profiles using dropdown
- [ ] Verify correct keys are displayed for each profile
- [ ] Delete a profile
- [ ] Verify profile is removed from list

### 2. Key Management

#### Private Key Import
- [ ] Import nsec format key
- [ ] Import hex format key
- [ ] Verify both formats work correctly
- [ ] Verify public key is derived correctly

#### ncryptsec Import (NIP-49)
- [ ] Paste ncryptsec1... encrypted key
- [ ] Enter password
- [ ] Click "Decrypt & Import"
- [ ] Verify key is imported successfully

#### ncryptsec Export
- [ ] Enter export password (min 8 characters)
- [ ] Confirm password
- [ ] Click "Export ncryptsec"
- [ ] Verify ncryptsec string is generated
- [ ] Copy and save the ncryptsec
- [ ] Test re-importing the exported ncryptsec

#### QR Code Generation
- [ ] Verify npub QR code displays
- [ ] Click "Show nsec QR"
- [ ] Verify nsec QR code displays with warning
- [ ] Click "Hide" to hide nsec QR

### 3. Master Password / Security

#### Set Master Password
- [ ] Enter new password (8+ characters)
- [ ] Confirm password
- [ ] Click "Set Password"
- [ ] Verify success message
- [ ] Close and reopen extension
- [ ] Verify extension is locked
- [ ] Enter password to unlock
- [ ] Verify keys are accessible

#### Change Master Password
- [ ] Enter current password
- [ ] Enter new password
- [ ] Confirm new password
- [ ] Click "Change Password"
- [ ] Verify success message
- [ ] Test unlocking with new password

#### Remove Master Password
- [ ] Enter current password
- [ ] Click "Remove Password"
- [ ] Verify keys are now unencrypted
- [ ] Close and reopen extension
- [ ] Verify no password prompt

### 4. Relay Management

#### Add Relays
- [ ] Add relay: wss://relay.damus.io
- [ ] Add relay: wss://nos.lol
- [ ] Add relay: wss://relay.nostr.band
- [ ] Verify all relays appear in list

#### Configure Relay Permissions
- [ ] Set relay to Read only
- [ ] Set relay to Write only
- [ ] Set relay to Read + Write
- [ ] Verify checkboxes update correctly

#### Delete Relay
- [ ] Click "Delete" on a relay
- [ ] Verify relay is removed from list

#### Recommended Relays
- [ ] Open recommended relays dropdown
- [ ] Select a recommended relay
- [ ] Verify it's added to the input field
- [ ] Click "Add"
- [ ] Verify relay is added to list

### 5. Permissions Management

#### Grant Permissions
1. Visit a Nostr web app (e.g., https://snort.social)
2. The app should request permissions
3. Test each permission option:
   - [ ] Click "Allow" - verify permission is granted
   - [ ] Click "Deny" - verify permission is denied
   - [ ] Click "Ask" - verify you're prompted each time

#### View Saved Permissions
- [ ] Open Full Settings
- [ ] Scroll to "App Permissions" section
- [ ] Select an app from dropdown
- [ ] Verify saved permissions are displayed
- [ ] Change a permission setting
- [ ] Verify change is saved

#### Clear Permissions
- [ ] Change permission from "Allow" to "Ask"
- [ ] Revisit the app
- [ ] Verify you're prompted again

### 6. NIP-07 API Testing

Visit a Nostr web app and test the following:

#### getPublicKey()
- [ ] App requests public key
- [ ] Grant permission
- [ ] Verify correct npub is returned
- [ ] Check browser console for no errors

#### signEvent()
- [ ] Create a test post/note
- [ ] App requests signature
- [ ] Grant permission
- [ ] Verify event is signed
- [ ] Verify signature is valid
- [ ] Post appears on Nostr network

#### nip04.encrypt() / nip04.decrypt()
- [ ] Send a DM to another test account
- [ ] Grant encryption permission
- [ ] Verify message is encrypted
- [ ] Receive and decrypt a DM
- [ ] Verify decryption works

#### nip44.encrypt() / nip44.decrypt()
- [ ] Test NIP-44 encryption (if app supports)
- [ ] Verify modern encryption works
- [ ] Compare with NIP-04 (should be different)

### 7. Side Panel (Chrome only)

- [ ] Click extension icon
- [ ] Click "Open Side Panel" (if available)
- [ ] Verify side panel opens
- [ ] Test navigation in side panel
- [ ] Verify side panel persists across tabs

### 8. Vault Testing (if implemented)

- [ ] Create a test document
- [ ] Save to vault
- [ ] Verify document is encrypted
- [ ] Retrieve document from vault
- [ ] Verify decryption works
- [ ] Delete document
- [ ] Verify deletion

### 9. Event History

- [ ] Sign several events
- [ ] Open Event History
- [ ] Verify events are logged
- [ ] Verify event details are correct
- [ ] Test filtering/searching (if available)

### 10. Protocol Handler (nostr: links)

#### Configure Handler
- [ ] Open Full Settings
- [ ] Scroll to "nostr: Links" section
- [ ] Set handler to: https://njump.me/{raw}
- [ ] Save

#### Test Handler
- [ ] Click a nostr: link (e.g., nostr:npub1...)
- [ ] Verify redirect to njump.me
- [ ] Test with different link types (npub, note, nevent)

#### Disable Handler
- [ ] Click "Disable" button
- [ ] Click a nostr: link
- [ ] Verify no redirect occurs

## Integration Testing

### Test with Real Nostr Apps

#### Snort (https://snort.social)
- [ ] Connect wallet/extension
- [ ] Grant permissions
- [ ] Create a post
- [ ] Like a post
- [ ] Send a DM
- [ ] Update profile

#### Primal (https://primal.net)
- [ ] Login with extension
- [ ] Create a post
- [ ] Interact with content
- [ ] Verify all signatures work

#### Coracle (https://coracle.social)
- [ ] Login with extension
- [ ] Test posting
- [ ] Test reactions
- [ ] Test DMs

### Multi-Tab Testing
- [ ] Open 3+ tabs with different Nostr apps
- [ ] Sign events in different tabs
- [ ] Verify no conflicts
- [ ] Verify correct profile is used

### Profile Switching
- [ ] Create 2 profiles with different keys
- [ ] Switch to Profile A
- [ ] Sign an event
- [ ] Verify correct key was used
- [ ] Switch to Profile B
- [ ] Sign an event
- [ ] Verify different key was used

## Error Handling Tests

### Invalid Input
- [ ] Enter invalid private key format
- [ ] Verify error message is shown
- [ ] Enter invalid relay URL
- [ ] Verify validation error

### Network Errors
- [ ] Add a non-existent relay URL
- [ ] Attempt to connect
- [ ] Verify graceful error handling

### Permission Denial
- [ ] Deny a permission request
- [ ] Verify app handles denial gracefully
- [ ] Verify no console errors

### Master Password Errors
- [ ] Enter wrong password
- [ ] Verify error message
- [ ] Verify keys remain locked

## Performance Tests

### Load Testing
- [ ] Create 10+ profiles
- [ ] Verify extension remains responsive
- [ ] Switch between profiles quickly
- [ ] Verify no lag

### Memory Testing
- [ ] Sign 50+ events in one session
- [ ] Check browser memory usage
- [ ] Verify no memory leaks

### Relay Connection
- [ ] Add 10+ relays
- [ ] Verify connections are managed efficiently
- [ ] Check for connection pooling

## Security Tests

### Key Storage
- [ ] Open browser DevTools
- [ ] Go to Application → Storage
- [ ] Verify keys are stored in extension storage
- [ ] Verify keys are not in localStorage/cookies
- [ ] If master password enabled, verify keys are encrypted

### Content Script Isolation
- [ ] Open browser console on a Nostr app
- [ ] Try to access window.nostr directly
- [ ] Verify proper API isolation
- [ ] Verify no key leakage

### Permission Boundaries
- [ ] Grant permission to one site
- [ ] Visit a different site
- [ ] Verify permissions don't carry over
- [ ] Verify each site is isolated

## Regression Tests

After any update, verify:

- [ ] Existing profiles still load
- [ ] Saved permissions persist
- [ ] Relay configurations remain
- [ ] Master password still works
- [ ] No data loss occurred

## Browser Compatibility

### Chrome
- [ ] Test on Chrome stable
- [ ] Test on Chrome beta (if available)
- [ ] Verify Manifest V3 compliance

### Edge
- [ ] Install on Edge
- [ ] Verify all features work
- [ ] Test Edge-specific features

### Brave
- [ ] Install on Brave
- [ ] Verify Brave Shields compatibility
- [ ] Test with strict privacy settings

### Safari (macOS)
- [ ] Test on Safari stable
- [ ] Verify iOS app (if available)
- [ ] Test with Safari privacy features

## Pre-Submission Checklist

Before submitting to Chrome Web Store:

- [ ] All core functionality tests pass
- [ ] No console errors in normal usage
- [ ] Privacy policy is accessible
- [ ] Terms and conditions are accessible
- [ ] Support documentation is complete
- [ ] Screenshots are prepared
- [ ] Icons are correct size and format
- [ ] Extension description is accurate
- [ ] All permissions are justified
- [ ] Version number is updated
- [ ] Changelog is updated

## Automated Testing (Future)

Consider adding:
- Unit tests for crypto functions
- Integration tests for NIP-07 API
- E2E tests with Playwright/Puppeteer
- CI/CD pipeline for automated testing

## Reporting Issues

If you find bugs during testing:

1. Check existing issues: https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src/issues
2. Create a new issue with:
   - Browser and version
   - Extension version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)
   - Screenshots (if relevant)

## Test Data Cleanup

After testing:

- [ ] Delete all test profiles
- [ ] Clear test data
- [ ] Remove test relays
- [ ] Reset permissions
- [ ] Consider using "Clear Data" button

---

**Last Updated:** February 18, 2026

**Tested By:** [Your name/team]

**Test Environment:** [Browser version, OS version]
