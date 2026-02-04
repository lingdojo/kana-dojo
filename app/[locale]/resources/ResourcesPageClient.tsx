'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  ResourceGrid,
  CategoryNav,
  SearchBar,
  FilterPanel,
  ResourceDetailModal,
} from '@/features/Resources/components';
import {
  combineFilters,
  searchResources,
  createEmptyFilters,
  type Resource,
  type CategoryWithCount,
  type ActiveFilters,
  type FilterOptions,
  DIFFICULTY_LEVELS,
  PRICE_TYPES,
  PLATFORMS,
} from '@/features/Resources';

interface ResourcesPageClientProps {
  locale: string;
  initialResources: Resource[];
  categoriesWithCounts: CategoryWithCount[];
  availableFilters?: FilterOptions;
}

export function ResourcesPageClient({
  locale,
  initialResources,
  categoriesWithCounts,
  availableFilters,
}: ResourcesPageClientProps) {
  const [filters, setFilters] = useState<ActiveFilters>(createEmptyFilters());
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredResources = useMemo(() => {
    let result = initialResources;
    if (filters.search.trim()) {
      result = searchResources(result, filters.search);
    }
    result = combineFilters(result, filters);
    return result;
  }, [initialResources, filters]);

  const computedFilters: FilterOptions = useMemo(() => {
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

  const filterOptions = availableFilters ?? computedFilters;

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

  const relatedResources = useMemo(() => {
    if (!selectedResource) return [];
    return initialResources
      .filter(
        r =>
          r.id !== selectedResource.id &&
          (r.category === selectedResource.category ||
            r.tags.some(tag => selectedResource.tags.includes(tag))),
      )
      .slice(0, 4);
  }, [selectedResource, initialResources]);

  return (
    <div className='min-h-screen bg-(--background-color) selection:bg-(--main-color) selection:text-(--background-color)'>
      {/* Editorial Header */}
      <header className='overflow-hidden border-b border-(--border-color) py-24'>
        <div className='mx-auto max-w-screen-2xl px-6 md:px-12'>
          <div className='flex flex-col justify-between gap-12 md:flex-row md:items-end'>
            <div className='max-w-3xl'>
              <div className='mb-8 flex items-center gap-4'>
                <span className='text-[10px] font-bold tracking-[0.3em] text-(--secondary-color) uppercase opacity-40'>
                  Resource Compendium
                </span>
                <div className='h-px w-12 bg-(--border-color)' />
              </div>
              <h1 className='mb-8 text-6xl leading-[0.9] font-black tracking-tighter text-(--main-color) md:text-8xl'>
                Learn <br className='hidden md:block' />
                Japanese.
              </h1>
              <p className='max-w-xl text-xl leading-relaxed font-medium text-(--secondary-color) opacity-60 md:text-2xl'>
                A curated indexing of the most effective tools, texts, and
                platforms for mastering the Japanese language.
              </p>
            </div>

            <div className='shrink-0 pb-2'>
              <div className='mb-4 text-[10px] font-bold tracking-[0.2em] text-(--main-color) uppercase'>
                Global Index
              </div>
              <div className='text-6xl font-black tracking-tighter text-(--main-color) tabular-nums'>
                {initialResources.length}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className='mx-auto max-w-screen-2xl px-6 py-12 md:px-12'>
        <div className='flex flex-col gap-16 lg:flex-row'>
          {/* Navigation & Refinement Sidebar */}
          <aside className='scrollbar-none hover:scrollbar-thin w-full shrink-0 transition-all lg:sticky lg:top-12 lg:h-[calc(100vh-6rem)] lg:w-72 lg:overflow-y-auto lg:pr-6'>
            <CategoryNav
              categories={categoriesWithCounts}
              basePath={`/${locale}/resources`}
            />
            <div className='mt-12'>
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                availableFilters={filterOptions}
              />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className='min-w-0 flex-1'>
            <div className='mb-12'>
              <SearchBar
                value={filters.search}
                onChange={handleSearchChange}
                resultCount={filteredResources.length}
              />
            </div>

            <ResourceGrid
              resources={filteredResources}
              onResourceSelect={handleResourceSelect}
            />

            {/* Footer indicator */}
            <div className='mt-24 flex flex-col items-center border-t border-(--border-color) pt-12 text-center opacity-20'>
              <div className='mb-4 text-[10px] font-bold tracking-[0.5em] text-(--secondary-color) uppercase'>
                End of Index
              </div>
              <div className='h-1 w-1 rounded-full bg-(--main-color)' />
            </div>
          </main>
        </div>
      </div>

      <ResourceDetailModal
        resource={selectedResource}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        relatedResources={relatedResources}
        onRelatedSelect={handleResourceSelect}
      />
    </div>
  );
}
