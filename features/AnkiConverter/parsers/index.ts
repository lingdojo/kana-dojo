/**
 * AnkiConverter Parsers
 *
 * Format-specific parsers for Anki files.
 */

// APKG Parser (task 5)
export {
  parseAPKG,
  extractDatabaseFromAPKG,
  isValidSqliteDatabase,
  isAPKGFile,
} from './apkgParser';
export type { APKGExtractionResult } from './apkgParser';

// SQLite Parser (task 6)
export {
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
} from './sqliteParser';
export type { SchemaVersion } from './sqliteParser';

// TSV Parser (task 7)
export {
  parseTSV,
  parseTSVFromBuffer,
  validateTSV,
  unescapeTSV,
  splitTSVRow,
  parseRow,
  parseRowFromFields,
  detectHeader,
  detectTagsColumn,
  splitLines,
} from './tsvParser';
export type { TSVParseOptions } from './tsvParser';

// COLPKG Parser (task 8)
export {
  parseCOLPKG,
  extractDatabaseFromCOLPKG,
  isValidSqliteDatabase as isValidSqliteDatabaseCOLPKG,
  isCOLPKGFile,
  getCOLPKGInfo,
} from './colpkgParser';
export type { COLPKGExtractionResult } from './colpkgParser';
