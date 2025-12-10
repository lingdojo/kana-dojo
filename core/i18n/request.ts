import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * List of translation namespaces
 * Each namespace corresponds to a JSON file in locales/{lang}/
 */
const NAMESPACES = [
  'common',
  'navigation',
  'kana',
  'kanji',
  'vocabulary',
  'achievements',
  'statistics',
  'settings',
  'errors',
  'menuInfo'
] as const;

// Cache for loaded messages to avoid re-importing in dev
const messageCache = new Map<string, Record<string, unknown>>();

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is always defined and valid
  const validLocale =
    locale &&
    routing.locales.includes(locale as (typeof routing.locales)[number])
      ? locale
      : routing.defaultLocale;

  // Check cache first (helps in dev with HMR)
  const cacheKey = validLocale;
  if (messageCache.has(cacheKey)) {
    return {
      locale: validLocale,
      messages: messageCache.get(cacheKey)!
    };
  }

  // Load all namespace translations in parallel for better performance
  const namespacePromises = NAMESPACES.map(async namespace => {
    try {
      const namespaceMessages = (
        await import(`./locales/${validLocale}/${namespace}.json`)
      ).default;
      return [namespace, namespaceMessages] as const;
    } catch (error) {
      console.error(
        `Failed to load namespace "${namespace}" for locale "${validLocale}":`,
        error
      );
      return [namespace, {}] as const;
    }
  });

  const results = await Promise.all(namespacePromises);
  const messages: Record<string, unknown> = Object.fromEntries(results);

  // Cache the result
  messageCache.set(cacheKey, messages);

  return {
    locale: validLocale,
    messages
  };
});
