/**
 * Conversion Pipeline Types
 *
 * Types for the conversion process and options.
 */

import type { Deck, ConversionMetadata } from './output';

/**
 * Options for the conversion process
 */
export interface ConversionOptions {
  /** Include review statistics in output */
  includeStats?: boolean;
  /** Include suspended cards in output */
  includeSuspended?: boolean;
  /** Include tags in output (default: true) */
  includeTags?: boolean;
  /** Force specific format detection */
  format?: 'auto' | 'apkg' | 'tsv' | 'sqlite' | 'colpkg' | 'anki2';
}

/**
 * Result of a successful conversion
 */
export interface ConversionResult {
  decks: Deck[];
  metadata: ConversionMetadata;
}

/**
 * Statistics about a completed conversion
 */
export interface ConversionStats {
  totalCards: number;
  totalDecks: number;
  processingTime: number;
  fileName: string;
}

/**
 * Progress event emitted during conversion
 */
export interface ProgressEvent {
  stage: ConversionStage;
  progress: number; // 0-100
  message: string;
}

/**
 * Stages of the conversion pipeline
 */
export type ConversionStage =
  | 'detecting'
  | 'parsing'
  | 'extracting'
  | 'transforming'
  | 'building';

/**
 * Supported file formats
 */
export type SupportedFormat =
  | 'apkg'
  | 'tsv'
  | 'sqlite'
  | 'colpkg'
  | 'anki2'
  | 'unknown';
