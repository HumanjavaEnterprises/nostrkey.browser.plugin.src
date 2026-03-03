#!/usr/bin/env bash
set -euo pipefail

# resize-screenshots.sh — Resize QA screenshots for different purposes
#
# Creates two output folders from screenshots/current/:
#   screenshots/review/            — max 2000px tall (for Claude Code / conversation review)
#   screenshots/appstore/tablet-11 — iPad Air 11" at 1668x2388
#
# Usage:
#   ./resize-screenshots.sh              # Process all screenshots
#   ./resize-screenshots.sh --review     # Only review-sized
#   ./resize-screenshots.sh --appstore   # Only App Store-sized

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG="$SCRIPT_DIR/ui-target-map.json"
CURRENT_DIR="$SCRIPT_DIR/screenshots/current"
REVIEW_DIR="$SCRIPT_DIR/screenshots/review"
APPSTORE_DIR="$SCRIPT_DIR/screenshots/appstore"

die() { echo "ERROR: $*" >&2; exit 1; }

# --- Check prerequisites ---
command -v sips >/dev/null 2>&1 || die "sips is required (macOS built-in)"
[ -d "$CURRENT_DIR" ] || die "No screenshots found. Run capture first."

count=$(ls "$CURRENT_DIR"/*.png 2>/dev/null | wc -l | tr -d ' ')
[ "$count" -gt 0 ] || die "No .png files in $CURRENT_DIR"

# --- Parse args ---
do_review=true
do_appstore=true

if [ "${1:-}" = "--review" ]; then
  do_appstore=false
elif [ "${1:-}" = "--appstore" ]; then
  do_review=false
fi

# --- Review copies (max 2000px height, no alpha) ---
if [ "$do_review" = true ]; then
  echo "Creating review-sized screenshots (max 2000px)..."
  rm -rf "$REVIEW_DIR"
  mkdir -p "$REVIEW_DIR"

  for f in "$CURRENT_DIR"/*.png; do
    name=$(basename "$f")
    height=$(sips -g pixelHeight "$f" 2>/dev/null | awk '/pixelHeight/{print $2}')
    width=$(sips -g pixelWidth "$f" 2>/dev/null | awk '/pixelWidth/{print $2}')

    if [ "$height" -gt 2000 ]; then
      # Scale proportionally so height = 2000
      new_width=$(( width * 2000 / height ))
      sips -z 2000 "$new_width" "$f" --out "$REVIEW_DIR/$name" >/dev/null 2>&1
    else
      cp "$f" "$REVIEW_DIR/$name"
    fi

    # Remove alpha channel (flatten onto Monokai dark background)
    has_alpha=$(sips -g hasAlpha "$REVIEW_DIR/$name" 2>/dev/null | awk '/hasAlpha/{print $2}')
    if [ "$has_alpha" = "yes" ]; then
      python3 -c "
from PIL import Image
img = Image.open('$REVIEW_DIR/$name')
if img.mode in ('RGBA', 'LA'):
    bg = Image.new('RGB', img.size, (39, 40, 34))
    bg.paste(img, mask=img.split()[-1])
    bg.save('$REVIEW_DIR/$name')
" 2>/dev/null || true
    fi

    final_h=$(sips -g pixelHeight "$REVIEW_DIR/$name" 2>/dev/null | awk '/pixelHeight/{print $2}')
    final_w=$(sips -g pixelWidth "$REVIEW_DIR/$name" 2>/dev/null | awk '/pixelWidth/{print $2}')
    echo "  $name: ${width}x${height} -> ${final_w}x${final_h}"
  done

  echo "Review screenshots: $REVIEW_DIR"
  echo ""
fi

# --- App Store copies (exact dimensions with letterbox/pillarbox) ---
if [ "$do_appstore" = true ]; then
  echo "Creating App Store screenshots..."

  # Read sizes from config
  if [ -f "$CONFIG" ] && command -v jq >/dev/null 2>&1; then
    # Read appstore_sizes from ui-target-map.json
    size_keys=$(jq -r '.appstore_sizes | keys[]' "$CONFIG")
  else
    # Fallback: tablet-11 only
    size_keys="tablet-11"
  fi

  for size_name in $size_keys; do
    TW=$(jq -r ".appstore_sizes[\"$size_name\"].width" "$CONFIG")
    TH=$(jq -r ".appstore_sizes[\"$size_name\"].height" "$CONFIG")
    mkdir -p "$APPSTORE_DIR/$size_name"

    for f in "$CURRENT_DIR"/*.png; do
      name=$(basename "$f")

      python3 -c "
from PIL import Image
img = Image.open('$f').convert('RGBA')
tw, th = $TW, $TH
iw, ih = img.size
scale = min(tw/iw, th/ih)
nw, nh = int(iw*scale), int(ih*scale)
resized = img.resize((nw, nh), Image.LANCZOS)
bg = Image.new('RGB', (tw, th), (39, 40, 34))
bg.paste(resized, ((tw-nw)//2, (th-nh)//2), resized if resized.mode == 'RGBA' else None)
bg.save('$APPSTORE_DIR/$size_name/$name')
" 2>/dev/null
      echo "  $size_name/$name: ${TW}x${TH}"
    done
  done

  echo "App Store screenshots: $APPSTORE_DIR"
fi

echo ""
echo "Done!"
