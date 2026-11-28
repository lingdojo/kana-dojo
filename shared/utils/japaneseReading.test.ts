import { describe, expect, it } from 'vitest';
import { readingsMatch } from '@/shared/utils/japaneseReading';

describe('readingsMatch', () => {
  it('accepts Nyuga as the romaji for にゅが', () => {
    expect(readingsMatch('nyuga', 'にゅが')).toBe(true);
    expect(readingsMatch('Nyuga', 'にゅが')).toBe(true);
    expect(readingsMatch('nyuga', 'ニュガ')).toBe(true);
  });

  it('accepts Hepburn nyū as the long-vowel reading にゅう', () => {
    expect(readingsMatch('nyū', 'nyuu ニュウ')).toBe(true);
    expect(readingsMatch('nyû', 'nyuu ニュウ')).toBe(true);
    expect(readingsMatch('nyuu', 'nyuu ニュウ')).toBe(true);
    expect(readingsMatch('ニュウ', 'nyuu ニュウ')).toBe(true);
    expect(readingsMatch('にゅう', 'nyuu')).toBe(true);
  });

  it('keeps the short reading にゅ distinct from にゅう', () => {
    expect(readingsMatch('nyu', 'nyu にゅ')).toBe(true);
    expect(readingsMatch('nyuu', 'nyu にゅ')).toBe(false);
    expect(readingsMatch('nyu', 'nyuu ニュウ')).toBe(false);
  });

  it('accepts Nyuga for the on-yomi にゅう and rejects it for a longer reading', () => {
    expect(readingsMatch('nyuga', 'nyuu ニュウ')).toBe(true);
    expect(readingsMatch('Nyuga', 'にゅう')).toBe(true);
    expect(readingsMatch('にゅが', 'ニュウ')).toBe(true);
    expect(readingsMatch('Nyuga', 'にゅうがく')).toBe(false);
    expect(readingsMatch('nyuga', 'nyu にゅ')).toBe(false);
    expect(readingsMatch('nyugaku', 'にゅうがく')).toBe(false);
  });

  it('accepts the full romaji of 入学', () => {
    expect(readingsMatch('nyuugaku', 'にゅうがく')).toBe(true);
    expect(readingsMatch('nyūgaku', 'にゅうがく')).toBe(true);
  });

  it('does not treat an English phrase as a reading', () => {
    expect(readingsMatch('emperor', 'the emperor')).toBe(false);
    expect(readingsMatch('point', 'to the point')).toBe(false);
    expect(readingsMatch('a', 'a matter')).toBe(false);
  });

  it('converts a single English word because that word is also romaji', () => {
    expect(readingsMatch('の', 'no')).toBe(true);
    expect(readingsMatch('じゃぱん', 'Japan')).toBe(true);
  });
});
