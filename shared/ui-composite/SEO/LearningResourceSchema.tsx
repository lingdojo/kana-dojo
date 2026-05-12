import Script from 'next/script';

export interface LearningResourceSchemaProps {
  name: string;
  description: string;
  url: string;
  /** Type of learning resource */
  learningResourceType:
    | 'Activity'
    | 'Assessment'
    | 'Course'
    | 'Game'
    | 'Interactive'
    | 'Lesson'
    | 'LessonPlan'
    | 'Quiz'
    | 'Simulation'
    | 'Tutorial'
    | Array<'Activity' | 'Assessment' | 'Course' | 'Game' | 'Interactive' | 'Lesson' | 'LessonPlan' | 'Quiz' | 'Simulation' | 'Tutorial'>;
  /** Educational level (e.g., "Beginner", "Intermediate", "Advanced") */
  educationalLevel?: string | string[];
  /** What the resource teaches */
  teaches?: string;
  /** What the resource assesses */
  assesses?: string;
  /** Time required in ISO 8601 format (e.g., "PT30M" for 30 minutes) */
  timeRequired?: string;
  /** Language(s) covered */
  inLanguage?: string | string[];
  /** Is it free? */
  isAccessibleForFree?: boolean;
  /** Provider/creator information */
  provider?: {
    name: string;
    url?: string;
  };
  /** Image URL */
  image?: string;
  /** Educational alignment (e.g., JLPT level) */
  educationalAlignment?: {
    alignmentType: string;
    educationalFramework: string;
    targetName: string;
  };
  /** Aggregate rating if available */
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export function generateLearningResourceSchema(
  props: LearningResourceSchemaProps,
) {
  const {
    name,
    description,
    url,
    learningResourceType,
    educationalLevel,
    teaches,
    assesses,
    timeRequired,
    inLanguage = 'ja',
    isAccessibleForFree = true,
    provider,
    image,
    educationalAlignment,
    aggregateRating,
  } = props;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    '@id': url,
    name,
    description,
    url,
    learningResourceType,
    isAccessibleForFree,
    inLanguage,
  };

  if (educationalLevel) {
    schema.educationalLevel =
      typeof educationalLevel === 'string'
        ? educationalLevel
        : educationalLevel;
  }

  if (teaches) {
    schema.teaches = teaches;
  }

  if (assesses) {
    schema.assesses = assesses;
  }

  if (timeRequired) {
    schema.timeRequired = timeRequired;
  }

  if (provider) {
    schema.provider = {
      '@type': 'Organization',
      name: provider.name,
      ...(provider.url && { url: provider.url }),
    };
  }

  if (image) {
    schema.image = image;
  }

  if (educationalAlignment) {
    schema.educationalAlignment = {
      '@type': 'AlignmentObject',
      alignmentType: educationalAlignment.alignmentType,
      educationalFramework: educationalAlignment.educationalFramework,
      targetName: educationalAlignment.targetName,
    };
  }

  if (aggregateRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue,
      reviewCount: aggregateRating.reviewCount,
    };
  }

  return schema;
}

/**
 * Learning Resource Schema Component
 * Optimized for educational content discovery in search engines
 * Particularly valued by Bing for educational queries
 *
 * @example
 * <LearningResourceSchema
 *   name="Hiragana Practice Game"
 *   description="Interactive game to practice Hiragana characters"
 *   url="https://kanadojo.com/kana/train"
 *   learningResourceType="Game"
 *   educationalLevel={["Beginner", "Intermediate"]}
 *   teaches="Japanese Hiragana Characters"
 *   assesses="Hiragana Recognition and Reading Speed"
 *   timeRequired="PT30M"
 * />
 */
export function LearningResourceSchema(props: LearningResourceSchemaProps) {
  const schema = generateLearningResourceSchema(props);

  return (
    <Script
      id='learning-resource-schema'
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Helper to create multiple learning resources for a page
 * Use when a page contains multiple learning activities
 */
export function MultipleLearningResourcesSchema({
  resources,
}: {
  resources: LearningResourceSchemaProps[];
}) {
  const schemas = resources.map(generateLearningResourceSchema);

  return (
    <Script
      id='learning-resources-schema'
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
    />
  );
}
