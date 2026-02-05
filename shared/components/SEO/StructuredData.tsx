import Script from 'next/script';

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id='structured-data'
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Comprehensive Schema Graph for KanaDojo
export const kanaDojoSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://kanadojo.com/#organization',
      name: 'KanaDojo',
      url: 'https://kanadojo.com',
      logo: 'https://kanadojo.com/favicon.ico',
      description:
        'An aesthetic, minimalist platform for learning Japanese Hiragana, Katakana, Kanji, and Vocabulary',
      sameAs: ['https://github.com/lingdojo/kanadojo'],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'dev@kanadojo.com',
        contactType: 'Customer Support',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://kanadojo.com/#website',
      url: 'https://kanadojo.com',
      name: 'KanaDojo',
      description:
        'Master Japanese with KanaDojo - Learn Hiragana, Katakana, Kanji, and Vocabulary',
      publisher: { '@id': 'https://kanadojo.com/#organization' },
      inLanguage: ['en', 'es'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://kanadojo.com/?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://kanadojo.com/#webapp',
      name: 'KanaDojo',
      alternateName: 'Kana Dojo',
      url: 'https://kanadojo.com',
      applicationCategory: 'EducationalApplication',
      applicationSubCategory: 'Language Learning',
      operatingSystem: 'Any',
      browserRequirements:
        'Requires JavaScript. Works with Chrome, Firefox, Safari, Edge.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      description:
        'Interactive Japanese learning platform with Hiragana, Katakana, Kanji, and Vocabulary training',
      featureList: [
        'Learn Hiragana and Katakana',
        'Practice Kanji by JLPT level',
        'Build Japanese vocabulary',
        'Interactive games and quizzes',
        'Progress tracking',
        '100+ customizable themes',
        'Multiple training modes',
        'Blitz and Gauntlet challenges',
        'No account required',
        'Works offline with progress saved locally',
      ],
      author: {
        '@type': 'Organization',
        name: 'LingDojo',
      },
      creator: {
        '@type': 'Organization',
        name: 'LingDojo',
      },
      inLanguage: ['en', 'es'],
      availableLanguage: ['English', 'Spanish'],
      isAccessibleForFree: true,
      audience: {
        '@type': 'EducationalAudience',
        educationalRole: 'Student',
      },
    },
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://kanadojo.com/#educational',
      name: 'KanaDojo',
      url: 'https://kanadojo.com',
      description: 'Interactive Japanese language learning platform',
      educationalCredentialAwarded: 'Japanese Language Proficiency',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Japanese Learning Courses',
        itemListElement: [
          {
            '@type': 'Course',
            name: 'Hiragana & Katakana Learning',
            description: 'Master Japanese Hiragana and Katakana syllabaries',
            provider: {
              '@type': 'Organization',
              name: 'KanaDojo',
            },
          },
          {
            '@type': 'Course',
            name: 'Kanji Learning by JLPT Level',
            description:
              'Learn essential Kanji characters organized by JLPT levels',
            provider: {
              '@type': 'Organization',
              name: 'KanaDojo',
            },
          },
          {
            '@type': 'Course',
            name: 'Japanese Vocabulary Building',
            description: 'Build Japanese vocabulary organized by JLPT levels',
            provider: {
              '@type': 'Organization',
              name: 'KanaDojo',
            },
          },
        ],
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://kanadojo.com/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is KanaDojo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'KanaDojo is a free, aesthetic Japanese learning platform that helps you master Hiragana, Katakana, Kanji, and Vocabulary through interactive games and exercises. It features 100+ customizable themes, progress tracking, and training modes designed to make learning Japanese enjoyable and effective.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is KanaDojo completely free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! KanaDojo is completely free to use with no hidden costs, subscriptions, or premium features. All learning content, games, themes, and features are available to everyone at no charge.',
          },
        },
        {
          '@type': 'Question',
          name: 'What can I learn on KanaDojo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can learn all fundamental Japanese writing systems: Hiragana (basic, dakuon, yoon), Katakana (basic, dakuon, yoon, foreign sounds), Kanji organized by JLPT levels (N5-N1), and Japanese Vocabulary also organized by JLPT levels with thousands of words and example sentences.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to create an account?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No account is required! KanaDojo stores all your progress locally in your browser, so you can start learning immediately without signing up. Your progress and preferences are automatically saved as you use the platform.',
          },
        },
        {
          '@type': 'Question',
          name: 'What are the different training modes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'KanaDojo offers multiple training modes: Pick Mode (multiple choice recognition), Reverse-Pick (reverse multiple choice), Input Mode (text input practice), Reverse-Input (reverse text input), Blitz Mode (speed tests), and Gauntlet Mode (comprehensive mastery challenges).',
          },
        },
        {
          '@type': 'Question',
          name: 'How does progress tracking work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'KanaDojo automatically tracks your learning statistics including correct answers, speed, accuracy, and mastery levels for each character or word. All progress is stored locally in your browser and displayed in detailed charts and statistics on the Progress page.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I use KanaDojo on mobile devices?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! KanaDojo is fully responsive and works seamlessly on mobile phones, tablets, and desktop computers. The interface adapts to your screen size for an optimal learning experience on any device.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is KanaDojo suitable for JLPT preparation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely! KanaDojo organizes Kanji and Vocabulary content by JLPT levels (N5, N4, N3, N2, N1), making it an excellent supplementary tool for JLPT exam preparation. Practice characters and words specific to your target JLPT level.',
          },
        },
      ],
    },
  ],
};
