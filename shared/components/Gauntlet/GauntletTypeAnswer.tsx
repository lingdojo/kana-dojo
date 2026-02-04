'use client';

import React, { useRef, useEffect } from 'react';
import clsx from 'clsx';
import { GameBottomBar } from '@/shared/components/Game/GameBottomBar';

interface GauntletTypeAnswerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder: string;
  lang?: string;
}

export default function GauntletTypeAnswer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder,
  lang,
}: GauntletTypeAnswerProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const canSubmit = !disabled && value.trim().length > 0;

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <div className='relative flex w-full max-w-lg flex-col items-center gap-4'>
      <textarea
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        rows={4}
        className={clsx(
          'w-full max-w-xs sm:max-w-sm md:max-w-md',
          'rounded-2xl px-5 py-4',
          'rounded-2xl border border-(--border-color) bg-(--card-color)',
          'text-top text-left text-lg font-medium lg:text-xl',
          'text-(--secondary-color) placeholder:text-base placeholder:font-normal placeholder:text-(--secondary-color)/40',
          'resize-none focus:outline-none',
          'transition-colors duration-200 ease-out',
          disabled && 'cursor-not-allowed opacity-60',
        )}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (canSubmit) onSubmit();
          }
        }}
        lang={lang}
      />

      <GameBottomBar
        state='check'
        onAction={() => {
          if (canSubmit) onSubmit();
        }}
        canCheck={canSubmit}
        actionLabel='submit'
        feedbackTitle=''
        feedbackContent={null}
        hideRetry
        buttonRef={buttonRef}
      />

      <div className='h-32' />
    </div>
  );
}
