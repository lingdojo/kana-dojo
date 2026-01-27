# Anki Converter Documentation Index

Complete documentation for the Anki Converter feature.

## Quick Links

- **[README.md](./README.md)** - Start here! Feature overview, installation, and basic usage
- **[CLI_USAGE.md](./CLI_USAGE.md)** - Complete command-line tool guide
- **[JSON_FORMAT.md](./JSON_FORMAT.md)** - Detailed output format specification
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture and design

## Documentation by Use Case

### I want to convert Anki decks

**Web Interface:**

1. Read [README.md](./README.md#web-interface) for web usage
2. Navigate to `/tools/anki-converter` in the app
3. Drag and drop your file

**Command Line:**

1. Read [CLI_USAGE.md](./CLI_USAGE.md#basic-usage) for CLI basics
2. Run: `npm run anki:convert -- -i deck.apkg -o deck.json`

### I want to understand the output

1. Read [JSON_FORMAT.md](./JSON_FORMAT.md) for complete format specification
2. See [JSON_FORMAT.md#examples](./JSON_FORMAT.md#examples) for sample outputs
3. Check [JSON_FORMAT.md#card-types](./JSON_FORMAT.md#card-types) for card structures

### I want to integrate this into my project

1. Read [README.md#api-reference](./README.md#api-reference) for public API
2. Check [ARCHITECTURE.md#module-boundaries](./ARCHITECTURE.md#module-boundaries) for imports
3. See TypeScript types in `types/` directory

### I want to contribute or modify the code

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for technical overview
2. Check [ARCHITECTURE.md#architecture-layers](./ARCHITECTURE.md#architecture-layers) for structure
3. Review [ARCHITECTURE.md#testing-strategy](./ARCHITECTURE.md#testing-strategy) for tests
4. See [README.md#contributing](./README.md#contributing) for guidelines

### I'm having problems

1. Check [CLI_USAGE.md#troubleshooting](./CLI_USAGE.md#troubleshooting) for common issues
2. Review [README.md#troubleshooting](./README.md#troubleshooting) for solutions
3. See [ARCHITECTURE.md#error-handling-strategy](./ARCHITECTURE.md#error-handling-strategy) for error types

## Documentation Structure

```
AnkiConverter/
├── README.md              # Feature overview and quick start
├── CLI_USAGE.md           # Command-line tool guide
├── JSON_FORMAT.md         # Output format specification
├── ARCHITECTURE.md        # Technical architecture
├── DOCS_INDEX.md          # This file
│
├── components/            # React components
├── hooks/                 # React hooks
├── lib/                   # Core conversion logic
├── parsers/               # Format-specific parsers
├── types/                 # TypeScript definitions
└── __tests__/             # Test files
```

## Key Concepts

### Supported Formats

- **APKG** - Anki package files (.apkg)
- **TSV** - Tab-separated values (.tsv)
- **SQLite** - Direct database files (.db, .sqlite, .anki2)
- **COLPKG** - Collection packages (.colpkg)

### Card Types

- **Basic** - Simple front/back flashcards
- **Cloze** - Fill-in-the-blank with {{c1::deletions}}
- **Custom** - User-defined note types with multiple fields

### Conversion Pipeline

1. **Detection** - Identify file format
2. **Parsing** - Extract data from format
3. **Extraction** - Pull out notes/cards/decks
4. **Transformation** - Clean HTML and text
5. **Building** - Construct JSON output

## API Quick Reference

### React Hook

```typescript
import { useConversionWorker } from '@/features/AnkiConverter';

const { convert, state, progress, result, error } = useConversionWorker();
```

### Core Functions

```typescript
import {
  createConversionPipeline,
  detectFormat,
  extractText,
  sanitizeFilename,
} from '@/features/AnkiConverter/lib';
```

### Types

```typescript
import type {
  ConversionResult,
  ConversionOptions,
  Deck,
  OutputCard,
  BasicCard,
  ClozeCard,
  CustomCard,
} from '@/features/AnkiConverter';
```

## CLI Quick Reference

```bash
# Basic conversion
npm run anki:convert -- -i deck.apkg -o deck.json

# With statistics
npm run anki:convert -- -i deck.apkg -o deck.json --include-stats

# Include suspended cards
npm run anki:convert -- -i deck.apkg -o deck.json --include-suspended

# Force format
npm run anki:convert -- -i file.db -o output.json --format sqlite

# Help
npm run anki:convert -- --help
```

## Specification Documents

The feature was developed using spec-driven development:

- **[Requirements](../../.kiro/specs/anki-converter/requirements.md)** - User stories and acceptance criteria
- **[Design](../../.kiro/specs/anki-converter/design.md)** - Architecture and correctness properties
- **[Tasks](../../.kiro/specs/anki-converter/tasks.md)** - Implementation plan

## External Resources

- [Anki Manual](https://docs.ankiweb.net/) - Official Anki documentation
- [Anki Database Structure](https://github.com/ankidroid/Anki-Android/wiki/Database-Structure) - Schema reference
- [JSZip Documentation](https://stuk.github.io/jszip/) - ZIP handling library
- [sql.js Documentation](https://sql.js.org/) - SQLite in browser

## Getting Help

1. **Check documentation** - Most questions are answered here
2. **Review examples** - See [JSON_FORMAT.md#examples](./JSON_FORMAT.md#examples)
3. **Run tests** - `npm run test` to verify functionality
4. **Report issues** - Include error messages and sample files

## Contributing

See [README.md#contributing](./README.md#contributing) for contribution guidelines.

---

**Last Updated**: January 2025
