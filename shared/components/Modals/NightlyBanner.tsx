import React, { useState, useEffect } from 'react';

const NightlyBanner = ({ onSwitch, onDismiss }: { onSwitch: () => void, onDismiss: () => void }) => {
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
      className={`
        fixed z-50  
        bg-[var(--card-color)]
        shadow-2xl rounded-xl p-5 
        bottom-4 left-4 right-4
        sm:bottom-5 sm:right-5 sm:left-auto 
        sm:w-full sm:max-w-[400px]
        transition-all duration-300 ease-in-out transform
        text-[var(--main-color)] 
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      role="alert"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="text-sm leading-relaxed">
            <span className="font-bold mb-1 flex gap-2 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              A new Nightly preview is available.
            </span>
            <span className="opacity-90 text-[var(--secondary-color)]">
              The latest kanadojo build
              <span className="italic opacity-75 ml-1 block mt-1 text-xs">
                * This version may be unstable.
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-1">
          <button
            onClick={handleDismiss}
            className="text-sm text-[var(--secondary-color)] hover:opacity-80 px-3 py-2 transition-colors"
          >
            Dismiss
          </button>

          <button
            onClick={onSwitch}
            className="px-4 py-2 bg-[var(--border-color)] hover:opacity-90 text-[var(--secondary-color)] text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <a href="https://nightly.kanadojo.com" target='_blank'>
              Switch to Nightly
            </a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NightlyBanner;
