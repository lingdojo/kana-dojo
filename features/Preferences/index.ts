// ============================================================================
// Preferences Feature - Public API
// ============================================================================

// Facades (PRIMARY API - Use these in new code)
export {
  useAudioPreferences,
  useThemePreferences,
  useInputPreferences,
  useGoalTimersPreferences,
  preferencesBackup,
} from './facade';
export type {
  AudioPreferences,
  ThemePreferences,
  InputPreferences,
  GoalTimersPreferences,
  GoalTimersPreferencesActions,
  PreferencesStoreState,
  CustomThemeStoreState,
} from './facade';

// Components (page-level)
export { default as ThemesModal } from './components/modals/ThemesModal';
export { default as FontsModal } from './components/modals/FontsModal';
export { default as DonationModal } from './components/modals/DonationModal';
export { default as Settings } from './components/sections';

// Data (read-only) - Note: Import defaults, not named exports
export { default as themeSets } from './data/themes/themes';
// export { default as themes } from './data/themes/themes';
// NOTE: Do not export fonts from the main barrel.
// Fonts rely on next/font/google and can trigger SSR build-time side effects.
// Import fonts from '@/features/Preferences/fonts' only at explicit font-consumer call-sites.

// ============================================================================
// PRIVATE - DO NOT IMPORT DIRECTLY
// ============================================================================
// - store/usePreferencesStore.ts (use facades instead)
// - lib/themeHelpers.ts (internal)
