/**
 * Removes the locale prefix from a pathname
 * @param pathname - The full pathname (e.g., /en/kana or /es/kanji)
 * @returns The pathname without locale (e.g., /kana or /kanji)
 */
export function removeLocaleFromPath(pathname: string): string {
  // Remove locale prefix (e.g., /en/kana -> /kana, /es/ -> /)
  return pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
}

/**
 * Gets the locale from a pathname
 * @param pathname - The full pathname (e.g., /en/kana)
 * @returns The locale (e.g., 'en') or null if not found
 */
export function getLocaleFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/);
  return match ? match[1] : null;
}

/**
 * Builds a path with locale prefix
 * @param pathname - The pathname without locale (e.g., /kana)
 * @param locale - The locale to add (e.g., 'en')
 * @returns The pathname with locale (e.g., /en/kana)
 */
export function addLocaleToPath(pathname: string, locale: string): string {
  // Remove leading slash if present, then add locale
  const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  return `/${locale}${cleanPath ? '/' + cleanPath : ''}`;
}
