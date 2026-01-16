# AI Assistant Guide

This file provides comprehensive guidance for AI coding assistants (GitHub Copilot, Claude, Kiro, Cursor, and other AI models) when working with the KanaDojo codebase.

---

## Quick Reference

| Task | Command |
|------|---------|
| **Verify code** | `npm run check` |
| **Run tests** | `npm run test` |
| **Lint only** | `npm run lint` |
| **Type check only** | `npx tsc --noEmit` |
| **Validate i18n** | `npm run i18n:check` |

**Never use `npm run build` for verification** — it takes 1-2 minutes and adds no validation value.

---

## Shell Environment

**Windows PowerShell**: Use `;` to chain commands (not `&&`)
**Linux/macOS/WSL**: Use `&&` to chain commands

```bash
# Windows PowerShell
npm run lint; npm run test

# Linux/macOS/WSL
npm run lint && npm run test
```

---

## Project Overview

**KanaDojo** is a Japanese learning platform built with Next.js 15, React 19, and TypeScript. It provides gamified training for Hiragana, Katakana, Kanji, and Vocabulary.

| Aspect | Technology |
|--------|------------|
| Framework | Next.js 15 with App Router and Turbopack |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand with localStorage persistence |
| i18n | next-intl (namespace-based) |
| Testing | Vitest with jsdom |

**URLs**: [kanadojo.com](https://kanadojo.com) · [GitHub](https://github.com/lingdojo/kanadojo)

---

## Code Verification

### Primary Command

Always use `npm run check` for verification (~10-30 seconds):

```bash
npm run check    # TypeScript + ESLint combined
```

### Individual Commands

```bash
npm run lint              # ESLint only
npm run lint:fix          # Auto-fix ESLint issues
npx tsc --noEmit          # TypeScript type checking only
npm run format            # Prettier formatting
npm run format:check      # Check formatting
npm run test              # Run all tests (Vitest)
npm run test:watch        # Watch mode
npm run i18n:check        # Validate translations + generate types
```

### Running Specific Tests

```bash
# Single test file
npx vitest run features/Progress/__tests__/progressUtils.test.ts

# Tests matching pattern
npx vitest run --reporter=verbose "**/*.test.ts"
```

---

## Architecture

KanaDojo uses a **feature-based architecture** organized by functionality.

### Layer Structure

```
app/           → Pages, layouts, routing (Next.js App Router)
    ↓
features/      → Self-contained modules (Kana, Kanji, Vocabulary, etc.)
    ↓
shared/        → Reusable components, hooks, utilities
    ↓
core/          → Infrastructure (i18n, analytics)
```

### Directory Structure

```
kanadojo/
├── app/[locale]/           # Internationalized routes
├── features/               # Feature modules
│   ├── Kana/               # Hiragana/Katakana training
│   ├── Kanji/              # Kanji learning (JLPT levels)
│   ├── Vocabulary/         # Vocabulary training
│   ├── Progress/           # Statistics tracking
│   ├── Achievements/       # Achievement system
│   ├── Preferences/        # Themes, fonts, settings
│   └── ...
├── shared/                 # Shared resources
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript types
├── core/                   # Infrastructure
│   ├── i18n/               # Internationalization
│   └── analytics/          # Analytics providers
└── public/                 # Static assets
```

### Feature Module Structure

```
features/[name]/
├── components/        # React components (.tsx)
├── data/              # Static data and constants
├── lib/               # Feature utilities
├── hooks/             # Custom React hooks
├── store/             # Zustand stores
├── facade/            # Public API hooks
├── __tests__/         # Test files
└── index.ts           # Barrel export (public API)
```

---

## Code Style

### Imports

- **Path aliases**: Always use `@/features/`, `@/shared/`, `@/core/`
- **Never**: Use relative imports across module boundaries

```typescript
// ✅ Correct
import { KanaCards } from '@/features/Kana';
import { cn } from '@/shared/lib/utils';

// ❌ Wrong
import { KanaCards } from '../../../features/Kana/components/KanaCards';
```

### TypeScript

- **Strict mode**: Enabled — never ignore TypeScript errors
- **Interfaces**: Use `interface` for public APIs, `type` for unions/utilities
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Hooks/Stores**: Prefix with `use` (e.g., `useKanaStore`, `useAudio`)

### React Patterns

- **Components**: Functional components with explicit props interfaces
- **State**: Zustand stores with localStorage persistence
- **Memoization**: Use `useMemo` for expensive calculations

### Styling

- **Framework**: Tailwind CSS + shadcn/ui
- **Utility**: Always use `cn()` for conditional classes
- **Variables**: Use CSS variables for theme colors

```typescript
import { cn } from '@/shared/lib/utils';

<div className={cn(
  'base-classes',
  condition && 'conditional-classes'
)} />
```

---

## State Management

Zustand with localStorage persistence:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
  data: string[];
  setData: (data: string[]) => void;
}

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      data: [],
      setData: (data) => set({ data }),
    }),
    { name: 'store-key' }
  )
);
```

### Main Stores

| Store | Location | Purpose |
|-------|----------|---------|
| `useKanaStore` | `features/Kana/store/` | Kana selection |
| `useKanjiStore` | `features/Kanji/store/` | Kanji selection |
| `useVocabStore` | `features/Vocabulary/store/` | Vocabulary selection |
| `useStatsStore` | `features/Progress/store/` | Statistics (persisted) |
| `usePreferencesStore` | `features/Preferences/store/` | User preferences (persisted) |

---

## Internationalization

**Framework**: next-intl with namespace-based translations

```
core/i18n/locales/
├── en/              # English (reference)
├── es/              # Spanish
└── ja/              # Japanese
```

**Usage**:
```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('common');
  return <button>{t('buttons.submit')}</button>;
}
```

**Validation**: Run `npm run i18n:check` before commits.

---

## Git Commits

Use conventional commit format:

```bash
git add -A && git commit -m "<type>(<scope>): <description>"
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Example**:
```bash
git add -A && git commit -m "feat(kana): add dakuon character support"
```

---

## Architecture Rules

### Layer Enforcement (ESLint)

- **shared/**: Cannot import from `features/` internal directories
- **features/**: Cannot import from other features' internal directories
- **Cross-feature**: Use barrel exports (`index.ts`) for communication

### Dependency Rules

- **Circular deps**: Forbidden between features
- **Business logic**: Keep in `features/`, not `app/` pages
- **Shared code**: Only in `shared/` if used by 2+ features

---

## Do's and Don'ts

### ✅ Do

- Use TypeScript with proper type definitions
- Follow the feature-based architecture
- Use path aliases for imports
- Use `cn()` for conditional class names
- Add translations for user-facing text
- Run `npm run check` before committing

### ❌ Don't

- Place business logic in `app/` pages
- Create circular dependencies between features
- Add to `shared/` unless used by 2+ features
- Hardcode user-facing strings
- Ignore TypeScript errors
- Use `console.log` (only `warn`/`error` allowed)
- Use `npm run build` for verification

---

## Common Tasks

### Adding a New Feature

1. Create directory: `features/NewFeature/`
2. Add subdirectories: `components/`, `store/`, `data/`, `lib/`
3. Create barrel export: `features/NewFeature/index.ts`
4. Add route: `app/[locale]/new-feature/page.tsx`

### Adding a Translation

1. Add key to all language files in `core/i18n/locales/[lang]/`
2. Run `npm run i18n:validate`
3. Use with `useTranslations('namespace')`

### Adding a Theme

1. Add definition in `features/Preferences/data/themes.ts`
2. Follow existing theme structure

---

## Resources

- [Architecture](./docs/ARCHITECTURE.md)
- [UI Design](./docs/UI_DESIGN.md)
- [Translation Guide](./docs/TRANSLATION_GUIDE.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)
- [Contributing](./CONTRIBUTING.md)

---

**Last Updated**: January 2025
