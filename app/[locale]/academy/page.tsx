import type { Metadata } from 'next';
import { getBlogPosts, BlogList } from '@/features/Blog';
import { routing, type Locale } from '@/core/i18n/routing';
import SidebarLayout from '@/shared/components/layout/SidebarLayout';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Academy - Japanese Learning Articles | KanaDojo',
  description:
    'Explore our collection of Japanese learning articles covering Hiragana, Katakana, Kanji, vocabulary, grammar, and Japanese culture. Free educational content for all levels.',
  openGraph: {
    title: 'Academy - Japanese Learning Articles | KanaDojo',
    description:
      'Explore our collection of Japanese learning articles covering Hiragana, Katakana, Kanji, vocabulary, grammar, and Japanese culture.',
    url: 'https://kanadojo.com/academy',
    type: 'website'
  },
  alternates: {
    canonical: 'https://kanadojo.com/academy'
  }
};

interface AcademyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AcademyPage({ params }: AcademyPageProps) {
  const { locale } = await params;
  const posts = getBlogPosts(locale as Locale);

  return (
    <SidebarLayout>
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
    </SidebarLayout>
  );
}
