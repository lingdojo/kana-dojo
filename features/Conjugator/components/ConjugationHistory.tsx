'use client';

import { useState } from 'react';
import { Trash2, Clock, X, History } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import type { HistoryEntry, VerbType } from '../types';

interface ConjugationHistoryProps {
  /** History entries to display */
  entries: HistoryEntry[];
  /** Callback when an entry is selected */
  onSelect: (entry: HistoryEntry) => void;
  /** Callback when an entry is deleted */
  onDelete: (id: string) => void;
  /** Callback when all entries are cleared */
  onClearAll: () => void;
}

/**
 * ConjugationHistory - Displays recent conjugated verbs
 *
 * Features:
 * - Recent verbs as clickable chips/cards
 * - Delete button for individual entries
 * - Clear all button
 * - Proper ARIA labels and roles
 *
 * Requirements: 8.2, 8.3, 8.4, 10.2
 */
export default function ConjugationHistory({
  entries,
  onSelect,
  onDelete,
  onClearAll,
}: ConjugationHistoryProps) {
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  // Empty state
  if (entries.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl py-8',
          'border border-[var(--border-color)] bg-[var(--card-color)]',
          'text-[var(--secondary-color)]',
        )}
        role='region'
        aria-label='Conjugation history'
      >
        <div
          className={cn(
            'mb-3 rounded-full p-3',
            'bg-[var(--secondary-color)]/10',
          )}
          aria-hidden='true'
        >
          <History className='h-8 w-8 opacity-50' />
        </div>
        <p className='text-sm font-medium'>No history yet</p>
        <p className='mt-1 text-xs opacity-70'>
          Your conjugated verbs will appear here
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl p-4 sm:p-5',
        'border border-[var(--border-color)] bg-[var(--card-color)]',
        'shadow-lg shadow-black/5',
      )}
      role='region'
      aria-label='Conjugation history'
    >
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'rounded-lg p-2',
              'bg-[var(--main-color)]/10',
              'border border-[var(--main-color)]/20',
            )}
            aria-hidden='true'
          >
            <History className='h-5 w-5 text-[var(--main-color)]' />
          </div>
          <div>
            <h3 className='text-base font-semibold text-[var(--main-color)]'>
              Recent Verbs
            </h3>
            <p className='text-xs text-[var(--secondary-color)]'>
              {entries.length} verb{entries.length !== 1 ? 's' : ''} in history
            </p>
          </div>
        </div>

        {/* Clear all button */}
        <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <AlertDialogTrigger asChild>
            <ActionButton
              colorScheme='secondary'
              borderColorScheme='secondary'
              borderRadius='xl'
              borderBottomThickness={6}
              className='!w-auto px-3 text-sm'
              aria-label='Clear all history'
            >
              <Trash2 className='h-4 w-4' aria-hidden='true' />
              <span className='hidden sm:inline'>Clear</span>
            </ActionButton>
          </AlertDialogTrigger>
          <AlertDialogContent
            className={cn(
              'border-[var(--border-color)] bg-[var(--background-color)]',
              'rounded-2xl',
            )}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className='text-[var(--main-color)]'>
                Clear History?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-[var(--secondary-color)]'>
                This will permanently delete all your conjugation history. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='flex-row gap-3'>
              <ActionButton
                colorScheme='main'
                borderColorScheme='main'
                borderRadius='2xl'
                borderBottomThickness={6}
                className='!w-auto px-6'
                onClick={() => setClearDialogOpen(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton
                colorScheme='secondary'
                borderColorScheme='secondary'
                borderRadius='2xl'
                borderBottomThickness={6}
                className='!w-auto px-6'
                onClick={() => {
                  onClearAll();
                  setClearDialogOpen(false);
                }}
              >
                Clear All
              </ActionButton>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* History entries as chips */}
      <div
        className='flex flex-wrap gap-2'
        role='list'
        aria-label='Recent conjugated verbs'
      >
        {entries.map(entry => (
          <HistoryChip
            key={entry.id}
            entry={entry}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual history chip component
 */
function HistoryChip({
  entry,
  onSelect,
  onDelete,
}: {
  entry: HistoryEntry;
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}) {
  const typeInfo = getVerbTypeInfo(entry.verbType);

  return (
    <div
      className={cn(
        'group flex items-center gap-1.5 rounded-xl',
        'border border-[var(--border-color)] bg-[var(--background-color)]',
        'hover:border-[var(--main-color)] hover:shadow-md',
        'transition-all duration-200',
        'overflow-hidden',
      )}
      role='listitem'
    >
      {/* Clickable verb part */}
      <button
        onClick={() => onSelect(entry)}
        className={cn(
          'flex items-center gap-2 py-2 pr-1 pl-3',
          'cursor-pointer',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--main-color)] focus-visible:ring-inset',
        )}
        aria-label={`Conjugate ${entry.verb}, ${typeInfo.label} verb, conjugated ${formatTimestamp(entry.timestamp)} ago`}
      >
        {/* Verb type indicator */}
        <span
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold',
            typeInfo.bgClass,
            typeInfo.textClass,
          )}
          title={typeInfo.label}
          aria-hidden='true'
        >
          {typeInfo.abbrev}
        </span>

        {/* Verb text */}
        <span
          className='font-japanese text-sm font-medium text-[var(--main-color)]'
          lang='ja'
        >
          {entry.verb}
        </span>

        {/* Timestamp */}
        <span
          className='flex items-center gap-1 text-[10px] text-[var(--secondary-color)]'
          aria-hidden='true'
        >
          <Clock className='h-3 w-3' />
          {formatTimestamp(entry.timestamp)}
        </span>
      </button>

      {/* Delete button */}
      <button
        onClick={e => {
          e.stopPropagation();
          onDelete(entry.id);
        }}
        className={cn(
          'flex h-full items-center justify-center px-2 py-2',
          'text-[var(--secondary-color)]',
          'hover:bg-red-500/10 hover:text-red-500',
          'opacity-0 group-hover:opacity-100 focus:opacity-100',
          'transition-all duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset',
        )}
        aria-label={`Remove ${entry.verb} from history`}
        tabIndex={0}
      >
        <X className='h-3.5 w-3.5' aria-hidden='true' />
      </button>
    </div>
  );
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return new Date(timestamp).toLocaleDateString();
}

/**
 * Get display info for verb type
 */
function getVerbTypeInfo(type: VerbType): {
  label: string;
  abbrev: string;
  bgClass: string;
  textClass: string;
} {
  switch (type) {
    case 'godan':
      return {
        label: 'Godan (五段)',
        abbrev: 'G',
        bgClass: 'bg-blue-500/20',
        textClass: 'text-blue-500',
      };
    case 'ichidan':
      return {
        label: 'Ichidan (一段)',
        abbrev: 'I',
        bgClass: 'bg-green-500/20',
        textClass: 'text-green-500',
      };
    case 'irregular':
      return {
        label: 'Irregular',
        abbrev: '!',
        bgClass: 'bg-purple-500/20',
        textClass: 'text-purple-500',
      };
    default:
      return {
        label: 'Unknown',
        abbrev: '?',
        bgClass: 'bg-gray-500/20',
        textClass: 'text-gray-500',
      };
  }
}
