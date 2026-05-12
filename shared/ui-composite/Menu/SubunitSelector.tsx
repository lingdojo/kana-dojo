'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ActionButton } from '@/shared/ui/components/ActionButton';
import type { SubunitSummary } from '@/shared/ui-composite/Menu/lib/unitSubunits';

type SubunitSelectorProps = {
  subunits: SubunitSummary[];
  selectedSubunitId: string;
  onSelect: (subunitId: string) => void;
};

const SUBUNIT_SELECTOR_ACTIVE_FLOAT_CLASSES =
  'motion-safe:animate-float [--float-distance:-0px] delay-250ms';

const SubunitSelector = ({
  subunits,
  selectedSubunitId,
  onSelect,
}: SubunitSelectorProps) => {
  if (subunits.length <= 1) {
    return null;
  }

  return (
    <div className='grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(120px,1fr))]'>
      {subunits.map(subunit => {
        const isSelected = subunit.id === selectedSubunitId;
        const shortLabel = subunit.label.replace('Levels ', '');

        return (
          <div key={subunit.id} className='relative flex'>
            {isSelected && (
              <motion.div
                layoutId='subunit-selector-indicator'
                className='absolute inset-0 rounded-2xl'
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <div
                  className={clsx(
                    'h-full w-full rounded-2xl border-b-6 border-(--secondary-color-accent) bg-(--secondary-color)',
                    SUBUNIT_SELECTOR_ACTIVE_FLOAT_CLASSES,
                  )}
                />
              </motion.div>
            )}
            <ActionButton
              onClick={() => onSelect(subunit.id)}
              borderBottomThickness={0}
              borderRadius='2xl'
              className={clsx(
                'relative z-10 flex h-full w-full items-center justify-center px-4 pt-3 pb-4 text-center text-sm',
                isSelected && SUBUNIT_SELECTOR_ACTIVE_FLOAT_CLASSES,
                isSelected
                  ? 'bg-transparent text-(--background-color)'
                  : 'bg-transparent text-(--main-color) hover:bg-(--border-color)/50',
              )}
            >
              <span className='hidden sm:inline'>
                Levels <span className='whitespace-nowrap'>{shortLabel}</span>
              </span>
              <span className='inline sm:hidden'>{shortLabel}</span>
            </ActionButton>
          </div>
        );
      })}
    </div>
  );
};

export default SubunitSelector;
