#!/usr/bin/env bash
set -euo pipefail

# Generates public/apple-touch-icon.png (180x180) and public/favicon.ico
# Requires ImageMagick `convert` available on PATH. If missing, prints manual commands.

SRC="public/favicon.png"
if [ ! -f "$SRC" ]; then
  echo "Source $SRC not found. Ensure you have public/favicon.png" >&2
  exit 1
fi

if command -v convert >/dev/null 2>&1; then
  echo "Using ImageMagick convert to generate icons..."
  convert "$SRC" -resize 180x180 "public/apple-touch-icon.png"
  convert "$SRC" -define icon:auto-resize=64,48,32,16 "public/favicon.ico"
  echo "Generated public/apple-touch-icon.png and public/favicon.ico"
  exit 0
else
  cat <<'EOF' >&2
ImageMagick 'convert' not found. Install it (e.g. 'brew install imagemagick') and run:

  convert public/favicon.png -resize 180x180 public/apple-touch-icon.png
  convert public/favicon.png -define icon:auto-resize=64,48,32,16 public/favicon.ico

Or install ImageMagick and re-run this script.
EOF
  exit 2
fi
