import { StructuredData } from '@/shared/components/SEO/StructuredData';

interface DojoRouteSchemaProps {
  routeKey: 'kana' | 'kanji' | 'vocabulary';
  locale: string;
  title: string;
  description: string;
  canonicalPath: '/kana' | '/kanji' | '/vocabulary';
  teaches: string;
  assesses: string;
  educationalAlignment?: {
    alignmentType: string;
    educationalFramework: string;
    targetName: string;
  };
}

const BASE_URL = 'https://kanadojo.com';

function withLocalePath(locale: string, path: string) {
  return `${BASE_URL}/${locale}${path}`;
}

function getRouteName(routeKey: DojoRouteSchemaProps['routeKey']) {
  if (routeKey === 'kana') return 'Kana';
  if (routeKey === 'kanji') return 'Kanji';
  return 'Vocabulary';
}

function getRouteAliases(routeKey: DojoRouteSchemaProps['routeKey']) {
  if (routeKey === 'kana') {
    return ['learn kana', 'hiragana practice', 'katakana practice'];
  }
  if (routeKey === 'kanji') {
    return ['learn kanji', 'kanji practice', 'jlpt kanji'];
  }
  return ['learn japanese vocabulary', 'jlpt vocabulary', 'vocabulary practice'];
}

export function DojoRouteSchema({
  routeKey,
  locale,
  title,
  description,
  canonicalPath,
  teaches,
  assesses,
  educationalAlignment,
}: DojoRouteSchemaProps) {
  const pageUrl = `${BASE_URL}${canonicalPath}`;
  const routeName = getRouteName(routeKey);
  const appRouteUrl = withLocalePath(locale, canonicalPath);

  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      inLanguage: locale,
      isPartOf: { '@id': `${BASE_URL}/#website` },
      about: [
        {
          '@type': 'Thing',
          name: routeName,
        },
        ...getRouteAliases(routeKey).map(alias => ({
          '@type': 'Thing',
          name: alias,
        })),
      ],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${pageUrl}#software`,
      name: `KanaDojo ${routeName} Practice`,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      url: appRouteUrl,
      isAccessibleForFree: true,
      inLanguage: locale,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        `Interactive ${routeName.toLowerCase()} training`,
        'Instant feedback and progress tracking',
        'Blitz and gauntlet practice modes',
        'No signup required',
      ],
    },
    {
      '@type': 'LearningResource',
      '@id': `${pageUrl}#learning-resource`,
      name: `${routeName} Learning Resource`,
      description,
      url: appRouteUrl,
      learningResourceType: ['Interactive', 'Quiz', 'Game'],
      isAccessibleForFree: true,
      inLanguage: locale,
      teaches,
      assesses,
      provider: {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'KanaDojo',
        url: BASE_URL,
      },
      ...(educationalAlignment
        ? {
            educationalAlignment: {
              '@type': 'AlignmentObject',
              ...educationalAlignment,
            },
          }
        : {}),
    },
  ];

  return <StructuredData data={{ '@context': 'https://schema.org', '@graph': graph }} />;
}

