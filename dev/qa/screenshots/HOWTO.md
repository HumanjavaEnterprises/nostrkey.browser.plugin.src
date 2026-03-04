# App Store Screenshot Capture — HOWTO

## Overview

Screenshots for the NostrKey Safari extension across macOS, iPhone, and iPad. All screenshots show the extension running in Safari on the test page at **nostrkey.com/test**.

## Accepted Dimensions

### Mac App Store
| Size | Method |
|------|--------|
| **2560 x 1600** | Safari window at 1280x800 on Retina display |
| 2880 x 1800 | Safari window at 1440x900 on Retina display |
| 1280 x 800 | Non-Retina (not recommended) |
| 1440 x 900 | Non-Retina (not recommended) |

### iPhone (6.7" display)
| Size | Simulator |
|------|-----------|
| **1284 x 2778** | **iPhone 13 Pro Max** |
| 1242 x 2688 | iPhone 11 Pro Max (6.5") |

### iPad (12.9" / 13" display)
| Size | Simulator |
|------|-----------|
| **2048 x 2732** | **iPad Pro 12.9-inch (6th generation)** |
| 2064 x 2752 | iPad Pro 13-inch (M4) |

### WRONG Simulators (rejected by App Store Connect)
- **iPhone 17 Pro Max** → 1320 x 2868 (not accepted)
- **iPhone 14 Pro Max** → 1290 x 2796 (not accepted)

## Screenshot Set (8 per platform)

| File | Screen | Notes |
|------|--------|-------|
| `locked-vault.png` | Extension locked, password prompt | Extension popup open |
| `unlocked-vault.png` | Profile view with QR code | Shows npub + QR |
| `vault.png` | Encrypted Vault / API Keys / Nostr Keys | Vault tab |
| `apps.png` | App permissions | Apps tab, "No permissions granted yet" |
| `relays.png` | Relay connections list | Relays tab |
| `settings.png` | Security, Sync, Advanced | Settings tab |
| `signing-prompt.png` | Permission Request dialog | "nostrkey.com wants to: Sign an event" |
| `signed-event.png` | Signed event JSON result | Shows OK badge + full JSON |

## Directory Structure

```
dev/qa/screenshots/
├── HOWTO.md          ← this file
├── macos/            ← 2560x1600 (8 screenshots)
├── iphone/           ← 1284x2778 (8 screenshots)
└── ipad/             ← 2048x2732 (8 screenshots)
```

## Prerequisites

- Xcode with iOS simulators installed
- NostrKey Xcode project at `dev/apple/NostrKey.xcodeproj`
- Test page deployed to nostrkey.com/test (GitHub Pages)
- Safari extension enabled on each device/simulator

## Procedure — macOS

### 1. Build and launch the macOS Safari extension
```bash
xcodebuild -project dev/apple/NostrKey.xcodeproj \
  -scheme "NostrKey (macOS)" -configuration Debug build

open ~/Library/Developer/Xcode/DerivedData/NostrKey-*/Build/Products/Debug/NostrKey.app
```

### 2. Enable in Safari
- Safari → Settings → Extensions → enable NostrKey
- Set permissions to allow on nostrkey.com

### 3. Resize Safari window
```bash
osascript -e 'tell application "Safari" to set bounds of front window to {0, 0, 1280, 800}'
```
Note: `window.resizeTo()` is blocked by Safari. Must use AppleScript.

### 4. Navigate to test page
```bash
osascript -e 'tell application "Safari" to set URL of current tab of front window to "https://nostrkey.com/test"'
```

### 5. Capture each screen
Open the extension popup, set up the desired view, then:
```bash
# Full-screen capture (popup stays open since no interaction needed)
screencapture dev/qa/screenshots/macos/locked-vault.png

# Crop to Safari window (50px offset = menu bar on Retina)
sips --cropOffset 50 0 --cropToHeightWidth 1600 2560 dev/qa/screenshots/macos/locked-vault.png
```

To find exact Safari window position:
```bash
osascript -e 'tell application "Safari" to get bounds of front window'
# Returns: {left, top, right, bottom} — multiply by 2 for Retina pixels
```

## Procedure — iPhone

### 1. Create the correct simulator (one-time)
```bash
# iPhone 13 Pro Max → 1284x2778 (ACCEPTED)
xcrun simctl create "iPhone 13 Pro Max" \
  com.apple.CoreSimulator.SimDeviceType.iPhone-13-Pro-Max \
  com.apple.CoreSimulator.SimRuntime.iOS-26-2
```

### 2. Boot, build, install
```bash
xcrun simctl boot <DEVICE_ID>

xcodebuild -project dev/apple/NostrKey.xcodeproj \
  -scheme "NostrKey (iOS)" -configuration Debug \
  -destination "id=<DEVICE_ID>" build

xcrun simctl install <DEVICE_ID> \
  ~/Library/Developer/Xcode/DerivedData/NostrKey-*/Build/Products/Debug-iphonesimulator/NostrKey.app
```

### 3. Launch the app manually
`xcrun simctl launch` often fails on fresh simulators. Tap the NostrKey icon on the home screen instead. This registers the extension with Safari.

### 4. Enable in Safari
In the simulator's Safari:
- Tap the extensions icon (puzzle piece) or `AA` button
- Manage Extensions → enable NostrKey
- Navigate to nostrkey.com/test

### 5. Capture
```bash
xcrun simctl io <DEVICE_ID> screenshot dev/qa/screenshots/iphone/locked-vault.png
```
No cropping needed — simulator screenshots are exact device resolution.

## Procedure — iPad

Same as iPhone but with iPad simulator:

### 1. Create simulator (one-time)
```bash
# iPad Pro 12.9" (6th gen) → 2048x2732 (ACCEPTED)
xcrun simctl create "iPad Pro 12.9 6th" \
  com.apple.CoreSimulator.SimDeviceType.iPad-Pro-12-9-inch-6th-generation-8GB \
  com.apple.CoreSimulator.SimRuntime.iOS-26-2
```

### 2-5. Same as iPhone
Build, install, launch manually, enable extension, capture:
```bash
xcrun simctl io <DEVICE_ID> screenshot dev/qa/screenshots/ipad/locked-vault.png
```

## Current Simulator IDs (created 2026-03-03)

| Simulator | ID |
|-----------|-----|
| iPhone 13 Pro Max | `SIM-UDID-REDACTED` |
| iPad Pro 12.9" 6th | `SIM-UDID-REDACTED` |

To list all simulators:
```bash
xcrun simctl list devices available | grep -i "iphone\|ipad"
```

## Tips

- **Extension not detected?** Refresh the page. Safari sometimes delays extension injection.
- **`file://` URLs don't work** — Safari extensions won't inject on local files. Use nostrkey.com/test or a local HTTP server (`python3 -m http.server 8080` from `docs/`).
- **Signing prompt is time-sensitive** — tap "Sign Test Event" on the test page and capture quickly before the prompt auto-dismisses.
- **Clean up simulators** when done: `xcrun simctl delete <DEVICE_ID>`
- **Simulator master password:** `123456789`
