'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import type { Heading } from '../types/blog';

interface TableOfContentsProps {
  /** Array of headings extracted from the blog post */
  headings: Heading[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * TableOfContents Component
 * Renders a nested list of heading links with smooth scroll behavior.
 */
export function TableOfContents({ headings, className }: TableOfContentsProps) {
  if (headings.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL hash without scrolling
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <nav
      className={cn('space-y-2', className)}
      aria-label='Table of contents'
      data-testid='table-of-contents'
    >
      <h2 className='mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--main-color)]'>
        On this page
      </h2>
      <ul className='space-y-1' data-testid='toc-list'>
        {headings.map(heading => (
          <li
            key={heading.id}
            className={cn(
              'text-sm',
              heading.level === 2 && 'ml-0',
              heading.level === 3 && 'ml-4',
              heading.level === 4 && 'ml-8'
            )}
            data-testid={`toc-item-${heading.id}`}
          >
            <a
              href={`#${heading.id}`}
              onClick={e => handleClick(e, heading.id)}
              className='block py-1 text-[var(--secondary-color)] transition-colors hover:text-[var(--main-color)]'
              data-testid={`toc-link-${heading.id}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TableOfContents;
