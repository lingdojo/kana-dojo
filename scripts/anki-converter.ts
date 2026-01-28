#!/usr/bin/env node
/**
 * Anki Converter CLI Tool
 *
 * Command-line interface for converting Anki deck files to JSON format.
 * Supports APKG, TSV, SQLite, COLPKG, and ANKI2 formats.
 *
 * Usage:
 *   npm run anki:convert -- --input deck.apkg --output deck.json
 *   npm run anki:convert -- -i deck.apkg -o deck.json --include-stats
 */

import { Command } from 'commander';
import { readFile, writeFile } from 'fs/promises';
import { basename } from 'path';
import { createConversionPipeline } from '../features/AnkiConverter/lib/conversionPipeline.js';
import type {
  ConversionOptions,
  ConversionResult,
  ProgressEvent,
} from '../features/AnkiConverter/types/index.js';
import { ConversionError } from '../features/AnkiConverter/types/index.js';

/**
 * CLI version
 */
const VERSION = '1.0.0';

/**
 * Progress bar configuration
 */
const PROGRESS_BAR_WIDTH = 40;

/**
 * Create a progress bar string
 */
function createProgressBar(progress: number): string {
  const filled = Math.round((progress / 100) * PROGRESS_BAR_WIDTH);
  const empty = PROGRESS_BAR_WIDTH - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${progress}%`;
}

/**
 * Clear the current line in terminal
 */
function clearLine(): void {
  process.stdout.write('\r\x1b[K');
}

/**
 * Display progress in terminal
 */
function displayProgress(event: ProgressEvent): void {
  const progressBar = createProgressBar(event.progress);
  const stage = event.stage.charAt(0).toUpperCase() + event.stage.slice(1);
  clearLine();
  process.stdout.write(`${stage}: ${progressBar} - ${event.message}`);
}

/**
 * Display error message to stderr
 */
function displayError(error: ConversionError | Error): void {
  console.error('\n❌ Conversion failed:');
  console.error(`   ${error.message}`);

  if (error instanceof ConversionError) {
    if (error.details) {
      console.error('\n   Details:');
      for (const [key, value] of Object.entries(error.details)) {
        console.error(`   - ${key}: ${value}`);
      }
    }
  }

  console.error('');
}

/**
 * Display success message with statistics
 */
function displaySuccess(result: ConversionResult, outputPath: string): void {
  console.log('\n\n✅ Conversion successful!');
  console.log(`   Output: ${outputPath}`);
  console.log(`   Decks: ${result.metadata.totalDecks}`);
  console.log(`   Cards: ${result.metadata.totalCards}`);
  console.log(
    `   Processing time: ${(result.metadata.processingTime / 1000).toFixed(2)}s`,
  );
  console.log('');
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  const program = new Command();

  program
    .name('anki-converter')
    .description('Convert Anki deck files to JSON format')
    .version(VERSION)
    .requiredOption(
      '-i, --input <path>',
      'Input file path (APKG, TSV, SQLite, COLPKG, or ANKI2)',
    )
    .requiredOption('-o, --output <path>', 'Output JSON file path')
    .option('--include-stats', 'Include card statistics in output', false)
    .option('--include-suspended', 'Include suspended cards in output', false)
    .option(
      '--format <format>',
      'Force specific format (auto, apkg, tsv, sqlite, colpkg, anki2)',
      'auto',
    )
    .addHelpText(
      'after',
      `
Examples:
  $ npm run anki:convert -- --input deck.apkg --output deck.json
  $ npm run anki:convert -- -i deck.apkg -o deck.json --include-stats
  $ npm run anki:convert -- -i deck.tsv -o deck.json --format tsv
  $ npm run anki:convert -- -i collection.anki2 -o output.json --include-suspended

Supported Formats:
  - APKG files (.apkg) - Anki package format
  - TSV files (.tsv) - Tab-separated values
  - SQLite databases (.db, .sqlite, .anki2) - Direct Anki database files
  - COLPKG files (.colpkg) - Collection packages

Privacy:
  All processing happens locally on your machine. No data is sent to external servers.
`,
    );

  program.parse();

  const options = program.opts<{
    input: string;
    output: string;
    includeStats?: boolean;
    includeSuspended?: boolean;
    format?: string;
  }>();

  try {
    // Read input file
    console.log(`📖 Reading file: ${options.input}`);
    const buffer = await readFile(options.input);

    // Create conversion options
    const conversionOptions: ConversionOptions = {
      includeStats: options.includeStats,
      includeSuspended: options.includeSuspended,
      format:
        options.format === 'auto'
          ? undefined
          : (options.format as ConversionOptions['format']),
    };

    // Create pipeline and set up progress tracking
    const pipeline = createConversionPipeline();

    pipeline.on('progress', displayProgress);

    pipeline.on('error', error => {
      displayError(error);
    });

    // Convert
    console.log('🔄 Starting conversion...\n');
    const result = await pipeline.convert(
      buffer.buffer as ArrayBuffer,
      conversionOptions,
    );

    // Write output
    clearLine();
    console.log('\n💾 Writing output file...');
    const jsonOutput = JSON.stringify(result, null, 2);
    await writeFile(options.output, jsonOutput, 'utf-8');

    // Display success
    displaySuccess(result, options.output);

    process.exit(0);
  } catch (error) {
    if (error instanceof ConversionError) {
      displayError(error);
    } else if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        console.error('\n❌ Error: Input file not found');
        console.error(`   ${options.input}\n`);
      } else if (error.message.includes('EACCES')) {
        console.error('\n❌ Error: Permission denied');
        console.error(`   Cannot read/write file\n`);
      } else {
        displayError(error);
      }
    } else {
      console.error('\n❌ An unexpected error occurred\n');
    }

    process.exit(1);
  }
}

// Run CLI
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
