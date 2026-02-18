#!/usr/bin/env bash
# NostrKey Browser Extension — Docker dev helper
# Usage: ./scripts/dev.sh <command>
#
# Commands:
#   build        Build for Safari (default, dev mode)
#   build:prod   Production build (minified)
#   build:chrome Chrome extension build
#   build:all    Build all targets (Safari + Chrome)
#   watch        Watch mode (rebuilds on file changes)
#   shell        Open a shell inside the container
#   audit        Run npm audit
#   clean        Remove build artifacts
#   install      Rebuild node_modules (fresh npm ci)

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="docker compose -f ${PROJECT_DIR}/docker-compose.dev.yml"

cmd="${1:-build}"

case "$cmd" in
    build)
        $COMPOSE run --rm nostrkey-dev
        ;;
    build:prod)
        $COMPOSE run --rm nostrkey-dev npm run build:prod
        ;;
    build:chrome)
        $COMPOSE run --rm nostrkey-dev npm run build:chrome
        ;;
    build:all)
        $COMPOSE run --rm nostrkey-dev npm run build:all
        ;;
    watch)
        # Watch needs a TTY for interactive output
        $COMPOSE run --rm nostrkey-dev npm run watch
        ;;
    shell)
        $COMPOSE run --rm nostrkey-dev sh
        ;;
    audit)
        $COMPOSE run --rm nostrkey-dev npm audit
        ;;
    clean)
        $COMPOSE run --rm nostrkey-dev npm run clean
        ;;
    install)
        # Remove the named volume and rebuild to get a fresh npm ci
        $COMPOSE down -v
        $COMPOSE build --no-cache nostrkey-dev
        echo "Fresh node_modules installed. Run './scripts/dev.sh build' to verify."
        ;;
    *)
        echo "Unknown command: $cmd"
        echo ""
        echo "Usage: ./scripts/dev.sh <command>"
        echo ""
        echo "Commands:"
        echo "  build        Build for Safari (default, dev mode)"
        echo "  build:prod   Production build (minified)"
        echo "  build:chrome Chrome extension build"
        echo "  build:all    Build all targets (Safari + Chrome)"
        echo "  watch        Watch mode (rebuilds on file changes)"
        echo "  shell        Open a shell inside the container"
        echo "  audit        Run npm audit"
        echo "  clean        Remove build artifacts"
        echo "  install      Rebuild node_modules (fresh npm ci)"
        exit 1
        ;;
esac
