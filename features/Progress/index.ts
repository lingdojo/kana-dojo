// ============================================================================
// Progress Feature - Public API
// ============================================================================

// Facades (PRIMARY API - Use these in new code)
export {
  useGameStats,
  useStatsDisplay,
  useSessionStats,
  useTimedStats,
  statsTracking,
  progressBackup,
} from './facade';
export type {
  GameStats,
  GameStatsActions,
  StatsDisplay,
  SessionStats,
  TimedStats,
  RecordGauntletRunParams,
  RecordBlitzSessionParams,
  StatsStoreState,
} from './facade';

// Components (page-level)
export { default as ProgressTabs } from './components/ProgressTabs';
export { default as SimpleProgress } from './components/SimpleProgress';

// Stats Components (new revamped stats page)
export {
  StatsPage,
  OverviewStatsCard,
  CharacterMasteryPanel,
  TimedModeStatsPanel,
  GauntletStatsPanel,
  MasteryDistributionChart,
  AchievementSummaryBar,
  getStatsOverviewDisplayValues,
  getTopCharacters,
  getTimedModeDisplayValues,
  getGauntletDisplayValues,
  getMasteryDistributionDisplayValues,
  getAchievementDisplayValues,
} from './components/stats';
export type {
  StatsPageProps,
  OverviewStatsCardProps,
  CharacterMasteryPanelProps,
  TimedModeStatsPanelProps,
  GauntletStatsPanelProps,
  MasteryDistributionChartProps,
  AchievementSummaryBarProps,
} from './components/stats';

// Hooks
export {
  useStatsAggregator,
  calculateMasteryDistribution,
  filterCharacterMasteryByType,
  getTopDifficultCharacters,
  getTopMasteredCharacters,
} from './hooks/useStatsAggregator';
export type { StatsAggregatorState } from './hooks/useStatsAggregator';

// Types
export type {
  ContentType,
  ContentFilter,
  MasteryLevel,
  CharacterMasteryItem,
  TimedModeStats,
  GauntletOverallStats,
  MasteryDistribution,
  AchievementSummary,
  AggregatedStats,
  RawCharacterMastery,
} from './types/stats';

// Utility functions
export { classifyCharacter } from './lib/classifyCharacter';
export { detectContentType } from './lib/detectContentType';
export { calculateAccuracy } from './lib/calculateAccuracy';

export { default } from './store/useSetProgressStore';
export { default as useStatsStore } from './store/useStatsStore';
export { default as useSetProgressStore } from './store/useSetProgressStore';
export {
  KANJI_SET_PROGRESS_TARGET,
  VOCAB_MEANING_PROGRESS_TARGET,
  VOCAB_READING_PROGRESS_TARGET,
  calculateKanjiSetProgress,
  calculateVocabularySetProgress,
} from './lib/setProgress';

// ============================================================================
// PRIVATE - DO NOT IMPORT DIRECTLY
// ============================================================================
// - store/useStatsStore.ts (use facades instead)
// - lib/progressUtils.ts (internal)
