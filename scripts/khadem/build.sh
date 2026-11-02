#!/usr/bin/env bash
# Build Khadem Desktop installers with the Khadem identity + update feed (electron-builder.khadem.yml).
#   scripts/khadem/build.sh --linux   |   --mac   |   --win
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
npm run build
npx electron-builder --config electron-builder.khadem.yml "$@"
