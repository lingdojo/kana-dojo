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
  type = 'global' 
}: ErrorFallbackProps) {
  // Determine title and description based on error type
  const getErrorContent = () => {
    switch (type) {
      case 'game':
        return {
          title: 'Game Error',
          description: 'Something went wrong with the game. Don\'t worry, your progress is safe!',
          actions: true,
        };
      case 'component':
        return {
          title: 'Component Error',
          description: 'This component encountered an error. Try refreshing the page.',
          actions: true,
        };
      default:
        return {
          title: 'Oops! Something went wrong',
          description: 'We encountered an unexpected error. Please try reloading the page.',
          actions: true,
        };
    }
  };

  const content = getErrorContent();
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
        </div>

        {/* Error Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--secondary-color)]">
            {content.title}
          </h1>
          <p className="text-[var(--muted-color)]">
            {content.description}
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {isDevelopment && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 text-left">
            <p className="text-sm font-mono text-red-500 break-all">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-[var(--muted-color)] cursor-pointer hover:text-[var(--secondary-color)]">
                  Stack trace
                </summary>
                <pre className="text-xs mt-2 text-[var(--muted-color)] overflow-x-auto">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {content.actions && (
          <div className="space-y-3">
            {resetErrorBoundary && (
              <Button
                onClick={resetErrorBoundary}
                className="w-full bg-[var(--main-color)] hover:bg-[var(--main-color)]/90"
              >
                <RefreshCw size={16} className="mr-2" />
                {type === 'game' ? 'Restart Game' : 'Try Again'}
              </Button>
            )}
            
            {type === 'global' && (
              <>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Reload Page
                </Button>
                
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full">
                    <Home size={16} className="mr-2" />
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
