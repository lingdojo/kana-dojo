# AI Assistant Guide

This file provides comprehensive guidance for AI coding assistants (GitHub Copilot, Claude, Kiro, Cursor, and other AI models) when working with the KanaDojo codebase.

---

<!--
## Quick Reference (temporarily commented out)
| Task         | Command          |
| ------------ | ---------------- |
| Verify code  | `npm run check`  |
| Run tests    | `npm run test`   |
| Lint only    | `npm run lint`   |
-->

**Never use `npm run build` for verification** — it takes 1-2 minutes and adds no validation value.

---

## Shell Environment

**Windows PowerShell**: use `;` — **Linux/macOS/WSL**: use `&&`.

<!-- examples commented out: `npm run lint; npm run test` -->

---

## Project Overview

**KanaDojo** is a Japanese learning platform built with Next.js 15, React 19, and TypeScript. It provides gamified training for Hiragana, Katakana, Kanji, and Vocabulary.

| Aspect    | Technology                               |
| --------- | ---------------------------------------- |
| Framework | Next.js 15 with App Router and Turbopack |
| Language  | TypeScript (strict mode)                 |
| Styling   | Tailwind CSS + shadcn/ui                 |
| State     | Zustand with localStorage persistence    |
| i18n      | next-intl (namespace-based)              |
| Testing   | Vitest with jsdom                        |

**URLs**: [kanadojo.com](https://kanadojo.com) · [GitHub](https://github.com/lingdojo/kanadojo)

---

## Verification (compact)

- Recommended: keep types and linting green locally before major PRs.

<!--
Primary verification commands (commented out here):
- `npm run check`  # TypeScript + ESLint
- `npm run test`   # Vitest
- `npm run lint`
-->

Use specific test commands when needed (examples are in repo docs).

---

## Architecture — feature-based (short)

KanaDojo is organized by feature: app/, features/, shared/, core/. Keep business logic inside features and avoid cross-feature internal imports.

---

---

## Code style & state — quick rules

- Imports: use path aliases (`@/...`), avoid cross-feature relative imports.
- TypeScript: strict mode; fix errors; prefer `interface` for public APIs.
- Components: functional + explicit props; hooks/stores start with `use`.
- Styling: Tailwind + `cn()` for conditional classes.
- State: Zustand (persisted) for feature stores.

---

## i18n, commits & rules (compact)

- i18n: `next-intl` (namespace-based). <!-- `npm run i18n:check` instructions omitted here -->
- Git: use conventional commits `type(scope): desc` (example in repo).

### Rules summary

- Keep logic in `features/`. No cross-feature internals.
- Avoid circular deps. Use path aliases.

### Do's / Don'ts (short)

- ✅ Use TypeScript types, path aliases, and translations.
- ❌ Don’t add business logic to `app/` or create circular deps.

### Common tasks

- New feature: create `features/NewFeature/` + `components/`, `store/`, `data/`, `lib/` and route.
- Add translations: update `core/i18n/locales/*` and validate via repo scripts when needed.

---

**Last Updated**: 2026-02-15
