#!/usr/bin/env bash
# Merge the latest upstream Hermes Desktop into this Khadem fork and verify the Arabic layer.
#
#   scripts/khadem/sync-upstream.sh             # merge upstream/main, npm ci, scripts/khadem/check.sh
#   SKIP_CHECKS=1 scripts/khadem/sync-upstream.sh
#
# Khadem code lives in Khadem-owned paths; upstream files only carry the one-line hooks listed in
# KHADEM.md → "Patch ledger". On a conflict in a ledger file: take upstream's version, re-add the
# hook line(s) shown in the ledger, then run scripts/khadem/check.sh (the ledger test verifies them).
set -euo pipefail
UPSTREAM_URL="${UPSTREAM_URL:-https://github.com/fathah/hermes-desktop.git}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-main}"
cd "$(git rev-parse --show-toplevel)"

git remote get-url upstream >/dev/null 2>&1 || git remote add upstream "$UPSTREAM_URL"
git fetch --no-tags upstream "$UPSTREAM_BRANCH"
# .gitattributes marks Khadem brand assets `merge=ours`; register the driver it names.
git config merge.ours.driver true

before=$(git rev-parse HEAD)
if ! git merge --no-edit "upstream/$UPSTREAM_BRANCH"; then
  echo "✗ merge conflict — files:" >&2
  git diff --name-only --diff-filter=U >&2
  echo "See KHADEM.md → Patch ledger for the Khadem hook each file needs." >&2
  exit 1
fi
echo "merged $(git rev-list --count "$before"..HEAD) commit(s) from upstream/$UPSTREAM_BRANCH"

if [ "${SKIP_CHECKS:-0}" != "1" ]; then
  npm ci --no-audit --no-fund
  scripts/khadem/check.sh
fi
