'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Languages,
  GraduationCap,
  Library,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

/**
 * Internal link configuration
 */
interface InternalLink {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * Related features to link from the conjugator
 */
const INTERNAL_LINKS: InternalLink[] = [
  {
    href: '/kana',
    title: 'Kana Practice',
    description: 'Master Hiragana and Katakana with interactive training',
    icon: <Sparkles className='h-5 w-5' />,
  },
  {
    href: '/kanji',
    title: 'Kanji Learning',
    description: 'Study Kanji characters organized by JLPT level',
    icon: <BookOpen className='h-5 w-5' />,
  },
  {
    href: '/vocabulary',
    title: 'Vocabulary Training',
    description: 'Build your Japanese vocabulary with JLPT-focused words',
    icon: <Library className='h-5 w-5' />,
  },
  {
    href: '/translate',
    title: 'Japanese Translator',
    description: 'Translate between English and Japanese with romaji',
    icon: <Languages className='h-5 w-5' />,
  },
  {
    href: '/academy',
    title: 'Japanese Academy',
    description: 'Structured lessons for comprehensive Japanese learning',
    icon: <GraduationCap className='h-5 w-5' />,
  },
];

interface RelatedFeaturesProps {
  /** Optional locale for links */
  locale?: string;
  /** Optional custom links */
  links?: InternalLink[];
}

/**
 * RelatedFeatures - Internal links to other KanaDojo features
 *
 * This component provides SEO-friendly internal links to related features,
 * helping with site navigation and search engine crawling.
 *
 * Requirements: 13.8
 */
export default function RelatedFeatures({
  locale,
  links = INTERNAL_LINKS,
}: RelatedFeaturesProps) {
  const getLocalizedHref = (href: string) => {
    if (locale) {
      return `/${locale}${href}`;
    }
    return href;
  };

  return (
    <section
      className={cn(
        'mt-8 rounded-2xl',
        'border border-[var(--border-color)] bg-[var(--card-color)]',
        'p-6 sm:p-8',
      )}
      aria-labelledby='related-features-heading'
    >
      <h2
        id='related-features-heading'
        className='mb-6 text-xl font-bold text-[var(--main-color)] sm:text-2xl'
      >
        Continue Learning Japanese
      </h2>

      <p className='mb-6 text-sm text-[var(--secondary-color)]'>
        Explore more tools and resources to enhance your Japanese learning
        journey.
      </p>

      <nav aria-label='Related features'>
        <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {links.map((link, index) => (
            <li key={index}>
              <Link
                href={getLocalizedHref(link.href)}
                className={cn(
                  'flex h-full flex-col gap-3 rounded-xl p-4',
                  'border border-[var(--border-color)]',
                  'bg-[var(--background-color)]',
                  'hover:border-[var(--main-color)]/50',
                  'hover:bg-[var(--main-color)]/5',
                  'transition-colors duration-200',
                  'group',
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    'bg-[var(--main-color)]/10',
                    'text-[var(--main-color)]',
                    'group-hover:bg-[var(--main-color)]/20',
                    'transition-colors duration-200',
                  )}
                >
                  {link.icon}
                </div>

                {/* Content */}
                <div className='flex-1'>
                  <h3 className='font-semibold text-[var(--main-color)] group-hover:underline'>
                    {link.title}
                  </h3>
                  <p className='mt-1 text-sm text-[var(--secondary-color)]'>
                    {link.description}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Additional SEO text */}
      <p className='mt-6 text-xs text-[var(--secondary-color)]'>
        KanaDojo offers a complete suite of Japanese learning tools. From
        mastering the basics with Hiragana and Katakana practice, to building
        vocabulary and understanding Kanji, our platform supports learners at
        every level. Use the verb conjugator alongside these resources for
        comprehensive Japanese language study.
      </p>
    </section>
  );
}
