#!/usr/bin/env bash
# Upload site images to Vercel Blob (requires linked blob store + BLOB_READ_WRITE_TOKEN).
set -euo pipefail
cd "$(dirname "$0")/.."

if ! vercel blob list --limit 1 >/dev/null 2>&1; then
  echo "Blob store not linked yet."
  echo "In Vercel: Project → Storage → connect a Blob store, then re-run."
  exit 1
fi

for file in images/* logo.png og-image.jpg; do
  [ -f "$file" ] || continue
  echo "Uploading $file..."
  vercel blob put "$file" --pathname "$file" --access public --allow-overwrite
done

echo "Done."
