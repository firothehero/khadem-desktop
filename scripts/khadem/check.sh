#!/usr/bin/env bash
# Khadem post-sync gate for the desktop app: typecheck, Khadem contract tests (forced on, incl. the
# patch ledger and zero-missing-Arabic checks), upstream i18n tests, and the coverage report.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
npm run -s typecheck
npx vitest run tests/khadem src/shared/i18n src/renderer/src/components/I18nProvider.test.tsx
npx tsx scripts/khadem/i18n-report.mts
echo "✓ Khadem checks passed"
