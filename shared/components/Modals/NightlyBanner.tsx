import React, { useState, useEffect } from 'react';

const NightlyBanner = ({
  onSwitch,
  onDismiss,
}: {
  onSwitch: () => void;
  onDismiss: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
      setIsMounted(false);
    }, 300);
  };

  if (!isMounted) return null;

  return (
    <div
      className={`fixed right-4 bottom-4 left-4 z-50 transform rounded-xl bg-(--card-color) p-5 text-(--main-color) shadow-2xl transition-all duration-300 ease-in-out sm:right-5 sm:bottom-5 sm:left-auto sm:w-full sm:max-w-[400px] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
      role='alert'
    >
      <div className='flex flex-col gap-4'>
        <div className='flex items-start gap-3'>
          <div className='text-sm leading-relaxed'>
            <span className='mb-1 flex items-center gap-2 font-bold'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <circle cx='12' cy='12' r='10'></circle>
                <line x1='12' y1='8' x2='12' y2='12'></line>
                <line x1='12' y1='16' x2='12.01' y2='16'></line>
              </svg>
              A new Nightly preview is available.
            </span>
            <span className='text-(--secondary-color) opacity-90'>
              The latest kanadojo build
              <span className='mt-1 ml-1 block text-xs italic opacity-75'>
                * This version may be unstable.
              </span>
            </span>
          </div>
        </div>

        <div className='mt-1 flex items-center justify-end gap-3'>
          <button
            onClick={handleDismiss}
            className='px-3 py-2 text-sm text-(--secondary-color) transition-colors hover:opacity-80'
          >
            Dismiss
          </button>

          <button
            onClick={onSwitch}
            className='rounded-lg bg-(--border-color) px-4 py-2 text-sm font-medium text-(--secondary-color) shadow-sm transition-colors hover:opacity-90'
          >
            <a href='https://nightly.kanadojo.com' target='_blank'>
              Switch to Nightly
            </a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NightlyBanner;
