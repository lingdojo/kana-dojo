'use client';

import PostWrapper from '@/shared/ui-composite/layout/PostWrapper';
import { useClick } from '@/shared/hooks/generic/useAudio';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useCallback } from 'react';
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
              Patch Notes
            </DialogPrimitive.Title>
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

