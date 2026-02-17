'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { cn } from '@/shared/lib/utils';
import {
  ActiveTile,
  BlankTile,
  celebrationBounceVariants,
  celebrationContainerVariants,
  tileContainerVariants,
  tileEntryVariants,
} from '@/shared/components/Game/wordBuildingShared';

interface WordBuildingTilesGridProps {
  allTiles: string[];
  placedTiles: string[];
  onTileClick: (char: string) => void;
  isTileDisabled: boolean;
  isCelebrating: boolean;
  tilesPerRow: number;
  tileSizeClassName: string;
  tileLang?: string;
  answerRowClassName: string;
  tilesContainerClassName?: string;
  tilesWrapperKey?: string;
}

const WordBuildingTilesGrid = ({
  allTiles,
  placedTiles,
  onTileClick,
  isTileDisabled,
  isCelebrating,
  tilesPerRow,
  tileSizeClassName,
  tileLang,
  answerRowClassName,
  tilesContainerClassName,
  tilesWrapperKey,
}: WordBuildingTilesGridProps) => {
  const topRowTiles = allTiles.slice(0, tilesPerRow);
  const bottomRowTiles = allTiles.slice(tilesPerRow);

  const renderTile = (char: string) => {
    const isPlaced = placedTiles.includes(char);

    return (
      <motion.div
        key={`tile-slot-${char}`}
        className='relative'
        variants={tileEntryVariants}
        style={{ perspective: 1000 }}
      >
        <BlankTile char={char} sizeClassName={tileSizeClassName} />

        {!isPlaced && (
          <div className='absolute inset-0 z-10'>
            <ActiveTile
              id={`tile-${char}`}
              char={char}
              onClick={() => onTileClick(char)}
              isDisabled={isTileDisabled}
              sizeClassName={tileSizeClassName}
              lang={tileLang}
            />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <div className='flex w-full flex-col items-center'>
        <div className={clsx(answerRowClassName)}>
          <motion.div
            className='flex flex-row flex-wrap justify-start gap-3'
            variants={celebrationContainerVariants}
            initial='idle'
            animate={isCelebrating ? 'celebrate' : 'idle'}
          >
            {placedTiles.map(char => (
              <ActiveTile
                key={`answer-tile-${char}`}
                id={`tile-${char}`}
                char={char}
                onClick={() => onTileClick(char)}
                isDisabled={isTileDisabled}
                sizeClassName={tileSizeClassName}
                lang={tileLang}
                variants={celebrationBounceVariants}
                motionStyle={{ transformOrigin: '50% 100%' }}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div
        key={tilesWrapperKey}
        className={cn('flex flex-col items-center gap-3 sm:gap-4', tilesContainerClassName)}
        variants={tileContainerVariants}
        initial='hidden'
        animate='visible'
      >
        <motion.div className='flex flex-row justify-center gap-3 sm:gap-4'>
          {topRowTiles.map(char => renderTile(char))}
        </motion.div>
        {bottomRowTiles.length > 0 && (
          <motion.div className='flex flex-row justify-center gap-3 sm:gap-4'>
            {bottomRowTiles.map(char => renderTile(char))}
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default WordBuildingTilesGrid;
