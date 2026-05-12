export type CollectionLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';

export interface UnitSummary<TLevel extends string = CollectionLevel> {
  name: TLevel;
  displayName: string;
  subtitle: string;
  jlpt: string;
  startLevel: number;
  endLevel: number;
  levelCount: number;
}

export interface SubunitSummary {
  id: string;
  label: string;
  startLevel: number;
  endLevel: number;
  levelCount: number;
}

const SUBUNIT_THRESHOLD = 12;

const getPreferredChunkSize = (levelCount: number) => {
  if (levelCount <= 24) return 9;
  if (levelCount <= 44) return 10;
  if (levelCount <= 79) return 12;
  if (levelCount <= 139) return 15;
  if (levelCount <= 219) return 20;
  return 40;
};

const getMinTailSize = (chunkSize: number) =>
  Math.max(5, Math.ceil(chunkSize * 0.5));

const isValidChunkSize = (levelCount: number, chunkSize: number) => {
  const remainder = levelCount % chunkSize;

  if (remainder === 0) {
    return true;
  }

  return remainder >= getMinTailSize(chunkSize);
};

export const buildUnitSummaries = <TLevel extends string>(
  levelOrder: readonly TLevel[],
  getLevelCount: (level: TLevel) => number,
): UnitSummary<TLevel>[] => {
  let cumulativeLevels = 0;

  return levelOrder.map((level, index) => {
    const levelCount = getLevelCount(level);
    const startLevel = cumulativeLevels + 1;
    const endLevel = cumulativeLevels + levelCount;
    cumulativeLevels = endLevel;

    return {
      name: level,
      displayName: `Unit ${index + 1}`,
      subtitle: `Levels ${startLevel}-${endLevel}`,
      jlpt: level.toUpperCase(),
      startLevel,
      endLevel,
      levelCount,
    };
  });
};

export const buildSubunitsForUnit = (
  startLevel: number,
  levelCount: number,
): SubunitSummary[] => {
  if (levelCount <= SUBUNIT_THRESHOLD) {
    return [
      {
        id: `${startLevel}-${startLevel + levelCount - 1}`,
        label: `Levels ${startLevel}-${startLevel + levelCount - 1}`,
        startLevel,
        endLevel: startLevel + levelCount - 1,
        levelCount,
      },
    ];
  }

  let chunkSize = getPreferredChunkSize(levelCount);

  while (chunkSize > 1 && !isValidChunkSize(levelCount, chunkSize)) {
    chunkSize -= 1;
  }

  const subunits: SubunitSummary[] = [];
  let currentStart = startLevel;
  const finalLevel = startLevel + levelCount - 1;

  while (currentStart <= finalLevel) {
    const currentEnd = Math.min(currentStart + chunkSize - 1, finalLevel);
    subunits.push({
      id: `${currentStart}-${currentEnd}`,
      label: `Levels ${currentStart}-${currentEnd}`,
      startLevel: currentStart,
      endLevel: currentEnd,
      levelCount: currentEnd - currentStart + 1,
    });
    currentStart = currentEnd + 1;
  }

  return subunits;
};

export const shouldShowSubunitSelector = (levelCount: number) =>
  levelCount > SUBUNIT_THRESHOLD;
