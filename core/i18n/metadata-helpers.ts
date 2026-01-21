import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

const DEFAULT_BASE_URL = 'https://kanadojo.com';

interface GeneratePageMetadataOptions {
  locale?: string;
  /**
   * Pathname without locale prefix. Examples: '/', '/kana', '/kanji/train'
   */
  pathname?: string;
  /** Base URL override for testing */
  baseUrl?: string;
}

function joinUrl(
  baseUrl: string,
  locale: string | undefined,
  pathname: string,
) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const normalizedPathname = pathname.startsWith('/')
    ? pathname
    : `/${pathname}`;

  if (!locale) {
    return `${normalizedBaseUrl}${normalizedPathname === '/' ? '' : normalizedPathname}`;
  }

  // Locale root is represented as /{locale} (no trailing slash)
  if (normalizedPathname === '/') {
    return `${normalizedBaseUrl}/${locale}`;
  }

  return `${normalizedBaseUrl}/${locale}${normalizedPathname}`;
}

/**
 * Generate metadata for a page using the metadata namespace
 * @param key - The key in the metadata translations (e.g., 'home', 'kana', 'kanji')
 * @param locale - The locale to use for translations
 * @returns Metadata object with translated content
 */
export async function generatePageMetadata(
  key: string,
  localeOrOptions?: string | GeneratePageMetadataOptions,
): Promise<Metadata> {
  const options: GeneratePageMetadataOptions =
    typeof localeOrOptions === 'string' || localeOrOptions === undefined
      ? { locale: localeOrOptions }
      : localeOrOptions;

  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const locale = options.locale;
  const pathname = options.pathname ?? '/';

  const t = locale
    ? await getTranslations({ locale, namespace: 'metadata' as const })
    : await getTranslations('metadata');

  const title = t(`${key}.title`);
  const titleShort = t(`${key}.titleShort`);
  const description = t(`${key}.description`);
  const keywords = t(`${key}.keywords`);

  // Determine OG image type based on key
  const getImageType = (key: string): string => {
    if (key.includes('kana')) return 'kana';
    if (key.includes('kanji')) return 'kanji';
    if (key.includes('vocabulary')) return 'vocabulary';
    if (key.includes('academy')) return 'academy';
    return 'default';
  };

  const imageType = getImageType(key);
  const ogImageUrl = `https://kanadojo.com/api/og?title=${encodeURIComponent(titleShort)}&description=${encodeURIComponent(description.slice(0, 100))}&type=${imageType}`;

  const canonicalUrl = joinUrl(baseUrl, locale, pathname);
  const alternatesLanguages: Record<string, string> | undefined = locale
    ? {
        en: joinUrl(baseUrl, 'en', pathname),
        es: joinUrl(baseUrl, 'es', pathname),
        ja: joinUrl(baseUrl, 'ja', pathname),
      }
    : undefined;

  return {
    title,
    description,
    keywords: keywords.split(', '),
    openGraph: {
      title: titleShort,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: titleShort,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleShort,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: alternatesLanguages,
    },
  };
}

/**
 * Generate default metadata with base SEO configuration
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL('https://kanadojo.com'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'education',
};
