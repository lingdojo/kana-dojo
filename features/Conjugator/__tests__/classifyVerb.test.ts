/**
 * Unit Tests for Irregular Verb Classification
 *
 * Tests する, 来る, ある, 行く, and honorific verbs
 * Requirements: 2.3-2.6, 4.7
 */

import { describe, it, expect } from 'vitest';
import { classifyVerb } from '../lib/engine/classifyVerb';

describe('Irregular Verb Classification', () => {
  describe('する (to do) - Requirements 2.3', () => {
    it('classifies する as irregular with suru type', () => {
      const result = classifyVerb('する');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('suru');
      expect(result.dictionaryForm).toBe('する');
    });
  });

  describe('来る (to come) - Requirements 2.4', () => {
    it('classifies 来る (kanji) as irregular with kuru type', () => {
      const result = classifyVerb('来る');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('kuru');
      expect(result.dictionaryForm).toBe('来る');
    });

    it('classifies くる (hiragana) as irregular with kuru type', () => {
      const result = classifyVerb('くる');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('kuru');
      expect(result.dictionaryForm).toBe('くる');
    });
  });

  describe('ある (to exist) - Requirements 2.5', () => {
    it('classifies ある as irregular with aru type', () => {
      const result = classifyVerb('ある');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('aru');
      expect(result.dictionaryForm).toBe('ある');
    });
  });

  describe('行く (to go) - Requirements 2.6', () => {
    it('classifies 行く (kanji) as irregular with iku type', () => {
      const result = classifyVerb('行く');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('iku');
      expect(result.dictionaryForm).toBe('行く');
    });

    it('classifies いく (hiragana) as irregular with iku type', () => {
      const result = classifyVerb('いく');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('iku');
      expect(result.dictionaryForm).toBe('いく');
    });
  });

  describe('Honorific verbs - Requirements 4.7', () => {
    it('classifies くださる as irregular with honorific type', () => {
      const result = classifyVerb('くださる');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('honorific');
      expect(result.dictionaryForm).toBe('くださる');
    });

    it('classifies なさる as irregular with honorific type', () => {
      const result = classifyVerb('なさる');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('honorific');
      expect(result.dictionaryForm).toBe('なさる');
    });

    it('classifies いらっしゃる as irregular with honorific type', () => {
      const result = classifyVerb('いらっしゃる');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('honorific');
      expect(result.dictionaryForm).toBe('いらっしゃる');
    });

    it('classifies おっしゃる as irregular with honorific type', () => {
      const result = classifyVerb('おっしゃる');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('honorific');
      expect(result.dictionaryForm).toBe('おっしゃる');
    });

    it('classifies ござる as irregular with honorific type', () => {
      const result = classifyVerb('ござる');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('honorific');
      expect(result.dictionaryForm).toBe('ござる');
    });
  });

  describe('Compound verbs - Requirements 2.7, 2.8', () => {
    it('classifies 勉強する as suru compound with prefix preserved', () => {
      const result = classifyVerb('勉強する');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('suru');
      expect(result.compoundPrefix).toBe('勉強');
      expect(result.dictionaryForm).toBe('勉強する');
    });

    it('classifies 運動する as suru compound with prefix preserved', () => {
      const result = classifyVerb('運動する');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('suru');
      expect(result.compoundPrefix).toBe('運動');
    });

    it('classifies 持ってくる as kuru compound with prefix preserved', () => {
      const result = classifyVerb('持ってくる');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('kuru');
      expect(result.compoundPrefix).toBe('持って');
    });

    it('classifies 持って来る as kuru compound with prefix preserved', () => {
      const result = classifyVerb('持って来る');
      expect(result.type).toBe('irregular');
      expect(result.irregularType).toBe('kuru');
      expect(result.compoundPrefix).toBe('持って');
    });
  });

  describe('Error handling', () => {
    it('throws error for empty input', () => {
      expect(() => classifyVerb('')).toThrow('EMPTY_INPUT');
    });

    it('throws error for whitespace-only input', () => {
      expect(() => classifyVerb('   ')).toThrow('EMPTY_INPUT');
    });

    it('throws error for non-Japanese characters', () => {
      expect(() => classifyVerb('hello')).toThrow('INVALID_CHARACTERS');
    });

    it('throws error for mixed Japanese and non-Japanese', () => {
      expect(() => classifyVerb('食べるabc')).toThrow('INVALID_CHARACTERS');
    });
  });
});
