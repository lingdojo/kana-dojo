import type { Metadata } from 'next';
import { getBlogPosts, BlogList } from '@/features/Blog';
import { routing, type Locale } from '@/core/i18n/routing';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
import { StructuredData } from '@/shared/components/SEO/StructuredData';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return await generatePageMetadata('academy', {
    locale,
    pathname: '/academy',
  });
}

interface AcademyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AcademyPage({ params }: AcademyPageProps) {
  const { locale } = await params;
  const posts = getBlogPosts(locale as Locale);

  // Generate ItemList schema for blog post collection
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'KanaDojo Academy — Japanese Learning Articles',
    description:
      'A curated collection of Japanese learning guides, tutorials, and study tips covering Hiragana, Katakana, Kanji, vocabulary, grammar, and JLPT preparation.',
    numberOfItems: posts.length,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: posts.slice(0, 20).map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://kanadojo.com/${locale}/academy/${post.slug}`,
      name: post.title,
    })),
  };

  // Generate CollectionPage schema
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'KanaDojo Academy',
    description:
      'A comprehensive collection of Japanese learning articles, tutorials, and study guides.',
    url: `https://kanadojo.com/${locale}/academy`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'KanaDojo',
      url: 'https://kanadojo.com',
    },
    about: {
      '@type': 'Thing',
      name: 'Japanese Language Learning',
    },
    inLanguage: locale === 'es' ? 'es' : 'en',
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://kanadojo.com/${locale}` },
          { name: 'Academy', url: `https://kanadojo.com/${locale}/academy` },
        ]}
      />
      <StructuredData data={itemListSchema} />
      <StructuredData data={collectionPageSchema} />
      <header
        className='relative mb-24 flex flex-col items-start justify-center pt-12'
        data-testid='academy-header'
      >
        {/* Editorial Subtitle */}
        <div className='mb-6 flex items-center gap-4'>
          <span className='h-[1px] w-12 bg-(--main-color) opacity-20' />
          <span className='text-[10px] font-black tracking-[0.4em] text-(--main-color) uppercase opacity-60'>
            The Collected Journal
          </span>
        </div>

        {/* Main Title */}
        <h1 className='premium-serif relative z-10 text-7xl font-black tracking-tighter text-(--main-color) md:text-8xl lg:text-9xl'>
          Academy
          <span className='text-(--secondary-color) opacity-10'>.</span>
        </h1>

        {/* Decorative Element */}
        <div className='absolute -top-4 -left-12 -z-10 font-serif text-[18rem] font-black tracking-tighter text-(--main-color) opacity-[0.03] select-none md:text-[24rem]'>
          A
        </div>

        {/* Refined Description */}
        <div className='mt-8 max-w-2xl'>
          <p className='text-xl leading-relaxed text-(--secondary-color) opacity-80 md:text-2xl'>
            A curated compendium of Japanese linguistic insights, cultural
            dossiers, and strategic studies for the modern learner.
          </p>
        </div>
      </header>
      <BlogList posts={posts} showFilter={true} />
    </>
  );
}
