'use client';

import { kana } from '@/features/Kana/data/kana';

export const formatLevelsAsRanges = (sets: string[]): string => {
  if (sets.length === 0) return 'None';

  const numbers = sets
    .map(set => parseInt(set.replace('Set ', '')))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);

  if (numbers.length === 0) return 'None';

  const ranges: string[] = [];
  let rangeStart = numbers[0];
  let rangeEnd = numbers[0];

  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] === rangeEnd + 1) {
      rangeEnd = numbers[i];
    } else {
      ranges.push(
        rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`,
      );
      rangeStart = numbers[i];
      rangeEnd = numbers[i];
    }
  }

  ranges.push(
    rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`,
  );

  return ranges.join(', ');
};

export const getKanaGroupNames = (kanaGroupIndices: number[]) => {
  const selected = new Set(kanaGroupIndices);

  const parentGroupDefs = [
    { label: 'All Hiragana', start: 0, end: 26 },
    { label: 'All Katakana', start: 26, end: 60 },
    { label: 'All Challenge', start: 60, end: 69 },
  ];

  const subgroupDefs = [
    { label: 'Hiragana Base', start: 0, end: 10 },
    { label: 'Hiragana Dakuon', start: 10, end: 15 },
    { label: 'Hiragana Yoon', start: 15, end: 26 },
    { label: 'Katakana Base', start: 26, end: 36 },
    { label: 'Katakana Dakuon', start: 36, end: 41 },
    { label: 'Katakana Yoon', start: 41, end: 52 },
    { label: 'Katakana Foreign Sounds', start: 52, end: 60 },
    { label: 'Challenge Similar Hiragana', start: 60, end: 65 },
    { label: 'Challenge Confusing Katakana', start: 65, end: 69 },
  ];

  const nonChallengeIndices = kana
    .map((k, i) => ({ k, i }))
    .filter(({ k }) => !k.groupName.startsWith('challenge.'))
    .map(({ i }) => i);
  const allNonChallengeSelected =
    nonChallengeIndices.length > 0 &&
    nonChallengeIndices.every(i => selected.has(i));

  const full: string[] = [];
  const compact: string[] = [];
  const covered = new Set<number>();

  if (allNonChallengeSelected) {
    full.push('all kana');
    compact.push('all kana');
    nonChallengeIndices.forEach(i => covered.add(i));
  }

  parentGroupDefs.forEach(parentDef => {
    if (allNonChallengeSelected && parentDef.label !== 'All Challenge') return;

    let allCovered = true;
    for (let i = parentDef.start; i < parentDef.end; i++) {
      if (!covered.has(i)) {
        allCovered = false;
        break;
      }
    }
    if (allCovered) return;

    let allInRange = true;
    for (let i = parentDef.start; i < parentDef.end; i++) {
      if (!selected.has(i)) {
        allInRange = false;
        break;
      }
    }
    if (!allInRange) return;

    full.push(parentDef.label);
    compact.push(parentDef.label);
    for (let i = parentDef.start; i < parentDef.end; i++) covered.add(i);
  });

  subgroupDefs.forEach(def => {
    let allCovered = true;
    for (let i = def.start; i < def.end; i++) {
      if (!covered.has(i)) {
        allCovered = false;
        break;
      }
    }
    if (allCovered) return;

    let allInRange = true;
    for (let i = def.start; i < def.end; i++) {
      if (!selected.has(i)) {
        allInRange = false;
        break;
      }
    }
    if (!allInRange) return;

    full.push(def.label);
    compact.push(def.label);
    for (let i = def.start; i < def.end; i++) covered.add(i);
  });

  const sortedSelected = [...kanaGroupIndices].sort((a, b) => a - b);
  sortedSelected.forEach(i => {
    if (covered.has(i)) return;
    const group = kana[i];
    if (!group) return;
    const firstKana = group.kana[0];
    const isChallenge = group.groupName.startsWith('challenge.');
    full.push(
      isChallenge ? `${firstKana}-group (challenge)` : `${firstKana}-group`,
    );
    compact.push(firstKana);
  });

  return {
    full: full.length > 0 ? full.join(', ') : 'None',
    compact: compact.length > 0 ? compact.join(', ') : 'None',
  };
};

export const getKanjiVocabLabels = (sets: string[]) => {
  if (sets.length === 0) {
    return {
      full: 'None',
      compact: 'None',
    };
  }

  const allAreNumberedSets = sets.every(set => /^Set \d+$/.test(set));
  if (!allAreNumberedSets) {
    return {
      full: sets.join(', '),
      compact: sets.join(', '),
    };
  }

  const sortedSets = [...sets].sort((a, b) => {
    const numA = parseInt(a.replace('Set ', ''));
    const numB = parseInt(b.replace('Set ', ''));
    return numA - numB;
  });

  const ranges = formatLevelsAsRanges(sortedSets);
  const full = ranges
    .split(', ')
    .map(range => `${range.includes('-') ? 'Levels' : 'Level'} ${range}`)
    .join(', ');

  return {
    full,
    compact: ranges,
  };
};

export const getSelectionLabels = (
  type: 'kana' | 'kanji' | 'vocabulary',
  selection: number[] | string[],
) => {
  if (type === 'kana') {
    return getKanaGroupNames(selection as number[]);
  }

  return getKanjiVocabLabels(selection as string[]);
};
