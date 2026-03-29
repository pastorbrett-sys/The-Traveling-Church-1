#!/usr/bin/env node
/**
 * Prepare Native Build
 * Removes non-essential videos from native app bundles to reduce size.
 * The Moses video is kept for the Vagabond Bible landing page.
 * All other videos are TC website only and not needed in native apps.
 * 
 * Usage: node scripts/prepare-native-build.js
 */

import fs from 'fs';
import path from 'path';

const ASSETS_DIRS = [
  'android/app/src/main/assets/public/assets',
  'ios/App/App/public/assets'
];

// Videos to KEEP in native apps (patterns)
const KEEP_PATTERNS = [
  'text-to-video-28b9692b'  // Moses video for Vagabond Bible
];

// Video extensions to check
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi'];

function shouldKeep(filename) {
  return KEEP_PATTERNS.some(pattern => filename.includes(pattern));
}

function isVideo(filename) {
  const ext = path.extname(filename).toLowerCase();
  return VIDEO_EXTENSIONS.includes(ext);
}

function cleanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`  Directory not found: ${dir} (skipping)`);
    return { removed: 0, kept: 0, savedMB: 0 };
  }

  let removed = 0;
  let kept = 0;
  let savedBytes = 0;

  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (!isVideo(file)) continue;
    
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (shouldKeep(file)) {
      console.log(`  ✓ Keeping: ${file}`);
      kept++;
    } else {
      console.log(`  ✗ Removing: ${file} (${(stats.size / 1024 / 1024).toFixed(1)}MB)`);
      fs.unlinkSync(filePath);
      removed++;
      savedBytes += stats.size;
    }
  }

  return { removed, kept, savedMB: savedBytes / 1024 / 1024 };
}

function cleanDuplicateFiles(baseDir) {
  if (!fs.existsSync(baseDir)) return 0;
  let count = 0;

  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\s/.test(entry.name) || / \d+\./.test(entry.name)) {
        console.log(`  ✗ Removing duplicate: ${fullPath}`);
        fs.unlinkSync(fullPath);
        count++;
      }
    }
  }

  walk(baseDir);
  return count;
}

console.log('\n🧹 Cleaning macOS duplicate files (spaces in names)...\n');

const ANDROID_RES = 'android/app/src/main/res';
const IOS_APP = 'ios/App/App';
let dupsRemoved = 0;

for (const dir of [ANDROID_RES, IOS_APP]) {
  console.log(`Checking ${dir}:`);
  dupsRemoved += cleanDuplicateFiles(dir);
}

if (dupsRemoved > 0) {
  console.log(`\n  Removed ${dupsRemoved} duplicate file(s)\n`);
} else {
  console.log('  No duplicates found\n');
}

console.log('🎬 Preparing native build (removing non-essential videos)...\n');

let totalRemoved = 0;
let totalKept = 0;
let totalSavedMB = 0;

for (const dir of ASSETS_DIRS) {
  console.log(`Checking ${dir}:`);
  const result = cleanDirectory(dir);
  totalRemoved += result.removed;
  totalKept += result.kept;
  totalSavedMB += result.savedMB;
  console.log('');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Done! Removed ${totalRemoved} videos (${totalSavedMB.toFixed(1)}MB saved)`);
console.log(`   Kept ${totalKept} essential video(s)`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
