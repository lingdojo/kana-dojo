// ============================================================================
// Resource Count Utilities
// ============================================================================

import type {
  Resource,
  Category,
  CategoryId,
  SubcategoryId,
  CategoryWithCount,
  SubcategoryWithCount,
  FilterOptions,
} from '../types';
import { DIFFICULTY_LEVELS, PRICE_TYPES, PLATFORMS } from '../types';

/**
 * Count resources by category
 * @param resources - Array of resources to count
 * @returns Map of category ID to resource count
 */
export function getCategoryResourceCounts(
  resources: Resource[],
): Map<CategoryId | string, number> {
  const counts = new Map<CategoryId | string, number>();

  for (const resource of resources) {
    const currentCount = counts.get(resource.category) || 0;
    counts.set(resource.category, currentCount + 1);
  }

  return counts;
}

/**
 * Count resources by subcategory within a category
 * @param resources - Array of resources to count
 * @param categoryId - Category to filter by (optional)
 * @returns Map of subcategory ID to resource count
 */
export function getSubcategoryResourceCounts(
  resources: Resource[],
  categoryId?: CategoryId | string,
): Map<SubcategoryId, number> {
  const counts = new Map<SubcategoryId, number>();

  const filteredResources = categoryId
    ? resources.filter(r => r.category === categoryId)
    : resources;

  for (const resource of filteredResources) {
    const currentCount = counts.get(resource.subcategory) || 0;
    counts.set(resource.subcategory, currentCount + 1);
  }

  return counts;
}

/**
 * Get resource count for a specific category
 * @param resources - Array of resources to count
 * @param categoryId - Category ID to count
 * @returns Number of resources in the category
 */
export function getResourceCountForCategory(
  resources: Resource[],
  categoryId: CategoryId | string,
): number {
  return resources.filter(r => r.category === categoryId).length;
}

/**
 * Get resource count for a specific subcategory
 * @param resources - Array of resources to count
 * @param categoryId - Category ID
 * @param subcategoryId - Subcategory ID to count
 * @returns Number of resources in the subcategory
 */
export function getResourceCountForSubcategory(
  resources: Resource[],
  categoryId: CategoryId | string,
  subcategoryId: SubcategoryId,
): number {
  return resources.filter(
    r => r.category === categoryId && r.subcategory === subcategoryId,
  ).length;
}

/**
 * Enrich categories with resource counts
 * @param categories - Array of category definitions
 * @param resources - Array of resources
 * @returns Categories with resource counts added
 */
export function enrichCategoriesWithCounts(
  categories: Category[],
  resources: Resource[],
): CategoryWithCount[] {
  const categoryCounts = getCategoryResourceCounts(resources);

  return categories.map(category => {
    const subcategoryCounts = getSubcategoryResourceCounts(
      resources,
      category.id,
    );

    const subcategoriesWithCount: SubcategoryWithCount[] =
      category.subcategories.map(subcategory => ({
        ...subcategory,
        resourceCount: subcategoryCounts.get(subcategory.id) || 0,
      }));

    return {
      ...category,
      resourceCount: categoryCounts.get(category.id) || 0,
      subcategoriesWithCount,
    };
  });
}

/**
 * Get total resource count
 * @param resources - Array of resources
 * @returns Total number of resources
 */
export function getTotalResourceCount(resources: Resource[]): number {
  return resources.length;
}

/**
 * Validate that category counts are accurate
 * @param categories - Categories with counts
 * @param resources - Source resources
 * @returns True if all counts are accurate
 */
export function validateCategoryCounts(
  categories: CategoryWithCount[],
  resources: Resource[],
): boolean {
  for (const category of categories) {
    const actualCount = resources.filter(
      r => r.category === category.id,
    ).length;
    if (category.resourceCount !== actualCount) {
      return false;
    }

    for (const subcategory of category.subcategoriesWithCount) {
      const actualSubCount = resources.filter(
        r => r.category === category.id && r.subcategory === subcategory.id,
      ).length;
      if (subcategory.resourceCount !== actualSubCount) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Build filter option counts for resources
 * @param resources - Array of resources to count
 * @returns Filter options with counts
 */
export function getFilterOptions(resources: Resource[]): FilterOptions {
  const difficulties = DIFFICULTY_LEVELS.map(level => ({
    value: level,
    count: resources.filter(r => r.difficulty === level).length,
  }));

  const priceTypes = PRICE_TYPES.map(type => ({
    value: type,
    count: resources.filter(r => r.priceType === type).length,
  }));

  const platforms = PLATFORMS.map(platform => ({
    value: platform,
    count: resources.filter(r => r.platforms.includes(platform)).length,
  }));

  return { difficulties, priceTypes, platforms };
}
