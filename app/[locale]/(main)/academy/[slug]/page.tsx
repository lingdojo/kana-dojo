import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import React from 'react';
import {
  getBlogPost,
  getBlogPosts,
  generateBlogMetadata,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateHreflang,
  getPostLocales,
  BlogPostComponent,
  mdxComponents,
} from '@/features/Blog';
import { StructuredData } from '@/shared/components/SEO/StructuredData';
import { AuthorSchema } from '@/shared/components/SEO/AuthorSchema';
import { routing, type Locale as _Locale } from '@/core/i18n/routing';
import type { Locale as BlogLocale } from '@/features/Blog';

interface AcademyPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/**
 * Generate static params for all blog posts across all locales
 * Enables static generation at build time for optimal SEO
 *
 * _Requirements: 3.4_
 */
export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];

  // Generate params for each locale
  for (const locale of routing.locales) {
    const posts = getBlogPosts(locale as BlogLocale);
    for (const post of posts) {
      params.push({ locale, slug: post.slug });
    }
  }

  return params;
}

/**
 * Generate SEO metadata from blog post frontmatter
 *
 * _Requirements: 4.1_
 */
export async function generateMetadata({
  params,
}: AcademyPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(slug, locale as BlogLocale);

  if (!post) {
    return {
      title: 'Post Not Found | KanaDojo Academy',
      description: 'The requested article could not be found.',
    };
  }

  // Generate base metadata from post
  const metadata = generateBlogMetadata(post);

  // Add hreflang alternates for multi-locale posts
  const availableLocales = getPostLocales(slug);
  if (availableLocales.length > 1) {
    const hreflangTags = generateHreflang(slug, availableLocales);
    const languages: Record<string, string> = {};
    for (const tag of hreflangTags) {
      if (tag.hreflang !== 'x-default') {
        languages[tag.hreflang] = tag.href;
      }
    }
    metadata.alternates = {
      ...metadata.alternates,
      languages,
    };
  }

  return metadata;
}

/**
 * Custom MDX components with premium editorial styling
 */
const components = {
  ...mdxComponents,
  // Standard HTML element styling with editorial refinement
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2
      className='premium-serif mt-14 mb-5 text-4xl font-black tracking-tight text-(--main-color)'
      id={generateHeadingId(String(children))}
    >
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3
      className='premium-serif mt-10 mb-4 text-2xl font-bold text-(--main-color) italic'
      id={generateHeadingId(String(children))}
    >
      {children}
    </h3>
  ),
  h4: ({ children }: { children: React.ReactNode }) => (
    <h4
      className='mt-8 mb-3 text-xl font-bold tracking-tight text-(--main-color)'
      id={generateHeadingId(String(children))}
    >
      {children}
    </h4>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className='mb-6 text-lg leading-[1.85] text-(--secondary-color) opacity-90'>
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => {
    const items = normalizeListItems(children);
    return (
      <ul className='mb-7 list-none space-y-3 pl-0 text-(--secondary-color)'>
        {items.map((child, index) => (
          <li key={index} className='flex items-start gap-4'>
            <span className='mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color) opacity-25' />
            <span className='leading-[1.75]'>{child}</span>
          </li>
        ))}
      </ul>
    );
  },
  ol: ({ children }: { children: React.ReactNode }) => {
    const items = normalizeListItems(children);
    return (
      <ol className='mb-7 list-none space-y-3 pl-0 text-(--secondary-color)'>
        {items.map((child, index) => (
          <li key={index} className='flex items-start gap-4'>
            <span className='mt-1.5 font-mono text-[10px] font-black opacity-25'>
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <span className='leading-[1.75]'>{child}</span>
          </li>
        ))}
      </ol>
    );
  },
  li: ({ children }: { children: React.ReactNode }) => (
    <span className='leading-[1.75]'>{children}</span>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a
      href={href}
      className='font-bold text-(--main-color) underline decoration-(--main-color)/20 underline-offset-4 transition-colors hover:decoration-(--main-color)'
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className='premium-serif my-12 border-l-[3px] border-(--main-color) pl-10 text-3xl leading-[1.6] font-light text-(--main-color) italic opacity-90'>
      {children}
    </blockquote>
  ),
  code: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className='rounded-sm bg-(--card-color) px-2 py-0.5 font-mono text-[0.85em] font-medium text-(--main-color)'>
          {children}
        </code>
      );
    }
    return (
      <code className='block overflow-x-auto rounded-sm border border-(--border-color) bg-(--card-color) p-7 font-mono text-[0.9em]'>
        {children}
      </code>
    );
  },
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className='my-10 overflow-x-auto rounded-sm border border-(--border-color) bg-(--card-color) p-0'>
      {children}
    </pre>
  ),
  hr: () => <hr className='my-20 border-(--border-color) opacity-50' />,
  table: ({ children }: { children: React.ReactNode }) => (
    <div className='my-12 overflow-x-auto rounded-xl border border-(--border-color) bg-(--card-color)/60 p-2 shadow-[0_20px_45px_-40px_rgba(0,0,0,0.45)]'>
      <table className='w-full min-w-[640px] border-separate border-spacing-0 text-left text-base'>
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className='border-b border-(--border-color) bg-(--card-color)/80 px-5 py-4 text-[11px] font-black tracking-[0.24em] text-(--main-color) uppercase'>
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className='border-b border-(--border-color)/80 px-5 py-4 text-base leading-relaxed text-(--secondary-color)'>
      {children}
    </td>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className='font-black text-(--main-color)'>{children}</strong>
  ),
};

function normalizeListItems(children: React.ReactNode) {
  return React.Children.toArray(children)
    .map(child => {
      if (React.isValidElement(child) && child.type === 'li') {
        const listItem = child as React.ReactElement<{
          children?: React.ReactNode;
        }>;
        return listItem.props.children;
      }
      return child;
    })
    .filter(child => {
      if (typeof child === 'string') {
        return child.trim().length > 0;
      }
      return child !== null && child !== undefined;
    });
}

/**
 * Individual Academy Post Page
 * Renders a full blog post with MDX content, structured data,
 * and related posts. Uses static generation for optimal SEO.
 *
 * _Requirements: 3.1, 3.4, 4.1, 4.2, 4.3_
 */
export default async function AcademyPostPage({
  params,
}: AcademyPostPageProps) {
  const { locale, slug } = await params;
  const post = getBlogPost(slug, locale as BlogLocale);

  if (!post) {
    notFound();
  }

  // Generate structured data schemas
  const articleSchema = generateArticleSchema(post);
  const breadcrumbSchema = generateBreadcrumbSchema(post);

  // Get related posts metadata
  const relatedPostsMeta = post.relatedPosts
    ? getBlogPosts(locale as BlogLocale).filter(p =>
        post.relatedPosts?.includes(p.slug),
      )
    : [];

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData data={articleSchema} />
      <StructuredData data={breadcrumbSchema} />
      <AuthorSchema
        name={post.author || 'KanaDojo Team'}
        url='https://kanadojo.com'
        jobTitle='Japanese Language Education Team'
        affiliation='KanaDojo'
        expertise='Japanese Language Education, Hiragana, Katakana, Kanji, JLPT Preparation'
        description='The KanaDojo team creates free, interactive Japanese learning tools and in-depth educational content to help learners at every level.'
        sameAs={['https://github.com/lingdojo/kanadojo']}
      />

      <BlogPostComponent post={post} relatedPosts={relatedPostsMeta}>
        {/* Render MDX content with custom components */}
        <MDXRemote source={post.content} components={components} />
      </BlogPostComponent>
    </>
  );
}

/**
 * Helper function to generate heading IDs for anchor links
 */
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
