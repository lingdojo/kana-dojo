/**
 * Output JSON Structure Types
 *
 * Types for the converted JSON output format.
 */

/**
 * A deck in the output JSON
 */
export interface Deck {
  name: string;
  description: string;
  cards: OutputCard[];
  subdecks?: Deck[]; // For nested decks
}

/**
 * Base output card structure
 */
export interface OutputCard {
  id: string;
  type: 'basic' | 'cloze' | 'custom';
  fields: Record<string, string>; // Field name -> cleaned text
  tags: string[];
  stats?: CardStats; // Optional
  suspended?: boolean; // Optional
}

/**
 * Basic card with front/back structure
 */
export interface BasicCard extends OutputCard {
  type: 'basic';
  front: string;
  back: string;
}

/**
 * Cloze card with deletions
 */
export interface ClozeCard extends OutputCard {
  type: 'cloze';
  text: string; // Full text with {{c1::...}} markers
  clozes: ClozeVariation[];
}

/**
 * A single cloze variation
 */
export interface ClozeVariation {
  index: number;
  text: string; // Text with this cloze hidden
  answer: string; // The hidden text
}

/**
 * Custom note type card
 */
export interface CustomCard extends OutputCard {
  type: 'custom';
  noteType: string;
}

/**
 * Card review statistics
 */
export interface CardStats {
  reviews: number;
  lapses: number;
  interval: number;
  ease: number;
}

/**
 * Metadata about the conversion
 */
export interface ConversionMetadata {
  convertedAt: string; // ISO timestamp
  sourceFormat: string;
  totalDecks: number;
  totalCards: number;
  noteTypes: string[];
  ankiVersion?: string;
  processingTime: number; // milliseconds
}
