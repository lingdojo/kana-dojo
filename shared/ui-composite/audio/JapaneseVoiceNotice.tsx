'use client';

import { X } from 'lucide-react';

interface JapaneseVoiceNoticeProps {
  requested: boolean;
  voicesLoaded: boolean;
  hasJapaneseVoices: boolean;
  onDismiss: () => void;
}

const JapaneseVoiceNotice = ({
  requested,
  voicesLoaded,
  hasJapaneseVoices,
  onDismiss,
}: JapaneseVoiceNoticeProps) => {
  if (!requested || !voicesLoaded || hasJapaneseVoices) return null;

  return (
    <div
      role='status'
      aria-live='polite'
      className='flex items-start justify-between gap-3 rounded-lg border border-(--border-color) bg-(--card-color) px-3 py-2 text-sm text-(--secondary-color)'
    >
      <p>
        No Japanese voice is available in this browser. Install a Japanese voice
        in your system settings, or use Chrome or Edge.
      </p>
      <button
        type='button'
        onClick={onDismiss}
        aria-label='Dismiss Japanese voice notice'
        className='shrink-0 rounded p-0.5 hover:bg-(--background-color)'
      >
        <X size={16} aria-hidden='true' />
      </button>
    </div>
  );
};

export default JapaneseVoiceNotice;
