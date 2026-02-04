'use client';

import { Button } from '@/shared/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from '@/core/i18n/routing';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  type?: 'game' | 'global' | 'component';
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  type = 'global',
}: ErrorFallbackProps) {
  // Determine title and description based on error type
  const getErrorContent = () => {
    switch (type) {
      case 'game':
        return {
          title: 'Game Error',
          description:
            "Something went wrong with the game. Don't worry, your progress is safe!",
          actions: true,
        };
      case 'component':
        return {
          title: 'Component Error',
          description:
            'This component encountered an error. Try refreshing the page.',
          actions: true,
        };
      default:
        return {
          title: 'Oops! Something went wrong',
          description:
            'We encountered an unexpected error. Please try reloading the page.',
          actions: true,
        };
    }
  };

  const content = getErrorContent();
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className='flex min-h-[400px] items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-6 text-center'>
        {/* Error Icon */}
        <div className='flex justify-center'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10'>
            <AlertTriangle size={48} className='text-red-500' />
          </div>
        </div>

        {/* Error Title */}
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold text-(--secondary-color)'>
            {content.title}
          </h1>
          <p className='text-(--muted-color)'>{content.description}</p>
        </div>

        {/* Error Details (Development Only) */}
        {isDevelopment && (
          <div className='rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-left'>
            <p className='font-mono text-sm break-all text-red-500'>
              {error.message}
            </p>
            {error.stack && (
              <details className='mt-2'>
                <summary className='cursor-pointer text-xs text-(--muted-color) hover:text-(--secondary-color)'>
                  Stack trace
                </summary>
                <pre className='mt-2 overflow-x-auto text-xs text-(--muted-color)'>
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {content.actions && (
          <div className='space-y-3'>
            {resetErrorBoundary && (
              <Button
                onClick={resetErrorBoundary}
                className='w-full bg-(--main-color) hover:bg-(--main-color)/90'
              >
                <RefreshCw size={16} className='mr-2' />
                {type === 'game' ? 'Restart Game' : 'Try Again'}
              </Button>
            )}

            {type === 'global' && (
              <>
                <Button
                  onClick={() => window.location.reload()}
                  variant='outline'
                  className='w-full'
                >
                  <RefreshCw size={16} className='mr-2' />
                  Reload Page
                </Button>

                <Link href='/' className='block'>
                  <Button variant='outline' className='w-full'>
                    <Home size={16} className='mr-2' />
                    Go to Home
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
