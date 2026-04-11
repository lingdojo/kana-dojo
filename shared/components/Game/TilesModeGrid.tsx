'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { cn } from '@/shared/lib/utils';
import {
  ActiveTile,
  BlankTile,
  tileContainerVariants,
  tileEntryVariants,
} from '@/shared/components/Game/TilesModeShared';
import {
  celebrationBounceVariants,
  celebrationContainerVariants,
  celebrationExplodeContainerVariants,
  explosionKeyframes,
} from '@/shared/components/Game/tilesModeCelebration';

type AnimState = 'idle' | 'exploding' | 'hidden' | 'fading-in';

const EXPLOSION_START_DELAY_MS = 300;
const EXPLOSION_HIDDEN_DURATION_MS = 750;
const EXPLOSION_FADE_IN_DURATION_MS = 600;

const ExplodingAnswerTile = memo(
  ({
    id,
    char,
    onTileClick,
    isTileDisabled,
    tileSizeClassName,
    tileLang,
    celebrationToken,
    isCelebrating,
    explodeDelayMs,
  }: {
    id: number;
    char: string;
    onTileClick: (id: number, char: string) => void;
    isTileDisabled: boolean;
    tileSizeClassName: string;
    tileLang?: string;
    celebrationToken: string;
    isCelebrating: boolean;
    explodeDelayMs: number;
  }) => {
    const [animState, setAnimState] = useState<AnimState>('idle');
    const isAnimating = useRef(false);
    const timersRef = useRef<number[]>([]);
    const previousTokenRef = useRef(celebrationToken);

    useEffect(() => {
      return () => {
        timersRef.current.forEach(timer => window.clearTimeout(timer));
      };
    }, []);

    useEffect(() => {
      if (!isCelebrating && !isAnimating.current) {
        setAnimState('idle');
      }
    }, [isCelebrating]);

    useEffect(() => {
      if (previousTokenRef.current === celebrationToken) return;
      previousTokenRef.current = celebrationToken;
      if (!isAnimating.current) return;
      isAnimating.current = false;
      timersRef.current.forEach(timer => window.clearTimeout(timer));
      timersRef.current = [];
      setAnimState('idle');
    }, [celebrationToken]);

    useEffect(() => {
      if (!celebrationToken.endsWith('-true')) return;
      if (isAnimating.current) return;
      isAnimating.current = true;
      timersRef.current.push(
        window.setTimeout(() => {
          setAnimState('exploding');
          timersRef.current.push(
            window.setTimeout(() => {
              setAnimState('hidden');
              timersRef.current.push(
                window.setTimeout(() => {
                  setAnimState('fading-in');
                  timersRef.current.push(
                    window.setTimeout(() => {
                      setAnimState('idle');
                      isAnimating.current = false;
                    }, EXPLOSION_FADE_IN_DURATION_MS),
                  );
                }, EXPLOSION_HIDDEN_DURATION_MS),
              );
            }, EXPLOSION_START_DELAY_MS),
          );
        }, explodeDelayMs),
      );
    }, [celebrationToken, explodeDelayMs]);

    const getAnimationStyle = (): React.CSSProperties => {
      switch (animState) {
        case 'exploding':
          return { animation: 'explode 300ms ease-out forwards' };
        case 'hidden':
          return { opacity: 0 };
        case 'fading-in':
          return { animation: `fadeIn ${EXPLOSION_FADE_IN_DURATION_MS}ms ease-in forwards` };
        default:
          return {};
      }
    };

    return (
      <ActiveTile
        id={id}
        char={char}
        layoutId={`tile-${id}-${char}`}
        onClick={() => onTileClick(id, char)}
        isDisabled={isTileDisabled || animState !== 'idle'}
        sizeClassName={tileSizeClassName}
        lang={tileLang}
        motionStyle={{
          transformOrigin: 'center center',
          ...getAnimationStyle(),
        }}
      />
    );
  },
);

ExplodingAnswerTile.displayName = 'ExplodingAnswerTile';

interface TilesModeGridProps {
  allTiles: Map<number, string>;
  placedTileIds: number[];
  onTileClick: (id: number, char: string) => void;
  isTileDisabled: boolean;
  isCelebrating: boolean;
  celebrationMode: 'bounce' | 'explode';
  tilesPerRow: number;
  tileSizeClassName: string;
  tileLang?: string;
  answerRowClassName: string;
  tilesContainerClassName?: string;
  tilesWrapperKey?: string;
}

const TilesModeGrid = ({
  allTiles,
  placedTileIds,
  onTileClick,
  isTileDisabled,
  isCelebrating,
  celebrationMode,
  tilesPerRow,
  tileSizeClassName,
  tileLang,
  answerRowClassName,
  tilesContainerClassName,
  tilesWrapperKey,
}: TilesModeGridProps) => {
  const styleTag = useMemo(() => explosionKeyframes, []);
  const celebrationContainerVariantsToUse =
    celebrationMode === 'explode'
      ? celebrationExplodeContainerVariants
      : celebrationContainerVariants;

  const tileEntries = Array.from(allTiles.entries());
  const topRowTiles = tileEntries.slice(0, tilesPerRow);
  const bottomRowTiles = tileEntries.slice(tilesPerRow);
  const placedTileIdsSet = new Set(placedTileIds);
  const answerTiles = placedTileIds
    .map(id => {
      const char = allTiles.get(id);
      return char === undefined ? null : ([id, char] as const);
    })
    .filter((tile): tile is readonly [number, string] => tile !== null);

  const renderTile = ([id, char]: readonly [number, string]) => {
    const isPlaced = placedTileIdsSet.has(id);

    return (
      <motion.div
        key={`tile-slot-${id}-${char}`}
        className='relative'
        variants={tileEntryVariants}
        style={{ perspective: 1000 }}
      >
        <BlankTile char={char} sizeClassName={tileSizeClassName} />

        {!isPlaced && (
          <div className='absolute inset-0 z-10'>
            <ActiveTile
              key={`tile-${id}-${char}`}
              id={id}
              char={char}
              layoutId={`tile-${id}-${char}`}
              onClick={() => onTileClick(id, char)}
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
      <style>{styleTag}</style>
      <div className='flex w-full flex-col items-center'>
        <div className={clsx(answerRowClassName)}>
          <motion.div
            className='flex flex-row flex-wrap justify-start gap-3'
            variants={celebrationContainerVariantsToUse}
            initial='idle'
            animate={isCelebrating ? 'celebrate' : 'idle'}
          >
            {answerTiles.map(([id, char], index) =>
              celebrationMode === 'explode' ? (
                <ExplodingAnswerTile
                  key={`answer-tile-${id}-${char}`}
                  id={id}
                  char={char}
                  onTileClick={onTileClick}
                  isTileDisabled={isTileDisabled}
                  tileSizeClassName={tileSizeClassName}
                  tileLang={tileLang}
                  celebrationToken={`${tilesWrapperKey ?? 'tiles'}-${index}-${isCelebrating}`}
                  isCelebrating={isCelebrating}
                  explodeDelayMs={index * 140}
                />
              ) : (
                <ActiveTile
                  key={`answer-tile-${id}-${char}`}
                  id={id}
                  char={char}
                  layoutId={`tile-${id}-${char}`}
                  onClick={() => onTileClick(id, char)}
                  isDisabled={isTileDisabled}
                  sizeClassName={tileSizeClassName}
                  lang={tileLang}
                  variants={celebrationBounceVariants}
                  motionStyle={{ transformOrigin: 'center center' }}
                />
              ),
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        key={tilesWrapperKey}
        className={cn(
          'flex flex-col items-center gap-3 sm:gap-4',
          tilesContainerClassName,
        )}
        variants={tileContainerVariants}
        initial='hidden'
        animate='visible'
      >
        <motion.div className='flex flex-row justify-center gap-3 sm:gap-4'>
          {topRowTiles.map(renderTile)}
        </motion.div>
        {bottomRowTiles.length > 0 && (
          <motion.div className='flex flex-row justify-center gap-3 sm:gap-4'>
            {bottomRowTiles.map(renderTile)}
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default TilesModeGrid;
