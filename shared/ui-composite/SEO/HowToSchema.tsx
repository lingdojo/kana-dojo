import Script from 'next/script';

export interface HowToStep {
  name: string;
  text: string;
  /** URL to an image illustrating this step */
  image?: string;
  /** URL to a video showing this step */
  url?: string;
}

export interface HowToSchemaProps {
  name: string;
  description: string;
  /** Total time required in ISO 8601 duration format (e.g., "PT30M" for 30 minutes) */
  totalTime?: string;
  /** Estimated cost - use "0" for free */
  estimatedCost?: string;
  steps: HowToStep[];
  /** Main image for the how-to guide */
  image?: string;
  /** Video tutorial URL */
  video?: {
    name: string;
    description: string;
    thumbnailUrl: string;
    contentUrl: string;
    uploadDate: string;
  };
}

export function generateHowToSchema(props: HowToSchemaProps) {
  const {
    name,
    description,
    totalTime,
    estimatedCost = '0',
    steps,
    image,
    video,
  } = props;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: estimatedCost,
    },
    step: steps.map((step, index) => {
      const stepSchema: Record<string, unknown> = {
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        itemListElement: [
          {
            '@type': 'HowToDirection',
            text: step.text,
          },
        ],
      };

      if (step.image) {
        stepSchema.image = step.image;
      }

      if (step.url) {
        stepSchema.url = step.url;
      }

      return stepSchema;
    }),
  };

  if (totalTime) {
    schema.totalTime = totalTime;
  }

  if (image) {
    schema.image = image;
  }

  if (video) {
    schema.video = {
      '@type': 'VideoObject',
      name: video.name,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      contentUrl: video.contentUrl,
      uploadDate: video.uploadDate,
    };
  }

  return schema;
}

/**
 * HowTo Schema Component for step-by-step learning guides
 * Generates structured data for "How-To" content that appears in rich results
 *
 * @example
 * <HowToSchema
 *   name="How to Learn Hiragana in One Week"
 *   description="Master all 46 Hiragana characters with this proven method"
 *   totalTime="PT7D"
 *   steps={[
 *     { name: "Learn vowels", text: "Start with the 5 basic vowels: あいうえお" },
 *     { name: "Practice daily", text: "Spend 20 minutes each day practicing" }
 *   ]}
 * />
 */
export function HowToSchema(props: HowToSchemaProps) {
  const schema = generateHowToSchema(props);

  return (
    <Script
      id='howto-schema'
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
