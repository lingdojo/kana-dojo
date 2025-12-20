'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog';
import PostWrapper from '@/shared/components/layout/PostWrapper';
import patchNotesData from '../patchNotesData.json';

interface PatchNotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PatchNotesModal({
  open,
  onOpenChange
}: PatchNotesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[85vh] w-[95vw] max-w-4xl flex-col gap-0 p-0 sm:max-h-[80vh] sm:w-[90vw]'>
        <DialogHeader className='sticky top-0 z-10 border-b border-[var(--border-color)] bg-[var(--background-color)] px-6 pt-6 pb-4'>
          <DialogTitle className='text-2xl'>Patch Notes</DialogTitle>
        </DialogHeader>
        <div
          id='patch-notes-scroll'
          className='flex-1 overflow-y-auto px-6 py-4'
        >
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
                  <hr className='mt-8 border-[var(--border-color)] opacity-50' />
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
