# AI.md

This file provides comprehensive guidance to AI coding assistants (GitHub Copilot, Claude, Kiro, Cursor, and other AI models) when working with the KanaDojo codebase. Follow these guidelines to effectively understand the structure, conventions, and purpose of each directory and function within the repository.

---

## ⚠️ IMPORTANT: Command Execution for AI Agents

**When executing shell commands, ALWAYS prefix them with `cmd /c`.**

Running commands directly doesn't work properly for AI agents on this Windows system. Always use:

```bash
cmd /c <your-command>
```

**Examples:**

```bash
cmd /c npm run lint
cmd /c npm run build
cmd /c npm run test
```

---

## ⚠️ IMPORTANT: Git Commit Requirement

**After completing any code changes, you MUST PROVIDE (not execute) a combined `git add` and `git commit` command with a descriptive conventional commit message.**

⛔ **DO NOT RUN the git command yourself.** Only provide the command at the end of your response so the user can run it manually.

Always provide this command at the end of your response using multiple `-m` flags for multiline messages:

```bash
git add -A && git commit -m "<type>(<scope>): <description>" -m "<body line 1>" -m "<body line 2>"
```

**Conventional Commit Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependencies, configs

**Example (provide this, do not execute):**

```bash
git add -A && git commit -m "feat(kana): add dakuon character support" -m "Added new dakuon characters to hiragana set" -m "Updated KanaCards component to display dakuon" -m "Added translations for new character names"
```

---

## ⚠️ CRITICAL: Code Verification

**NEVER run `npm run build` for code verification. It is slow (1-2 minutes) and unnecessary.**

### ✅ Use Fast Verification Instead

**Always use `npm run check` for verification** (~10-30 seconds):

```bash
cmd /c "npm run check"    # TypeScript + ESLint combined
```

**Or run separately:**

```bash
cmd /c "npx tsc --noEmit"  # TypeScript type checking only
cmd /c "npm run lint"      # ESLint code quality checks
```

### When to Use Each Command

- ✅ **`npm run check`** - Use for all code verification during development
- ✅ **`npm run lint`** - Quick ESLint-only checks
- ✅ **`npx tsc --noEmit`** - Quick type checking only
- ❌ **`npm run build`** - ONLY for final pre-deployment validation or testing actual production bundle

**The full build is unnecessary because:**

1. TypeScript already validates all types during `tsc --noEmit`
2. ESLint catches code quality issues, unused variables, etc.
3. Build adds 1-2 minutes of static page generation with no additional validation

---

## Project Overview

**KanaDojo** is a modern Japanese learning platform built with Next.js 15, React 19, and TypeScript. It provides an aesthetic, minimalist, and highly customizable environment for mastering Hiragana, Katakana, Kanji, and Vocabulary through gamified training modes.

### Key Characteristics

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand with localStorage persistence
- **Internationalization**: next-intl with namespace-based translations
- **Architecture**: Feature-based modular architecture

### Live Application

- **Production URL**: https://kanadojo.com
- **Repository**: https://github.com/lingdojo/kanadojo

---

## Development Commands

### Core Commands

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run check        # TypeScript check + ESLint with pretty formatting
npm run format       # Format code with Prettier
npm run format:check # Check formatting without changes
```

### Testing Commands

```bash
npm run test         # Run tests once with Vitest
npm run test:watch   # Run tests in watch mode
```

### i18n Commands

```bash
npm run i18n:validate      # Verify translation keys match across languages
npm run i18n:generate-types # Generate TypeScript autocomplete for translations
npm run i18n:check         # Run both validation and type generation
```

### Utility Commands

```bash
npm run postbuild           # Generate sitemap (runs automatically after build)
npm run generate:constants  # Generate constants from data files
```

---

## Architecture Overview

KanaDojo follows a **feature-based architecture** that organizes code by functionality rather than by file type. This modular approach improves maintainability, scalability, and developer experience.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                     app/ (Next.js)                      │
│              Pages, Layouts, Routing                    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  features/ (Modules)                    │
│    Self-contained and independent functionalities       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 shared/ (Shared)                        │
│      Reusable components, hooks, utilities              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              core/ (Infrastructure)                     │
│         i18n, Analytics, Base Configuration             │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
kanadojo/
├── app/                    # Next.js App Router (pages, layouts, routing)
│   └── [locale]/           # Internationalized routes
├── features/               # Feature-based modules (self-contained)
│   ├── Academy/            # Educational content
│   ├── Achievements/       # Achievement system
│   ├── Cloze/              # Cloze test feature
│   ├── CrazyMode/          # Special game mode
│   ├── Kana/               # Kana learning (Hiragana/Katakana)
│   ├── Kanji/              # Kanji learning (JLPT levels)
│   ├── Legal/              # Legal pages (Terms, Privacy, Security)
│   ├── MainMenu/           # Main menu and decorations
│   ├── PatchNotes/         # Version history and updates
│   ├── Preferences/        # User preferences and themes
│   ├── Progress/           # Statistics and progress tracking
│   └── Vocabulary/         # Vocabulary learning
├── shared/                 # Shared resources across features
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── store/              # Shared state stores
│   └── types/              # TypeScript type definitions
├── core/                   # Fundamental infrastructure
│   ├── analytics/          # Analytics providers (GA, MS Clarity)
│   └── i18n/               # Internationalization (next-intl)
├── public/                 # Static assets
│   ├── kanji/              # Kanji JSON data files
│   ├── sounds/             # Audio files (click, correct, error)
│   ├── vocab/              # Vocabulary JSON data files
│   └── wallpapers/         # Background images
├── scripts/                # Build and utility scripts
│   └── i18n/               # Translation validation scripts
└── docs/                   # Documentation
```

---

## Feature Module Structure

Each feature is a self-contained module with its own components, data, logic, and state management.

### Anatomy of a Feature

```
features/[feature-name]/
├── components/         # Feature-specific React components
├── data/               # Static data and constants
├── lib/                # Feature-specific utilities
├── hooks/              # Feature-specific custom hooks
├── services/           # API calls and external services
├── store/              # Zustand state management
└── index.ts            # Barrel export (public API)
```

### Feature Rules

1. **Self-containment**: Each feature contains everything it needs to function
2. **Public API**: Only expose necessary items through `index.ts` barrel exports
3. **Import restrictions**: Features can import from `shared/`, `core/`, and other features (carefully)
4. **No circular dependencies**: Avoid circular imports between features

### Current Features

| Feature        | Purpose                          | Key Components                      |
| -------------- | -------------------------------- | ----------------------------------- |
| `Kana`         | Hiragana/Katakana training       | KanaCards, SubsetDictionary, Game   |
| `Kanji`        | Kanji learning by JLPT level     | KanjiCards, KanjiGame               |
| `Vocabulary`   | Vocabulary training              | VocabCards, VocabGame               |
| `Progress`     | Statistics and progress tracking | ProgressWithSidebar, SimpleProgress |
| `Achievements` | Achievement system               | AchievementProgress, badges         |
| `Preferences`  | Themes, fonts, settings          | Settings panel, theme selector      |
| `Academy`      | Educational content              | Learning materials                  |
| `MainMenu`     | Home page and navigation         | Banner, Decorations                 |
| `CrazyMode`    | Special challenge mode           | Crazy mode hooks and state          |
| `PatchNotes`   | Version history                  | Patch notes display                 |
| `Legal`        | Legal pages                      | Terms, Privacy, Security            |
| `Cloze`        | Fill-in-the-blank tests          | Cloze data                          |

---

## Routing Structure

KanaDojo uses Next.js App Router with internationalized routes.

### Main Routes

```
/                           # Home page (main menu)
/kana                       # Kana selection menu
/kana/train/[gameMode]      # Kana training (pick, reverse-pick, input, reverse-input)
/kana/blitz                 # Kana blitz mode
/kana/[subset]              # Kana subset dictionary
/kanji                      # Kanji selection menu
/kanji/train/[gameMode]     # Kanji training
/kanji/blitz                # Kanji blitz mode
/vocabulary                 # Vocabulary selection menu
/vocabulary/train/[gameMode] # Vocabulary training
/vocabulary/blitz           # Vocabulary blitz mode
/achievements               # Achievements page
/progress                   # Progress tracking
/preferences                # User settings
/patch-notes                # Version history
/terms                      # Terms of service
/privacy                    # Privacy policy
/security                   # Security information
```

### Game Modes

Each content type (Kana, Kanji, Vocabulary) supports four training modes:

1. **Pick** - Multiple choice: Select the correct romanization/translation
2. **Reverse-Pick** - Reverse multiple choice: Select the correct character
3. **Input** - Text input: Type the correct romanization/translation
4. **Reverse-Input** - Reverse text input: Type the correct character

---

## State Management

KanaDojo uses Zustand for state management with localStorage persistence.

### Store Patterns

```typescript
// Standard store pattern with persistence
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FeatureState {
  // State properties
  data: SomeType[];

  // Actions
  setData: (data: SomeType[]) => void;
  reset: () => void;
}

const useFeatureStore = create<FeatureState>()(
  persist(
    set => ({
      data: [],
      setData: data => set({ data }),
      reset: () => set({ data: [] })
    }),
    {
      name: 'feature-storage' // localStorage key
    }
  )
);

export default useFeatureStore;
```

### Main Stores

| Store                 | Location                       | localStorage Key     | Purpose                    |
| --------------------- | ------------------------------ | -------------------- | -------------------------- |
| `useKanaStore`        | `features/Kana/store/`         | N/A (session only)   | Kana selection state       |
| `useKanjiStore`       | `features/Kanji/store/`        | N/A (session only)   | Kanji selection state      |
| `useVocabStore`       | `features/Vocabulary/store/`   | N/A (session only)   | Vocabulary selection state |
| `useStatsStore`       | `features/Progress/store/`     | `kanadojo-stats`     | Statistics and progress    |
| `usePreferencesStore` | `features/Preferences/store/`  | `theme-storage`      | User preferences           |
| `useAchievementStore` | `features/Achievements/store/` | Achievement tracking |
| `useOnboardingStore`  | `shared/store/`                | Onboarding state     |

---

## Styling & UI

### Technology Stack

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible component library (in `shared/components/ui/`)
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Icon library
- **FontAwesome**: Additional icons

### Styling Utilities

```typescript
// Use cn() for conditional class merging
import { cn } from '@/shared/lib/utils';

<div
  className={cn(
    'base-classes',
    condition && 'conditional-classes',
    variant === 'primary' && 'primary-classes'
  )}
/>;
```

### Theme System

- 100+ built-in themes (light and dark modes)
- 28 Japanese fonts
- Custom theme support
- Theme persistence in localStorage

---

## Internationalization (i18n)

KanaDojo uses `next-intl` for internationalization with namespace-based translations.

### Supported Languages

- English (en) - Reference language
- Spanish (es)
- Japanese (ja)

### Translation Structure

```
core/i18n/locales/
├── en/                 # English translations
│   ├── common.json     # Buttons, messages, UI elements
│   ├── navigation.json # Menu, breadcrumbs, footer
│   ├── kana.json       # Kana feature translations
│   ├── kanji.json      # Kanji feature translations
│   ├── vocabulary.json # Vocabulary translations
│   ├── achievements.json
│   ├── statistics.json
│   ├── settings.json
│   └── errors.json
├── es/                 # Spanish (same structure)
└── ja/                 # Japanese (same structure)
```

### Usage in Components

```typescript
// Server Components
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('common');
  return <h1>{t('title')}</h1>;
}

// Client Components
('use client');
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('common');
  return <button>{t('buttons.submit')}</button>;
}
```

---

## Audio System

KanaDojo includes a custom audio system for feedback sounds.

### Audio Hooks

```typescript
import {
  useClick,
  useCorrect,
  useError,
  useLong
} from '@/shared/hooks/useAudio';

function Component() {
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError, playErrorTwice } = useError();
  const { playLong } = useLong();

  // Use in event handlers
  const handleClick = () => {
    playClick();
    // ... other logic
  };
}
```

### Audio Files Location

```
public/sounds/
├── click/          # Click sound variations
├── correct.wav     # Correct answer sound
├── error/          # Error sound variations
└── long.wav        # Long feedback sound
```

---

## TypeScript Configuration

### Path Aliases

```json
{
  "paths": {
    "@/*": ["./*"],
    "@/features/*": ["./features/*"],
    "@/shared/*": ["./shared/*"],
    "@/core/*": ["./core/*"]
  }
}
```

### Import Examples

```typescript
// ✅ Correct - Use path aliases
import { KanaCards } from '@/features/Kana';
import { AudioButton } from '@/shared/components';
import { useTranslations } from '@/core/i18n';

// ❌ Avoid - Relative imports across modules
import { KanaCards } from '../../../features/Kana/components/KanaCards';
```

---

## Testing

KanaDojo uses Vitest for testing with jsdom environment.

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.test.ts', '**/*.test.tsx']
  }
});
```

### Test Location

Tests are co-located with their source files:

```
features/Progress/
├── __tests__/
│   └── progressUtils.test.ts
├── components/
├── lib/
└── store/
```

### Running Tests

```bash
npm run test         # Single run
npm run test:watch   # Watch mode
```

---

## Code Conventions

### File Naming

- **Components**: PascalCase (`KanaCards.tsx`, `AudioButton.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAudio.ts`, `useStats.tsx`)
- **Stores**: camelCase with `use` prefix and `Store` suffix (`useKanaStore.ts`)
- **Utilities**: camelCase (`utils.ts`, `helperFunctions.ts`)
- **Types**: camelCase or PascalCase (`interfaces.ts`, `types.ts`)

### Component Structure

```typescript
'use client'; // Only if needed

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import useFeatureStore from '../store/useFeatureStore';

interface ComponentProps {
  // Props interface
}

export default function Component({ prop }: ComponentProps) {
  const t = useTranslations('namespace');
  const { data, setData } = useFeatureStore();

  // Component logic

  return (
    // JSX
  );
}
```

### Export Patterns

```typescript
// Feature barrel export (index.ts)
export { default as ComponentName } from './components/ComponentName';
export { default as useFeatureStore } from './store/useFeatureStore';
export * from './data/constants';
export type { TypeName } from './types';
```

---

## Data Flow

### User Interaction Flow

1. User selects content in menu components
2. Selections stored in feature-specific Zustand stores
3. Training components read from stores to generate questions
4. Game provides immediate feedback (visual + audio)
5. Stats tracked in `useStatsStore` and persisted
6. Achievements checked and unlocked based on progress

### Content Data Organization

- **Kana**: Organized by type (hiragana/katakana) and groups (base, dakuon, yoon, foreign)
- **Kanji**: Organized by JLPT level (N5, N4, N3, N2, N1) with readings and meanings
- **Vocabulary**: Organized by JLPT level and word class (nouns, verbs, adjectives, adverbs)

---

## Performance Optimizations

### Build Optimizations

- Turbopack for faster development builds
- Optimized package imports for common libraries
- Webpack build workers enabled
- Image optimization with AVIF and WebP formats

### Runtime Optimizations

- Audio caching at module level
- Zustand partial persistence (only persist necessary state)
- React Server Components by default
- Static asset caching headers

---

## Common Tasks

### Adding a New Feature

1. Create feature directory: `features/NewFeature/`
2. Add subdirectories as needed: `components/`, `store/`, `data/`, `lib/`
3. Create barrel export: `features/NewFeature/index.ts`
4. Add route in `app/[locale]/new-feature/page.tsx`

### Adding a New Translation

1. Add key to all language files in `core/i18n/locales/[lang]/[namespace].json`
2. Run `npm run i18n:validate` to verify consistency
3. Use in component with `useTranslations('namespace')`

### Adding a New Theme

1. Add theme definition in `features/Preferences/data/themes.ts`
2. Follow existing theme structure with color variables

### Adding a New Sound

1. Add audio file to `public/sounds/`
2. Create or update hook in `shared/hooks/useAudio.ts`
3. Use the hook in components

---

## Important Notes for AI Assistants

### Do's

- ✅ Use TypeScript with proper type definitions
- ✅ Follow the feature-based architecture
- ✅ Use path aliases for imports (`@/features/`, `@/shared/`, `@/core/`)
- ✅ Use barrel exports for feature public APIs
- ✅ Use `cn()` utility for conditional class names
- ✅ Implement responsive design with Tailwind
- ✅ Add translations for user-facing text
- ✅ Use Zustand for state management
- ✅ Keep components focused and reusable

### Don'ts

- ❌ Don't place business logic in `app/` pages
- ❌ Don't create circular dependencies between features
- ❌ Don't use relative imports across module boundaries
- ❌ Don't add code to `shared/` unless used by 2+ features
- ❌ Don't modify `core/` unless absolutely necessary
- ❌ Don't hardcode user-facing strings (use translations)
- ❌ Don't ignore TypeScript errors

### When Making Changes

1. Understand the feature-based architecture before modifying
2. Check existing patterns in similar features
3. Run `npm run lint` and `npm run check` before committing
4. Update translations if adding user-facing text
5. Test all four game modes if modifying game logic
6. Preserve localStorage keys to maintain user data

---

## Resources

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Translation Guide](./docs/TRANSLATION_GUIDE.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)
- [UI Design Philosophy](./docs/UI_DESIGN.md)

---

**Last Updated**: December 2024
**Version**: 0.1.8
