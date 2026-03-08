#!/usr/bin/env node

/**
 * Audio Compression Script - Opus Version
 *
 * This script compresses WAV files to Opus format to reduce file sizes.
 * Opus provides excellent quality at very low bitrates and is widely supported.
 *
 * Requires ffmpeg to be installed: https://ffmpeg.org/download.html
 *
 * Usage:
 *   node scripts/compress-audio-opus.js
 *
 * Install ffmpeg:
 *   - Windows: choco install ffmpeg OR winget install FFmpeg
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

function compressToOpus(wavPath) {
  const opusPath = wavPath.replace('.wav', '.opus');

  const originalSize = fs.statSync(wavPath).size;

  try {
    console.log(`🔄 Converting ${path.basename(wavPath)} to Opus...`);

    // Aggressive low-bandwidth Opus conversion for short SFX
    // -ac 1 / -ar 24000: force mono + lower sample rate
    // -b:a 24k: compact bitrate with good transient retention for clicks
    // -vbr on: Variable bitrate for better quality
    // -application voip: tuned for speech/transients, works well for micro-SFX
    // -map_metadata -1: strip metadata to minimize bytes
    execSync(
      `ffmpeg -y -i "${wavPath}" -ac 1 -ar 24000 -c:a libopus -application voip -b:a 24k -vbr on -compression_level 10 -map_metadata -1 "${opusPath}"`,
      { stdio: 'ignore' },
    );

    const newSize = fs.statSync(opusPath).size;
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

    console.log(
      `✅ ${path.basename(wavPath)}: ${(originalSize / 1024).toFixed(1)}KB → ${(
        newSize / 1024
      ).toFixed(1)}KB (${savings}% smaller)`,
    );

    return {
      original: originalSize,
      compressed: newSize,
      savings: originalSize - newSize,
      skipped: false,
    };
  } catch (error) {
    console.error(
      `❌ Failed to convert ${path.basename(wavPath)}:`,
      error.message,
    );
    return { error: true };
  }
}

function main() {
  console.log('🎵 Audio Compression Script (Opus)\n');
  console.log(
    'Opus format provides excellent quality at ~90% smaller file sizes.\n',
  );

  if (!checkFFmpeg()) {
    console.error('❌ ffmpeg is not installed!\n');
    console.error('Install ffmpeg using one of these methods:');
    console.error('  Windows: winget install FFmpeg');
    console.error('           OR choco install ffmpeg');
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

  let totalOriginal = 0;
  let totalCompressed = 0;
  let convertedCount = 0;

  for (const file of wavFiles) {
    const result = compressToOpus(file);
    if (!result.error) {
      totalOriginal += result.original;
      totalCompressed += result.compressed;
      convertedCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✨ Compression complete!');

  if (convertedCount > 0) {
    const totalSavings = ((1 - totalCompressed / totalOriginal) * 100).toFixed(
      1,
    );
    console.log(
      `📊 Total: ${(totalOriginal / 1024).toFixed(1)}KB → ${(totalCompressed / 1024).toFixed(1)}KB (${totalSavings}% reduction)`,
    );
    console.log(
      `💾 Saved: ${((totalOriginal - totalCompressed) / 1024).toFixed(1)}KB`,
    );
  }

  console.log(
    '\n📝 The audio system (useAudio.ts) will automatically use Opus files.',
  );
  console.log('   WAV files are kept as fallback for older browsers.');
  console.log('\n🧹 Optional: Delete WAV files after testing to save space:');
  console.log('   (Only do this if Opus files work correctly in all browsers)');
}

main();
