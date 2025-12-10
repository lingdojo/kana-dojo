#!/usr/bin/env node

/**
 * Audio Compression Script
 *
 * This script compresses WAV files to MP3 format to reduce file sizes.
 * Requires ffmpeg to be installed: https://ffmpeg.org/download.html
 *
 * Usage:
 *   node scripts/compress-audio.js
 *
 * Or install ffmpeg:
 *   - Windows: choco install ffmpeg
 *   - Mac: brew install ffmpeg
 *   - Linux: apt-get install ffmpeg
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SOUNDS_DIR = path.join(__dirname, '../public/sounds');

function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function findWavFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findWavFiles(fullPath));
    } else if (item.endsWith('.wav')) {
      files.push(fullPath);
    }
  }

  return files;
}

function compressFile(wavPath) {
  const mp3Path = wavPath.replace('.wav', '.mp3');

  if (fs.existsSync(mp3Path)) {
    console.log(`⏭️  Skipping ${path.basename(wavPath)} (MP3 already exists)`);
    return;
  }

  const originalSize = fs.statSync(wavPath).size;

  try {
    console.log(`🔄 Converting ${path.basename(wavPath)}...`);

    // High quality MP3 conversion
    execSync(
      `ffmpeg -i "${wavPath}" -codec:a libmp3lame -qscale:a 2 "${mp3Path}"`,
      { stdio: 'ignore' }
    );

    const newSize = fs.statSync(mp3Path).size;
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

    console.log(
      `✅ ${path.basename(wavPath)}: ${(originalSize / 1024).toFixed(1)}KB → ${(
        newSize / 1024
      ).toFixed(1)}KB (${savings}% smaller)`
    );
  } catch (error) {
    console.error(
      `❌ Failed to convert ${path.basename(wavPath)}:`,
      error.message
    );
  }
}

function main() {
  console.log('🎵 Audio Compression Script\n');

  if (!checkFFmpeg()) {
    console.error('❌ ffmpeg is not installed!');
    console.error('\nInstall ffmpeg:');
    console.error('  Windows: choco install ffmpeg');
    console.error('  Mac:     brew install ffmpeg');
    console.error('  Linux:   apt-get install ffmpeg');
    console.error('\nOr download from: https://ffmpeg.org/download.html');
    process.exit(1);
  }

  const wavFiles = findWavFiles(SOUNDS_DIR);

  if (wavFiles.length === 0) {
    console.log('No WAV files found in public/sounds/');
    return;
  }

  console.log(`Found ${wavFiles.length} WAV file(s)\n`);

  for (const file of wavFiles) {
    compressFile(file);
  }

  console.log('\n✨ Compression complete!');
  console.log('\n📝 Next steps:');
  console.log('  1. Update useAudio.ts to use .mp3 instead of .wav');
  console.log('  2. Test the audio playback');
  console.log('  3. Delete the original .wav files if everything works');
}

main();
