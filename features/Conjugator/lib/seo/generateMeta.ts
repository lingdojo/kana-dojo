/**
 * SEO Meta Tag Generation for Japanese Verb Conjugator
 *
 * This module provides functions to generate SEO-optimized meta tags
 * for the conjugator page, including dynamic verb-specific meta tags.
 *
 * Requirements: 13.1, 13.3, 15.1, 15.2, 15.5
 */

import type { VerbInfo } from '../../types';

// ============================================================================
// Constants
// ============================================================================

const BASE_URL = 'https://kanadojo.com';
const CONJUGATE_PATH = '/conjugate';

// ============================================================================
// Types
// ============================================================================

/**
 * Meta tags for the conjugator page
 */
export interface ConjugatorMeta {
  /** Page title */
  title: string;
  /** Meta description */
  description: string;
  /** Keywords array */
  keywords: string[];
  /** Canonical URL */
  canonicalUrl: string;
  /** Open Graph image URL */
  ogImage: string;
  /** Short title for OG */
  titleShort: string;
}

/**
 * Options for generating meta tags
 */
export interface GenerateMetaOptions {
  /** Locale for the page */
  locale?: string;
  /** Base URL override (for testing) */
  baseUrl?: string;
}

// ============================================================================
// Base Meta Tags (Requirements: 13.1)
// ============================================================================

/**
 * Base keywords for the conjugator page
 */
const BASE_KEYWORDS = [
  'Japanese verb conjugator',
  'Japanese verb conjugation',
  'conjugate Japanese verbs',
  'Japanese te form',
  'Japanese masu form',
  'Japanese verb forms',
  'learn Japanese verbs',
  'Japanese grammar tool',
  'free Japanese conjugator',
  'Godan verbs',
  'Ichidan verbs',
  'Japanese irregular verbs',
  'Japanese potential form',
  'Japanese passive form',
  'Japanese causative form',
  'JLPT verb conjugation',
];

/**
 * Base meta tags for the conjugator page (without specific verb)
 * Requirements: 13.1
 */
export const BASE_META: ConjugatorMeta = {
  title: 'Japanese Verb Conjugator - Free Online Tool | KanaDojo',
  titleShort: 'Japanese Verb Conjugator',
  description:
    'Free Japanese verb conjugator with all conjugation forms. Conjugate any Japanese verb instantly - Godan, Ichidan, irregular verbs. Get te-form, masu-form, potential, passive, causative and more.',
  keywords: BASE_KEYWORDS,
  canonicalUrl: `${BASE_URL}${CONJUGATE_PATH}`,
  ogImage: `${BASE_URL}/api/og?title=${encodeURIComponent('Japanese Verb Conjugator')}&description=${encodeURIComponent('Conjugate any Japanese verb instantly')}&type=default`,
};

// ============================================================================
// Dynamic Meta Tag Generation (Requirements: 13.3, 15.1, 15.2, 15.5)
// ============================================================================

/**
 * Generate verb-specific keywords
 */
function generateVerbKeywords(verb: VerbInfo): string[] {
  const verbKeywords = [
    `${verb.dictionaryForm} conjugation`,
    `${verb.romaji} conjugation`,
    `how to conjugate ${verb.dictionaryForm}`,
    `${verb.dictionaryForm} verb forms`,
    `${verb.romaji} verb forms`,
    `${verb.dictionaryForm} te form`,
    `${verb.dictionaryForm} masu form`,
    `${verb.dictionaryForm} past tense`,
    `${verb.dictionaryForm} negative`,
  ];

  // Add type-specific keywords
  if (verb.type === 'godan') {
    verbKeywords.push(`${verb.dictionaryForm} godan verb`);
    verbKeywords.push(`${verb.dictionaryForm} u-verb`);
  } else if (verb.type === 'ichidan') {
    verbKeywords.push(`${verb.dictionaryForm} ichidan verb`);
    verbKeywords.push(`${verb.dictionaryForm} ru-verb`);
  } else if (verb.type === 'irregular') {
    verbKeywords.push(`${verb.dictionaryForm} irregular verb`);
  }

  return [...verbKeywords, ...BASE_KEYWORDS];
}

/**
 * Get verb type display name
 */
function getVerbTypeDisplay(verb: VerbInfo): string {
  switch (verb.type) {
    case 'godan':
      return 'Godan (u-verb)';
    case 'ichidan':
      return 'Ichidan (ru-verb)';
    case 'irregular':
      if (verb.irregularType === 'suru') return 'する verb';
      if (verb.irregularType === 'kuru') return '来る verb';
      return 'Irregular';
    default:
      return verb.type;
  }
}

/**
 * Generate canonical URL for a specific verb
 * Requirements: 15.1
 */
export function generateCanonicalUrl(
  verb?: string,
  options?: GenerateMetaOptions,
): string {
  const baseUrl = options?.baseUrl ?? BASE_URL;
  const locale = options?.locale;

  let url = baseUrl;

  // Add locale if provided
  if (locale) {
    url += `/${locale}`;
  }

  url += CONJUGATE_PATH;

  // Add verb parameter if provided
  if (verb) {
    url += `?verb=${encodeURIComponent(verb)}`;
  }

  return url;
}

/**
 * Generate dynamic meta tags for a specific verb
 * Requirements: 13.3, 15.1, 15.2, 15.5
 *
 * @param verb - The verb info object
 * @param options - Optional configuration
 * @returns ConjugatorMeta with verb-specific content
 */
export function generateVerbMeta(
  verb: VerbInfo,
  options?: GenerateMetaOptions,
): ConjugatorMeta {
  const baseUrl = options?.baseUrl ?? BASE_URL;
  const verbTypeDisplay = getVerbTypeDisplay(verb);

  // Generate title following SEO best practices (Requirements: 15.5)
  // Format: "食べる (taberu) Conjugation - All Japanese Verb Forms | KanaDojo"
  const title = `${verb.dictionaryForm} (${verb.romaji}) Conjugation - All Japanese Verb Forms | KanaDojo`;
  const titleShort = `${verb.dictionaryForm} (${verb.romaji}) Conjugation`;

  // Generate unique description (Requirements: 15.2)
  const description = `Complete conjugation of the Japanese ${verbTypeDisplay} ${verb.dictionaryForm} (${verb.romaji}). All forms including te-form, masu-form, potential, passive, causative, conditional, and more. Free online conjugator.`;

  // Generate canonical URL (Requirements: 15.1)
  const canonicalUrl = generateCanonicalUrl(verb.dictionaryForm, options);

  // Generate OG image URL
  const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(titleShort)}&description=${encodeURIComponent(`${verbTypeDisplay} - All conjugation forms`)}&type=default`;

  // Generate keywords
  const keywords = generateVerbKeywords(verb);

  return {
    title,
    titleShort,
    description,
    keywords,
    canonicalUrl,
    ogImage,
  };
}

/**
 * Generate meta tags - returns base meta or verb-specific meta
 *
 * @param verb - Optional verb info for dynamic meta
 * @param options - Optional configuration
 * @returns ConjugatorMeta object
 */
export function generateMeta(
  verb?: VerbInfo,
  options?: GenerateMetaOptions,
): ConjugatorMeta {
  if (verb) {
    return generateVerbMeta(verb, options);
  }

  // Return base meta with locale-aware canonical URL
  const canonicalUrl = generateCanonicalUrl(undefined, options);

  return {
    ...BASE_META,
    canonicalUrl,
  };
}

/**
 * Generate Next.js Metadata object for the conjugator page
 * This can be used directly in generateMetadata functions
 */
export function generateNextMetadata(
  verb?: VerbInfo,
  options?: GenerateMetaOptions,
) {
  const meta = generateMeta(verb, options);
  const baseUrl = options?.baseUrl ?? BASE_URL;
  const locale = options?.locale;

  // Build alternate language URLs
  const alternateLanguages: Record<string, string> = {};
  for (const lang of ['en', 'es', 'ja']) {
    alternateLanguages[lang] = generateCanonicalUrl(verb?.dictionaryForm, {
      ...options,
      locale: lang,
    });
  }

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.titleShort,
      description: meta.description,
      url: meta.canonicalUrl,
      type: 'website' as const,
      images: [
        {
          url: meta.ogImage,
          width: 1200,
          height: 630,
          alt: meta.titleShort,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: meta.titleShort,
      description: meta.description,
      images: [meta.ogImage],
    },
    alternates: {
      canonical: meta.canonicalUrl,
      languages: locale ? alternateLanguages : undefined,
    },
  };
}
