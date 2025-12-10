'use client';
import clsx from 'clsx';
import { useState } from 'react';
import { useClick } from '@/shared/hooks/useAudio';
import { cardBorderStyles } from '@/shared/lib/styles';
import { ChevronUp } from 'lucide-react';
import translationGen from '@/shared/lib/info';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { removeLocaleFromPath } from '@/shared/lib/pathUtils';
import { useTranslations } from 'next-intl';

const Info = () => {
  const pathname = usePathname();
  const t = useTranslations('menuInfo');

  // Remove locale from pathname (e.g., /en/kana -> /kana)
  const pathWithoutLocale = removeLocaleFromPath(pathname);

  // Get translations object, passing the translation function
  const translations = translationGen(t);

  // Get page data with fallback to home
  const pageData =
    translations[pathWithoutLocale as keyof typeof translations] ||
    translations['/'];

  // Provide default values to avoid destructuring undefined
  const { header, content } = pageData || { header: '', content: '' };

  const { playClick } = useClick();

  const [showInfo, setShowInfo] = useState(
    ['/kana', '/kanji', '/vocabulary', '/', '/sentences'].includes(
      pathWithoutLocale
    )
      ? true
      : false
  );

  return (
    <div
      className={clsx(
        'p-4 rounded-2xl w-full flex flex-col gap-1 overflow-hidden',
        cardBorderStyles
      )}
    >
      <motion.h3
        className={clsx(
          'group text-xl hover:cursor-pointer',
          'flex flex-row items-center gap-1'
        )}
        onClick={() => {
          playClick();
          setShowInfo(showInfo => !showInfo);
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'linear' }}
      >
        <ChevronUp
          className={clsx(
            'duration-250',
            'text-[var(--border-color)]',
            'max-md:group-active:text-[var(--secondary-color)]',
            'md:group-hover:text-[var(--secondary-color)]',
            !showInfo && 'rotate-180'
          )}
          size={24}
        />
        {header}
      </motion.h3>
      <motion.div
        className={clsx(
          'overflow-hidden duration-300',
          showInfo ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          // 'text-[var(--secondary-color)]'
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'linear' }}
      >
        {content}
      </motion.div>
    </div>
  );
};

export default Info;
