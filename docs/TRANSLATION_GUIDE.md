# Translation Guide

Welcome to the KanaDojo translation project! This guide will help you contribute translations to make the app accessible to more learners worldwide.

## 📋 Table of Contents

- [Overview](#overview)
- [Translation Structure](#translation-structure)
- [Getting Started](#getting-started)
- [Translation Workflow](#translation-workflow)
- [Naming Conventions](#naming-conventions)
- [Interpolation Variables](#interpolation-variables)
- [Best Practices](#best-practices)
- [Tools & Scripts](#tools--scripts)
- [FAQ](#faq)

---

## Overview

KanaDojo uses **namespace-based JSON files** for translations. Each feature has its own translation file, making it easy to:

- **Work independently**: Multiple translators can work on different files without conflicts
- **Stay organized**: Related translations are grouped together
- **Track changes**: Git shows exactly what changed in each file
- **Validate easily**: Scripts ensure all keys exist across all languages

### Supported Languages

Currently, we support:

- 🇬🇧 **English (en)** - Reference language
- 🇪🇸 **Spanish (es)**
- 🇯🇵 **Japanese (ja)**

We're planning to add: Portuguese, French, German, Italian, Chinese, Korean, Russian, and Arabic.

---

## Translation Structure

All translation files are located in:

```
core/i18n/locales/
├── en/          # English (reference)
│   ├── common.json
│   ├── navigation.json
│   ├── kana.json
│   ├── kanji.json
│   ├── vocabulary.json
│   ├── achievements.json
│   ├── statistics.json
│   ├── settings.json
│   └── errors.json
├── es/          # Spanish
│   └── (same files)
└── ja/          # Japanese
    └── (same files)
```

### Namespaces

| Namespace           | Description                              | Example Keys                                      |
| ------------------- | ---------------------------------------- | ------------------------------------------------- |
| `common.json`       | Reusable UI elements (buttons, messages) | `buttons.submit`, `messages.loading`              |
| `navigation.json`   | Menu, breadcrumbs, footer                | `menu.home`, `footer.privacy`                     |
| `kana.json`         | Hiragana/Katakana learning feature       | `game.score`, `results.accuracy`                  |
| `kanji.json`        | Kanji learning feature                   | `selection.byLevel`, `details.meaning`            |
| `vocabulary.json`   | Vocabulary learning feature              | `categories.verbs`, `game.streak`                 |
| `achievements.json` | Achievement system                       | `unlocked`, `rarity.legendary`                    |
| `statistics.json`   | Progress tracking and stats              | `overview.totalStudyTime`, `charts.dailyActivity` |
| `settings.json`     | App configuration                        | `appearance.theme`, `audio.volume`                |
| `errors.json`       | Error messages                           | `validation.required`, `network.timeout`          |

---

## Getting Started

### Prerequisites

- Basic understanding of JSON format
- Text editor (VS Code recommended)
- Git (for contributing)
- Node.js and npm (for running the validation scripts)

### Edit JSON Files Directly

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-username>/kana-dojo.git
   cd kana-dojo
   ```

2. **Find your language folder**

   Open `core/i18n/locales/es/` for Spanish, for example. Keep your terminal at the
   repository root when running npm commands.

3. **Edit the JSON files**
   - Use any text editor
   - Keep the same structure as English
   - Translate only the **values**, not the **keys**

4. **Validate your translations**

   Run this command from the repository root:

   ```bash
   npm run i18n:validate
   ```

5. **Submit a pull request**

### CSV and Spreadsheet Editing

CSV export and import are not currently available as npm scripts. Use the JSON
editing workflow above to contribute translations. If you need help editing JSON
files, ask for guidance in a GitHub issue.

---

## Translation Workflow

### 1. Choose a File

Start with the file you're most comfortable with. We recommend:

- Beginners: `common.json` (buttons, simple messages)
- Intermediate: `navigation.json`, `errors.json`
- Advanced: Feature-specific files (`kana.json`, `kanji.json`)

### 2. Understand the Structure

JSON files use nested objects. For example:

```json
{
  "buttons": {
    "submit": "Submit",
    "cancel": "Cancel"
  },
  "messages": {
    "loading": "Loading...",
    "success": "Success!"
  }
}
```

**Keys** (left side): Never translate these - they're used in code
**Values** (right side): Translate these to your language

### 3. Translate Values

#### ✅ Correct Example

**English (en/common.json):**

```json
{
  "buttons": {
    "submit": "Submit",
    "cancel": "Cancel"
  }
}
```

**Spanish (es/common.json):**

```json
{
  "buttons": {
    "submit": "Enviar",
    "cancel": "Cancelar"
  }
}
```

#### ❌ Incorrect Example

```json
{
  "botones": {              ← DON'T translate keys!
    "enviar": "Enviar",     ← Keys must match English
    "cancelar": "Cancelar"
  }
}
```

### 4. Handle Special Cases

#### Interpolation Variables

Some translations have **variables** in `{{double braces}}`:

```json
{
  "score": "Score: {{points}}",
  "greeting": "Hello, {{name}}!"
}
```

**Rules:**

- Keep the variable names **exactly** as they are: `{{points}}`, `{{name}}`
- You can change the text around them
- The order can change based on your language's grammar

**Examples:**

English: `"timeLeft": "Time left: {{seconds}} seconds"`
Spanish: `"timeLeft": "Tiempo restante: {{seconds}} segundos"`
Japanese: `"timeLeft": "残り時間：{{seconds}}秒"`

#### Pluralization

If a key has pluralization (like `{{count}}`), consider your language's plural rules:

```json
{
  "itemCount": "{{count}} item",
  "itemCount_plural": "{{count}} items"
}
```

Some languages may need more plural forms - check next-intl documentation.

#### Context-Dependent Translations

Some words change meaning based on context. Look at the **key path**:

```json
{
  "game": {
    "pause": "Pause"    ← Pause a game
  },
  "audio": {
    "pause": "Pause"    ← Pause audio playback
  }
}
```

In some languages, these might be different words!

---

## Naming Conventions

### Key Naming

Keys use **dot notation** to organize translations:

```
namespace.section.component.action
```

Examples:

- `common.buttons.submit` → Common namespace → Buttons section → Submit action
- `kana.game.nextQuestion` → Kana namespace → Game section → Next question
- `settings.appearance.theme` → Settings namespace → Appearance section → Theme

### File Naming

- Use **lowercase** for folder names: `en`, `es`, `ja`
- Use **lowercase + kebab-case** for multi-word languages: `pt-br`, `zh-cn`
- JSON files must have **exact** names: `common.json`, not `Common.json`

---

## Interpolation Variables

### Common Variables

| Variable         | Description      | Example                           |
| ---------------- | ---------------- | --------------------------------- |
| `{{count}}`      | Numeric count    | "You have {{count}} achievements" |
| `{{points}}`     | Score/points     | "Score: {{points}}"               |
| `{{seconds}}`    | Time in seconds  | "Time left: {{seconds}}s"         |
| `{{name}}`       | User/item name   | "Hello, {{name}}!"                |
| `{{date}}`       | Date/timestamp   | "Earned on {{date}}"              |
| `{{percentage}}` | Percentage value | "Accuracy: {{percentage}}%"       |
| `{{current}}`    | Current value    | "Progress: {{current}}/{{total}}" |
| `{{total}}`      | Total value      | "Progress: {{current}}/{{total}}" |

### Rules for Variables

1. **Never translate variable names**

   ```json
   // ✅ Correct
   "greeting": "Hola, {{name}}!"

   // ❌ Wrong
   "greeting": "Hola, {{nombre}}!"
   ```

2. **Keep exact spacing inside braces**

   ```json
   // ✅ Correct
   "score": "{{points}} points"

   // ❌ Wrong (extra spaces)
   "score": "{{ points }} points"
   ```

3. **Adjust word order for your language**

   ```json
   // English: Adjective before noun
   "description": "Your {{count}} correct answers"

   // Spanish: Adjective after noun
   "description": "Tus {{count}} respuestas correctas"
   ```

---

## Best Practices

### Translation Quality

1. **Be consistent**: Use the same terms throughout the app
   - Example: If you translate "submit" as "Enviar", use it everywhere

2. **Match the tone**: KanaDojo is educational and friendly
   - Use polite, encouraging language
   - Avoid overly formal or casual tone

3. **Consider length**: Some languages are longer than English
   - Buttons should be concise
   - Tooltips can be more verbose

4. **Respect cultural context**:
   - Japanese honorifics (です/ます forms)
   - Formal vs informal (Spanish tú/usted)
   - Right-to-left languages (Arabic)

### Technical Guidelines

1. **Preserve special characters**

   ```json
   // ✅ Keep punctuation marks
   "loading": "Loading..."
   "success": "Success!"

   // ✅ Keep HTML entities if present
   "copyright": "&copy; 2024 KanaDojo"
   ```

2. **Don't add extra whitespace**

   ```json
   // ✅ Correct
   "submit": "Enviar"

   // ❌ Wrong (trailing space)
   "submit": "Enviar "
   ```

3. **Use UTF-8 encoding**
   - Saves files in UTF-8 to support all characters
   - VS Code does this by default

4. **Validate JSON syntax**
   - Use a JSON validator or `npm run i18n:validate`
   - Common mistakes: Missing commas, unescaped quotes

---

## Tools & Scripts

Run the following commands from the repository root, which contains `package.json`.

### Validation Script

Check the translation files for the languages and namespaces listed in
`scripts/i18n/validate-translations.js`. The script reports missing files, invalid
JSON, and missing or extra keys compared with English:

```bash
npm run i18n:validate
```

A successful run ends with:

```
✅ All translations are valid!
```

If validation fails, review the reported files and keys before submitting your
translation changes.

### Generate TypeScript Types

Generate translation interfaces and key types from the English namespace files:

```bash
npm run i18n:generate-types
```

This writes `core/i18n/types.d.ts`. Regenerate the types after changing English
translation keys, and review the generated file before committing it.

### Check i18n Configuration

Check that the locales in `core/i18n/routing.ts` and namespaces in
`core/i18n/request.ts` match the lists used by the translation validator:

```bash
npm run i18n:config:check
```

### Run All i18n Checks

Run configuration validation, translation validation, and type generation in that
order:

```bash
npm run i18n:check
```

The command stops if a step fails. If both validation steps pass, the final step
writes `core/i18n/types.d.ts`.

The available npm scripts are listed in [`package.json`](../package.json). CSV
export and hardcoded-string scanning are not currently available as npm scripts.

---

## FAQ

### Q: How do I add a new language?

1. Create a new folder: `core/i18n/locales/pt/` (for Portuguese)
2. Copy all JSON files from `en/` to `pt/`
3. Translate each file
4. Add the language code to `core/i18n/config.ts`
5. Run `npm run i18n:validate`

### Q: What if a translation key is missing?

The validation script will catch it! Run:

```bash
npm run i18n:validate
```

Fix by adding the missing key to your language file.

### Q: Can I use Google Translate for initial translations?

**Initial draft**: Yes, to get started quickly
**Final version**: No, please review and improve machine translations

Machine translations often:

- Miss cultural context
- Use wrong formality levels
- Translate UI terms incorrectly

### Q: How do I handle gendered language (Spanish/French)?

Use the most neutral/inclusive option when possible:

- Spanish: Use "todos/todas" → "todas las personas" or "todo el mundo"
- French: Use inclusive forms when appropriate

If the context requires a specific gender, match the subject.

### Q: What if English has a typo or unclear text?

**Don't translate the typo!** Instead:

1. Open a GitHub issue describing the problem
2. Suggest the correct English text
3. Wait for the fix, then translate the corrected version

### Q: How long does it take?

Approximate time per file:

- `common.json`: 30-45 minutes (54 keys)
- `navigation.json`: 10-15 minutes (19 keys)
- `kana.json`: 45-60 minutes (45 keys)
- `kanji.json`: 60-75 minutes (50 keys)
- `vocabulary.json`: 60-75 minutes (53 keys)
- `achievements.json`: 25-30 minutes (23 keys)
- `statistics.json`: 40-50 minutes (33 keys)
- `settings.json`: 50-60 minutes (42 keys)
- `errors.json`: 25-30 minutes (23 keys)

**Total**: ~6-8 hours for all files (for experienced translators)

---

## Contributing

### Submit Translations

1. **Fork** the repository
2. **Create a branch**: `git checkout -b translations/spanish-updates`
3. **Make changes** to JSON files
4. **Validate**: `npm run i18n:validate`
5. **Commit**: `git commit -m "feat(i18n): Update Spanish translations"`
6. **Push**: `git push origin translations/spanish-updates`
7. **Create Pull Request** on GitHub

### Translation Credits

All translators will be credited in:

- `README.md` Contributors section
- In-app credits page (coming soon)

---

## Need Help?

- **GitHub Issues**: [Report a problem or ask questions](https://github.com/yourusername/kanadojo/issues)
- **Email**: dev@kanadojo.com
- **Discord**: [Join our community](https://discord.gg/kanadojo) _(if available)_

---

Thank you for helping make KanaDojo accessible to learners worldwide! 🌍✨
