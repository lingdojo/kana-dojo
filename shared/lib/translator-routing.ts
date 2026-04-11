const LOCALE_PREFIX_PATTERN = /^\/(en|es)(\/.*)?$/i;

export function isTranslatorPath(pathname: string) {
  return pathname === '/translate' || pathname.startsWith('/translate/');
}

export function getCanonicalNoPrefixPath(pathname: string) {
  const prefixedMatch = pathname.match(LOCALE_PREFIX_PATTERN);
  if (!prefixedMatch) return pathname;
  return prefixedMatch[2] || '/';
}

export function hasLocalePrefix(pathname: string) {
  return LOCALE_PREFIX_PATTERN.test(pathname);
}
