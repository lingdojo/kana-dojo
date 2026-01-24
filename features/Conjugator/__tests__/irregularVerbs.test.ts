/**
 * Unit Tests for Irregular Verb Conjugations
 *
 * Tests all forms for する, 来る, ある, 行く and honorific verb masu-forms.
 *
 * Requirements: 2.3-2.6, 4.7, 4.8
 */

import { describe, it, expect } from 'vitest';
import { classifyVerb } from '../lib/engine/classifyVerb';
import {
  conjugateIrregular,
  getAruNegative,
  getIkuTeForm,
  getHonorificMasuStem,
  isHonorificVerb,
} from '../lib/engine/conjugateIrregular';

// ============================================================================
// Helper Functions
// ============================================================================

function getFormById(forms: ReturnType<typeof conjugateIrregular>, id: string) {
  return forms.find(f => f.id === id);
}

// ============================================================================
// する (suru) Tests - Requirements 2.3
// ============================================================================

describe('する (suru) Conjugation', () => {
  const verbInfo = classifyVerb('する');
  const forms = conjugateIrregular(verbInfo);

  it('should classify する as irregular suru type', () => {
    expect(verbInfo.type).toBe('irregular');
    expect(verbInfo.irregularType).toBe('suru');
  });

  it('should produce correct dictionary form', () => {
    const form = getFormById(forms, 'dictionary');
    expect(form?.hiragana).toBe('する');
  });

  it('should produce correct te-form', () => {
    const form = getFormById(forms, 'te');
    expect(form?.hiragana).toBe('して');
  });

  it('should produce correct masu-form', () => {
    const form = getFormById(forms, 'masu');
    expect(form?.hiragana).toBe('します');
  });

  it('should produce correct negative form', () => {
    const form = getFormById(forms, 'nai');
    expect(form?.hiragana).toBe('しない');
  });

  it('should produce correct past form', () => {
    const form = getFormById(forms, 'ta');
    expect(form?.hiragana).toBe('した');
  });

  it('should produce correct potential form (できる)', () => {
    const form = getFormById(forms, 'potential-plain');
    expect(form?.hiragana).toBe('できる');
  });

  it('should produce correct volitional form', () => {
    const form = getFormById(forms, 'volitional-plain');
    expect(form?.hiragana).toBe('しよう');
  });

  it('should produce correct passive form', () => {
    const form = getFormById(forms, 'passive-plain');
    expect(form?.hiragana).toBe('される');
  });

  it('should produce correct causative form', () => {
    const form = getFormById(forms, 'causative-plain');
    expect(form?.hiragana).toBe('させる');
  });

  it('should produce correct imperative form', () => {
    const form = getFormById(forms, 'imperative-plain');
    expect(form?.hiragana).toBe('しろ');
  });

  it('should produce correct conditional ba-form', () => {
    const form = getFormById(forms, 'conditional-ba');
    expect(form?.hiragana).toBe('すれば');
  });
});

// ============================================================================
// する-compound verb Tests - Requirements 2.7
// ============================================================================

describe('する-compound Verb Conjugation', () => {
  const verbInfo = classifyVerb('勉強する');
  const forms = conjugateIrregular(verbInfo);

  it('should classify 勉強する as irregular suru type with compound prefix', () => {
    expect(verbInfo.type).toBe('irregular');
    expect(verbInfo.irregularType).toBe('suru');
    expect(verbInfo.compoundPrefix).toBe('勉強');
  });

  it('should preserve prefix in dictionary form', () => {
    const form = getFormById(forms, 'dictionary');
    expect(form?.hiragana).toBe('勉強する');
  });

  it('should preserve prefix in te-form', () => {
    const form = getFormById(forms, 'te');
    expect(form?.hiragana).toBe('勉強して');
  });

  it('should preserve prefix in masu-form', () => {
    const form = getFormById(forms, 'masu');
    expect(form?.hiragana).toBe('勉強します');
  });

  it('should preserve prefix in negative form', () => {
    const form = getFormById(forms, 'nai');
    expect(form?.hiragana).toBe('勉強しない');
  });

  it('should preserve prefix in potential form', () => {
    const form = getFormById(forms, 'potential-plain');
    expect(form?.hiragana).toBe('勉強できる');
  });
});

// ============================================================================
// 来る (kuru) Tests - Requirements 2.4
// ============================================================================

describe('来る (kuru) Conjugation', () => {
  const verbInfo = classifyVerb('来る');
  const forms = conjugateIrregular(verbInfo);

  it('should classify 来る as irregular kuru type', () => {
    expect(verbInfo.type).toBe('irregular');
    expect(verbInfo.irregularType).toBe('kuru');
  });

  it('should produce correct dictionary form', () => {
    const form = getFormById(forms, 'dictionary');
    // kanji field contains the kanji version, hiragana contains reading
    expect(form?.kanji).toBe('来る');
    expect(form?.hiragana).toBe('くる');
  });

  it('should produce correct te-form (きて)', () => {
    const form = getFormById(forms, 'te');
    expect(form?.hiragana).toBe('きて');
  });

  it('should produce correct masu-form (きます)', () => {
    const form = getFormById(forms, 'masu');
    expect(form?.hiragana).toBe('きます');
  });

  it('should produce correct negative form (こない)', () => {
    const form = getFormById(forms, 'nai');
    expect(form?.hiragana).toBe('こない');
  });

  it('should produce correct past form (きた)', () => {
    const form = getFormById(forms, 'ta');
    expect(form?.hiragana).toBe('きた');
  });

  it('should produce correct potential form (こられる)', () => {
    const form = getFormById(forms, 'potential-plain');
    expect(form?.hiragana).toBe('こられる');
  });

  it('should produce correct volitional form (こよう)', () => {
    const form = getFormById(forms, 'volitional-plain');
    expect(form?.hiragana).toBe('こよう');
  });

  it('should produce correct imperative form (こい)', () => {
    const form = getFormById(forms, 'imperative-plain');
    expect(form?.hiragana).toBe('こい');
  });
});

// ============================================================================
// ある (aru) Tests - Requirements 2.5, 4.8
// ============================================================================

describe('ある (aru) Conjugation', () => {
  const verbInfo = classifyVerb('ある');
  const forms = conjugateIrregular(verbInfo);

  it('should classify ある as irregular aru type', () => {
    expect(verbInfo.type).toBe('irregular');
    expect(verbInfo.irregularType).toBe('aru');
  });

  it('should produce correct dictionary form', () => {
    const form = getFormById(forms, 'dictionary');
    expect(form?.hiragana).toBe('ある');
  });

  it('should produce correct te-form', () => {
    const form = getFormById(forms, 'te');
    expect(form?.hiragana).toBe('あって');
  });

  it('should produce correct masu-form', () => {
    const form = getFormById(forms, 'masu');
    expect(form?.hiragana).toBe('あります');
  });

  // SPECIAL: ある negative is ない (not あらない) - Requirements 4.8
  it('should produce special negative form ない (not あらない)', () => {
    const form = getFormById(forms, 'nai');
    expect(form?.hiragana).toBe('ない');
    expect(form?.hiragana).not.toBe('あらない');
  });

  it('should produce special past negative form なかった', () => {
    const form = getFormById(forms, 'nakatta');
    expect(form?.hiragana).toBe('なかった');
  });

  it('should produce correct past form', () => {
    const form = getFormById(forms, 'ta');
    expect(form?.hiragana).toBe('あった');
  });

  it('should produce correct conditional ba-form', () => {
    const form = getFormById(forms, 'conditional-ba');
    expect(form?.hiragana).toBe('あれば');
  });

  it('getAruNegative helper should return ない', () => {
    expect(getAruNegative()).toBe('ない');
  });
});

// ============================================================================
// 行く (iku) Tests - Requirements 2.6
// ============================================================================

describe('行く (iku) Conjugation', () => {
  const verbInfo = classifyVerb('行く');
  const forms = conjugateIrregular(verbInfo);

  it('should classify 行く as irregular iku type', () => {
    expect(verbInfo.type).toBe('irregular');
    expect(verbInfo.irregularType).toBe('iku');
  });

  it('should produce correct dictionary form', () => {
    const form = getFormById(forms, 'dictionary');
    expect(form?.hiragana).toBe('いく');
  });

  // SPECIAL: 行く te-form is いって (not いいて)
  it('should produce special te-form いって (not いいて)', () => {
    const form = getFormById(forms, 'te');
    expect(form?.hiragana).toBe('いって');
    expect(form?.hiragana).not.toBe('いいて');
  });

  // SPECIAL: 行く ta-form is いった (not いいた)
  it('should produce special past form いった (not いいた)', () => {
    const form = getFormById(forms, 'ta');
    expect(form?.hiragana).toBe('いった');
    expect(form?.hiragana).not.toBe('いいた');
  });

  it('should produce correct masu-form', () => {
    const form = getFormById(forms, 'masu');
    expect(form?.hiragana).toBe('いきます');
  });

  it('should produce correct negative form', () => {
    const form = getFormById(forms, 'nai');
    expect(form?.hiragana).toBe('いかない');
  });

  it('should produce correct potential form', () => {
    const form = getFormById(forms, 'potential-plain');
    expect(form?.hiragana).toBe('いける');
  });

  it('should produce correct volitional form', () => {
    const form = getFormById(forms, 'volitional-plain');
    expect(form?.hiragana).toBe('いこう');
  });

  it('should produce correct conditional tara-form with special past', () => {
    const form = getFormById(forms, 'conditional-tara');
    expect(form?.hiragana).toBe('いったら');
  });

  it('getIkuTeForm helper should return 行って', () => {
    expect(getIkuTeForm()).toBe('行って');
  });
});

// ============================================================================
// Honorific Verbs Tests - Requirements 4.7
// ============================================================================

describe('Honorific Verb Conjugation', () => {
  describe('くださる', () => {
    const verbInfo = classifyVerb('くださる');
    const forms = conjugateIrregular(verbInfo);

    it('should classify くださる as irregular honorific type', () => {
      expect(verbInfo.type).toBe('irregular');
      expect(verbInfo.irregularType).toBe('honorific');
    });

    // SPECIAL: masu-form is くださいます (not くださります)
    it('should produce special masu-form くださいます (not くださります)', () => {
      const form = getFormById(forms, 'masu');
      expect(form?.hiragana).toBe('くださいます');
      expect(form?.hiragana).not.toBe('くださります');
    });

    it('should produce correct te-form', () => {
      const form = getFormById(forms, 'te');
      expect(form?.hiragana).toBe('くださって');
    });
  });

  describe('なさる', () => {
    const verbInfo = classifyVerb('なさる');
    const forms = conjugateIrregular(verbInfo);

    it('should classify なさる as irregular honorific type', () => {
      expect(verbInfo.type).toBe('irregular');
      expect(verbInfo.irregularType).toBe('honorific');
    });

    // SPECIAL: masu-form is なさいます (not なさります)
    it('should produce special masu-form なさいます (not なさります)', () => {
      const form = getFormById(forms, 'masu');
      expect(form?.hiragana).toBe('なさいます');
      expect(form?.hiragana).not.toBe('なさります');
    });
  });

  describe('いらっしゃる', () => {
    const verbInfo = classifyVerb('いらっしゃる');
    const forms = conjugateIrregular(verbInfo);

    it('should classify いらっしゃる as irregular honorific type', () => {
      expect(verbInfo.type).toBe('irregular');
      expect(verbInfo.irregularType).toBe('honorific');
    });

    // SPECIAL: masu-form is いらっしゃいます (not いらっしゃります)
    it('should produce special masu-form いらっしゃいます', () => {
      const form = getFormById(forms, 'masu');
      expect(form?.hiragana).toBe('いらっしゃいます');
    });
  });

  describe('おっしゃる', () => {
    const verbInfo = classifyVerb('おっしゃる');
    const forms = conjugateIrregular(verbInfo);

    it('should classify おっしゃる as irregular honorific type', () => {
      expect(verbInfo.type).toBe('irregular');
      expect(verbInfo.irregularType).toBe('honorific');
    });

    // SPECIAL: masu-form is おっしゃいます (not おっしゃります)
    it('should produce special masu-form おっしゃいます', () => {
      const form = getFormById(forms, 'masu');
      expect(form?.hiragana).toBe('おっしゃいます');
    });
  });

  describe('ござる', () => {
    const verbInfo = classifyVerb('ござる');
    const forms = conjugateIrregular(verbInfo);

    it('should classify ござる as irregular honorific type', () => {
      expect(verbInfo.type).toBe('irregular');
      expect(verbInfo.irregularType).toBe('honorific');
    });

    // SPECIAL: masu-form is ございます (not ござります)
    it('should produce special masu-form ございます', () => {
      const form = getFormById(forms, 'masu');
      expect(form?.hiragana).toBe('ございます');
    });
  });

  describe('Helper functions', () => {
    it('getHonorificMasuStem should add い to stem', () => {
      expect(getHonorificMasuStem('くださ')).toBe('ください');
      expect(getHonorificMasuStem('なさ')).toBe('なさい');
    });

    it('isHonorificVerb should identify honorific verbs', () => {
      expect(isHonorificVerb('くださる')).toBe(true);
      expect(isHonorificVerb('なさる')).toBe(true);
      expect(isHonorificVerb('いらっしゃる')).toBe(true);
      expect(isHonorificVerb('おっしゃる')).toBe(true);
      expect(isHonorificVerb('ござる')).toBe(true);
      expect(isHonorificVerb('する')).toBe(false);
      expect(isHonorificVerb('食べる')).toBe(false);
    });
  });
});
