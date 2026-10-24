import { beforeEach, describe, expect, it } from 'vitest';
import type { IKanjiObj } from '@/entities/kanji';
import useKanjiStore, { type KanjiLevelSelection } from './useKanjiStore';

const kanji = (id: number, kanjiChar: string): IKanjiObj => ({
  id,
  kanjiChar,
  onyomi: [],
  kunyomi: [],
  meanings: [],
});

const first = kanji(1, '日');
const second = kanji(2, '月');
const third = kanji(3, '火');

const currentSubunit: KanjiLevelSelection[] = [
  { name: 'Set 1', items: [first] },
  { name: 'Set 2', items: [second] },
];
const otherSubunit: KanjiLevelSelection = {
  name: 'Set 11',
  items: [third],
};

describe('kanji level bulk selection', () => {
  beforeEach(() => {
    useKanjiStore.setState({ selectedKanjiSets: [], selectedKanjiObjs: [] });
  });

  it('preserves a partial selection and does not duplicate levels or kanji on repeated Select All', () => {
    useKanjiStore.setState({
      selectedKanjiSets: ['Set 1', otherSubunit.name],
      selectedKanjiObjs: [first, third],
    });

    useKanjiStore.getState().selectKanjiLevels(currentSubunit);
    useKanjiStore.getState().selectKanjiLevels(currentSubunit);

    expect(useKanjiStore.getState().selectedKanjiSets).toEqual([
      'Set 1',
      otherSubunit.name,
      'Set 2',
    ]);
    expect(
      useKanjiStore.getState().selectedKanjiObjs.map(item => item.kanjiChar),
    ).toEqual(['日', '火', '月']);
  });

  it('clears only levels in the active subunit and leaves other selections intact', () => {
    useKanjiStore
      .getState()
      .selectKanjiLevels([...currentSubunit, otherSubunit]);

    useKanjiStore.getState().clearKanjiLevels(currentSubunit);
    useKanjiStore.getState().clearKanjiLevels(currentSubunit);

    expect(useKanjiStore.getState().selectedKanjiSets).toEqual([
      otherSubunit.name,
    ]);
    expect(useKanjiStore.getState().selectedKanjiObjs).toEqual([third]);
  });
});
