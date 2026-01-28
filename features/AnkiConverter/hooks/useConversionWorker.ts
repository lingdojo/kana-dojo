/**
 * useConversionWorker Hook
 *
 * React hook for converting Anki files using a Web Worker.
 * Provides progress tracking, error handling, and memory cleanup.
 *
 * @module features/AnkiConverter/hooks/useConversionWorker
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  ConversionOptions,
  ConversionResult,
  ProgressEvent,
} from '../types';
import { ConversionError, ErrorCode } from '../types';
import {
  getWorkerManager,
  type ConversionCallbacks,
} from '../lib/worker/workerManager';
import { createConversionPipeline } from '../lib/conversionPipeline';

/**
 * Conversion state
 */
export interface ConversionState {
  /** Whether a conversion is in progress */
  isConverting: boolean;
  /** Current progress (0-100) */
  progress: number;
  /** Current stage of conversion */
  stage: string;
  /** Progress message */
  message: string;
  /** Conversion result (when complete) */
  result: ConversionResult | null;
  /** Error (if conversion failed) */
  error: ConversionError | null;
}

/**
 * Hook return type
 */
export interface UseConversionWorkerReturn {
  /** Current conversion state */
  state: ConversionState;
  /** Start a conversion */
  convert: (file: File, options?: ConversionOptions) => Promise<void>;
  /** Reset state for a new conversion */
  reset: () => void;
  /** Whether Web Workers are supported */
  isWorkerSupported: boolean;
}

/**
 * Initial state
 */
const initialState: ConversionState = {
  isConverting: false,
  progress: 0,
  stage: '',
  message: '',
  result: null,
  error: null,
};

/**
 * Hook for converting Anki files using a Web Worker
 *
 * Falls back to main thread conversion if Workers are not supported.
 */
export function useConversionWorker(): UseConversionWorkerReturn {
  const [state, setState] = useState<ConversionState>(initialState);
  const workerManager = useRef(getWorkerManager());
  const isWorkerSupported = workerManager.current.isSupported();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup worker memory when component unmounts
      workerManager.current.cleanup();
    };
  }, []);

  /**
   * Handle progress updates
   */
  const handleProgress = useCallback((event: ProgressEvent) => {
    setState(prev => ({
      ...prev,
      progress: event.progress,
      stage: event.stage,
      message: event.message,
    }));
  }, []);

  /**
   * Handle errors
   */
  const handleError = useCallback((error: ConversionError) => {
    setState(prev => ({
      ...prev,
      isConverting: false,
      error,
    }));
  }, []);

  /**
   * Convert using Web Worker
   */
  const convertWithWorker = useCallback(
    async (file: File, options: ConversionOptions = {}): Promise<void> => {
      const callbacks: ConversionCallbacks = {
        onProgress: handleProgress,
        onError: handleError,
      };

      try {
        const result = await workerManager.current.convert(
          file,
          options,
          callbacks,
        );

        setState(prev => ({
          ...prev,
          isConverting: false,
          progress: 100,
          result,
        }));
      } catch (error) {
        // Error already handled by callback
        if (!(error instanceof ConversionError)) {
          handleError(
            new ConversionError(
              ErrorCode.UNKNOWN_ERROR,
              error instanceof Error ? error.message : String(error),
              {},
              false,
            ),
          );
        }
      }
    },
    [handleProgress, handleError],
  );

  /**
   * Convert on main thread (fallback)
   */
  const convertOnMainThread = useCallback(
    async (file: File, options: ConversionOptions = {}): Promise<void> => {
      const pipeline = createConversionPipeline();

      pipeline.on('progress', handleProgress);
      pipeline.on('error', handleError);

      try {
        const result = await pipeline.convert(file, options);

        setState(prev => ({
          ...prev,
          isConverting: false,
          progress: 100,
          result,
        }));
      } catch (error) {
        if (!(error instanceof ConversionError)) {
          handleError(
            new ConversionError(
              ErrorCode.UNKNOWN_ERROR,
              error instanceof Error ? error.message : String(error),
              {},
              false,
            ),
          );
        }
      } finally {
        pipeline.off('progress', handleProgress);
        pipeline.off('error', handleError);
      }
    },
    [handleProgress, handleError],
  );

  /**
   * Start a conversion
   */
  const convert = useCallback(
    async (file: File, options: ConversionOptions = {}): Promise<void> => {
      // Reset state
      setState({
        ...initialState,
        isConverting: true,
      });

      // Use worker if supported, otherwise fall back to main thread
      if (isWorkerSupported) {
        await convertWithWorker(file, options);
      } else {
        await convertOnMainThread(file, options);
      }
    },
    [isWorkerSupported, convertWithWorker, convertOnMainThread],
  );

  /**
   * Reset state for a new conversion
   */
  const reset = useCallback(() => {
    setState(initialState);
    // Cleanup worker memory
    workerManager.current.cleanup();
  }, []);

  return {
    state,
    convert,
    reset,
    isWorkerSupported,
  };
}
