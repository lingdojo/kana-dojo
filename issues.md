# Open Issues & Contribution Opportunities for KanaDojo

Welcome! This document tracks solved issues and active contribution opportunities for **KanaDojo**.

Contributor: **Ayush**

---

## Solved Issues

### 1. Hydration & SSR Issues

- [x] **Fix Hydration Mismatch on Body Tag**
  - **Description**: Browser extensions (e.g., Grammarly) inject attributes like `data-new-gr-c-s-check-loaded` into `<body>`, causing Next.js SSR hydration mismatch warnings.
  - **Status**: Fixed in `app/layout.tsx` by adding `suppressHydrationWarning` to `<body>` by **Ayush**.

### 2. Community Theme - Winter Kimono

- [x] **Add Winter Kimono Theme**
  - **Description**: Add a new community theme called "winter-kimono" to `community/content/community-themes.json` with deep indigo background, snowy white main color, and soft pink secondary accent.
  - **Status**: Added in `community/content/community-themes.json` by **Ayush**.
  - **Details**: Theme specifications:
    - `id`: `"winter-kimono"`
    - `backgroundColor`: `oklch(16.0% 0.040 260.0 / 1)` (Deep indigo)
    - `mainColor`: `oklch(88.0% 0.020 240.0 / 1)` (Snow white)
    - `secondaryColor`: `oklch(68.0% 0.110 310.0 / 1)` (Soft pink)
  - **Tests**: Added test coverage for winter-kimono theme in `community/content/community-themes.test.ts` ✅
  - **Related**: Closes #27173

### 3. IME & Input Issues

- [x] **Typing mode Gauntlet and Blitz broken if IME on**
  - **Description**: When using a Japanese IME (Input Method Editor), typing kana in Blitz/Gauntlet modes doesn't accept the input correctly — it insists on romaji.
  - **Status**: Fixed (referenced in GitHub issue #7864)

- [x] **Accept alternative romaji, e.g. "hu" or "fu" for ふ**
  - **Description**: Requests support for Kunrei-shiki and Nihon-shiki romanizations (e.g., "hu" for ふ, "si" for し, "nn" for ん) in addition to the current Hepburn-style romaji.
  - **Status**: Implemented via PR #5963 which added `altRomanji` support

---

## Remaining Issues & Opportunities

### 1. i18n & Localization

- [ ] **Missing Translation Keys Audit**
  - **Description**: Ensure all locale JSON files in `core/i18n/locales/` have full parity across supported languages.
  - **Files**: `core/i18n/locales/*`

### 2. UI & Accessibility (a11y)

- [ ] **Improve Keyboard Navigation on Quiz Screens**
  - **Description**: Enhance focus indicators and ARIA roles across Kana and Kanji practice widgets.
  - **Files**: `features/Kana/`, `features/Kanji/`

### 3. Performance & Audio Optimization

- [ ] **Opus Audio Compression & Preloading**
  - **Description**: Verify sound effect assets are optimized and loaded lazily when entering practice mode.
  - **Files**: `public/sounds/`, `shared/hooks/`

### 4. Documentation & Developer Experience

- [ ] **Expand Contributor Guidelines**
  - **Description**: Maintain up-to-date setup steps and feature architecture overview in `CONTRIBUTING.md`.
  - **Contributor**: **Ayush**

---

## Community Contribution Issues

**Note**: The repository currently has 342+ open issues, mostly consisting of beginner-friendly community contribution opportunities. These are actively being worked on by contributors like `TrivCodez` and `tentoumushii`. Recent activity shows numerous PRs being created and merged, indicating healthy contribution activity.

**Examples of Open Community Issues (as of August 2026):**

- Anime quotes, grammar points, trivia questions, Japanese proverbs, Japan facts, video game quotes, and various themes
- Most are labeled as "good first issue" and require only JSON file edits (no coding required)
- These follow a systematic numbering system and are actively being populated

**Links for Active Contributions:**

- [GitHub Issues](https://github.com/lingdojo/kana-dojo/issues) - All 342+ open issues
- [Community Content Files](https://github.com/lingdojo/kana-dojo/tree/main/community/content) - Where new content is added
