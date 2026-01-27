/**
 * ConverterInterface Component
 *
 * Main UI component for the Anki to JSON converter.
 * Provides drag-and-drop file upload, conversion progress display,
 * and automatic JSON file download.
 *
 * @module features/AnkiConverter/components/ConverterInterface
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { useConversionWorker } from '../hooks/useConversionWorker';
import {
  getAcceptString,
  getSupportedExtensions,
  detectFormatFromExtension,
  isSupportedFormat,
} from '../lib/formatDetection';
import { downloadConversionResult } from '../lib/fileDownload';
import type { ConversionStats } from '../types';

export interface ConverterInterfaceProps {
  onConversionComplete?: (stats: ConversionStats) => void;
}

/**
 * Supported file extensions for display
 */
const SUPPORTED_FORMATS = [
  { ext: '.apkg', name: 'Anki Package' },
  { ext: '.colpkg', name: 'Collection Package' },
  { ext: '.anki2', name: 'Anki Database' },
  { ext: '.tsv', name: 'Tab-Separated Values' },
  { ext: '.db', name: 'SQLite Database' },
];

/**
 * Check if a file has a supported extension
 */
function isFileSupported(filename: string): boolean {
  const format = detectFormatFromExtension(filename);
  return isSupportedFormat(format);
}

/**
 * Anki Converter Interface
 *
 * Provides drag-and-drop file upload, progress tracking,
 * and automatic JSON download.
 */
export function ConverterInterface({
  onConversionComplete,
}: ConverterInterfaceProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadReady, setDownloadReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);

  const { state, convert, reset, isWorkerSupported } = useConversionWorker();

  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  /**
   * Handle drag leave event
   */
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  /**
   * Process a selected file
   */
  const processFile = useCallback(
    async (file: File) => {
      if (!isFileSupported(file.name)) {
        // File not supported - show error via state
        return;
      }

      setSelectedFile(file);
      setDownloadReady(false);
      startTimeRef.current = Date.now();

      try {
        await convert(file);
        setDownloadReady(true);
      } catch {
        // Error is handled by the hook
      }
    },
    [convert],
  );

  /**
   * Handle file drop
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile],
  );

  /**
   * Handle file input change
   */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile],
  );

  /**
   * Open file picker
   */
  const handleSelectClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Download the converted JSON
   */
  const handleDownload = useCallback(() => {
    if (!state.result || !selectedFile) return;

    const processingTime = Date.now() - startTimeRef.current;

    // Use the download utility
    const downloadResult = downloadConversionResult(state.result, {
      sourceFilename: selectedFile.name,
    });

    if (!downloadResult.success) {
      // Could show error to user here if needed
      console.error('Download failed:', downloadResult.error);
      return;
    }

    // Notify completion
    if (onConversionComplete) {
      const stats: ConversionStats = {
        totalCards: state.result.metadata.totalCards,
        totalDecks: state.result.metadata.totalDecks,
        processingTime,
        fileName: downloadResult.filename,
      };
      onConversionComplete(stats);
    }
  }, [state.result, selectedFile, onConversionComplete]);

  /**
   * Reset for a new conversion
   */
  const handleReset = useCallback(() => {
    reset();
    setSelectedFile(null);
    setDownloadReady(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [reset]);

  /**
   * Retry failed conversion
   */
  const handleRetry = useCallback(() => {
    if (selectedFile) {
      processFile(selectedFile);
    }
  }, [selectedFile, processFile]);

  // Render progress stage label
  const getStageLabel = (stage: string): string => {
    switch (stage) {
      case 'detecting':
        return 'Detecting file format...';
      case 'parsing':
        return 'Parsing file...';
      case 'extracting':
        return 'Extracting content...';
      case 'transforming':
        return 'Transforming data...';
      case 'building':
        return 'Building JSON...';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className='mx-auto flex w-full max-w-2xl flex-col gap-6'>
      {/* Privacy Notice */}
      <div className='flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-3'>
        <svg
          className='h-5 w-5 flex-shrink-0 text-green-500'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
          />
        </svg>
        <p className='text-sm text-[var(--text-color)]'>
          <span className='font-medium'>100% Private:</span> All conversion
          happens locally in your browser. Your files never leave your device.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={cn(
          'relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200',
          isDragOver
            ? 'border-[var(--main-color)] bg-[var(--main-color)]/10'
            : 'border-[var(--border-color)] bg-[var(--card-color)] hover:border-[var(--main-color)]/50',
          state.isConverting && 'pointer-events-none opacity-75',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!state.isConverting ? handleSelectClick : undefined}
        role='button'
        tabIndex={0}
        aria-label='Drop zone for Anki files'
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type='file'
          accept={getAcceptString()}
          onChange={handleFileChange}
          className='hidden'
          aria-hidden='true'
        />

        {/* Idle State */}
        {!state.isConverting && !state.result && !state.error && (
          <>
            <svg
              className='mb-4 h-12 w-12 text-[var(--text-color)]/50'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
              />
            </svg>
            <p className='mb-2 text-lg font-medium text-[var(--text-color)]'>
              {isDragOver
                ? 'Drop your file here'
                : 'Drag & drop your Anki file'}
            </p>
            <p className='mb-4 text-sm text-[var(--text-color)]/70'>
              or click to select a file
            </p>
            <div className='flex flex-wrap justify-center gap-2'>
              {getSupportedExtensions()
                .slice(0, 5)
                .map(ext => (
                  <span
                    key={ext}
                    className='rounded bg-[var(--border-color)] px-2 py-1 text-xs text-[var(--text-color)]/70'
                  >
                    {ext}
                  </span>
                ))}
            </div>
          </>
        )}

        {/* Converting State */}
        {state.isConverting && (
          <div className='flex w-full flex-col items-center'>
            <div className='mb-4 w-full max-w-xs'>
              {/* Progress bar */}
              <div className='h-2 w-full overflow-hidden rounded-full bg-[var(--border-color)]'>
                <div
                  className='h-full rounded-full transition-all duration-300'
                  style={{
                    width: `${state.progress}%`,
                    background:
                      'linear-gradient(to right, var(--secondary-color), var(--main-color))',
                  }}
                />
              </div>
            </div>
            <p className='mb-1 text-lg font-medium text-[var(--text-color)]'>
              {state.progress}%
            </p>
            <p className='text-sm text-[var(--text-color)]/70'>
              {getStageLabel(state.stage)}
            </p>
            {selectedFile && (
              <p className='mt-2 text-xs text-[var(--text-color)]/50'>
                {selectedFile.name}
              </p>
            )}
          </div>
        )}

        {/* Success State */}
        {state.result && !state.isConverting && (
          <div className='flex flex-col items-center'>
            <svg
              className='mb-4 h-12 w-12 text-green-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <p className='mb-2 text-lg font-medium text-[var(--text-color)]'>
              Conversion Complete!
            </p>
            <div className='mb-4 flex gap-4 text-sm text-[var(--text-color)]/70'>
              <span>{state.result.metadata.totalCards} cards</span>
              <span>•</span>
              <span>{state.result.metadata.totalDecks} deck(s)</span>
              <span>•</span>
              <span>{state.result.metadata.processingTime}ms</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {state.error && !state.isConverting && (
          <div className='flex flex-col items-center'>
            <svg
              className='mb-4 h-12 w-12 text-red-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <p className='mb-2 text-lg font-medium text-red-500'>
              Conversion Failed
            </p>
            <p className='mb-2 max-w-md text-center text-sm text-[var(--text-color)]/70'>
              {state.error.message}
            </p>
            {state.error.recoverable && (
              <p className='text-xs text-[var(--text-color)]/50'>
                This error may be recoverable. Try again or use a different
                file.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className='flex justify-center gap-3'>
        {/* Download button - shown after successful conversion */}
        {downloadReady && state.result && (
          <Button onClick={handleDownload} variant='default' size='lg'>
            <svg
              className='mr-2 h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
              />
            </svg>
            Download JSON
          </Button>
        )}

        {/* Retry button - shown after error */}
        {state.error && !state.isConverting && (
          <Button onClick={handleRetry} variant='default' size='lg'>
            <svg
              className='mr-2 h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
            Try Again
          </Button>
        )}

        {/* Reset button - shown after conversion or error */}
        {(state.result || state.error) && !state.isConverting && (
          <Button onClick={handleReset} variant='outline' size='lg'>
            Convert Another File
          </Button>
        )}
      </div>

      {/* Supported Formats Info */}
      {!state.isConverting && !state.result && !state.error && (
        <div className='text-center'>
          <p className='mb-3 text-sm text-[var(--text-color)]/70'>
            Supported formats:
          </p>
          <div className='flex flex-wrap justify-center gap-3'>
            {SUPPORTED_FORMATS.map(({ ext, name }) => (
              <div
                key={ext}
                className='flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] px-3 py-2'
              >
                <span className='font-mono text-sm text-[var(--main-color)]'>
                  {ext}
                </span>
                <span className='text-xs text-[var(--text-color)]/50'>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Worker support notice */}
      {!isWorkerSupported && (
        <p className='text-center text-xs text-[var(--text-color)]/50'>
          Note: Web Workers are not supported in your browser. Conversion will
          run on the main thread, which may cause brief UI freezes for large
          files.
        </p>
      )}
    </div>
  );
}
