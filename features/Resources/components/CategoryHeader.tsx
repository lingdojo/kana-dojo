'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import type { Category, CategoryWithCount } from '../types';

export interface CategoryHeaderProps {
  /** Category data (can be with or without count) */
  category: Category | CategoryWithCount;
  /** Resource count (optional if using CategoryWithCount) */
  resourceCount?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the long description */
  showLongDescription?: boolean;
}

/**
 * CategoryHeader displays category information with a refined editorial aesthetic.
 */
export function CategoryHeader({
  category,
  resourceCount,
  className,
  showLongDescription = true,
}: CategoryHeaderProps) {
  const count =
    resourceCount ?? ('resourceCount' in category ? category.resourceCount : 0);

  return (
    <header
      className={cn(
        'mb-12 border-b border-[var(--border-color)] pb-12',
        className,
      )}
      role='banner'
    >
      <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
        <div className='max-w-2xl'>
          <div className='mb-4 flex items-center gap-4'>
            <span className='text-[10px] font-bold tracking-[0.3em] text-[var(--secondary-color)] uppercase opacity-40'>
              Category Collection
            </span>
            {count > 0 && (
              <span className='font-mono text-[10px] text-[var(--secondary-color)] opacity-40'>
                / {count} items
              </span>
            )}
          </div>
          <h1 className='text-5xl leading-none font-black tracking-tighter text-[var(--main-color)] md:text-7xl'>
            {category.name}
          </h1>
        </div>
      </div>

      {/* Short Description */}
      <p className='mt-8 max-w-2xl text-xl font-medium text-[var(--secondary-color)] opacity-60 md:text-2xl'>
        {category.description}
      </p>

      {/* Long-form Content */}
      {showLongDescription && category.descriptionLong && (
        <div
          className='prose prose-lg dark:prose-invert mt-12 max-w-3xl border-t border-[var(--border-color)] pt-12'
          aria-label='Detailed category description'
        >
          <div
            className='leading-relaxed text-[var(--secondary-color)] opacity-80'
            dangerouslySetInnerHTML={{ __html: category.descriptionLong }}
          />
        </div>
      )}
    </header>
  );
}
