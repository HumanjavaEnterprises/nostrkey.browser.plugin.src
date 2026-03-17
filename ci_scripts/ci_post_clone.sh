#!/bin/sh

# Xcode Cloud post-clone script
# Installs Node.js and builds the Safari extension assets into distros/safari/

set -e

echo "=== NostrKey CI: Installing Node.js ==="

# Xcode Cloud provides Homebrew
brew install node

echo "=== NostrKey CI: node $(node --version), npm $(npm --version) ==="

echo "=== NostrKey CI: Installing dependencies ==="
cd "$CI_PRIMARY_REPOSITORY_PATH"
npm install

echo "=== NostrKey CI: Building Safari extension ==="
npm run build

echo "=== NostrKey CI: Verifying build output ==="
ls -la distros/safari/

echo "=== NostrKey CI: Build complete ==="
