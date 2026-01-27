/**
 * Internal Linking Utilities
 * Helps create consistent internal links for better SEO
 * Good internal linking improves crawlability and page authority distribution
 */

const SITE_URL = 'https://kanadojo.com';

export interface InternalLink {
  href: string;
  text: string;
  title?: string;
}

/**
 * Main navigation links
 */
export const mainLinks = {
  home: {
    href: '/',
    text: 'KanaDojo',
    title: 'KanaDojo - Learn Japanese Online',
  },
  kana: {
    href: '/kana',
    text: 'Kana',
    title: 'Learn Hiragana and Katakana',
  },
  kanji: {
    href: '/kanji',
    text: 'Kanji',
    title: 'Learn Japanese Kanji by JLPT Level',
  },
  vocabulary: {
    href: '/vocabulary',
    text: 'Vocabulary',
    title: 'Learn Japanese Vocabulary',
  },
  translate: {
    href: '/translate',
    text: 'Translator',
    title: 'Free Japanese to English Translator',
  },
  academy: {
    href: '/academy',
    text: 'Academy',
    title: 'Japanese Learning Guides and Articles',
  },
} as const;

/**
 * Learning links (practice pages)
 */
export const learningLinks = {
  hiraganaPractice: {
    href: '/hiragana-practice',
    text: 'Hiragana Practice',
    title: 'Practice Hiragana Online',
  },
  katakanaPractice: {
    href: '/katakana-practice',
    text: 'Katakana Practice',
    title: 'Practice Katakana Online',
  },
  kanjiPractice: {
    href: '/kanji-practice',
    text: 'Kanji Practice',
    title: 'Practice Japanese Kanji',
  },
  kanaBlitz: {
    href: '/kana/blitz',
    text: 'Kana Blitz',
    title: 'Test Your Kana Speed',
  },
  kanjiBlitz: {
    href: '/kanji/blitz',
    text: 'Kanji Blitz',
    title: 'Test Your Kanji Speed',
  },
  vocabularyBlitz: {
    href: '/vocabulary/blitz',
    text: 'Vocabulary Blitz',
    title: 'Test Your Vocabulary Speed',
  },
} as const;

/**
 * JLPT level links
 */
export const jlptLinks = {
  n5: {
    href: '/jlpt/n5',
    text: 'JLPT N5',
    title: 'JLPT N5 Study Materials',
  },
  n4: {
    href: '/jlpt/n4',
    text: 'JLPT N4',
    title: 'JLPT N4 Study Materials',
  },
  n3: {
    href: '/jlpt/n3',
    text: 'JLPT N3',
    title: 'JLPT N3 Study Materials',
  },
  n2: {
    href: '/jlpt/n2',
    text: 'JLPT N2',
    title: 'JLPT N2 Study Materials',
  },
  n1: {
    href: '/jlpt/n1',
    text: 'JLPT N1',
    title: 'JLPT N1 Study Materials',
  },
} as const;

/**
 * Utility links
 */
export const utilityLinks = {
  progress: {
    href: '/progress',
    text: 'Progress',
    title: 'View Your Learning Progress',
  },
  preferences: {
    href: '/preferences',
    text: 'Preferences',
    title: 'Customize Your Learning Experience',
  },
  achievements: {
    href: '/achievements',
    text: 'Achievements',
    title: 'View Your Achievements',
  },
  faq: {
    href: '/faq',
    text: 'FAQ',
    title: 'Frequently Asked Questions',
  },
} as const;

/**
 * Get all internal links for sitemap or navigation
 */
export function getAllInternalLinks(): InternalLink[] {
  return [
    ...Object.values(mainLinks),
    ...Object.values(learningLinks),
    ...Object.values(jlptLinks),
    ...Object.values(utilityLinks),
  ];
}

/**
 * Generate contextual internal links based on keywords
 * Useful for automatically linking keywords in content to relevant pages
 */
export function getContextualLink(keyword: string): InternalLink | null {
  const keywordLower = keyword.toLowerCase();

  // Hiragana variations
  if (
    ['hiragana', 'ひらがな', 'hiragana characters', 'hiragana chart'].includes(
      keywordLower,
    )
  ) {
    return learningLinks.hiraganaPractice;
  }

  // Katakana variations
  if (
    ['katakana', 'カタカナ', 'katakana characters', 'katakana chart'].includes(
      keywordLower,
    )
  ) {
    return learningLinks.katakanaPractice;
  }

  // Kanji variations
  if (
    [
      'kanji',
      'kanji characters',
      '漢字',
      'kanji practice',
      'learn kanji',
    ].includes(keywordLower)
  ) {
    return mainLinks.kanji;
  }

  // Vocabulary
  if (
    ['vocabulary', 'japanese vocabulary', 'japanese words', 'vocab'].includes(
      keywordLower,
    )
  ) {
    return mainLinks.vocabulary;
  }

  // Translator
  if (
    ['translator', 'translate', 'translation', 'japanese translator'].includes(
      keywordLower,
    )
  ) {
    return mainLinks.translate;
  }

  // JLPT levels
  if (['jlpt n5', 'n5'].includes(keywordLower)) return jlptLinks.n5;
  if (['jlpt n4', 'n4'].includes(keywordLower)) return jlptLinks.n4;
  if (['jlpt n3', 'n3'].includes(keywordLower)) return jlptLinks.n3;
  if (['jlpt n2', 'n2'].includes(keywordLower)) return jlptLinks.n2;
  if (['jlpt n1', 'n1'].includes(keywordLower)) return jlptLinks.n1;

  return null;
}

/**
 * Generate related links based on current page
 * Useful for "Related Articles" or "You might also like" sections
 */
export function getRelatedLinks(currentPath: string): InternalLink[] {
  const related: InternalLink[] = [];

  // Kana-related pages
  if (currentPath.includes('kana') || currentPath.includes('hiragana')) {
    related.push(
      learningLinks.hiraganaPractice,
      learningLinks.katakanaPractice,
      learningLinks.kanaBlitz,
    );
  }

  // Kanji-related pages
  if (currentPath.includes('kanji')) {
    related.push(
      learningLinks.kanjiPractice,
      learningLinks.kanjiBlitz,
      jlptLinks.n5,
      jlptLinks.n4,
    );
  }

  // Vocabulary-related pages
  if (currentPath.includes('vocabulary') || currentPath.includes('vocab')) {
    related.push(learningLinks.vocabularyBlitz, jlptLinks.n5, mainLinks.kanji);
  }

  // JLPT-related pages
  if (currentPath.includes('jlpt')) {
    related.push(
      mainLinks.kanji,
      mainLinks.vocabulary,
      learningLinks.kanjiPractice,
    );
  }

  // Remove duplicates and current page
  return related.filter(
    (link, index, self) =>
      self.findIndex(l => l.href === link.href) === index &&
      !currentPath.includes(link.href),
  );
}

/**
 * Create anchor link for smooth scrolling
 */
export function createAnchorLink(id: string, text: string): InternalLink {
  return {
    href: `#${id}`,
    text,
    title: `Jump to ${text}`,
  };
}

/**
 * Generate breadcrumb links from path
 */
export function generateBreadcrumbLinks(
  pathname: string,
  locale: string = 'en',
): Array<{ name: string; url: string }> {
  const breadcrumbs = [{ name: 'Home', url: `/${locale}` }];

  // Remove locale prefix and split path
  const pathWithoutLocale = pathname.replace(/^\/(en|es)/, '');
  const segments = pathWithoutLocale.split('/').filter(Boolean);

  let currentPath = `/${locale}`;

  segments.forEach(segment => {
    currentPath += `/${segment}`;

    // Convert segment to readable name
    let name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Special cases
    if (segment === 'kana') name = 'Kana';
    if (segment === 'kanji') name = 'Kanji';
    if (segment === 'vocabulary') name = 'Vocabulary';
    if (segment === 'academy') name = 'Academy';
    if (segment === 'translate') name = 'Translator';
    if (segment === 'faq') name = 'FAQ';
    if (segment === 'jlpt') name = 'JLPT';

    breadcrumbs.push({
      name,
      url: currentPath,
    });
  });

  return breadcrumbs;
}

/**
 * Get absolute URL for a path
 */
export function getAbsoluteUrl(path: string, locale: string = 'en'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}/${locale}${normalizedPath}`;
}

/**
 * Create a link to an Academy article
 */
export function createAcademyLink(slug: string, title: string): InternalLink {
  return {
    href: `/academy/${slug}`,
    text: title,
    title: `Read: ${title}`,
  };
}

/**
 * Generate "Continue Learning" links based on user's current activity
 */
export function getContinueLearningLinks(
  lastVisited: string[],
): InternalLink[] {
  const suggestions: InternalLink[] = [];

  // If user visited Hiragana, suggest Katakana
  if (lastVisited.some(path => path.includes('hiragana'))) {
    suggestions.push(learningLinks.katakanaPractice);
  }

  // If user visited Kana, suggest Kanji
  if (
    lastVisited.some(path => path.includes('kana') || path.includes('katakana'))
  ) {
    suggestions.push(mainLinks.kanji);
  }

  // If user visited Kanji, suggest Vocabulary
  if (lastVisited.some(path => path.includes('kanji'))) {
    suggestions.push(mainLinks.vocabulary);
  }

  // Always suggest practice games
  if (!lastVisited.some(path => path.includes('blitz'))) {
    suggestions.push(learningLinks.kanaBlitz);
  }

  return suggestions.slice(0, 3); // Return max 3 suggestions
}
