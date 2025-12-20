---
description: how to add a new feature to the codebase
---

When adding a new feature, follow the feature-based architecture from AGENTS.md:

## Feature Module Structure

1. **Create the feature directory:**

   ```
   features/NewFeature/
   ├── components/         # Feature-specific React components
   ├── data/               # Static data and constants
   ├── lib/                # Feature-specific utilities
   ├── hooks/              # Feature-specific custom hooks
   ├── store/              # Zustand state management
   └── index.ts            # Barrel export (public API)
   ```

2. **Follow these rules:**
   - Each feature is self-contained with everything it needs
   - Only expose necessary items through `index.ts` barrel exports
   - Import from `shared/`, `core/`, and other features (carefully)
   - Avoid circular dependencies between features

3. **Use path aliases for imports:**

   ```typescript
   import { Component } from '@/features/FeatureName';
   import { useHook } from '@/shared/hooks';
   import { utility } from '@/shared/lib/utils';
   ```

4. **Add route in app directory:**
   - Create `app/[locale]/new-feature/page.tsx`

5. **If adding user-facing text:**
   - Add translations to all languages in `core/i18n/locales/[lang]/`
   - Run `cmd /c npm run i18n:validate` to verify

6. **Before finishing:**
   // turbo
   - Run `cmd /c npm run check` to verify TypeScript and ESLint pass
