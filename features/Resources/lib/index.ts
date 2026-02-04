// ============================================================================
// Resources Feature - Library Functions
// ============================================================================

export {
  validateResource,
  validateResources,
  REQUIRED_RESOURCE_FIELDS,
  type RequiredResourceField,
  type ResourceValidationResult,
} from './validateResource';

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
} from './filters';

export {
  searchResources,
  resourceMatchesQuery,
  getSearchMatchLocations,
} from './search';

export {
  getCategoryResourceCounts,
  getSubcategoryResourceCounts,
  getResourceCountForCategory,
  getResourceCountForSubcategory,
  enrichCategoriesWithCounts,
  getTotalResourceCount,
  validateCategoryCounts,
  getFilterOptions,
} from './counts';
