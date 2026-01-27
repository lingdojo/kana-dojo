/**
 * Test Fixture Generator for Anki Converter
 *
 * This script generates test fixtures for the Anki Converter feature.
 * Run with: npx tsx features/AnkiConverter/__tests__/fixtures/generateFixtures.ts
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let SQL: SqlJsStatic;

/**
 * Initialize sql.js
 */
async function initSQL(): Promise<void> {
  SQL = await initSqlJs({
    locateFile: (file: string) =>
      join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
  });
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

interface NoteData {
  id: number;
  guid: string;
  mid: number;
  fields: string[];
  tags: string[];
}

interface CardData {
  id: number;
  nid: number;
  did: number;
  ord?: number;
  type?: number;
  queue?: number;
}

interface DeckData {
  id: number;
  name: string;
  desc?: string;
}

interface ModelData {
  id: number;
  name: string;
  type?: number;
  flds: Array<{ name: string; ord: number }>;
  tmpls: Array<{ name: string; ord: number; qfmt: string; afmt: string }>;
}

interface DatabaseOptions {
  notes: NoteData[];
  cards: CardData[];
  decks: Record<string, DeckData>;
  models: Record<string, ModelData>;
  schemaVersion?: number;
}

/**
 * Create a minimal valid Anki database
 */
function createAnkiDatabase(options: DatabaseOptions): ArrayBuffer {
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

  const schemaVersion = options.schemaVersion ?? 11;

  // Insert collection metadata
  db.run(`INSERT INTO col VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    1,
    Math.floor(Date.now() / 1000),
    Math.floor(Date.now() / 1000),
    Math.floor(Date.now() / 1000),
    schemaVersion,
    0,
    -1,
    0,
    '{}',
    JSON.stringify(options.models),
    JSON.stringify(options.decks),
    '{}',
    '{}',
  ]);

  // Insert notes
  for (const note of options.notes) {
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
  for (const card of options.cards) {
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
 * Create an APKG file from a database
 */
async function createAPKG(
  dbBuffer: ArrayBuffer,
  mediaManifest?: Record<string, string>,
): Promise<Buffer> {
  const zip = new JSZip();
  zip.file('collection.anki2', dbBuffer);

  if (mediaManifest) {
    zip.file('media', JSON.stringify(mediaManifest));
  } else {
    zip.file('media', '{}');
  }

  const content = await zip.generateAsync({ type: 'nodebuffer' });
  return content;
}

// ============================================================================
// Fixture Generators
// ============================================================================

/**
 * Generate test-basic.apkg - Simple basic cards (10 cards)
 */
async function generateBasicFixture(): Promise<Buffer> {
  const modelId = generateId();
  const deckId = generateId();

  const basicModel: ModelData = {
    id: modelId,
    name: 'Basic',
    type: 0,
    flds: [
      { name: 'Front', ord: 0 },
      { name: 'Back', ord: 1 },
    ],
    tmpls: [{ name: 'Card 1', ord: 0, qfmt: '{{Front}}', afmt: '{{Back}}' }],
  };

  const notes: NoteData[] = [];
  const cards: CardData[] = [];

  const basicPairs = [
    ['Hello', 'こんにちは'],
    ['Goodbye', 'さようなら'],
    ['Thank you', 'ありがとう'],
    ['Yes', 'はい'],
    ['No', 'いいえ'],
    ['Good morning', 'おはようございます'],
    ['Good evening', 'こんばんは'],
    ['Please', 'お願いします'],
    ['Excuse me', 'すみません'],
    ['I understand', 'わかりました'],
  ];

  for (let i = 0; i < 10; i++) {
    const noteId = generateId() + i;
    const cardId = generateId() + i + 1000;

    notes.push({
      id: noteId,
      guid: generateGuid(),
      mid: modelId,
      fields: basicPairs[i],
      tags: ['basic', `lesson${Math.floor(i / 3) + 1}`],
    });

    cards.push({
      id: cardId,
      nid: noteId,
      did: deckId,
      ord: 0,
      type: 0,
      queue: 0,
    });
  }

  const dbBuffer = createAnkiDatabase({
    notes,
    cards,
    decks: {
      [deckId.toString()]: {
        id: deckId,
        name: 'Basic Japanese',
        desc: 'Simple Japanese vocabulary',
      },
    },
    models: { [modelId.toString()]: basicModel },
  });

  return createAPKG(dbBuffer);
}

/**
 * Generate test-cloze.apkg - Cloze deletion cards (10 cards)
 */
async function generateClozeFixture(): Promise<Buffer> {
  const modelId = generateId();
  const deckId = generateId();

  const clozeModel: ModelData = {
    id: modelId,
    name: 'Cloze',
    type: 1, // Cloze type
    flds: [
      { name: 'Text', ord: 0 },
      { name: 'Extra', ord: 1 },
    ],
    tmpls: [
      {
        name: 'Cloze',
        ord: 0,
        qfmt: '{{cloze:Text}}',
        afmt: '{{cloze:Text}}<br>{{Extra}}',
      },
    ],
  };

  const notes: NoteData[] = [];
  const cards: CardData[] = [];

  const clozeSentences = [
    ['{{c1::私}}は学生です。', 'I am a student.'],
    ['{{c1::東京}}は日本の首都です。', 'Tokyo is the capital of Japan.'],
    ['{{c1::猫}}が{{c2::魚}}を食べます。', 'The cat eats fish.'],
    ['{{c1::彼}}は{{c2::医者}}です。', 'He is a doctor.'],
    ['{{c1::今日}}は{{c2::月曜日}}です。', 'Today is Monday.'],
    ['{{c1::りんご}}は{{c2::赤い}}です。', 'The apple is red.'],
    ['{{c1::日本語}}を{{c2::勉強}}しています。', 'I am studying Japanese.'],
    ['{{c1::電車}}で{{c2::学校}}に行きます。', 'I go to school by train.'],
    ['{{c1::朝}}{{c2::ご飯}}を食べました。', 'I ate breakfast.'],
    ['{{c1::本}}を{{c2::読む}}のが好きです。', 'I like reading books.'],
  ];

  let cardIdCounter = generateId() + 1000;

  for (let i = 0; i < 10; i++) {
    const noteId = generateId() + i;

    notes.push({
      id: noteId,
      guid: generateGuid(),
      mid: modelId,
      fields: clozeSentences[i],
      tags: ['cloze', 'grammar'],
    });

    // Count cloze deletions in the text
    const clozeCount = (clozeSentences[i][0].match(/\{\{c\d+::/g) || []).length;
    const uniqueClozes = new Set(
      clozeSentences[i][0]
        .match(/\{\{c(\d+)::/g)
        ?.map(m => m.match(/\d+/)?.[0]) || [],
    );

    // Create a card for each unique cloze number
    for (const clozeNum of uniqueClozes) {
      cards.push({
        id: cardIdCounter++,
        nid: noteId,
        did: deckId,
        ord: parseInt(clozeNum || '0') - 1,
        type: 0,
        queue: 0,
      });
    }
  }

  const dbBuffer = createAnkiDatabase({
    notes,
    cards,
    decks: {
      [deckId.toString()]: {
        id: deckId,
        name: 'Japanese Cloze',
        desc: 'Cloze deletion practice',
      },
    },
    models: { [modelId.toString()]: clozeModel },
  });

  return createAPKG(dbBuffer);
}

/**
 * Generate test-nested.apkg - Nested deck structure (3 decks, 30 cards)
 */
async function generateNestedFixture(): Promise<Buffer> {
  const modelId = generateId();
  const parentDeckId = generateId();
  const vocabDeckId = generateId() + 1;
  const grammarDeckId = generateId() + 2;

  const basicModel: ModelData = {
    id: modelId,
    name: 'Basic',
    type: 0,
    flds: [
      { name: 'Front', ord: 0 },
      { name: 'Back', ord: 1 },
    ],
    tmpls: [{ name: 'Card 1', ord: 0, qfmt: '{{Front}}', afmt: '{{Back}}' }],
  };

  const notes: NoteData[] = [];
  const cards: CardData[] = [];

  // Vocabulary cards (10)
  const vocabPairs = [
    ['水', 'water'],
    ['火', 'fire'],
    ['木', 'tree'],
    ['金', 'gold/money'],
    ['土', 'earth'],
    ['山', 'mountain'],
    ['川', 'river'],
    ['海', 'sea'],
    ['空', 'sky'],
    ['花', 'flower'],
  ];

  // Grammar cards (10)
  const grammarPairs = [
    ['〜は〜です', 'X is Y (polite)'],
    ['〜が好きです', 'I like X'],
    ['〜を食べます', 'I eat X'],
    ['〜に行きます', 'I go to X'],
    ['〜で〜します', 'I do X at Y'],
    ['〜から〜まで', 'from X to Y'],
    ['〜と〜', 'X and Y'],
    ['〜より〜', 'more than X'],
    ['〜ほど〜ない', 'not as X as'],
    ['〜たい', 'want to X'],
  ];

  // Parent deck cards (10)
  const generalPairs = [
    ['日本', 'Japan'],
    ['東京', 'Tokyo'],
    ['大阪', 'Osaka'],
    ['京都', 'Kyoto'],
    ['北海道', 'Hokkaido'],
    ['沖縄', 'Okinawa'],
    ['富士山', 'Mt. Fuji'],
    ['新幹線', 'Shinkansen'],
    ['桜', 'Cherry blossom'],
    ['寿司', 'Sushi'],
  ];

  let noteIdCounter = generateId();
  let cardIdCounter = generateId() + 1000;

  // Add vocabulary cards
  for (let i = 0; i < 10; i++) {
    const noteId = noteIdCounter++;
    notes.push({
      id: noteId,
      guid: generateGuid(),
      mid: modelId,
      fields: vocabPairs[i],
      tags: ['vocabulary', 'kanji'],
    });
    cards.push({
      id: cardIdCounter++,
      nid: noteId,
      did: vocabDeckId,
      ord: 0,
      type: 0,
      queue: 0,
    });
  }

  // Add grammar cards
  for (let i = 0; i < 10; i++) {
    const noteId = noteIdCounter++;
    notes.push({
      id: noteId,
      guid: generateGuid(),
      mid: modelId,
      fields: grammarPairs[i],
      tags: ['grammar', 'patterns'],
    });
    cards.push({
      id: cardIdCounter++,
      nid: noteId,
      did: grammarDeckId,
      ord: 0,
      type: 0,
      queue: 0,
    });
  }

  // Add general cards to parent deck
  for (let i = 0; i < 10; i++) {
    const noteId = noteIdCounter++;
    notes.push({
      id: noteId,
      guid: generateGuid(),
      mid: modelId,
      fields: generalPairs[i],
      tags: ['general', 'culture'],
    });
    cards.push({
      id: cardIdCounter++,
      nid: noteId,
      did: parentDeckId,
      ord: 0,
      type: 0,
      queue: 0,
    });
  }

  const dbBuffer = createAnkiDatabase({
    notes,
    cards,
    decks: {
      [parentDeckId.toString()]: {
        id: parentDeckId,
        name: 'Japanese',
        desc: 'Japanese learning deck',
      },
      [vocabDeckId.toString()]: {
        id: vocabDeckId,
        name: 'Japanese::Vocabulary',
        desc: 'Vocabulary subdeck',
      },
      [grammarDeckId.toString()]: {
        id: grammarDeckId,
        name: 'Japanese::Grammar',
        desc: 'Grammar subdeck',
      },
    },
    models: { [modelId.toString()]: basicModel },
  });

  return createAPKG(dbBuffer);
}

/**
 * Generate test-unicode.apkg - Japanese/Chinese/Arabic content (10 cards)
 */
async function generateUnicodeFixture(): Promise<Buffer> {
  const modelId = generateId();
  const deckId = generateId();

  const basicModel: ModelData = {
    id: modelId,
    name: 'Basic (Unicode)',
    type: 0,
    flds: [
      { name: 'Front', ord: 0 },
      { name: 'Back', ord: 1 },
    ],
    tmpls: [{ name: 'Card 1', ord: 0, qfmt: '{{Front}}', afmt: '{{Back}}' }],
  };

  const notes: NoteData[] = [];
  const cards: CardData[] = [];

  // Unicode content from various languages
  const unicodePairs = [
    // Japanese (Hiragana, Katakana, Kanji)
    ['こんにちは', 'Hello (Japanese)'],
    ['カタカナ', 'Katakana (Japanese)'],
    ['漢字', 'Kanji (Japanese)'],
    // Chinese (Simplified and Traditional)
    ['你好', 'Hello (Chinese Simplified)'],
    ['謝謝', 'Thank you (Chinese Traditional)'],
    // Korean
    ['안녕하세요', 'Hello (Korean)'],
    // Arabic
    ['مرحبا', 'Hello (Arabic)'],
    // Russian
    ['Привет', 'Hello (Russian)'],
    // Emoji
    ['🎌 日本 🗾', 'Japan with emoji'],
    // Mixed script
    ['日本語 (Japanese) - にほんご', 'Japanese language - multiple scripts'],
  ];

  for (let i = 0; i < 10; i++) {
    const noteId = generateId() + i;
    const cardId = generateId() + i + 1000;

    notes.push({
      id: noteId,
      guid: generateGuid(),
      mid: modelId,
      fields: unicodePairs[i],
      tags: ['unicode', 'multilingual'],
    });

    cards.push({
      id: cardId,
      nid: noteId,
      did: deckId,
      ord: 0,
      type: 0,
      queue: 0,
    });
  }

  const dbBuffer = createAnkiDatabase({
    notes,
    cards,
    decks: {
      [deckId.toString()]: {
        id: deckId,
        name: 'Unicode Test',
        desc: 'Testing Unicode character support',
      },
    },
    models: { [modelId.toString()]: basicModel },
  });

  return createAPKG(dbBuffer);
}

/**
 * Generate test-custom.apkg - Custom note types with many fields (10 cards)
 */
async function generateCustomFixture(): Promise<Buffer> {
  const modelId = generateId();
  const deckId = generateId();

  // Custom model with 6 fields
  const customModel: ModelData = {
    id: modelId,
    name: 'Japanese Vocabulary Extended',
    type: 0,
    flds: [
      { name: 'Expression', ord: 0 },
      { name: 'Reading', ord: 1 },
      { name: 'Meaning', ord: 2 },
      { name: 'Part of Speech', ord: 3 },
      { name: 'Example Sentence', ord: 4 },
      { name: 'Notes', ord: 5 },
    ],
    tmpls: [
      {
        name: 'Recognition',
        ord: 0,
        qfmt: '{{Expression}}',
        afmt: '{{Reading}}<br>{{Meaning}}<br>{{Example Sentence}}',
      },
      {
        name: 'Recall',
        ord: 1,
        qfmt: '{{Meaning}}',
        afmt: '{{Expression}}<br>{{Reading}}<br>{{Example Sentence}}',
      },
    ],
  };

  const notes: NoteData[] = [];
  const cards: CardData[] = [];

  const customData = [
    [
      '食べる',
      'たべる',
      'to eat',
      'verb (ichidan)',
      '毎日朝ご飯を食べます。',
      'Common verb',
    ],
    [
      '飲む',
      'のむ',
      'to drink',
      'verb (godan)',
      '水を飲みます。',
      'Godan verb ending in む',
    ],
    [
      '行く',
      'いく',
      'to go',
      'verb (godan)',
      '学校に行きます。',
      'Irregular conjugation',
    ],
    [
      '来る',
      'くる',
      'to come',
      'verb (irregular)',
      '友達が来ます。',
      'Irregular verb',
    ],
    [
      'する',
      'する',
      'to do',
      'verb (irregular)',
      '勉強をします。',
      'Most common irregular',
    ],
    [
      '大きい',
      'おおきい',
      'big, large',
      'i-adjective',
      '大きい犬がいます。',
      'Size adjective',
    ],
    [
      '静か',
      'しずか',
      'quiet',
      'na-adjective',
      '静かな場所です。',
      'Requires な before nouns',
    ],
    ['本', 'ほん', 'book', 'noun', '本を読みます。', 'Counter: 冊 (さつ)'],
    [
      '先生',
      'せんせい',
      'teacher',
      'noun',
      '先生に聞きます。',
      'Honorific term',
    ],
    [
      '今日',
      'きょう',
      'today',
      'noun (temporal)',
      '今日は暑いです。',
      'Time expression',
    ],
  ];

  let cardIdCounter = generateId() + 1000;

  for (let i = 0; i < 10; i++) {
    const noteId = generateId() + i;

    notes.push({
      id: noteId,
      guid: generateGuid(),
      mid: modelId,
      fields: customData[i],
      tags: ['custom', 'jlpt-n5', customData[i][3].split(' ')[0]],
    });

    // Create 2 cards per note (Recognition and Recall)
    cards.push({
      id: cardIdCounter++,
      nid: noteId,
      did: deckId,
      ord: 0,
      type: 0,
      queue: 0,
    });
    cards.push({
      id: cardIdCounter++,
      nid: noteId,
      did: deckId,
      ord: 1,
      type: 0,
      queue: 0,
    });
  }

  const dbBuffer = createAnkiDatabase({
    notes,
    cards,
    decks: {
      [deckId.toString()]: {
        id: deckId,
        name: 'Custom Note Types',
        desc: 'Testing custom note types with multiple fields',
      },
    },
    models: { [modelId.toString()]: customModel },
  });

  return createAPKG(dbBuffer);
}

/**
 * Generate test-empty.apkg - Empty deck (0 cards)
 */
async function generateEmptyFixture(): Promise<Buffer> {
  const modelId = generateId();
  const deckId = generateId();

  const basicModel: ModelData = {
    id: modelId,
    name: 'Basic',
    type: 0,
    flds: [
      { name: 'Front', ord: 0 },
      { name: 'Back', ord: 1 },
    ],
    tmpls: [{ name: 'Card 1', ord: 0, qfmt: '{{Front}}', afmt: '{{Back}}' }],
  };

  const dbBuffer = createAnkiDatabase({
    notes: [],
    cards: [],
    decks: {
      [deckId.toString()]: {
        id: deckId,
        name: 'Empty Deck',
        desc: 'A deck with no cards',
      },
    },
    models: { [modelId.toString()]: basicModel },
  });

  return createAPKG(dbBuffer);
}

/**
 * Generate test-large.tsv - TSV with 1000 rows
 */
function generateLargeTSV(): string {
  const lines: string[] = [];

  // Header
  lines.push('Front\tBack\tTags');

  // Generate 1000 rows
  for (let i = 1; i <= 1000; i++) {
    const front = `Question ${i}: What is the meaning of word_${i}?`;
    const back = `Answer ${i}: The meaning is definition_${i}.`;
    const tags = `tag${i % 10} category${Math.floor(i / 100)}`;
    lines.push(`${front}\t${back}\t${tags}`);
  }

  return lines.join('\n');
}

// ============================================================================
// Main Execution
// ============================================================================

async function main(): Promise<void> {
  console.log('Initializing sql.js...');
  await initSQL();

  console.log('Generating test fixtures...\n');

  // Generate APKG fixtures
  const fixtures: Array<{
    name: string;
    generator: () => Promise<Buffer> | string;
  }> = [
    { name: 'test-basic.apkg', generator: generateBasicFixture },
    { name: 'test-cloze.apkg', generator: generateClozeFixture },
    { name: 'test-nested.apkg', generator: generateNestedFixture },
    { name: 'test-unicode.apkg', generator: generateUnicodeFixture },
    { name: 'test-custom.apkg', generator: generateCustomFixture },
    { name: 'test-empty.apkg', generator: generateEmptyFixture },
    { name: 'test-large.tsv', generator: generateLargeTSV },
  ];

  for (const fixture of fixtures) {
    try {
      const content = await fixture.generator();
      const filePath = join(__dirname, fixture.name);

      if (typeof content === 'string') {
        writeFileSync(filePath, content, 'utf-8');
      } else {
        writeFileSync(filePath, content);
      }

      console.log(`✓ Generated ${fixture.name}`);
    } catch (error) {
      console.error(`✗ Failed to generate ${fixture.name}:`, error);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
