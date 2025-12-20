---
description: how to add or update translations
---

When adding or updating translations, follow these guidelines from AGENTS.md:

## Translation Rules

1. **Supported languages:** English (en), Spanish (es), Japanese (ja)

2. **Translation file location:**

   ```
   core/i18n/locales/
   ├── en/                 # English (reference language)
   │   ├── common.json     # Buttons, messages, UI elements
   │   ├── navigation.json # Menu, breadcrumbs, footer
   │   ├── kana.json       # Kana feature
   │   ├── kanji.json      # Kanji feature
   │   ├── vocabulary.json # Vocabulary feature
   │   └── ...
   ├── es/                 # Spanish (same structure)
   └── ja/                 # Japanese (same structure)
   ```

3. **Add keys to ALL language files** - keys must match across all languages

4. **Usage in components:**

   ```typescript
   // Server Components
   import { getTranslations } from 'next-intl/server';
   const t = await getTranslations('common');

   // Client Components
   ('use client');
   import { useTranslations } from 'next-intl';
   const t = useTranslations('common');

   // Access nested keys
   {
     t('buttons.submit');
   }
   ```

5. **After adding translations:**
   // turbo
   - Run `cmd /c npm run i18n:validate` to verify keys match across languages
     // turbo
   - Run `cmd /c npm run i18n:generate-types` to update TypeScript types
