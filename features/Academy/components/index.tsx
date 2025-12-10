'use client';
import { Link } from '@/core/i18n/routing';
import Banner from '@/shared/components/Menu/Banner';
import clsx from 'clsx';

const Academy = () => {
  const links = [
    {
      title: 'Hiragana 101',
      href: '/academy/hiragana-101',
      description:
        'Learn the basics of Hiragana, the first of the three Japanese scripts.'
    },
    {
      title: 'Katakana 101',
      href: '/academy/katakana-101',
      description:
        'Learn the basics of Katakana, the second of the three Japanese scripts.'
    },
    {
      title: 'Kanji 101',
      href: '/academy/kanji-101',
      description:
        'Learn the basics of Kanji, the third of the three Japanese scripts.'
    },
    {
      title: 'Grammar 101',
      href: '/academy/grammar-101',
      description:
        'Learn the basics of Japanese grammar, including particles and verb conjugation.'
    }
  ];

  return (
    <div className='flex flex-col gap-8 min-h-[100dvh] max-w-[100dvw] px-4 sm:px-8 md:px-20 xl:px-66  pb-20'>
      <Banner />
      <div className='w-full grid grid-cols-2 gap-10 flex-1 md:flex-none'>
        {links.map((link, i) => (
          <Link href={link.href} key={i}>
            <button
              className={clsx(
                'w-full h-full text-2xl font-semibold border-2 py-6  rounded-2xl transform transition duration-200 hover:scale-y-108 hover:scale-x-102 hover:cursor-pointer items-center justify-center bg-[var(--card-color)] border-[var(--border-color)]',
                'flex flex-col'
              )}
            >
              <h4 lang='en'>{link.title}</h4>
              <p className='text-base'>{link.description}</p>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Academy;
