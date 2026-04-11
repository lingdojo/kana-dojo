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

// Japanese language messages
const messages = {
  title: 'Audio Compression Script',
  titleJP: 'Audio Compression Script',
  settingUpFFmpeg: 'Setting up portable ffmpeg...',
  settingUpFFmpegJP: 'Setting up portable ffmpeg...',
  downloading: 'Downloading ffmpeg (this may take a minute)...',
  downloadingJP: 'Downloading ffmpeg (this may take a minute)...',
  extracting: 'Extracting...',
  extractingJP: 'Extracting...',
  ffmpegReady: 'ffmpeg ready!',
  ffmpegReadyJP: 'ffmpeg ready!',
  ffmpegSetupFailed: 'Failed to setup ffmpeg:',
  ffmpegSetupFailedJP: 'Failed to setup ffmpeg:',
  using: 'Using:',
  usingJP: 'Using:',
  foundWavFiles: 'Found',
  foundWavFilesJP: 'Found',
  wavFiles: 'WAV file(s)',
  wavFilesJP: 'WAV file(s)',
  noWavFiles: 'No WAV files found in public/sounds/',
  noWavFilesJP: 'No WAV files found in public/sounds/',
  converting: 'Converting',
  convertingJP: 'Converting',
  skipping: 'Skipping',
  skippingJP: 'Skipping',
  mp3Exists: '(MP3 already exists)',
  mp3ExistsJP: '(MP3 already exists)',
  compressionComplete: 'Compression complete!',
  compressionCompleteJP: 'Compression complete!',
  nextSteps: 'Next steps:',
  nextStepsJP: 'Next steps:',
  step1: 'Update useAudio.ts to use .mp3 instead of .wav',
  step1JP: 'Update useAudio.ts to use .mp3 instead of .wav',
  step2: 'Test the audio playback',
  step2JP: 'Test the audio playback',
  step3: 'Delete the original .wav files if everything works',
  step3JP: 'Delete the original .wav files if everything works',
  ffmpegNotFound: 'Could not find ffmpeg after setup',
  ffmpegNotFoundJP: 'Could not find ffmpeg after setup',
  convertFailed: 'Failed to convert',
  convertFailedJP: 'Failed to convert',
  kanaDojo: 'KanaDojo',
  hiragana: 'Hiragana',
  katakana: 'Katakana',
  kanji: 'Kanji',
  vocabulary: 'Vocabulary'
};

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
        fs.unlink(dest, () => { });
        reject(err);
      });
  });
}

async function setupFFmpeg() {
  console.log(`${messages.kanaDojo} ${messages.settingUpFFmpegJP}\n`);

  const zipPath = path.join(__dirname, 'ffmpeg.zip');

  try {
    console.log(`${messages.kanaDojo} ${messages.downloadingJP}`);
    await downloadFile(FFMPEG_URL, zipPath);

    console.log(`${messages.kanaDojo} ${messages.extractingJP}`);

    // Use PowerShell to extract on Windows
    execSync(
      `powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${FFMPEG_DIR}' -Force"`,
      { stdio: 'inherit' },
    );

    fs.unlinkSync(zipPath);
    console.log(`${messages.kanaDojo} ${messages.ffmpegReadyJP}\n`);
  } catch (error) {
    console.error(`${messages.kanaDojo} ${messages.ffmpegSetupFailedJP}`, error.message);
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
    console.log(` ${messages.kanaDojo} ${messages.skippingJP} ${path.basename(wavPath)} ${messages.mp3ExistsJP}`);
    return;
  }

  const originalSize = fs.statSync(wavPath).size;

  try {
    console.log(` ${messages.kanaDojo} ${messages.convertingJP} ${path.basename(wavPath)}...`);

    execSync(
      `"${ffmpegPath}" -i "${wavPath}" -codec:a libmp3lame -qscale:a 2 "${mp3Path}" -y`,
      { stdio: 'ignore' },
    );

    const newSize = fs.statSync(mp3Path).size;
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

    console.log(
      ` ${messages.kanaDojo} ${path.basename(wavPath)}: ${(originalSize / 1024).toFixed(1)}KB -> ${(
        newSize / 1024
      ).toFixed(1)}KB (${savings}% smaller)`,
    );
  } catch (error) {
    console.error(
      `${messages.kanaDojo} ${messages.convertFailedJP} ${path.basename(wavPath)}:`,
      error.message,
    );
  }
}

async function main() {
  // console.log(' Audio Compression Script\n');
  // console.log('🎵 Audio Compression Script\n');
  console.log(` ${messages.kanaDojo} ${messages.titleJP}\n`);
  console.log(` ${messages.hiragana} | ${messages.katakana} | ${messages.kanji} | ${messages.vocabulary}\n`);

  let ffmpegPath = findFFmpegExe();

  if (!ffmpegPath) {
    await setupFFmpeg();
    ffmpegPath = findFFmpegExe();

    if (!ffmpegPath) {
      console.error(`${messages.kanaDojo} ${messages.ffmpegNotFoundJP}`);
      process.exit(1);
    }
  }

  console.log(`${messages.kanaDojo} ${messages.usingJP} ${ffmpegPath}\n`);

  const wavFiles = findWavFiles(SOUNDS_DIR);

  if (wavFiles.length === 0) {
    console.log(`${messages.kanaDojo} ${messages.noWavFilesJP}`);
    return;
  }

  console.log(`${messages.kanaDojo} ${messages.foundWavFilesJP} ${wavFiles.length} ${messages.wavFilesJP}\n`);

  for (const file of wavFiles) {
    compressFile(file, ffmpegPath);
  }

  console.log(`\n ${messages.kanaDojo} ${messages.compressionCompleteJP}`);
  console.log(`\n ${messages.kanaDojo} ${messages.nextStepsJP}`);
  console.log(`  1. ${messages.step1JP}`);
  console.log(`  2. ${messages.step2JP}`);
  console.log(`  3. ${messages.step3JP}`);
}

main().catch(console.error);
