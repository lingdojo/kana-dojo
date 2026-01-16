# Changelog

All notable changes to KanaDojo are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Documentation improvements
- GitHub issue and discussion templates
- Security policy (`.github/SECURITY.md`)
- Contributing guide in `.github/` for GitHub UI
- New documentation files:
  - `docs/GITHUB_WORKFLOWS.md`
  - `docs/VERCEL_DEPLOYMENT.md`
  - `docs/I18N_SCRIPTS.md`
  - `docs/API.md`
  - `docs/ACCESSIBILITY.md`
  - `docs/STATE_MANAGEMENT.md`
  - `docs/PWA.md`
  - `docs/STORYBOOK.md`

### Changed

- Streamlined CONTRIBUTING.md setup instructions
- Added translation section linking to docs/TRANSLATION_GUIDE.md
- Enhanced ACHIEVEMENTS.md with table of contents
- Grouped achievements by difficulty/rarity
- Optimized CI/CD pipeline with parallel execution

---

## [0.1.13] - 2025-01-XX

### Added

- Achievement system with 80+ achievements
- KanaDojo Stats tracking
- Custom theme support
- Japanese text analysis API
- Translation API with offline fallback
- OG image generation for social cards

### Changed

- Updated to Next.js 15 with Turbopack
- Migrated to React 19
- Improved TypeScript strict mode compliance

### Fixed

- Various bug fixes and improvements

---

## [0.1.12] - 2024-12-XX

### Added

- Kanji learning with JLPT levels
- Vocabulary training mode
- Gauntlet game mode
- Blitz game mode

### Changed

- Improved game mode selection UI
- Enhanced audio feedback system

---

## [0.1.11] - 2024-11-XX

### Added

- Kana learning (Hiragana/Katakana)
- Four game modes: Pick, Reverse-Pick, Input, Reverse-Input
- Theme system with multiple color schemes
- Progress tracking statistics

### Changed

- Initial public release

---

## Version History

| Version | Date       | Status   |
| ------- | ---------- | -------- |
| 0.1.13  | 2025-01-15 | Current  |
| 0.1.12  | 2024-12-20 | Previous |
| 0.1.11  | 2024-11-15 | Initial  |

---

## How to Generate

This changelog can be generated from git commits using:

```bash
git log --pretty=format:'## [%h] %s' --reverse main..HEAD
```

Or use a tool like [git-changelog](https://github.com/rafinskipp/git-changelog):

```bash
npx git-changelog -o CHANGELOG.md
```

---

## Categories

- **Added**: New features
- **Changed**: Existing feature modifications
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability patches
