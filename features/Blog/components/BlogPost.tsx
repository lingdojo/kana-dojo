'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import {
  formatLastUpdated,
  getFreshnessBadge,
} from '@/shared/lib/content-freshness';
import type {
  BlogPost as BlogPostType,
  BlogPostMeta,
  Category,
} from '../types/blog';
import { TableOfContents } from './TableOfContents';
import { RelatedPosts } from './RelatedPosts';
import { mdxComponents } from './mdx';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { Link } from '@/core/i18n/routing';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useClick } from '@/shared/hooks/useAudio';

/**
 * Category badge color mappings
 */
const categoryColors: Record<Category, string> = {
  hiragana: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  katakana: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  kanji: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  vocabulary: 'bg-green-500/20 text-green-400 border-green-500/30',
  grammar: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  culture: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  comparison: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  tutorial: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  resources: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'study-tips': 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  jlpt: 'bg-red-500/20 text-red-400 border-red-500/30',
};

interface BlogPostProps {
  /** Full blog post data including content and headings */
  post: BlogPostType;
  /** Related posts metadata for the RelatedPosts section */
  relatedPosts?: BlogPostMeta[];
  /** Rendered MDX content as React node */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Premium Editorial BlogPost Component
 * Overhauled for a high-end reading experience with bold typography,
 * intentional whitespace, and sophisticated layout.
 */
export function BlogPost({
  post,
  relatedPosts = [],
  children,
  className,
}: BlogPostProps) {
  const { playClick } = useClick();

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}
      data-testid='blog-post'
    >
      {/* Back Navigation Bar - Minimalist */}
      <nav className='mb-16 flex items-center justify-between border-b border-(--border-color) py-12'>
        <Link
          href='/academy'
          className='group flex items-center gap-3 text-[10px] font-black tracking-[0.3em] text-(--main-color) uppercase opacity-60 transition-opacity hover:opacity-100'
          onClick={playClick}
        >
          <ArrowLeft
            size={14}
            className='transition-transform group-hover:-translate-x-1'
          />
          Return to Journal
        </Link>
        <span className='font-mono text-[10px] opacity-20'>
          {post.readingTime} MIN SESSION
        </span>
      </nav>

      <div className='flex flex-col lg:flex-row lg:gap-20 xl:gap-32'>
        {/* Main Article Container */}
        <div className='min-w-0 flex-1'>
          {/* Hero Header Section */}
          <header className='mb-20 text-left'>
            <div className='mb-8 flex items-center gap-4'>
              <span className='h-[1px] w-8 bg-(--main-color) opacity-20' />
              <span className='text-[10px] font-black tracking-[0.2em] text-(--main-color) uppercase'>
                {post.category}
              </span>
            </div>

            <h1 className='premium-serif mb-10 text-5xl leading-[1.05] font-black tracking-tight text-(--main-color) md:text-7xl lg:text-8xl'>
              {post.title}
            </h1>

            <p className='mb-12 max-w-3xl text-xl leading-relaxed font-medium text-(--secondary-color) opacity-80 md:text-2xl lg:text-3xl'>
              {post.description}
            </p>

            <div className='flex flex-wrap items-center gap-6 border-y border-(--border-color) py-8 text-[11px] font-bold tracking-widest text-(--main-color) uppercase'>
              <div className='flex items-center gap-3'>
                <span className='italic opacity-40'>Text by</span>
                <span className='border-b border-(--main-color)'>
                  {post.author}
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <span className='italic opacity-40'>Released</span>
                <time dateTime={post.publishedAt}>{formattedDate}</time>
              </div>
              {post.updatedAt && (
                <div className='flex items-center gap-3'>
                  <span className='italic opacity-40'>Updated</span>
                  <time dateTime={post.updatedAt}>
                    {formatLastUpdated(post.updatedAt)}
                  </time>
                  {(() => {
                    const badge = getFreshnessBadge(post.updatedAt);
                    if (badge.variant === 'fresh') {
                      return (
                        <span className='rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-500 normal-case'>
                          {badge.label}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
              {post.difficulty && (
                <div className='ml-auto flex items-center gap-3'>
                  <span className='italic opacity-40'>Level</span>
                  <span>{post.difficulty}</span>
                </div>
              )}
            </div>
          </header>

          {/* Social / Share Placeholder (Minimal) */}
          <div className='mb-12 lg:hidden'>
            {post.headings.length > 0 && (
              <div className='rounded-sm border border-(--border-color) bg-(--background-color) p-6'>
                <TableOfContents headings={post.headings} />
              </div>
            )}
          </div>

          {/* Article Body Content */}
          <main className='editorial-content mx-auto max-w-3xl lg:mx-0'>
            <div className='editorial-drop-cap prose-lg prose-serif leading-[1.8] text-(--secondary-color)'>
              {children}
            </div>

            {/* Tag Dossier */}
            {post.tags.length > 0 && (
              <footer className='mt-24 border-t border-(--border-color) pt-12'>
                <h4 className='mb-6 text-[10px] font-black tracking-[0.4em] text-(--main-color) uppercase opacity-30'>
                  Dossier Keywords
                </h4>
                <div className='flex flex-wrap gap-3'>
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className='rounded-sm border border-(--border-color) bg-(--card-color) px-4 py-2 text-xs font-medium text-(--secondary-color) transition-colors hover:border-(--main-color)'
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </footer>
            )}

            {/* Related Studies Section */}
            {relatedPosts.length > 0 && (
              <section className='mt-32 border-t-[3px] border-(--main-color) pt-16'>
                <h3 className='premium-serif mb-12 text-4xl font-black italic'>
                  Complementary Studies
                </h3>
                <RelatedPosts posts={relatedPosts} />
              </section>
            )}

            {/* Bottom Nav */}
            <div className='mt-24 pb-24'>
              <Link
                href='/academy'
                onClick={playClick}
                className='group inline-flex items-center gap-6'
              >
                <div className='flex h-16 w-16 items-center justify-center rounded-full border border-(--border-color) transition-all duration-500 group-hover:border-(--main-color) group-hover:bg-(--main-color) group-hover:text-(--background-color)'>
                  <BookOpen size={24} />
                </div>
                <div className='flex flex-col'>
                  <span className='text-[10px] font-black tracking-[0.2em] uppercase opacity-40'>
                    Academy Archive
                  </span>
                  <span className='border-b border-transparent text-xl font-bold transition-all group-hover:border-(--main-color)'>
                    Explore More Journals
                  </span>
                </div>
              </Link>
            </div>
          </main>
        </div>

        {/* Floating Sidebar (Desktop Only) */}
        <aside className='hidden w-72 shrink-0 lg:block'>
          <div className='sticky top-24 space-y-16'>
            {/* Minimal TOC */}
            {post.headings.length > 0 && (
              <div className='border-l border-(--border-color) pl-8'>
                <h5 className='mb-8 text-[10px] font-black tracking-[0.3em] text-(--main-color) uppercase opacity-30'>
                  Journal Index
                </h5>
                <TableOfContents headings={post.headings} />
              </div>
            )}

            {/* Side Branding */}
            <div className='border-t border-dashed border-(--border-color) py-12 pl-8 select-none'>
              <div className='premium-serif origin-left translate-x-12 rotate-[-90deg] text-5xl font-black text-(--main-color) italic opacity-[0.05]'>
                KanaDojo.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

/**
 * Export MDX components for use in page rendering
 */
export { mdxComponents };

export default BlogPost;
