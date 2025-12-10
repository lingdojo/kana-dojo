'use client';
import clsx from 'clsx';
import { useState } from 'react';
import { useClick } from '@/shared/hooks/useAudio';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { buttonBorderStyles } from '@/shared/lib/styles';
import fonts from '../data/fonts';
import { Dice5 } from 'lucide-react';
import { Random } from 'random-js';

const random = new Random();

const Fonts = () => {
  const { playClick } = useClick();

  const currentFont = usePreferencesStore(state => state.font);
  const setFont = usePreferencesStore(state => state.setFont);

  const [randomFont, setRandomFont] = useState(
    fonts.length > 0 ? fonts[random.integer(0, fonts.length - 1)] : null
  );

  return (
    <div className='flex flex-col gap-4'>
      <button
        className={clsx(
          'p-6 flex justify-center items-center gap-2 w-1/4',
          buttonBorderStyles,
          'text-xl w-full',
          'flex-1 overflow-hidden'
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
        <Dice5 className='text-[var(--secondary-color)]' />
        Random Font
      </button>

      <fieldset
        className={clsx('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4')}
      >
        {fonts.map((fontObj: (typeof fonts)[number]) => (
          <label
            key={fontObj.name}
            className={clsx(
              'flex justify-center items-center',
              buttonBorderStyles,
              'py-4 px-4 border-[var(--card-color)] border-1',
              'flex-1 overflow-hidden',
              fontObj.name === currentFont && 'border-[var(--main-color)]'
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
              <span className='text-[var(--secondary-color)]'>
                {fontObj.name === currentFont ? '\u2B24 ' : ''}
              </span>
              <span className=''>{fontObj.name}</span>
              {fontObj.name === 'Zen Maru Gothic' && ' (default)'}
              <span className='ml-2 text-[var(--secondary-color)]'>
                かな道場
              </span>
            </p>
          </label>
        ))}
      </fieldset>
      <div className='flex flex-col gap-2'>
        <h4 className='text-xl'>Hiragana:</h4>
        <p className='text-3xl text-[var(--secondary-color)]' lang='ja'>
          {'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.slice(
            0,
            20
          )}
        </p>
        <h4 className='text-xl'>Katakana:</h4>
        <p className='text-3xl text-[var(--secondary-color)]' lang='ja'>
          {'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメもヤユヨラリルレロワヲン'.slice(
            0,
            20
          )}
        </p>
        <h4 className='text-xl'>Kanji:</h4>
        <p className='text-3xl text-[var(--secondary-color)]' lang='ja'>
          人日大小学 校生先円上下中外右左名前時分国
        </p>
        <h4 className='text-xl'>Sample sentence:</h4>
        <p className='text-3xl text-[var(--secondary-color)]' lang='ja'>
          人類社会のすべての構成員の固有の尊厳と平等で譲ることのできない権利とを承認することは
        </p>
      </div>
    </div>
  );
};

export default Fonts;
