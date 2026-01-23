// ============================================================================
// Resources Data - Aggregation and Export Module
// ============================================================================

import type { Resource, Category, CategoryId } from '../types';

// Import category definitions
import categoriesData from './categories.json';

// Import all resource data files
import appsData from './resources/apps.json';
import websitesData from './resources/websites.json';
import textbooksData from './resources/textbooks.json';
import youtubeData from './resources/youtube.json';
import podcastsData from './resources/podcasts.json';
import gamesData from './resources/games.json';
import jlptData from './resources/jlpt.json';
import readingData from './resources/reading.json';
import listeningData from './resources/listening.json';
import speakingData from './resources/speaking.json';
import writingData from './resources/writing.json';
import grammarData from './resources/grammar.json';
import vocabularyData from './resources/vocabulary.json';
import kanjiData from './resources/kanji.json';
import immersionData from './resources/immersion.json';
import communityData from './resources/community.json';

// ============================================================================
// Categories
// ============================================================================

/**
 * All category definitions
 */
export const categories: Category[] = categoriesData.categories as Category[];

/**
 * Get all categories
 */
export function getAllCategories(): Category[] {
  return categories;
}

/**
 * Get a category by its ID
 */
export function getCategoryById(id: CategoryId | string): Category | undefined {
  return categories.find(cat => cat.id === id);
}

/**
 * Get a subcategory by category ID and subcategory ID
 */
export function getSubcategoryById(
  categoryId: CategoryId | string,
  subcategoryId: string,
) {
  const category = getCategoryById(categoryId);
  if (!category) return undefined;
  return category.subcategories.find(sub => sub.id === subcategoryId);
}

// ============================================================================
// Resources
// ============================================================================

/**
 * Map of category ID to resource data
 */
const resourcesByCategory: Record<string, Resource[]> = {
  apps: appsData.resources as Resource[],
  websites: websitesData.resources as Resource[],
  textbooks: textbooksData.resources as Resource[],
  youtube: youtubeData.resources as Resource[],
  podcasts: podcastsData.resources as Resource[],
  games: gamesData.resources as Resource[],
  jlpt: jlptData.resources as Resource[],
  reading: readingData.resources as Resource[],
  listening: listeningData.resources as Resource[],
  speaking: speakingData.resources as Resource[],
  writing: writingData.resources as Resource[],
  grammar: grammarData.resources as Resource[],
  vocabulary: vocabularyData.resources as Resource[],
  kanji: kanjiData.resources as Resource[],
  immersion: immersionData.resources as Resource[],
  community: communityData.resources as Resource[],
};

/**
 * All resources combined into a single array
 */
let allResourcesCache: Resource[] | null = null;

/**
 * Get all resources from all categories, deduplicated by ID
 */
export function getAllResources(): Resource[] {
  if (allResourcesCache === null) {
    const rawResources = Object.values(resourcesByCategory).flat();
    // Deduplicate by ID to prevent key collisions in React
    const uniqueMap = new Map<string, Resource>();
    rawResources.forEach(resource => {
      uniqueMap.set(resource.id, resource);
    });
    allResourcesCache = Array.from(uniqueMap.values());
  }
  return allResourcesCache;
}

/**
 * Get resources by category ID
 */
export function getResourcesByCategory(
  categoryId: CategoryId | string,
): Resource[] {
  return resourcesByCategory[categoryId] || [];
}

/**
 * Get resources by subcategory
 */
export function getResourcesBySubcategory(
  categoryId: CategoryId | string,
  subcategoryId: string,
): Resource[] {
  const categoryResources = getResourcesByCategory(categoryId);
  return categoryResources.filter(r => r.subcategory === subcategoryId);
}

/**
 * Get a single resource by ID
 */
export function getResourceById(id: string): Resource | undefined {
  return getAllResources().find(r => r.id === id);
}

/**
 * Get featured resources
 */
export function getFeaturedResources(): Resource[] {
  return getAllResources().filter(r => r.featured === true);
}

/**
 * Get featured resources by category
 */
export function getFeaturedResourcesByCategory(
  categoryId: CategoryId | string,
): Resource[] {
  return getResourcesByCategory(categoryId).filter(r => r.featured === true);
}

// ============================================================================
// Counts
// ============================================================================

/**
 * Get the total count of all resources
 */
export function getTotalResourceCount(): number {
  return getAllResources().length;
}

/**
 * Get resource count for a specific category
 */
export function getCategoryResourceCount(
  categoryId: CategoryId | string,
): number {
  return getResourcesByCategory(categoryId).length;
}

/**
 * Get resource count for a specific subcategory
 */
export function getSubcategoryResourceCount(
  categoryId: CategoryId | string,
  subcategoryId: string,
): number {
  return getResourcesBySubcategory(categoryId, subcategoryId).length;
}

/**
 * Get all categories with their resource counts
 */
export function getCategoriesWithCounts() {
  return categories.map(category => ({
    ...category,
    resourceCount: getCategoryResourceCount(category.id),
    subcategoriesWithCount: category.subcategories.map(sub => ({
      ...sub,
      resourceCount: getSubcategoryResourceCount(category.id, sub.id),
    })),
  }));
}

// ============================================================================
// Exports
// ============================================================================

export {
  // Re-export types for convenience
  type Resource,
  type Category,
  type CategoryId,
} from '../types';
