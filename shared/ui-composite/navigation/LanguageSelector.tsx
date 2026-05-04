'use client';

import clsx from 'clsx';
import { Languages } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRouter, usePathname, type Locale } from '@/core/i18n/routing';
import { localeNames } from '@/core/i18n/config';
import { routing } from '@/core/i18n/routing';
import { useClick } from '@/shared/hooks/generic/useAudio';

export function LanguageSelector({ className }: { className?: string }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = (params?.locale as Locale) || routing.defaultLocale;
  const { playClick } = useClick();

  const changeLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div
      className={clsx(
        'relative inline-flex h-12 w-12 items-center justify-center rounded-2xl',
        'bg-(--main-color) text-(--background-color)',
        'border-b-8 border-(--main-color-accent)',
        'transition-all duration-200',
        'active:mb-[6px] active:translate-y-[6px] active:border-b-0',
        'motion-safe:animate-float [--float-distance:-3px] [animation-delay:650ms]',
        className,
      )}
    >
      <Languages size={24} strokeWidth={2.4} aria-hidden='true' />
      <select
        value={currentLocale}
        onChange={e => {
          playClick();
          changeLocale(e.target.value as Locale);
        }}
        className='absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-2xl text-base opacity-0'
        aria-label='切换语言 / Select language'
      >
        {routing.locales.map(locale => (
          <option key={locale} value={locale}>
            {localeNames[locale]}
          </option>
        ))}
      </select>
    </div>
  );
}

export function LanguageSelectorIcon() {
  return <Languages size={24} strokeWidth={2.4} />;
}
