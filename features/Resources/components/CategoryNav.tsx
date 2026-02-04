'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/shared/lib/utils';
import type { CategoryWithCount } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface CategoryNavProps {
  /** Categories with resource counts */
  categories: CategoryWithCount[];
  /** Currently active category ID */
  activeCategory?: string;
  /** Base path for category links */
  basePath?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CategoryNav Component (Editorial Style)
// ============================================================================

/**
 * CategoryNav displays a refined editorial navigation for resource categories.
 */
export function CategoryNav({
  categories,
  activeCategory,
  basePath = '/resources',
  className,
}: CategoryNavProps) {
  const navRef = useRef<HTMLElement>(null);

  return (
    <nav
      ref={navRef}
      className={cn('flex flex-col space-y-8', className)}
      aria-label='Resource categories'
    >
      <div>
        <h2 className='mb-4 text-[10px] font-bold tracking-[0.2em] text-(--secondary-color) uppercase opacity-40'>
          Collections
        </h2>
        <ul className='space-y-1' role='list'>
          <li>
            <Link
              href={basePath}
              className={cn(
                'group flex cursor-pointer items-center justify-between py-1.5 text-sm transition-all duration-300',
                !activeCategory
                  ? 'font-bold text-(--main-color)'
                  : 'text-(--secondary-color) hover:text-(--main-color)',
              )}
              aria-current={!activeCategory ? 'page' : undefined}
            >
              <span>Library Index</span>
              <span className='font-mono text-[10px] opacity-40 group-hover:opacity-100'>
                {categories.reduce((acc, cat) => acc + cat.resourceCount, 0)}
              </span>
            </Link>
          </li>

          {categories.slice(0, 8).map(category => {
            const isActive = activeCategory === category.id;
            return (
              <li key={category.id}>
                <Link
                  href={`${basePath}/${category.id}`}
                  className={cn(
                    'group flex cursor-pointer items-center justify-between py-1.5 text-sm transition-all duration-300',
                    isActive
                      ? 'font-bold text-(--main-color)'
                      : 'text-(--secondary-color) hover:text-(--main-color)',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className='flex items-center gap-2'>
                    {isActive && (
                      <span className='h-1 w-1 rounded-full bg-(--main-color)' />
                    )}
                    {category.name}
                  </span>
                  <span className='font-mono text-[10px] opacity-40 group-hover:opacity-100'>
                    {category.resourceCount}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h2 className='mb-4 text-[10px] font-bold tracking-[0.2em] text-(--secondary-color) uppercase opacity-40'>
          Specialized
        </h2>
        <ul className='space-y-1' role='list'>
          {categories.slice(8).map(category => {
            const isActive = activeCategory === category.id;
            return (
              <li key={category.id}>
                <Link
                  href={`${basePath}/${category.id}`}
                  className={cn(
                    'group flex cursor-pointer items-center justify-between py-1.5 text-sm transition-all duration-300',
                    isActive
                      ? 'font-bold text-(--main-color)'
                      : 'text-(--secondary-color) hover:text-(--main-color)',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className='flex items-center gap-2'>
                    {isActive && (
                      <span className='h-1 w-1 rounded-full bg-(--main-color)' />
                    )}
                    {category.name}
                  </span>
                  <span className='font-mono text-[10px] opacity-40 group-hover:opacity-100'>
                    {category.resourceCount}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default CategoryNav;
