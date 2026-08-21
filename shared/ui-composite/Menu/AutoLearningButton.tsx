'use client';

import { Loader2, Play } from 'lucide-react';

import { ActionButton } from '@/shared/ui/components/ActionButton';
import { cn } from '@/shared/utils/utils';

interface AutoLearningButtonProps {
  hasProgress: boolean;
  isLoading: boolean;
  error: string | null;
  onClick: () => void;
  className?: string;
}

const AutoLearningButton = ({
  hasProgress,
  isLoading,
  error,
  onClick,
  className,
}: AutoLearningButtonProps) => (
  <div className={cn('w-full', className)}>
    <ActionButton
      data-auto-learning-dojo
      onClick={onClick}
      disabled={isLoading}
      className='px-2 py-3 disabled:cursor-wait disabled:opacity-70'
      borderRadius='3xl'
      borderBottomThickness={14}
      colorScheme='main'
      borderColorScheme='main'
    >
      {isLoading ? (
        <Loader2 className='animate-spin' />
      ) : (
        <Play className='fill-current' />
      )}
      {hasProgress ? 'Continue Learning' : 'Start Learning'}
    </ActionButton>
    {error && (
      <p role='alert' className='mt-2 px-2 text-sm text-red-500'>
        {error}
      </p>
    )}
  </div>
);

export default AutoLearningButton;
