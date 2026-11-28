import { describe, expect, it } from 'vitest';
import {
  buildSubunitsForUnit,
  buildUnitSummaries,
  shouldShowSubunitSelector,
  type SubunitSummary,
} from './unitSubunits';

/** The Levels a subunit covers, as [start, end] pairs, which is what the rules are stated in. */
const spans = (subunits: SubunitSummary[]) =>
  subunits.map(s => [s.startLevel, s.endLevel] as const);

/** The number of Levels in each subunit, in order. */
const sizes = (subunits: SubunitSummary[]) => subunits.map(s => s.levelCount);

describe('buildSubunitsForUnit', () => {
  // SUBUNITS.md: "A Unit with 12 Levels or fewer does not show a visible Subunit picker."
  it('leaves a Unit of 12 Levels or fewer as one subunit', () => {
    for (const count of [1, 2, 11, 12]) {
      const subunits = buildSubunitsForUnit(1, count);
      expect(spans(subunits)).toEqual([[1, count]]);
    }
  });

  it('shows the subunit picker only above 12 Levels', () => {
    expect(shouldShowSubunitSelector(12)).toBe(false);
    expect(shouldShowSubunitSelector(13)).toBe(true);
  });

  // The boundary the issue asks for: 12 stays whole, 13 is split.
  it('splits at 13 Levels and not before', () => {
    expect(buildSubunitsForUnit(1, 12)).toHaveLength(1);
    expect(buildSubunitsForUnit(1, 13).length).toBeGreaterThan(1);
  });

  // SUBUNITS.md: "Every Subunit before the last has the exact same number of Levels."
  it('gives every subunit but the last the same size', () => {
    for (const [start, count] of [
      [1, 13],
      [1, 45],
      [1, 80],
      [1, 140],
      [1, 220],
    ] as const) {
      const each = sizes(buildSubunitsForUnit(start, count));
      expect(
        new Set(each.slice(0, -1)).size,
        `uneven before the last for ${count} Levels: ${each.join(',')}`,
      ).toBe(1);
      // "The last Subunit may have fewer Levels, but never more."
      if (each.length > 1) {
        expect(each[each.length - 1]).toBeLessThanOrEqual(each[0]);
      }
    }
  });

  // The property the grouping exists for: a contiguous partition of the Level range.
  it('covers every Level exactly once, with no gap and no overlap', () => {
    for (const [start, count] of [
      [1, 13],
      [1, 45],
      [1, 80],
      [7, 33],
      [100, 140],
    ] as const) {
      const flat = buildSubunitsForUnit(start, count).flatMap(s => [
        s.startLevel,
        s.endLevel,
      ]);
      expect(flat[0]).toBe(start);
      expect(flat[flat.length - 1]).toBe(start + count - 1);
      // Each subunit starts one past the previous end.
      const subunits = buildSubunitsForUnit(start, count);
      for (let i = 1; i < subunits.length; i++) {
        expect(subunits[i].startLevel).toBe(subunits[i - 1].endLevel + 1);
      }
      // And the sizes add up to the whole.
      expect(sizes(subunits).reduce((a, b) => a + b, 0)).toBe(count);
    }
  });

  it('counts from the given start level, not from 1', () => {
    const fromOne = buildSubunitsForUnit(1, 45);
    const fromSeven = buildSubunitsForUnit(7, 45);
    expect(sizes(fromSeven)).toEqual(sizes(fromOne));
    expect(fromSeven[0].startLevel).toBe(7);
    expect(fromSeven[fromSeven.length - 1].endLevel).toBe(51);
  });

  it('honours a feasible desiredSubunitCount', () => {
    const subunits = buildSubunitsForUnit(1, 80, { desiredSubunitCount: 8 });
    expect(subunits).toHaveLength(8);
    expect(sizes(subunits)).toEqual([10, 10, 10, 10, 10, 10, 10, 10]);
  });

  // Today's behaviour, pinned so a change to it is visible rather than silent. SUBUNITS.md forbids
  // a tiny tail, and 13 with the preferred chunk of 9 would leave 4, so the chunk drops to 8.
  it('ships 13 Levels as 8 + 5, the smallest tail the rule allows', () => {
    expect(sizes(buildSubunitsForUnit(1, 13))).toEqual([8, 5]);
  });
});

describe('buildUnitSummaries', () => {
  it('accumulates start and end levels across units', () => {
    const units = buildUnitSummaries(['n5', 'n4', 'n3'] as const, level =>
      level === 'n5' ? 80 : level === 'n4' ? 45 : 12,
    );
    expect(
      units.map(u => [u.name, u.startLevel, u.endLevel, u.levelCount]),
    ).toEqual([
      ['n5', 1, 80, 80],
      ['n4', 81, 125, 45],
      ['n3', 126, 137, 12],
    ]);
  });

  it('names each unit by its index and its JLPT level', () => {
    const units = buildUnitSummaries(['n5', 'n4'] as const, () => 10);
    expect(units.map(u => [u.displayName, u.jlpt, u.subtitle])).toEqual([
      ['Unit 1', 'N5', 'Levels 1-10'],
      ['Unit 2', 'N4', 'Levels 11-20'],
    ]);
  });
});
