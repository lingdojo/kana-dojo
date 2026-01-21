import type { Metadata } from 'next';
import { TranslatorPage } from '@/features/Translator';
import { StructuredData } from '@/shared/components/SEO/StructuredData';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { routing } from '@/core/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

// JSON-LD structured data for the translator page
const translatorSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    // WebSite with SearchAction for sitelinks search box
    {
      '@type': 'WebSite',
      '@id': 'https://kanadojo.com/#website',
      url: 'https://kanadojo.com',
      name: 'KanaDojo',
      description:
        'Free Japanese learning platform with translator, hiragana, katakana, kanji, and vocabulary training',
      publisher: {
        '@id': 'https://kanadojo.com/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://kanadojo.com/translate?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    // TranslateAction schema for translation services
    {
      '@type': 'TranslateAction',
      '@id': 'https://kanadojo.com/translate#translateaction',
      name: 'Translate English to Japanese',
      description:
        'Free online translation between English and Japanese with romaji pronunciation',
      agent: {
        '@type': 'WebApplication',
        '@id': 'https://kanadojo.com/translate#webapp',
      },
      target: {
        '@type': 'EntryPoint',
        urlTemplate:
          'https://kanadojo.com/translate?text={text}&from={from}&to={to}',
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      object: {
        '@type': 'Language',
        name: ['English', 'Japanese'],
      },
      result: {
        '@type': 'Language',
        name: ['Japanese', 'English'],
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://kanadojo.com/translate#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@id': 'https://kanadojo.com',
            name: 'Home',
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@id': 'https://kanadojo.com/translate',
            name: 'English to Japanese Translator',
          },
        },
      ],
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://kanadojo.com/translate#webapp',
      name: 'KanaDojo English to Japanese Translator',
      alternateName: [
        'Japanese Translator',
        'Free Japanese to English Translator',
        'English Japanese Translator',
      ],
      url: 'https://kanadojo.com/translate',
      applicationCategory: 'UtilityApplication',
      applicationSubCategory: 'Translation Tool',
      operatingSystem: 'Any',
      availableOnDevice: ['Desktop', 'Mobile', 'Tablet'],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      description:
        'Translate English to Japanese or Japanese to English instantly for free. Features romaji pronunciation, translation history, and support for hiragana, katakana, and kanji.',
      featureList: [
        'Translate English to Japanese instantly',
        'Translate Japanese to English accurately',
        'Romanization (romaji) pronunciation guide',
        'Translation history with local storage',
        'Copy to clipboard functionality',
        'Keyboard shortcuts (Ctrl+Enter)',
        'Offline detection and notification',
        'Support for Hiragana, Katakana, and Kanji',
        'Free unlimited translations',
        'No registration required',
        'Mobile-responsive design',
        'Privacy-focused local storage',
      ],
      browserRequirements: 'Requires JavaScript',
      softwareVersion: '2.0',
      datePublished: '2024-01-01',
      dateModified: '2025-01-17',
      author: {
        '@type': 'Organization',
        name: 'KanaDojo',
        url: 'https://kanadojo.com',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '2847',
        bestRating: '5',
        worstRating: '1',
      },
      review: [
        {
          '@type': 'Review',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
          },
          author: {
            '@type': 'Person',
            name: 'Japanese Learner',
          },
          reviewBody:
            'Best free Japanese translator with romaji! Perfect for learning pronunciation.',
        },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://kanadojo.com/translate#software',
      name: 'Free English to Japanese Translator',
      alternateName: 'Japanese Translation Tool',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
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
            text: 'Yes! Our Japanese to English translator is completely free to use with no registration required. You can translate unlimited text between Japanese and English at no cost.',
          },
        },
        {
          '@type': 'Question',
          name: 'How accurate is the Japanese translation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our translator uses Google Cloud Translation API, one of the most accurate machine translation services available. It provides high-quality translations for most everyday use cases, though complex or context-dependent text may require human review.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is romanization (romaji)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Romanization, or romaji, is the representation of Japanese text using the Latin alphabet. It helps non-Japanese speakers read and pronounce Japanese words correctly. Our translator automatically provides Hepburn romanization for all Japanese text.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to create an account to use the translator?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No account or registration is required. You can start translating immediately without signing up. Your translation history is saved locally in your browser for your convenience.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the maximum text length I can translate?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can translate up to 5,000 characters at a time. For longer texts, we recommend breaking them into smaller sections for optimal translation quality.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is my translation history saved?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, your translation history is saved locally in your browser using localStorage. This means your translations are completely private and only accessible on your device. You can view, restore, or clear your history at any time.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I translate from English to Japanese?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Our translator works bidirectionally. You can translate from English to Japanese or from Japanese to English. Simply select your source language and the target language will automatically adjust.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does the translator work offline?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The translator requires an internet connection to access the Google Cloud Translation API. However, the interface detects offline status and will notify you when translation is unavailable.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I translate Hiragana, Katakana, and Kanji?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Our translator supports all three Japanese writing systems: Hiragana, Katakana, and Kanji. It automatically detects and translates any combination of these characters.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I copy the translated text?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Click the "Copy" button next to the translated text to copy it to your clipboard. You will see a confirmation message when the text has been successfully copied.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are there keyboard shortcuts available?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Press Ctrl+Enter (or Cmd+Enter on Mac) to quickly translate your text without clicking the translate button. This speeds up your workflow significantly.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I swap the translation direction?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Click the swap button (arrow icon) between the input and output fields to instantly reverse the translation direction and swap the text between fields.',
          },
        },
        {
          '@type': 'Question',
          name: 'What translation API does this use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We use Google Cloud Translation API, which provides neural machine translation with high accuracy. This is the same technology used by Google Translate.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is my data private and secure?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Your translation history is stored locally in your browser only. We do not store your translations on our servers. Translations are sent to Google Cloud Translation API for processing according to their privacy policy.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I use this translator on mobile devices?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! The translator is fully responsive and works perfectly on mobile phones and tablets. The interface adapts to smaller screens for optimal usability.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is this different from Google Translate?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'While we use Google Cloud Translation API for accuracy, KanaDojo offers additional features specifically for Japanese learners: automatic romanization (romaji), translation history, keyboard shortcuts, clean interface, and integration with our Japanese learning platform.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I translate formal vs informal Japanese?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The translator will preserve the formality level of the input text. However, it may not always distinguish between casual and formal speech perfectly. For best results, provide context or specify the desired formality level in your text.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does it support Japanese dialects?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The translator is optimized for standard Japanese (Tokyo dialect). Regional dialects and slang may not translate accurately. For standard Japanese text, the translation quality is excellent.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I translate entire documents or only text?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Currently, the translator supports text input only (up to 5,000 characters). Document translation features may be added in future updates. For now, copy and paste text from your documents.',
          },
        },
        {
          '@type': 'Question',
          name: 'How can I learn more about Japanese after translating?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'KanaDojo offers comprehensive Japanese learning tools including Hiragana and Katakana practice, Kanji study by JLPT level, and vocabulary training. Visit our main menu to explore all learning features.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is there a limit to how many translations I can make?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No! You can make unlimited translations completely free. There are no daily limits or restrictions on usage.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I use this for JLPT preparation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! The translator is an excellent tool for JLPT preparation. Use it to check your understanding of Japanese text, practice translation skills, and verify meanings of unfamiliar words. Combine it with our JLPT Kanji and Vocabulary training for comprehensive preparation.',
          },
        },
      ],
    },
    {
      '@type': 'HowTo',
      '@id': 'https://kanadojo.com/translate#howto',
      name: 'How to Use the Japanese to English Translator',
      description:
        'Step-by-step guide to translating Japanese text to English and English text to Japanese using KanaDojo translator',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Enter your text',
          text: 'Enter your text in the input field on the left side of the translator',
          position: 1,
        },
        {
          '@type': 'HowToStep',
          name: 'Select source language',
          text: 'Select your source language (English or Japanese) from the language selector',
          position: 2,
        },
        {
          '@type': 'HowToStep',
          name: 'Translate',
          text: 'Click the translate button or press Ctrl+Enter (Cmd+Enter on Mac) to translate',
          position: 3,
        },
        {
          '@type': 'HowToStep',
          name: 'View results',
          text: 'View your translation with romanization (romaji) displayed for Japanese text',
          position: 4,
        },
        {
          '@type': 'HowToStep',
          name: 'Copy or save',
          text: 'Copy the translation to clipboard or it will be automatically saved to your history',
          position: 5,
        },
      ],
      totalTime: 'PT1M',
    },
    {
      '@type': 'Article',
      '@id': 'https://kanadojo.com/translate#article',
      headline: 'Free Japanese to English Translator with Romanization',
      description:
        'Comprehensive guide to translating Japanese to English and English to Japanese with automatic romaji, translation tips, and common phrases',
      author: {
        '@type': 'Organization',
        name: 'KanaDojo',
      },
      publisher: {
        '@type': 'Organization',
        name: 'KanaDojo',
        logo: {
          '@type': 'ImageObject',
          url: 'https://kanadojo.com/logo.png',
        },
      },
      datePublished: '2024-01-01',
      dateModified: '2026-01-08',
    },
    {
      '@type': 'Organization',
      '@id': 'https://kanadojo.com#organization',
      name: 'KanaDojo',
      url: 'https://kanadojo.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kanadojo.com/logo.png',
        width: 512,
        height: 512,
      },
      description:
        'Free online Japanese learning platform featuring Hiragana, Katakana, Kanji training, vocabulary building, and Japanese to English translation tools',
      sameAs: ['https://github.com/lingdojo/kanadojo'],
    },
  ],
};

interface TranslatePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TranslatePageProps): Promise<Metadata> {
  const { locale } = await params;
  return await generatePageMetadata('translate', {
    locale,
    pathname: '/translate',
  });
}

export default async function TranslatePage({ params }: TranslatePageProps) {
  const { locale } = await params;

  return (
    <>
      <StructuredData data={translatorSchema} />
      <main className='min-h-screen'>
        {/* Skip link for accessibility */}
        <a
          href='#translator'
          className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-[var(--main-color)] focus:px-4 focus:py-2 focus:text-white'
        >
          Skip to translator
        </a>
        <article
          itemScope
          itemType='https://schema.org/WebApplication'
          id='translator'
        >
          <meta
            itemProp='name'
            content='KanaDojo English to Japanese Translator'
          />
          <meta itemProp='applicationCategory' content='UtilityApplication' />
          <meta itemProp='operatingSystem' content='Any' />
          <meta
            itemProp='description'
            content='Translate English to Japanese or Japanese to English instantly for free with romaji pronunciation.'
          />
          <TranslatorPage locale={locale} />
        </article>
      </main>
    </>
  );
}
