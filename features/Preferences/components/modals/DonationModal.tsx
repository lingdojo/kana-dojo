'use client';

import { ActionButton } from '@/shared/components/ui/ActionButton';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Heart, X } from 'lucide-react';
import { useCallback } from 'react';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface DonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DonationModal({
  open,
  onOpenChange,
}: DonationModalProps) {
  const { playClick } = useClick();

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
          className='fixed top-1/2 left-1/2 z-50 flex w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden rounded-2xl border-0 border-(--border-color) bg-(--background-color) p-0 max-h-[72vh] sm:max-h-[82vh]'
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <div className='flex items-center justify-between border-b border-(--border-color) bg-(--background-color) px-6 py-5'>
            <DialogPrimitive.Title className='text-2xl font-semibold text-(--main-color)'>
              A small favor, if you can
            </DialogPrimitive.Title>
            {/* <Heart className='size-8 fill-current text-(--secondary-color)' /> */}
            <button
              onClick={handleClose}
              className='shrink-0 rounded-xl p-2 hover:cursor-pointer hover:bg-(--border-color)'
            >
              <X size={24} className='text-(--secondary-color)' />
            </button>
          </div>

          <div className='flex min-h-0 flex-1 flex-col'>
            <div className='min-h-0 flex-1 overflow-y-auto px-6 py-6'>
              <div className='space-y-4 text-(--secondary-color)'>
                <p className='text-lg leading-7'>
                  Thank you so much for spending your time with KanaDojo. We
                  are truly honored to be a part of your Japanese learning journey.
                </p>
                <p className='text-base leading-7'>
                  If KanaDojo has been helpful to you, we would be incredibly
                  grateful if you ever felt able to support it with a
                  donation. We completely understand that not everyone can, and
                  we thank you sincerely just for considering it.
                </p>
                <p className='text-base leading-7'>
                  From day one, we have cared deeply about keeping this a fully
                  free, open-source, and ad-free learning resource for
                  everyone — a respectful alternative to Duolingo — and we are
                  wholeheartedly committed to keeping it that way forever.
                  Thank you for your kindness, your understanding, and for
                  helping us keep KanaDojo welcoming and accessible for
                  everyone who relies on it.
                </p>
                <p className='text-base leading-7'>
                  We appreciate you more than we can properly express, and
                  thank you again for being part of this project and for any
                  support you can offer, in any form.
                </p>
              </div>
            </div>

            <div className='border-t border-(--border-color) px-6 py-5'>
              <div className='flex flex-col gap-3 sm:flex-row'>
                <ActionButton
                  colorScheme='main'
                  borderColorScheme='main'
                  borderRadius='3xl'
                  borderBottomThickness={16}
                  asChild
                  className='px-5 py-4 text-lg font-semibold sm:w-auto'
                >
                  <a
                    href='https://ko-fi.com/kanadojo'
                    target='_blank'
                    rel='noreferrer noopener'
                    onClick={playClick}
                    className='inline-flex items-center gap-2'
                  >
                    <Heart className='size-5 fill-current animate-bounce' />
                    Donate on Ko-fi
                    <svg
                      aria-hidden='true'
                      viewBox='0 0 24 24'
                      className='size-5 mt-0.5'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M7 17L17 7' />
                      <path d='M9 7h8v8' />
                    </svg>
                  </a>
                </ActionButton>
                <button
                  type='button'
                  onClick={handleClose}
                  className='inline-flex items-center justify-center rounded-2xl px-5 py-4 text-lg font-medium text-(--secondary-color) transition-colors hover:cursor-pointer hover:bg-(--background-color) hover:text-(--main-color)'
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
