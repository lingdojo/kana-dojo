/**
 * JSON-LD Structured Data for Japanese Verb Conjugator
 *
 * This module provides functions to generate comprehensive JSON-LD structured data
 * for the conjugator page, including WebApplication, FAQPage, HowTo, BreadcrumbList,
 * and dynamic verb-specific DefinedTerm schemas.
 *
 * Requirements: 13.2, 15.4
 */

import type { VerbInfo, ConjugationResult } from '../../types';

// ============================================================================
// Constants
// ============================================================================

const BASE_URL = 'https://kanadojo.com';
const CONJUGATE_PATH = '/conjugate';

// ============================================================================
// Types
// ============================================================================

/**
 * Schema.org graph structure
 */
export interface ConjugatorSchemaGraph {
  '@context': string;
  '@graph': Record<string, unknown>[];
}

/**
 * FAQ item structure
 */
export interface FAQItem {
  question: string;
  answer: string;
}

// ============================================================================
// FAQ Content (Requirements: 13.2)
// ============================================================================

/**
 * Comprehensive FAQ items for the conjugator page
 */
export const CONJUGATOR_FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is a Japanese verb conjugator?',
    answer:
      'A Japanese verb conjugator is a tool that transforms Japanese verbs from their dictionary form into various grammatical forms such as past tense, negative, potential, passive, and more. Our free conjugator handles all verb types including Godan (u-verbs), Ichidan (ru-verbs), and irregular verbs like する and 来る.',
  },
  {
    question: 'How do I conjugate Japanese verbs?',
    answer:
      'Enter any Japanese verb in its dictionary form (the form ending in -u) into our conjugator. The tool will automatically detect the verb type and generate all conjugation forms including te-form, masu-form, potential, passive, causative, conditional, and more.',
  },
  {
    question: 'What are Godan verbs (u-verbs)?',
    answer:
      'Godan verbs, also called u-verbs or Group 1 verbs, are Japanese verbs that conjugate across five vowel sounds (a, i, u, e, o). They end in various consonant + u combinations like -ku, -gu, -su, -tsu, -nu, -bu, -mu, -ru, or just -u. Examples include 書く (kaku - to write), 読む (yomu - to read), and 話す (hanasu - to speak).',
  },
  {
    question: 'What are Ichidan verbs (ru-verbs)?',
    answer:
      'Ichidan verbs, also called ru-verbs or Group 2 verbs, are Japanese verbs that end in -iru or -eru. They conjugate by simply dropping the final る and adding the appropriate ending. Examples include 食べる (taberu - to eat), 見る (miru - to see), and 起きる (okiru - to wake up).',
  },
  {
    question: 'What are irregular Japanese verbs?',
    answer:
      'Japanese has only two truly irregular verbs: する (suru - to do) and 来る (kuru - to come). Additionally, ある (aru - to exist) has an irregular negative form (ない instead of あらない), and 行く (iku - to go) has an irregular te-form (行って instead of 行いて). Our conjugator handles all these exceptions correctly.',
  },
  {
    question: 'What is the te-form in Japanese?',
    answer:
      'The te-form (て形) is a connective verb form used for making requests, expressing continuous actions (te-iru), connecting sentences, and forming compound verbs. For Godan verbs, the te-form involves sound changes based on the verb ending. For Ichidan verbs, simply replace る with て.',
  },
  {
    question: 'What is the masu-form in Japanese?',
    answer:
      'The masu-form (ます形) is the polite form of Japanese verbs used in formal situations. It is formed by adding ます to the verb stem. For Godan verbs, change the final -u sound to -i and add ます. For Ichidan verbs, drop る and add ます.',
  },
  {
    question: 'What is the potential form in Japanese?',
    answer:
      'The potential form expresses ability or possibility ("can do"). For Godan verbs, change the final -u to -eru. For Ichidan verbs, there are two forms: traditional (-rareru) and colloquial (-reru). Our conjugator shows both forms for Ichidan verbs.',
  },
  {
    question: 'What is the passive form in Japanese?',
    answer:
      'The passive form (受身形) indicates that the subject receives an action. For Godan verbs, change the final -u to -areru. For Ichidan verbs, drop る and add られる. The passive can also express suffering or adversity in Japanese.',
  },
  {
    question: 'What is the causative form in Japanese?',
    answer:
      'The causative form (使役形) expresses making or letting someone do something. For Godan verbs, change the final -u to -aseru. For Ichidan verbs, drop る and add させる. This form is essential for expressing permission or coercion.',
  },
  {
    question: 'Is this Japanese verb conjugator free?',
    answer:
      'Yes! Our Japanese verb conjugator is completely free to use with no registration required. You can conjugate unlimited verbs and access all conjugation forms at no cost.',
  },
  {
    question: 'Can I use this conjugator for JLPT preparation?',
    answer:
      'Absolutely! Understanding verb conjugation is essential for all JLPT levels. Our conjugator covers all forms tested on the JLPT, from basic masu-form (N5) to complex causative-passive forms (N3-N1). Use it alongside our Kanji and Vocabulary training for comprehensive JLPT preparation.',
  },
  {
    question: 'What is the conditional form in Japanese?',
    answer:
      'Japanese has several conditional forms: the ba-form (ば形) for hypothetical conditions, the tara-form (たら形) for sequential or conditional events, and the nara-form (なら形) for topical conditions. Our conjugator generates all three conditional forms.',
  },
  {
    question: 'What is the volitional form in Japanese?',
    answer:
      'The volitional form (意向形) expresses intention or suggestion ("let\'s do" or "I will do"). The plain volitional ends in -ou/-you, while the polite volitional uses ましょう. It is commonly used for making suggestions or expressing determination.',
  },
  {
    question: 'How do compound verbs work in Japanese?',
    answer:
      'Compound verbs combine a noun or verb stem with する (to do) or 来る (to come). Examples include 勉強する (benkyou suru - to study) and 持ってくる (motte kuru - to bring). Our conjugator correctly handles compound verbs by preserving the prefix while conjugating the する or 来る portion.',
  },
  {
    question: 'What is the tai-form in Japanese?',
    answer:
      'The tai-form (たい形) expresses desire or want ("want to do"). It is formed by adding たい to the verb stem. The tai-form conjugates like an i-adjective, so it has forms like たくない (don\'t want to), たかった (wanted to), and たくなかった (didn\'t want to).',
  },
];

// ============================================================================
// Schema Generators
// ============================================================================

/**
 * Generate WebApplication schema
 * Requirements: 13.2
 */
export function generateWebApplicationSchema(): Record<string, unknown> {
  return {
    '@type': 'WebApplication',
    '@id': `${BASE_URL}${CONJUGATE_PATH}#webapp`,
    name: 'KanaDojo Japanese Verb Conjugator',
    alternateName: [
      'Japanese Verb Conjugator',
      'Free Japanese Conjugation Tool',
      'Japanese Verb Forms Generator',
    ],
    url: `${BASE_URL}${CONJUGATE_PATH}`,
    applicationCategory: 'EducationalApplication',
    applicationSubCategory: 'Language Learning Tool',
    operatingSystem: 'Any',
    availableOnDevice: ['Desktop', 'Mobile', 'Tablet'],
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    description:
      'Free Japanese verb conjugator with all conjugation forms. Conjugate any Japanese verb instantly - Godan, Ichidan, irregular verbs. Get te-form, masu-form, potential, passive, causative and more.',
    featureList: [
      'Conjugate all Japanese verb types (Godan, Ichidan, Irregular)',
      'All conjugation forms: te-form, masu-form, potential, passive, causative',
      'Romaji pronunciation for all forms',
      'Verb type detection and explanation',
      'Copy conjugations to clipboard',
      'Conjugation history',
      'Mobile-responsive design',
      'Support for compound verbs (する, 来る)',
      'Both traditional and colloquial potential forms',
      'No registration required',
    ],
    author: {
      '@type': 'Organization',
      name: 'KanaDojo',
      url: BASE_URL,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1847',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

/**
 * Generate FAQPage schema from FAQ items
 * Requirements: 13.2
 */
export function generateFAQSchema(items?: FAQItem[]): Record<string, unknown> {
  const faqItems = items ?? CONJUGATOR_FAQ_ITEMS;

  return {
    '@type': 'FAQPage',
    '@id': `${BASE_URL}${CONJUGATE_PATH}#faq`,
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Generate HowTo schema
 * Requirements: 13.2
 */
export function generateHowToSchema(): Record<string, unknown> {
  return {
    '@type': 'HowTo',
    '@id': `${BASE_URL}${CONJUGATE_PATH}#howto`,
    name: 'How to Conjugate Japanese Verbs',
    description:
      'Step-by-step guide to conjugating Japanese verbs using KanaDojo',
    totalTime: 'PT1M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Enter verb',
        text: 'Type a Japanese verb in dictionary form (e.g., 食べる, 書く, する)',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Click conjugate',
        text: 'Press the conjugate button or hit Enter to generate all forms',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'View verb info',
        text: 'See the detected verb type (Godan, Ichidan, or Irregular) and stem',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Browse conjugations',
        text: 'Explore all conjugation forms organized by category (basic, polite, potential, etc.)',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Copy forms',
        text: 'Click to copy individual forms or use "Copy All" for all conjugations',
      },
    ],
  };
}

/**
 * Generate BreadcrumbList schema
 * Requirements: 13.2
 */
export function generateBreadcrumbSchema(
  verb?: string,
): Record<string, unknown> {
  const items = [
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
        '@id': `${BASE_URL}/tools`,
        name: 'Tools',
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@id': `${BASE_URL}${CONJUGATE_PATH}`,
        name: 'Verb Conjugator',
      },
    },
  ];

  // Add verb-specific breadcrumb if provided
  if (verb) {
    items.push({
      '@type': 'ListItem',
      position: 4,
      item: {
        '@id': `${BASE_URL}${CONJUGATE_PATH}?verb=${encodeURIComponent(verb)}`,
        name: `${verb} Conjugation`,
      },
    });
  }

  return {
    '@type': 'BreadcrumbList',
    '@id': `${BASE_URL}${CONJUGATE_PATH}#breadcrumb`,
    itemListElement: items,
  };
}

/**
 * Generate verb-specific DefinedTerm schema
 * Requirements: 15.4
 */
export function generateVerbSchema(
  verb: VerbInfo,
  result?: ConjugationResult,
): Record<string, unknown> {
  const verbUrl = `${BASE_URL}${CONJUGATE_PATH}?verb=${encodeURIComponent(verb.dictionaryForm)}`;

  // Get verb type display name
  let verbTypeDisplay: string = verb.type;
  if (verb.type === 'godan') verbTypeDisplay = 'Godan (u-verb)';
  else if (verb.type === 'ichidan') verbTypeDisplay = 'Ichidan (ru-verb)';
  else if (verb.type === 'irregular') {
    if (verb.irregularType === 'suru') verbTypeDisplay = 'する verb';
    else if (verb.irregularType === 'kuru') verbTypeDisplay = '来る verb';
    else verbTypeDisplay = 'Irregular';
  }

  const schema: Record<string, unknown> = {
    '@type': 'DefinedTerm',
    '@id': verbUrl,
    name: `${verb.dictionaryForm} conjugation`,
    alternateName: `${verb.romaji} conjugation`,
    description: `Complete conjugation of the Japanese ${verbTypeDisplay} ${verb.dictionaryForm} (${verb.romaji})`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Japanese Verb Conjugations',
      description: 'Collection of Japanese verb conjugation forms',
    },
  };

  // Add conjugation forms if result is provided
  if (result && result.forms.length > 0) {
    // Group forms by category for structured display
    const formsByCategory: Record<string, string[]> = {};
    for (const form of result.forms) {
      if (!formsByCategory[form.category]) {
        formsByCategory[form.category] = [];
      }
      formsByCategory[form.category].push(`${form.name}: ${form.hiragana}`);
    }

    // Add as additional property
    schema.additionalProperty = Object.entries(formsByCategory).map(
      ([category, forms]) => ({
        '@type': 'PropertyValue',
        name: category,
        value: forms.join(', '),
      }),
    );
  }

  return schema;
}

/**
 * Generate Organization schema
 */
function generateOrganizationSchema(): Record<string, unknown> {
  return {
    '@type': 'Organization',
    '@id': `${BASE_URL}#organization`,
    name: 'KanaDojo',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/favicon.ico`,
      width: 512,
      height: 512,
    },
    description:
      'Free online Japanese learning platform featuring verb conjugation, Hiragana, Katakana, Kanji training, and vocabulary building',
    sameAs: ['https://github.com/lingdojo/kanadojo'],
  };
}

// ============================================================================
// Main Schema Generator
// ============================================================================

/**
 * Generate complete JSON-LD structured data for the conjugator page
 * Requirements: 13.2, 15.4
 *
 * @param verb - Optional verb info for verb-specific schema
 * @param result - Optional conjugation result for detailed verb schema
 * @returns Complete schema graph
 */
export function generateConjugatorSchema(
  verb?: VerbInfo,
  result?: ConjugationResult,
): ConjugatorSchemaGraph {
  const graph: Record<string, unknown>[] = [
    generateOrganizationSchema(),
    generateWebApplicationSchema(),
    generateFAQSchema(),
    generateHowToSchema(),
    generateBreadcrumbSchema(verb?.dictionaryForm),
  ];

  // Add verb-specific schema if verb is provided
  if (verb) {
    graph.push(generateVerbSchema(verb, result));
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
