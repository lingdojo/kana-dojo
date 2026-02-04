'use client';

import React, { useRef, useId } from 'react';
import { cn } from '@/shared/lib/utils';
import { Search, X } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Number of results found (optional) */
  resultCount?: number;
  /** Additional CSS classes */
  className?: string;
  /** ID for the search input (for aria-controls) */
  id?: string;
}

// ============================================================================
// SearchBar Component (Editorial Style)
// ============================================================================

/**
 * SearchBar provides a minimalist premium search input.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Search compendium...',
  resultCount,
  className,
  id,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id || `search-input-${generatedId}`;
  const resultsId = `${inputId}-results`;

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && value.length > 0) {
      e.preventDefault();
      handleClear();
    }
  };

  return (
    <div className={cn('group relative', className)} role='search'>
      {/* Search Icon */}
      <Search
        size={20}
        className='absolute top-1/2 left-0 -translate-y-1/2 text-(--main-color) opacity-30 transition-opacity group-focus-within:opacity-100'
        aria-hidden='true'
      />

      {/* Input */}
      <input
        ref={inputRef}
        id={inputId}
        type='search'
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full bg-transparent',
          'py-4 pr-12 pl-8 text-lg font-medium text-(--main-color) md:text-xl',
          'placeholder:text-(--secondary-color) placeholder:opacity-40',
          'transition-all duration-300',
          'focus:outline-none',
        )}
        aria-label='Search resources'
        aria-describedby={value.length > 0 ? resultsId : undefined}
        aria-controls='resource-grid'
      />

      {/* Underline Animation */}
      <div className='absolute bottom-0 left-0 h-px w-full bg-(--border-color) transition-colors duration-300 group-focus-within:bg-(--main-color)' />

      {/* Right side: Result count and Clear button */}
      <div className='absolute top-1/2 right-0 flex -translate-y-1/2 items-center gap-4'>
        {/* Result Count */}
        {resultCount !== undefined && value.length > 0 && (
          <span
            id={resultsId}
            className='font-mono text-xs tracking-widest text-(--secondary-color) uppercase opacity-60'
            aria-live='polite'
            aria-atomic='true'
          >
            {resultCount} found
          </span>
        )}

        {/* Clear Button */}
        {value.length > 0 && (
          <button
            type='button'
            onClick={handleClear}
            className={cn(
              'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full',
              'text-(--secondary-color) transition-all',
              'hover:bg-(--main-color) hover:text-(--background-color)',
            )}
            aria-label='Clear search'
          >
            <X size={16} aria-hidden='true' />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
