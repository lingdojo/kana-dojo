import { describe, expect, it } from 'vitest';
import type { IVocabObj } from '@/entities/vocabulary';
import {
  getVocabIncorrectOptions,
  haveOverlappingMeanings,
  isVocabOptionCorrect,
} from '@/features/Vocabulary/lib/vocabQuizOptions';

const identityShuffle = <T>(items: T[]): T[] => [...items];

const asoko: IVocabObj = {
  word: 'あそこ',
  reading: 'あそこ',
  meanings: ['over there'],
};

const acchi: IVocabObj = {
  word: 'あっち',
  reading: 'あっち',
  meanings: ['over there'],
};

const achira: IVocabObj = {
  word: 'あちら',
  reading: 'あちら',
  meanings: ['there'],
};

const sochira: IVocabObj = {
  word: 'そちら',
  reading: 'そちら',
  meanings: ['over there'],
};

const aoi: IVocabObj = {
  word: '青い',
  reading: 'あおい',
  meanings: ['blue (adj.)'],
};

const ao: IVocabObj = {
  word: '青',
  reading: 'あお',
  meanings: ['blue (noun)'],
};

const anata: IVocabObj = {
  word: '貴方',
  reading: 'あなた',
  meanings: ['you'],
};

const ringo: IVocabObj = {
  word: 'りんご',
  reading: 'りんご',
  meanings: ['apple'],
};

const hon: IVocabObj = {
  word: '本',
  reading: 'ほん',
  meanings: ['book'],
};

describe('haveOverlappingMeanings', () => {
  it('detects identical normalized meanings and shared secondary meanings', () => {
    const aku: IVocabObj = {
      word: '開く',
      reading: 'あく',
      meanings: ['to open', 'to become open'],
    };
    const akeru: IVocabObj = {
      word: '開ける',
      reading: 'あける',
      meanings: ['to open'],
    };

    expect(haveOverlappingMeanings(asoko, acchi)).toBe(true);
    expect(haveOverlappingMeanings(aku, akeru)).toBe(true);
    expect(haveOverlappingMeanings(asoko, ringo)).toBe(false);
  });

  it('detects parenthetical qualifiers and near-synonym groups', () => {
    const hai: IVocabObj = { word: 'はい', reading: 'はい', meanings: ['yes'] };
    const un: IVocabObj = {
      word: 'うん',
      reading: 'うん',
      meanings: ['(informal) yes'],
    };

    expect(haveOverlappingMeanings(asoko, achira)).toBe(true);
    expect(haveOverlappingMeanings(ao, aoi)).toBe(true);
    expect(haveOverlappingMeanings(hai, un)).toBe(true);
  });
});

describe('getVocabIncorrectOptions', () => {
  it('excludes synonymous words like あそこ and あちら when quizzing あっち in reverse mode', () => {
    const pool = [asoko, achira, acchi, sochira, anata, aoi, ringo, hon];

    const options = getVocabIncorrectOptions({
      correctWordObj: acchi,
      wordObjs: pool,
      count: 3,
      quizType: 'meaning',
      isReverse: true,
      shuffleItems: identityShuffle,
    });

    expect(options).toEqual(['貴方', '青い', 'りんご']);
    expect(options).not.toContain('あそこ');
    expect(options).not.toContain('あちら');
    expect(options).not.toContain('そちら');
  });

  it('excludes overlapping meanings in normal meaning mode and deduplicates labels', () => {
    const open1: IVocabObj = {
      word: '開く',
      reading: 'あく',
      meanings: ['to open', 'to become open'],
    };
    const open2: IVocabObj = {
      word: '開ける',
      reading: 'あける',
      meanings: ['to open'],
    };
    const open3: IVocabObj = {
      word: '開く2',
      reading: 'ひらく',
      meanings: ['open'],
    };
    const pool = [open1, open2, open3, acchi, achira, ringo, hon];

    const options = getVocabIncorrectOptions({
      correctWordObj: open1,
      wordObjs: pool,
      count: 3,
      quizType: 'meaning',
      isReverse: false,
      shuffleItems: identityShuffle,
    });

    expect(options).toEqual(['over there', 'apple', 'book']);
  });

  it('also avoids grouping synonymous distractors with each other in reverse mode', () => {
    const pool = [ringo, asoko, acchi, achira, anata, aoi];

    const options = getVocabIncorrectOptions({
      correctWordObj: ringo,
      wordObjs: pool,
      count: 3,
      quizType: 'meaning',
      isReverse: true,
      shuffleItems: identityShuffle,
    });

    expect(options).toEqual(['あそこ', '貴方', '青い']);
  });

  it('prefers near-synonyms over exact prompt synonyms and falls back only when pool is tiny', () => {
    const tinyPool = [acchi, achira, asoko, sochira];

    const options = getVocabIncorrectOptions({
      correctWordObj: acchi,
      wordObjs: tinyPool,
      count: 3,
      quizType: 'meaning',
      isReverse: true,
      shuffleItems: identityShuffle,
    });

    expect(options).toHaveLength(3);
    expect(options[0]).toBe('あちら');
    expect(new Set(options).size).toBe(3);
  });

  it('deduplicates reading distractors and excludes matching readings', () => {
    const ii: IVocabObj = { word: 'いい', reading: 'いい', meanings: ['good'] };
    const yoi: IVocabObj = {
      word: '良い',
      reading: 'いい',
      meanings: ['good'],
    };
    const hashi1: IVocabObj = {
      word: '橋',
      reading: 'はし',
      meanings: ['bridge'],
    };
    const hashi2: IVocabObj = {
      word: '箸',
      reading: 'はし',
      meanings: ['chopsticks'],
    };

    const options = getVocabIncorrectOptions({
      correctWordObj: ii,
      wordObjs: [ii, yoi, hashi1, hashi2, ringo],
      count: 3,
      quizType: 'reading',
      isReverse: false,
      shuffleItems: identityShuffle,
    });

    expect(options).toEqual(['はし', 'りんご']);
  });
});

describe('isVocabOptionCorrect', () => {
  const wordObjMap = new Map(
    [asoko, acchi, achira, anata, aoi].map(obj => [obj.word, obj]),
  );

  it('accepts an equivalent synonym option in reverse mode if forced by a small pool', () => {
    expect(
      isVocabOptionCorrect({
        selectedOption: 'あそこ',
        correctWordObj: acchi,
        correctAnswer: 'あっち',
        quizType: 'meaning',
        isReverse: true,
        wordObjMap,
      }),
    ).toBe(true);

    expect(
      isVocabOptionCorrect({
        selectedOption: 'あちら',
        correctWordObj: acchi,
        correctAnswer: 'あっち',
        quizType: 'meaning',
        isReverse: true,
        wordObjMap,
      }),
    ).toBe(true);
  });

  it('rejects non-synonymous options in reverse mode', () => {
    expect(
      isVocabOptionCorrect({
        selectedOption: '貴方',
        correctWordObj: acchi,
        correctAnswer: 'あっち',
        quizType: 'meaning',
        isReverse: true,
        wordObjMap,
      }),
    ).toBe(false);
  });

  it('accepts secondary meanings in normal meaning mode and rejects wrong ones', () => {
    const kuchi: IVocabObj = {
      word: '口',
      reading: 'くち',
      meanings: ['mouth', 'opening'],
    };

    expect(
      isVocabOptionCorrect({
        selectedOption: 'opening',
        correctWordObj: kuchi,
        correctAnswer: 'mouth',
        quizType: 'meaning',
        isReverse: false,
      }),
    ).toBe(true);

    expect(
      isVocabOptionCorrect({
        selectedOption: 'apple',
        correctWordObj: kuchi,
        correctAnswer: 'mouth',
        quizType: 'meaning',
        isReverse: false,
      }),
    ).toBe(false);
  });
});
