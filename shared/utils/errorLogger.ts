import { ErrorInfo } from 'react';

/**
 * Error log structure for tracking
 */
interface ErrorLog {
  timestamp: Date;
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent: string;
  url: string;
  locale: string;
  additionalInfo?: Record<string, unknown>;
}

/**
 * Log error to console and localStorage for debugging
 * In the future, this can send errors to a service like Sentry
 */
export function logError(
  error: Error,
  errorInfo?: ErrorInfo,
  additionalInfo?: Record<string, unknown>,
) {
  const errorLog: ErrorLog = {
    timestamp: new Date(),
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack ?? undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    url: typeof window !== 'undefined' ? window.location.href : 'N/A',
    locale: typeof navigator !== 'undefined' ? navigator.language : 'en',
    additionalInfo,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🔴 Error Logged');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Additional Info:', additionalInfo);
    console.error('Full Log:', errorLog);
    console.groupEnd();
  }

  // Save to localStorage for debugging (keep last 10 errors)
  try {
    const savedErrors = localStorage.getItem('kanadojo_error_logs');
    const errorLogs: ErrorLog[] = savedErrors ? JSON.parse(savedErrors) : [];

    // Add new error and keep only last 10
    errorLogs.unshift(errorLog);
    const trimmedLogs = errorLogs.slice(0, 10);

    localStorage.setItem('kanadojo_error_logs', JSON.stringify(trimmedLogs));
  } catch (storageError) {
    // Ignore localStorage errors
    console.warn('Could not save error to localStorage:', storageError);
  }

  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTrackingService(errorLog);
  // }
}

/**
 * Get saved error logs from localStorage
 */
export function getErrorLogs(): ErrorLog[] {
  try {
    const savedErrors = localStorage.getItem('kanadojo_error_logs');
    return savedErrors ? JSON.parse(savedErrors) : [];
  } catch {
    return [];
  }
}

/**
 * Clear error logs from localStorage
 */
export function clearErrorLogs(): void {
  try {
    localStorage.removeItem('kanadojo_error_logs');
  } catch (error) {
    console.warn('Could not clear error logs:', error);
  }
}

/**
 * Placeholder for future error tracking service integration
 */
// function sendToErrorTrackingService(errorLog: ErrorLog): void {
//   // Example: Sentry.captureException(errorLog);
//   // Example: LogRocket.captureException(errorLog);
// }
