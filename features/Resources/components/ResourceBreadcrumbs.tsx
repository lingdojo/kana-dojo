'use client';

import React from 'react';
import { Breadcrumbs } from '@/shared/ui-composite/Breadcrumbs/Breadcrumbs';
import type { BreadcrumbItem } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import type { Category, Subcategory } from '../types';

export interface ResourceBreadcrumbsProps {
  /** Current locale for URL generation */
  locale: string;
  /** Current category (optional) */
  category?: Category;
  /** Current subcategory (optional) */
  subcategory?: Subcategory;
  /** Additional CSS classes */
  className?: string;
  /** Whether to include structured data schema (default: true) */
  includeSchema?: boolean;
}

/**
 * ResourceBreadcrumbs generates navigation breadcrumbs for the Resources feature
 * Automatically builds the path based on current category and subcategory
 *
 * @example
 * // Main resources page
 * <ResourceBreadcrumbs locale="en" />
 * // Output: Home > Resources
 *
 * @example
 * // Category page
 * <ResourceBreadcrumbs locale="en" category={appsCategory} />
 * // Output: Home > Resources > Apps
 *
 * @example
 * // Subcategory page
 * <ResourceBreadcrumbs locale="en" category={appsCategory} subcategory={flashcardsSubcategory} />
 * // Output: Home > Resources > Apps > Flashcards
 */
export function ResourceBreadcrumbs({
  locale,
  category,
  subcategory,
  className,
  includeSchema = true,
}: ResourceBreadcrumbsProps) {
  // Build breadcrumb items based on current navigation level
  const items: BreadcrumbItem[] = [
    { name: 'Home', url: `/${locale}` },
    { name: 'Resources', url: `/${locale}/resources` },
  ];

  // Add category if present
  if (category) {
    items.push({
      name: category.name,
      url: `/${locale}/resources/${category.id}`,
    });

    // Add subcategory if present
    if (subcategory) {
      items.push({
        name: subcategory.name,
        url: `/${locale}/resources/${category.id}/${subcategory.id}`,
      });
    }
  }

  return (
    <Breadcrumbs
      items={items}
      className={className}
      includeSchema={includeSchema}
    />
  );
}

