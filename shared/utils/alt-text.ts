/**
 * Alt Text Generation Utility
 * Generates SEO-optimized, accessible alt text for images
 * Follows best practices for both accessibility and search engine optimization
 */

interface AltTextOptions {
  /** Include the site name (KanaDojo) in alt text */
  includeSiteName?: boolean;
  /** Add context keywords for SEO */
  includeKeywords?: boolean;
  /** Maximum length for alt text (recommended: 125 characters) */
  maxLength?: number;
}

/**
 * Generate alt text for character/kana images
 */
export function generateKanaAltText(
  character: string,
  type: 'hiragana' | 'katakana',
  romanization: string,
  options: AltTextOptions = {},
): string {
  const { includeSiteName = false, includeKeywords = true } = options;

  let alt = `${type === 'hiragana' ? 'Hiragana' : 'Katakana'} character ${character}`;

  if (includeKeywords) {
    alt += ` (${romanization}) - Japanese ${type} syllable`;
  }

  if (includeSiteName) {
    alt += ' | KanaDojo';
  }

  return truncateAlt(alt, options.maxLength);
}

/**
 * Generate alt text for kanji images
 */
export function generateKanjiAltText(
  character: string,
  meaning: string,
  readings: { on?: string[]; kun?: string[] },
  jlptLevel?: string,
  options: AltTextOptions = {},
): string {
  const { includeSiteName = false, includeKeywords = true } = options;

  let alt = `Kanji ${character} meaning "${meaning}"`;

  if (includeKeywords) {
    const readingsStr = [
      ...(readings.on || []).slice(0, 2),
      ...(readings.kun || []).slice(0, 2),
    ].join(', ');

    if (readingsStr) {
      alt += ` (${readingsStr})`;
    }

    if (jlptLevel) {
      alt += ` - ${jlptLevel}`;
    }
  }

  if (includeSiteName) {
    alt += ' | KanaDojo';
  }

  return truncateAlt(alt, options.maxLength);
}

/**
 * Generate alt text for vocabulary/word images
 */
export function generateVocabularyAltText(
  word: string,
  reading: string,
  meaning: string,
  options: AltTextOptions = {},
): string {
  const { includeSiteName = false, includeKeywords = true } = options;

  let alt = `Japanese word ${word}`;

  if (includeKeywords) {
    alt += ` (${reading}) meaning "${meaning}"`;
  }

  if (includeSiteName) {
    alt += ' | KanaDojo';
  }

  return truncateAlt(alt, options.maxLength);
}

/**
 * Generate alt text for learning chart/table images
 */
export function generateChartAltText(
  type: 'hiragana' | 'katakana' | 'kanji' | 'vocabulary',
  subset?: string,
  options: AltTextOptions = {},
): string {
  const { includeSiteName = true, includeKeywords = true } = options;

  const typeMap = {
    hiragana: 'Hiragana',
    katakana: 'Katakana',
    kanji: 'Kanji',
    vocabulary: 'Vocabulary',
  };

  let alt = `${typeMap[type]} chart`;

  if (subset) {
    alt += ` - ${subset}`;
  }

  if (includeKeywords) {
    alt += ` with pronunciation guide and romanization`;
  }

  if (includeSiteName) {
    alt += ' | KanaDojo';
  }

  return truncateAlt(alt, options.maxLength);
}

/**
 * Generate alt text for UI/feature screenshots
 */
export function generateScreenshotAltText(
  feature: string,
  description: string,
  options: AltTextOptions = {},
): string {
  const { includeSiteName = true } = options;

  let alt = `${feature}: ${description}`;

  if (includeSiteName) {
    alt += ' - KanaDojo Japanese learning platform';
  }

  return truncateAlt(alt, options.maxLength);
}

/**
 * Generate alt text for theme/customization images
 */
export function generateThemeAltText(
  themeName: string,
  options: AltTextOptions = {},
): string {
  const { includeSiteName = true, includeKeywords = true } = options;

  let alt = `${themeName} theme preview`;

  if (includeKeywords) {
    alt += ' - customizable Japanese learning interface';
  }

  if (includeSiteName) {
    alt += ' | KanaDojo';
  }

  return truncateAlt(alt, options.maxLength);
}

/**
 * Generate alt text for blog post featured images
 */
export function generateBlogImageAltText(
  postTitle: string,
  imageDescription?: string,
  options: AltTextOptions = {},
): string {
  const { includeSiteName = true, includeKeywords = true } = options;

  let alt = imageDescription || postTitle;

  if (includeKeywords && !imageDescription) {
    alt += ' - Japanese learning guide';
  }

  if (includeSiteName) {
    alt += ' | KanaDojo Academy';
  }

  return truncateAlt(alt, options.maxLength);
}

/**
 * Generate alt text for achievement/badge images
 */
export function generateAchievementAltText(
  achievementName: string,
  description: string,
  options: AltTextOptions = {},
): string {
  const { includeSiteName = false } = options;

  let alt = `Achievement badge: ${achievementName} - ${description}`;

  if (includeSiteName) {
    alt += ' | KanaDojo';
  }

  return truncateAlt(alt, options.maxLength);
}

/**
 * Generate alt text for profile/user avatars
 */
export function generateAvatarAltText(
  userName?: string,
  options: AltTextOptions = {},
): string {
  if (userName) {
    return truncateAlt(`${userName}'s profile picture`, options.maxLength);
  }
  return truncateAlt('User profile picture', options.maxLength);
}

/**
 * Generate alt text for decorative images
 * Note: Decorative images should have empty alt="" in HTML
 * But this function is for cases where some description is needed
 */
export function generateDecorativeAltText(
  context: string,
  options: AltTextOptions = {},
): string {
  return truncateAlt(`Decorative ${context} image`, options.maxLength);
}

/**
 * Generate alt text for icons
 */
export function generateIconAltText(
  iconPurpose: string,
  options: AltTextOptions = {},
): string {
  return truncateAlt(`${iconPurpose} icon`, options.maxLength);
}

/**
 * Generate alt text for infographics/diagrams
 */
export function generateInfographicAltText(
  title: string,
  keyPoints: string[],
  options: AltTextOptions = {},
): string {
  const { includeSiteName = true } = options;

  let alt = `${title} infographic`;

  if (keyPoints.length > 0) {
    alt += ` showing ${keyPoints.slice(0, 3).join(', ')}`;
  }

  if (includeSiteName) {
    alt += ' | KanaDojo';
  }

  return truncateAlt(alt, options.maxLength);
}

/**
 * Truncate alt text to a maximum length while preserving meaning
 */
function truncateAlt(text: string, maxLength: number = 125): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Try to truncate at a word boundary
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    // If we can truncate at a word boundary without losing too much
    return truncated.substring(0, lastSpace) + '...';
  }

  // Otherwise, hard truncate
  return truncated + '...';
}

/**
 * Validate alt text meets accessibility and SEO best practices
 */
export function validateAltText(altText: string): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check if empty
  if (!altText || altText.trim().length === 0) {
    errors.push('Alt text is empty');
    return { isValid: false, warnings, errors };
  }

  // Check length
  if (altText.length > 125) {
    warnings.push('Alt text is longer than recommended 125 characters');
  }

  if (altText.length > 255) {
    errors.push('Alt text exceeds 255 characters (screen reader limit)');
  }

  // Check for common mistakes
  if (
    altText.toLowerCase().startsWith('image of') ||
    altText.toLowerCase().startsWith('picture of') ||
    altText.toLowerCase().startsWith('photo of')
  ) {
    warnings.push(
      'Avoid starting with "image of", "picture of", or "photo of"',
    );
  }

  if (altText.toLowerCase().includes('click here')) {
    warnings.push('Avoid using "click here" in alt text');
  }

  // Check if it ends with file extension
  if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(altText)) {
    errors.push('Alt text should not include file extension');
  }

  const isValid = errors.length === 0;
  return { isValid, warnings, errors };
}

/**
 * Generate comprehensive alt text for any image type
 * Auto-detects best format based on provided data
 */
export function generateAltText(params: {
  type:
    | 'kana'
    | 'kanji'
    | 'vocabulary'
    | 'chart'
    | 'screenshot'
    | 'theme'
    | 'blog'
    | 'achievement'
    | 'avatar'
    | 'icon'
    | 'decorative'
    | 'infographic';
  data: Record<string, unknown>;
  options?: AltTextOptions;
}): string {
  const { type, data, options = {} } = params;

  switch (type) {
    case 'kana':
      return generateKanaAltText(
        data.character as string,
        data.type as 'hiragana' | 'katakana',
        data.romanization as string,
        options,
      );
    case 'kanji':
      return generateKanjiAltText(
        data.character as string,
        data.meaning as string,
        data.readings as { on?: string[]; kun?: string[] },
        data.jlptLevel as string | undefined,
        options,
      );
    case 'vocabulary':
      return generateVocabularyAltText(
        data.word as string,
        data.reading as string,
        data.meaning as string,
        options,
      );
    case 'chart':
      return generateChartAltText(
        data.chartType as 'hiragana' | 'katakana' | 'kanji' | 'vocabulary',
        data.subset as string | undefined,
        options,
      );
    case 'screenshot':
      return generateScreenshotAltText(
        data.feature as string,
        data.description as string,
        options,
      );
    case 'theme':
      return generateThemeAltText(data.themeName as string, options);
    case 'blog':
      return generateBlogImageAltText(
        data.postTitle as string,
        data.imageDescription as string | undefined,
        options,
      );
    case 'achievement':
      return generateAchievementAltText(
        data.achievementName as string,
        data.description as string,
        options,
      );
    case 'avatar':
      return generateAvatarAltText(
        data.userName as string | undefined,
        options,
      );
    case 'icon':
      return generateIconAltText(data.iconPurpose as string, options);
    case 'decorative':
      return generateDecorativeAltText(data.context as string, options);
    case 'infographic':
      return generateInfographicAltText(
        data.title as string,
        data.keyPoints as string[],
        options,
      );
    default:
      return 'Image';
  }
}
