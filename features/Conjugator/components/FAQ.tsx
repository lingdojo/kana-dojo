'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { CONJUGATOR_FAQ_ITEMS, type FAQItem } from '../lib/seo/structuredData';

interface FAQProps {
  /** Optional custom FAQ items (defaults to CONJUGATOR_FAQ_ITEMS) */
  items?: FAQItem[];
  /** Maximum number of items to display initially */
  initialDisplayCount?: number;
}

/**
 * FAQ - Comprehensive FAQ section for the conjugator page
 *
 * Features:
 * - Semantic HTML structure for accessibility and SEO
 * - Expandable/collapsible FAQ items
 * - 15+ comprehensive questions about Japanese verb conjugation
 * - Proper ARIA labels and roles
 *
 * Requirements: 13.6, 10.2
 */
export default function FAQ({
  items = CONJUGATOR_FAQ_ITEMS,
  initialDisplayCount = 15,
}: FAQProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const displayedItems = showAll ? items : items.slice(0, initialDisplayCount);
  const hasMoreItems = items.length > initialDisplayCount;

  const toggleItem = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedItems(new Set(displayedItems.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  return (
    <section
      className={cn(
        'mt-8 rounded-2xl',
        'border border-[var(--border-color)] bg-[var(--card-color)]',
        'p-6 sm:p-8',
      )}
      aria-labelledby='faq-heading'
      itemScope
      itemType='https://schema.org/FAQPage'
    >
      {/* Header */}
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <h2
          id='faq-heading'
          className='text-xl font-bold text-[var(--main-color)] sm:text-2xl'
        >
          Frequently Asked Questions
        </h2>

        {/* Expand/Collapse controls */}
        <div className='flex gap-2' role='group' aria-label='FAQ controls'>
          <button
            onClick={expandAll}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium',
              'border border-[var(--border-color)]',
              'text-[var(--secondary-color)]',
              'hover:bg-[var(--border-color)]/50',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--main-color)]',
            )}
            aria-label='Expand all FAQ items'
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium',
              'border border-[var(--border-color)]',
              'text-[var(--secondary-color)]',
              'hover:bg-[var(--border-color)]/50',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--main-color)]',
            )}
            aria-label='Collapse all FAQ items'
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* FAQ Items */}
      <div className='space-y-3' role='list' aria-label='FAQ items'>
        {displayedItems.map((item, index) => (
          <FAQItemComponent
            key={index}
            item={item}
            index={index}
            isExpanded={expandedItems.has(index)}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </div>

      {/* Show More/Less button */}
      {hasMoreItems && (
        <div className='mt-6 text-center'>
          <button
            onClick={() => setShowAll(!showAll)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium',
              'border border-[var(--main-color)]/30',
              'text-[var(--main-color)]',
              'hover:bg-[var(--main-color)]/10',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--main-color)]',
            )}
            aria-expanded={showAll}
          >
            {showAll
              ? 'Show Less'
              : `Show ${items.length - initialDisplayCount} More Questions`}
          </button>
        </div>
      )}
    </section>
  );
}

/**
 * Individual FAQ item component
 */
function FAQItemComponent({
  item,
  index,
  isExpanded,
  onToggle,
}: {
  item: FAQItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const answerId = `faq-answer-${index}`;

  return (
    <div
      className={cn(
        'rounded-xl',
        'border border-[var(--border-color)]',
        'overflow-hidden',
        'transition-colors duration-200',
        isExpanded && 'bg-[var(--background-color)]',
      )}
      itemScope
      itemProp='mainEntity'
      itemType='https://schema.org/Question'
      role='listitem'
    >
      {/* Question */}
      <button
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between gap-4 p-4',
          'text-left',
          'hover:bg-[var(--background-color)]',
          'transition-colors duration-200',
          'cursor-pointer',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--main-color)] focus-visible:ring-inset',
        )}
        aria-expanded={isExpanded}
        aria-controls={answerId}
      >
        <h3
          className='text-sm font-medium text-[var(--main-color)] sm:text-base'
          itemProp='name'
        >
          {item.question}
        </h3>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-[var(--secondary-color)]',
            'transition-transform duration-200',
            isExpanded && 'rotate-180',
          )}
          aria-hidden='true'
        />
      </button>

      {/* Answer */}
      {isExpanded && (
        <div
          id={answerId}
          className='border-t border-[var(--border-color)] px-4 py-4'
          itemScope
          itemProp='acceptedAnswer'
          itemType='https://schema.org/Answer'
          role='region'
          aria-label={`Answer to: ${item.question}`}
        >
          <p
            className='text-sm leading-relaxed text-[var(--secondary-color)]'
            itemProp='text'
          >
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}
