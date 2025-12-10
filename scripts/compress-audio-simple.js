#!/usr/bin/env node

/**
 * Simple Audio Compression Script
 *
 * Downloads portable ffmpeg and compresses WAV files to MP3.
 * No installation required!
 *
 * Usage: node scripts/compress-audio-simple.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { pipeline } = require('stream/promises');

const SOUNDS_DIR = path.join(__dirname, '../public/sounds');
const FFMPEG_DIR = path.join(__dirname, 'ffmpeg-portable');
const FFMPEG_URL =
  'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip';

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, response => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Follow redirect
          return downloadFile(response.headers.location, dest)
            .then(resolve)
            .catch(reject);
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', err => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function setupFFmpeg() {
  console.log('📦 Setting up portable ffmpeg...\n');

  const zipPath = path.join(__dirname, 'ffmpeg.zip');

  try {
    console.log('⬇️  Downloading ffmpeg (this may take a minute)...');
    await downloadFile(FFMPEG_URL, zipPath);

    console.log('📂 Extracting...');

    // Use PowerShell to extract on Windows
    execSync(
      `powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${FFMPEG_DIR}' -Force"`,
      { stdio: 'inherit' }
    );

    fs.unlinkSync(zipPath);
    console.log('✅ ffmpeg ready!\n');
  } catch (error) {
    console.error('❌ Failed to setup ffmpeg:', error.message);
    process.exit(1);
  }
}

function findFFmpegExe() {
  if (!fs.existsSync(FFMPEG_DIR)) {
    return null;
  }

  const items = fs.readdirSync(FFMPEG_DIR);
  for (const item of items) {
    const binPath = path.join(FFMPEG_DIR, item, 'bin', 'ffmpeg.exe');
    if (fs.existsSync(binPath)) {
      return binPath;
    }
  }

  return null;
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

function compressFile(wavPath, ffmpegPath) {
  const mp3Path = wavPath.replace('.wav', '.mp3');

  if (fs.existsSync(mp3Path)) {
    console.log(`⏭️  Skipping ${path.basename(wavPath)} (MP3 already exists)`);
    return;
  }

  const originalSize = fs.statSync(wavPath).size;

  try {
    console.log(`🔄 Converting ${path.basename(wavPath)}...`);

    execSync(
      `"${ffmpegPath}" -i "${wavPath}" -codec:a libmp3lame -qscale:a 2 "${mp3Path}" -y`,
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

async function main() {
  console.log('🎵 Audio Compression Script\n');

  let ffmpegPath = findFFmpegExe();

  if (!ffmpegPath) {
    await setupFFmpeg();
    ffmpegPath = findFFmpegExe();

    if (!ffmpegPath) {
      console.error('❌ Could not find ffmpeg after setup');
      process.exit(1);
    }
  }

  console.log(`Using: ${ffmpegPath}\n`);

  const wavFiles = findWavFiles(SOUNDS_DIR);

  if (wavFiles.length === 0) {
    console.log('No WAV files found in public/sounds/');
    return;
  }

  console.log(`Found ${wavFiles.length} WAV file(s)\n`);

  for (const file of wavFiles) {
    compressFile(file, ffmpegPath);
  }

  console.log('\n✨ Compression complete!');
  console.log('\n📝 Next steps:');
  console.log('  1. Update useAudio.ts to use .mp3 instead of .wav');
  console.log('  2. Test the audio playback');
  console.log('  3. Delete the original .wav files if everything works');
}

main().catch(console.error);
