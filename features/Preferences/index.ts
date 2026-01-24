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
export { default as ThemesModal } from './components/ThemesModal';
export { default as FontsModal } from './components/FontsModal';

// Data (read-only) - Note: Import defaults, not named exports
export { default as themeSets } from './data/themes';
// export { default as themes } from './data/themes';
export { default as fonts } from './data/fonts';

// ============================================================================
// PRIVATE - DO NOT IMPORT DIRECTLY
// ============================================================================
// - store/usePreferencesStore.ts (use facades instead)
// - lib/themeHelpers.ts (internal)
