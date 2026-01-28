/**
 * Anki Data Structure Types
 *
 * Types representing Anki's internal data structures.
 */

/**
 * Parsed data from an Anki file (intermediate format)
 */
export interface ParsedAnkiData {
  notes: Note[];
  cards: Card[];
  decks: DeckInfo[];
  noteTypes: NoteType[];
  metadata: AnkiMetadata;
}

/**
 * A note in Anki - the underlying data structure that generates cards
 */
export interface Note {
  id: number;
  guid: string;
  noteTypeId: number;
  fields: string[]; // Raw HTML content
  tags: string[];
  mod: number; // Modification timestamp
}

/**
 * A card in Anki - a single flashcard instance
 */
export interface Card {
  id: number;
  noteId: number;
  deckId: number;
  ord: number; // Card template ordinal
  type: number; // 0=new, 1=learning, 2=review
  queue: number; // -1=suspended
  due: number;
  ivl: number; // Interval
  factor: number;
  reps: number;
  lapses: number;
}

/**
 * Deck information from Anki
 */
export interface DeckInfo {
  id: number;
  name: string; // Can be nested: "Parent::Child"
  desc: string;
  conf: number;
}

/**
 * Note type (template) definition
 */
export interface NoteType {
  id: number;
  name: string;
  type: number; // 0=standard, 1=cloze
  flds: Field[];
  tmpls: Template[];
}

/**
 * Field definition within a note type
 */
export interface Field {
  name: string;
  ord: number;
  sticky: boolean;
  rtl: boolean;
  font: string;
  size: number;
}

/**
 * Card template definition
 */
export interface Template {
  name: string;
  ord: number;
  qfmt: string; // Question format
  afmt: string; // Answer format
}

/**
 * Anki collection metadata
 */
export interface AnkiMetadata {
  creation: number;
  mod: number;
  scm: number;
  ver: number; // Schema version
  dty: number;
  usn: number;
  ls: number;
}
