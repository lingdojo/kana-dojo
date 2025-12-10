import Script from 'next/script';

interface StructuredDataProps {
  data: Record<string, any>;
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
        email: 'lingdojo.dev@gmail.com',
        contactType: 'Customer Support'
      }
    },
    {
      '@type': 'WebSite',
      '@id': 'https://kanadojo.com/#website',
      url: 'https://kanadojo.com',
      name: 'KanaDojo',
      description:
        'Master Japanese with KanaDojo - Learn Hiragana, Katakana, Kanji, and Vocabulary',
      publisher: { '@id': 'https://kanadojo.com/#organization' },
      inLanguage: ['en', 'es', 'ja'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://kanadojo.com/?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://kanadojo.com/#webapp',
      name: 'KanaDojo',
      url: 'https://kanadojo.com',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        ratingCount: '1'
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
        'Multiple training modes'
      ]
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
              name: 'KanaDojo'
            }
          },
          {
            '@type': 'Course',
            name: 'Kanji Learning by JLPT Level',
            description:
              'Learn essential Kanji characters organized by JLPT levels',
            provider: {
              '@type': 'Organization',
              name: 'KanaDojo'
            }
          },
          {
            '@type': 'Course',
            name: 'Japanese Vocabulary Building',
            description: 'Build Japanese vocabulary organized by JLPT levels',
            provider: {
              '@type': 'Organization',
              name: 'KanaDojo'
            }
          }
        ]
      }
    }
  ]
};
