'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  ResourceGrid,
  CategoryNav,
  SearchBar,
  FilterPanel,
  ResourceDetailModal,
  ResourceBreadcrumbs,
  RelatedCategories,
} from '@/features/Resources/components';
import {
  combineFilters,
  searchResources,
  createEmptyFilters,
  type Resource,
  type Category,
  type Subcategory,
  type CategoryWithCount,
  type ActiveFilters,
  type FilterOptions,
  DIFFICULTY_LEVELS,
  PRICE_TYPES,
  PLATFORMS,
} from '@/features/Resources';

interface SubcategoryPageClientProps {
  locale: string;
  category: Category;
  subcategory: Subcategory;
  initialResources: Resource[];
  categoriesWithCounts: CategoryWithCount[];
}

export function SubcategoryPageClient({
  locale,
  category,
  subcategory,
  initialResources,
  categoriesWithCounts,
}: SubcategoryPageClientProps) {
  // State
  const [filters, setFilters] = useState<ActiveFilters>(createEmptyFilters());
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter and search resources
  const filteredResources = useMemo(() => {
    let result = initialResources;

    // Apply search
    if (filters.search.trim()) {
      result = searchResources(result, filters.search);
    }

    // Apply filters
    result = combineFilters(result, filters);

    return result;
  }, [initialResources, filters]);

  // Calculate available filter options with counts
  const availableFilters: FilterOptions = useMemo(() => {
    const difficulties = DIFFICULTY_LEVELS.map(level => ({
      value: level,
      count: initialResources.filter(r => r.difficulty === level).length,
    }));

    const priceTypes = PRICE_TYPES.map(type => ({
      value: type,
      count: initialResources.filter(r => r.priceType === type).length,
    }));

    const platforms = PLATFORMS.map(platform => ({
      value: platform,
      count: initialResources.filter(r => r.platforms.includes(platform))
        .length,
    }));

    return { difficulties, priceTypes, platforms };
  }, [initialResources]);

  // Handlers
  const handleSearchChange = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const handleFilterChange = useCallback((newFilters: ActiveFilters) => {
    setFilters(newFilters);
  }, []);

  const handleResourceSelect = useCallback((resource: Resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedResource(null);
  }, []);

  // Get related resources for modal
  const relatedResources = useMemo(() => {
    if (!selectedResource) return [];
    return initialResources
      .filter(
        r =>
          r.id !== selectedResource.id &&
          r.tags.some(tag => selectedResource.tags.includes(tag)),
      )
      .slice(0, 4);
  }, [selectedResource, initialResources]);

  return (
    <div className='min-h-screen bg-[var(--background-color)]'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Breadcrumbs */}
        <ResourceBreadcrumbs
          locale={locale}
          category={category}
          subcategory={subcategory}
          className='mb-6'
        />

        {/* Page Header */}
        <header className='mb-8 space-y-4'>
          {/* Subcategory Title and Count */}
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <h1 className='text-3xl font-bold tracking-tight text-[var(--main-color)] md:text-4xl'>
              {subcategory.name}
              {subcategory.nameJa && (
                <span className='ml-2 text-xl font-normal text-[var(--secondary-color)] md:text-2xl'>
                  ({subcategory.nameJa})
                </span>
              )}
            </h1>
            <div className='flex items-center gap-2'>
              <span className='rounded-full bg-[var(--main-color)]/10 px-3 py-1 text-sm font-medium text-[var(--main-color)]'>
                {initialResources.length}{' '}
                {initialResources.length === 1 ? 'resource' : 'resources'}
              </span>
            </div>
          </div>

          {/* Short Description */}
          <p className='text-lg text-[var(--secondary-color)]'>
            {subcategory.description}
          </p>

          {/* Long-form SEO Content */}
          {subcategory.descriptionLong && (
            <div className='prose prose-sm dark:prose-invert max-w-none'>
              <p className='text-[var(--secondary-color)]'>
                {subcategory.descriptionLong}
              </p>
            </div>
          )}
        </header>

        {/* Search Bar */}
        <div className='mb-6'>
          <SearchBar
            value={filters.search}
            onChange={handleSearchChange}
            placeholder={`Search ${subcategory.name.toLowerCase()}...`}
            resultCount={filteredResources.length}
          />
        </div>

        {/* Main Content */}
        <div className='flex flex-col gap-8 lg:flex-row'>
          {/* Sidebar */}
          <aside className='w-full shrink-0 lg:w-64'>
            {/* Category Navigation */}
            <div className='mb-6 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] p-4'>
              <h2 className='mb-4 text-sm font-semibold tracking-wider text-[var(--secondary-color)] uppercase'>
                Categories
              </h2>
              <CategoryNav
                categories={categoriesWithCounts}
                activeCategory={category.id}
                basePath={`/${locale}/resources`}
              />
            </div>

            {/* Filters */}
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              availableFilters={availableFilters}
            />

            {/* Related Categories for Internal Linking */}
            <RelatedCategories
              currentCategory={category}
              allCategories={categoriesWithCounts}
              basePath={`/${locale}/resources`}
              className='mt-6'
            />
          </aside>

          {/* Resource Grid */}
          <main className='flex-1'>
            <div className='mb-4 flex items-center justify-between'>
              <p className='text-sm text-[var(--secondary-color)]'>
                Showing {filteredResources.length} of {initialResources.length}{' '}
                {subcategory.name.toLowerCase()}
              </p>
            </div>

            <ResourceGrid
              resources={filteredResources}
              onResourceSelect={handleResourceSelect}
            />
          </main>
        </div>

        {/* Resource Detail Modal */}
        <ResourceDetailModal
          resource={selectedResource}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          relatedResources={relatedResources}
          onRelatedSelect={handleResourceSelect}
        />
      </div>
    </div>
  );
}
