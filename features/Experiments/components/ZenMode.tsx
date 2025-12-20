'use client';
import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';
import useDecorationsStore from '@/shared/store/useDecorationsStore';
import Decorations from '@/features/MainMenu/Decorations';

const ZenMode = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { playClick } = useClick();
  const router = useRouter();
  const setExpandDecorations = useDecorationsStore(
    state => state.setExpandDecorations
  );

  useEffect(() => {
    setIsMounted(true);
    setExpandDecorations(true);

    return () => {
      setExpandDecorations(false);
    };
  }, [setExpandDecorations]);

  const handleClose = () => {
    playClick();
    router.push('/');
  };

  if (!isMounted) return null;

  return (
    <div className='relative min-h-[100dvh] max-w-[100dvw] overflow-hidden bg-[var(--background-color)]'>
      <Decorations
        expandDecorations={true}
        forceShow={true}
        interactive={true}
      />
      <button
        onClick={handleClose}
        className={clsx(
          'fixed top-4 right-4 z-50 p-2 rounded-lg',
          'bg-[var(--card-color)] border border-[var(--border-color)]',
          'text-[var(--secondary-color)] hover:text-[var(--main-color)]',
          'hover:cursor-pointer transition-all duration-250',
          'active:scale-95'
        )}
        aria-label='Return to home'
      >
        <Home size={24} />
      </button>
    </div>
  );
};

export default ZenMode;
