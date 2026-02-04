'use client';
import clsx from 'clsx';
import { useState, useMemo } from 'react';
import { useClick } from '@/shared/hooks/useAudio';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { buttonBorderStyles } from '@/shared/lib/styles';
import fonts from '../data/fonts';
import { isRecommendedFont } from '../data/recommendedFonts';
import { Star, Type } from 'lucide-react';
import CollapsibleSection from './CollapsibleSection';

const Fonts = () => {
  const { playClick } = useClick();

  const currentFont = usePreferencesStore(state => state.font);
  const setFont = usePreferencesStore(state => state.setFont);

  // Separate fonts into recommended and other categories
  const { recommendedFonts, otherFonts } = useMemo(() => {
    const recommended = fonts.filter(f => isRecommendedFont(f.name));
    const other = fonts.filter(f => !isRecommendedFont(f.name));
    return { recommendedFonts: recommended, otherFonts: other };
  }, []);

  const renderFontCard = (fontObj: (typeof fonts)[number]) => (
    <label
      key={fontObj.name}
      className={clsx(
        'flex items-center justify-center',
        buttonBorderStyles,
        'border-1 border-(--card-color) px-4 py-4',
        'flex-1 overflow-hidden',
        fontObj.name === currentFont && 'border-(--main-color)',
      )}
      onClick={() => playClick()}
    >
      <input
        type='radio'
        name='selectedTheme'
        onChange={() => {
          setFont(fontObj.name);
        }}
        className='hidden'
      />
      <p className={clsx('text-center text-xl', fontObj.font.className)}>
        <span className='text-(--secondary-color)'>
          {fontObj.name === currentFont ? '\u2B24 ' : ''}
        </span>
        <span className=''>{fontObj.name}</span>
        {fontObj.name === 'Zen Maru Gothic' && ' (default)'}
        <span className='ml-2 text-(--secondary-color)'>かな道場</span>
      </p>
    </label>
  );

  return (
    <div className='flex flex-col gap-6'>
      {/* <button
        className={clsx(
          'flex w-1/4 items-center justify-center gap-2 p-6',
          buttonBorderStyles,
          'w-full text-xl',
          'flex-1 overflow-hidden',
        )}
        onClick={() => {
          playClick();
          if (fonts.length > 0) {
            const randomFont = fonts[random.integer(0, fonts.length - 1)];
            setRandomFont(randomFont);
            setFont(randomFont.name);
          }
        }}
      >
        <span className='mb-0.5'>
          {randomFont?.name === currentFont ? '\u2B24 ' : ''}
        </span>
        <Dice5 className='text-(--secondary-color)' />
        Random Font
      </button> */}

      {/* Recommended Fonts Section */}
      <CollapsibleSection
        title='Recommended'
        icon={<Star size={18} />}
        level='subsubsection'
        defaultOpen={true}
        storageKey='prefs-fonts-recommended'
      >
        <fieldset
          className={clsx(
            'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4',
          )}
        >
          {recommendedFonts.map(renderFontCard)}
        </fieldset>
      </CollapsibleSection>

      {/* Other Fonts Section */}
      <CollapsibleSection
        title='Other'
        icon={<Type size={18} />}
        level='subsubsection'
        defaultOpen={true}
        storageKey='prefs-fonts-other'
      >
        <fieldset
          className={clsx(
            'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4',
          )}
        >
          {otherFonts.map(renderFontCard)}
        </fieldset>
      </CollapsibleSection>
      <div className='flex flex-col gap-2'>
        <h4 className='text-xl'>Hiragana:</h4>
        <p className='text-3xl text-(--secondary-color)' lang='ja'>
          {'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.slice(
            0,
            20,
          )}
        </p>
        <h4 className='text-xl'>Katakana:</h4>
        <p className='text-3xl text-(--secondary-color)' lang='ja'>
          {'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメもヤユヨラリルレロワヲン'.slice(
            0,
            20,
          )}
        </p>
        <h4 className='text-xl'>Kanji:</h4>
        <p className='text-3xl text-(--secondary-color)' lang='ja'>
          人日大小学 校生先円上下中外右左名前時分国
        </p>
        {/* 
        <h4 className='text-xl'>Sample sentence:</h4>
        <p className='text-3xl text-(--secondary-color)' lang='ja'>
          人類社会のすべての構成員の固有の尊厳と平等で譲ることのできない権利とを承認することは
        </p>
 */}
      </div>
    </div>
  );
};

export default Fonts;
