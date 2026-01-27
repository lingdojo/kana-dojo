# Anki Converter JSON Output Format

Comprehensive specification of the JSON output format produced by the Anki Converter.

## Table of Contents

- [Overview](#overview)
- [Root Structure](#root-structure)
- [Deck Object](#deck-object)
- [Card Types](#card-types)
- [Metadata](#metadata)
- [Field Mappings](#field-mappings)
- [Examples](#examples)
- [Schema Validation](#schema-validation)

## Overview

The Anki Converter produces structured JSON optimized for each deck type. The output is designed to be:

- **Human-readable**: Formatted with 2-space indentation
- **Type-specific**: Optimized structure for basic, cloze, and custom cards
- **Hierarchical**: Preserves nested deck structures
- **Complete**: Includes all text content and metadata
- **Extensible**: Optional fields for statistics and suspension status

## Root Structure

Every conversion produces a JSON object with two top-level properties:

```typescript
interface ConversionResult {
  decks: Deck[];
  metadata: ConversionMetadata;
}
```

### Example

```json
{
  "decks": [...],
  "metadata": {...}
}
```

## Deck Object

Each deck in the `decks` array has the following structure:

```typescript
interface Deck {
  name: string;
  description: string;
  cards: OutputCard[];
  subdecks?: Deck[];
}
```

### Properties

| Property      | Type         | Required | Description                                      |
| ------------- | ------------ | -------- | ------------------------------------------------ |
| `name`        | string       | Yes      | Deck name (e.g., "Japanese Vocabulary")          |
| `description` | string       | Yes      | Deck description (may be empty string)           |
| `cards`       | OutputCard[] | Yes      | Array of cards in this deck                      |
| `subdecks`    | Deck[]       | No       | Nested child decks (for hierarchical structures) |

### Example

```json
{
  "name": "Japanese",
  "description": "Japanese language learning materials",
  "cards": [
    {
      "id": "1234567890",
      "type": "basic",
      "front": "こんにちは",
      "back": "Hello"
    }
  ],
  "subdecks": [
    {
      "name": "Vocabulary",
      "description": "Japanese vocabulary words",
      "cards": [...]
    }
  ]
}
```

## Card Types

The converter produces three types of cards, each with an optimized structure.

### Base Card Properties

All cards share these common properties:

```typescript
interface BaseCard {
  id: string;
  type: 'basic' | 'cloze' | 'custom';
  fields: Record<string, string>;
  tags: string[];
  stats?: CardStats;
  suspended?: boolean;
}
```

| Property    | Type      | Required | Description                                  |
| ----------- | --------- | -------- | -------------------------------------------- |
| `id`        | string    | Yes      | Unique card identifier                       |
| `type`      | string    | Yes      | Card type: "basic", "cloze", or "custom"     |
| `fields`    | object    | Yes      | All field names and values                   |
| `tags`      | string[]  | Yes      | Array of tags (empty array if none)          |
| `stats`     | CardStats | No       | Review statistics (if `--include-stats`)     |
| `suspended` | boolean   | No       | Suspension status (if `--include-suspended`) |

### Basic Cards

Basic cards have front and back fields for simple Q&A flashcards.

```typescript
interface BasicCard extends BaseCard {
  type: 'basic';
  front: string;
  back: string;
}
```

**Example:**

```json
{
  "id": "1234567890",
  "type": "basic",
  "front": "What is the capital of Japan?",
  "back": "Tokyo",
  "fields": {
    "Front": "What is the capital of Japan?",
    "Back": "Tokyo"
  },
  "tags": ["geography", "japan"]
}
```

### Cloze Cards

Cloze cards have text with deletions marked by `{{c1::text}}` syntax.

```typescript
interface ClozeCard extends BaseCard {
  type: 'cloze';
  text: string;
  clozes: ClozeVariation[];
}

interface ClozeVariation {
  index: number;
  text: string;
  answer: string;
}
```

**Properties:**

| Property | Type             | Description                  |
| -------- | ---------------- | ---------------------------- |
| `text`   | string           | Full text with cloze markers |
| `clozes` | ClozeVariation[] | Array of cloze variations    |

**ClozeVariation Properties:**

| Property | Type   | Description                            |
| -------- | ------ | -------------------------------------- |
| `index`  | number | Cloze number (1, 2, 3, etc.)           |
| `text`   | string | Text with this cloze hidden as `[...]` |
| `answer` | string | The hidden text                        |

**Example:**

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
    "Extra": "Tokyo has a population of over 13 million"
  },
  "tags": ["geography", "capitals"]
}
```

### Custom Cards

Custom cards preserve all fields from custom note types.

```typescript
interface CustomCard extends BaseCard {
  type: 'custom';
  noteType: string;
}
```

**Additional Property:**

| Property   | Type   | Description                  |
| ---------- | ------ | ---------------------------- |
| `noteType` | string | Name of the custom note type |

**Example:**

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
    "Example": "日本に行きたい",
    "ExampleTranslation": "I want to go to Japan"
  },
  "tags": ["japanese", "n5", "countries"]
}
```

## Metadata

The metadata object provides information about the conversion process.

```typescript
interface ConversionMetadata {
  convertedAt: string;
  sourceFormat: string;
  totalDecks: number;
  totalCards: number;
  noteTypes: string[];
  ankiVersion?: string;
  processingTime: number;
}
```

### Properties

| Property         | Type     | Required | Description                                               |
| ---------------- | -------- | -------- | --------------------------------------------------------- |
| `convertedAt`    | string   | Yes      | ISO 8601 timestamp of conversion                          |
| `sourceFormat`   | string   | Yes      | Source format: "apkg", "tsv", "sqlite", "colpkg", "anki2" |
| `totalDecks`     | number   | Yes      | Total number of decks (including subdecks)                |
| `totalCards`     | number   | Yes      | Total number of cards across all decks                    |
| `noteTypes`      | string[] | Yes      | Array of note type names found                            |
| `ankiVersion`    | string   | No       | Anki version (if available from source)                   |
| `processingTime` | number   | Yes      | Processing time in milliseconds                           |

### Example

```json
{
  "convertedAt": "2025-01-26T10:30:00.000Z",
  "sourceFormat": "apkg",
  "totalDecks": 3,
  "totalCards": 1250,
  "noteTypes": ["Basic", "Cloze", "Japanese Vocabulary"],
  "ankiVersion": "2.1.54",
  "processingTime": 1245
}
```

## Field Mappings

### Common Field Names

Anki uses various field names depending on note type:

**Basic Note Type:**

- `Front` - Question/prompt
- `Back` - Answer/response

**Cloze Note Type:**

- `Text` - Text with cloze deletions
- `Extra` - Additional information
- `Back Extra` - Extra content shown on back

**Custom Note Types:**

- Field names are defined by the user
- All fields are preserved in the `fields` object

### Field Name Normalization

Field names are preserved exactly as defined in Anki, including:

- Capitalization
- Spaces
- Special characters

## Optional Fields

### Card Statistics

When using `--include-stats`, cards include a `stats` object:

```typescript
interface CardStats {
  reviews: number;
  lapses: number;
  interval: number;
  ease: number;
}
```

| Property   | Type   | Description                        |
| ---------- | ------ | ---------------------------------- |
| `reviews`  | number | Total number of reviews            |
| `lapses`   | number | Number of times card was forgotten |
| `interval` | number | Current interval in days           |
| `ease`     | number | Ease factor (2500 = 250%)          |

**Example:**

```json
{
  "id": "1234567890",
  "type": "basic",
  "front": "Question",
  "back": "Answer",
  "stats": {
    "reviews": 42,
    "lapses": 3,
    "interval": 30,
    "ease": 2500
  }
}
```

### Suspension Status

When using `--include-suspended`, cards include a `suspended` property:

```json
{
  "id": "1234567890",
  "type": "basic",
  "front": "Question",
  "back": "Answer",
  "suspended": true
}
```

## Examples

### Simple Deck

```json
{
  "decks": [
    {
      "name": "Spanish Vocabulary",
      "description": "Basic Spanish words",
      "cards": [
        {
          "id": "1111111111",
          "type": "basic",
          "front": "hola",
          "back": "hello",
          "fields": {
            "Front": "hola",
            "Back": "hello"
          },
          "tags": ["greetings"]
        },
        {
          "id": "2222222222",
          "type": "basic",
          "front": "adiós",
          "back": "goodbye",
          "fields": {
            "Front": "adiós",
            "Back": "goodbye"
          },
          "tags": ["greetings"]
        }
      ]
    }
  ],
  "metadata": {
    "convertedAt": "2025-01-26T10:30:00.000Z",
    "sourceFormat": "apkg",
    "totalDecks": 1,
    "totalCards": 2,
    "noteTypes": ["Basic"],
    "processingTime": 125
  }
}
```

### Nested Decks

```json
{
  "decks": [
    {
      "name": "Languages",
      "description": "Language learning decks",
      "cards": [],
      "subdecks": [
        {
          "name": "Japanese",
          "description": "Japanese language",
          "cards": [
            {
              "id": "3333333333",
              "type": "basic",
              "front": "こんにちは",
              "back": "hello",
              "fields": {
                "Front": "こんにちは",
                "Back": "hello"
              },
              "tags": ["japanese", "greetings"]
            }
          ],
          "subdecks": [
            {
              "name": "Kanji",
              "description": "Japanese kanji characters",
              "cards": [...]
            }
          ]
        },
        {
          "name": "Spanish",
          "description": "Spanish language",
          "cards": [...]
        }
      ]
    }
  ],
  "metadata": {
    "convertedAt": "2025-01-26T10:30:00.000Z",
    "sourceFormat": "colpkg",
    "totalDecks": 4,
    "totalCards": 500,
    "noteTypes": ["Basic", "Japanese Vocabulary"],
    "processingTime": 2340
  }
}
```

### Mixed Card Types

```json
{
  "decks": [
    {
      "name": "Mixed Deck",
      "description": "Contains multiple card types",
      "cards": [
        {
          "id": "4444444444",
          "type": "basic",
          "front": "Basic question",
          "back": "Basic answer",
          "fields": {
            "Front": "Basic question",
            "Back": "Basic answer"
          },
          "tags": []
        },
        {
          "id": "5555555555",
          "type": "cloze",
          "text": "The {{c1::quick}} brown {{c2::fox}} jumps",
          "clozes": [
            {
              "index": 1,
              "text": "The [...] brown fox jumps",
              "answer": "quick"
            },
            {
              "index": 2,
              "text": "The quick brown [...] jumps",
              "answer": "fox"
            }
          ],
          "fields": {
            "Text": "The {{c1::quick}} brown {{c2::fox}} jumps"
          },
          "tags": ["example"]
        },
        {
          "id": "6666666666",
          "type": "custom",
          "noteType": "Vocabulary",
          "fields": {
            "Word": "example",
            "Definition": "a thing characteristic of its kind",
            "Sentence": "This is an example sentence"
          },
          "tags": ["vocabulary"]
        }
      ]
    }
  ],
  "metadata": {
    "convertedAt": "2025-01-26T10:30:00.000Z",
    "sourceFormat": "apkg",
    "totalDecks": 1,
    "totalCards": 3,
    "noteTypes": ["Basic", "Cloze", "Vocabulary"],
    "processingTime": 156
  }
}
```

### Empty Deck

```json
{
  "decks": [
    {
      "name": "Empty Deck",
      "description": "This deck has no cards",
      "cards": []
    }
  ],
  "metadata": {
    "convertedAt": "2025-01-26T10:30:00.000Z",
    "sourceFormat": "apkg",
    "totalDecks": 1,
    "totalCards": 0,
    "noteTypes": [],
    "processingTime": 45
  }
}
```

## Schema Validation

### JSON Schema

You can validate the output using this JSON Schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["decks", "metadata"],
  "properties": {
    "decks": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Deck"
      }
    },
    "metadata": {
      "$ref": "#/definitions/Metadata"
    }
  },
  "definitions": {
    "Deck": {
      "type": "object",
      "required": ["name", "description", "cards"],
      "properties": {
        "name": { "type": "string" },
        "description": { "type": "string" },
        "cards": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Card"
          }
        },
        "subdecks": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Deck"
          }
        }
      }
    },
    "Card": {
      "type": "object",
      "required": ["id", "type", "fields", "tags"],
      "properties": {
        "id": { "type": "string" },
        "type": {
          "type": "string",
          "enum": ["basic", "cloze", "custom"]
        },
        "fields": {
          "type": "object",
          "additionalProperties": { "type": "string" }
        },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        },
        "stats": {
          "$ref": "#/definitions/Stats"
        },
        "suspended": { "type": "boolean" }
      }
    },
    "Stats": {
      "type": "object",
      "required": ["reviews", "lapses", "interval", "ease"],
      "properties": {
        "reviews": { "type": "number" },
        "lapses": { "type": "number" },
        "interval": { "type": "number" },
        "ease": { "type": "number" }
      }
    },
    "Metadata": {
      "type": "object",
      "required": [
        "convertedAt",
        "sourceFormat",
        "totalDecks",
        "totalCards",
        "noteTypes",
        "processingTime"
      ],
      "properties": {
        "convertedAt": {
          "type": "string",
          "format": "date-time"
        },
        "sourceFormat": {
          "type": "string",
          "enum": ["apkg", "tsv", "sqlite", "colpkg", "anki2"]
        },
        "totalDecks": { "type": "number" },
        "totalCards": { "type": "number" },
        "noteTypes": {
          "type": "array",
          "items": { "type": "string" }
        },
        "ankiVersion": { "type": "string" },
        "processingTime": { "type": "number" }
      }
    }
  }
}
```

### TypeScript Types

The converter exports TypeScript types for the output format:

```typescript
import type {
  ConversionResult,
  Deck,
  OutputCard,
  BasicCard,
  ClozeCard,
  CustomCard,
  ConversionMetadata,
} from '@/features/AnkiConverter';
```

## Parsing the Output

### JavaScript/TypeScript

```typescript
import { readFile } from 'fs/promises';

const json = await readFile('deck.json', 'utf-8');
const result: ConversionResult = JSON.parse(json);

// Access decks
for (const deck of result.decks) {
  console.log(`Deck: ${deck.name}`);
  console.log(`Cards: ${deck.cards.length}`);

  // Process cards
  for (const card of deck.cards) {
    if (card.type === 'basic') {
      console.log(`Q: ${card.front}`);
      console.log(`A: ${card.back}`);
    }
  }
}
```

### Python

```python
import json

with open('deck.json', 'r', encoding='utf-8') as f:
    result = json.load(f)

# Access decks
for deck in result['decks']:
    print(f"Deck: {deck['name']}")
    print(f"Cards: {len(deck['cards'])}")

    # Process cards
    for card in deck['cards']:
        if card['type'] == 'basic':
            print(f"Q: {card['front']}")
            print(f"A: {card['back']}")
```

### jq (Command Line)

```bash
# Get total cards
jq '.metadata.totalCards' deck.json

# List all deck names
jq '.decks[].name' deck.json

# Get all basic cards
jq '.decks[].cards[] | select(.type == "basic")' deck.json

# Count cards by type
jq '[.decks[].cards[].type] | group_by(.) | map({type: .[0], count: length})' deck.json
```

## Related Documentation

- [Main README](./README.md) - Feature overview
- [CLI Usage Guide](./CLI_USAGE.md) - Command-line usage
- [API Reference](./README.md#api-reference) - Programmatic usage

---

**Last Updated**: January 2025
