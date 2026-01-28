/**
 * CLI Argument Parsing Tests
 *
 * Unit tests for CLI argument parsing and help display.
 *
 * **Validates: Requirements 2.3, 2.4**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';

describe('CLI Argument Parsing', () => {
  let program: Command;
  let stdoutWriteSpy: any;
  let stderrWriteSpy: any;
  let processExitSpy: any;
  let stdoutOutput: string[];
  let stderrOutput: string[];

  beforeEach(() => {
    program = new Command();
    stdoutOutput = [];
    stderrOutput = [];

    stdoutWriteSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk: unknown) => {
        stdoutOutput.push(String(chunk));
        return true;
      });

    stderrWriteSpy = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation((chunk: unknown) => {
        stderrOutput.push(String(chunk));
        return true;
      });

    processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as never);
  });

  afterEach(() => {
    stdoutWriteSpy.mockRestore();
    stderrWriteSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('Help Flag', () => {
    it('should display documentation when --help flag is used', () => {
      program
        .name('anki-converter')
        .description('Convert Anki deck files to JSON format')
        .version('1.0.0')
        .requiredOption('-i, --input <path>', 'Input file path')
        .requiredOption('-o, --output <path>', 'Output JSON file path')
        .option('--include-stats', 'Include card statistics in output', false)
        .option(
          '--include-suspended',
          'Include suspended cards in output',
          false,
        )
        .addHelpText(
          'after',
          `
Examples:
  $ npm run anki:convert -- --input deck.apkg --output deck.json
`,
        );

      try {
        program.parse(['node', 'anki-converter', '--help']);
      } catch {
        // Commander throws when displaying help
      }

      // Verify help was displayed
      const helpOutput = stdoutOutput.join('');

      // Check for key documentation elements
      expect(helpOutput).toContain('Convert Anki deck files to JSON format');
      expect(helpOutput).toContain('-i, --input');
      expect(helpOutput).toContain('-o, --output');
      expect(helpOutput).toContain('--include-stats');
      expect(helpOutput).toContain('--include-suspended');
      expect(helpOutput).toContain('Examples:');
    });

    it('should display documentation when -h flag is used', () => {
      program
        .name('anki-converter')
        .description('Convert Anki deck files to JSON format')
        .version('1.0.0')
        .requiredOption('-i, --input <path>', 'Input file path')
        .requiredOption('-o, --output <path>', 'Output JSON file path');

      try {
        program.parse(['node', 'anki-converter', '-h']);
      } catch {
        // Commander throws when displaying help
      }

      const helpOutput = stdoutOutput.join('');
      expect(helpOutput).toContain('Convert Anki deck files to JSON format');
    });
  });

  describe('Missing Parameters', () => {
    it('should show usage when input parameter is missing', () => {
      program
        .name('anki-converter')
        .description('Convert Anki deck files to JSON format')
        .version('1.0.0')
        .requiredOption('-i, --input <path>', 'Input file path')
        .requiredOption('-o, --output <path>', 'Output JSON file path')
        .exitOverride(); // Prevent actual exit

      try {
        program.parse(['node', 'anki-converter', '--output', 'out.json']);
      } catch (error) {
        // Commander throws CommanderError for missing required options
        expect(error).toBeDefined();
      }

      // Verify error message was displayed
      const errorOutput = stderrOutput.join('');
      expect(errorOutput).toContain('required option');
      expect(errorOutput).toContain('--input');
    });

    it('should show usage when output parameter is missing', () => {
      program
        .name('anki-converter')
        .description('Convert Anki deck files to JSON format')
        .version('1.0.0')
        .requiredOption('-i, --input <path>', 'Input file path')
        .requiredOption('-o, --output <path>', 'Output JSON file path')
        .exitOverride();

      try {
        program.parse(['node', 'anki-converter', '--input', 'deck.apkg']);
      } catch (error) {
        expect(error).toBeDefined();
      }

      const errorOutput = stderrOutput.join('');
      expect(errorOutput).toContain('required option');
      expect(errorOutput).toContain('--output');
    });

    it('should show usage when both parameters are missing', () => {
      program
        .name('anki-converter')
        .description('Convert Anki deck files to JSON format')
        .version('1.0.0')
        .requiredOption('-i, --input <path>', 'Input file path')
        .requiredOption('-o, --output <path>', 'Output JSON file path')
        .exitOverride();

      try {
        program.parse(['node', 'anki-converter']);
      } catch (error) {
        expect(error).toBeDefined();
      }

      const errorOutput = stderrOutput.join('');
      expect(errorOutput).toContain('required option');
    });
  });

  describe('Valid Arguments', () => {
    it('should parse valid input and output arguments', () => {
      program
        .name('anki-converter')
        .version('1.0.0')
        .requiredOption('-i, --input <path>', 'Input file path')
        .requiredOption('-o, --output <path>', 'Output JSON file path')
        .option('--include-stats', 'Include card statistics', false);

      program.parse([
        'node',
        'anki-converter',
        '--input',
        'deck.apkg',
        '--output',
        'deck.json',
      ]);

      const options = program.opts();
      expect(options.input).toBe('deck.apkg');
      expect(options.output).toBe('deck.json');
      expect(options.includeStats).toBe(false);
    });

    it('should parse short flags correctly', () => {
      program
        .name('anki-converter')
        .version('1.0.0')
        .requiredOption('-i, --input <path>', 'Input file path')
        .requiredOption('-o, --output <path>', 'Output JSON file path');

      program.parse([
        'node',
        'anki-converter',
        '-i',
        'deck.apkg',
        '-o',
        'deck.json',
      ]);

      const options = program.opts();
      expect(options.input).toBe('deck.apkg');
      expect(options.output).toBe('deck.json');
    });

    it('should parse optional flags correctly', () => {
      program
        .name('anki-converter')
        .version('1.0.0')
        .requiredOption('-i, --input <path>', 'Input file path')
        .requiredOption('-o, --output <path>', 'Output JSON file path')
        .option('--include-stats', 'Include card statistics', false)
        .option('--include-suspended', 'Include suspended cards', false);

      program.parse([
        'node',
        'anki-converter',
        '-i',
        'deck.apkg',
        '-o',
        'deck.json',
        '--include-stats',
        '--include-suspended',
      ]);

      const options = program.opts();
      expect(options.input).toBe('deck.apkg');
      expect(options.output).toBe('deck.json');
      expect(options.includeStats).toBe(true);
      expect(options.includeSuspended).toBe(true);
    });

    it('should parse format option correctly', () => {
      program
        .name('anki-converter')
        .version('1.0.0')
        .requiredOption('-i, --input <path>', 'Input file path')
        .requiredOption('-o, --output <path>', 'Output JSON file path')
        .option('--format <format>', 'Force specific format', 'auto');

      program.parse([
        'node',
        'anki-converter',
        '-i',
        'deck.tsv',
        '-o',
        'deck.json',
        '--format',
        'tsv',
      ]);

      const options = program.opts();
      expect(options.format).toBe('tsv');
    });
  });

  describe('Version Flag', () => {
    it('should display version when --version flag is used', () => {
      program.name('anki-converter').version('1.0.0');

      try {
        program.parse(['node', 'anki-converter', '--version']);
      } catch {
        // Commander throws when displaying version
      }

      const output = stdoutOutput.join('');
      expect(output).toContain('1.0.0');
    });
  });
});
