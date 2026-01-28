// All possible locales (for type definitions and metadata)
export const allLocales = ['en', 'es'] as const;
export type AllLocale = (typeof allLocales)[number];

// Active locales (TEMP: Single locale for dev performance)
export const locales = ['en'] as const; // Change to allLocales for full i18n
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// Use AllLocale for these to avoid type errors when switching between modes
export const localeNames: Record<AllLocale, string> = {
  en: 'English',
  es: 'Español',
};

export const localeLabels: Record<AllLocale, string> = {
  en: 'EN',
  es: 'ES',
};
