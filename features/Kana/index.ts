// ============================================================================
// Kana Feature - Public API
// ============================================================================

// Facades (PRIMARY API - Use these in new code)
export { useKanaSelection, useKanaContent } from './facade';
export type {
  KanaSelection,
  KanaSelectionActions,
  KanaContent,
} from './facade';

// Components (page-level)
export { default as KanaGame } from './components/Game';
export { default as KanaCards } from './components/KanaCards';
export { default as KanaBlitz } from './components/Blitz';
export { default as KanaGauntlet } from './components/Gauntlet';
export { default as SubsetDictionary } from './components/SubsetDictionary';

// Types (read-only data types)
export type { KanaCharacter, KanaGroup } from '@/entities/kana';

// ============================================================================
// PRIVATE - DO NOT IMPORT DIRECTLY
// ============================================================================
// The following are internal to the Kana feature and should not be imported
// from outside. Use the facades or components above instead.
//
// - store/useKanaStore.ts (use useKanaSelection facade instead)
// - data/kana.ts (use useKanaContent facade instead)
// - lib/* (internal utilities)
