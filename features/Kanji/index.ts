// ============================================================================
// Kanji Feature - Public API
// ============================================================================

// Facades (PRIMARY API - Use these in new code)
export { useKanjiSelection } from './facade';
export type {
  KanjiSelection,
  KanjiSelectionActions,
  IKanjiObj,
} from './facade';
export type { KanjiLevel } from '@/entities/kanji';

// Components (page-level)
export { default as KanjiGame } from './components/Game';
export { default as KanjiCards } from './components';
export { default as KanjiBlitz } from './components/Blitz';
export { default as KanjiGauntlet } from './components/Gauntlet';

// ============================================================================
// PRIVATE - DO NOT IMPORT DIRECTLY
// ============================================================================
// - store/useKanjiStore.ts (use useKanjiSelection facade instead)
// - services/kanjiDataService.ts (internal)
