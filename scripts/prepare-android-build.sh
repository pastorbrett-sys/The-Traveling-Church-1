#!/bin/bash
# Prepare Android build by removing non-essential videos
# This only removes COPIES in the android folder - originals are untouched

echo "Preparing Android build..."

ASSETS_DIR="android/app/src/main/assets/public/assets"

# List of video patterns to KEEP (Moses video for Vagabond Bible landing)
KEEP_PATTERN="text-to-video-28b9692b"

# Remove videos that are NOT needed for native app (TC website only)
echo "Removing non-essential videos from Android bundle..."

# Find and remove videos that don't match the keep pattern
find "$ASSETS_DIR" -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.webm" \) | while read file; do
  if [[ ! "$file" == *"$KEEP_PATTERN"* ]]; then
    echo "  Removing: $(basename "$file")"
    rm "$file"
  else
    echo "  Keeping: $(basename "$file")"
  fi
done

echo ""
echo "Done! Android assets cleaned."
echo "Now build your signed app bundle in Android Studio."
