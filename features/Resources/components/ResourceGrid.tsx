'use client';

import React, { useRef, useCallback } from 'react';
import { cn } from '@/shared/lib/utils';
import type { Resource } from '../types';
import { ResourceCard } from './ResourceCard';

// ============================================================================
// Types
// ============================================================================

export interface ResourceGridProps {
  /** Array of resources to display */
  resources: Resource[];
  /** Callback when a resource is selected */
  onResourceSelect?: (resource: Resource) => void;
  /** Whether the grid is in loading state */
  isLoading?: boolean;
  /** Number of skeleton cards to show when loading */
  skeletonCount?: number;
  /** Additional CSS classes */
  className?: string;
  /** ID for the grid element (for aria-controls) */
  id?: string;
}

// ============================================================================
// Skeleton Component
// ============================================================================

/**
 * Skeleton card for loading state (Editorial Row Style)
 */
function ResourceRowSkeleton() {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 px-2 py-8 sm:flex-row sm:items-center',
        'animate-pulse border-b border-(--border-color)',
      )}
      aria-hidden='true'
    >
      <div className='min-w-0 flex-1'>
        <div className='mb-2 flex items-center gap-3'>
          <div className='h-4 w-12 rounded bg-(--border-color)' />
          <div className='h-3 w-8 rounded bg-(--border-color)' />
        </div>
        <div className='mb-3 h-6 w-3/4 rounded bg-(--border-color)' />
        <div className='space-y-2'>
          <div className='h-4 w-full rounded bg-(--border-color)' />
          <div className='h-4 w-5/6 rounded bg-(--border-color)' />
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-4 sm:ml-auto'>
        <div className='h-5 w-16 rounded bg-(--border-color)' />
        <div className='h-5 w-14 rounded bg-(--border-color)' />
        <div className='h-10 w-10 rounded-full bg-(--border-color)' />
      </div>
    </div>
  );
}

// ============================================================================
// ResourceGrid Component (Editorial List Style)
// ============================================================================

/**
 * ResourceGrid displays a refined editorial list of resource rows.
 */
export function ResourceGrid({
  resources,
  onResourceSelect,
  isLoading = false,
  skeletonCount = 6,
  className,
  id = 'resource-grid',
}: ResourceGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      if (!gridRef.current) return;

      const items = gridRef.current.querySelectorAll<HTMLElement>(
        '[role="listitem"] [role="button"]',
      );
      const itemCount = items.length;
      if (itemCount === 0) return;

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = Math.min(currentIndex + 1, itemCount - 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = itemCount - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== currentIndex) {
        items[nextIndex]?.focus();
      }
    },
    [],
  );

  if (isLoading) {
    return (
      <div
        id={id}
        className={cn('flex flex-col', className)}
        role='list'
        aria-label='Loading resources'
        aria-busy='true'
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ResourceRowSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div
        id={id}
        className={cn(
          'flex flex-col items-center justify-center border-t border-(--border-color) py-24 text-center',
          className,
        )}
        role='status'
        aria-live='polite'
        aria-label='No resources found'
      >
        <p className='text-xl font-medium text-(--main-color)'>
          Empty Collections
        </p>
        <p className='mt-2 text-(--secondary-color)'>
          Refine your filters to discover specialized resources.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className='sr-only' aria-live='polite' aria-atomic='true'>
        {resources.length} {resources.length === 1 ? 'resource' : 'resources'}{' '}
        found
      </div>

      <div
        ref={gridRef}
        id={id}
        className={cn(
          'flex flex-col border-t border-(--border-color)',
          'transition-opacity duration-300 ease-out',
          className,
        )}
        role='list'
        aria-label={`${resources.length} resources`}
      >
        {resources.map((resource, index) => (
          <div key={resource.id} role='listitem'>
            <ResourceCard
              resource={resource}
              onSelect={onResourceSelect}
              onKeyDown={e => handleKeyDown(e, index)}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default ResourceGrid;
