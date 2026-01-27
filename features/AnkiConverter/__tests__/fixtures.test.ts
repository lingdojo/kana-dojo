/**
 * Test Fixtures Validation Tests
 *
 * These tests validate that the generated test fixtures are valid
 * and can be parsed correctly by the Anki Converter.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import initSqlJs, { type SqlJsStatic } from 'sql.js';
import JSZip from 'jszip';
import { parseTSV } from '../parsers/tsvParser';
import type {
  ParsedAnkiData,
  Note,
  Card,
  DeckInfo,
  NoteType,
  AnkiMetadata,
} from '../types';

const fixturesDir = join(__dirname, 'fixtures');

// sql.js instance
let SQL: SqlJsStatic;

beforeAll(async () => {
  // Initialize sql.js with Node.js path
  SQL = await initSqlJs({
    locateFile: (file: string) =>
      join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
  });
});

/**
 * Parse APKG file directly using sql.js (bypasses browser detection issues)
 */
async function parseAPKGFixture(buffer: Buffer): Promise<ParsedAnkiData> {
  // Extract database from ZIP
  const zip = await JSZip.loadAsync(buffer);

  let dbFile = zip.file('collection.anki21') || zip.file('collection.anki2');
  if (!dbFile) {
    throw new Error('No database found in APKG');
  }

  const dbBuffer = await dbFile.async('arraybuffer');
  const db = new SQL.Database(new Uint8Array(dbBuffer));

  try {
    // Extract notes
    const notesResult = db.exec(
      'SELECT id, guid, mid, mod, usn, tags, flds FROM notes',
    );
    const notes: Note[] =
      notesResult.length > 0
        ? notesResult[0].values.map((row: any) => ({
            id: row[0] as number,
            guid: row[1] as string,
            noteTypeId: row[2] as number,
            mod: row[3] as number,
            fields: (row[6] as string).split('\x1f'),
            tags: (row[5] as string)
              .trim()
              .split(/\s+/)
              .filter(t => t.length > 0),
          }))
        : [];

    // Extract cards
    const cardsResult = db.exec(
      'SELECT id, nid, did, ord, type, queue, due, ivl, factor, reps, lapses FROM cards',
    );
    const cards: Card[] =
      cardsResult.length > 0
        ? cardsResult[0].values.map((row: any) => ({
            id: row[0] as number,
            noteId: row[1] as number,
            deckId: row[2] as number,
            ord: row[3] as number,
            type: row[4] as number,
            queue: row[5] as number,
            due: row[6] as number,
            ivl: row[7] as number,
            factor: row[8] as number,
            reps: row[9] as number,
            lapses: row[10] as number,
          }))
        : [];

    // Extract decks from col.decks JSON
    const colResult = db.exec(
      'SELECT decks, models, ver, crt, mod, scm FROM col LIMIT 1',
    );
    let decks: DeckInfo[] = [];
    let noteTypes: NoteType[] = [];
    let metadata: AnkiMetadata = {
      creation: 0,
      mod: 0,
      scm: 0,
      ver: 0,
      dty: 0,
      usn: 0,
      ls: 0,
    };

    if (colResult.length > 0 && colResult[0].values.length > 0) {
      const row = colResult[0].values[0];
      const decksJson = JSON.parse(row[0] as string);
      const modelsJson = JSON.parse(row[1] as string);

      decks = Object.values(decksJson).map((d: any) => ({
        id: d.id,
        name: d.name,
        desc: d.desc || '',
        conf: d.conf || 0,
      }));

      noteTypes = Object.values(modelsJson).map((m: any) => ({
        id: m.id,
        name: m.name,
        type: m.type || 0,
        flds: (m.flds || []).map((f: any) => ({
          name: f.name,
          ord: f.ord,
          sticky: f.sticky || false,
          rtl: f.rtl || false,
          font: f.font || 'Arial',
          size: f.size || 20,
        })),
        tmpls: (m.tmpls || []).map((t: any) => ({
          name: t.name,
          ord: t.ord,
          qfmt: t.qfmt || '',
          afmt: t.afmt || '',
        })),
      }));

      metadata = {
        creation: row[3] as number,
        mod: row[4] as number,
        scm: row[5] as number,
        ver: row[2] as number,
        dty: 0,
        usn: 0,
        ls: 0,
      };
    }

    return { notes, cards, decks, noteTypes, metadata };
  } finally {
    db.close();
  }
}

/**
 * Helper to load a fixture file
 */
function loadFixture(filename: string): Buffer {
  return readFileSync(join(fixturesDir, filename));
}

describe('Test Fixtures Validation', () => {
  describe('test-basic.apkg', () => {
    it('should parse successfully', async () => {
      const buffer = loadFixture('test-basic.apkg');
      const result = await parseAPKGFixture(buffer);

      expect(result.notes).toHaveLength(10);
      expect(result.cards).toHaveLength(10);
      expect(result.decks).toHaveLength(1);
      expect(result.decks[0].name).toBe('Basic Japanese');
    });

    it('should have correct note structure', async () => {
      const buffer = loadFixture('test-basic.apkg');
      const result = await parseAPKGFixture(buffer);

      // Check first note
      const firstNote = result.notes[0];
      expect(firstNote.fields).toHaveLength(2);
      expect(firstNote.tags).toContain('basic');
    });
  });

  describe('test-cloze.apkg', () => {
    it('should parse successfully', async () => {
      const buffer = loadFixture('test-cloze.apkg');
      const result = await parseAPKGFixture(buffer);

      expect(result.notes).toHaveLength(10);
      expect(result.decks[0].name).toBe('Japanese Cloze');
    });

    it('should have cloze note type', async () => {
      const buffer = loadFixture('test-cloze.apkg');
      const result = await parseAPKGFixture(buffer);

      const clozeNoteType = result.noteTypes.find(nt => nt.name === 'Cloze');
      expect(clozeNoteType).toBeDefined();
      expect(clozeNoteType?.type).toBe(1); // Cloze type
    });

    it('should have cloze markers in content', async () => {
      const buffer = loadFixture('test-cloze.apkg');
      const result = await parseAPKGFixture(buffer);

      // Check that notes contain cloze markers
      const hasClozeMakers = result.notes.some(note =>
        note.fields.some(field => field.includes('{{c1::')),
      );
      expect(hasClozeMakers).toBe(true);
    });
  });

  describe('test-nested.apkg', () => {
    it('should parse successfully with 30 cards', async () => {
      const buffer = loadFixture('test-nested.apkg');
      const result = await parseAPKGFixture(buffer);

      expect(result.notes).toHaveLength(30);
      expect(result.cards).toHaveLength(30);
    });

    it('should have nested deck structure', async () => {
      const buffer = loadFixture('test-nested.apkg');
      const result = await parseAPKGFixture(buffer);

      expect(result.decks).toHaveLength(3);

      const deckNames = result.decks.map(d => d.name);
      expect(deckNames).toContain('Japanese');
      expect(deckNames).toContain('Japanese::Vocabulary');
      expect(deckNames).toContain('Japanese::Grammar');
    });
  });

  describe('test-unicode.apkg', () => {
    it('should parse successfully', async () => {
      const buffer = loadFixture('test-unicode.apkg');
      const result = await parseAPKGFixture(buffer);

      expect(result.notes).toHaveLength(10);
      expect(result.cards).toHaveLength(10);
    });

    it('should preserve Unicode characters', async () => {
      const buffer = loadFixture('test-unicode.apkg');
      const result = await parseAPKGFixture(buffer);

      // Check for Japanese content
      const hasJapanese = result.notes.some(note =>
        note.fields.some(field =>
          /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(field),
        ),
      );
      expect(hasJapanese).toBe(true);

      // Check for Arabic content
      const hasArabic = result.notes.some(note =>
        note.fields.some(field => /[\u0600-\u06FF]/.test(field)),
      );
      expect(hasArabic).toBe(true);

      // Check for Korean content
      const hasKorean = result.notes.some(note =>
        note.fields.some(field => /[\uAC00-\uD7AF]/.test(field)),
      );
      expect(hasKorean).toBe(true);

      // Check for emoji
      const hasEmoji = result.notes.some(note =>
        note.fields.some(field => /[\u{1F300}-\u{1F9FF}]/u.test(field)),
      );
      expect(hasEmoji).toBe(true);
    });
  });

  describe('test-custom.apkg', () => {
    it('should parse successfully', async () => {
      const buffer = loadFixture('test-custom.apkg');
      const result = await parseAPKGFixture(buffer);

      expect(result.notes).toHaveLength(10);
      // 2 cards per note (Recognition and Recall templates)
      expect(result.cards).toHaveLength(20);
    });

    it('should have custom note type with 6 fields', async () => {
      const buffer = loadFixture('test-custom.apkg');
      const result = await parseAPKGFixture(buffer);

      const customNoteType = result.noteTypes.find(
        nt => nt.name === 'Japanese Vocabulary Extended',
      );
      expect(customNoteType).toBeDefined();
      expect(customNoteType?.flds).toHaveLength(6);

      const fieldNames = customNoteType?.flds.map(f => f.name);
      expect(fieldNames).toContain('Expression');
      expect(fieldNames).toContain('Reading');
      expect(fieldNames).toContain('Meaning');
      expect(fieldNames).toContain('Part of Speech');
      expect(fieldNames).toContain('Example Sentence');
      expect(fieldNames).toContain('Notes');
    });

    it('should have 2 card templates', async () => {
      const buffer = loadFixture('test-custom.apkg');
      const result = await parseAPKGFixture(buffer);

      const customNoteType = result.noteTypes.find(
        nt => nt.name === 'Japanese Vocabulary Extended',
      );
      expect(customNoteType?.tmpls).toHaveLength(2);

      const templateNames = customNoteType?.tmpls.map(t => t.name);
      expect(templateNames).toContain('Recognition');
      expect(templateNames).toContain('Recall');
    });
  });

  describe('test-empty.apkg', () => {
    it('should parse successfully with 0 cards', async () => {
      const buffer = loadFixture('test-empty.apkg');
      const result = await parseAPKGFixture(buffer);

      expect(result.notes).toHaveLength(0);
      expect(result.cards).toHaveLength(0);
      expect(result.decks).toHaveLength(1);
      expect(result.decks[0].name).toBe('Empty Deck');
    });
  });

  describe('test-large.tsv', () => {
    it('should parse successfully with 1000 rows', async () => {
      const content = loadFixture('test-large.tsv').toString('utf-8');
      const result = await parseTSV(content);

      expect(result.notes).toHaveLength(1000);
      expect(result.cards).toHaveLength(1000);
    });

    it('should have correct field structure', async () => {
      const content = loadFixture('test-large.tsv').toString('utf-8');
      const result = await parseTSV(content);

      // Check header was detected
      expect(result.noteTypes[0].flds[0].name).toBe('Front');
      expect(result.noteTypes[0].flds[1].name).toBe('Back');

      // Check first note content
      const firstNote = result.notes[0];
      expect(firstNote.fields[0]).toContain('Question 1');
      expect(firstNote.fields[1]).toContain('Answer 1');
    });

    it('should have tags', async () => {
      const content = loadFixture('test-large.tsv').toString('utf-8');
      const result = await parseTSV(content, { tagsColumnIndex: 2 });

      // Check that tags were parsed
      const hasTaggedNotes = result.notes.some(note => note.tags.length > 0);
      expect(hasTaggedNotes).toBe(true);
    });
  });
});
