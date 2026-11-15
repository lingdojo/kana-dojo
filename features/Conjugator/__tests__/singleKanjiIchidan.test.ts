/**
 * Unit Tests for single-kanji ichidan verbs
 *
 * Verbs written as one kanji + る (似る, 煮る, 得る, ...) cannot be classified from
 * their spelling, so the ichidan ones must be known; otherwise they default to godan
 * (似らない instead of 似ない).
 */

import { describe, it, expect } from 'vitest';
import { classifyVerb } from '../lib/engine/classifyVerb';
import { conjugate } from '../lib/engine/conjugate';

function formOf(verb: string, id: string): string | undefined {
  const res = conjugate(verb);
  if (!res.success) throw new Error(`conjugate(${verb}) failed`);
  return res.result.forms.find(f => f.id === id)?.hiragana;
}

describe('Single-kanji ichidan verbs', () => {
  it.each([
    '似る',
    '煮る',
    '得る',
    '経る',
    '射る',
    '干る',
    '診る',
    '観る',
    '看る',
  ])('classifies %s as ichidan', verb => {
    expect(classifyVerb(verb).type).toBe('ichidan');
  });

  it('conjugates 似る correctly', () => {
    expect(formOf('似る', 'nai')).toBe('似ない');
    expect(formOf('似る', 'masu')).toBe('似ます');
    expect(formOf('似る', 'te')).toBe('似て');
    expect(formOf('似る', 'progressive-present')).toBe('似ている');
  });

  it.each(['乗る', '取る', '売る', '切る', '知る', '要る'])(
    'still classifies single-kanji godan verb %s as godan',
    verb => {
      expect(classifyVerb(verb).type).toBe('godan');
    },
  );
});
