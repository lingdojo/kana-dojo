import { describe, expect, it } from 'vitest';
import { getKanaTilesQuestionShape } from './getKanaTilesQuestionShape';

describe('getKanaTilesQuestionShape', () => {
  it('keeps the standard tile counts when enough characters are selected', () => {
    expect(
      getKanaTilesQuestionShape({
        wordLength: 1,
        availableCharacterCount: 5,
      }),
    ).toEqual({ canGenerate: true, tileCount: 3 });

    expect(
      getKanaTilesQuestionShape({
        wordLength: 2,
        availableCharacterCount: 5,
      }),
    ).toEqual({ canGenerate: true, tileCount: 4 });

    expect(
      getKanaTilesQuestionShape({
        wordLength: 3,
        availableCharacterCount: 5,
      }),
    ).toEqual({ canGenerate: true, tileCount: 5 });
  });

  it('allows adaptive word length to progress for three-character kana groups', () => {
    expect(
      getKanaTilesQuestionShape({
        wordLength: 2,
        availableCharacterCount: 3,
      }),
    ).toEqual({ canGenerate: true, tileCount: 3 });

    expect(
      getKanaTilesQuestionShape({
        wordLength: 3,
        availableCharacterCount: 3,
      }),
    ).toEqual({ canGenerate: true, tileCount: 3 });
  });

  it('rejects pools that cannot supply the target word length', () => {
    expect(
      getKanaTilesQuestionShape({
        wordLength: 3,
        availableCharacterCount: 2,
      }),
    ).toEqual({ canGenerate: false, tileCount: 0 });
  });
});
