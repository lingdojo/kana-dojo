import type { Metadata } from 'next';

const BASE_URL = 'https://kanadojo.com';

export interface TranslatorFaqEntry {
  question: string;
  answer: string;
}

export interface TranslatorSeoConfig {
  title: string;
  description: string;
  pathname: string;
  keywords: readonly string[];
  ogTitle?: string;
  schemaName?: string;
  breadcrumbName?: string;
  faq?: TranslatorFaqEntry[];
  includeSoftwareApplication?: boolean;
}

function toUrl(pathname: string) {
  return `${BASE_URL}${pathname}`;
}

export function buildTranslatorMetadata(
  config: TranslatorSeoConfig,
): Metadata {
  const canonical = toUrl(config.pathname);
  const ogTitle = config.ogTitle ?? config.title;
  const ogImageUrl = `${BASE_URL}/api/og?title=${encodeURIComponent(ogTitle)}&description=${encodeURIComponent(config.description.slice(0, 100))}&type=default`;

  return {
    title: config.title,
    description: config.description,
    keywords: [...config.keywords],
    alternates: {
      canonical,
    },
    openGraph: {
      title: ogTitle,
      description: config.description,
      url: canonical,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: config.description,
      images: [ogImageUrl],
    },
  };
}

export function buildTranslatorSchema(config: TranslatorSeoConfig) {
  const pageUrl = toUrl(config.pathname);
  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: config.schemaName ?? config.title,
      inLanguage: 'en',
      description: config.description,
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@id': BASE_URL,
            name: 'Home',
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@id': `${BASE_URL}/translate`,
            name: 'Japanese Translator',
          },
        },
        ...(config.pathname === '/translate'
          ? []
          : [
              {
                '@type': 'ListItem',
                position: 3,
                item: {
                  '@id': pageUrl,
                  name: config.breadcrumbName ?? config.title,
                },
              },
            ]),
      ],
    },
  ];

  if (config.includeSoftwareApplication) {
    graph.push({
      '@type': 'SoftwareApplication',
      '@id': `${pageUrl}#software`,
      name: 'KanaDojo Japanese Translator',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      url: pageUrl,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      isAccessibleForFree: true,
      inLanguage: 'en',
      featureList: [
        'English to Japanese translation',
        'Japanese to English translation',
        'Romaji pronunciation support',
        'Translation history stored in the browser',
      ],
    });
  }

  if (config.faq && config.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      inLanguage: 'en',
      mainEntity: config.faq.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
