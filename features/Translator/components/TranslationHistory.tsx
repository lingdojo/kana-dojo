'use client';

import { useState, useMemo } from 'react';
import {
  Trash2,
  Clock,
  X,
  History,
  ArrowRight,
  Search,
  Download,
  Filter,
  XCircle,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import type { TranslationEntry, Language } from '../types';
import {
  filterHistory,
  getDefaultFilters,
  hasActiveFilters,
  getFilterSummary,
  type HistoryFilters,
} from '../lib/historyFilters';
import { exportHistoryToCSV } from '../lib/csvExport';

interface TranslationHistoryProps {
  entries: TranslationEntry[];
  onSelect: (entry: TranslationEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

/**
 * Format timestamp to a readable date/time string
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Truncate text to a maximum length
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export default function TranslationHistory({
  entries,
  onSelect,
  onDelete,
  onClearAll,
}: TranslationHistoryProps) {
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [filters, setFilters] = useState<HistoryFilters>(getDefaultFilters());

  // Apply filters to entries
  const filteredEntries = useMemo(
    () => filterHistory(entries, filters),
    [entries, filters],
  );

  const filterSummary = getFilterSummary(
    filters,
    entries.length,
    filteredEntries.length,
  );

  // Update individual filter
  const updateFilter = <K extends keyof HistoryFilters>(
    key: K,
    value: HistoryFilters[K],
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(getDefaultFilters());
  };

  // Handle CSV export
  const handleExport = () => {
    const entriesToExport =
      filteredEntries.length > 0 ? filteredEntries : entries;
    exportHistoryToCSV(entriesToExport);
  };

  if (entries.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl py-12',
          'border border-(--border-color) bg-(--card-color)',
          'text-(--secondary-color)',
        )}
      >
        <div
          className={cn(
            'mb-4 rounded-full p-4',
            'bg-(--secondary-color)/10',
          )}
        >
          <History className='h-10 w-10 opacity-50' />
        </div>
        <p className='text-base font-medium'>No translation history yet</p>
        <p className='mt-1 text-sm opacity-70'>
          Your translations will appear here
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl p-4 sm:p-5',
        'border border-(--border-color) bg-(--card-color)',
        'shadow-lg shadow-black/5',
      )}
    >
      {/* Header with title and actions */}
      <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'rounded-lg p-2',
              'bg-(--main-color)/10',
              'border border-(--main-color)/20',
            )}
          >
            <History className='h-5 w-5 text-(--main-color)' />
          </div>
          <div>
            <h3 className='text-base font-semibold text-(--main-color) sm:text-lg'>
              Translation History
            </h3>
            <p className='text-xs text-(--secondary-color)'>
              {filterSummary}
            </p>
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <ActionButton
            colorScheme='main'
            borderColorScheme='main'
            borderRadius='2xl'
            borderBottomThickness={6}
            className='!w-auto px-4'
            onClick={handleExport}
            disabled={entries.length === 0}
          >
            <Download className='h-4 w-4' />
            Export
          </ActionButton>
          <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
            <AlertDialogTrigger asChild>
              <ActionButton
                colorScheme='secondary'
                borderColorScheme='secondary'
                borderRadius='2xl'
                borderBottomThickness={6}
                className='!w-auto px-4'
                disabled={entries.length === 0}
              >
                <Trash2 className='h-4 w-4' />
                Clear All
              </ActionButton>
            </AlertDialogTrigger>
            <AlertDialogContent
              className={cn(
                'border-(--border-color) bg-(--background-color)',
                'rounded-2xl',
              )}
            >
              <AlertDialogHeader>
                <AlertDialogTitle className='text-(--main-color)'>
                  Clear Translation History?
                </AlertDialogTitle>
                <AlertDialogDescription className='text-(--secondary-color)'>
                  This will permanently delete all your translation history.
                  This action cannot be undone.
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
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col gap-3'>
        {/* Search bar */}
        <div className='relative'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--secondary-color)' />
          <Input
            placeholder='Search translations...'
            value={filters.searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateFilter('searchQuery', e.target.value)
            }
            className={cn(
              'h-10 py-2 pr-4 pl-10',
              'border-(--border-color) bg-(--background-color)',
              'text-(--main-color) placeholder:text-(--secondary-color)',
              'focus:border-(--main-color) focus:ring-(--main-color)/20',
              'rounded-xl',
            )}
          />
        </div>

        {/* Filter dropdowns */}
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
          <Select
            value={filters.sourceLanguage}
            onValueChange={(value: Language | 'all') =>
              updateFilter('sourceLanguage', value)
            }
          >
            <SelectTrigger
              className={cn(
                'h-10 rounded-xl',
                'border-(--border-color) bg-(--background-color)',
                'text-(--main-color)',
                'focus:border-(--main-color) focus:ring-(--main-color)/20',
              )}
            >
              <div className='flex items-center gap-2'>
                <Filter className='h-3.5 w-3.5' />
                <SelectValue placeholder='Source' />
              </div>
            </SelectTrigger>
            <SelectContent
              className={cn(
                'border-(--border-color) bg-(--card-color)',
                'rounded-xl',
              )}
            >
              <SelectItem value='all'>All Sources</SelectItem>
              <SelectItem value='en'>🇺🇸 English</SelectItem>
              <SelectItem value='ja'>🇯🇵 Japanese</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.targetLanguage}
            onValueChange={(value: Language | 'all') =>
              updateFilter('targetLanguage', value)
            }
          >
            <SelectTrigger
              className={cn(
                'h-10 rounded-xl',
                'border-(--border-color) bg-(--background-color)',
                'text-(--main-color)',
                'focus:border-(--main-color) focus:ring-(--main-color)/20',
              )}
            >
              <div className='flex items-center gap-2'>
                <Filter className='h-3.5 w-3.5' />
                <SelectValue placeholder='Target' />
              </div>
            </SelectTrigger>
            <SelectContent
              className={cn(
                'border-(--border-color) bg-(--card-color)',
                'rounded-xl',
              )}
            >
              <SelectItem value='all'>All Targets</SelectItem>
              <SelectItem value='en'>🇺🇸 English</SelectItem>
              <SelectItem value='ja'>🇯🇵 Japanese</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.dateRange}
            onValueChange={(value: 'all' | 'today' | 'week' | 'month') =>
              updateFilter('dateRange', value)
            }
          >
            <SelectTrigger
              className={cn(
                'h-10 rounded-xl',
                'border-(--border-color) bg-(--background-color)',
                'text-(--main-color)',
                'focus:border-(--main-color) focus:ring-(--main-color)/20',
              )}
            >
              <div className='flex items-center gap-2'>
                <Clock className='h-3.5 w-3.5' />
                <SelectValue placeholder='Date' />
              </div>
            </SelectTrigger>
            <SelectContent
              className={cn(
                'border-(--border-color) bg-(--card-color)',
                'rounded-xl',
              )}
            >
              <SelectItem value='all'>All Time</SelectItem>
              <SelectItem value='today'>Today</SelectItem>
              <SelectItem value='week'>This Week</SelectItem>
              <SelectItem value='month'>This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear filters button (shown when filters are active) */}
        {hasActiveFilters(filters) && (
          <button
            onClick={clearFilters}
            className={cn(
              'flex items-center justify-center gap-2 px-3 py-2',
              'text-xs font-medium text-(--secondary-color)',
              'hover:text-(--main-color)',
              'transition-colors duration-200',
              'rounded-lg hover:bg-(--background-color)',
            )}
          >
            <XCircle className='h-3.5 w-3.5' />
            Clear Filters
          </button>
        )}
      </div>

      {/* History entries list */}
      <div className='flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-1 sm:max-h-[400px]'>
        {filteredEntries.length === 0 ? (
          <div
            className={cn(
              'flex flex-col items-center justify-center rounded-xl py-8',
              'border border-(--border-color) bg-(--background-color)',
              'text-(--secondary-color)',
            )}
          >
            <Search className='mb-2 h-8 w-8 opacity-50' />
            <p className='text-sm font-medium'>No matching translations</p>
            <p className='mt-1 text-xs opacity-70'>
              Try adjusting your filters
            </p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <div
              key={entry.id}
              className={cn(
                'group flex cursor-pointer items-start gap-2 rounded-xl p-3 sm:gap-3 sm:p-4',
                'border border-(--border-color) bg-(--background-color)',
                'hover:border-(--main-color) hover:shadow-md',
                'transition-all duration-200',
              )}
              onClick={() => onSelect(entry)}
              role='button'
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(entry);
                }
              }}
            >
              {/* Entry content */}
              <div className='min-w-0 flex-1'>
                <div className='mb-2 flex flex-wrap items-center gap-2'>
                  <span
                    className={cn(
                      'rounded-md px-2 py-1 text-xs font-medium',
                      'bg-(--main-color)/10 text-(--main-color)',
                      'border border-(--main-color)/20',
                    )}
                  >
                    {entry.sourceLanguage === 'en' ? '🇺🇸 EN' : '🇯🇵 JA'}
                    <ArrowRight className='mx-1 inline h-3 w-3' />
                    {entry.targetLanguage === 'en' ? '🇺🇸 EN' : '🇯🇵 JA'}
                  </span>
                  <span className='flex items-center gap-1 text-xs text-(--secondary-color)'>
                    <Clock className='h-3 w-3' />
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
                <p className='truncate text-xs font-medium text-(--main-color) sm:text-sm'>
                  {truncateText(entry.sourceText, 40)}
                </p>
                <p className='mt-1 flex items-center gap-1 truncate text-xs text-(--secondary-color)'>
                  <ArrowRight className='h-3 w-3 flex-shrink-0' />
                  {truncateText(entry.translatedText, 40)}
                </p>
              </div>

              {/* Delete button - always visible on mobile */}
              <ActionButton
                colorScheme='secondary'
                borderColorScheme='secondary'
                borderRadius='xl'
                borderBottomThickness={6}
                className={cn(
                  'h-9 !w-9 !min-w-9 flex-shrink-0 !p-0',
                  'sm:opacity-0 sm:group-hover:opacity-100',
                  'transition-opacity duration-200',
                )}
                onClick={e => {
                  e.stopPropagation();
                  onDelete(entry.id);
                }}
                aria-label='Delete entry'
              >
                <X className='h-4 w-4' />
              </ActionButton>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
