'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import type {
  BlogPost as BlogPostType,
  BlogPostMeta,
  Category
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
  culture: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
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
 * BlogPost Component
 * Renders a full blog article with MDX content, table of contents,
 * and related posts sections. Uses semantic HTML for accessibility
 * and SEO optimization.
 */
export function BlogPost({
  post,
  relatedPosts = [],
  children,
  className
}: BlogPostProps) {
  const { playClick } = useClick();

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedUpdatedDate = post.updatedAt
    ? new Date(post.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return (
    <article
      className={cn('mx-auto max-w-4xl', className)}
      data-testid='blog-post'
    >
      {/* Back to Academy Button - Top */}
      <Link href='/academy' className='block mb-6' onClick={playClick}>
        <ActionButton
          colorScheme='secondary'
          borderColorScheme='secondary'
          borderBottomThickness={4}
          className='w-auto inline-flex'
        >
          <ArrowLeft className='size-5' />
          <span>Back to Academy</span>
        </ActionButton>
      </Link>

      {/* Article Header */}
      <header className='mb-8' data-testid='blog-post-header'>
        {/* Category and Difficulty Badges */}
        <div className='mb-4 flex items-center gap-2'>
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium capitalize',
              categoryColors[post.category]
            )}
            data-testid='blog-post-category'
          >
            {post.category}
          </span>
          {post.difficulty && (
            <span
              className='inline-flex items-center rounded-full border border-[var(--border-color)] bg-[var(--background-color)] px-3 py-1 text-sm font-medium capitalize text-[var(--secondary-color)]'
              data-testid='blog-post-difficulty'
            >
              {post.difficulty}
            </span>
          )}
        </div>

        {/* Title - h1 for proper heading hierarchy */}
        <h1
          className='mb-4 text-3xl font-bold leading-tight text-[var(--main-color)] md:text-4xl'
          data-testid='blog-post-title'
        >
          {post.title}
        </h1>

        {/* Description */}
        <p
          className='mb-6 text-lg text-[var(--secondary-color)]'
          data-testid='blog-post-description'
        >
          {post.description}
        </p>

        {/* Meta Information */}
        <div className='flex flex-wrap items-center gap-4 text-sm text-[var(--secondary-color)]'>
          <span data-testid='blog-post-author'>By {post.author}</span>
          <span className='text-[var(--border-color)]'>•</span>
          <time dateTime={post.publishedAt} data-testid='blog-post-date'>
            {formattedDate}
          </time>
          {formattedUpdatedDate && (
            <>
              <span className='text-[var(--border-color)]'>•</span>
              <span data-testid='blog-post-updated'>
                Updated: {formattedUpdatedDate}
              </span>
            </>
          )}
          <span className='text-[var(--border-color)]'>•</span>
          <span data-testid='blog-post-reading-time'>
            {post.readingTime} min read
          </span>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div
            className='mt-4 flex flex-wrap gap-2'
            data-testid='blog-post-tags'
          >
            {post.tags.map(tag => (
              <span
                key={tag}
                className='rounded-full bg-[var(--background-color)] px-3 py-1 text-xs text-[var(--secondary-color)]'
                data-testid={`blog-post-tag-${tag}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area with Sidebar */}
      <div className='flex flex-col gap-8 lg:flex-row'>
        {/* Main Content */}
        <main className='min-w-0 flex-1' data-testid='blog-post-main'>
          {/* Table of Contents (Mobile - shown above content) */}
          {post.headings.length > 0 && (
            <section
              className='mb-8 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] p-6 lg:hidden'
              aria-label='Table of contents'
              data-testid='blog-post-toc-mobile'
            >
              <TableOfContents headings={post.headings} />
            </section>
          )}

          {/* MDX Content */}
          <section
            className='prose prose-lg max-w-none text-[var(--secondary-color)] prose-headings:text-[var(--main-color)] prose-a:text-[var(--main-color)] prose-strong:text-[var(--main-color)] prose-code:text-[var(--main-color)]'
            data-testid='blog-post-content'
          >
            {children}
          </section>

          {/* Related Posts Section */}
          {relatedPosts.length > 0 && (
            <section className='mt-12' data-testid='blog-post-related-section'>
              <RelatedPosts posts={relatedPosts} />
            </section>
          )}

          {/* Back to Academy Button - Bottom */}
          <Link href='/academy' className='block mt-12' onClick={playClick}>
            <ActionButton
              colorScheme='main'
              borderColorScheme='main'
              borderBottomThickness={4}
            >
              <BookOpen className='size-5' />
              <span>Browse All Articles</span>
            </ActionButton>
          </Link>
        </main>

        {/* Sidebar with Table of Contents (Desktop) */}
        <aside
          className='hidden w-64 shrink-0 lg:block'
          data-testid='blog-post-sidebar'
        >
          <div className='sticky top-8 space-y-4'>
            {/* Back to Academy Button - Sidebar */}
            <Link href='/academy' className='block' onClick={playClick}>
              <ActionButton
                colorScheme='secondary'
                borderColorScheme='secondary'
                borderBottomThickness={4}
                borderRadius='xl'
              >
                <ArrowLeft className='size-4' />
                <span className='text-sm'>Back to Academy</span>
              </ActionButton>
            </Link>

            {/* Table of Contents */}
            {post.headings.length > 0 && (
              <div className='rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] p-6'>
                <TableOfContents headings={post.headings} />
              </div>
            )}
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
