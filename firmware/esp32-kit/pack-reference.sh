#!/usr/bin/env bash
# Pack ESP32 Controller Kit *reference* sources.
# Not a production SKU, not a binary release, not hardware-verified.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
DIST="$ROOT/dist"
NAME="syncrobrain-esp32-kit-ref"
STAGING="$(mktemp -d)"
cleanup() { rm -rf "$STAGING"; }
trap cleanup EXIT

mkdir -p "$DIST"
DEST="$STAGING/$NAME"
mkdir -p "$DEST"

# Copy only the public reference sources. Never include secrets.h.
for f in esp32-kit.ino kit_config.h secrets.example.h README.md; do
  if [[ ! -f "$ROOT/$f" ]]; then
    echo "missing $ROOT/$f" >&2
    exit 1
  fi
  cp "$ROOT/$f" "$DEST/"
done

if [[ -e "$DEST/secrets.h" ]]; then
  echo "refusing to pack secrets.h" >&2
  exit 1
fi

ARCHIVE="$DIST/${NAME}.tar.gz"
rm -f "$ARCHIVE"
tar -C "$STAGING" -czf "$ARCHIVE" "$NAME"

if tar -tzf "$ARCHIVE" | grep -E '(^|/)secrets\.h$' >/dev/null; then
  rm -f "$ARCHIVE"
  echo "archive contained secrets.h; deleted" >&2
  exit 1
fi

echo "wrote $ARCHIVE"
if command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "$ARCHIVE"
elif command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$ARCHIVE"
else
  echo "no sha256 tool found" >&2
  exit 1
fi
