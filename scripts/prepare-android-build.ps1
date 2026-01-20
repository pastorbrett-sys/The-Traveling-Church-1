# Prepare Android build by removing non-essential videos
# This only removes COPIES in the android folder - originals are untouched

Write-Host "Preparing Android build..." -ForegroundColor Cyan

$assetsDir = "android\app\src\main\assets\public\assets"

# Pattern to KEEP (Moses video for Vagabond Bible landing)
$keepPattern = "text-to-video-28b9692b"

Write-Host "Removing non-essential videos from Android bundle..." -ForegroundColor Yellow

# Get all video files
$videoFiles = Get-ChildItem -Path $assetsDir -Include *.mp4,*.mov,*.webm -Recurse -ErrorAction SilentlyContinue

$removed = 0
$kept = 0

foreach ($file in $videoFiles) {
    if ($file.Name -like "*$keepPattern*") {
        Write-Host "  Keeping: $($file.Name)" -ForegroundColor Green
        $kept++
    } else {
        Write-Host "  Removing: $($file.Name)" -ForegroundColor Red
        Remove-Item $file.FullName -Force
        $removed++
    }
}

Write-Host ""
Write-Host "Done! Removed $removed videos, kept $kept." -ForegroundColor Cyan
Write-Host "Now build your signed app bundle in Android Studio." -ForegroundColor White
