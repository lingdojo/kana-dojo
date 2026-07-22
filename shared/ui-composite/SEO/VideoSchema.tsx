import Script from 'next/script';

export interface VideoSchemaProps {
  name: string;
  description: string;
  /** URL where the video is hosted */
  contentUrl: string;
  /** URL of the video thumbnail image */
  thumbnailUrl: string;
  /** URL of the page hosting the video */
  embedUrl?: string;
  /** Upload date in ISO 8601 format (YYYY-MM-DD) */
  uploadDate: string;
  /** Duration in ISO 8601 format (e.g., "PT5M30S" for 5 minutes 30 seconds) */
  duration?: string;
  /** Video transcript or caption URL */
  transcript?: string;
  /** Educational content flag */
  educationalUse?: string;
  /** Language(s) */
  inLanguage?: string;
  /** Is it free to access? */
  isAccessibleForFree?: boolean;
  /** Provider/creator */
  author?: {
    name: string;
    url?: string;
  };
  /** Publisher */
  publisher?: {
    name: string;
    logo?: string;
  };
}

export function generateVideoSchema(props: VideoSchemaProps) {
  const {
    name,
    description,
    contentUrl,
    thumbnailUrl,
    embedUrl,
    uploadDate,
    duration,
    transcript,
    educationalUse,
    inLanguage = 'ja',
    isAccessibleForFree = true,
    author,
    publisher,
  } = props;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    contentUrl,
    thumbnailUrl,
    uploadDate,
    inLanguage,
  };

  if (embedUrl) {
    schema.embedUrl = embedUrl;
  }

  if (duration) {
    schema.duration = duration;
  }

  if (transcript) {
    schema.transcript = transcript;
  }

  if (educationalUse) {
    schema.educationalUse = educationalUse;
  }

  if (isAccessibleForFree !== undefined) {
    schema.isAccessibleForFree = isAccessibleForFree;
  }

  if (author) {
    schema.author = {
      '@type': 'Person',
      name: author.name,
      ...(author.url && { url: author.url }),
    };
  }

  if (publisher) {
    schema.publisher = {
      '@type': 'Organization',
      name: publisher.name,
      ...(publisher.logo && {
        logo: {
          '@type': 'ImageObject',
          url: publisher.logo,
        },
      }),
    };
  }

  return schema;
}

/**
 * Video Schema Component for video content
 * Optimizes video content for search results and Bing video search
 *
 * @example
 * <VideoSchema
 *   name="How to Write Hiragana あ"
 *   description="Learn the correct stroke order for hiragana character あ"
 *   contentUrl="https://cdn.kanadojo.com/videos/hiragana-a.mp4"
 *   thumbnailUrl="https://cdn.kanadojo.com/thumbnails/hiragana-a.jpg"
 *   uploadDate="2025-01-15"
 *   duration="PT2M30S"
 *   educationalUse="Instruction"
 * />
 */
export function VideoSchema(props: VideoSchemaProps) {
  const schema = generateVideoSchema(props);

  return (
    <Script
      id='video-schema'
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Multiple videos on a single page
 */
export function MultipleVideosSchema({
  videos,
}: {
  videos: VideoSchemaProps[];
}) {
  const schemas = videos.map(generateVideoSchema);

  return (
    <Script
      id='videos-schema'
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
    />
  );
}
