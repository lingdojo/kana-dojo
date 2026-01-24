import { cn } from '@/shared/lib/utils';

/**
 * Loading skeleton for the Conjugator page
 *
 * Displays a skeleton UI while the page is loading.
 * Requirements: 5.3
 */
export default function ConjugateLoadingPage() {
  return (
    <div className='mx-auto flex w-full max-w-4xl animate-pulse flex-col gap-6'>
      {/* Header skeleton */}
      <div
        className={cn(
          'flex flex-col items-start gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:p-6',
          'border border-[var(--border-color)] bg-[var(--card-color)]',
        )}
      >
        {/* Icon skeleton */}
        <div className='h-12 w-12 rounded-xl bg-[var(--border-color)] sm:h-14 sm:w-14' />
        <div className='flex-1 space-y-2'>
          {/* Title skeleton */}
          <div className='h-8 w-64 rounded-lg bg-[var(--border-color)]' />
          {/* Description skeleton */}
          <div className='h-4 w-96 max-w-full rounded-lg bg-[var(--border-color)]' />
        </div>
      </div>

      {/* Main content area */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]'>
        {/* Left column - Input and Results */}
        <div className='flex flex-col gap-6'>
          {/* Input skeleton */}
          <div
            className={cn(
              'rounded-2xl p-4 sm:p-6',
              'border border-[var(--border-color)] bg-[var(--card-color)]',
            )}
          >
            <div className='h-12 w-full rounded-xl bg-[var(--border-color)]' />
            <div className='mt-4 flex gap-2'>
              <div className='h-10 w-24 rounded-lg bg-[var(--border-color)]' />
              <div className='h-10 w-24 rounded-lg bg-[var(--border-color)]' />
            </div>
          </div>

          {/* Results skeleton */}
          <div
            className={cn(
              'rounded-2xl p-4 sm:p-6',
              'border border-[var(--border-color)] bg-[var(--card-color)]',
            )}
          >
            {/* Verb info card skeleton */}
            <div className='mb-6 flex items-center gap-4'>
              <div className='h-16 w-16 rounded-xl bg-[var(--border-color)]' />
              <div className='space-y-2'>
                <div className='h-6 w-32 rounded-lg bg-[var(--border-color)]' />
                <div className='h-4 w-24 rounded-lg bg-[var(--border-color)]' />
              </div>
            </div>

            {/* Category cards skeleton */}
            <div className='space-y-4'>
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={cn(
                    'rounded-xl p-4',
                    'border border-[var(--border-color)] bg-[var(--background-color)]',
                  )}
                >
                  <div className='flex items-center justify-between'>
                    <div className='h-5 w-32 rounded-lg bg-[var(--border-color)]' />
                    <div className='h-5 w-5 rounded bg-[var(--border-color)]' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - History skeleton (desktop) */}
        <aside className='hidden lg:block'>
          <div
            className={cn(
              'rounded-2xl p-4',
              'border border-[var(--border-color)] bg-[var(--card-color)]',
            )}
          >
            <div className='mb-4 h-6 w-24 rounded-lg bg-[var(--border-color)]' />
            <div className='space-y-2'>
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className='h-10 w-full rounded-lg bg-[var(--border-color)]'
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
