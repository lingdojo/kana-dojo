import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { TranslatorPage } from '@/features/Translator';
import { StructuredData } from '@/shared/components/SEO/StructuredData';

// JSON-LD structured data for the translator page
const translatorSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://kanadojo.com/translate#webapp',
      name: 'KanaDojo Japanese Translator',
      url: 'https://kanadojo.com/translate',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      description:
        'Free online Japanese translator. Translate English to Japanese or Japanese to English instantly with romanization support.',
      featureList: [
        'English to Japanese translation',
        'Japanese to English translation',
        'Romanization (romaji) display',
        'Translation history',
        'Copy to clipboard',
        'Keyboard shortcuts'
      ],
      browserRequirements: 'Requires JavaScript',
      softwareVersion: '1.0',
      author: {
        '@type': 'Organization',
        name: 'KanaDojo',
        url: 'https://kanadojo.com'
      }
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://kanadojo.com/translate#software',
      name: 'Japanese Translator',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://kanadojo.com/translate#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is this Japanese translator free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Our Japanese translator is completely free to use with no registration required.'
          }
        },
        {
          '@type': 'Question',
          name: 'How accurate is the translation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our translator uses Google Cloud Translation API, one of the most accurate machine translation services available.'
          }
        },
        {
          '@type': 'Question',
          name: 'What is romanization (romaji)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Romanization, or romaji, is the representation of Japanese text using the Latin alphabet to help with pronunciation.'
          }
        }
      ]
    }
  ]
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');

  const title =
    'Japanese Translator - Translate English to Japanese & Japanese to English | KanaDojo';
  const description =
    'Free online Japanese translator. Translate English to Japanese or Japanese to English instantly. Features romanization (romaji), translation history, and accurate translations powered by Google Translate.';

  return {
    title,
    description,
    keywords: [
      'translate japanese',
      'japanese translator',
      'english to japanese',
      'japanese to english',
      'japanese translation',
      'translate to japanese',
      'japanese english translator',
      'romaji translator',
      'hiragana translator',
      'katakana translator',
      'free japanese translator',
      'japanese to english translator',
      'english to japanese translator',
      'translate english to japanese',
      'translate japanese to english'
    ],
    openGraph: {
      title,
      description,
      url: 'https://kanadojo.com/translate',
      type: 'website',
      siteName: 'KanaDojo'
    },
    twitter: {
      card: 'summary',
      title,
      description
    },
    alternates: {
      canonical: 'https://kanadojo.com/translate',
      languages: {
        en: 'https://kanadojo.com/en/translate',
        es: 'https://kanadojo.com/es/translate',
        ja: 'https://kanadojo.com/ja/translate'
      }
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true
      }
    }
  };
}

interface TranslatePageProps {
  params: Promise<{ locale: string }>;
}

export default async function TranslatePage({ params }: TranslatePageProps) {
  const { locale } = await params;

  return (
    <>
      <StructuredData data={translatorSchema} />
      <main className='min-h-screen'>
        <TranslatorPage locale={locale} />
      </main>
    </>
  );
}
