## Summary

This PR adds Simplified Chinese (`zh`) as a supported UI locale and improves the localization coverage of the main learning experience. It also fixes a few build/lint/runtime issues that surfaced while preparing the branch for CI and pre-commit checks.

## What changed

### Simplified Chinese locale support

- Added `zh` to the `next-intl` routing configuration so the app can render Chinese UI messages.
- Added and refined Simplified Chinese locale files for core namespaces, including:
  - `common`
  - `navigation`
  - `menuInfo`
  - `practiceLanding`
  - `settings`
  - `statistics`
- Updated top-level Chinese copy to sound more natural and less literal, especially across the home page, practice landing pages, navigation, settings, and progress UI.
- Standardized Chinese learning terminology, including using “关卡” for level-related UI copy.

### Language selection UI

- Added a reusable language selector button with the same visual style as the existing floating action buttons.
- Added the language selector to the home page controls.
- Added the language selector to the desktop sidebar next to the `KanaDojo / かな道場` title.
- Kept the language selector compact in the practice layout by showing only the icon, without an extra “Language” label.
- Ensured the selector uses the localized route helper so changing language preserves the current page path.

### Main menu and practice UI localization

- Localized main menu dojo labels so `Kana`, `Vocabulary`, and `Kanji` respond to the active UI locale.
- Localized practice info panels for kana, kanji, and vocabulary dojos.
- Localized practice selection controls, including:
  - “Select All Kana”
  - subset select-all buttons such as “select all base”
  - “Quick Select”
  - unit labels
  - level/range labels
  - selected group/level status bar labels
  - Quick Select modal actions and level cards
- Updated the bottom community tagline to use translations.

### Settings, progress, and donation copy

- Localized key Preferences UI sections and behavior options:
  - Behavior / Display / Effects / Backup
  - Themes / Fonts
  - Coming Soon
  - reading display, furigana, sound effects, pronunciation, and autoplay options
  - on/off labels
- Localized the Progress page shell:
  - tab labels
  - page title and subtitle
  - empty state
  - overview stat card labels
  - reset confirmation dialog text
- Localized the donation modal text and buttons.

### Build, lint, and runtime fixes

- Fixed a restricted import by exposing `displayKana` through the Preferences facade instead of importing the internal Preferences store directly.
- Removed unused variables/imports that caused `--max-warnings=0` pre-commit failures.
- Reworked Progress tab state so it is derived from URL search params instead of synchronizing state in an effect.
- Fixed a `useMemo` dependency warning in the Quick Select modal.
- Updated academy blog locale fallback so unsupported blog locales can safely fall back to English content.
- Improved server-side facts file path resolution to work across different execution directories.
- Added a fallback to read `NEXT_LOCALE` from cookies in the root layout when the locale header is not available.

## Validation

- Ran translation validation successfully:

```bash
npm --prefix "kana-dojo" run i18n:validate
```

- Verified the previously failing staged-file lint warnings were addressed.
- Successfully pushed the branch after resolving the pre-commit warning failures.

## Notes for reviewers

- This PR focuses on adding the first usable Simplified Chinese UI pass. Some deeper feature pages may still contain existing English copy and can be localized incrementally in follow-up PRs.
- Chinese UI copy was intentionally adjusted for naturalness rather than translated word-for-word.
- Existing English and Spanish locale files were updated where needed to keep translation key validation passing.
