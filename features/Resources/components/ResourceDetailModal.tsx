'use client';

import React, { memo, useCallback } from 'react';
import { cn } from '@/shared/lib/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  Smartphone,
  Globe,
  Monitor,
  Apple,
  BookOpen,
  Puzzle,
  ArrowUpRight,
  X,
} from 'lucide-react';
import type { Resource, DifficultyLevel, PriceType, Platform } from '../types';
import { ResourceCard } from './ResourceCard';

// ============================================================================
// Types
// ============================================================================

export interface ResourceDetailModalProps {
  /** The resource to display (null when closed) */
  resource: Resource | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal is closed */
  onClose: () => void;
  /** Related resources to display */
  relatedResources?: Resource[];
  /** Callback when a related resource is selected */
  onRelatedSelect?: (resource: Resource) => void;
}

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Editorial Badge component for displaying labels
 */
const Badge = memo(function Badge({
  children,
  variant = 'generic',
  className,
}: {
  children: React.ReactNode;
  variant?: 'difficulty' | 'price' | 'generic';
  className?: string;
}) {
  const variantStyles = {
    generic: 'text-[var(--secondary-color)] border-[var(--border-color)]',
    difficulty:
      'text-[var(--main-color)] border-[var(--main-color)]/20 bg-[var(--main-color)]/5',
    price:
      'text-[var(--secondary-color)] border-[var(--secondary-color)]/30 bg-[var(--secondary-color)]/10',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-1 text-[10px] font-bold tracking-widest uppercase',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
});

/**
 * Platform icon and label component
 */
const PlatformBadge = memo(function PlatformBadge({
  platform,
}: {
  platform: Platform;
}) {
  const iconProps = {
    size: 14,
    className: 'shrink-0 text-[var(--secondary-color)] opacity-40',
  };

  const platformConfig: Record<
    Platform,
    { icon: React.ReactNode; label: string }
  > = {
    web: { icon: <Globe {...iconProps} />, label: 'Web' },
    ios: { icon: <Apple {...iconProps} />, label: 'iOS' },
    android: { icon: <Smartphone {...iconProps} />, label: 'Android' },
    windows: { icon: <Monitor {...iconProps} />, label: 'Windows' },
    macos: { icon: <Apple {...iconProps} />, label: 'macOS' },
    linux: { icon: <Monitor {...iconProps} />, label: 'Linux' },
    physical: { icon: <BookOpen {...iconProps} />, label: 'Physical' },
    'browser-extension': {
      icon: <Puzzle {...iconProps} />,
      label: 'Browser Extension',
    },
    api: { icon: <Globe {...iconProps} />, label: 'API' },
  };

  const config = platformConfig[platform];

  return (
    <span className='flex items-center gap-2 rounded-full border border-[var(--border-color)] px-3 py-1.5 text-xs text-[var(--secondary-color)]'>
      {config.icon}
      {config.label}
    </span>
  );
});

// ============================================================================
// ResourceDetailModal Component (Optimized)
// ============================================================================

const getDifficultyLabel = (difficulty: DifficultyLevel) => {
  const labels: Record<DifficultyLevel, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    'all-levels': 'All Levels',
  };
  return labels[difficulty];
};

const getPriceLabel = (priceType: PriceType) => {
  const labels: Record<PriceType, string> = {
    free: 'Free',
    freemium: 'Freemium',
    paid: 'Paid',
    subscription: 'Subscription',
  };
  return labels[priceType];
};

export const ResourceDetailModal = memo(function ResourceDetailModal({
  resource,
  isOpen,
  onClose,
  relatedResources = [],
  onRelatedSelect,
}: ResourceDetailModalProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!resource) return null;

  const description = resource.descriptionLong || resource.description;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal forceMount>
        <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/80' />
        <DialogPrimitive.Content
          className='fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col gap-0 rounded-2xl border-0 border-[var(--border-color)] bg-[var(--background-color)] p-0 selection:bg-[var(--main-color)] selection:text-[var(--background-color)] sm:max-h-[80vh] sm:w-[90vw]'
          onOpenAutoFocus={e => e.preventDefault()}
        >
          {/* Sticky Header */}
          <div className='sticky top-0 z-10 flex flex-row items-center justify-between rounded-t-2xl border-b border-[var(--border-color)] bg-[var(--background-color)] px-6 pt-6 pb-4 sm:px-12'>
            <div className='flex items-center gap-4'>
              <span className='text-[10px] font-bold tracking-[0.3em] text-[var(--secondary-color)] uppercase opacity-40'>
                Resource Dossier
              </span>
              <div className='hidden h-px w-12 bg-[var(--border-color)] sm:block' />
              <Badge variant='generic' className='hidden sm:inline-flex'>
                {resource.category}
              </Badge>
            </div>
            <button
              onClick={handleClose}
              className='shrink-0 cursor-pointer rounded-xl p-2 hover:bg-[var(--card-color)]'
            >
              <X size={24} className='text-[var(--secondary-color)]' />
            </button>
          </div>

          <div
            id='modal-scroll'
            className='flex-1 overflow-y-auto px-6 py-8 sm:px-12 sm:py-12'
          >
            <DialogPrimitive.Title className='mb-12 flex flex-col text-4xl leading-tight font-black tracking-tighter text-[var(--main-color)] md:text-6xl'>
              <span>{resource.name}</span>
            </DialogPrimitive.Title>

            <div className='grid grid-cols-1 gap-16 lg:grid-cols-12'>
              <div className='space-y-12 lg:col-span-8'>
                <section>
                  <h3 className='mb-6 text-[10px] font-bold tracking-[0.2em] text-[var(--secondary-color)] uppercase opacity-40'>
                    Overview
                  </h3>
                  <div className='space-y-6 text-lg leading-relaxed text-[var(--main-color)] md:text-xl'>
                    {description.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </section>

                {resource.notes && (
                  <section className='rounded-lg border-l-2 border-[var(--main-color)] bg-[var(--main-color)]/[0.02] p-8'>
                    <h3 className='mb-4 text-[10px] font-bold tracking-[0.2em] text-[var(--secondary-color)] uppercase opacity-40'>
                      Curator&apos;s Notes
                    </h3>
                    <p className='text-sm leading-relaxed text-[var(--secondary-color)] italic'>
                      {resource.notes}
                    </p>
                  </section>
                )}

                <section>
                  <h3 className='mb-6 text-[10px] font-bold tracking-[0.2em] text-[var(--secondary-color)] uppercase opacity-40'>
                    Architecture & Tags
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {resource.tags.map(tag => (
                      <span
                        key={tag}
                        className='cursor-default rounded border border-[var(--border-color)] px-2 py-1 font-mono text-[10px] text-[var(--secondary-color)] transition-colors hover:border-[var(--main-color)] hover:bg-[var(--main-color)] hover:text-[var(--background-color)]'
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              <div className='shrink-0 space-y-12 lg:col-span-4'>
                <div className='space-y-8 lg:sticky lg:top-0'>
                  <section>
                    <h3 className='mb-4 text-[10px] font-bold tracking-[0.2em] text-[var(--secondary-color)] uppercase opacity-40'>
                      Credentials
                    </h3>
                    <div className='flex flex-col gap-3'>
                      <Badge variant='difficulty'>
                        {getDifficultyLabel(resource.difficulty)}
                      </Badge>
                      <Badge variant='price'>
                        {getPriceLabel(resource.priceType)}
                      </Badge>
                      {resource.priceDetails && (
                        <p className='font-mono text-[10px] tracking-tighter text-[var(--secondary-color)] uppercase opacity-50'>
                          {resource.priceDetails}
                        </p>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className='mb-4 text-[10px] font-bold tracking-[0.2em] text-[var(--secondary-color)] uppercase opacity-40'>
                      Deployments
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {resource.platforms.map(platform => (
                        <PlatformBadge key={platform} platform={platform} />
                      ))}
                    </div>
                  </section>

                  <a
                    href={resource.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={cn(
                      'group mt-12 flex w-full cursor-pointer items-center justify-between rounded-full bg-[var(--main-color)] p-6 text-[var(--background-color)] transition-colors duration-300',
                      'hover:bg-[var(--main-color)]/90',
                    )}
                  >
                    <span className='text-sm font-bold tracking-tight uppercase'>
                      Initialize Access
                    </span>
                    <ArrowUpRight className='transition-colors group-hover:text-[var(--background-color)]' />
                  </a>
                </div>
              </div>
            </div>

            {/* Related Resources */}
            {relatedResources.length > 0 && (
              <footer className='mt-24 border-t border-[var(--border-color)] pt-12'>
                <h3 className='mb-12 text-center text-[10px] font-bold tracking-[0.5em] text-[var(--secondary-color)] uppercase opacity-30'>
                  Secondary Connections
                </h3>
                <div className='flex flex-col'>
                  {relatedResources.slice(0, 3).map(related => (
                    <ResourceCard
                      key={related.id}
                      resource={related}
                      onSelect={onRelatedSelect}
                      isCompact
                    />
                  ))}
                </div>
              </footer>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
});

export default ResourceDetailModal;
