import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { routing, type Locale } from '@/core/i18n/routing';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
import FAQSection from './FAQSection';
import { StructuredData } from '@/shared/components/SEO/StructuredData';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return await generatePageMetadata('faq', {
    locale: locale as Locale,
    pathname: '/faq',
  });
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' as const });

  const groups = [
    {
      id: 'getting-started',
      title: t('sections.gettingStarted.title'),
      description: t('sections.gettingStarted.description'),
      faqs: [
        {
          question: t('sections.gettingStarted.q1.question'),
          answer: t('sections.gettingStarted.q1.answer'),
        },
        {
          question: t('sections.gettingStarted.q2.question'),
          answer: t('sections.gettingStarted.q2.answer'),
        },
        {
          question: t('sections.gettingStarted.q3.question'),
          answer: t('sections.gettingStarted.q3.answer'),
        },
      ],
    },
    {
      id: 'learning-path',
      title: t('sections.learningPath.title'),
      description: t('sections.learningPath.description'),
      faqs: [
        {
          question: t('sections.learningPath.q1.question'),
          answer: t('sections.learningPath.q1.answer'),
        },
        {
          question: t('sections.learningPath.q2.question'),
          answer: t('sections.learningPath.q2.answer'),
        },
        {
          question: t('sections.learningPath.q3.question'),
          answer: t('sections.learningPath.q3.answer'),
        },
      ],
    },
    {
      id: 'features',
      title: t('sections.features.title'),
      description: t('sections.features.description'),
      faqs: [
        {
          question: t('sections.features.q1.question'),
          answer: t('sections.features.q1.answer'),
        },
        {
          question: t('sections.features.q2.question'),
          answer: t('sections.features.q2.answer'),
        },
        {
          question: t('sections.features.q3.question'),
          answer: t('sections.features.q3.answer'),
        },
      ],
    },
    {
      id: 'privacy-data',
      title: t('sections.privacy.title'),
      description: t('sections.privacy.description'),
      faqs: [
        {
          question: t('sections.privacy.q1.question'),
          answer: t('sections.privacy.q1.answer'),
        },
        {
          question: t('sections.privacy.q2.question'),
          answer: t('sections.privacy.q2.answer'),
        },
        {
          question: t('sections.privacy.q3.question'),
          answer: t('sections.privacy.q3.answer'),
        },
      ],
    },
    {
      id: 'jlpt',
      title: t('sections.jlpt.title'),
      description: t('sections.jlpt.description'),
      faqs: [
        {
          question: t('sections.jlpt.q1.question'),
          answer: t('sections.jlpt.q1.answer'),
        },
        {
          question: t('sections.jlpt.q2.question'),
          answer: t('sections.jlpt.q2.answer'),
        },
        {
          question: t('sections.jlpt.q3.question'),
          answer: t('sections.jlpt.q3.answer'),
        },
      ],
    },
    {
      id: 'troubleshooting',
      title: t('sections.troubleshooting.title'),
      description: t('sections.troubleshooting.description'),
      faqs: [
        {
          question: t('sections.troubleshooting.q1.question'),
          answer: t('sections.troubleshooting.q1.answer'),
        },
        {
          question: t('sections.troubleshooting.q2.question'),
          answer: t('sections.troubleshooting.q2.answer'),
        },
        {
          question: t('sections.troubleshooting.q3.question'),
          answer: t('sections.troubleshooting.q3.answer'),
        },
      ],
    },
  ];

  const faqsForSchema = groups.flatMap(group => group.faqs);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `https://kanadojo.com/${locale}/faq#faq`,
    inLanguage: locale,
    mainEntity: faqsForSchema.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <StructuredData data={faqSchema} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://kanadojo.com/${locale}` },
          { name: 'FAQ', url: `https://kanadojo.com/${locale}/faq` },
        ]}
      />

      <div className='relative overflow-hidden'>
        <div className='pointer-events-none absolute inset-0'>
          <div className='absolute -top-40 -left-40 h-128 w-lg rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--main-color),transparent_65%)_0%,transparent_70%)] blur-2xl' />
          <div className='absolute -right-40 -bottom-64 h-176 w-176 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--secondary-color),transparent_70%)_0%,transparent_70%)] blur-2xl' />
          <div className='absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--main-color),transparent_55%),transparent)]' />
        </div>

        <div className='mx-auto max-w-6xl px-4 py-10 sm:py-14'>
          <Breadcrumbs
            items={[
              { name: 'Home', url: `/${locale}` },
              { name: t('title'), url: `/${locale}/faq` },
            ]}
            className='mb-8'
          />

          <header className='relative mb-10'>
            <div className='max-w-3xl'>
              <p className='text-xs font-semibold tracking-[0.25em] text-(--secondary-color)'>
                {t('kicker')}
              </p>
              <h1 className='mt-3 text-4xl font-bold tracking-tight text-balance text-(--main-color) sm:text-5xl'>
                {t('title')}
              </h1>
              <p className='mt-4 max-w-2xl text-base leading-relaxed text-pretty text-(--secondary-color) sm:text-lg'>
                {t('subtitle')}
              </p>
            </div>

            <div className='mt-7 flex flex-wrap gap-3'>
              <Link
                href={`/${locale}/how-to-use`}
                className='rounded-full border border-(--border-color) bg-[color-mix(in_oklab,var(--card-color),var(--main-color)_6%)] px-4 py-2 text-sm font-semibold text-(--main-color) shadow-[0_1px_0_rgba(0,0,0,0.05)] transition-colors hover:bg-[color-mix(in_oklab,var(--card-color),var(--main-color)_10%)]'
              >
                {t('links.howToUse')}
              </Link>
              <Link
                href={`/${locale}/glossary`}
                className='rounded-full border border-(--border-color) bg-[color-mix(in_oklab,var(--card-color),transparent_0%)] px-4 py-2 text-sm font-semibold text-(--main-color) shadow-[0_1px_0_rgba(0,0,0,0.05)] transition-colors hover:bg-[color-mix(in_oklab,var(--card-color),var(--main-color)_6%)]'
              >
                {t('links.glossary')}
              </Link>
              <Link
                href={`/${locale}/translate`}
                className='rounded-full border border-(--border-color) bg-[color-mix(in_oklab,var(--card-color),transparent_0%)] px-4 py-2 text-sm font-semibold text-(--main-color) shadow-[0_1px_0_rgba(0,0,0,0.05)] transition-colors hover:bg-[color-mix(in_oklab,var(--card-color),var(--main-color)_6%)]'
              >
                {t('links.translator')}
              </Link>
              <Link
                href={`/${locale}/academy`}
                className='rounded-full border border-(--border-color) bg-[color-mix(in_oklab,var(--card-color),transparent_0%)] px-4 py-2 text-sm font-semibold text-(--main-color) shadow-[0_1px_0_rgba(0,0,0,0.05)] transition-colors hover:bg-[color-mix(in_oklab,var(--card-color),var(--main-color)_6%)]'
              >
                {t('links.academy')}
              </Link>
            </div>
          </header>

          <div className='grid gap-10 lg:grid-cols-[18rem_1fr]'>
            <aside className='lg:sticky lg:top-24 lg:self-start'>
              <div className='rounded-3xl border border-(--border-color) bg-[color-mix(in_oklab,var(--card-color),transparent_0%)] p-5 shadow-[0_1px_0_rgba(0,0,0,0.06),0_20px_60px_rgba(0,0,0,0.12)]'>
                <div className='mb-4 flex items-baseline justify-between'>
                  <h2 className='text-sm font-semibold tracking-tight text-(--main-color)'>
                    {t('nav.title')}
                  </h2>
                  <a
                    href='#top'
                    className='text-xs font-semibold text-(--secondary-color) underline-offset-4 hover:underline'
                  >
                    {t('nav.backToTop')}
                  </a>
                </div>
                <nav aria-label={t('nav.aria')} className='space-y-1'>
                  {groups.map(group => (
                    <a
                      key={group.id}
                      href={`#${group.id}`}
                      className='block rounded-xl px-3 py-2 text-sm font-semibold text-(--secondary-color) transition-colors hover:bg-[color-mix(in_oklab,var(--card-color),var(--main-color)_6%)] hover:text-(--main-color)'
                    >
                      {group.title}
                    </a>
                  ))}
                </nav>

                <div className='mt-6 border-t border-(--border-color) pt-5'>
                  <p className='text-xs leading-relaxed text-(--secondary-color)'>
                    {t('nav.note')}
                  </p>
                  <div className='mt-3 grid gap-2'>
                    <Link
                      href={`/${locale}/privacy`}
                      className='text-sm font-semibold text-(--main-color) underline-offset-4 hover:underline'
                    >
                      {t('links.privacy')}
                    </Link>
                    <Link
                      href={`/${locale}/terms`}
                      className='text-sm font-semibold text-(--main-color) underline-offset-4 hover:underline'
                    >
                      {t('links.terms')}
                    </Link>
                  </div>
                </div>
              </div>
            </aside>

            <main id='top' className='min-w-0'>
              <div className='mb-10 rounded-3xl border border-(--border-color) bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card-color),var(--main-color)_10%),color-mix(in_oklab,var(--card-color),transparent_0%))] p-6 shadow-[0_1px_0_rgba(0,0,0,0.06),0_18px_60px_rgba(0,0,0,0.10)] sm:p-8'>
                <h2 className='text-xl font-semibold tracking-tight text-(--main-color) sm:text-2xl'>
                  {t('intro.title')}
                </h2>
                <p className='mt-3 text-sm leading-relaxed text-(--secondary-color) sm:text-base'>
                  {t('intro.body')}
                </p>
                <div className='mt-6 flex flex-wrap gap-3'>
                  <Link
                    href={`/${locale}/hiragana-practice`}
                    className='rounded-full bg-(--main-color) px-4 py-2 text-sm font-semibold text-(--background-color) shadow-[0_10px_30px_color-mix(in_oklab,var(--main-color),transparent_75%)] transition-transform hover:-translate-y-px'
                  >
                    {t('cta.hiragana')}
                  </Link>
                  <Link
                    href={`/${locale}/katakana-practice`}
                    className='rounded-full border border-(--border-color) bg-[color-mix(in_oklab,var(--card-color),transparent_0%)] px-4 py-2 text-sm font-semibold text-(--main-color) transition-colors hover:bg-[color-mix(in_oklab,var(--card-color),var(--main-color)_6%)]'
                  >
                    {t('cta.katakana')}
                  </Link>
                  <Link
                    href={`/${locale}/kanji-practice`}
                    className='rounded-full border border-(--border-color) bg-[color-mix(in_oklab,var(--card-color),transparent_0%)] px-4 py-2 text-sm font-semibold text-(--main-color) transition-colors hover:bg-[color-mix(in_oklab,var(--card-color),var(--main-color)_6%)]'
                  >
                    {t('cta.kanji')}
                  </Link>
                </div>
              </div>

              <FAQSection groups={groups} />

              <section className='mt-12 rounded-3xl border border-(--border-color) bg-[color-mix(in_oklab,var(--card-color),transparent_0%)] p-6 shadow-[0_1px_0_rgba(0,0,0,0.06),0_20px_60px_rgba(0,0,0,0.12)] sm:p-8'>
                <h2 className='text-xl font-semibold tracking-tight text-(--main-color) sm:text-2xl'>
                  {t('footer.title')}
                </h2>
                <p className='mt-3 text-sm leading-relaxed text-(--secondary-color) sm:text-base'>
                  {t('footer.body')}
                </p>
                <div className='mt-6 grid gap-3 sm:grid-cols-2'>
                  <Link
                    href={`/${locale}/kana`}
                    className='rounded-2xl border border-(--border-color) bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card-color),var(--main-color)_8%),color-mix(in_oklab,var(--card-color),transparent_0%))] px-5 py-4 font-semibold text-(--main-color) shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-px'
                  >
                    {t('footer.links.kana')}
                  </Link>
                  <Link
                    href={`/${locale}/progress`}
                    className='rounded-2xl border border-(--border-color) bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card-color),var(--secondary-color)_10%),color-mix(in_oklab,var(--card-color),transparent_0%))] px-5 py-4 font-semibold text-(--main-color) shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-px'
                  >
                    {t('footer.links.progress')}
                  </Link>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
