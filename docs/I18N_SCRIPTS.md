# i18n Scripts Documentation

This document describes the internationalization (i18n) scripts used to manage translations in KanaDojo.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Available Scripts](#available-scripts)
- [Translation Structure](#translation-structure)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

---

## Overview

KanaDojo uses **next-intl** for internationalization with namespace-based translation files. The i18n scripts provide tools for:

- **Validation**: Ensuring all languages have complete translations
- **Type Generation**: Creating TypeScript types for translation keys
- **Export/Import**: Working with translations in CSV format
- **Scanning**: Finding hardcoded strings in the codebase

---

## Available Scripts

### `i18n:validate`

Validates that all translation keys exist across all languages.

```bash
npm run i18n:validate
```

**What it checks**:

- Every key in English (`en/`) exists in all other locales
- No missing keys in any translation file
- Valid JSON syntax

**Example output**:

```
✅ All translations are valid!
```

Or if there are errors:

```
❌ ES: Missing 3 keys:
  - kana.game.hint
  - kanji.details.radical
  - vocabulary.categories.verbs
```

**Exit codes**:

- `0`: All translations valid
- `1`: Validation failed

---

### `i18n:generate-types`

Generates TypeScript types for translation keys to enable autocomplete.

```bash
npm run i18n:generate-types
```

**Output**:

- Creates type definitions in `core/i18n/types/`
- Enables IDE autocomplete for translation keys
- Prevents typos in translation key names

**Example**:

```typescript
// Before (no autocomplete)
t('kana.game.score'); // Could be misspelled

// After (with generated types)
t('kana.game.score'); // Autocomplete shows valid keys
```

---

### `i18n:check`

Runs both validation and type generation.

```bash
npm run i18n:check
```

**Equivalent to**:

```bash
npm run i18n:validate && npm run i18n:generate-types
```

---

### `i18n:export-csv`

Exports all translations to CSV files for easier editing.

```bash
npm run i18n:export-csv
```

**Output**:

- Creates CSV files in `scripts/i18n/reports/`
- One file per namespace
- Columns: `key`, `en`, `es`, `ja`

**Example CSV structure**:

```csv
key,en,es,ja
buttons.submit,Submit,Enviar,送信
buttons.cancel,Cancel,キャンセル,キャンセル
```

**Use cases**:

- Bulk editing in Excel or Google Sheets
- Sharing with non-technical translators
- Preparing translations for import

---

### `i18n:scan` (Coming Soon)

Scans the codebase for hardcoded strings that should be translated.

```bash
npm run i18n:scan
```

**What it finds**:

- String literals that don't use the translation function
- Text that should be externalized to translation files

**Example output**:

```
⚠️ Found 5 hardcoded strings:
  - app/page.tsx:42: "Start Training"
  - features/Kana/components/Game.tsx:15: "Score: "
```

---

## Translation Structure

### Directory Layout

```
core/i18n/
├── locales/
│   ├── en/                    # English (reference)
│   │   ├── common.json
│   │   ├── navigation.json
│   │   ├── kana.json
│   │   ├── kanji.json
│   │   ├── vocabulary.json
│   │   ├── achievements.json
│   │   ├── statistics.json
│   │   ├── settings.json
│   │   └── errors.json
│   ├── es/                    # Spanish
│   │   └── (same files)
│   └── ja/                    # Japanese
│       └── (same files)
├── types/                     # Generated types
│   └── index.ts
├── config.ts                  # i18n configuration
└── request.ts                 # Server-side i18n
```

### Namespace Descriptions

| Namespace      | Description               | Example Keys                           |
| -------------- | ------------------------- | -------------------------------------- |
| `common`       | Reusable UI elements      | `buttons.submit`, `messages.loading`   |
| `navigation`   | Menu, breadcrumbs, footer | `menu.home`, `footer.about`            |
| `kana`         | Hiragana/Katakana feature | `game.score`, `results.accuracy`       |
| `kanji`        | Kanji learning feature    | `selection.byLevel`, `details.meaning` |
| `vocabulary`   | Vocabulary feature        | `categories.verbs`, `game.streak`      |
| `achievements` | Achievement system        | `unlocked`, `rarity.legendary`         |
| `statistics`   | Progress tracking         | `overview.totalStudyTime`              |
| `settings`     | App configuration         | `appearance.theme`                     |
| `errors`       | Error messages            | `validation.required`                  |

---

## Usage Examples

### Adding a New Key

1. Add the key to `core/i18n/locales/en/common.json`:

```json
{
  "buttons": {
    "save": "Save"
  }
}
```

2. Run validation:

```bash
npm run i18n:validate
```

3. You'll see the missing key in output:

```
❌ ES: Missing 1 key:
  - common.buttons.save
```

4. Add the key to `core/i18n/locales/es/common.json`:

```json
{
  "buttons": {
    "save": "Guardar"
  }
}
```

5. Validate again:

```bash
npm run i18n:validate
# ✅ All translations are valid!
```

### Using Translations in Code

**In Server Components**:

```typescript
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('common');
  return <button>{t('buttons.save')}</button>;
}
```

**In Client Components**:

```typescript
import { useTranslations } from 'next-intl';

export function SaveButton() {
  const t = useTranslations('common');
  return <button>{t('buttons.save')}</button>;
}
```

### Working with CSV

1. Export translations:

```bash
npm run i18n:export-csv
```

2. Edit `scripts/i18n/reports/common.csv` in Excel

3. Import is not yet automated - manually update JSON files or contribute an import script!

---

## Best Practices

### 1. Keep Keys Organized

Use dot notation to group related keys:

```json
{
  "game": {
    "mode": {
      "pick": "Pick",
      "input": "Input"
    },
    "result": {
      "correct": "Correct!",
      "incorrect": "Incorrect"
    }
  }
}
```

### 2. Don't Translate Keys

Keys are identifiers, not content:

```json
// ✅ Correct
{"buttons.submit": "Enviar"}

// ❌ Wrong
{"botones.enviar": "Enviar"}
```

### 3. Handle Pluralization

Use `_plural` suffix for plural forms:

```json
{
  "achievement.unlocked": "Achievement unlocked",
  "achievement.unlocked_plural": "{count} achievements unlocked"
}
```

### 4. Preserve Interpolation Variables

Keep `{{variable}}` placeholders exactly as-is:

```json
{
  "score.points": "Score: {{points}}"
}
```

### 5. Validate Before Committing

Always run validation before creating a PR:

```bash
npm run i18n:check
```

---

## Troubleshooting

### Validation Fails After Adding Key

1. Identify which locale is missing the key
2. Add the key to that locale's file
3. Run `npm run i18n:validate` again

### Types Not Updating

1. Run `npm run i18n:generate-types`
2. Restart your IDE/TypeScript server
3. Check `core/i18n/types/index.ts` was generated

### CSV Export Not Working

1. Ensure `scripts/i18n/` directory exists
2. Check Node.js version (requires 18+)
3. Verify all translation files are valid JSON

---

## Related Documentation

- [Translation Guide](./TRANSLATION_GUIDE.md)
- [Adding Languages](./ADDING_LANGUAGES.md)
- [Architecture](./ARCHITECTURE.md)

---

## Scripts Location

All i18n scripts are located in `scripts/i18n/`:

```
scripts/i18n/
├── validate-translations.js   # Main validation script
├── generate-types.js          # Type generation script
├── export-csv.js              # CSV export script
├── scan-hardcoded.js          # Hardcoded string scanner (planned)
└── reports/                   # Generated CSV reports
```
