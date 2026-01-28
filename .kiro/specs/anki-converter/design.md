# Design Document

## Overview

The Anki Converter is a dual-interface tool (web and CLI) that transforms Anki deck files into structured JSON format. The system operates entirely client-side in the browser for privacy, using Web Workers for performance, and provides a Node.js CLI for automation. The converter handles multiple Anki formats by implementing format-specific parsers that feed into a unified conversion pipeline, producing intelligently structured JSON optimized for each deck type.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │   Web Interface      │      │     CLI Tool         │    │
│  │  (React Component)   │      │  (Node.js Script)    │    │
│  └──────────┬───────────┘      └──────────┬───────────┘    │
└─────────────┼──────────────────────────────┼────────────────┘
              │                              │
              ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Conversion Pipeline                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. File Detection → 2. Format Parser → 3. Extractor │  │
│  │     → 4. Transformer → 5. JSON Builder               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Format Parsers                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   APKG   │  │   TSV    │  │  SQLite  │  │  COLPKG  │   │
│  │  Parser  │  │  Parser  │  │  Parser  │  │  Parser  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Layers

1. **Presentation Layer**: Web UI (React) and CLI interface
2. **Orchestration Layer**: Conversion pipeline coordinator
3. **Parser Layer**: Format-specific parsers (APKG, TSV, SQLite, COLPKG)
4. **Transformation Layer**: HTML cleaning, text extraction, structure normalization
5. **Output Layer**: JSON builder with format optimization

### Technology Stack

- **Web Interface**: React 19, TypeScript, Web Workers, JSZip, sql.js
- **CLI Tool**: Node.js, TypeScript, better-sqlite3, JSZip
- **Parsing**: sql.js (browser), better-sqlite3 (Node), custom TSV parser
- **File Handling**: File API (browser), fs/promises (Node)
- **Progress Tracking**: Event emitters, React state management

## Components and Interfaces

### 1. Web Interface Component

**Location**: `features/AnkiConverter/components/ConverterInterface.tsx`

**Responsibilities**:

- Render drag-and-drop zone
- Handle file selection
- Display progress and results
- Trigger file download
- Show error messages

**Key Methods**:

```typescript
interface ConverterInterfaceProps {
  onConversionComplete?: (stats: ConversionStats) => void;
}

interface ConversionStats {
  totalCards: number;
  totalDecks: number;
  processingTime: number;
  fileName: string;
}
```

### 2. Conversion Pipeline

**Location**: `features/AnkiConverter/lib/conversionPipeline.ts`

**Responsibilities**:

- Coordinate conversion stages
- Emit progress events
- Handle errors gracefully
- Route to appropriate parser

**Key Interface**:

```typescript
interface ConversionPipeline {
  convert(
    file: File | Buffer,
    options: ConversionOptions,
  ): Promise<ConversionResult>;
  on(event: 'progress', callback: (progress: ProgressEvent) => void): void;
  on(event: 'error', callback: (error: ConversionError) => void): void;
}

interface ConversionOptions {
  includeStats?: boolean;
  includeSuspended?: boolean;
  includeTags?: boolean;
  format?: 'auto' | 'apkg' | 'tsv' | 'sqlite' | 'colpkg';
}

interface ConversionResult {
  decks: Deck[];
  metadata: ConversionMetadata;
}

interface ProgressEvent {
  stage: 'detecting' | 'parsing' | 'extracting' | 'transforming' | 'building';
  progress: number; // 0-100
  message: string;
}
```

### 3. Format Parsers

#### APKG Parser

**Location**: `features/AnkiConverter/lib/parsers/apkgParser.ts`

**Responsibilities**:

- Unzip .apkg file
- Extract collection.anki2 database
- Parse SQLite schema
- Extract deck and card data

**Key Methods**:

```typescript
interface APKGParser {
  parse(fileBuffer: ArrayBuffer): Promise<ParsedAnkiData>;
  extractDatabase(zip: JSZip): Promise<ArrayBuffer>;
  parseCollection(db: Database): Promise<AnkiCollection>;
}
```

#### TSV Parser

**Location**: `features/AnkiConverter/lib/parsers/tsvParser.ts`

**Responsibilities**:

- Parse tab-separated values
- Handle escaped characters
- Detect field structure
- Handle Anki TSV format quirks

**Key Methods**:

```typescript
interface TSVParser {
  parse(content: string): Promise<ParsedAnkiData>;
  detectDelimiter(content: string): '\t' | ',';
  parseRow(row: string): string[];
}
```

#### SQLite Parser

**Location**: `features/AnkiConverter/lib/parsers/sqliteParser.ts`

**Responsibilities**:

- Query Anki database schema
- Extract notes, cards, decks
- Handle schema version differences
- Join related tables

**Key Methods**:

```typescript
interface SQLiteParser {
  parse(dbBuffer: ArrayBuffer): Promise<ParsedAnkiData>;
  detectSchemaVersion(db: Database): number;
  extractNotes(db: Database): Promise<Note[]>;
  extractCards(db: Database): Promise<Card[]>;
  extractDecks(db: Database): Promise<DeckInfo[]>;
}
```

#### COLPKG Parser

**Location**: `features/AnkiConverter/lib/parsers/colpkgParser.ts`

**Responsibilities**:

- Unzip .colpkg file
- Extract collection.anki21 or collection.anki2
- Handle media manifest
- Process multiple decks

### 4. Text Extractor

**Location**: `features/AnkiConverter/lib/textExtractor.ts`

**Responsibilities**:

- Remove HTML tags
- Strip media references
- Preserve text formatting indicators
- Handle malformed HTML
- Clean whitespace

**Key Methods**:

```typescript
interface TextExtractor {
  extractText(html: string): string;
  removeMediaTags(html: string): string;
  preserveFormatting(html: string): string;
  cleanWhitespace(text: string): string;
}
```

### 5. JSON Builder

**Location**: `features/AnkiConverter/lib/jsonBuilder.ts`

**Responsibilities**:

- Structure data by note type
- Optimize for deck complexity
- Generate metadata
- Format output

**Key Methods**:

```typescript
interface JSONBuilder {
  build(data: ParsedAnkiData, options: ConversionOptions): ConversionResult;
  structureByNoteType(notes: Note[]): StructuredDecks;
  generateMetadata(data: ParsedAnkiData): ConversionMetadata;
}
```

### 6. CLI Tool

**Location**: `scripts/anki-converter.ts`

**Responsibilities**:

- Parse command-line arguments
- Read files from filesystem
- Execute conversion
- Write output JSON
- Display progress in terminal

**Usage**:

```bash
npm run anki:convert -- --input deck.apkg --output deck.json
npm run anki:convert -- -i deck.apkg -o deck.json --include-stats
```

## Data Models

### Core Data Structures

```typescript
// Parsed Anki Data (intermediate format)
interface ParsedAnkiData {
  notes: Note[];
  cards: Card[];
  decks: DeckInfo[];
  noteTypes: NoteType[];
  metadata: AnkiMetadata;
}

interface Note {
  id: number;
  guid: string;
  noteTypeId: number;
  fields: string[]; // Raw HTML content
  tags: string[];
  mod: number; // Modification timestamp
}

interface Card {
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

interface DeckInfo {
  id: number;
  name: string; // Can be nested: "Parent::Child"
  desc: string;
  conf: number;
}

interface NoteType {
  id: number;
  name: string;
  type: number; // 0=standard, 1=cloze
  flds: Field[];
  tmpls: Template[];
}

interface Field {
  name: string;
  ord: number;
  sticky: boolean;
  rtl: boolean;
  font: string;
  size: number;
}

interface Template {
  name: string;
  ord: number;
  qfmt: string; // Question format
  afmt: string; // Answer format
}

// Output JSON Structure
interface ConversionResult {
  decks: Deck[];
  metadata: ConversionMetadata;
}

interface Deck {
  name: string;
  description: string;
  cards: OutputCard[];
  subdecks?: Deck[]; // For nested decks
}

interface OutputCard {
  id: string;
  type: 'basic' | 'cloze' | 'custom';
  fields: Record<string, string>; // Field name -> cleaned text
  tags: string[];
  stats?: CardStats; // Optional
  suspended?: boolean; // Optional
}

// For basic cards
interface BasicCard extends OutputCard {
  type: 'basic';
  front: string;
  back: string;
}

// For cloze cards
interface ClozeCard extends OutputCard {
  type: 'cloze';
  text: string; // Full text with {{c1::...}} markers
  clozes: ClozeVariation[];
}

interface ClozeVariation {
  index: number;
  text: string; // Text with this cloze hidden
  answer: string; // The hidden text
}

// For custom note types
interface CustomCard extends OutputCard {
  type: 'custom';
  noteType: string;
  fields: Record<string, string>;
}

interface CardStats {
  reviews: number;
  lapses: number;
  interval: number;
  ease: number;
}

interface ConversionMetadata {
  convertedAt: string; // ISO timestamp
  sourceFormat: string;
  totalDecks: number;
  totalCards: number;
  noteTypes: string[];
  ankiVersion?: string;
  processingTime: number; // milliseconds
}

interface AnkiMetadata {
  creation: number;
  mod: number;
  scm: number;
  ver: number; // Schema version
  dty: number;
  usn: number;
  ls: number;
}
```

### JSON Output Examples

#### Simple Basic Deck

```json
{
  "decks": [
    {
      "name": "Japanese Vocabulary",
      "description": "Basic Japanese words",
      "cards": [
        {
          "id": "1234567890",
          "type": "basic",
          "front": "こんにちは",
          "back": "Hello",
          "fields": {
            "Front": "こんにちは",
            "Back": "Hello"
          },
          "tags": ["greetings", "basic"]
        }
      ]
    }
  ],
  "metadata": {
    "convertedAt": "2025-01-26T10:30:00Z",
    "sourceFormat": "apkg",
    "totalDecks": 1,
    "totalCards": 1,
    "noteTypes": ["Basic"],
    "processingTime": 245
  }
}
```

#### Cloze Deck

```json
{
  "decks": [
    {
      "name": "Japanese Grammar",
      "cards": [
        {
          "id": "9876543210",
          "type": "cloze",
          "text": "{{c1::私}}は{{c2::学生}}です",
          "clozes": [
            {
              "index": 1,
              "text": "[...]は学生です",
              "answer": "私"
            },
            {
              "index": 2,
              "text": "私は[...]です",
              "answer": "学生"
            }
          ],
          "fields": {
            "Text": "{{c1::私}}は{{c2::学生}}です",
            "Extra": "I am a student"
          },
          "tags": ["grammar", "particles"]
        }
      ]
    }
  ]
}
```

#### Nested Decks

```json
{
  "decks": [
    {
      "name": "Japanese",
      "description": "All Japanese content",
      "cards": [],
      "subdecks": [
        {
          "name": "Vocabulary",
          "cards": [...]
        },
        {
          "name": "Grammar",
          "cards": [...]
        }
      ]
    }
  ]
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: File format detection accuracy

_For any_ supported Anki file (APKG, TSV, SQLite, COLPKG, ANKI2), the file detection mechanism should correctly identify the format based on file signature and extension
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 2: Media tag removal completeness

_For any_ HTML content containing media tags (img, audio, video, sound), the text extractor should remove all media references while preserving all surrounding text content
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 3: JSON output validity

_For any_ successfully converted Anki file, the resulting JSON output should be valid JSON that can be parsed without errors
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 4: Card count preservation

_For any_ Anki deck, the number of cards in the JSON output should equal the number of cards in the source deck (excluding any filtered by options)
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 5: Deck hierarchy preservation

_For any_ Anki collection with nested decks (using :: separator), the JSON output should preserve the parent-child relationships in the subdeck structure
**Validates: Requirements 10.1**

### Property 6: Unicode character preservation

_For any_ card content containing Unicode characters (Japanese, Chinese, Arabic, emoji, etc.), the conversion should preserve all characters exactly as they appear in the source
**Validates: Requirements 11.4**

### Property 7: Empty deck handling

_For any_ Anki deck containing zero cards, the converter should produce valid JSON with an empty cards array and not throw errors
**Validates: Requirements 11.1**

### Property 8: Field name preservation

_For any_ custom note type with named fields, the JSON output should include all field names exactly as defined in the note type
**Validates: Requirements 5.3, 10.4**

### Property 9: Tag array consistency

_For any_ card with tags, the JSON output should include tags as an array, and cards without tags should have an empty array (not null or undefined)
**Validates: Requirements 5.5**

### Property 10: Cloze deletion extraction

_For any_ cloze note, the converter should extract all cloze deletions ({{c1::text}}, {{c2::text}}, etc.) and generate the correct number of cloze variations
**Validates: Requirements 5.2**

### Property 11: HTML to text conversion idempotence

_For any_ text that has already been cleaned of HTML, running the text extractor again should produce identical output
**Validates: Requirements 4.5**

### Property 12: Error message descriptiveness

_For any_ conversion error, the error message should include the error type, the file being processed, and actionable guidance
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

### Property 13: Progress event monotonicity

_For any_ conversion process, progress events should emit percentages that never decrease (monotonically increasing from 0 to 100)
**Validates: Requirements 7.2**

### Property 14: File name sanitization safety

_For any_ deck name containing special characters or path separators, the output filename should be sanitized to valid filesystem characters
**Validates: Requirements 11.2**

### Property 15: Local processing guarantee

_For any_ file uploaded to the web interface, no network requests should be made during the conversion process (except for loading the page itself)
**Validates: Requirements 12.1, 12.2**

## Error Handling

### Error Categories

1. **File Format Errors**
   - Invalid file extension
   - Corrupted ZIP archive
   - Missing required files in APKG/COLPKG
   - Invalid SQLite database

2. **Parsing Errors**
   - Unsupported schema version
   - Malformed TSV data
   - Database query failures
   - Invalid JSON in deck configuration

3. **Content Errors**
   - Extremely large fields (>1MB)
   - Invalid UTF-8 encoding
   - Circular deck references
   - Missing note types

4. **System Errors**
   - Out of memory
   - File system errors (CLI only)
   - Web Worker crashes
   - Browser compatibility issues

### Error Handling Strategy

```typescript
class ConversionError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>,
    public recoverable: boolean = false,
  ) {
    super(message);
    this.name = 'ConversionError';
  }
}

enum ErrorCode {
  INVALID_FORMAT = 'INVALID_FORMAT',
  CORRUPTED_FILE = 'CORRUPTED_FILE',
  UNSUPPORTED_VERSION = 'UNSUPPORTED_VERSION',
  PARSE_ERROR = 'PARSE_ERROR',
  EXTRACTION_ERROR = 'EXTRACTION_ERROR',
  OUT_OF_MEMORY = 'OUT_OF_MEMORY',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Error recovery strategies
interface ErrorRecovery {
  retry?: () => Promise<void>;
  fallback?: () => Promise<ConversionResult>;
  guidance: string;
}
```

### Error Messages

- **Invalid Format**: "The file '{filename}' is not a recognized Anki format. Supported formats: .apkg, .tsv, .db, .sqlite, .anki2, .colpkg"
- **Corrupted APKG**: "The APKG file appears to be corrupted. Unable to extract database. Try exporting the deck again from Anki."
- **Unsupported Schema**: "This deck uses Anki schema version {version}, which is not yet supported. Please report this issue."
- **Parse Error**: "Failed to parse {format} file at line {line}: {details}"
- **Out of Memory**: "The deck is too large to process in the browser. Try using the CLI tool instead."

## Testing Strategy

### Unit Testing

**Framework**: Vitest

**Test Coverage**:

- Format detection logic
- Individual parser functions
- Text extraction and HTML cleaning
- JSON structure building
- Error handling paths
- File name sanitization
- Progress calculation

**Example Tests**:

```typescript
describe('Format Detection', () => {
  it('should detect APKG from magic bytes', () => {
    const buffer = createAPKGBuffer();
    expect(detectFormat(buffer)).toBe('apkg');
  });

  it('should detect TSV from content', () => {
    const content = 'front\tback\n';
    expect(detectFormat(content)).toBe('tsv');
  });
});

describe('Text Extractor', () => {
  it('should remove image tags', () => {
    const html = 'Hello <img src="test.jpg"> World';
    expect(extractText(html)).toBe('Hello  World');
  });

  it('should preserve Unicode', () => {
    const html = '<div>こんにちは</div>';
    expect(extractText(html)).toBe('こんにちは');
  });
});
```

### Property-Based Testing

**Framework**: fast-check (JavaScript property testing library)

**Configuration**: Minimum 100 iterations per property

**Test Properties**:

- Generate random HTML with media tags, verify all tags removed
- Generate random deck structures, verify hierarchy preserved
- Generate random Unicode strings, verify preservation
- Generate random note types, verify field names preserved
- Generate random cloze patterns, verify correct extraction

**Example Property Tests**:

```typescript
import fc from 'fast-check';

describe('Property Tests', () => {
  it('Property 2: Media tag removal completeness', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.constant('<img src="test.jpg">'),
            fc.constant('<audio src="test.mp3">'),
            fc.constant('[sound:test.mp3]'),
            fc.string(),
          ),
        ),
        parts => {
          const html = parts.join('');
          const cleaned = extractText(html);
          return (
            !cleaned.includes('<img') &&
            !cleaned.includes('<audio') &&
            !cleaned.includes('[sound:')
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it('Property 6: Unicode character preservation', () => {
    fc.assert(
      fc.property(fc.unicodeString(), text => {
        const html = `<div>${text}</div>`;
        const extracted = extractText(html);
        return extracted === text;
      }),
      { numRuns: 100 },
    );
  });
});
```

### Integration Testing

- Test complete conversion pipeline with sample decks
- Test Web Worker communication
- Test file download mechanism
- Test CLI tool with various inputs
- Test error scenarios end-to-end

### Test Data

Create sample Anki decks for testing:

- `test-basic.apkg`: Simple basic cards
- `test-cloze.apkg`: Cloze deletions
- `test-nested.apkg`: Nested deck structure
- `test-unicode.apkg`: Japanese/Chinese/Arabic content
- `test-large.apkg`: 10,000+ cards
- `test-corrupted.apkg`: Intentionally corrupted
- `test-custom.apkg`: Custom note types with many fields

## Performance Considerations

### Web Interface Optimization

1. **Web Workers**: Run conversion in background thread to keep UI responsive
2. **Streaming**: Process large files in chunks to avoid memory spikes
3. **Progress Updates**: Throttle progress events to 100ms intervals
4. **Memory Management**: Clear intermediate data structures after each stage

### CLI Tool Optimization

1. **Streaming**: Use Node.js streams for large files
2. **Database Connections**: Reuse SQLite connections
3. **Parallel Processing**: Process multiple decks concurrently when possible
4. **Memory Limits**: Implement chunking for files >100MB

### Expected Performance

- Small decks (<1000 cards): <1 second
- Medium decks (1000-10000 cards): 1-5 seconds
- Large decks (10000+ cards): 5-30 seconds
- Very large decks (100000+ cards): CLI recommended, 30-120 seconds

## SEO Optimization

### Page Structure

**Route**: `/[locale]/tools/anki-converter`

**Title**: "Free Anki Deck to JSON Converter | Convert APKG, TSV, SQLite Files Online"

**Meta Description**: "Convert Anki flashcard decks to JSON format instantly. Supports APKG, TSV, SQLite, and COLPKG files. Free, fast, and completely private - all processing happens in your browser."

**H1**: "Anki Deck to JSON Converter"

**Content Structure**:

```html
<main>
  <h1>Anki Deck to JSON Converter</h1>
  <p>Convert your Anki flashcard decks to clean, structured JSON format...</p>

  <!-- Converter Tool -->
  <section aria-label="Converter Tool">
    <!-- Drag-and-drop interface -->
  </section>

  <h2>Supported Anki Formats</h2>
  <ul>
    <li><strong>APKG files</strong> - Anki package format...</li>
    <li><strong>TSV files</strong> - Tab-separated values...</li>
    <li><strong>SQLite databases</strong> - Direct Anki database files...</li>
    <li><strong>COLPKG files</strong> - Collection packages...</li>
  </ul>

  <h2>How to Convert Anki Decks to JSON</h2>
  <ol>
    <li>Export your deck from Anki as .apkg or .colpkg</li>
    <li>Drag and drop the file or click to select</li>
    <li>Wait for conversion to complete</li>
    <li>Download your JSON file automatically</li>
  </ol>

  <h2>Features</h2>
  <ul>
    <li>100% free and open source</li>
    <li>Completely private - no data leaves your device</li>
    <li>Supports all Anki file formats</li>
    <li>Extracts text content only (no media files)</li>
    <li>Preserves deck structure and tags</li>
    <li>Handles cloze deletions and custom note types</li>
  </ul>

  <h2>Why Convert Anki Decks to JSON?</h2>
  <p>Converting Anki decks to JSON enables...</p>

  <h2>Command Line Tool</h2>
  <pre><code>npm run anki:convert -- --input deck.apkg --output deck.json</code></pre>

  <h2>Frequently Asked Questions</h2>
  <h3>Is my data safe?</h3>
  <p>Yes! All conversion happens locally in your browser...</p>

  <h3>What happens to images and audio?</h3>
  <p>Media files are not included in the JSON output...</p>
</main>
```

### Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Anki Deck to JSON Converter",
  "description": "Convert Anki flashcard decks to JSON format",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "APKG file conversion",
    "TSV file conversion",
    "SQLite database conversion",
    "COLPKG file conversion",
    "Local processing",
    "Privacy-focused"
  ]
}
```

### Keywords

**Primary**: anki converter, anki to json, convert anki deck, apkg to json

**Secondary**: anki deck converter, anki export json, anki flashcards json, convert apkg file, anki database converter

**Long-tail**: how to convert anki deck to json, free anki converter online, anki apkg to json converter, export anki cards to json

### Open Graph Tags

```html
<meta property="og:title" content="Free Anki Deck to JSON Converter" />
<meta
  property="og:description"
  content="Convert Anki flashcard decks to JSON format instantly. Supports APKG, TSV, SQLite files. Free and private."
/>
<meta property="og:type" content="website" />
<meta property="og:image" content="/og-anki-converter.png" />
```

### Internal Linking

- Link from main tools page
- Link from Japanese learning resources
- Link from vocabulary/kanji pages
- Add to sitemap with high priority (0.8)

### Content Freshness

- Add "Last Updated" date
- Include changelog section
- Update with new Anki format support

## Security Considerations

1. **File Size Limits**: Enforce 500MB max file size in browser, 2GB in CLI
2. **Zip Bomb Protection**: Limit uncompressed size to 10x compressed size
3. **SQL Injection**: Use parameterized queries (not applicable as read-only)
4. **Path Traversal**: Sanitize all file paths in CLI tool
5. **Memory Limits**: Implement safeguards against memory exhaustion
6. **Content Security**: Sanitize all HTML content before processing

## Browser Compatibility

**Minimum Requirements**:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required APIs**:

- File API
- Web Workers
- IndexedDB (for sql.js)
- Blob API
- TextDecoder/TextEncoder

**Fallbacks**:

- Detect missing APIs and show compatibility message
- Suggest CLI tool for unsupported browsers

## Future Enhancements

1. **Batch Conversion**: Convert multiple files at once
2. **Format Options**: Export to CSV, XML, or other formats
3. **Media Extraction**: Optional media file download as separate ZIP
4. **Deck Merging**: Combine multiple decks into one JSON
5. **Filtering**: Convert only specific decks or tags
6. **Statistics**: More detailed deck analytics in output
7. **Preview**: Show sample cards before downloading
8. **Anki Import**: Reverse conversion (JSON to APKG)
