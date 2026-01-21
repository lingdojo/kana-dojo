import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing, type Locale } from '@/core/i18n/routing';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return await generatePageMetadata('kanjiPractice', {
    locale: locale as Locale,
    pathname: '/kanji-practice',
  });
}

export default async function KanjiPracticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'practiceLanding' as const,
  });

  const bulletsHow = t.raw('kanji.sections.how.bullets') as string[];
  const bulletsWhy = t.raw('kanji.sections.why.bullets') as string[];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://kanadojo.com/${locale}` },
          {
            name: t('kanji.title'),
            url: `https://kanadojo.com/${locale}/kanji-practice`,
          },
        ]}
      />

      <div className='mx-auto max-w-4xl px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='mb-3 text-4xl font-bold text-[var(--main-color)]'>
            {t('kanji.title')}
          </h1>
          <p className='text-lg text-[var(--secondary-color)]'>
            {t('kanji.subtitle')}
          </p>

          <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center'>
            <Link
              href={`/${locale}/kanji/train`}
              className='rounded-lg bg-[var(--main-color)] px-6 py-3 font-semibold text-[var(--background-color)] transition-all hover:opacity-90'
            >
              {t('kanji.ctaPrimary')} →
            </Link>
            <Link
              href={`/${locale}/kanji`}
              className='rounded-lg border-2 border-[var(--border-color)] px-6 py-3 font-semibold text-[var(--main-color)] transition-all hover:border-[var(--main-color)]'
            >
              {t('kanji.ctaSecondary')} →
            </Link>
          </div>
        </header>

        <main className='space-y-8 text-[var(--secondary-color)]'>
          <section className='rounded-lg border-2 border-[var(--border-color)] bg-[var(--card-color)] p-6'>
            <h2 className='mb-3 text-2xl font-semibold text-[var(--main-color)]'>
              {t('kanji.sections.what.title')}
            </h2>
            <p>{t('kanji.sections.what.body')}</p>
          </section>

          <section className='rounded-lg border-2 border-[var(--border-color)] bg-[var(--card-color)] p-6'>
            <h2 className='mb-3 text-2xl font-semibold text-[var(--main-color)]'>
              {t('kanji.sections.how.title')}
            </h2>
            <ul className='list-disc space-y-2 pl-6'>
              {bulletsHow.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className='rounded-lg border-2 border-[var(--border-color)] bg-[var(--card-color)] p-6'>
            <h2 className='mb-3 text-2xl font-semibold text-[var(--main-color)]'>
              {t('kanji.sections.why.title')}
            </h2>
            <ul className='list-disc space-y-2 pl-6'>
              {bulletsWhy.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className='rounded-lg border-2 border-[var(--border-color)] bg-[var(--card-color)] p-6'>
            <h2 className='mb-4 text-2xl font-semibold text-[var(--main-color)]'>
              {t('kanji.links.kanji')}
            </h2>
            <div className='grid gap-3 sm:grid-cols-2'>
              <Link
                href={`/${locale}/kanji/train`}
                className='rounded-lg border-2 border-[var(--border-color)] px-4 py-3 font-semibold text-[var(--main-color)] transition-all hover:border-[var(--main-color)]'
              >
                {t('kanji.links.train')} →
              </Link>
              <Link
                href={`/${locale}/kanji/blitz`}
                className='rounded-lg border-2 border-[var(--border-color)] px-4 py-3 font-semibold text-[var(--main-color)] transition-all hover:border-[var(--main-color)]'
              >
                {t('kanji.links.blitz')} →
              </Link>
              <Link
                href={`/${locale}/kanji/gauntlet`}
                className='rounded-lg border-2 border-[var(--border-color)] px-4 py-3 font-semibold text-[var(--main-color)] transition-all hover:border-[var(--main-color)]'
              >
                {t('kanji.links.gauntlet')} →
              </Link>
              <Link
                href={`/${locale}/jlpt/n5`}
                className='rounded-lg border-2 border-[var(--border-color)] px-4 py-3 font-semibold text-[var(--main-color)] transition-all hover:border-[var(--main-color)]'
              >
                {t('kanji.links.jlpt')} →
              </Link>
              <Link
                href={`/${locale}/faq`}
                className='rounded-lg border-2 border-[var(--border-color)] px-4 py-3 font-semibold text-[var(--main-color)] transition-all hover:border-[var(--main-color)]'
              >
                {t('kanji.links.faq')} →
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
