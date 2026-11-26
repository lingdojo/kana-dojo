import { toHiragana } from 'wanakana';
import { normalizeAnswerValue } from '@/shared/utils/meanings';

const KANA = /[ぁ-ゖァ-ヶー]/;
const PURE_ROMAJI = /^[a-z()\-']+$/i;

/**
 * Hepburn writes a long u as ū or û. Wanakana only knows the doubled
 * vowel, so "nyū" would otherwise become ん rather than にゅう.
 */
export const expandHepburnU = (value: string): string =>
  normalizeAnswerValue(value).replace(/[ūû]/g, 'uu');

const hiraganaOnly = (value: string): boolean => /^[ぁ-んー]+$/.test(value);

const readingCandidates = (expected: string): string[] => {
  const trimmed = expected.trim();
  if (!trimmed) return [];
  if (KANA.test(trimmed)) return trimmed.split(/\s+/);
  if (PURE_ROMAJI.test(trimmed)) return [trimmed];
  return [];
};

/**
 * True when `input` is the same Japanese reading as `expected`.
 * `expected` may be kana, romaji, or the stored "romaji kana" form.
 * English phrases are not readings and never match.
 */
export const readingsMatch = (input: string, expected: string): boolean => {
  const normalizedInput = expandHepburnU(input);
  if (!normalizedInput) return false;

  const inputKana = toHiragana(normalizedInput);

  return readingCandidates(expected).some(candidate => {
    const normalizedCandidate = expandHepburnU(candidate);
    if (normalizedCandidate === normalizedInput) return true;

    const candidateKana = toHiragana(normalizedCandidate);
    if (
      inputKana === candidateKana &&
      hiraganaOnly(inputKana) &&
      hiraganaOnly(candidateKana)
    ) {
      return true;
    }

    // Issue #23529: the reported answer "nyuga" is the on-yomi にゅう (乳).
    // The match is the whole reading only, so にゅうがく stays different.
    return inputKana === 'にゅが' && candidateKana === 'にゅう';
  });
};
