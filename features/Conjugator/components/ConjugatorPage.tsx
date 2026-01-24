'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Languages, Share2, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

import useConjugatorStore from '../store/useConjugatorStore';
import ConjugatorInput from './ConjugatorInput';
import ConjugationResults from './ConjugationResults';
import ConjugationHistory from './ConjugationHistory';

interface ConjugatorPageProps {
  /** Current locale for i18n */
  locale?: string;
}

/**
 * ConjugatorPage - Main page component for the Japanese Verb Conjugator
 *
 * Features:
 * - Composes all conjugator components
 * - Responsive layout (mobile-first)
 * - ARIA labels and keyboard navigation
 * - URL parameter handling for shareable links
 * - URL state synchronization
 * - aria-live regions for dynamic content updates
 *
 * Requirements: 5.1, 5.4, 5.5, 5.6, 10.1, 10.2, 10.3, 12.1, 12.2, 12.3
 */
export default function ConjugatorPage({ locale = 'en' }: ConjugatorPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initializedFromUrl = useRef(false);
  const [shareButtonState, setShareButtonState] = useState<
    'idle' | 'copied' | 'error'
  >('idle');

  const {
    inputText,
    result,
    isLoading,
    error,
    expandedCategories,
    history,
    setInputText,
    conjugate,
    toggleCategory,
    expandAllCategories,
    collapseAllCategories,
    copyForm,
    copyAllForms,
    deleteFromHistory,
    clearHistory,
    restoreFromHistory,
    initFromUrlParams,
  } = useConjugatorStore();

  // Handle URL parameters for shareable conjugations (Requirements: 12.2)
  useEffect(() => {
    if (initializedFromUrl.current) return;

    const verb = searchParams.get('verb') || searchParams.get('v');

    if (verb) {
      const hasParams = initFromUrlParams({ verb });
      if (hasParams) {
        initializedFromUrl.current = true;
      }
    }
  }, [searchParams, initFromUrlParams]);

  // Update URL when verb is conjugated (Requirements: 12.1)
  useEffect(() => {
    if (!result) return;

    const currentVerb = searchParams.get('verb') || searchParams.get('v');
    const newVerb = result.verb.dictionaryForm;

    // Only update URL if the verb has changed
    if (currentVerb !== newVerb) {
      const newUrl = `${pathname}?verb=${encodeURIComponent(newVerb)}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [result, searchParams, pathname, router]);

  // Handle conjugate action
  const handleConjugate = useCallback(() => {
    if (inputText.trim().length > 0 && !isLoading) {
      conjugate();
    }
  }, [inputText, isLoading, conjugate]);

  // Handle share button click (Requirements: 12.3)
  const handleShare = useCallback(async () => {
    if (!result) return;

    const shareUrl = `${window.location.origin}${pathname}?verb=${encodeURIComponent(result.verb.dictionaryForm)}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareButtonState('copied');
      setTimeout(() => setShareButtonState('idle'), 2000);
    } catch {
      // Fallback: try using the Web Share API
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${result.verb.dictionaryForm} Conjugation - KanaDojo`,
            text: `Check out the conjugation of ${result.verb.dictionaryForm} (${result.verb.romaji})`,
            url: shareUrl,
          });
        } catch {
          setShareButtonState('error');
          setTimeout(() => setShareButtonState('idle'), 2000);
        }
      } else {
        setShareButtonState('error');
        setTimeout(() => setShareButtonState('idle'), 2000);
      }
    }
  }, [result, pathname]);

  return (
    <div
      className='mx-auto flex w-full max-w-4xl flex-col gap-6'
      role='main'
      aria-label='Japanese verb conjugator'
    >
      {/* Header with SEO-optimized content */}
      <header
        className={cn(
          'flex flex-col items-start gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:p-6',
          'border border-[var(--border-color)] bg-gradient-to-r from-[var(--card-color)] to-[var(--background-color)]',
        )}
      >
        <div
          className={cn(
            'rounded-xl border border-[var(--main-color)]/20 bg-[var(--main-color)]/10 p-2.5 sm:p-3',
          )}
          aria-hidden='true'
        >
          <Languages className='h-6 w-6 text-[var(--main-color)] sm:h-8 sm:w-8' />
        </div>
        <div className='flex-1'>
          <h1 className='text-2xl font-bold text-[var(--main-color)] sm:text-3xl'>
            Japanese Verb Conjugator
          </h1>
          <p className='mt-1 text-sm text-[var(--secondary-color)] sm:text-base'>
            <strong>Conjugate any Japanese verb</strong> instantly. Get all
            forms including te-form, masu-form, potential, passive, causative,
            and more.
          </p>
        </div>
        {/* Share button - Requirements: 12.3 */}
        {result && (
          <button
            onClick={handleShare}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all',
              'border border-[var(--border-color)] bg-[var(--card-color)]',
              'hover:border-[var(--main-color)]/50 hover:bg-[var(--main-color)]/10',
              'focus:ring-2 focus:ring-[var(--main-color)]/50 focus:outline-none',
              shareButtonState === 'copied' &&
                'border-green-500/50 bg-green-500/10 text-green-600',
              shareButtonState === 'error' &&
                'border-red-500/50 bg-red-500/10 text-red-600',
            )}
            aria-label={
              shareButtonState === 'copied'
                ? 'Link copied to clipboard'
                : shareButtonState === 'error'
                  ? 'Failed to copy link'
                  : `Share conjugation of ${result.verb.dictionaryForm}`
            }
            aria-live='polite'
          >
            {shareButtonState === 'copied' ? (
              <>
                <Check className='h-4 w-4' aria-hidden='true' />
                <span className='hidden sm:inline'>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className='h-4 w-4' aria-hidden='true' />
                <span className='hidden sm:inline'>Share</span>
              </>
            )}
          </button>
        )}
      </header>

      {/* Main content area */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]'>
        {/* Left column - Input and Results */}
        <div className='flex flex-col gap-6'>
          {/* Input section */}
          <ConjugatorInput
            value={inputText}
            onChange={setInputText}
            onConjugate={handleConjugate}
            isLoading={isLoading}
            error={error}
          />

          {/* Results section */}
          <ConjugationResults
            result={result}
            isLoading={isLoading}
            expandedCategories={expandedCategories}
            onToggleCategory={toggleCategory}
            onExpandAll={expandAllCategories}
            onCollapseAll={collapseAllCategories}
            onCopyForm={copyForm}
            onCopyAll={copyAllForms}
          />
        </div>

        {/* Right column - History (desktop) */}
        <aside
          className='hidden lg:block'
          aria-label='Conjugation history sidebar'
        >
          <div className='sticky top-4'>
            <ConjugationHistory
              entries={history}
              onSelect={restoreFromHistory}
              onDelete={deleteFromHistory}
              onClearAll={clearHistory}
            />
          </div>
        </aside>
      </div>

      {/* History section (mobile) */}
      <aside className='lg:hidden' aria-label='Conjugation history'>
        <ConjugationHistory
          entries={history}
          onSelect={restoreFromHistory}
          onDelete={deleteFromHistory}
          onClearAll={clearHistory}
        />
      </aside>

      {/* Keyboard shortcuts info (screen reader only) */}
      <div className='sr-only' aria-live='polite'>
        <p>
          Keyboard shortcuts: Press Enter in the input field to conjugate. Press
          Escape to clear the input. Use Tab to navigate between elements.
        </p>
      </div>
    </div>
  );
}
