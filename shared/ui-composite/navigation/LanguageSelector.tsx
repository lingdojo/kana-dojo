'use client';

import { useParams } from 'next/navigation';
import { useRouter, usePathname, type Locale } from '@/core/i18n/routing';
import { localeNames } from '@/core/i18n/config';
import { routing } from '@/core/i18n/routing';

export function LanguageSelector() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = (params?.locale as Locale) || routing.defaultLocale;

  const changeLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <select
      value={currentLocale}
      onChange={e => changeLocale(e.target.value as Locale)}
      className='rounded-lg border bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800'
      aria-label='Select language'
    >
      {routing.locales.map(locale => (
        <option key={locale} value={locale}>
          {localeNames[locale]}
        </option>
      ))}
    </select>
  );
}
