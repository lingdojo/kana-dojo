// All possible locales (for type definitions and metadata)
export const allLocales = ['en', 'es', 'fr', 'zh'] as const;
export type AllLocale = (typeof allLocales)[number];

// Active locales
export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// Use AllLocale for these to avoid type errors when switching between modes
export const localeNames: Record<AllLocale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  zh: '简体中文',
};

export const localeLabels: Record<AllLocale, string> = {
  en: 'EN',
  es: 'ES',
  fr: 'FR',
  zh: '中文',
};
