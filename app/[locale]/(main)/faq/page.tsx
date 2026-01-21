import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { routing, type Locale } from '@/core/i18n/routing';
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

  const faqs = [
    {
      question: t('q1.question'),
      answer: t('q1.answer'),
    },
    {
      question: t('q2.question'),
      answer: t('q2.answer'),
    },
    {
      question: t('q3.question'),
      answer: t('q3.answer'),
    },
    {
      question: t('q4.question'),
      answer: t('q4.answer'),
    },
    {
      question: t('q5.question'),
      answer: t('q5.answer'),
    },
    {
      question: t('q6.question'),
      answer: t('q6.answer'),
    },
    {
      question: t('q7.question'),
      answer: t('q7.answer'),
    },
    {
      question: t('q8.question'),
      answer: t('q8.answer'),
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `https://kanadojo.com/${locale}/faq#faq`,
    inLanguage: locale,
    mainEntity: faqs.map(faq => ({
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
      <div className='mx-auto max-w-4xl px-4 py-8'>
        <h1 className='mb-8 text-center text-4xl font-bold text-[var(--main-color)]'>
          {t('title')}
        </h1>
        <p className='mb-12 text-center text-lg text-[var(--secondary-color)]'>
          {t('subtitle')}
        </p>
        <FAQSection faqs={faqs} />
      </div>
    </>
  );
}
