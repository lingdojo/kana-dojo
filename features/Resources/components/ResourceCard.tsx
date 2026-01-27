'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import type { Resource, DifficultyLevel, PriceType, Platform } from '../types';
import {
  Smartphone,
  Globe,
  Monitor,
  Apple,
  BookOpen,
  Puzzle,
  ArrowUpRight,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface ResourceCardProps {
  /** The resource to display */
  resource: Resource;
  /** Callback when the card is clicked */
  onSelect?: (resource: Resource) => void;
  /** Whether to display in compact mode */
  isCompact?: boolean;
  /** Callback for keyboard navigation */
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Editorial Badge component for displaying labels with a refined look
 */
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'difficulty' | 'price' | 'category';
  className?: string;
}

function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantStyles = {
    default: 'text-[var(--secondary-color)] border-[var(--border-color)]',
    difficulty:
      'text-[var(--main-color)] border-[var(--main-color)]/20 bg-[var(--main-color)]/5',
    price:
      'text-[var(--secondary-color)] border-[var(--secondary-color)]/30 bg-[var(--secondary-color)]/10',
    category:
      'text-[var(--secondary-color)] border-[var(--border-color)] bg-[var(--background-color)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium tracking-tight uppercase',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Get display text for difficulty level
 */
function getDifficultyLabel(difficulty: DifficultyLevel): string {
  const labels: Record<DifficultyLevel, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    'all-levels': 'All Levels',
  };
  return labels[difficulty];
}

/**
 * Get display text for price type
 */
function getPriceLabel(priceType: PriceType): string {
  const labels: Record<PriceType, string> = {
    free: 'Free',
    freemium: 'Freemium',
    paid: 'Paid',
    subscription: 'Subs',
  };
  return labels[priceType];
}

/**
 * Platform icon component
 */
interface PlatformIconProps {
  platform: Platform;
  className?: string;
}

function PlatformIcon({ platform, className }: PlatformIconProps) {
  const iconProps = {
    size: 12,
    className: cn(
      'shrink-0 text-[var(--secondary-color)] opacity-40',
      className,
    ),
  };

  const icons: Record<Platform, React.ReactNode> = {
    web: <Globe {...iconProps} aria-label='Web' />,
    ios: <Apple {...iconProps} aria-label='iOS' />,
    android: <Smartphone {...iconProps} aria-label='Android' />,
    windows: <Monitor {...iconProps} aria-label='Windows' />,
    macos: <Apple {...iconProps} aria-label='macOS' />,
    linux: <Monitor {...iconProps} aria-label='Linux' />,
    physical: <BookOpen {...iconProps} aria-label='Physical' />,
    'browser-extension': (
      <Puzzle {...iconProps} aria-label='Browser Extension' />
    ),
    api: <Globe {...iconProps} aria-label='API' />,
  };

  return icons[platform] || null;
}

// ============================================================================
// ResourceCard Component (Editorial Row Style)
// ============================================================================

/**
 * ResourceCard displays a single learning resource as a refined editorial row.
 * Optimized for hierarchy, typography, and a "premium compendium" feel.
 */
export function ResourceCard({
  resource,
  onSelect,
  isCompact = false,
  onKeyDown,
}: ResourceCardProps) {
  const handleClick = () => {
    onSelect?.(resource);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(resource);
      return;
    }
    onKeyDown?.(e);
  };

  return (
    <article
      role='button'
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`${resource.name} - ${resource.description}`}
      className={cn(
        'group relative flex cursor-pointer flex-col gap-4 px-2 py-8 sm:flex-row sm:items-center',
        'border-b border-[var(--border-color)] transition-all duration-300',
        'hover:bg-[var(--main-color)]/[0.02]',
        'outline-none focus-visible:bg-[var(--main-color)]/[0.03]',
        resource.featured && 'bg-[var(--main-color)]/[0.01]',
      )}
    >
      {/* Visual Indicator for Featured */}
      {resource.featured && (
        <div className='absolute top-1/2 left-0 h-12 w-0.5 -translate-y-1/2 bg-[var(--main-color)]' />
      )}

      {/* Primary Content Area */}
      <div className='min-w-0 flex-1'>
        <div className='mb-2 flex items-center gap-3'>
          <Badge variant='category'>
            {formatCategoryName(resource.category)}
          </Badge>
          <div className='flex items-center gap-1'>
            {resource.platforms.slice(0, 3).map(platform => (
              <PlatformIcon key={platform} platform={platform} />
            ))}
          </div>
        </div>

        <h3
          className={cn(
            'leading-tight font-bold tracking-tight text-[var(--main-color)]',
            isCompact ? 'text-lg' : 'text-xl md:text-2xl',
          )}
        >
          {resource.name}
        </h3>

        <p
          className={cn(
            'mt-3 max-w-2xl leading-relaxed text-[var(--secondary-color)]',
            isCompact
              ? 'line-clamp-1 text-sm'
              : 'line-clamp-2 text-base md:line-clamp-none',
          )}
        >
          {resource.description}
        </p>
      </div>

      {/* Metadata & Actions Area */}
      <div className='flex shrink-0 flex-wrap items-center gap-4 sm:ml-auto sm:flex-nowrap'>
        <div className='flex items-center gap-2'>
          <Badge variant='difficulty'>
            {getDifficultyLabel(resource.difficulty)}
          </Badge>
          <Badge variant='price'>{getPriceLabel(resource.priceType)}</Badge>
        </div>

        <button
          className={cn(
            'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--border-color)]',
            'text-[var(--main-color)] transition-all duration-300',
            'group-hover:border-[var(--main-color)] group-hover:bg-[var(--main-color)] group-hover:text-[var(--background-color)]',
          )}
          aria-hidden='true'
        >
          <ArrowUpRight size={18} />
        </button>
      </div>
    </article>
  );
}

/**
 * Format category ID to display name
 */
function formatCategoryName(categoryId: string): string {
  const names: Record<string, string> = {
    apps: 'Apps',
    websites: 'Web',
    textbooks: 'Print',
    youtube: 'Video',
    podcasts: 'Audio',
    games: 'Games',
    jlpt: 'JLPT',
    reading: 'Read',
    listening: 'Listen',
    speaking: 'Speak',
    writing: 'Write',
    grammar: 'Grammar',
    vocabulary: 'Vocab',
    kanji: 'Kanji',
    immersion: 'Immersion',
    community: 'Social',
  };
  return names[categoryId] || categoryId;
}

export default ResourceCard;
