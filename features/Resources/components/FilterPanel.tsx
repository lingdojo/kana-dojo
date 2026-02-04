'use client';

import React, { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { ChevronDown, Filter } from 'lucide-react';
import type {
  ActiveFilters,
  FilterOptions,
  DifficultyLevel,
  PriceType,
  Platform,
} from '../types';

// ============================================================================
// Types
// ============================================================================

export interface FilterPanelProps {
  /** Current active filters */
  filters: ActiveFilters;
  /** Callback when filters change */
  onFilterChange: (filters: ActiveFilters) => void;
  /** Available filter options with counts */
  availableFilters: FilterOptions;
  /** Additional CSS classes */
  className?: string;
  /** ID for the filter panel (for aria-controls) */
  id?: string;
}

// ============================================================================
// Checkbox Group Component (Editorial Style)
// ============================================================================

interface CheckboxGroupProps<T extends string> {
  title: string;
  options: { value: T; count: number }[];
  selected: T[];
  onChange: (selected: T[]) => void;
  labels: Record<T, string>;
}

function CheckboxGroup<T extends string>({
  title,
  options,
  selected,
  onChange,
  labels,
}: CheckboxGroupProps<T>) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className='border-b border-(--border-color) py-6'>
      <button
        type='button'
        onClick={() => setIsExpanded(!isExpanded)}
        className='group flex w-full cursor-pointer items-center justify-between'
      >
        <span className='text-[10px] font-bold tracking-[0.2em] text-(--secondary-color) uppercase opacity-40'>
          {title}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'text-(--secondary-color) opacity-40 transition-transform duration-300',
            isExpanded && 'rotate-180',
          )}
        />
      </button>

      {isExpanded && (
        <div className='mt-4 space-y-2'>
          {options.map(option => {
            const isSelected = selected.includes(option.value);
            return (
              <label
                key={option.value}
                className={cn(
                  'group flex cursor-pointer items-center justify-between transition-colors duration-300',
                  isSelected
                    ? 'font-medium text-(--main-color)'
                    : 'text-(--secondary-color) hover:text-(--main-color)',
                )}
              >
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={isSelected}
                    onChange={() => handleToggle(option.value)}
                    className='sr-only'
                  />
                  <div
                    className={cn(
                      'h-1.5 w-1.5 rounded-full transition-colors duration-300',
                      isSelected
                        ? 'scale-100 bg-(--main-color)'
                        : 'scale-0 bg-transparent',
                    )}
                  />
                  <span className='text-sm'>{labels[option.value]}</span>
                </div>
                <span className='font-mono text-[10px] opacity-40 group-hover:opacity-100'>
                  {option.count}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FilterPanel Component (Editorial Style)
// ============================================================================

const difficultyLabels: Record<DifficultyLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  'all-levels': 'All Levels',
};

const priceLabels: Record<PriceType, string> = {
  free: 'Free',
  freemium: 'Freemium',
  paid: 'Paid',
  subscription: 'Subs',
};

const platformLabels: Record<Platform, string> = {
  web: 'Web',
  ios: 'iOS',
  android: 'Droid',
  windows: 'Win',
  macos: 'Mac',
  linux: 'Linux',
  physical: 'Print',
  'browser-extension': 'Ext',
  api: 'API',
};

export function FilterPanel({
  filters,
  onFilterChange,
  availableFilters,
  className,
}: FilterPanelProps) {
  const [showMobile, setShowMobile] = useState(false);

  const handleDifficultyChange = (difficulty: DifficultyLevel[]) => {
    onFilterChange({ ...filters, difficulty });
  };

  const handlePriceChange = (priceType: PriceType[]) => {
    onFilterChange({ ...filters, priceType });
  };

  const handlePlatformChange = (platforms: Platform[]) => {
    onFilterChange({ ...filters, platforms });
  };

  const handleClearAll = () => {
    onFilterChange({
      difficulty: [],
      priceType: [],
      platforms: [],
      search: filters.search,
    });
  };

  const activeCount =
    filters.difficulty.length +
    filters.priceType.length +
    filters.platforms.length;

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Mobile Toggle */}
      <button
        onClick={() => setShowMobile(!showMobile)}
        className='flex cursor-pointer items-center justify-between border-b border-(--border-color) py-4 text-(--main-color) lg:hidden'
      >
        <span className='flex items-center gap-2 text-sm font-bold'>
          <Filter size={16} />
          Refine
          {activeCount > 0 && (
            <span className='font-mono text-[10px] opacity-40'>
              ({activeCount})
            </span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={cn('transition-transform', showMobile && 'rotate-180')}
        />
      </button>

      <div className={cn('mt-2 lg:block', !showMobile && 'hidden')}>
        <div className='mb-2 flex items-center justify-between'>
          <h2 className='text-[10px] font-bold tracking-[0.2em] text-(--secondary-color) uppercase opacity-40'>
            Filters
          </h2>
          {activeCount > 0 && (
            <button
              onClick={handleClearAll}
              className='cursor-pointer text-[10px] font-bold tracking-widest text-(--secondary-color) uppercase transition-colors hover:text-(--main-color)'
            >
              Reset
            </button>
          )}
        </div>

        <div className='flex flex-col'>
          <CheckboxGroup
            title='Difficulty'
            options={availableFilters.difficulties}
            selected={filters.difficulty}
            onChange={handleDifficultyChange}
            labels={difficultyLabels}
          />
          <CheckboxGroup
            title='Access'
            options={availableFilters.priceTypes}
            selected={filters.priceType}
            onChange={handlePriceChange}
            labels={priceLabels}
          />
          <CheckboxGroup
            title='Platform'
            options={availableFilters.platforms}
            selected={filters.platforms}
            onChange={handlePlatformChange}
            labels={platformLabels}
          />
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
