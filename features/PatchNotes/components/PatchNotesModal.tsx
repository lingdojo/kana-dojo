'use client';

import PostWrapper from '@/shared/ui-composite/layout/PostWrapper';
import { useClick } from '@/shared/hooks/generic/useAudio';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, CircleHelp } from 'lucide-react';
import { useCallback } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/components/popover';
import commitInfo from '@/shared/data/commitInfo.json';
import patchNotesData from '../patchNotesData.json';

interface PatchNotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PatchNotesModal({
  open,
  onOpenChange,
}: PatchNotesModalProps) {
  const { playClick } = useClick();

  const handleClose = useCallback(() => {
    playClick();
    onOpenChange(false);
  }, [playClick, onOpenChange]);

  const isProduction =
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

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
            <div className='flex flex-row items-center gap-2'>
              <DialogPrimitive.Title className='text-2xl font-semibold text-(--main-color)'>
                Patch Notes
              </DialogPrimitive.Title>
              {!isProduction && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type='button'
                      aria-label='View commit details'
                      className='rounded-full hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--main-color)'
                    >
                      <CircleHelp
                        size={18}
                        className='text-(--secondary-color) hover:text-(--main-color)'
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side='bottom'
                    align='start'
                    className='w-72 border border-(--border-color) bg-(--background-color) p-4 text-(--main-color)'
                  >
                    <div className='space-y-2 text-sm'>
                      <div>
                        <span className='text-(--secondary-color) text-xs font-medium uppercase tracking-wide'>
                          Commit
                        </span>
                        <p className='mt-0.5 font-mono text-xs text-(--main-color) break-all'>
                          {commitInfo.hash}
                        </p>
                      </div>
                      <div>
                        <span className='text-(--secondary-color) text-xs font-medium uppercase tracking-wide'>
                          Date
                        </span>
                        <p className='mt-0.5 text-(--main-color)'>
                          {new Date(commitInfo.date).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZoneName: 'short',
                          })}
                        </p>
                      </div>
                      <div>
                        <span className='text-(--secondary-color) text-xs font-medium uppercase tracking-wide'>
                          Subject
                        </span>
                        <p className='mt-0.5 text-(--main-color)'>
                          {commitInfo.subject}
                        </p>
                      </div>
                      {commitInfo.body && (
                        <div>
                          <span className='text-(--secondary-color) text-xs font-medium uppercase tracking-wide'>
                            Description
                          </span>
                          <p className='mt-0.5 whitespace-pre-wrap text-(--main-color)'>
                            {commitInfo.body}
                          </p>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <button
              onClick={handleClose}
              className='shrink-0 rounded-xl p-2 hover:cursor-pointer hover:bg-(--card-color)'
            >
              <X size={24} className='text-(--secondary-color)' />
            </button>
          </div>
          <div id='modal-scroll' className='flex-1 overflow-y-auto px-6 py-6'>
            <div className='space-y-8'>
              {patchNotesData.map((patch, index) => (
                <div key={index}>
                  <PostWrapper
                    textContent={patch.changes
                      .map(change => `- ${change}`)
                      .join('\n')}
                    tag={`v${patch.version}`}
                    date={new Date(patch.date).toISOString()}
                  />
                  {index < patchNotesData.length - 1 && (
                    <hr className='mt-8 border-(--border-color) opacity-50' />
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

