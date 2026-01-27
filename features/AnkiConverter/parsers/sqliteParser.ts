/**
 * SQLite Parser
 *
 * Parses Anki SQLite database files (.anki2, .anki21, .db, .sqlite).
 * Handles different Anki schema versions (v2, v11, v21).
 *
 * @module features/AnkiConverter/parsers/sqliteParser
 */

import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import type {
  ParsedAnkiData,
  Note,
  Card,
  DeckInfo,
  NoteType,
  AnkiMetadata,
  Field,
  Template,
} from '../types';
import { ConversionError, ErrorCode } from '../types';

/**
 * Anki schema version information
 */
export interface SchemaVersion {
  version: number;
  isLegacy: boolean; // v2 vs v11+
  hasNotetypes: boolean; // v11+ has separate notetypes table
}

/**
 * Raw row from the notes table
 */
interface RawNote {
  id: number;
  guid: string;
  mid: number; // model/notetype id
  mod: number;
  usn: number;
  tags: string;
  flds: string; // fields separated by \x1f
  sfld: string;
  csum: number;
  flags: number;
  data: string;
}

/**
 * Raw row from the cards table
 */
interface RawCard {
  id: number;
  nid: number; // note id
  did: number; // deck id
  ord: number;
  mod: number;
  usn: number;
  type: number;
  queue: number;
  due: number;
  ivl: number;
  factor: number;
  reps: number;
  lapses: number;
  left: number;
  odue: number;
  odid: number;
  flags: number;
  data: string;
}

/**
 * Raw collection metadata from col table
 */
interface RawColData {
  id: number;
  crt: number;
  mod: number;
  scm: number;
  ver: number;
  dty: number;
  usn: number;
  ls: number;
  conf: string;
  models: string;
  decks: string;
  dconf: string;
  tags: string;
}

// sql.js instance cache
let sqlPromise: Promise<SqlJsStatic> | null = null;

/**
 * Detect if we're running in a browser environment
 */
function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
}

/**
 * Initialize sql.js (cached)
 */
async function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = (async () => {
      try {
        if (isBrowser()) {
          // Browser: use CDN for WASM file
          return await initSqlJs({
            locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
          });
        } else {
          // Node.js: use local node_modules path
          const path = await import('path');
          return await initSqlJs({
            locateFile: (file: string) =>
              path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
          });
        }
      } catch (error) {
        // Reset cache on error so next call can retry
        sqlPromise = null;
        throw error;
      }
    })();
  }
  return sqlPromise;
}

/**
 * Open a SQLite database from an ArrayBuffer
 */
export async function openDatabase(buffer: ArrayBuffer): Promise<Database> {
  const SQL = await getSqlJs();
  try {
    return new SQL.Database(new Uint8Array(buffer));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new ConversionError(
      ErrorCode.CORRUPTED_FILE,
      `Failed to open SQLite database: ${message}`,
      { originalError: message },
      false,
    );
  }
}

/**
 * Detect the Anki schema version from the database
 */
export function detectSchemaVersion(db: Database): SchemaVersion {
  try {
    // Check for col table (all versions have this)
    const colResult = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='col'",
    );
    if (colResult.length === 0 || colResult[0].values.length === 0) {
      throw new ConversionError(
        ErrorCode.CORRUPTED_FILE,
        'Database is missing the col table. This may not be a valid Anki database.',
        {},
        false,
      );
    }

    // Get version from col table
    const verResult = db.exec('SELECT ver FROM col LIMIT 1');
    const version =
      verResult.length > 0 && verResult[0].values.length > 0
        ? (verResult[0].values[0][0] as number)
        : 0;

    // Check for notetypes table (v11+)
    const notetypesResult = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='notetypes'",
    );
    const hasNotetypes =
      notetypesResult.length > 0 && notetypesResult[0].values.length > 0;

    return {
      version,
      isLegacy: version < 11,
      hasNotetypes,
    };
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new ConversionError(
      ErrorCode.PARSE_ERROR,
      `Failed to detect schema version: ${message}`,
      { originalError: message },
      false,
    );
  }
}

/**
 * Extract notes from the database
 */
export function extractNotes(db: Database): Note[] {
  try {
    const result = db.exec(
      'SELECT id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data FROM notes',
    );

    if (result.length === 0) {
      return [];
    }

    const notes: Note[] = [];
    for (const row of result[0].values) {
      const rawNote: RawNote = {
        id: row[0] as number,
        guid: row[1] as string,
        mid: row[2] as number,
        mod: row[3] as number,
        usn: row[4] as number,
        tags: row[5] as string,
        flds: row[6] as string,
        sfld: row[7] as string,
        csum: row[8] as number,
        flags: row[9] as number,
        data: row[10] as string,
      };

      notes.push({
        id: rawNote.id,
        guid: rawNote.guid,
        noteTypeId: rawNote.mid,
        fields: rawNote.flds.split('\x1f'), // Anki uses unit separator
        tags: rawNote.tags
          .trim()
          .split(/\s+/)
          .filter(t => t.length > 0),
        mod: rawNote.mod,
      });
    }

    return notes;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new ConversionError(
      ErrorCode.PARSE_ERROR,
      `Failed to extract notes: ${message}`,
      { originalError: message },
      false,
    );
  }
}

/**
 * Extract cards from the database
 */
export function extractCards(db: Database): Card[] {
  try {
    const result = db.exec(
      'SELECT id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data FROM cards',
    );

    if (result.length === 0) {
      return [];
    }

    const cards: Card[] = [];
    for (const row of result[0].values) {
      const rawCard: RawCard = {
        id: row[0] as number,
        nid: row[1] as number,
        did: row[2] as number,
        ord: row[3] as number,
        mod: row[4] as number,
        usn: row[5] as number,
        type: row[6] as number,
        queue: row[7] as number,
        due: row[8] as number,
        ivl: row[9] as number,
        factor: row[10] as number,
        reps: row[11] as number,
        lapses: row[12] as number,
        left: row[13] as number,
        odue: row[14] as number,
        odid: row[15] as number,
        flags: row[16] as number,
        data: row[17] as string,
      };

      cards.push({
        id: rawCard.id,
        noteId: rawCard.nid,
        deckId: rawCard.did,
        ord: rawCard.ord,
        type: rawCard.type,
        queue: rawCard.queue,
        due: rawCard.due,
        ivl: rawCard.ivl,
        factor: rawCard.factor,
        reps: rawCard.reps,
        lapses: rawCard.lapses,
      });
    }

    return cards;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new ConversionError(
      ErrorCode.PARSE_ERROR,
      `Failed to extract cards: ${message}`,
      { originalError: message },
      false,
    );
  }
}

/**
 * Extract decks from the database
 * Handles both legacy (col.decks JSON) and modern (decks table) formats
 */
export function extractDecks(
  db: Database,
  schemaVersion: SchemaVersion,
): DeckInfo[] {
  try {
    // Modern schema (v11+) may have a decks table
    if (!schemaVersion.isLegacy) {
      const decksTableResult = db.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='decks'",
      );
      if (
        decksTableResult.length > 0 &&
        decksTableResult[0].values.length > 0
      ) {
        const result = db.exec(
          'SELECT id, name, mtime_secs, common, kind FROM decks',
        );
        if (result.length > 0) {
          const decks: DeckInfo[] = [];
          for (const row of result[0].values) {
            decks.push({
              id: row[0] as number,
              name: row[1] as string,
              desc: '', // Modern schema doesn't store description in decks table
              conf: 0,
            });
          }
          return decks;
        }
      }
    }

    // Legacy schema or fallback: read from col.decks JSON column
    const colResult = db.exec('SELECT decks FROM col LIMIT 1');
    if (colResult.length === 0 || colResult[0].values.length === 0) {
      return [];
    }

    const decksJson = colResult[0].values[0][0] as string;
    const decksData = JSON.parse(decksJson) as Record<
      string,
      {
        id: number;
        name: string;
        desc?: string;
        conf?: number;
      }
    >;

    const decks: DeckInfo[] = [];
    for (const deckId of Object.keys(decksData)) {
      const deck = decksData[deckId];
      decks.push({
        id: deck.id,
        name: deck.name,
        desc: deck.desc || '',
        conf: deck.conf || 0,
      });
    }

    return decks;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new ConversionError(
      ErrorCode.PARSE_ERROR,
      `Failed to extract decks: ${message}`,
      { originalError: message },
      false,
    );
  }
}

/**
 * Parse field definitions from JSON
 */
function parseFields(fieldsData: unknown[]): Field[] {
  return fieldsData.map((f: unknown) => {
    const field = f as Record<string, unknown>;
    return {
      name: (field.name as string) || '',
      ord: (field.ord as number) || 0,
      sticky: (field.sticky as boolean) || false,
      rtl: (field.rtl as boolean) || false,
      font: (field.font as string) || 'Arial',
      size: (field.size as number) || 20,
    };
  });
}

/**
 * Parse template definitions from JSON
 */
function parseTemplates(templatesData: unknown[]): Template[] {
  return templatesData.map((t: unknown) => {
    const tmpl = t as Record<string, unknown>;
    return {
      name: (tmpl.name as string) || '',
      ord: (tmpl.ord as number) || 0,
      qfmt: (tmpl.qfmt as string) || '',
      afmt: (tmpl.afmt as string) || '',
    };
  });
}

/**
 * Extract note types from the database
 * Handles both legacy (col.models JSON) and modern (notetypes table) formats
 */
export function extractNoteTypes(
  db: Database,
  schemaVersion: SchemaVersion,
): NoteType[] {
  try {
    // Modern schema (v11+) with notetypes table
    if (schemaVersion.hasNotetypes) {
      const result = db.exec(
        'SELECT id, name, mtime_secs, usn, config FROM notetypes',
      );
      if (result.length > 0) {
        const noteTypes: NoteType[] = [];
        for (const row of result[0].values) {
          // Config is a blob in modern schema, need to parse it
          // For now, create basic note type info
          noteTypes.push({
            id: row[0] as number,
            name: row[1] as string,
            type: 0, // Default to standard
            flds: [],
            tmpls: [],
          });
        }
        // If we got note types from the table, try to get field info from col.models as fallback
        if (noteTypes.length > 0) {
          const colResult = db.exec('SELECT models FROM col LIMIT 1');
          if (colResult.length > 0 && colResult[0].values.length > 0) {
            const modelsJson = colResult[0].values[0][0] as string;
            if (modelsJson) {
              try {
                const modelsData = JSON.parse(modelsJson) as Record<
                  string,
                  unknown
                >;
                for (const noteType of noteTypes) {
                  const modelData = modelsData[noteType.id.toString()] as
                    | Record<string, unknown>
                    | undefined;
                  if (modelData) {
                    noteType.type = (modelData.type as number) || 0;
                    noteType.flds = parseFields(
                      (modelData.flds as unknown[]) || [],
                    );
                    noteType.tmpls = parseTemplates(
                      (modelData.tmpls as unknown[]) || [],
                    );
                  }
                }
              } catch {
                // Ignore JSON parse errors for models
              }
            }
          }
          return noteTypes;
        }
      }
    }

    // Legacy schema or fallback: read from col.models JSON column
    const colResult = db.exec('SELECT models FROM col LIMIT 1');
    if (colResult.length === 0 || colResult[0].values.length === 0) {
      return [];
    }

    const modelsJson = colResult[0].values[0][0] as string;
    const modelsData = JSON.parse(modelsJson) as Record<string, unknown>;

    const noteTypes: NoteType[] = [];
    for (const modelId of Object.keys(modelsData)) {
      const model = modelsData[modelId] as Record<string, unknown>;
      noteTypes.push({
        id: parseInt(modelId, 10),
        name: (model.name as string) || '',
        type: (model.type as number) || 0,
        flds: parseFields((model.flds as unknown[]) || []),
        tmpls: parseTemplates((model.tmpls as unknown[]) || []),
      });
    }

    return noteTypes;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new ConversionError(
      ErrorCode.PARSE_ERROR,
      `Failed to extract note types: ${message}`,
      { originalError: message },
      false,
    );
  }
}

/**
 * Extract collection metadata from the database
 */
export function extractMetadata(db: Database): AnkiMetadata {
  try {
    const result = db.exec(
      'SELECT id, crt, mod, scm, ver, dty, usn, ls FROM col LIMIT 1',
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return {
        creation: 0,
        mod: 0,
        scm: 0,
        ver: 0,
        dty: 0,
        usn: 0,
        ls: 0,
      };
    }

    const row = result[0].values[0];
    return {
      creation: row[1] as number,
      mod: row[2] as number,
      scm: row[3] as number,
      ver: row[4] as number,
      dty: row[5] as number,
      usn: row[6] as number,
      ls: row[7] as number,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new ConversionError(
      ErrorCode.PARSE_ERROR,
      `Failed to extract metadata: ${message}`,
      { originalError: message },
      false,
    );
  }
}

/**
 * Parse a SQLite database and extract all Anki data
 *
 * This is the main entry point for SQLite parsing. It:
 * 1. Opens the database
 * 2. Detects the schema version
 * 3. Extracts notes, cards, decks, and note types
 * 4. Returns the parsed data
 *
 * @param dbBuffer - The SQLite database as an ArrayBuffer
 * @returns Parsed Anki data ready for conversion
 * @throws ConversionError if parsing fails
 */
export async function parseSQLite(
  dbBuffer: ArrayBuffer,
): Promise<ParsedAnkiData> {
  const db = await openDatabase(dbBuffer);

  try {
    // Detect schema version
    const schemaVersion = detectSchemaVersion(db);

    // Check for unsupported versions
    if (schemaVersion.version > 21) {
      throw new ConversionError(
        ErrorCode.UNSUPPORTED_VERSION,
        `This deck uses Anki schema version ${schemaVersion.version}, which is not yet supported. Please report this issue.`,
        { version: schemaVersion.version },
        false,
      );
    }

    // Extract all data
    const notes = extractNotes(db);
    const cards = extractCards(db);
    const decks = extractDecks(db, schemaVersion);
    const noteTypes = extractNoteTypes(db, schemaVersion);
    const metadata = extractMetadata(db);

    return {
      notes,
      cards,
      decks,
      noteTypes,
      metadata,
    };
  } finally {
    // Always close the database
    db.close();
  }
}

/**
 * Get the card count from a SQLite database without full parsing
 * Useful for validation and progress estimation
 */
export async function getCardCount(dbBuffer: ArrayBuffer): Promise<number> {
  const db = await openDatabase(dbBuffer);

  try {
    const result = db.exec('SELECT COUNT(*) FROM cards');
    if (result.length === 0 || result[0].values.length === 0) {
      return 0;
    }
    return result[0].values[0][0] as number;
  } finally {
    db.close();
  }
}

/**
 * Validate that a buffer contains a valid Anki SQLite database
 */
export async function validateAnkiDatabase(
  dbBuffer: ArrayBuffer,
): Promise<{ valid: boolean; error?: string; version?: number }> {
  try {
    const db = await openDatabase(dbBuffer);

    try {
      const schemaVersion = detectSchemaVersion(db);
      return {
        valid: true,
        version: schemaVersion.version,
      };
    } finally {
      db.close();
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
