'use client';

import fonts from '@/features/Preferences/data/fonts';
import { isRecommendedFont } from '@/features/Preferences/data/recommendedFonts';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { useClick } from '@/shared/hooks/useAudio';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, BookOpen, Sparkles } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import clsx from 'clsx';

interface FontsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FontCardProps {
  fontName: string;
  fontClassName: string;
  isSelected: boolean;
  isDefault: boolean;
  onClick: (name: string) => void;
}

const FontCard = memo(function FontCard({
  fontName,
  fontClassName,
  isSelected,
  isDefault,
  onClick,
}: FontCardProps) {
  return (
    <label
      className={clsx(
        'flex cursor-pointer items-center justify-center rounded-xl border-0 bg-(--card-color) px-4 py-4',
      )}
      style={{
        outline: isSelected ? '3px solid var(--secondary-color)' : 'none',
      }}
      onClick={() => onClick(fontName)}
    >
      <p className={clsx('text-center text-xl', fontClassName)}>
        {/* <span className='text-(--secondary-color)'>
          {isSelected ? '\u2B24 ' : ''}
        </span> */}
        <span className='text-(--main-color)'>
          {fontName}
          {isDefault && ' (default)'}
        </span>
        <span className='ml-2 text-(--secondary-color)'>かな道場</span>
      </p>
    </label>
  );
});

export default function FontsModal({ open, onOpenChange }: FontsModalProps) {
  const { playClick } = useClick();
  const selectedFont = usePreferencesStore(state => state.font);
  const setSelectedFont = usePreferencesStore(state => state.setFont);

  // Separate fonts into recommended and other categories
  const { recommendedFonts, otherFonts } = useMemo(() => {
    const recommended = fonts.filter(f => isRecommendedFont(f.name));
    const other = fonts.filter(f => !isRecommendedFont(f.name));
    return { recommendedFonts: recommended, otherFonts: other };
  }, []);

  const handleFontClick = useCallback(
    (fontName: string) => {
      playClick();
      setSelectedFont(fontName);
    },
    [playClick, setSelectedFont],
  );

  const handleClose = useCallback(() => {
    playClick();
    onOpenChange(false);
  }, [playClick, onOpenChange]);

  if (!open) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal forceMount>
        <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/80' />
        <DialogPrimitive.Content
          className='fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col gap-0 rounded-2xl border-0 border-(--border-color) bg-(--background-color) p-0 sm:max-h-[80vh] sm:w-[90vw]'
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <div className='sticky top-0 z-10 flex flex-row items-center justify-between rounded-t-2xl border-b border-(--border-color) bg-(--background-color) px-6 pt-6 pb-4'>
            <DialogPrimitive.Title className='text-2xl font-semibold text-(--main-color)'>
              Fonts
            </DialogPrimitive.Title>
            <button
              onClick={handleClose}
              className='shrink-0 rounded-xl p-2 hover:cursor-pointer hover:bg-(--card-color)'
            >
              <X size={24} className='text-(--secondary-color)' />
            </button>
          </div>
          <div id='modal-scroll' className='flex-1 overflow-y-auto px-6 py-6'>
            {/* Recommended Fonts Section */}
            <div className='mb-6'>
              <div className='mb-3 flex items-center gap-2'>
                <h3 className='text-lg font-semibold text-(--main-color)'>
                  Recommended
                </h3>
                {/* 
                <span className='text-sm text-(--secondary-color)'>
                  ({recommendedFonts.length})
                </span>
 */}
              </div>
              {/* 
              <p className='mb-4 text-sm text-(--secondary-color)'>
                Used in real Japanese textbooks, books & media
              </p>
 */}
              <div className='grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3'>
                {recommendedFonts.map(fontObj => (
                  <FontCard
                    key={fontObj.name}
                    fontName={fontObj.name}
                    fontClassName={fontObj.font.className}
                    isSelected={selectedFont === fontObj.name}
                    isDefault={fontObj.name === 'Zen Maru Gothic'}
                    onClick={handleFontClick}
                  />
                ))}
              </div>
            </div>

            {/* Other Fonts Section */}
            <div>
              <div className='mb-3 flex items-center gap-2'>
                <h3 className='text-lg font-semibold text-(--main-color)'>
                  Other
                </h3>
                {/* 
                <span className='text-sm text-(--secondary-color)'>
                  ({otherFonts.length})
                </span>
 */}
              </div>
              {/* 
              <p className='mb-4 text-sm text-(--secondary-color)'>
                Fun & decorative fonts for entertainment
              </p>
 */}
              <div className='grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3'>
                {otherFonts.map(fontObj => (
                  <FontCard
                    key={fontObj.name}
                    fontName={fontObj.name}
                    fontClassName={fontObj.font.className}
                    isSelected={selectedFont === fontObj.name}
                    isDefault={fontObj.name === 'Zen Maru Gothic'}
                    onClick={handleFontClick}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
