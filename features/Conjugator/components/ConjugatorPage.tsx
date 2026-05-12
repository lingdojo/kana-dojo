'use client';

import { Suspense, useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Languages, Share2, Check } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

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
 */
function ConjugatorPageContent({ locale: _locale = 'en' }: ConjugatorPageProps) {
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
    history,
    setInputText,
    conjugate,
    copyForm,
    deleteFromHistory,
    clearHistory,
    restoreFromHistory,
    initFromUrlParams,
  } = useConjugatorStore();

  // Handle URL parameters for shareable conjugations
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

  // Update URL when verb is conjugated
  useEffect(() => {
    if (!result) return;
    const currentVerb = searchParams.get('verb') || searchParams.get('v');
    const newVerb = result.verb.dictionaryForm;
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

  // Handle share button click
  const handleShare = useCallback(async () => {
    if (!result) return;
    const shareUrl = `${window.location.origin}${pathname}?verb=${encodeURIComponent(result.verb.dictionaryForm)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareButtonState('copied');
      setTimeout(() => setShareButtonState('idle'), 2000);
    } catch {
      setShareButtonState('error');
      setTimeout(() => setShareButtonState('idle'), 2000);
    }
  }, [result, pathname]);

  return (
    <div
      className='mx-auto flex w-full max-w-7xl flex-col px-4 py-8 sm:px-10 sm:py-12'
      role='main'
      aria-label='Japanese verb conjugator'
    >
      <header className='relative mb-8 flex flex-col items-start'>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-2 text-[10px] font-bold tracking-widest text-(--secondary-color)/40 uppercase'>
            <Languages className='h-3 w-3' />
            <span>Japanese Conjugator</span>
          </div>

          <div className='flex flex-col gap-1'>
            <h1 className='text-3xl font-black tracking-tight text-(--main-color) sm:text-4xl'>
              Japanese Verb Conjugator
            </h1>
            <p className='max-w-xl text-base font-medium text-(--secondary-color)/70'>
              Enter any Japanese verb to get all possible conjugation forms.
            </p>
          </div>
        </div>

        {result && (
          <div className='mt-6'>
            <button
              onClick={handleShare}
              className={cn(
                'flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase transition-colors',
                shareButtonState === 'copied'
                  ? 'text-green-600'
                  : 'text-(--main-color)',
              )}
              aria-label='Share results'
            >
              <div className='h-1 w-1 rounded-full bg-current' />
              <span>
                {shareButtonState === 'copied' ? 'Link Copied' : 'Share Result'}
              </span>
              <Share2
                className={cn(
                  'h-3 w-3 opacity-40',
                  shareButtonState === 'copied' && 'hidden',
                )}
              />
              {shareButtonState === 'copied' && <Check className='h-3 w-3' />}
            </button>
          </div>
        )}
      </header>

      <div className='relative flex flex-col lg:flex-row lg:items-start lg:gap-12'>
        <main className='flex flex-1 flex-col gap-8'>
          <section className='w-full'>
            <ConjugatorInput
              value={inputText}
              onChange={setInputText}
              onConjugate={handleConjugate}
              isLoading={isLoading}
              error={error}
            />
          </section>

          <section className='min-h-[300px]'>
            <ConjugationResults
              result={result}
              isLoading={isLoading}
              onCopyForm={copyForm}
            />
          </section>
        </main>

        <aside
          className='shrink-0 pt-12 lg:sticky lg:top-12 lg:w-[280px] lg:pt-0'
          aria-label='Conjugation history'
        >
          <ConjugationHistory
            entries={history}
            onSelect={restoreFromHistory}
            onDelete={deleteFromHistory}
            onClearAll={clearHistory}
          />
        </aside>
      </div>
    </div>
  );
}

export default function ConjugatorPage(props: ConjugatorPageProps) {
  return (
    <Suspense fallback={null}>
      <ConjugatorPageContent {...props} />
    </Suspense>
  );
}

