import Script from 'next/script';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * FAQ Schema Component
 * Generates structured data for FAQ pages that can appear in rich results
 * Bing displays FAQ rich snippets prominently in search results
 *
 * @example
 * <FAQSchema
 *   faqs={[
 *     {
 *       question: "What is Hiragana?",
 *       answer: "Hiragana is one of three Japanese writing systems..."
 *     },
 *     {
 *       question: "How long does it take to learn Hiragana?",
 *       answer: "With consistent practice, you can learn all 46 Hiragana..."
 *     }
 *   ]}
 * />
 */
export function FAQSchema({ faqs }: FAQSchemaProps) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  const schema = generateFAQSchema(faqs);

  return (
    <Script
      id='faq-schema'
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Pre-built FAQ data for common KanaDojo questions
 */
export const commonKanaDOJOFAQs: FAQItem[] = [
  {
    question: 'Is KanaDojo free to use?',
    answer:
      'Yes, KanaDojo is completely free to use. All features including Hiragana, Katakana, Kanji practice, vocabulary training, and the Japanese translator are available at no cost.',
  },
  {
    question: 'Do I need to create an account?',
    answer:
      'No account is required to use KanaDojo. Your progress is saved locally in your browser, so you can start learning immediately without any signup process.',
  },
  {
    question: 'What Japanese writing systems does KanaDojo teach?',
    answer:
      'KanaDojo teaches all three Japanese writing systems: Hiragana (basic phonetic characters), Katakana (used for foreign words), and Kanji (Chinese characters organized by JLPT levels N5-N1).',
  },
  {
    question: 'Can KanaDojo help me prepare for the JLPT?',
    answer:
      'Yes! KanaDojo organizes Kanji and vocabulary by JLPT levels (N5 through N1), making it an excellent tool for JLPT preparation. Practice the specific characters and words you need for your target level.',
  },
  {
    question: 'How does the progress tracking work?',
    answer:
      'KanaDojo automatically tracks your learning progress, including accuracy rates, practice time, and mastered characters. All data is stored locally in your browser and remains private.',
  },
  {
    question: 'Does KanaDojo work offline?',
    answer:
      'KanaDojo works best with an internet connection, but core features like character practice are available offline once the page has loaded. Your progress is always saved locally.',
  },
  {
    question: 'What is the Japanese translator feature?',
    answer:
      'The KanaDojo translator converts between English and Japanese, providing translations in Hiragana, Katakana, and Kanji, along with Romaji pronunciation. It is free to use without any signup.',
  },
  {
    question: 'Can I customize the appearance of KanaDojo?',
    answer:
      'Yes! KanaDojo offers 100+ themes and multiple font options to personalize your learning experience. Find the style that works best for you in the Preferences section.',
  },
];

export const hiraganaFAQs: FAQItem[] = [
  {
    question: 'What is Hiragana?',
    answer:
      'Hiragana is one of three Japanese writing systems, consisting of 46 basic characters that represent syllables. It is used for native Japanese words, grammatical elements, and when Kanji is too difficult or unknown.',
  },
  {
    question: 'How long does it take to learn Hiragana?',
    answer:
      'With consistent daily practice, most learners can memorize all 46 Hiragana characters in 1-2 weeks. KanaDojo provides interactive games and exercises to help you master Hiragana efficiently.',
  },
  {
    question: 'Should I learn Hiragana or Katakana first?',
    answer:
      'It is generally recommended to learn Hiragana first, as it is more commonly used in Japanese text. Once you have mastered Hiragana, learning Katakana becomes easier due to similar learning patterns.',
  },
  {
    question: 'What is the difference between Hiragana and Katakana?',
    answer:
      'Both Hiragana and Katakana represent the same sounds, but they are used for different purposes. Hiragana is used for native Japanese words and grammar, while Katakana is primarily used for foreign words, names, and emphasis.',
  },
];

export const kanjiFAQs: FAQItem[] = [
  {
    question: 'How many Kanji do I need to learn?',
    answer:
      'For basic literacy, you should know about 2,000 Kanji (Jouyou Kanji). For JLPT N5, you need about 100 Kanji; N4 needs 300; N3 needs 650; N2 needs 1,000; and N1 requires around 2,000 Kanji.',
  },
  {
    question: 'What are Onyomi and Kunyomi readings?',
    answer:
      'Onyomi is the Chinese-derived reading of a Kanji, often used in compound words. Kunyomi is the native Japanese reading, typically used when the Kanji stands alone. Most Kanji have multiple readings depending on context.',
  },
  {
    question: 'How should I practice Kanji effectively?',
    answer:
      'Effective Kanji practice includes: learning stroke order, practicing writing by hand, studying radicals, using spaced repetition, learning vocabulary that uses the Kanji, and practicing with context sentences.',
  },
];
