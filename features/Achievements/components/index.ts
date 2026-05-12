/**
 * Achievement Components - Main Barrel Export
 *
 * Structure:
 * - global/     - App-wide components (used in ClientLayout)
 * - progress/   - Achievement progress page components
 * - _unused/    - Experimental/unused components
 */

// Global components (app-wide, used in ClientLayout)
export {
  AchievementIntegration,
  AchievementNotification,
  AchievementNotificationContainer,
  AchievementPromptsContainer,
} from './global';

// Progress page components
export {
  AchievementProgress,
  AchievementCard,
  AchievementManagement,
  HeroSection,
  CategoryTabs,
  AchievementGrid,
  useAchievementProgress,
  rarityConfig,
  categories,
} from './progress';

// Types
export type {
  AchievementCardProps,
  HeroSectionProps,
  CategoryTabsProps,
  AchievementGridProps,
  CategoryId,
} from './progress';

// Default export (main page component)
export { AchievementProgress as default } from './progress';
