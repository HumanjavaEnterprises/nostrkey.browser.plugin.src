#!/usr/bin/env bash
set -euo pipefail

# Firefox Screenshot Capture for AMO Listing
# Guides you through each screenshot, captures the Firefox window.
#
# Usage:
#   ./capture-firefox.sh              # Capture all screenshots
#   ./capture-firefox.sh --list       # Show screenshot IDs
#   ./capture-firefox.sh home         # Capture just one
#
# Prerequisites:
#   - Firefox running with NostrKey loaded (about:debugging)
#   - Extension popup visible (click toolbar icon)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCREENSHOTS_DIR="$SCRIPT_DIR/screenshots/firefox"
PREVIOUS_DIR="$SCREENSHOTS_DIR/.previous"

# AMO recommended: 1280x800 or similar. We capture the full Firefox window.
WINDOW_WIDTH=1280
WINDOW_HEIGHT=800

# Screenshots to capture — id, filename, instruction
SCREENSHOTS=(
    "home|home.png|Home tab — show the profile list with a profile selected"
    "apps|apps.png|Apps tab — show the Bunker URL card and Permissions"
    "apps-bunker|apps-bunker-active.png|Apps tab — with an active Bunker URL (click Create Bunker URL first)"
    "vault|vault.png|Vault tab — show the vault view"
    "relays|relays.png|Relays tab — show relay list"
    "settings|settings.png|Settings tab — show settings"
    "locked|locked.png|Lock screen — lock the vault first (click the lock icon)"
    "signing|signing-prompt.png|Signing prompt — visit a Nostr site and trigger a sign request"
)

die() { echo "ERROR: $*" >&2; exit 1; }

# --- Position Firefox window ---
position_firefox() {
    osascript -e "
        tell application \"Firefox\"
            activate
            if (count of windows) > 0 then
                set bounds of window 1 to {0, 25, $WINDOW_WIDTH, $((WINDOW_HEIGHT + 25))}
            end if
        end tell
    " 2>/dev/null || echo "Warning: Could not position Firefox window. Position manually."
}

# --- Capture Firefox window ---
capture_window() {
    local output="$1"
    # Get Firefox window ID
    local wid
    wid=$(osascript -e '
        tell application "System Events"
            tell process "Firefox"
                set w to window 1
                return id of w
            end tell
        end tell
    ' 2>/dev/null || echo "")

    if [ -n "$wid" ]; then
        screencapture -l "$wid" -o "$output"
    else
        # Fallback: interactive window capture
        echo "  Could not get window ID. Click the Firefox window to capture."
        screencapture -w -o "$output"
    fi
}

# --- List screenshots ---
list_screens() {
    echo "Available screenshot IDs:"
    echo ""
    for entry in "${SCREENSHOTS[@]}"; do
        IFS='|' read -r id filename instruction <<< "$entry"
        echo "  $id  —  $instruction"
    done
}

# --- Rotate previous ---
rotate() {
    if [ -d "$SCREENSHOTS_DIR" ] && [ "$(ls -A "$SCREENSHOTS_DIR" 2>/dev/null | grep -v '^\.')" ]; then
        echo "Rotating current screenshots to .previous/..."
        rm -rf "$PREVIOUS_DIR"
        mkdir -p "$PREVIOUS_DIR"
        mv "$SCREENSHOTS_DIR"/*.png "$PREVIOUS_DIR"/ 2>/dev/null || true
    fi
    mkdir -p "$SCREENSHOTS_DIR"
}

# --- Capture one ---
capture_one() {
    local id="$1"
    local found=false

    for entry in "${SCREENSHOTS[@]}"; do
        IFS='|' read -r eid filename instruction <<< "$entry"
        if [ "$eid" = "$id" ]; then
            found=true
            echo ""
            echo "[$eid] $instruction"
            echo ""
            read -r -p "  Set up the view, then press ENTER to capture (or 's' to skip): " choice
            if [ "$choice" = "s" ] || [ "$choice" = "S" ]; then
                echo "  Skipped."
                return
            fi
            local output="$SCREENSHOTS_DIR/$filename"
            capture_window "$output"
            echo "  Saved: $output"
            return
        fi
    done

    if [ "$found" = false ]; then
        die "Unknown screenshot ID: $id (use --list to see available IDs)"
    fi
}

# --- Main ---
main() {
    local target_id=""
    local do_rotate=true

    while [ $# -gt 0 ]; do
        case "$1" in
            --list)
                list_screens
                exit 0
                ;;
            --no-rotate)
                do_rotate=false
                shift
                ;;
            --help|-h)
                echo "Usage: capture-firefox.sh [OPTIONS] [SCREEN_ID]"
                echo ""
                echo "Captures Firefox screenshots for AMO listing."
                echo "Guides you through each state, then captures the Firefox window."
                echo ""
                echo "Options:"
                echo "  --list        Show available screenshot IDs"
                echo "  --no-rotate   Don't rotate previous screenshots"
                echo "  --help        Show this help"
                echo ""
                echo "Prerequisites:"
                echo "  1. Firefox running with NostrKey loaded via about:debugging"
                echo "  2. Click the NostrKey toolbar icon to open the popup"
                echo ""
                echo "Examples:"
                echo "  capture-firefox.sh              # Guided capture of all"
                echo "  capture-firefox.sh home          # Just one screenshot"
                echo "  capture-firefox.sh --no-rotate   # Don't move previous/"
                exit 0
                ;;
            -*)
                die "Unknown option: $1"
                ;;
            *)
                target_id="$1"
                shift
                ;;
        esac
    done

    echo "=== NostrKey Firefox Screenshot Capture ==="
    echo ""
    echo "Make sure:"
    echo "  1. Firefox is running with NostrKey loaded"
    echo "  2. The extension popup is open (click toolbar icon)"
    echo ""

    # Position Firefox
    position_firefox
    echo "Firefox window positioned to ${WINDOW_WIDTH}x${WINDOW_HEIGHT}"
    echo ""

    if [ -n "$target_id" ]; then
        mkdir -p "$SCREENSHOTS_DIR"
        capture_one "$target_id"
    else
        if [ "$do_rotate" = true ]; then
            rotate
        else
            mkdir -p "$SCREENSHOTS_DIR"
        fi

        echo "Capturing ${#SCREENSHOTS[@]} screenshots..."
        for entry in "${SCREENSHOTS[@]}"; do
            IFS='|' read -r id _ _ <<< "$entry"
            capture_one "$id"
        done
    fi

    echo ""
    echo "Done! Screenshots saved to: $SCREENSHOTS_DIR"
    echo ""
    echo "To review: open $SCREENSHOTS_DIR"
}

main "$@"
