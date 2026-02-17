'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

/**
 * Configuration: Set to true for top border, false for bottom border
 */
const USE_TOP_BORDER = true;

/**
 * Props for the OverviewStatsCard component
 */
export interface OverviewStatsCardProps {
  /** Title of the stat card */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional subtitle or additional context */
  subtitle?: string;
  /** Icon to display in the card header */
  icon: ReactNode;
  /** Optional trend indicator */
  trend?: 'up' | 'down' | 'neutral';
  /** Optional additional CSS classes */
  className?: string;
  /** Animation delay index for staggered entrance */
  index?: number;
}

/**
 * OverviewStatsCard Component
 *
 * Premium stat card with bold geometric design, gradient accents,
 * and smooth color transitions on hover.
 *
 * @requirements 1.1-1.5, 7.4
 */
export default function OverviewStatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  index = 0,
}: OverviewStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        'group relative overflow-hidden rounded-3xl',
        'bg-linear-to-br from-(--card-color) to-(--card-color)',
        'cursor-pointer p-6',
        'transition-colors duration-300',
        className,
      )}
    >
      {/* Decorative geometric shape - top right corner */}
      <div className='absolute -top-8 -right-8 h-24 w-24 rounded-full bg-linear-to-br from-(--main-color)/8 to-(--secondary-color)/5 opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100' />

      {/* Smooth gradient accent bar - position controlled by USE_TOP_BORDER */}
      <motion.div
        className={cn(
          'absolute right-0 left-0 h-1.5 bg-linear-to-r from-(--main-color) via-(--secondary-color) to-(--main-color)',
          USE_TOP_BORDER ? 'top-0 rounded-t-3xl' : 'bottom-0 rounded-b-3xl',
        )}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.8, delay: index * 0.08 + 0.3 }}
      />

      {/* Bottom gradient accent bar */}
      <motion.div
        className='absolute right-0 bottom-0 left-0 h-1.5 rounded-b-3xl bg-linear-to-r from-(--main-color) via-(--secondary-color) to-(--main-color)'
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.8, delay: index * 0.08 + 0.35 }}
      />

      <div className='relative z-10 flex flex-col gap-4'>
        {/* Icon container with geometric background */}
        <div className='flex items-center justify-between'>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl',
              'bg-linear-to-br from-(--main-color)/10 to-(--secondary-color)/5',
              'text-(--main-color)',
              'transition-colors duration-300',
              'group-hover:from-(--main-color)/20 group-hover:to-(--secondary-color)/10',
            )}
          >
            {icon}
          </div>

          {trend && trend !== 'neutral' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.08 + 0.4 }}
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                trend === 'up' && 'bg-(--main-color)/10 text-(--main-color)',
                trend === 'down' &&
                  'bg-(--secondary-color)/10 text-(--secondary-color)',
              )}
            >
              {trend === 'up' ? '↑' : '↓'}
            </motion.div>
          )}
        </div>

        {/* Value and title */}
        <div className='space-y-1'>
          <motion.div
            className='text-4xl font-bold tracking-tight text-(--main-color)'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: index * 0.08 + 0.2 }}
          >
            {value}
          </motion.div>
          <h3 className='text-sm font-medium text-(--secondary-color) transition-colors duration-300 group-hover:text-(--main-color)'>
            {title}
          </h3>
          {subtitle && (
            <motion.p
              className='text-xs text-(--secondary-color)/60'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.08 + 0.35 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
