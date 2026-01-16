# Documentation Reorganization Plan

## Executive Summary

The current README.md is 657 lines and contains extensive duplicate content that already exists in dedicated documentation files. This plan outlines how to trim the README to ~120 lines and properly organize all documentation.

---

## Current State Analysis

### README.md Problems
| Section | Lines | Issue |
|---------|-------|-------|
| Language translations list | 20 | Keep (but simplify) |
| About KanaDojo | 90 | Too verbose, trim to essentials |
| Screenshots | 20 | Keep |
| UI & Design Philosophy | 30 | **DUPLICATE** - Already in `docs/UI_DESIGN.md` |
| Tech Stack | 40 | **DUPLICATE** - Already in `docs/ARCHITECTURE.md` |
| Architecture | 15 | **DUPLICATE** - Already in `docs/ARCHITECTURE.md` |
| Getting Started | 150 | **EXCESSIVE** - Move to `CONTRIBUTING.md` or separate doc |
| Project Structure | 100 | **DUPLICATE** - Already in `docs/ARCHITECTURE.md` |
| Contributing (translation section) | 120 | **DUPLICATE** - Already in `docs/TRANSLATION_GUIDE.md` |
| License/Contact | 30 | Keep |

**Total duplicated/excessive content: ~455 lines (69%)**

### Current Documentation Files

**Root level (keep):**
- `README.md` - Project introduction (needs trimming)
- `CONTRIBUTING.md` - How to contribute (well structured)
- `SECURITY.md` - Security policy (fine as-is)
- `CODE_OF_CONDUCT.md` - Code of conduct (fine as-is)
- `LICENSE.md` - License (required)
- `CLAUDE.md` - AI assistant instructions (internal tooling)

**docs/ folder (current):**
- `ARCHITECTURE.md` ✅ Comprehensive, keep
- `UI_DESIGN.md` ✅ Comprehensive, keep
- `TRANSLATION_GUIDE.md` ✅ Comprehensive, keep
- `ADDING_LANGUAGES.md` ✅ Good, keep (SEO-focused complement to TRANSLATION_GUIDE)
- `TROUBLESHOOTING.md` ✅ Comprehensive, keep
- `ACHIEVEMENTS.md` ✅ Good, keep
- `SEO.md` ✅ Comprehensive, keep
- `PERFORMANCE_OPTIMIZATIONS.md` ✅ Good, keep
- `AUDIO_OPTIMIZATION.md` ✅ Keep
- `FACADE_ARCHITECTURE_COMPARISON.md` → Archive (historical)
- `MIGRATION_SUMMARY.md` → Archive (completed migration)

**docs/archived/ folder:**
- `ARCHITECTURE_DIAGRAM.md` ✅ Good to keep archived
- `HYBRID_MODULAR_MIGRATION_PLAN.md` ✅ Good to keep archived
- `MIGRATION_QUICK_REFERENCE.md` ✅ Good to keep archived

**docs/translations/:**
- All README translations ✅ Keep as-is

---

## Proposed Changes

### 1. New README.md Structure (~120 lines)

```markdown
# KanaDojo かな道場

[Banner image]
[Badges]

**An aesthetic, minimalist and highly customizable platform for mastering Japanese inspired by Monkeytype**

[Live Demo](https://kanadojo.com) | [Documentation](./docs/) | [Contributing](./CONTRIBUTING.md)

## About

KanaDojo is a web-based Japanese learning platform for mastering Hiragana, Katakana, Kanji, and Vocabulary through gamified training.

## Key Features

- **Three Dojos** - Kana, Kanji (JLPT N5-N2), and Vocabulary training
- **Four Game Modes** - Pick, Reverse-Pick, Input, Reverse-Input
- **100+ Themes** - Light and dark themes with 28 Japanese fonts
- **Progress Tracking** - Statistics, streaks, and achievements
- **Fully Responsive** - Works on desktop, tablet, and mobile

## Quick Start

\`\`\`bash
git clone https://github.com/lingdojo/kanadojo.git
cd kanadojo
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

> Having issues? See [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)

## Screenshots

[Screenshots section - keep existing images]

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | Project structure and patterns |
| [UI Design](./docs/UI_DESIGN.md) | Theming, styling, and component guidelines |
| [Translation Guide](./docs/TRANSLATION_GUIDE.md) | How to add translations |
| [Troubleshooting](./docs/TROUBLESHOOTING.md) | Common issues and solutions |
| [Contributing](./CONTRIBUTING.md) | How to contribute |

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · Zustand

> See [Architecture docs](./docs/ARCHITECTURE.md) for full details

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

## License

AGPL 3.0 - see [LICENSE.md](./LICENSE.md)

## Links

- **Website**: [kanadojo.com](https://kanadojo.com)
- **Repository**: [github.com/lingdojo/kanadojo](https://github.com/lingdojo/kanadojo)
- **Email**: dev@kanadojo.com
```

### 2. Update CONTRIBUTING.md

Move the detailed "Getting Started" setup instructions from README to CONTRIBUTING.md. Currently CONTRIBUTING.md already has good setup instructions, so we mainly need to:
- Ensure the troubleshooting section links to `docs/TROUBLESHOOTING.md`
- Remove any duplicate content

### 3. Create docs/README.md (Documentation Index)

Create a central index for all documentation:

```markdown
# KanaDojo Documentation

## Getting Started
- [Contributing Guide](../CONTRIBUTING.md) - Setup and contribution workflow
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

## Architecture & Development
- [Architecture](./ARCHITECTURE.md) - Project structure, patterns, and conventions
- [UI Design](./UI_DESIGN.md) - Theming, styling, and component guidelines
- [Performance](./PERFORMANCE_OPTIMIZATIONS.md) - Performance optimization details
- [Audio](./AUDIO_OPTIMIZATION.md) - Audio system documentation

## Features
- [Achievements](./ACHIEVEMENTS.md) - Achievement system documentation
- [SEO](./SEO.md) - SEO implementation guide

## Internationalization
- [Translation Guide](./TRANSLATION_GUIDE.md) - How to translate the app
- [Adding Languages](./ADDING_LANGUAGES.md) - How to add new language support

## Archives
Historical documentation for completed migrations:
- [archived/](./archived/) - Migration plans and historical docs
```

### 4. Archive Completed Migration Docs

Move to `docs/archived/`:
- `MIGRATION_SUMMARY.md` → `docs/archived/MIGRATION_SUMMARY.md`
- `FACADE_ARCHITECTURE_COMPARISON.md` → `docs/archived/FACADE_ARCHITECTURE_COMPARISON.md`

### 5. Files to Delete (Duplicates)

None - all existing docs serve a purpose. The cleanup is about:
1. Trimming README.md
2. Proper linking between docs
3. Creating the docs index

---

## Section-by-Section Migration

### From README.md → Delete (exists elsewhere)

| README Section | Existing Location | Action |
|---------------|-------------------|--------|
| UI & Design Philosophy | `docs/UI_DESIGN.md` | Delete from README, link to doc |
| Tech Stack (detailed) | `docs/ARCHITECTURE.md` | Keep 1-line version, link to doc |
| Architecture | `docs/ARCHITECTURE.md` | Delete from README, link to doc |
| Getting Started (troubleshooting) | `docs/TROUBLESHOOTING.md` | Delete from README, link to doc |
| Project Structure | `docs/ARCHITECTURE.md` | Delete from README, link to doc |
| Key Concepts | `docs/ARCHITECTURE.md` | Delete from README, link to doc |
| Translation Contributions | `docs/TRANSLATION_GUIDE.md` | Delete from README, link to doc |
| i18n System Status | `docs/TRANSLATION_GUIDE.md` | Delete from README |
| Language Expansion for SEO | `docs/ADDING_LANGUAGES.md` | Delete from README |

---

## Final Documentation Structure

```
kana-dojo/
├── README.md                    # ~120 lines, concise project intro
├── CONTRIBUTING.md              # How to contribute (unchanged)
├── SECURITY.md                  # Security policy (unchanged)
├── CODE_OF_CONDUCT.md           # Code of conduct (unchanged)
├── LICENSE.md                   # License (unchanged)
├── CLAUDE.md                    # AI assistant config (unchanged)
│
└── docs/
    ├── README.md                # NEW: Documentation index
    │
    ├── ARCHITECTURE.md          # Project structure & patterns
    ├── UI_DESIGN.md             # Theming & component guidelines
    ├── TROUBLESHOOTING.md       # Common issues & solutions
    │
    ├── TRANSLATION_GUIDE.md     # How to translate
    ├── ADDING_LANGUAGES.md      # SEO-focused language expansion
    │
    ├── ACHIEVEMENTS.md          # Achievement system docs
    ├── SEO.md                    # SEO implementation
    ├── PERFORMANCE_OPTIMIZATIONS.md  # Performance docs
    ├── AUDIO_OPTIMIZATION.md    # Audio system docs
    │
    ├── archived/                # Historical/completed docs
    │   ├── ARCHITECTURE_DIAGRAM.md
    │   ├── HYBRID_MODULAR_MIGRATION_PLAN.md
    │   ├── MIGRATION_QUICK_REFERENCE.md
    │   ├── MIGRATION_SUMMARY.md      # MOVED here
    │   └── FACADE_ARCHITECTURE_COMPARISON.md  # MOVED here
    │
    └── translations/            # README translations
        ├── README.de.md
        ├── README.es.md
        ├── README.fr.md
        └── ... (all others)
```

---

## Implementation Steps

1. **Create `docs/README.md`** - Documentation index
2. **Move archived docs** - `MIGRATION_SUMMARY.md` and `FACADE_ARCHITECTURE_COMPARISON.md`
3. **Rewrite `README.md`** - Trim to ~120 lines with proper links
4. **Update cross-references** - Ensure all docs link to each other properly
5. **Update translated READMEs** - They may need similar trimming (optional, can be separate PR)

---

## Benefits

- **README.md**: 657 lines → ~120 lines (82% reduction)
- **No lost information**: Everything moved to proper docs
- **Better discoverability**: Central docs index
- **Cleaner architecture**: Clear separation of concerns
- **Easier maintenance**: Update docs in one place, not multiple

---

## Questions for Review

1. Should we also trim the translated READMEs in this pass, or handle separately?
2. Should `docs/README.md` be named `docs/INDEX.md` instead?
3. Any sections I've marked for removal that you want to keep in README?
