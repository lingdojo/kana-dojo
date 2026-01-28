/**
 * SQLite Parser Tests
 *
 * Property-based tests for SQLite database parsing.
 *
 * **Feature: anki-converter, Property 4: Card count preservation**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import path from 'path';
import {
  parseSQLite,
  openDatabase,
  detectSchemaVersion,
  extractNotes,
  extractCards,
  extractDecks,
  extractNoteTypes,
  extractMetadata,
  getCardCount,
  validateAnkiDatabase,
} from '../parsers/sqliteParser';
import { ConversionError, ErrorCode } from '../types';

// sql.js instance
let SQL: SqlJsStatic;

beforeAll(async () => {
  // In Node.js test environment, use the local node_modules path
  SQL = await initSqlJs({
    locateFile: (file: string) =>
      path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
  });
});

/**
 * Create a minimal valid Anki database with the given data
 */
function createAnkiDatabase(options: {
  notes?: Array<{
    id: number;
    guid: string;
    mid: number;
    fields: string[];
    tags: string[];
  }>;
  cards?: Array<{
    id: number;
    nid: number;
    did: number;
    ord?: number;
    type?: number;
    queue?: number;
  }>;
  decks?: Record<string, { id: number; name: string; desc?: string }>;
  models?: Record<
    string,
    {
      id: number;
      name: string;
      type?: number;
      flds?: Array<{ name: string; ord: number }>;
      tmpls?: Array<{ name: string; ord: number; qfmt: string; afmt: string }>;
    }
  >;
  schemaVersion?: number;
}): ArrayBuffer {
  const db = new SQL.Database();

  // Create col table (collection metadata)
  db.run(`
    CREATE TABLE col (
      id INTEGER PRIMARY KEY,
      crt INTEGER NOT NULL,
      mod INTEGER NOT NULL,
      scm INTEGER NOT NULL,
      ver INTEGER NOT NULL,
      dty INTEGER NOT NULL,
      usn INTEGER NOT NULL,
      ls INTEGER NOT NULL,
      conf TEXT NOT NULL,
      models TEXT NOT NULL,
      decks TEXT NOT NULL,
      dconf TEXT NOT NULL,
      tags TEXT NOT NULL
    )
  `);

  // Create notes table
  db.run(`
    CREATE TABLE notes (
      id INTEGER PRIMARY KEY,
      guid TEXT NOT NULL,
      mid INTEGER NOT NULL,
      mod INTEGER NOT NULL,
      usn INTEGER NOT NULL,
      tags TEXT NOT NULL,
      flds TEXT NOT NULL,
      sfld TEXT NOT NULL,
      csum INTEGER NOT NULL,
      flags INTEGER NOT NULL,
      data TEXT NOT NULL
    )
  `);

  // Create cards table
  db.run(`
    CREATE TABLE cards (
      id INTEGER PRIMARY KEY,
      nid INTEGER NOT NULL,
      did INTEGER NOT NULL,
      ord INTEGER NOT NULL,
      mod INTEGER NOT NULL,
      usn INTEGER NOT NULL,
      type INTEGER NOT NULL,
      queue INTEGER NOT NULL,
      due INTEGER NOT NULL,
      ivl INTEGER NOT NULL,
      factor INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      lapses INTEGER NOT NULL,
      left INTEGER NOT NULL,
      odue INTEGER NOT NULL,
      odid INTEGER NOT NULL,
      flags INTEGER NOT NULL,
      data TEXT NOT NULL
    )
  `);

  // Default decks
  const decks = options.decks || {
    '1': { id: 1, name: 'Default', desc: '' },
  };

  // Default models (note types)
  const models = options.models || {
    '1': {
      id: 1,
      name: 'Basic',
      type: 0,
      flds: [
        { name: 'Front', ord: 0 },
        { name: 'Back', ord: 1 },
      ],
      tmpls: [{ name: 'Card 1', ord: 0, qfmt: '{{Front}}', afmt: '{{Back}}' }],
    },
  };

  // Insert collection metadata
  const schemaVersion = options.schemaVersion ?? 11;
  db.run(`INSERT INTO col VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    1, // id
    Math.floor(Date.now() / 1000), // crt (creation time)
    Math.floor(Date.now() / 1000), // mod
    Math.floor(Date.now() / 1000), // scm
    schemaVersion, // ver
    0, // dty
    -1, // usn
    0, // ls
    '{}', // conf
    JSON.stringify(models), // models
    JSON.stringify(decks), // decks
    '{}', // dconf
    '{}', // tags
  ]);

  // Insert notes
  const notes = options.notes || [];
  for (const note of notes) {
    db.run(`INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      note.id,
      note.guid,
      note.mid,
      Math.floor(Date.now() / 1000),
      -1,
      note.tags.join(' '),
      note.fields.join('\x1f'),
      note.fields[0] || '',
      0,
      0,
      '',
    ]);
  }

  // Insert cards
  const cards = options.cards || [];
  for (const card of cards) {
    db.run(
      `INSERT INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        card.id,
        card.nid,
        card.did,
        card.ord ?? 0,
        Math.floor(Date.now() / 1000),
        -1,
        card.type ?? 0,
        card.queue ?? 0,
        0,
        0,
        2500,
        0,
        0,
        0,
        0,
        0,
        0,
        '',
      ],
    );
  }

  const data = db.export();
  db.close();
  return data.buffer as ArrayBuffer;
}

/**
 * Generate a unique ID
 */
function generateId(): number {
  return Math.floor(Math.random() * 1000000000) + Date.now();
}

/**
 * Generate a random GUID
 */
function generateGuid(): string {
  return Math.random().toString(36).substring(2, 12);
}

describe('SQLite Parser', () => {
  describe('openDatabase', () => {
    it('should open a valid SQLite database', async () => {
      const dbBuffer = createAnkiDatabase({});
      const db = await openDatabase(dbBuffer);
      expect(db).toBeDefined();
      db.close();
    });

    it('should throw ConversionError for invalid data', async () => {
      // sql.js creates an empty database for invalid data, so we need to test
      // that the database is not a valid Anki database by checking schema
      const invalidData = new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer;

      // sql.js will create an empty database, but it won't have the col table
      const db = await openDatabase(invalidData);
      expect(() => detectSchemaVersion(db)).toThrow(ConversionError);
      db.close();
    });
  });

  describe('detectSchemaVersion', () => {
    it('should detect schema version from database', async () => {
      const dbBuffer = createAnkiDatabase({ schemaVersion: 11 });
      const db = await openDatabase(dbBuffer);

      const version = detectSchemaVersion(db);

      expect(version.version).toBe(11);
      expect(version.isLegacy).toBe(false);
      db.close();
    });

    it('should detect legacy schema (v2)', async () => {
      const dbBuffer = createAnkiDatabase({ schemaVersion: 2 });
      const db = await openDatabase(dbBuffer);

      const version = detectSchemaVersion(db);

      expect(version.version).toBe(2);
      expect(version.isLegacy).toBe(true);
      db.close();
    });
  });

  describe('extractNotes', () => {
    it('should extract notes from database', async () => {
      const dbBuffer = createAnkiDatabase({
        notes: [
          {
            id: 1,
            guid: 'abc123',
            mid: 1,
            fields: ['Front text', 'Back text'],
            tags: ['tag1', 'tag2'],
          },
        ],
      });
      const db = await openDatabase(dbBuffer);

      const notes = extractNotes(db);

      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe(1);
      expect(notes[0].guid).toBe('abc123');
      expect(notes[0].fields).toEqual(['Front text', 'Back text']);
      expect(notes[0].tags).toEqual(['tag1', 'tag2']);
      db.close();
    });

    it('should return empty array for database with no notes', async () => {
      const dbBuffer = createAnkiDatabase({ notes: [] });
      const db = await openDatabase(dbBuffer);

      const notes = extractNotes(db);

      expect(notes).toHaveLength(0);
      db.close();
    });
  });

  describe('extractCards', () => {
    it('should extract cards from database', async () => {
      const dbBuffer = createAnkiDatabase({
        notes: [{ id: 1, guid: 'abc', mid: 1, fields: ['F', 'B'], tags: [] }],
        cards: [
          { id: 100, nid: 1, did: 1, ord: 0, type: 0, queue: 0 },
          { id: 101, nid: 1, did: 1, ord: 1, type: 0, queue: 0 },
        ],
      });
      const db = await openDatabase(dbBuffer);

      const cards = extractCards(db);

      expect(cards).toHaveLength(2);
      expect(cards[0].id).toBe(100);
      expect(cards[0].noteId).toBe(1);
      expect(cards[1].id).toBe(101);
      db.close();
    });
  });

  describe('extractDecks', () => {
    it('should extract decks from database', async () => {
      const dbBuffer = createAnkiDatabase({
        decks: {
          '1': { id: 1, name: 'Default', desc: 'Default deck' },
          '2': { id: 2, name: 'Japanese::Vocabulary', desc: 'Vocab deck' },
        },
      });
      const db = await openDatabase(dbBuffer);
      const schemaVersion = detectSchemaVersion(db);

      const decks = extractDecks(db, schemaVersion);

      expect(decks).toHaveLength(2);
      expect(decks.map(d => d.name)).toContain('Default');
      expect(decks.map(d => d.name)).toContain('Japanese::Vocabulary');
      db.close();
    });
  });

  describe('extractNoteTypes', () => {
    it('should extract note types from database', async () => {
      const dbBuffer = createAnkiDatabase({
        models: {
          '1': {
            id: 1,
            name: 'Basic',
            type: 0,
            flds: [
              { name: 'Front', ord: 0 },
              { name: 'Back', ord: 1 },
            ],
            tmpls: [
              { name: 'Card 1', ord: 0, qfmt: '{{Front}}', afmt: '{{Back}}' },
            ],
          },
          '2': {
            id: 2,
            name: 'Cloze',
            type: 1,
            flds: [{ name: 'Text', ord: 0 }],
            tmpls: [],
          },
        },
      });
      const db = await openDatabase(dbBuffer);
      const schemaVersion = detectSchemaVersion(db);

      const noteTypes = extractNoteTypes(db, schemaVersion);

      expect(noteTypes).toHaveLength(2);
      expect(noteTypes.map(nt => nt.name)).toContain('Basic');
      expect(noteTypes.map(nt => nt.name)).toContain('Cloze');
      db.close();
    });
  });

  describe('extractMetadata', () => {
    it('should extract metadata from database', async () => {
      const dbBuffer = createAnkiDatabase({ schemaVersion: 11 });
      const db = await openDatabase(dbBuffer);

      const metadata = extractMetadata(db);

      expect(metadata.ver).toBe(11);
      expect(metadata.creation).toBeGreaterThan(0);
      db.close();
    });
  });

  describe('parseSQLite', () => {
    it('should parse a complete Anki database', async () => {
      const dbBuffer = createAnkiDatabase({
        notes: [
          {
            id: 1,
            guid: 'abc',
            mid: 1,
            fields: ['Hello', 'World'],
            tags: ['test'],
          },
        ],
        cards: [{ id: 100, nid: 1, did: 1 }],
        decks: { '1': { id: 1, name: 'Test Deck' } },
        models: {
          '1': {
            id: 1,
            name: 'Basic',
            type: 0,
            flds: [
              { name: 'Front', ord: 0 },
              { name: 'Back', ord: 1 },
            ],
            tmpls: [],
          },
        },
      });

      const result = await parseSQLite(dbBuffer);

      expect(result.notes).toHaveLength(1);
      expect(result.cards).toHaveLength(1);
      expect(result.decks).toHaveLength(1);
      expect(result.noteTypes).toHaveLength(1);
      expect(result.metadata.ver).toBeGreaterThan(0);
    });

    it('should handle empty database', async () => {
      const dbBuffer = createAnkiDatabase({
        notes: [],
        cards: [],
      });

      const result = await parseSQLite(dbBuffer);

      expect(result.notes).toHaveLength(0);
      expect(result.cards).toHaveLength(0);
    });
  });

  describe('getCardCount', () => {
    it('should return correct card count', async () => {
      const dbBuffer = createAnkiDatabase({
        notes: [{ id: 1, guid: 'a', mid: 1, fields: ['F', 'B'], tags: [] }],
        cards: [
          { id: 100, nid: 1, did: 1 },
          { id: 101, nid: 1, did: 1 },
          { id: 102, nid: 1, did: 1 },
        ],
      });

      const count = await getCardCount(dbBuffer);

      expect(count).toBe(3);
    });

    it('should return 0 for empty database', async () => {
      const dbBuffer = createAnkiDatabase({ cards: [] });

      const count = await getCardCount(dbBuffer);

      expect(count).toBe(0);
    });
  });

  describe('validateAnkiDatabase', () => {
    it('should return valid for proper Anki database', async () => {
      const dbBuffer = createAnkiDatabase({});

      const result = await validateAnkiDatabase(dbBuffer);

      expect(result.valid).toBe(true);
      expect(result.version).toBeDefined();
    });

    it('should return invalid for non-Anki database', async () => {
      const invalidData = new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer;

      const result = await validateAnkiDatabase(invalidData);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  /**
   * Property-based tests
   *
   * **Feature: anki-converter, Property 4: Card count preservation**
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
   */
  describe('Property 4: Card count preservation', () => {
    it('should preserve the exact number of cards from source database', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate 0-50 cards
          fc.integer({ min: 0, max: 50 }),
          async cardCount => {
            // Create notes (1 note per card for simplicity)
            const notes = Array.from({ length: cardCount }, (_, i) => ({
              id: generateId() + i,
              guid: generateGuid(),
              mid: 1,
              fields: [`Front ${i}`, `Back ${i}`],
              tags: [],
            }));

            // Create cards linked to notes
            const cards = notes.map((note, i) => ({
              id: generateId() + i + 1000,
              nid: note.id,
              did: 1,
              ord: 0,
              type: 0,
              queue: 0,
            }));

            const dbBuffer = createAnkiDatabase({ notes, cards });
            const result = await parseSQLite(dbBuffer);

            // Property: card count in output equals card count in input
            return result.cards.length === cardCount;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should preserve card count with multiple cards per note', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate 1-10 notes with 1-5 cards each
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 5 }),
          async (noteCount, cardsPerNote) => {
            const notes = Array.from({ length: noteCount }, (_, i) => ({
              id: generateId() + i,
              guid: generateGuid(),
              mid: 1,
              fields: [`Front ${i}`, `Back ${i}`],
              tags: [],
            }));

            // Create multiple cards per note
            const cards: Array<{
              id: number;
              nid: number;
              did: number;
              ord: number;
              type: number;
              queue: number;
            }> = [];
            let cardId = generateId();
            for (const note of notes) {
              for (let ord = 0; ord < cardsPerNote; ord++) {
                cards.push({
                  id: cardId++,
                  nid: note.id,
                  did: 1,
                  ord,
                  type: 0,
                  queue: 0,
                });
              }
            }

            const expectedCardCount = noteCount * cardsPerNote;
            const dbBuffer = createAnkiDatabase({ notes, cards });
            const result = await parseSQLite(dbBuffer);

            return result.cards.length === expectedCardCount;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should preserve card count across different deck distributions', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate 1-5 decks with 1-10 cards each
          fc.array(
            fc.record({
              deckId: fc.integer({ min: 1, max: 100 }),
              deckName: fc
                .string({ minLength: 1, maxLength: 20 })
                .filter(s => !s.includes('"')),
              cardCount: fc.integer({ min: 1, max: 10 }),
            }),
            { minLength: 1, maxLength: 5 },
          ),
          async deckConfigs => {
            // Ensure unique deck IDs
            const uniqueDecks = deckConfigs.reduce(
              (acc, config, i) => {
                const deckId = i + 1;
                acc[deckId.toString()] = {
                  id: deckId,
                  name: config.deckName || `Deck ${deckId}`,
                };
                return acc;
              },
              {} as Record<string, { id: number; name: string }>,
            );

            // Create notes and cards for each deck
            const notes: Array<{
              id: number;
              guid: string;
              mid: number;
              fields: string[];
              tags: string[];
            }> = [];
            const cards: Array<{
              id: number;
              nid: number;
              did: number;
              ord: number;
              type: number;
              queue: number;
            }> = [];

            let noteId = generateId();
            let cardId = generateId() + 10000;

            deckConfigs.forEach((config, deckIndex) => {
              const deckId = deckIndex + 1;
              for (let i = 0; i < config.cardCount; i++) {
                const nid = noteId++;
                notes.push({
                  id: nid,
                  guid: generateGuid(),
                  mid: 1,
                  fields: [`Front ${nid}`, `Back ${nid}`],
                  tags: [],
                });
                cards.push({
                  id: cardId++,
                  nid,
                  did: deckId,
                  ord: 0,
                  type: 0,
                  queue: 0,
                });
              }
            });

            const expectedTotalCards = deckConfigs.reduce(
              (sum, config) => sum + config.cardCount,
              0,
            );

            const dbBuffer = createAnkiDatabase({
              notes,
              cards,
              decks: uniqueDecks,
            });
            const result = await parseSQLite(dbBuffer);

            return result.cards.length === expectedTotalCards;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should preserve card count with suspended cards', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 20 }), // active cards
          fc.integer({ min: 0, max: 20 }), // suspended cards
          async (activeCount, suspendedCount) => {
            const totalCards = activeCount + suspendedCount;
            const notes = Array.from({ length: totalCards }, (_, i) => ({
              id: generateId() + i,
              guid: generateGuid(),
              mid: 1,
              fields: [`Front ${i}`, `Back ${i}`],
              tags: [],
            }));

            const cards = notes.map((note, i) => ({
              id: generateId() + i + 1000,
              nid: note.id,
              did: 1,
              ord: 0,
              type: 0,
              queue: i < activeCount ? 0 : -1, // -1 = suspended
            }));

            const dbBuffer = createAnkiDatabase({ notes, cards });
            const result = await parseSQLite(dbBuffer);

            // All cards should be preserved, including suspended ones
            return result.cards.length === totalCards;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should match getCardCount with parsed card array length', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 0, max: 30 }), async cardCount => {
          const notes = Array.from({ length: cardCount }, (_, i) => ({
            id: generateId() + i,
            guid: generateGuid(),
            mid: 1,
            fields: [`F${i}`, `B${i}`],
            tags: [],
          }));

          const cards = notes.map((note, i) => ({
            id: generateId() + i + 1000,
            nid: note.id,
            did: 1,
          }));

          const dbBuffer = createAnkiDatabase({ notes, cards });

          // Both methods should return the same count
          const countFromHelper = await getCardCount(dbBuffer);
          const result = await parseSQLite(dbBuffer);

          return (
            countFromHelper === cardCount &&
            result.cards.length === cardCount &&
            countFromHelper === result.cards.length
          );
        }),
        { numRuns: 100 },
      );
    });
  });
});
