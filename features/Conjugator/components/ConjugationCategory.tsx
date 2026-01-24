'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type {
  ConjugationCategory as CategoryType,
  ConjugationForm,
} from '../types';

interface ConjugationCategoryProps {
  /** Category identifier */
  category: CategoryType;
  /** Forms in this category */
  forms: ConjugationForm[];
  /** Whether the category is expanded */
  isExpanded: boolean;
  /** Callback when category is toggled */
  onToggle: () => void;
  /** Callback when a form is copied */
  onCopy: (form: ConjugationForm) => void;
}

/**
 * ConjugationCategory - Collapsible card displaying conjugation forms by category
 *
 * Features:
 * - Collapsible card with smooth animation
 * - Category name in English and Japanese
 * - Forms with kanji, hiragana, romaji
 * - Copy button for each form
 * - Hover/focus highlighting
 * - Proper ARIA labels and roles
 *
 * Requirements: 5.2, 5.3, 5.7, 6.1, 10.2
 */
export default function ConjugationCategory({
  category,
  forms,
  isExpanded,
  onToggle,
  onCopy,
}: ConjugationCategoryProps) {
  const categoryInfo = getCategoryInfo(category);

  if (forms.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl',
        'border border-[var(--border-color)]',
        'bg-[var(--card-color)]',
        'transition-all duration-200',
      )}
      role='listitem'
    >
      {/* Category header - clickable to toggle */}
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center justify-between px-4 py-3',
          'bg-[var(--background-color)]',
          'hover:bg-[var(--border-color)]/50',
          'transition-colors duration-200',
          'cursor-pointer',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--main-color)] focus-visible:ring-inset',
        )}
        aria-expanded={isExpanded}
        aria-controls={`category-${category}`}
        aria-label={`${categoryInfo.name} (${categoryInfo.nameJa}), ${forms.length} form${forms.length !== 1 ? 's' : ''}. ${isExpanded ? 'Click to collapse' : 'Click to expand'}`}
      >
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              'text-lg',
              categoryInfo.bgClass,
            )}
            aria-hidden='true'
          >
            {categoryInfo.icon}
          </div>
          <div className='text-left'>
            <h4 className='text-sm font-semibold text-[var(--main-color)]'>
              {categoryInfo.name}
            </h4>
            <p className='text-xs text-[var(--secondary-color)]'>
              {categoryInfo.nameJa} · {forms.length} form
              {forms.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span
            className='text-xs text-[var(--secondary-color)]'
            aria-hidden='true'
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </span>
          {isExpanded ? (
            <ChevronUp
              className='h-4 w-4 text-[var(--secondary-color)]'
              aria-hidden='true'
            />
          ) : (
            <ChevronDown
              className='h-4 w-4 text-[var(--secondary-color)]'
              aria-hidden='true'
            />
          )}
        </div>
      </button>

      {/* Forms list - animated expand/collapse */}
      <div
        id={`category-${category}`}
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
        role='region'
        aria-label={`${categoryInfo.name} conjugation forms`}
        hidden={!isExpanded}
      >
        <div className='overflow-hidden'>
          <div
            className='flex flex-col divide-y divide-[var(--border-color)]'
            role='list'
            aria-label={`${forms.length} ${categoryInfo.name.toLowerCase()} forms`}
          >
            {forms.map(form => (
              <FormRow key={form.id} form={form} onCopy={onCopy} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual form row component
 */
function FormRow({
  form,
  onCopy,
}: {
  form: ConjugationForm;
  onCopy: (form: ConjugationForm) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    onCopy(form);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [form, onCopy]);

  return (
    <div
      className={cn(
        'group flex items-center justify-between px-4 py-3',
        'hover:bg-[var(--background-color)]',
        'transition-colors duration-150',
        'focus-within:bg-[var(--background-color)]',
      )}
      role='listitem'
    >
      {/* Form info */}
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <span
            className='font-japanese text-base font-semibold text-[var(--main-color)]'
            lang='ja'
          >
            {form.kanji}
          </span>
          {form.kanji !== form.hiragana && (
            <span
              className='font-japanese text-sm text-[var(--secondary-color)]'
              lang='ja'
              aria-label={`Reading: ${form.hiragana}`}
            >
              ({form.hiragana})
            </span>
          )}
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-xs text-[var(--secondary-color)]'>
            {form.name}
          </span>
          <span
            className='text-xs text-[var(--secondary-color)]/60'
            aria-hidden='true'
          >
            ·
          </span>
          <span
            className='font-mono text-xs text-[var(--secondary-color)]/80'
            aria-label={`Romaji: ${form.romaji}`}
          >
            {form.romaji}
          </span>
          {form.formality === 'polite' && (
            <>
              <span
                className='text-xs text-[var(--secondary-color)]/60'
                aria-hidden='true'
              >
                ·
              </span>
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-medium',
                  'bg-blue-500/10 text-blue-500',
                )}
                role='note'
              >
                Polite
              </span>
            </>
          )}
        </div>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          'text-[var(--secondary-color)]',
          'hover:bg-[var(--border-color)] hover:text-[var(--main-color)]',
          'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100',
          'transition-all duration-150',
          'focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--main-color)] focus-visible:ring-offset-2',
          copied && 'text-green-500 hover:text-green-500',
        )}
        aria-label={
          copied
            ? `${form.name} copied to clipboard`
            : `Copy ${form.name}: ${form.kanji}`
        }
        aria-live='polite'
        tabIndex={0}
      >
        {copied ? (
          <Check className='h-4 w-4' aria-hidden='true' />
        ) : (
          <Copy className='h-4 w-4' aria-hidden='true' />
        )}
      </button>
    </div>
  );
}

/**
 * Get display information for a category
 */
function getCategoryInfo(category: CategoryType): {
  name: string;
  nameJa: string;
  icon: string;
  bgClass: string;
} {
  const categories: Record<
    CategoryType,
    { name: string; nameJa: string; icon: string; bgClass: string }
  > = {
    basic: {
      name: 'Basic Forms',
      nameJa: '基本形',
      icon: '📝',
      bgClass: 'bg-blue-500/10',
    },
    polite: {
      name: 'Polite Forms',
      nameJa: '丁寧形',
      icon: '🎩',
      bgClass: 'bg-purple-500/10',
    },
    negative: {
      name: 'Negative Forms',
      nameJa: '否定形',
      icon: '❌',
      bgClass: 'bg-red-500/10',
    },
    past: {
      name: 'Past Forms',
      nameJa: '過去形',
      icon: '⏪',
      bgClass: 'bg-amber-500/10',
    },
    volitional: {
      name: 'Volitional Forms',
      nameJa: '意向形',
      icon: '💭',
      bgClass: 'bg-cyan-500/10',
    },
    potential: {
      name: 'Potential Forms',
      nameJa: '可能形',
      icon: '💪',
      bgClass: 'bg-green-500/10',
    },
    passive: {
      name: 'Passive Forms',
      nameJa: '受身形',
      icon: '🎯',
      bgClass: 'bg-indigo-500/10',
    },
    causative: {
      name: 'Causative Forms',
      nameJa: '使役形',
      icon: '👉',
      bgClass: 'bg-orange-500/10',
    },
    'causative-passive': {
      name: 'Causative-Passive',
      nameJa: '使役受身形',
      icon: '🔄',
      bgClass: 'bg-pink-500/10',
    },
    imperative: {
      name: 'Imperative Forms',
      nameJa: '命令形',
      icon: '⚡',
      bgClass: 'bg-yellow-500/10',
    },
    conditional: {
      name: 'Conditional Forms',
      nameJa: '条件形',
      icon: '🔀',
      bgClass: 'bg-teal-500/10',
    },
    'tai-form': {
      name: 'Desire Forms',
      nameJa: 'たい形',
      icon: '❤️',
      bgClass: 'bg-rose-500/10',
    },
    progressive: {
      name: 'Progressive Forms',
      nameJa: '進行形',
      icon: '🔄',
      bgClass: 'bg-sky-500/10',
    },
    honorific: {
      name: 'Honorific Forms',
      nameJa: '敬語',
      icon: '👑',
      bgClass: 'bg-violet-500/10',
    },
  };

  return (
    categories[category] || {
      name: category,
      nameJa: category,
      icon: '📋',
      bgClass: 'bg-gray-500/10',
    }
  );
}
