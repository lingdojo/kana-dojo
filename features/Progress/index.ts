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

// Progress calculation (set progress, star system)
export {
  MAX_STARS_PER_SET,
  KANA_ROW_MASTERY_TARGET,
  KANA_MAX_STARS,
  KANA_ROW_MASTERY_CAP,
  KANJI_SET_PROGRESS_TARGET,
  KANJI_SET_PROGRESS_CAP,
  VOCAB_MEANING_PROGRESS_TARGET,
  VOCAB_MEANING_PROGRESS_CAP,
  VOCAB_READING_PROGRESS_TARGET,
  VOCAB_READING_PROGRESS_CAP,
  VOCAB_SET_PROGRESS_TARGET_PER_WORD,
  calculateKanjiSetProgress,
  calculateVocabularySetProgress,
  calculateKanjiSetProgressAndStars,
  calculateVocabularySetProgressAndStars,
} from './lib/setProgress';
export type {
  KanjiSetProgressEntry,
  VocabularySetProgressEntry,
} from './lib/setProgress';

export { default as useStatsStore } from './store/useStatsStore';
export { default as useSetProgressStore } from './store/useSetProgressStore';

// ============================================================================
// PRIVATE - DO NOT IMPORT DIRECTLY
// ============================================================================
// - store/useStatsStore.ts (use facades instead)
// - lib/progressUtils.ts (internal)
