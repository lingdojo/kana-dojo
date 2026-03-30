import type { Metadata } from 'next';
import TranslatorPage from '@/features/Translator/components/TranslatorPage';
import {
  buildTranslatorMetadata,
  buildTranslatorSchema,
  type TranslatorFaqEntry,
} from '@/features/Translator/lib/seo';
import { StructuredData } from '@/shared/components/SEO/StructuredData';

export function generateStaticParams() {
  return [{ locale: 'en' }];
}

export const revalidate = 3600;

interface TranslatePageProps {
  params: Promise<{ locale: string }>;
}

const metadataConfig = {
  pathname: '/translate',
  title: 'Japanese Translator | English ⇄ Japanese with Romaji | KanaDojo',
  description:
    'Free Japanese translator for English to Japanese and Japanese to English text. Translate quickly, review romaji support, and jump into direction-specific pages for better context.',
  keywords: [
    'japanese translator',
    'english to japanese translator',
    'japanese to english translator',
    'japanese translator with romaji',
    'free japanese translator',
    'translate japanese text',
    'translate english to japanese online',
  ],
  schemaName: 'Japanese Translator with Romaji',
  breadcrumbName: 'Japanese Translator',
  includeSoftwareApplication: true,
};

const schemaFaqEntries: TranslatorFaqEntry[] = [
  {
    question: 'Is this Japanese translator free to use?',
    answer:
      'Yes. The translator is free to use and does not require registration.',
  },
  {
    question: 'What can I use this page for?',
    answer:
      'Use the main translator as a hub for quick two-way translation, then open the direction-specific pages when you need examples or more focused guidance.',
  },
  {
    question: 'What is the maximum text length per translation?',
    answer: 'You can translate up to 5,000 characters per request.',
  },
  {
    question: 'Are there usage limits?',
    answer:
      'Yes. Fair-use limits apply during high demand to keep the service stable.',
  },
];

export async function generateMetadata(
  _: TranslatePageProps,
): Promise<Metadata> {
  return buildTranslatorMetadata({
    ...metadataConfig,
    faq: schemaFaqEntries,
  });
}

export default async function TranslatePage(_: TranslatePageProps) {
  return (
    <>
      <StructuredData
        data={buildTranslatorSchema({
          ...metadataConfig,
          faq: schemaFaqEntries,
        })}
      />
      <main className='min-h-screen'>
        <a
          href='#translator'
          className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-(--main-color) focus:px-4 focus:py-2 focus:text-white'
        >
          Skip to translator
        </a>
        <article
          itemScope
          itemType='https://schema.org/SoftwareApplication'
          id='translator'
        >
          <meta itemProp='name' content='KanaDojo Japanese Translator' />
          <meta itemProp='applicationCategory' content='EducationalApplication' />
          <meta itemProp='operatingSystem' content='Any' />
          <meta
            itemProp='description'
            content='Translate English and Japanese text with romaji support and learner-focused context.'
          />
          <TranslatorPage locale='en' />
          <section
            className='mx-auto mt-8 w-full max-w-6xl rounded-2xl border border-(--border-color) bg-(--card-color) p-4 sm:p-6'
            aria-labelledby='translate-quick-faq'
          >
            <h2
              id='translate-quick-faq'
              className='text-xl font-semibold text-(--main-color)'
            >
              Quick FAQ
            </h2>
            <div className='mt-4 space-y-4'>
              {schemaFaqEntries.map(item => (
                <div key={item.question}>
                  <h3 className='font-medium text-(--main-color)'>
                    {item.question}
                  </h3>
                  <p className='text-sm text-(--secondary-color)'>
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
