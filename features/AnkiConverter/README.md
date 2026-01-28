# Anki Converter

A comprehensive tool for converting Anki deck files into structured JSON format. Supports multiple Anki formats with both web and CLI interfaces.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
  - [Web Interface](#web-interface)
  - [CLI Tool](#cli-tool)
- [Supported Formats](#supported-formats)
- [JSON Output Format](#json-output-format)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Privacy & Security](#privacy--security)

## Overview

The Anki Converter transforms Anki flashcard decks from various formats (.apkg, .tsv, .sqlite, .colpkg, .anki2) into clean, structured JSON files. It extracts text content while removing media references, preserving deck hierarchy, tags, and card structure.

**Key Characteristics:**

- **Privacy-First**: All web processing happens locally in the browser
- **Dual Interface**: Web UI for users, CLI for automation
- **Format Agnostic**: Handles all major Anki formats
- **Type-Safe**: Built with TypeScript for reliability
- **Well-Tested**: Comprehensive unit and property-based tests

## Features

- ✅ **Multiple Format Support**: APKG, TSV, SQLite, COLPKG, ANKI2
- ✅ **Smart Structure Detection**: Automatically optimizes JSON for basic, cloze, and custom note types
- ✅ **Deck Hierarchy**: Preserves nested deck structures
- ✅ **Text Extraction**: Removes HTML and media tags, keeps clean text
- ✅ **Progress Tracking**: Real-time progress updates during conversion
- ✅ **Error Handling**: Descriptive error messages with recovery guidance
- ✅ **Local Processing**: No data leaves your device (web interface)
- ✅ **CLI Automation**: Scriptable command-line interface

## Architecture

### High-Level Structure

```
AnkiConverter/
├── components/          # React UI components
│   └── ConverterInterface.tsx
├── hooks/               # React hooks
│   └── useConversionWorker.ts
├── lib/                 # Core conversion logic
│   ├── conversionPipeline.ts    # Orchestrates conversion stages
│   ├── formatDetection.ts       # Detects file formats
│   ├── textExtractor.ts         # Cleans HTML and extracts text
│   ├── jsonBuilder.ts           # Structures output JSON
│   ├── filenameSanitizer.ts     # Sanitizes filenames
│   ├── fileDownload.ts          # Handles browser downloads
│   └── worker/                  # Web Worker implementation
├── parsers/             # Format-specific parsers
│   ├── apkgParser.ts
│   ├── tsvParser.ts
│   ├── sqliteParser.ts
│   └── colpkgParser.ts
├── types/               # TypeScript type definitions
│   ├── anki.ts          # Anki data structures
│   ├── conversion.ts    # Conversion pipeline types
│   ├── output.ts        # JSON output types
│   └── errors.ts        # Error types
└── __tests__/           # Test files
```

### Conversion Pipeline

The conversion process follows a five-stage pipeline:

```
1. Detection  → Identify file format from magic bytes/extension
2. Parsing    → Extract data using format-specific parser
3. Extraction → Pull out notes, cards, decks from parsed data
4. Transform  → Clean HTML, extract text, normalize structure
5. Building   → Construct optimized JSON output
```

### Technology Stack

**Web Interface:**

- React 19 for UI
- Web Workers for background processing
- JSZip for archive extraction
- sql.js for SQLite database parsing

**CLI Tool:**

- Node.js runtime
- Commander for argument parsing
- better-sqlite3 for native SQLite parsing
- fs/promises for file operations

## Installation

The Anki Converter is part of the KanaDojo project. No separate installation is required.

**Dependencies:**

```json
{
  "jszip": "^3.10.1",
  "sql.js": "^1.8.0",
  "better-sqlite3": "^9.2.2",
  "commander": "^11.1.0"
}
```

## Usage

### Web Interface

**Access:** Navigate to `/tools/anki-converter` in the application

**Steps:**

1. Drag and drop your Anki file onto the upload zone, or click to select
2. Wait for conversion to complete (progress bar shows status)
3. JSON file downloads automatically when finished
4. Review conversion statistics displayed on screen

**Supported Actions:**

- Drag and drop file upload
- Click to browse file system
- View real-time progress
- Automatic download on completion
- Retry on error

### CLI Tool

**Basic Usage:**

```bash
npm run anki:convert -- --input deck.apkg --output deck.json
```

**With Options:**

```bash
# Include card statistics
npm run anki:convert -- -i deck.apkg -o deck.json --include-stats

# Include suspended cards
npm run anki:convert -- -i deck.apkg -o deck.json --include-suspended

# Force specific format
npm run anki:convert -- -i file.db -o deck.json --format sqlite

# All options combined
npm run anki:convert -- -i deck.apkg -o deck.json --include-stats --include-suspended
```

**CLI Options:**

- `-i, --input <path>` - Input file path (required)
- `-o, --output <path>` - Output JSON file path (required)
- `--include-stats` - Include card review statistics
- `--include-suspended` - Include suspended cards
- `--format <format>` - Force format (auto, apkg, tsv, sqlite, colpkg, anki2)
- `-h, --help` - Display help information
- `-V, --version` - Display version number

**Exit Codes:**

- `0` - Success
- `1` - Error (check stderr for details)

## Supported Formats

### APKG Files (.apkg)

Anki package format containing deck data and media references.

- **Structure**: ZIP archive with collection.anki2 database
- **Use Case**: Standard Anki deck export format

### TSV Files (.tsv)

Tab-separated values format for simple card data.

- **Structure**: Plain text with tab delimiters
- **Use Case**: Simple imports/exports, spreadsheet compatibility

### SQLite Databases (.db, .sqlite, .anki2)

Direct Anki database files.

- **Structure**: SQLite database with Anki schema
- **Use Case**: Direct access to Anki's data storage

### COLPKG Files (.colpkg)

Collection package containing multiple decks.

- **Structure**: ZIP archive with collection.anki21 or collection.anki2
- **Use Case**: Full collection exports with all decks

### ANKI2 Files (.anki2)

Legacy Anki database format.

- **Structure**: SQLite database with schema version 2
- **Use Case**: Older Anki versions

## JSON Output Format

The converter produces structured JSON optimized for each deck type.

### Basic Structure

```json
{
  "decks": [
    {
      "name": "Deck Name",
      "description": "Deck description",
      "cards": [...],
      "subdecks": [...]
    }
  ],
  "metadata": {
    "convertedAt": "2025-01-26T10:30:00Z",
    "sourceFormat": "apkg",
    "totalDecks": 1,
    "totalCards": 100,
    "noteTypes": ["Basic", "Cloze"],
    "processingTime": 245
  }
}
```

### Card Types

#### Basic Cards

```json
{
  "id": "1234567890",
  "type": "basic",
  "front": "Question text",
  "back": "Answer text",
  "fields": {
    "Front": "Question text",
    "Back": "Answer text"
  },
  "tags": ["vocabulary", "beginner"]
}
```

#### Cloze Cards

```json
{
  "id": "9876543210",
  "type": "cloze",
  "text": "{{c1::Tokyo}} is the capital of {{c2::Japan}}",
  "clozes": [
    {
      "index": 1,
      "text": "[...] is the capital of Japan",
      "answer": "Tokyo"
    },
    {
      "index": 2,
      "text": "Tokyo is the capital of [...]",
      "answer": "Japan"
    }
  ],
  "fields": {
    "Text": "{{c1::Tokyo}} is the capital of {{c2::Japan}}",
    "Extra": "Additional information"
  },
  "tags": ["geography"]
}
```

#### Custom Cards

```json
{
  "id": "5555555555",
  "type": "custom",
  "noteType": "Japanese Vocabulary",
  "fields": {
    "Kanji": "日本",
    "Hiragana": "にほん",
    "Romaji": "nihon",
    "English": "Japan",
    "Example": "日本に行きたい"
  },
  "tags": ["japanese", "n5"]
}
```

### Nested Decks

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

### Optional Fields

When using `--include-stats`:

```json
{
  "stats": {
    "reviews": 42,
    "lapses": 3,
    "interval": 30,
    "ease": 2500
  }
}
```

When using `--include-suspended`:

```json
{
  "suspended": true
}
```

## API Reference

### Public Exports

```typescript
import {
  // Components
  ConverterInterface,

  // Hooks
  useConversionWorker,

  // Types
  ConversionOptions,
  ConversionResult,
  ConversionError,
  ErrorCode,

  // Data types
  Deck,
  OutputCard,
  BasicCard,
  ClozeCard,
  CustomCard,
} from '@/features/AnkiConverter';
```

### Core Functions

#### `createConversionPipeline()`

Creates a new conversion pipeline instance.

```typescript
import { createConversionPipeline } from '@/features/AnkiConverter/lib';

const pipeline = createConversionPipeline();

pipeline.on('progress', event => {
  console.log(`${event.stage}: ${event.progress}%`);
});

const result = await pipeline.convert(fileBuffer, {
  includeStats: true,
  includeSuspended: false,
});
```

#### `detectFormat()`

Detects file format from buffer or filename.

```typescript
import { detectFormat } from '@/features/AnkiConverter/lib';

const format = detectFormat(buffer, 'deck.apkg');
// Returns: 'apkg' | 'tsv' | 'sqlite' | 'colpkg' | 'anki2' | 'unknown'
```

#### `extractText()`

Extracts clean text from HTML content.

```typescript
import { extractText } from '@/features/AnkiConverter/lib';

const html = '<div>Hello <img src="test.jpg"> World</div>';
const text = extractText(html);
// Returns: 'Hello  World'
```

#### `sanitizeFilename()`

Sanitizes deck name for valid filename.

```typescript
import { sanitizeFilename } from '@/features/AnkiConverter/lib';

const filename = sanitizeFilename('My Deck: Test/Example');
// Returns: 'My Deck - Test-Example.json'
```

### React Hook

#### `useConversionWorker()`

React hook for web-based conversion with Web Worker.

```typescript
import { useConversionWorker } from '@/features/AnkiConverter';

function MyComponent() {
  const {
    convert,
    state,
    progress,
    error,
    result,
    reset
  } = useConversionWorker();

  const handleFile = async (file: File) => {
    await convert(file, { includeStats: true });
  };

  return (
    <div>
      {state === 'converting' && <p>Progress: {progress}%</p>}
      {state === 'complete' && <p>Done! {result.metadata.totalCards} cards</p>}
      {state === 'error' && <p>Error: {error?.message}</p>}
    </div>
  );
}
```

### Type Definitions

#### `ConversionOptions`

```typescript
interface ConversionOptions {
  includeStats?: boolean; // Include card statistics
  includeSuspended?: boolean; // Include suspended cards
  includeTags?: boolean; // Include tags (default: true)
  format?: SupportedFormat; // Force specific format
}
```

#### `ConversionResult`

```typescript
interface ConversionResult {
  decks: Deck[];
  metadata: ConversionMetadata;
}
```

#### `ProgressEvent`

```typescript
interface ProgressEvent {
  stage: 'detecting' | 'parsing' | 'extracting' | 'transforming' | 'building';
  progress: number; // 0-100
  message: string;
}
```

## Testing

The Anki Converter includes comprehensive test coverage:

### Unit Tests

```bash
# Run all tests
npm run test

# Run specific test file
npx vitest run features/AnkiConverter/__tests__/formatDetection.test.ts

# Watch mode
npm run test:watch
```

### Property-Based Tests

Uses `fast-check` for property-based testing with 100+ iterations per property.

**Test Properties:**

- Format detection accuracy
- Media tag removal completeness
- JSON output validity
- Card count preservation
- Deck hierarchy preservation
- Unicode character preservation
- Empty deck handling
- Field name preservation
- Tag array consistency
- Cloze deletion extraction
- HTML cleaning idempotence
- Error message descriptiveness
- Progress monotonicity
- Filename sanitization safety
- Local processing guarantee

### Test Fixtures

Located in `__tests__/fixtures/`:

- `test-basic.apkg` - Simple basic cards
- `test-cloze.apkg` - Cloze deletions
- `test-nested.apkg` - Nested deck structure
- `test-unicode.apkg` - Unicode content
- `test-custom.apkg` - Custom note types
- `test-empty.apkg` - Empty deck
- `test-large.tsv` - Large TSV file

## Privacy & Security

### Web Interface

- **Local Processing**: All conversion happens in the browser using Web Workers
- **No Network Requests**: No data is sent to external servers
- **Memory Cleanup**: File data is cleared after conversion
- **No Persistence**: Uploaded files are not stored

### CLI Tool

- **Local Execution**: Runs entirely on your machine
- **File System Only**: Only reads input and writes output files
- **No Telemetry**: No usage data collected

### Security Measures

- **File Size Limits**: 500MB (browser), 2GB (CLI)
- **Zip Bomb Protection**: 10x compression ratio limit
- **Path Sanitization**: Prevents path traversal attacks
- **HTML Sanitization**: Removes potentially malicious HTML
- **SQL Read-Only**: Database queries are read-only

## Browser Compatibility

**Minimum Requirements:**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required APIs:**

- File API
- Web Workers
- Blob API
- TextDecoder/TextEncoder

## Performance

**Expected Processing Times:**

- Small decks (<1,000 cards): <1 second
- Medium decks (1,000-10,000 cards): 1-5 seconds
- Large decks (10,000+ cards): 5-30 seconds
- Very large decks (100,000+ cards): 30-120 seconds (CLI recommended)

## Troubleshooting

### Common Issues

**"Invalid file format" error:**

- Ensure file has correct extension (.apkg, .tsv, etc.)
- Try forcing format with `--format` option (CLI)
- Verify file is not corrupted

**"Out of memory" error (browser):**

- Use CLI tool for large files
- Close other browser tabs
- Try a different browser

**"Permission denied" error (CLI):**

- Check file permissions
- Ensure output directory exists
- Run with appropriate user permissions

**Empty output:**

- Check if deck actually contains cards
- Verify suspended cards aren't filtered (use `--include-suspended`)

## Contributing

Contributions are welcome! Please follow the project's coding standards:

1. Use TypeScript with strict mode
2. Add tests for new features
3. Update documentation
4. Follow existing code style
5. Run `npm run check` before committing

## License

Part of the KanaDojo project. See main project LICENSE for details.

## Related Documentation

- [Main Architecture](../../../docs/ARCHITECTURE.md)
- [Contributing Guide](../../../CONTRIBUTING.md)
- [API Documentation](../../../docs/API.md)

---

**Last Updated**: January 2025
