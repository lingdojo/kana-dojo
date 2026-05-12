import Script from 'next/script';

export interface CourseSchemaProps {
  name: string;
  description: string;
  url: string;
  provider?: string;
  educationalLevel?: string;
  skillLevel?: string;
  courseMode?: string;
  availableLanguage?: string[];
  learningResourceType?: string;
}

export function generateCourseSchema(props: CourseSchemaProps) {
  const {
    name,
    description,
    url,
    provider = 'KanaDojo',
    educationalLevel = 'Beginner to Advanced',
    skillLevel = 'All Levels',
    courseMode = 'online',
    availableLanguage = ['en', 'es', 'ja'],
    learningResourceType = 'Interactive Exercise',
  } = props;

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url,
    provider: {
      '@type': 'Organization',
      name: provider,
      url: 'https://kanadojo.com',
    },
    educationalLevel,
    courseMode,
    availableLanguage,
    learningResourceType,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode,
      courseWorkload: 'PT1H',
      instructor: {
        '@type': 'Organization',
        name: provider,
      },
    },
    inLanguage: availableLanguage,
    teaches: name,
    skillLevel,
    isAccessibleForFree: true,
    educationalCredentialAwarded: 'Completion Certificate',
  };
}

export function CourseSchema(props: CourseSchemaProps) {
  const schema = generateCourseSchema(props);

  return (
    <Script
      id={`course-schema-${props.name.replace(/\s+/g, '-').toLowerCase()}`}
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
