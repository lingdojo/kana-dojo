import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing, type Locale } from '@/core/i18n/routing';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';

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
  return await generatePageMetadata('katakanaPractice', {
    locale: locale as Locale,
    pathname: '/katakana-practice',
  });
}

export default async function KatakanaPracticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'practiceLanding' as const,
  });

  const bulletsHow = t.raw('katakana.sections.how.bullets') as string[];
  const bulletsWhy = t.raw('katakana.sections.why.bullets') as string[];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://kanadojo.com/${locale}` },
          {
            name: t('katakana.title'),
            url: `https://kanadojo.com/${locale}/katakana-practice`,
          },
        ]}
      />

      <div className='mx-auto max-w-4xl px-4 py-8'>
        <Breadcrumbs
          items={[
            { name: 'Home', url: `/${locale}` },
            {
              name: t('katakana.title'),
              url: `/${locale}/katakana-practice`,
            },
          ]}
        />
        <header className='mb-8 text-center'>
          <h1 className='mb-3 text-4xl font-bold text-(--main-color)'>
            {t('katakana.title')}
          </h1>
          <p className='text-lg text-(--secondary-color)'>
            {t('katakana.subtitle')}
          </p>

          <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center'>
            <Link
              href={`/${locale}/kana/train`}
              className='rounded-lg bg-(--main-color) px-6 py-3 font-semibold text-(--background-color) transition-all hover:opacity-90'
            >
              {t('katakana.ctaPrimary')} →
            </Link>
            <Link
              href={`/${locale}/kana`}
              className='rounded-lg border-2 border-(--border-color) px-6 py-3 font-semibold text-(--main-color) transition-all hover:border-(--main-color)'
            >
              {t('katakana.ctaSecondary')} →
            </Link>
          </div>
        </header>

        <main className='space-y-8 text-(--secondary-color)'>
          <section className='rounded-lg border-2 border-(--border-color) bg-(--card-color) p-6'>
            <h2 className='mb-3 text-2xl font-semibold text-(--main-color)'>
              {t('katakana.sections.what.title')}
            </h2>
            <p>{t('katakana.sections.what.body')}</p>
          </section>

          <section className='rounded-lg border-2 border-(--border-color) bg-(--card-color) p-6'>
            <h2 className='mb-3 text-2xl font-semibold text-(--main-color)'>
              {t('katakana.sections.how.title')}
            </h2>
            <ul className='list-disc space-y-2 pl-6'>
              {bulletsHow.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className='rounded-lg border-2 border-(--border-color) bg-(--card-color) p-6'>
            <h2 className='mb-3 text-2xl font-semibold text-(--main-color)'>
              {t('katakana.sections.why.title')}
            </h2>
            <ul className='list-disc space-y-2 pl-6'>
              {bulletsWhy.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className='rounded-lg border-2 border-(--border-color) bg-(--card-color) p-6'>
            <h2 className='mb-4 text-2xl font-semibold text-(--main-color)'>
              {t('katakana.links.kana')}
            </h2>
            <div className='grid gap-3 sm:grid-cols-2'>
              <Link
                href={`/${locale}/kana/train`}
                className='rounded-lg border-2 border-(--border-color) px-4 py-3 font-semibold text-(--main-color) transition-all hover:border-(--main-color)'
              >
                {t('katakana.links.train')} →
              </Link>
              <Link
                href={`/${locale}/kana/blitz`}
                className='rounded-lg border-2 border-(--border-color) px-4 py-3 font-semibold text-(--main-color) transition-all hover:border-(--main-color)'
              >
                {t('katakana.links.blitz')} →
              </Link>
              <Link
                href={`/${locale}/kana/gauntlet`}
                className='rounded-lg border-2 border-(--border-color) px-4 py-3 font-semibold text-(--main-color) transition-all hover:border-(--main-color)'
              >
                {t('katakana.links.gauntlet')} →
              </Link>
              <Link
                href={`/${locale}/faq`}
                className='rounded-lg border-2 border-(--border-color) px-4 py-3 font-semibold text-(--main-color) transition-all hover:border-(--main-color)'
              >
                {t('katakana.links.faq')} →
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
