import { useMemo, useState, useCallback, memo } from 'react';
import clsx from 'clsx';
import { X, CircleCheck, Circle, Trash2, Dices } from 'lucide-react';
import { motion } from 'framer-motion';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { cn } from '@/shared/lib/utils';

type SetData = {
  name: string;
  start: number;
  end: number;
  id: string;
  isMastered: boolean;
};

type QuickSelectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sets: SetData[];
  selectedSets: string[];
  onToggleSet: (setName: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSelectRandom: (count: number) => void;
  unitName: string;
};

interface SetCardProps {
  set: SetData;
  isSelected: boolean;
  onToggle: (name: string) => void;
}

const springTransition = {
  type: 'spring',
  stiffness: 450,
  damping: 30,
  mass: 1,
} as const;

const SetCard = memo(function SetCard({
  set,
  isSelected,
  onToggle,
}: SetCardProps) {
  return (
    <motion.div
      layout
      layoutId={set.id}
      transition={springTransition}
      className={clsx(isSelected ? 'order-first' : '')}
    >
      <ActionButton
        onClick={() => onToggle(set.name)}
        colorScheme={isSelected ? 'main' : 'secondary'}
        borderColorScheme={isSelected ? 'main' : 'secondary'}
        borderRadius='3xl'
        borderBottomThickness={10}
        className={clsx(
          'flex w-full flex-col items-center gap-2 p-3 sm:p-4',
          !isSelected && 'opacity-40',
        )}
      >
        {isSelected ? (
          <CircleCheck
            size={18}
            className='shrink-0 fill-current text-(--background-color)'
          />
        ) : (
          <Circle size={18} className='shrink-0 text-(--background-color)' />
        )}
        <span className='text-center text-xs font-medium sm:text-sm'>
          {set.name.replace('Set ', 'Level ')}
        </span>
        {set.isMastered && (
          <span className='text-[10px] opacity-70 sm:text-xs'>Mastered</span>
        )}
      </ActionButton>
    </motion.div>
  );
});

const QuickSelectModal = ({
  isOpen,
  onClose,
  sets,
  selectedSets,
  onToggleSet,
  onSelectAll,
  onClearAll,
  onSelectRandom,
  unitName,
}: QuickSelectModalProps) => {
  const { playClick } = useClick();
  const [searchLevel, setSearchLevel] = useState('');

  const filteredSets = useMemo(() => {
    if (!searchLevel) return sets;
    return sets.filter(set => {
      const levelNumber = set.name.match(/\d+/)?.[0] || '';
      return levelNumber.includes(searchLevel);
    });
  }, [sets, searchLevel]);

  const selectedSetsSet = useMemo(() => new Set(selectedSets), [selectedSets]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        playClick();
        onClose();
      }
    },
    [playClick, onClose],
  );

  const handleClose = useCallback(() => {
    playClick();
    onClose();
  }, [playClick, onClose]);

  const handleToggleSet = useCallback(
    (name: string) => {
      playClick();
      onToggleSet(name);
    },
    [playClick, onToggleSet],
  );

  const handleSelectAll = useCallback(() => {
    playClick();
    onSelectAll();
  }, [playClick, onSelectAll]);

  const handleClearAll = useCallback(() => {
    playClick();
    onClearAll();
  }, [playClick, onClearAll]);

  const handleRandom3 = useCallback(() => {
    playClick();
    onSelectRandom(3);
  }, [playClick, onSelectRandom]);

  const handleRandom5 = useCallback(() => {
    playClick();
    onSelectRandom(5);
  }, [playClick, onSelectRandom]);

  const handleRandom10 = useCallback(() => {
    playClick();
    onSelectRandom(10);
  }, [playClick, onSelectRandom]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      playClick();
      const value = e.target.value.replace(/\D/g, '');
      setSearchLevel(value);
    },
    [playClick],
  );

  const actionButtons = useMemo(
    () => [
      {
        label: 'Select All',
        onClick: handleSelectAll,
        icon: CircleCheck,
        iconOnly: false,
        colorScheme: 'main' as const,
        borderColorScheme: 'main' as const,
      },
      {
        label: 'Clear All',
        onClick: handleClearAll,
        icon: Trash2,
        iconOnly: true,
        colorScheme: 'main' as const,
        borderColorScheme: 'main' as const,
      },
      {
        label: 'Random 3',
        onClick: handleRandom3,
        icon: Dices,
        iconOnly: false,
        colorScheme: 'secondary' as const,
        borderColorScheme: 'secondary' as const,
      },
      {
        label: 'Random 5',
        onClick: handleRandom5,
        icon: Dices,
        iconOnly: false,
        colorScheme: 'secondary' as const,
        borderColorScheme: 'secondary' as const,
      },
      {
        label: 'Random 10',
        onClick: handleRandom10,
        icon: Dices,
        iconOnly: false,
        colorScheme: 'secondary' as const,
        borderColorScheme: 'secondary' as const,
      },
    ],
    [
      handleSelectAll,
      handleClearAll,
      handleRandom3,
      handleRandom5,
      handleRandom10,
    ],
  );

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4'
      onClick={handleBackdropClick}
    >
      <div className='flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border-0 border-(--border-color) bg-(--background-color) sm:max-h-[80vh]'>
        <div className='flex shrink-0 items-center justify-between border-b border-(--border-color) p-4 sm:p-6'>
          <div>
            <h2 className='text-xl font-bold text-(--main-color) sm:text-2xl'>
              Quick Select - {unitName.toUpperCase()}
            </h2>
            <p className='mt-1 text-xs text-(--secondary-color) sm:text-sm'>
              {selectedSets.length} of {sets.length} levels selected
            </p>
          </div>
          <button
            onClick={handleClose}
            className='shrink-0 rounded-xl p-2 transition-colors hover:cursor-pointer hover:bg-(--card-color)'
          >
            <X size={24} className='text-(--secondary-color)' />
          </button>
        </div>

        <div className='flex shrink-0 flex-wrap gap-2 border-b border-(--border-color) p-3 sm:gap-3 sm:p-4'>
          {actionButtons.map(btn => (
            <ActionButton
              key={btn.label}
              onClick={btn.onClick}
              colorScheme={btn.colorScheme}
              borderColorScheme={btn.borderColorScheme}
              borderRadius='3xl'
              borderBottomThickness={10}
              className={clsx(
                'w-auto text-sm',
                btn.iconOnly ? 'px-4 py-4 sm:px-6' : 'px-3 py-4 sm:px-4',
              )}
            >
              <span
                className={clsx(
                  'flex items-center',
                  btn.iconOnly ? 'gap-0' : 'gap-2',
                )}
              >
                <btn.icon
                  size={16}
                  className={cn('fill-current text-current')}
                />
                {btn.iconOnly ? (
                  <span className='sr-only'>{btn.label}</span>
                ) : (
                  btn.label
                )}
              </span>
            </ActionButton>
          ))}
          <input
            type='text'
            inputMode='numeric'
            pattern='[0-9]*'
            onChange={handleSearchChange}
            placeholder='search for a level...'
            className={clsx(
              'rounded-2xl border px-3 py-2 text-sm transition-all sm:px-4',
              'border-(--border-color) hover:bg-(--card-color)',
              'text-(--main-color)',
              'focus:ring-offset-2-(--secondary-color)/80 focus:ring focus:outline-0',
            )}
          />
        </div>

        <div className='min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6'>
          {filteredSets.length === 0 ? (
            <div className='flex h-full items-center justify-center'>
              <p className='text-sm text-(--secondary-color)'>
                No level found. Available levels:{' '}
                {sets[0]?.name.match(/\d+/)?.[0]} -{' '}
                {sets[sets.length - 1]?.name.match(/\d+/)?.[0]}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5'>
              {filteredSets.map(set => (
                <SetCard
                  key={set.id}
                  set={set}
                  isSelected={selectedSetsSet.has(set.name)}
                  onToggle={handleToggleSet}
                />
              ))}
            </div>
          )}
        </div>

        <div className='flex shrink-0 justify-end border-t border-(--border-color) p-3 sm:p-4'>
          <ActionButton
            onClick={handleClose}
            colorScheme='main'
            borderColorScheme='main'
            borderRadius='3xl'
            borderBottomThickness={10}
            className='w-auto px-5 py-2.5 text-sm font-medium sm:px-6 sm:py-3 sm:text-base'
          >
            <CircleCheck size={24} />
            Done
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default memo(QuickSelectModal);
