/**
 * JSON Builder
 *
 * Builds structured JSON output from parsed Anki data.
 * Handles different note types (basic, cloze, custom) and
 * preserves deck hierarchy.
 *
 * @module features/AnkiConverter/lib/jsonBuilder
 */

import type {
  ParsedAnkiData,
  Note,
  Card,
  DeckInfo,
  NoteType,
  ConversionOptions,
  ConversionResult,
  Deck,
  OutputCard,
  BasicCard,
  ClozeCard,
  CustomCard,
  ClozeVariation,
  CardStats,
  ConversionMetadata,
} from '../types';
import { extractText } from './textExtractor';

/**
 * Cloze deletion pattern: {{c1::text}} or {{c1::text::hint}}
 */
const CLOZE_PATTERN = /\{\{c(\d+)::([^}]*?)(?:::([^}]*?))?\}\}/g;

/**
 * Build JSON output from parsed Anki data
 *
 * @param data - Parsed Anki data
 * @param options - Conversion options
 * @param startTime - Start time for processing time calculation
 * @returns Conversion result with decks and metadata
 */
export function buildJson(
  data: ParsedAnkiData,
  options: ConversionOptions = {},
  startTime: number = Date.now(),
): ConversionResult {
  const { includeSuspended = false, includeStats = false } = options;

  // Build lookup maps for efficient access
  const noteMap = new Map<number, Note>();
  const noteTypeMap = new Map<number, NoteType>();
  const deckMap = new Map<number, DeckInfo>();

  for (const note of data.notes) {
    noteMap.set(note.id, note);
  }
  for (const noteType of data.noteTypes) {
    noteTypeMap.set(noteType.id, noteType);
  }
  for (const deck of data.decks) {
    deckMap.set(deck.id, deck);
  }

  // Filter cards based on options
  const filteredCards = data.cards.filter(card => {
    if (!includeSuspended && card.queue === -1) {
      return false;
    }
    return true;
  });

  // Group cards by deck
  const cardsByDeck = new Map<number, Card[]>();
  for (const card of filteredCards) {
    const existing = cardsByDeck.get(card.deckId) || [];
    existing.push(card);
    cardsByDeck.set(card.deckId, existing);
  }

  // Build deck hierarchy
  const decks = buildDeckHierarchy(
    data.decks,
    cardsByDeck,
    noteMap,
    noteTypeMap,
    includeStats,
    includeSuspended,
  );

  // Generate metadata
  const metadata = generateMetadata(
    data,
    filteredCards.length,
    decks,
    startTime,
  );

  return { decks, metadata };
}

/**
 * Build hierarchical deck structure from flat deck list
 *
 * Anki uses :: as separator for nested decks (e.g., "Parent::Child::Grandchild")
 */
function buildDeckHierarchy(
  decks: DeckInfo[],
  cardsByDeck: Map<number, Card[]>,
  noteMap: Map<number, Note>,
  noteTypeMap: Map<number, NoteType>,
  includeStats: boolean,
  includeSuspended: boolean,
): Deck[] {
  // Parse deck names into hierarchy
  interface DeckNode {
    info: DeckInfo | null;
    children: Map<string, DeckNode>;
    cards: Card[];
  }

  const root: DeckNode = {
    info: null,
    children: new Map(),
    cards: [],
  };

  // Build tree structure
  for (const deck of decks) {
    const parts = deck.name.split('::');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current.children.has(part)) {
        current.children.set(part, {
          info: null,
          children: new Map(),
          cards: [],
        });
      }
      current = current.children.get(part)!;

      // Set deck info at the final level
      if (i === parts.length - 1) {
        current.info = deck;
        current.cards = cardsByDeck.get(deck.id) || [];
      }
    }
  }

  // Convert tree to output format
  function convertNode(node: DeckNode, name: string): Deck {
    const outputCards = node.cards.map(card =>
      buildOutputCard(
        card,
        noteMap,
        noteTypeMap,
        includeStats,
        includeSuspended,
      ),
    );

    const subdecks: Deck[] = [];
    for (const [childName, childNode] of node.children) {
      subdecks.push(convertNode(childNode, childName));
    }

    return {
      name,
      description: node.info?.desc || '',
      cards: outputCards,
      ...(subdecks.length > 0 ? { subdecks } : {}),
    };
  }

  // Convert root children to decks
  const result: Deck[] = [];
  for (const [name, childNode] of root.children) {
    result.push(convertNode(childNode, name));
  }

  return result;
}

/**
 * Build an output card from Anki card data
 */
function buildOutputCard(
  card: Card,
  noteMap: Map<number, Note>,
  noteTypeMap: Map<number, NoteType>,
  includeStats: boolean,
  includeSuspended: boolean,
): OutputCard {
  const note = noteMap.get(card.noteId);
  if (!note) {
    // Return a minimal card if note is missing
    return {
      id: String(card.id),
      type: 'custom',
      fields: {},
      tags: [],
    };
  }

  const noteType = noteTypeMap.get(note.noteTypeId);
  const cardType = detectCardType(noteType);

  // Build fields map with cleaned text
  const fields = buildFieldsMap(note, noteType);

  // Base card properties
  const baseCard: Partial<OutputCard> = {
    id: String(card.id),
    fields,
    tags: note.tags || [],
  };

  // Add optional stats
  if (includeStats) {
    baseCard.stats = buildCardStats(card);
  }

  // Add suspended status if card is suspended
  if (includeSuspended && card.queue === -1) {
    baseCard.suspended = true;
  }

  // Build type-specific card
  switch (cardType) {
    case 'basic':
      return buildBasicCard(baseCard, fields, noteType);
    case 'cloze':
      return buildClozeCard(baseCard, fields, note);
    default:
      return buildCustomCard(baseCard, fields, noteType);
  }
}

/**
 * Detect the card type based on note type
 */
function detectCardType(
  noteType: NoteType | undefined,
): 'basic' | 'cloze' | 'custom' {
  if (!noteType) {
    return 'custom';
  }

  // Anki uses type=1 for cloze note types
  if (noteType.type === 1) {
    return 'cloze';
  }

  // Check if it's a basic note type (has Front/Back fields)
  const fieldNames = noteType.flds.map(f => f.name.toLowerCase());
  const hasBasicFields =
    fieldNames.includes('front') && fieldNames.includes('back');

  if (hasBasicFields && noteType.flds.length <= 3) {
    return 'basic';
  }

  return 'custom';
}

/**
 * Build a map of field names to cleaned text values
 */
function buildFieldsMap(
  note: Note,
  noteType: NoteType | undefined,
): Record<string, string> {
  const fields: Record<string, string> = {};

  if (!noteType) {
    // No note type info - use generic field names
    note.fields.forEach((value, index) => {
      fields[`Field${index + 1}`] = extractText(value);
    });
    return fields;
  }

  // Map fields using note type field definitions
  const sortedFields = [...noteType.flds].sort((a, b) => a.ord - b.ord);

  for (let i = 0; i < sortedFields.length && i < note.fields.length; i++) {
    const fieldDef = sortedFields[i];
    const rawValue = note.fields[i];
    fields[fieldDef.name] = extractText(rawValue);
  }

  return fields;
}

/**
 * Build a basic card with front/back structure
 */
function buildBasicCard(
  baseCard: Partial<OutputCard>,
  fields: Record<string, string>,
  noteType: NoteType | undefined,
): BasicCard {
  // Find front and back fields (case-insensitive)
  let front = '';
  let back = '';

  if (noteType) {
    for (const fieldDef of noteType.flds) {
      const name = fieldDef.name.toLowerCase();
      const value = fields[fieldDef.name] || '';

      if (name === 'front') {
        front = value;
      } else if (name === 'back') {
        back = value;
      }
    }
  } else {
    // Fallback: use first two fields
    const fieldValues = Object.values(fields);
    front = fieldValues[0] || '';
    back = fieldValues[1] || '';
  }

  return {
    ...baseCard,
    id: baseCard.id!,
    type: 'basic',
    fields,
    tags: baseCard.tags || [],
    front,
    back,
  } as BasicCard;
}

/**
 * Build a cloze card with extracted deletions
 */
function buildClozeCard(
  baseCard: Partial<OutputCard>,
  fields: Record<string, string>,
  note: Note,
): ClozeCard {
  // Get the raw text field (usually first field for cloze notes)
  const rawText = note.fields[0] || '';
  const cleanedText = extractText(rawText);

  // Extract cloze deletions
  const clozes = extractClozeVariations(rawText);

  return {
    ...baseCard,
    id: baseCard.id!,
    type: 'cloze',
    fields,
    tags: baseCard.tags || [],
    text: cleanedText,
    clozes,
  } as ClozeCard;
}

/**
 * Extract cloze variations from text with cloze markers
 */
export function extractClozeVariations(text: string): ClozeVariation[] {
  const variations: ClozeVariation[] = [];
  const matches: Array<{ index: number; answer: string; hint?: string }> = [];

  // Find all cloze deletions
  let match;
  const pattern = new RegExp(CLOZE_PATTERN.source, 'g');

  while ((match = pattern.exec(text)) !== null) {
    const index = parseInt(match[1], 10);
    const answer = match[2];
    const hint = match[3];

    matches.push({ index, answer, hint });
  }

  // Get unique indices
  const uniqueIndices = [...new Set(matches.map(m => m.index))].sort(
    (a, b) => a - b,
  );

  // Generate variation for each unique index
  for (const targetIndex of uniqueIndices) {
    // Create text with this cloze hidden
    let variationText = text;
    let answer = '';

    // Replace all clozes with the same index
    variationText = variationText.replace(
      new RegExp(CLOZE_PATTERN.source, 'g'),
      (fullMatch, idx, content, hint) => {
        const clozeIndex = parseInt(idx, 10);
        if (clozeIndex === targetIndex) {
          answer = content;
          return hint ? `[${hint}]` : '[...]';
        }
        // Show other clozes as their content
        return content;
      },
    );

    // Clean the variation text
    variationText = extractText(variationText);

    variations.push({
      index: targetIndex,
      text: variationText,
      answer: extractText(answer),
    });
  }

  return variations;
}

/**
 * Build a custom card preserving all field names
 */
function buildCustomCard(
  baseCard: Partial<OutputCard>,
  fields: Record<string, string>,
  noteType: NoteType | undefined,
): CustomCard {
  return {
    ...baseCard,
    id: baseCard.id!,
    type: 'custom',
    fields,
    tags: baseCard.tags || [],
    noteType: noteType?.name || 'Unknown',
  } as CustomCard;
}

/**
 * Build card statistics
 */
function buildCardStats(card: Card): CardStats {
  return {
    reviews: card.reps,
    lapses: card.lapses,
    interval: card.ivl,
    ease: card.factor / 10, // Anki stores ease as factor * 10
  };
}

/**
 * Generate conversion metadata
 */
function generateMetadata(
  data: ParsedAnkiData,
  totalCards: number,
  decks: Deck[],
  startTime: number,
): ConversionMetadata {
  // Count total decks including subdecks
  function countDecks(deckList: Deck[]): number {
    let count = deckList.length;
    for (const deck of deckList) {
      if (deck.subdecks) {
        count += countDecks(deck.subdecks);
      }
    }
    return count;
  }

  const totalDecks = countDecks(decks);
  const noteTypeNames = data.noteTypes.map(nt => nt.name);

  return {
    convertedAt: new Date().toISOString(),
    sourceFormat: detectSourceFormat(data),
    totalDecks,
    totalCards,
    noteTypes: noteTypeNames,
    ankiVersion: data.metadata.ver ? `Schema v${data.metadata.ver}` : undefined,
    processingTime: Date.now() - startTime,
  };
}

/**
 * Detect source format from metadata
 */
function detectSourceFormat(data: ParsedAnkiData): string {
  // This would be set by the parser, but we can infer from schema version
  const ver = data.metadata.ver;

  if (ver >= 11) {
    return 'apkg (schema v11+)';
  } else if (ver >= 2) {
    return 'apkg (schema v2)';
  }

  return 'unknown';
}

/**
 * Validate that JSON output is valid
 * Useful for testing
 */
export function isValidJsonOutput(result: ConversionResult): boolean {
  try {
    // Try to stringify and parse
    const json = JSON.stringify(result);
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
}

/**
 * Count total cards in deck hierarchy
 */
export function countTotalCards(decks: Deck[]): number {
  let count = 0;
  for (const deck of decks) {
    count += deck.cards.length;
    if (deck.subdecks) {
      count += countTotalCards(deck.subdecks);
    }
  }
  return count;
}

/**
 * Flatten deck hierarchy to get all deck names
 */
export function flattenDeckNames(decks: Deck[], prefix = ''): string[] {
  const names: string[] = [];

  for (const deck of decks) {
    const fullName = prefix ? `${prefix}::${deck.name}` : deck.name;
    names.push(fullName);

    if (deck.subdecks) {
      names.push(...flattenDeckNames(deck.subdecks, fullName));
    }
  }

  return names;
}
