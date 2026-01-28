# Anki Converter Test Fixtures

This directory contains test fixtures for the Anki Converter feature.

## Fixture Files

### APKG Files (Anki Package)

- `test-basic.apkg` - Simple basic cards (10 cards)
- `test-cloze.apkg` - Cloze deletion cards (10 cards)
- `test-nested.apkg` - Nested deck structure (3 decks, 30 cards)
- `test-unicode.apkg` - Japanese/Chinese/Arabic content (10 cards)
- `test-custom.apkg` - Custom note types with many fields (10 cards)
- `test-empty.apkg` - Empty deck (0 cards)

### TSV Files

- `test-large.tsv` - TSV with 1000 rows

## Generating Fixtures

Fixtures are generated programmatically using the `generateFixtures.ts` script.

To regenerate fixtures:

```bash
npx tsx features/AnkiConverter/__tests__/fixtures/generateFixtures.ts
```

## Usage in Tests

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

const fixturesDir = join(__dirname, 'fixtures');
const basicApkg = readFileSync(join(fixturesDir, 'test-basic.apkg'));
```

## File Format Details

### APKG Structure

APKG files are ZIP archives containing:

- `collection.anki2` or `collection.anki21` - SQLite database
- `media` - JSON mapping of media files (optional)

### TSV Structure

Tab-separated values with optional header row:

- Column 1: Front/Question
- Column 2: Back/Answer
- Column 3: Tags (space-separated, optional)
