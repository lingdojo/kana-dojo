'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

/** Supported InfoBox types */
export type InfoBoxType = 'tip' | 'warning' | 'note' | 'success';

/** All valid InfoBox types */
export const VALID_INFOBOX_TYPES: InfoBoxType[] = [
  'tip',
  'warning',
  'note',
  'success'
];

/**
 * Type-specific styling configurations
 */
const typeStyles: Record<
  InfoBoxType,
  { container: string; icon: string; iconChar: string }
> = {
  tip: {
    container: 'border-green-500/30 bg-green-500/10 text-green-400',
    icon: 'bg-green-500/20 text-green-400',
    iconChar: '💡'
  },
  warning: {
    container: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    icon: 'bg-yellow-500/20 text-yellow-400',
    iconChar: '⚠️'
  },
  note: {
    container: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    icon: 'bg-blue-500/20 text-blue-400',
    iconChar: '📝'
  },
  success: {
    container: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    icon: 'bg-emerald-500/20 text-emerald-400',
    iconChar: '✅'
  }
};

interface InfoBoxProps {
  /** Type of info box (tip, warning, note) */
  type: InfoBoxType;
  /** Content to display inside the box */
  children: ReactNode;
  /** Optional title for the box */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * InfoBox Component for MDX
 * Renders a styled callout box with type-specific styling (tip, warning, note).
 *
 * @example
 * <InfoBox type="tip">This is a helpful tip!</InfoBox>
 * <InfoBox type="warning" title="Be careful">This is a warning message.</InfoBox>
 * <InfoBox type="note">This is a note for reference.</InfoBox>
 */
export function InfoBox({ type, children, title, className }: InfoBoxProps) {
  const styles = typeStyles[type];
  const defaultTitle =
    type === 'tip'
      ? 'Tip'
      : type === 'warning'
        ? 'Warning'
        : type === 'success'
          ? 'Success'
          : 'Note';

  return (
    <aside
      className={cn('my-6 rounded-lg border p-4', styles.container, className)}
      data-testid='info-box'
      data-type={type}
      role='note'
      aria-label={title || defaultTitle}
    >
      <div className='flex items-start gap-3'>
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm',
            styles.icon
          )}
          data-testid='info-box-icon'
          aria-hidden='true'
        >
          {styles.iconChar}
        </span>
        <div className='flex-1'>
          {(title || defaultTitle) && (
            <p className='mb-1 font-semibold' data-testid='info-box-title'>
              {title || defaultTitle}
            </p>
          )}
          <div
            className='text-sm text-[var(--main-color)]'
            data-testid='info-box-content'
          >
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default InfoBox;
