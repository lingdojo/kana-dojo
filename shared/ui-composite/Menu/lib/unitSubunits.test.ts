import { describe, expect, it } from 'vitest';
import {
  buildSubunitsForUnit,
  buildUnitSummaries,
  shouldShowSubunitSelector,
} from '@/shared/ui-composite/Menu/lib/unitSubunits';

describe('buildSubunitsForUnit', () => {
  it('honors a feasible custom subunit count', () => {
    const subunits = buildSubunitsForUnit(1, 80, {
      desiredSubunitCount: 8,
    });

    expect(subunits).toHaveLength(8);
    expect(
      subunits.map(({ startLevel, endLevel, levelCount }) => [
        startLevel,
        endLevel,
        levelCount,
      ]),
    ).toEqual([
      [1, 10, 10],
      [11, 20, 10],
      [21, 30, 10],
      [31, 40, 10],
      [41, 50, 10],
      [51, 60, 10],
      [61, 70, 10],
      [71, 80, 10],
    ]);
  });

  it.each<[number, number[]]>([
    [12, [12]],
    [13, [8, 5]],
    [30, [10, 10, 10]],
    [80, [14, 14, 14, 14, 14, 10]],
  ])(
    'preserves default grouping for %i levels',
    (levelCount, expectedSizes) => {
      const subunits = buildSubunitsForUnit(1, levelCount);

      expect(subunits.map(subunit => subunit.levelCount)).toEqual(
        expectedSizes,
      );
    },
  );

  it.each<{
    startLevel: number;
    levelCount: number;
    endLevel: number;
  }>([
    { startLevel: 1, levelCount: 13, endLevel: 13 },
    { startLevel: 1, levelCount: 80, endLevel: 80 },
    { startLevel: 31, levelCount: 80, endLevel: 110 },
  ])(
    'covers levels $startLevel through $endLevel exactly once',
    ({ startLevel, levelCount, endLevel }) => {
      const subunits = buildSubunitsForUnit(startLevel, levelCount);
      const coveredLevels = subunits.flatMap(subunit => {
        const rangeLength = subunit.endLevel - subunit.startLevel + 1;
        expect(subunit.levelCount).toBe(rangeLength);

        return Array.from(
          { length: rangeLength },
          (_, index) => subunit.startLevel + index,
        );
      });

      expect(coveredLevels).toEqual(
        Array.from({ length: levelCount }, (_, index) => startLevel + index),
      );
      expect(subunits.at(-1)?.endLevel).toBe(endLevel);
    },
  );
});

describe('shouldShowSubunitSelector', () => {
  it.each<[number, boolean]>([
    [12, false],
    [13, true],
  ])('sets selector visibility for %i levels to %s', (levelCount, expected) => {
    expect(shouldShowSubunitSelector(levelCount)).toBe(expected);
  });
});

describe('buildUnitSummaries', () => {
  it('accumulates level boundaries and labels in the supplied unit order', () => {
    const levelOrder = ['n4', 'n5', 'n3'] as const;
    const levelCounts: Record<(typeof levelOrder)[number], number> = {
      n4: 3,
      n5: 2,
      n3: 4,
    };

    const summaries = buildUnitSummaries(
      levelOrder,
      level => levelCounts[level],
    );

    expect(summaries).toEqual([
      {
        name: 'n4',
        displayName: 'Unit 1',
        subtitle: 'Levels 1-3',
        jlpt: 'N4',
        startLevel: 1,
        endLevel: 3,
        levelCount: 3,
      },
      {
        name: 'n5',
        displayName: 'Unit 2',
        subtitle: 'Levels 4-5',
        jlpt: 'N5',
        startLevel: 4,
        endLevel: 5,
        levelCount: 2,
      },
      {
        name: 'n3',
        displayName: 'Unit 3',
        subtitle: 'Levels 6-9',
        jlpt: 'N3',
        startLevel: 6,
        endLevel: 9,
        levelCount: 4,
      },
    ]);
  });
});
