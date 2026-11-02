#!/usr/bin/env bash
# Vendor the Khadem agent plugin (plugins/khadem from firothehero/khadem) into
# resources/khadem-agent-plugin, which the desktop installs into ~/.hermes/plugins/khadem.
#
#   scripts/khadem/vendor-agent-plugin.sh                 # from the KHADEM_AGENT_REF (default: main)
#   KHADEM_AGENT_DIR=../khadem scripts/khadem/vendor-agent-plugin.sh   # from a local checkout
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
REPO="${KHADEM_AGENT_REPO:-https://github.com/firothehero/khadem.git}"
REF="${KHADEM_AGENT_REF:-main}"
DEST=resources/khadem-agent-plugin

if [ -n "${KHADEM_AGENT_DIR:-}" ]; then
  src_root="$(cd "$KHADEM_AGENT_DIR" && pwd)"
  commit="$(git -C "$src_root" rev-parse HEAD)"
else
  tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
  git clone --quiet --depth 1 --filter=blob:none --sparse --branch "$REF" "$REPO" "$tmp/khadem"
  git -C "$tmp/khadem" sparse-checkout set plugins/khadem
  src_root="$tmp/khadem"
  commit="$(git -C "$src_root" rev-parse HEAD)"
fi

rm -rf "$DEST"
mkdir -p "$DEST"
cp -R "$src_root/plugins/khadem/." "$DEST/"
find "$DEST" -name '__pycache__' -prune -exec rm -rf {} +
cat > "$DEST/SOURCE.json" <<JSON
{
  "repository": "$REPO",
  "path": "plugins/khadem",
  "commit": "$commit"
}
JSON
echo "vendored plugins/khadem @ $commit → $DEST"
