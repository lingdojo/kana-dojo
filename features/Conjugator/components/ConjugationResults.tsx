'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Expand, Minimize2, Copy, Check, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import type {
  ConjugationResult,
  ConjugationCategory as CategoryType,
  ConjugationForm,
} from '../types';
import { ALL_CONJUGATION_CATEGORIES } from '../types';
import VerbInfoCard from './VerbInfoCard';
import ConjugationCategory from './ConjugationCategory';

interface ConjugationResultsProps {
  /** Conjugation result to display */
  result: ConjugationResult | null;
  /** Whether conjugation is in progress */
  isLoading: boolean;
  /** Currently expanded categories */
  expandedCategories: CategoryType[];
  /** Callback to toggle a category */
  onToggleCategory: (category: CategoryType) => void;
  /** Callback to expand all categories */
  onExpandAll: () => void;
  /** Callback to collapse all categories */
  onCollapseAll: () => void;
  /** Callback to copy a single form */
  onCopyForm: (form: ConjugationForm) => void;
  /** Callback to copy all forms */
  onCopyAll: () => void;
}

/**
 * ConjugationResults - Displays all conjugated forms organized by category
 *
 * Features:
 * - VerbInfoCard showing verb type and stem
 * - All ConjugationCategory components
 * - Expand all / collapse all buttons
 * - Copy all button
 * - aria-live region for dynamic content updates
 *
 * Requirements: 5.2, 6.2, 10.2
 */
export default function ConjugationResults({
  result,
  isLoading,
  expandedCategories,
  onToggleCategory,
  onExpandAll,
  onCollapseAll,
  onCopyForm,
  onCopyAll,
}: ConjugationResultsProps) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const previousResultRef = useRef<ConjugationResult | null>(null);

  // Group forms by category
  const formsByCategory = useMemo(() => {
    if (!result) return new Map<CategoryType, ConjugationForm[]>();

    const grouped = new Map<CategoryType, ConjugationForm[]>();
    for (const form of result.forms) {
      const existing = grouped.get(form.category) || [];
      existing.push(form);
      grouped.set(form.category, existing);
    }
    return grouped;
  }, [result]);

  // Get categories that have forms
  const categoriesWithForms = useMemo(() => {
    return ALL_CONJUGATION_CATEGORIES.filter(
      cat => (formsByCategory.get(cat)?.length ?? 0) > 0,
    );
  }, [formsByCategory]);

  // Check if all categories are expanded
  const allExpanded = useMemo(() => {
    return categoriesWithForms.every(cat => expandedCategories.includes(cat));
  }, [categoriesWithForms, expandedCategories]);

  // Update status message when result changes for screen readers
  useEffect(() => {
    if (result && result !== previousResultRef.current) {
      setStatusMessage(
        `Conjugation complete for ${result.verb.dictionaryForm}. ${result.forms.length} forms available across ${categoriesWithForms.length} categories.`,
      );
      previousResultRef.current = result;
    } else if (isLoading) {
      setStatusMessage('Conjugating verb, please wait...');
    }
  }, [result, isLoading, categoriesWithForms.length]);

  // Handle copy all with feedback
  const handleCopyAll = useCallback(() => {
    onCopyAll();
    setCopiedAll(true);
    setStatusMessage('All conjugation forms copied to clipboard.');
    setTimeout(() => setCopiedAll(false), 2000);
  }, [onCopyAll]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl py-16',
          'border border-[var(--border-color)] bg-[var(--card-color)]',
        )}
      >
        <Loader2 className='h-10 w-10 animate-spin text-[var(--main-color)]' />
        <p className='mt-4 text-sm text-[var(--secondary-color)]'>
          Conjugating verb...
        </p>
      </div>
    );
  }

  // No result state
  if (!result) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl py-16',
          'border border-[var(--border-color)] bg-[var(--card-color)]',
          'text-[var(--secondary-color)]',
        )}
      >
        <div
          className={cn(
            'mb-4 rounded-full p-4',
            'bg-[var(--secondary-color)]/10',
          )}
        >
          <span className='text-4xl'>📚</span>
        </div>
        <p className='text-base font-medium'>
          Enter a verb to see conjugations
        </p>
        <p className='mt-1 text-sm opacity-70'>
          Try verbs like 食べる, 行く, or する
        </p>
      </div>
    );
  }

  return (
    <div
      className='flex flex-col gap-4'
      role='region'
      aria-label='Conjugation results'
      aria-busy={isLoading}
    >
      {/* Screen reader status announcements */}
      <div
        className='sr-only'
        role='status'
        aria-live='polite'
        aria-atomic='true'
      >
        {statusMessage}
      </div>

      {/* Verb info card */}
      <VerbInfoCard verb={result.verb} />

      {/* Action buttons */}
      <div
        className='flex items-center justify-between gap-2'
        role='toolbar'
        aria-label='Conjugation result actions'
      >
        <div className='flex items-center gap-2'>
          <ActionButton
            onClick={allExpanded ? onCollapseAll : onExpandAll}
            colorScheme='secondary'
            borderColorScheme='secondary'
            borderRadius='xl'
            borderBottomThickness={6}
            className='!w-auto px-3 text-sm'
            aria-label={
              allExpanded ? 'Collapse all categories' : 'Expand all categories'
            }
          >
            {allExpanded ? (
              <>
                <Minimize2 className='h-4 w-4' aria-hidden='true' />
                <span className='hidden sm:inline'>Collapse All</span>
              </>
            ) : (
              <>
                <Expand className='h-4 w-4' aria-hidden='true' />
                <span className='hidden sm:inline'>Expand All</span>
              </>
            )}
          </ActionButton>
        </div>

        <ActionButton
          onClick={handleCopyAll}
          colorScheme='main'
          borderColorScheme='main'
          borderRadius='xl'
          borderBottomThickness={6}
          className='!w-auto px-3 text-sm'
          aria-label={
            copiedAll
              ? 'All forms copied to clipboard'
              : 'Copy all conjugation forms to clipboard'
          }
        >
          {copiedAll ? (
            <>
              <Check className='h-4 w-4' aria-hidden='true' />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className='h-4 w-4' aria-hidden='true' />
              <span className='hidden sm:inline'>Copy All</span>
            </>
          )}
        </ActionButton>
      </div>

      {/* Category cards */}
      <div
        className='flex flex-col gap-3'
        role='list'
        aria-label='Conjugation categories'
      >
        {categoriesWithForms.map(category => (
          <ConjugationCategory
            key={category}
            category={category}
            forms={formsByCategory.get(category) || []}
            isExpanded={expandedCategories.includes(category)}
            onToggle={() => onToggleCategory(category)}
            onCopy={onCopyForm}
          />
        ))}
      </div>

      {/* Form count summary */}
      <div className='text-center text-xs text-[var(--secondary-color)]'>
        {result.forms.length} conjugation forms across{' '}
        {categoriesWithForms.length} categories
      </div>
    </div>
  );
}
