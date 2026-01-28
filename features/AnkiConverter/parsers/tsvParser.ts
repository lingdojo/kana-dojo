/**
 * TSV Parser
 *
 * Parses Anki TSV (Tab-Separated Values) export files.
 * Handles Anki's TSV format with optional tags column.
 *
 * Anki TSV Format:
 * - Fields are separated by tabs
 * - Rows are separated by newlines
 * - Escaped characters: \t (tab), \n (newline), \\ (backslash)
 * - Optional tags column (space-separated tags)
 * - First row may be a header or data
 *
 * @module features/AnkiConverter/parsers/tsvParser
 */

import type {
  ParsedAnkiData,
  Note,
  Card,
  DeckInfo,
  NoteType,
  AnkiMetadata,
} from '../types';
import { ConversionError, ErrorCode } from '../types';

/**
 * Options for TSV parsing
 */
export interface TSVParseOptions {
  /** Whether the first row is a header row */
  hasHeader?: boolean;
  /** Custom field names (overrides header detection) */
  fieldNames?: string[];
  /** Index of the tags column (-1 for no tags, undefined for auto-detect) */
  tagsColumnIndex?: number;
  /** Deck name to use for the parsed cards */
  deckName?: string;
}

/**
 * Result of parsing a single TSV row
 */
interface ParsedRow {
  fields: string[];
  tags: string[];
}

/**
 * Unescape Anki TSV escape sequences
 *
 * Anki uses the following escape sequences:
 * - \t -> tab
 * - \n -> newline
 * - \\ -> backslash
 */
export function unescapeTSV(value: string): string {
  let result = '';
  let i = 0;

  while (i < value.length) {
    if (value[i] === '\\' && i + 1 < value.length) {
      const nextChar = value[i + 1];
      switch (nextChar) {
        case 't':
          result += '\t';
          i += 2;
          break;
        case 'n':
          result += '\n';
          i += 2;
          break;
        case '\\':
          result += '\\';
          i += 2;
          break;
        default:
          // Unknown escape sequence, keep as-is
          result += value[i];
          i += 1;
          break;
      }
    } else {
      result += value[i];
      i += 1;
    }
  }

  return result;
}

/**
 * Split a TSV row into fields
 * Handles tab separation and unescapes values
 */
export function splitTSVRow(row: string): string[] {
  // Split on tabs
  const rawFields = row.split('\t');

  // Unescape each field
  return rawFields.map(field => unescapeTSV(field));
}

/**
 * Parse a TSV row into fields and optional tags
 *
 * @param row - The raw TSV row string
 * @param tagsColumnIndex - Index of tags column, -1 for no tags
 * @returns Parsed row with fields and tags
 */
export function parseRow(row: string, tagsColumnIndex: number): ParsedRow {
  const allFields = splitTSVRow(row);
  return parseRowFromFields(allFields, tagsColumnIndex);
}

/**
 * Parse already-split fields into fields and optional tags
 *
 * @param allFields - Array of already-split field values
 * @param tagsColumnIndex - Index of tags column, -1 for no tags
 * @returns Parsed row with fields and tags
 */
export function parseRowFromFields(
  allFields: string[],
  tagsColumnIndex: number,
): ParsedRow {
  // No tags column
  if (tagsColumnIndex < 0 || tagsColumnIndex >= allFields.length) {
    return {
      fields: allFields,
      tags: [],
    };
  }

  // Extract tags from the specified column
  const tagsField = allFields[tagsColumnIndex];
  const tags = tagsField
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 0);

  // Remove tags column from fields
  const fields = [
    ...allFields.slice(0, tagsColumnIndex),
    ...allFields.slice(tagsColumnIndex + 1),
  ];

  return { fields, tags };
}

/**
 * Detect if the first row is a header row
 *
 * Heuristics:
 * - Header rows typically have short, descriptive field names
 * - Header rows don't usually contain HTML
 * - Header rows don't usually contain very long text
 * - Header rows typically match common header patterns
 */
export function detectHeader(firstRow: string[]): boolean {
  // If any field looks like HTML content, it's probably not a header
  const hasHtml = firstRow.some(
    field => field.includes('<') && field.includes('>'),
  );
  if (hasHtml) {
    return false;
  }

  // If any field is very long (>100 chars), probably not a header
  const hasLongField = firstRow.some(field => field.length > 100);
  if (hasLongField) {
    return false;
  }

  // Check if fields look like typical header names
  const headerPatterns = [
    /^front$/i,
    /^back$/i,
    /^question$/i,
    /^answer$/i,
    /^tags?$/i,
    /^field\s*\d*/i,
    /^extra$/i,
    /^hint$/i,
    /^notes?$/i,
    /^text$/i,
  ];

  // Count how many fields match header patterns
  const matchCount = firstRow.filter(field =>
    headerPatterns.some(pattern => pattern.test(field.trim())),
  ).length;

  // Require at least one field to match a header pattern
  // AND at least half of the fields should match for multi-column data
  if (matchCount === 0) {
    return false;
  }

  // For 2-column data, require at least 1 match
  // For more columns, require at least 40% match
  const threshold = firstRow.length <= 2 ? 1 : Math.ceil(firstRow.length * 0.4);
  return matchCount >= threshold;
}

/**
 * Detect the tags column index
 *
 * Heuristics:
 * - Tags column is usually the last column (3rd or later)
 * - Tags column typically contains space-separated words
 * - Tags column values don't usually contain HTML
 * - Basic 2-column format (front/back) doesn't have tags
 * - Tags should have at least some rows with space-separated values
 */
export function detectTagsColumn(rows: string[][]): number {
  if (rows.length === 0 || rows[0].length === 0) {
    return -1;
  }

  const numColumns = rows[0].length;

  // Basic 2-column format doesn't have a tags column
  // Tags are typically in a 3rd column or later
  if (numColumns <= 2) {
    return -1;
  }

  // Check the last column first (most common location for tags)
  const lastColIndex = numColumns - 1;

  // Sample some rows to check if last column looks like tags
  const sampleSize = Math.min(rows.length, 10);
  let looksLikeTags = true;
  let hasSpaceSeparatedValues = false;

  for (let i = 0; i < sampleSize && looksLikeTags; i++) {
    const value = rows[i][lastColIndex] || '';

    // Tags shouldn't contain HTML
    if (value.includes('<') && value.includes('>')) {
      looksLikeTags = false;
      break;
    }

    // Tags are typically short words separated by spaces
    // If the value is very long without spaces, probably not tags
    if (value.length > 100 && !value.includes(' ')) {
      looksLikeTags = false;
      break;
    }

    // Check if this value has space-separated words (typical for tags)
    if (value.includes(' ') && value.trim().length > 0) {
      hasSpaceSeparatedValues = true;
    }
  }

  // Only consider it a tags column if at least some rows have space-separated values
  // or if all values are empty (which could be empty tags)
  const allEmpty = rows
    .slice(0, sampleSize)
    .every(row => (row[lastColIndex] || '').trim() === '');

  if (!looksLikeTags) {
    return -1;
  }

  // If no rows have space-separated values and not all empty, probably not tags
  if (!hasSpaceSeparatedValues && !allEmpty) {
    return -1;
  }

  return lastColIndex;
}

/**
 * Generate default field names based on count
 */
function generateFieldNames(count: number): string[] {
  if (count === 2) {
    return ['Front', 'Back'];
  }
  return Array.from({ length: count }, (_, i) => `Field ${i + 1}`);
}

/**
 * Split TSV content into lines, handling different line endings
 */
export function splitLines(content: string): string[] {
  // Normalize line endings and split
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter(line => line.trim().length > 0);
}

/**
 * Parse TSV content into Anki data structure
 *
 * @param content - The TSV file content as a string
 * @param options - Parsing options
 * @returns Parsed Anki data
 * @throws ConversionError if parsing fails
 */
export async function parseTSV(
  content: string,
  options: TSVParseOptions = {},
): Promise<ParsedAnkiData> {
  try {
    // Split into lines
    const lines = splitLines(content);

    if (lines.length === 0) {
      // Return empty but valid structure for empty files
      return createEmptyParsedData(options.deckName || 'Imported Deck');
    }

    // Parse all rows first
    const allRows = lines.map(line => splitTSVRow(line));

    // Detect or use provided header setting
    const hasHeader =
      options.hasHeader ?? (allRows.length > 0 && detectHeader(allRows[0]));

    // Get field names
    let fieldNames: string[];
    let dataRows: string[][];

    if (hasHeader && allRows.length > 0) {
      fieldNames = options.fieldNames || allRows[0];
      dataRows = allRows.slice(1);
    } else {
      const fieldCount = allRows.length > 0 ? allRows[0].length : 2;
      fieldNames = options.fieldNames || generateFieldNames(fieldCount);
      dataRows = allRows;
    }

    if (dataRows.length === 0) {
      return createEmptyParsedData(options.deckName || 'Imported Deck');
    }

    // Detect tags column
    const tagsColumnIndex =
      options.tagsColumnIndex ?? detectTagsColumn(dataRows);

    // Adjust field names if tags column is detected
    if (tagsColumnIndex >= 0 && tagsColumnIndex < fieldNames.length) {
      fieldNames = [
        ...fieldNames.slice(0, tagsColumnIndex),
        ...fieldNames.slice(tagsColumnIndex + 1),
      ];
    }

    // Create note type
    const noteType = createNoteType(fieldNames);

    // Create deck
    const deckName = options.deckName || 'Imported Deck';
    const deck: DeckInfo = {
      id: 1,
      name: deckName,
      desc: '',
      conf: 0,
    };

    // Parse rows into notes and cards
    const notes: Note[] = [];
    const cards: Card[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const parsed = parseRowFromFields(row, tagsColumnIndex);

      // Skip empty rows
      if (parsed.fields.every(f => f.trim() === '')) {
        continue;
      }

      const noteId = i + 1;
      const cardId = i + 1;

      // Create note
      notes.push({
        id: noteId,
        guid: `tsv-${noteId}`,
        noteTypeId: noteType.id,
        fields: parsed.fields,
        tags: parsed.tags,
        mod: Math.floor(Date.now() / 1000),
      });

      // Create card
      cards.push({
        id: cardId,
        noteId: noteId,
        deckId: deck.id,
        ord: 0,
        type: 0, // new
        queue: 0, // new
        due: 0,
        ivl: 0,
        factor: 0,
        reps: 0,
        lapses: 0,
      });
    }

    // Create metadata
    const metadata: AnkiMetadata = {
      creation: Math.floor(Date.now() / 1000),
      mod: Math.floor(Date.now() / 1000),
      scm: 0,
      ver: 0, // TSV doesn't have schema version
      dty: 0,
      usn: 0,
      ls: 0,
    };

    return {
      notes,
      cards,
      decks: [deck],
      noteTypes: [noteType],
      metadata,
    };
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new ConversionError(
      ErrorCode.PARSE_ERROR,
      `Failed to parse TSV file: ${message}`,
      { originalError: message },
      false,
    );
  }
}

/**
 * Create a note type from field names
 */
function createNoteType(fieldNames: string[]): NoteType {
  return {
    id: 1,
    name: fieldNames.length === 2 ? 'Basic' : 'Custom',
    type: 0, // standard (not cloze)
    flds: fieldNames.map((name, index) => ({
      name,
      ord: index,
      sticky: false,
      rtl: false,
      font: 'Arial',
      size: 20,
    })),
    tmpls: [
      {
        name: 'Card 1',
        ord: 0,
        qfmt: `{{${fieldNames[0] || 'Front'}}}`,
        afmt: `{{FrontSide}}<hr id="answer">{{${fieldNames[1] || 'Back'}}}`,
      },
    ],
  };
}

/**
 * Create empty parsed data structure
 */
function createEmptyParsedData(deckName: string): ParsedAnkiData {
  return {
    notes: [],
    cards: [],
    decks: [
      {
        id: 1,
        name: deckName,
        desc: '',
        conf: 0,
      },
    ],
    noteTypes: [
      {
        id: 1,
        name: 'Basic',
        type: 0,
        flds: [
          {
            name: 'Front',
            ord: 0,
            sticky: false,
            rtl: false,
            font: 'Arial',
            size: 20,
          },
          {
            name: 'Back',
            ord: 1,
            sticky: false,
            rtl: false,
            font: 'Arial',
            size: 20,
          },
        ],
        tmpls: [
          {
            name: 'Card 1',
            ord: 0,
            qfmt: '{{Front}}',
            afmt: '{{FrontSide}}<hr id="answer">{{Back}}',
          },
        ],
      },
    ],
    metadata: {
      creation: Math.floor(Date.now() / 1000),
      mod: Math.floor(Date.now() / 1000),
      scm: 0,
      ver: 0,
      dty: 0,
      usn: 0,
      ls: 0,
    },
  };
}

/**
 * Parse TSV from a File or Buffer
 *
 * @param input - File object or ArrayBuffer containing TSV data
 * @param options - Parsing options
 * @returns Parsed Anki data
 */
export async function parseTSVFromBuffer(
  input: File | ArrayBuffer | Uint8Array,
  options: TSVParseOptions = {},
): Promise<ParsedAnkiData> {
  let content: string;

  if (input instanceof File) {
    content = await input.text();
  } else if (input instanceof ArrayBuffer) {
    content = new TextDecoder('utf-8').decode(input);
  } else {
    content = new TextDecoder('utf-8').decode(input);
  }

  return parseTSV(content, options);
}

/**
 * Validate TSV content
 *
 * @param content - TSV content to validate
 * @returns Validation result
 */
export function validateTSV(content: string): {
  valid: boolean;
  error?: string;
  rowCount?: number;
  columnCount?: number;
} {
  try {
    const lines = splitLines(content);

    if (lines.length === 0) {
      return { valid: true, rowCount: 0, columnCount: 0 };
    }

    // Check that all rows have tabs (TSV characteristic)
    const hasTabsInFirstRow = lines[0].includes('\t');
    if (!hasTabsInFirstRow) {
      return {
        valid: false,
        error: 'Content does not appear to be tab-separated',
      };
    }

    // Parse first row to get column count
    const firstRow = splitTSVRow(lines[0]);
    const columnCount = firstRow.length;

    // Validate that rows have consistent column counts (with some tolerance)
    let inconsistentRows = 0;
    for (const line of lines) {
      const row = splitTSVRow(line);
      if (Math.abs(row.length - columnCount) > 1) {
        inconsistentRows++;
      }
    }

    // Allow up to 10% inconsistent rows
    if (inconsistentRows > lines.length * 0.1) {
      return {
        valid: false,
        error: `Inconsistent column counts: ${inconsistentRows} rows have different column counts`,
      };
    }

    return {
      valid: true,
      rowCount: lines.length,
      columnCount,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
