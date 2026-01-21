import type { Metadata } from 'next';
import { getBlogPosts, BlogList } from '@/features/Blog';
import { routing, type Locale } from '@/core/i18n/routing';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';

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

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://kanadojo.com/${locale}` },
          { name: 'Academy', url: `https://kanadojo.com/${locale}/academy` },
        ]}
      />
      <header className='mb-8'>
        <h1 className='mb-4 text-3xl font-bold text-[var(--main-color)] md:text-4xl'>
          Academy
        </h1>
        <p className='text-lg text-[var(--secondary-color)]'>
          Explore our collection of Japanese learning articles covering
          Hiragana, Katakana, Kanji, vocabulary, grammar, and Japanese culture.
        </p>
      </header>
      <BlogList posts={posts} showFilter={true} />
    </>
  );
}
