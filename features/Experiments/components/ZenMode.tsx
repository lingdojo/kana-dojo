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
    state => state.setExpandDecorations,
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
    <div className='relative min-h-[100dvh] max-w-[100dvw] overflow-hidden bg-(--background-color)'>
      <Decorations
        expandDecorations={true}
        forceShow={true}
        interactive={true}
      />
      <button
        onClick={handleClose}
        className={clsx(
          'fixed top-4 right-4 z-50 rounded-lg p-2',
          'border border-(--border-color) bg-(--card-color)',
          'text-(--secondary-color) hover:text-(--main-color)',
          'transition-all duration-250 hover:cursor-pointer',
          'active:scale-95',
        )}
        aria-label='Return to home'
      >
        <Home size={24} />
      </button>
    </div>
  );
};

export default ZenMode;
