# Anki Converter Architecture

Technical architecture documentation for the Anki Converter feature.

## Overview

The Anki Converter is a dual-interface tool (web + CLI) that transforms Anki deck files into structured JSON. It follows a pipeline architecture with format-specific parsers feeding into a unified conversion process.

## Design Principles

1. **Privacy First**: Web interface processes everything locally
2. **Format Agnostic**: Unified pipeline handles all formats
3. **Type Safety**: Comprehensive TypeScript types throughout
4. **Progressive Enhancement**: Web Workers for performance, fallback to main thread
5. **Error Recovery**: Descriptive errors with actionable guidance
6. **Testability**: Property-based and unit tests for correctness

## Architecture Layers

### 1. Presentation Layer

**Web Interface** (`components/ConverterInterface.tsx`)

- React component with drag-and-drop
- Progress tracking UI
- Error display and recovery
- Automatic file download

**CLI Tool** (`scripts/anki-converter.ts`)

- Commander-based argument parsing
- Terminal progress display
- File system operations
- Exit code handling

### 2. Orchestration Layer

**Conversion Pipeline** (`lib/conversionPipeline.ts`)

- Coordinates five conversion stages
- Emits progress events (0-100%)
- Routes to appropriate parser
- Handles errors with recovery strategies

**Stages:**

1. **Detection** (5%) - Identify file format
2. **Parsing** (40%) - Extract raw data
3. **Extraction** (20%) - Pull out notes/cards/decks
4. **Transformation** (20%) - Clean HTML, extract text
5. **Building** (15%) - Construct JSON output

### 3. Parser Layer

Each parser handles a specific format:

**APKG Parser** (`parsers/apkgParser.ts`)

- Unzips .apkg archive
- Extracts collection.anki2 database
- Delegates to SQLite parser

**TSV Parser** (`parsers/tsvParser.ts`)

- Parses tab-separated values
- Handles escaped characters
- Detects field structure

**SQLite Parser** (`parsers/sqliteParser.ts`)

- Queries Anki database schema
- Extracts notes, cards, decks
- Handles schema version differences (v2, v11, v21)
- Joins related tables

**COLPKG Parser** (`parsers/colpkgParser.ts`)

- Unzips .colpkg archive
- Extracts collection database
- Processes multiple decks
- Delegates to SQLite parser

### 4. Transformation Layer

**Text Extractor** (`lib/textExtractor.ts`)

- Removes HTML tags
- Strips media references (img, audio, video, [sound:...])
- Preserves formatting markers (**bold**, _italic_)
- Decodes HTML entities
- Normalizes whitespace

**Format Detection** (`lib/formatDetection.ts`)

- Checks magic bytes (ZIP, SQLite)
- Examines file extension
- Analyzes content structure
- Returns format or 'unknown'

### 5. Output Layer

**JSON Builder** (`lib/jsonBuilder.ts`)

- Structures data by note type
- Optimizes for basic/cloze/custom cards
- Preserves deck hierarchy
- Generates metadata
- Handles optional fields (stats, suspended)

**File Download** (`lib/fileDownload.ts`)

- Creates JSON Blob
- Generates sanitized filename
- Triggers browser download
- Cleans up object URLs

## Data Flow

```
Input File
    ↓
Format Detection
    ↓
Parser Selection
    ↓
Format-Specific Parser → ParsedAnkiData
    ↓
Text Extraction & Cleaning
    ↓
JSON Builder → ConversionResult
    ↓
Output (Download/File)
```

## Type System

### Core Types

**Anki Data** (`types/anki.ts`)

- `Note` - Raw note from database
- `Card` - Card with scheduling info
- `DeckInfo` - Deck metadata
- `NoteType` - Note type definition
- `ParsedAnkiData` - Intermediate format

**Conversion** (`types/conversion.ts`)

- `ConversionOptions` - Input options
- `ConversionResult` - Output structure
- `ProgressEvent` - Progress updates
- `ConversionStage` - Pipeline stages

**Output** (`types/output.ts`)

- `Deck` - Deck with cards
- `OutputCard` - Base card interface
- `BasicCard` - Front/back cards
- `ClozeCard` - Cloze deletion cards
- `CustomCard` - Custom note type cards
- `ConversionMetadata` - Conversion info

**Errors** (`types/errors.ts`)

- `ConversionError` - Custom error class
- `ErrorCode` - Error type enum
- `ErrorRecovery` - Recovery strategies

## Web Worker Architecture

**Purpose**: Keep UI responsive during conversion

**Implementation:**

- Worker script in `lib/worker/`
- Message passing for progress
- Shared memory for large files
- Automatic cleanup

**Flow:**

```
Main Thread                 Worker Thread
    │                           │
    ├─ Send file buffer ───────>│
    │                           ├─ Convert
    │<──── Progress events ─────┤
    │                           ├─ Complete
    │<──── Result ──────────────┤
    ├─ Cleanup                  │
```

## Error Handling Strategy

### Error Categories

1. **File Format Errors**
   - Invalid extension
   - Corrupted archive
   - Missing required files

2. **Parsing Errors**
   - Unsupported schema version
   - Malformed data
   - Database query failures

3. **Content Errors**
   - Extremely large fields
   - Invalid UTF-8
   - Circular references

4. **System Errors**
   - Out of memory
   - File system errors (CLI)
   - Worker crashes

### Error Recovery

Each error includes:

- Error code (enum)
- Descriptive message
- Details object
- Recovery guidance
- Recoverable flag

## Performance Optimizations

### Web Interface

- Web Workers for background processing
- Streaming for large files
- Throttled progress updates (100ms)
- Memory cleanup after stages

### CLI Tool

- Native SQLite (better-sqlite3)
- Streaming file I/O
- Parallel deck processing
- Chunking for large files

### Expected Performance

- Small (<1K cards): <1s
- Medium (1K-10K): 1-5s
- Large (10K+): 5-30s
- Very large (100K+): 30-120s (CLI)

## Security Measures

1. **File Size Limits**
   - Browser: 500MB max
   - CLI: 2GB max

2. **Zip Bomb Protection**
   - 10x compression ratio limit
   - Uncompressed size checks

3. **Path Sanitization**
   - Remove path separators
   - Limit filename length (255 chars)
   - Replace special characters

4. **HTML Sanitization**
   - Remove script tags
   - Strip event handlers
   - Clean malicious content

5. **SQL Safety**
   - Read-only queries
   - Parameterized statements
   - No dynamic SQL

## Testing Strategy

### Unit Tests

- Individual function testing
- Format detection logic
- Text extraction
- JSON building
- Error handling

### Property-Based Tests

- 100+ iterations per property
- Random input generation
- Invariant verification
- Edge case discovery

**Properties Tested:**

- Format detection accuracy
- Media tag removal completeness
- JSON validity
- Card count preservation
- Deck hierarchy preservation
- Unicode preservation
- Empty deck handling
- Field name preservation
- Tag consistency
- Cloze extraction
- HTML idempotence
- Error descriptiveness
- Progress monotonicity
- Filename safety
- Local processing guarantee

### Integration Tests

- End-to-end conversion
- Web Worker communication
- File download mechanism
- CLI execution
- Error scenarios

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
- IndexedDB (for sql.js)

## Dependencies

### Web Interface

- `jszip` - ZIP archive handling
- `sql.js` - SQLite in browser (WebAssembly)
- React 19 - UI framework

### CLI Tool

- `better-sqlite3` - Native SQLite bindings
- `commander` - CLI argument parsing
- `jszip` - ZIP archive handling

### Development

- `fast-check` - Property-based testing
- `vitest` - Test runner
- TypeScript - Type safety

## Module Boundaries

### Public API (`index.ts`)

- Components: `ConverterInterface`
- Hooks: `useConversionWorker`
- Types: All conversion types
- Errors: `ConversionError`, `ErrorCode`

### Internal Modules

- `lib/` - Core utilities (public)
- `parsers/` - Format parsers (internal)
- `components/` - UI components (public)
- `hooks/` - React hooks (public)
- `types/` - Type definitions (public)

### Import Rules

- External code uses barrel exports (`index.ts`)
- Internal code can import directly
- No circular dependencies
- Path aliases for cross-feature imports

## Future Enhancements

1. **Batch Conversion** - Multiple files at once
2. **Format Options** - Export to CSV, XML
3. **Media Extraction** - Optional media download
4. **Deck Merging** - Combine multiple decks
5. **Filtering** - Convert specific decks/tags
6. **Statistics** - More detailed analytics
7. **Preview** - Sample cards before download
8. **Reverse Conversion** - JSON to APKG

## Related Documentation

- [README.md](./README.md) - Feature overview and usage
- [CLI_USAGE.md](./CLI_USAGE.md) - Command-line guide
- [JSON_FORMAT.md](./JSON_FORMAT.md) - Output specification
- [Design Document](../../.kiro/specs/anki-converter/design.md) - Original design
- [Requirements](../../.kiro/specs/anki-converter/requirements.md) - Requirements spec

---

**Last Updated**: January 2025
