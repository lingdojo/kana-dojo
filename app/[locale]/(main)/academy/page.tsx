import type { Metadata } from 'next';
import { getBlogPosts, BlogList } from '@/features/Blog';
import { routing, type Locale } from '@/core/i18n/routing';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';

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
      <header
        className='relative mb-24 flex flex-col items-start justify-center pt-12'
        data-testid='academy-header'
      >
        {/* Editorial Subtitle */}
        <div className='mb-6 flex items-center gap-4'>
          <span className='h-[1px] w-12 bg-[var(--main-color)] opacity-20' />
          <span className='text-[10px] font-black tracking-[0.4em] text-[var(--main-color)] uppercase opacity-60'>
            The Collected Journal
          </span>
        </div>

        {/* Main Title */}
        <h1 className='premium-serif relative z-10 text-7xl font-black tracking-tighter text-[var(--main-color)] md:text-8xl lg:text-9xl'>
          Academy
          <span className='text-[var(--secondary-color)] opacity-10'>.</span>
        </h1>

        {/* Decorative Element */}
        <div className='absolute -top-4 -left-12 -z-10 font-serif text-[18rem] font-black tracking-tighter text-[var(--main-color)] opacity-[0.03] select-none md:text-[24rem]'>
          A
        </div>

        {/* Refined Description */}
        <div className='mt-8 max-w-2xl'>
          <p className='text-xl leading-relaxed text-[var(--secondary-color)] opacity-80 md:text-2xl'>
            A curated compendium of Japanese linguistic insights, cultural
            dossiers, and strategic studies for the modern learner.
          </p>
        </div>
      </header>
      <BlogList posts={posts} showFilter={true} />
    </>
  );
}
