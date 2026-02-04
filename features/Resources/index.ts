// ============================================================================
// Resources Feature - Public API
// ============================================================================

// Types (read-only data types)
export type {
  Resource,
  Category,
  Subcategory,
  DifficultyLevel,
  PriceType,
  Platform,
  CategoryId,
  SubcategoryId,
  ActiveFilters,
  FilterOptions,
  FilterOption,
  CategoryWithCount,
  SubcategoryWithCount,
  BreadcrumbItem,
  ResourcePageSEO,
  ItemListSchema,
  BreadcrumbListSchema,
  FAQPageSchema,
} from './types';

// Validation constants and type guards
export {
  DIFFICULTY_LEVELS,
  PRICE_TYPES,
  PLATFORMS,
  CATEGORY_IDS,
  isValidDifficulty,
  isValidPriceType,
  isValidPlatform,
  isValidCategoryId,
} from './types';

// Resource validation
export {
  validateResource,
  validateResources,
  REQUIRED_RESOURCE_FIELDS,
  type RequiredResourceField,
  type ResourceValidationResult,
} from './lib';

// Filtering utilities
export {
  filterByCategory,
  filterBySubcategory,
  filterByCategoryAndSubcategory,
  filterByDifficulty,
  filterByPriceType,
  filterByPlatform,
  combineFilters,
  createEmptyFilters,
  hasActiveFilters,
} from './lib';

// Search utilities
export {
  searchResources,
  resourceMatchesQuery,
  getSearchMatchLocations,
} from './lib';

// Count utilities
export {
  getCategoryResourceCounts,
  getSubcategoryResourceCounts,
  getResourceCountForCategory,
  getResourceCountForSubcategory,
  enrichCategoriesWithCounts,
  getTotalResourceCount as getTotalCount,
  validateCategoryCounts,
  getFilterOptions,
} from './lib';

// Data access functions
export {
  // Categories
  categories,
  getAllCategories,
  getCategoryById,
  getSubcategoryById,
  // Resources
  getAllResources,
  getResourcesByCategory,
  getResourcesBySubcategory,
  getResourceById,
  getFeaturedResources,
  getFeaturedResourcesByCategory,
  // Counts
  getTotalResourceCount,
  getCategoryResourceCount,
  getSubcategoryResourceCount,
  getCategoriesWithCounts,
} from './data';

// Hooks
export { useSearch, useInstantSearch } from './hooks';

// ============================================================================
// PRIVATE - DO NOT IMPORT DIRECTLY
// ============================================================================
// The following are internal to the Resources feature and should not be imported
// from outside. Use the facades or components above instead.
//
// - data/resources/* (resource JSON data files)
// - lib/* (internal utilities)
// - hooks/* (internal hooks)
