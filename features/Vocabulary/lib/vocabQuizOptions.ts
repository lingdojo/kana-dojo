import { toHiragana } from 'wanakana';
import type { IVocabObj } from '@/entities/vocabulary';
import { isVocabularyMeaningAnswerCorrect } from '@/features/Vocabulary/lib/isVocabularyMeaningAnswerCorrect';
import {
  normalizeAnswerValue,
  normalizeMeaningAnswer,
} from '@/shared/utils/meanings';
import { shuffle } from '@/shared/utils/shuffle';

const SYNONYM_GROUPS: ReadonlyArray<ReadonlyArray<string>> = [
  ['there', 'over there'],
  ['which', 'which of two'],
  ['big', 'large'],
  ['small', 'little'],
  ['fast', 'quick'],
  ['start', 'begin'],
  ['end', 'finish'],
  ['speak', 'talk'],
  ['look', 'watch'],
  ['hear', 'listen'],
];

const SYNONYM_CANONICAL_KEY = new Map<string, string>(
  SYNONYM_GROUPS.flatMap(group => {
    const canonicalKey = `synonym:${group[0]}`;
    return group.map(term => [term, canonicalKey] as const);
  }),
);

/**
 * Strips parenthetical qualifiers (e.g. "(humble)", "(noun)", "(of three or more)")
 * and normalizes the core gloss so near-identical meanings match across entries.
 */
const getCoreMeaningKey = (meaning: string): string => {
  const normalized = normalizeMeaningAnswer(meaning);
  if (!normalized) return '';

  const withoutParens = normalizeMeaningAnswer(
    meaning.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' '),
  );
  return withoutParens || normalized;
};

/**
 * Collects normalized meaning, core meaning, and near-synonym keys for overlap checks.
 */
export const getMeaningOverlapKeys = (meanings: string[]): Set<string> => {
  const keys = new Set<string>();

  for (const meaning of meanings) {
    const normalized = normalizeMeaningAnswer(meaning);
    if (!normalized) continue;
    keys.add(normalized);

    const core = getCoreMeaningKey(meaning);
    if (core) {
      keys.add(core);
      const synonymKey = SYNONYM_CANONICAL_KEY.get(core);
      if (synonymKey) keys.add(synonymKey);
    }

    const normalizedSynonymKey = SYNONYM_CANONICAL_KEY.get(normalized);
    if (normalizedSynonymKey) keys.add(normalizedSynonymKey);
  }

  return keys;
};

/**
 * Returns true when two vocabulary entries share any normalized meaning,
 * core meaning, or known near-synonym group.
 */
export const haveOverlappingMeanings = (
  a: IVocabObj,
  b: IVocabObj,
): boolean => {
  const keysA = getMeaningOverlapKeys(a.meanings);
  if (keysA.size === 0) return false;

  for (const key of getMeaningOverlapKeys(b.meanings)) {
    if (keysA.has(key)) return true;
  }

  return false;
};

const sharesExactPromptMeaning = (
  correctWordObj: IVocabObj,
  candidate: IVocabObj,
): boolean => {
  const promptMeaning = normalizeMeaningAnswer(
    correctWordObj.meanings[0] ?? '',
  );
  if (!promptMeaning) return false;

  return candidate.meanings.some(
    meaning => normalizeMeaningAnswer(meaning) === promptMeaning,
  );
};

export interface GetVocabIncorrectOptionsParams {
  correctWordObj: IVocabObj;
  wordObjs: IVocabObj[];
  count: number;
  quizType: 'meaning' | 'reading';
  isReverse: boolean;
  shuffleItems?: <T>(items: T[]) => T[];
}

const collectUniqueOptions = (
  candidates: IVocabObj[],
  count: number,
  getLabel: (obj: IVocabObj) => string,
  getKey: (label: string) => string,
  usedKeys: Set<string>,
  shuffleItems: <T>(items: T[]) => T[],
  result: string[],
): void => {
  for (const candidate of shuffleItems(candidates)) {
    if (result.length >= count) break;
    const label = getLabel(candidate);
    if (!label) continue;
    const key = getKey(label);
    if (!key || usedKeys.has(key)) continue;
    usedKeys.add(key);
    result.push(label);
  }
};

/**
 * Selects unique distractor options for a vocabulary quiz question while avoiding
 * synonymous or meaning-overlapping entries whenever non-confusable options exist.
 */
export const getVocabIncorrectOptions = ({
  correctWordObj,
  wordObjs,
  count,
  quizType,
  isReverse,
  shuffleItems = shuffle,
}: GetVocabIncorrectOptionsParams): string[] => {
  if (count <= 0 || wordObjs.length === 0) return [];

  const candidates = wordObjs.filter(obj => obj.word !== correctWordObj.word);

  if (quizType === 'reading') {
    const correctKey = toHiragana(normalizeAnswerValue(correctWordObj.reading));
    const usedKeys = new Set<string>(correctKey ? [correctKey] : []);
    const result: string[] = [];

    collectUniqueOptions(
      candidates,
      count,
      obj => obj.reading.trim(),
      label => toHiragana(normalizeAnswerValue(label)),
      usedKeys,
      shuffleItems,
      result,
    );

    return result;
  }

  const getLabel = (obj: IVocabObj) =>
    isReverse ? obj.word.trim() : (obj.meanings[0] ?? '').trim();
  const getKey = (label: string) =>
    isReverse ? normalizeAnswerValue(label) : normalizeMeaningAnswer(label);

  const correctLabel = getLabel(correctWordObj);
  const correctKey = correctLabel ? getKey(correctLabel) : '';
  const usedKeys = new Set<string>(correctKey ? [correctKey] : []);
  const result: string[] = [];

  // Tier 1: exclude words overlapping with the question or already-chosen options.
  const usedOverlapKeys = getMeaningOverlapKeys(correctWordObj.meanings);
  for (const candidate of shuffleItems(candidates)) {
    if (result.length >= count) break;
    const label = getLabel(candidate);
    if (!label) continue;
    const key = getKey(label);
    if (!key || usedKeys.has(key)) continue;

    const candidateOverlapKeys = getMeaningOverlapKeys(candidate.meanings);
    let overlaps = false;
    for (const overlapKey of candidateOverlapKeys) {
      if (usedOverlapKeys.has(overlapKey)) {
        overlaps = true;
        break;
      }
    }
    if (overlaps) continue;

    usedKeys.add(key);
    for (const overlapKey of candidateOverlapKeys) {
      usedOverlapKeys.add(overlapKey);
    }
    result.push(label);
  }

  if (result.length >= count) return result;

  // Tier 2: allow distractors that overlap with each other as long as they do
  // not overlap with the correct answer.
  const nonOverlappingWithCorrect = candidates.filter(
    obj => !haveOverlappingMeanings(correctWordObj, obj),
  );
  collectUniqueOptions(
    nonOverlappingWithCorrect,
    count,
    getLabel,
    getKey,
    usedKeys,
    shuffleItems,
    result,
  );

  if (result.length >= count) return result;

  // Tier 3 (small-pool fallback): in reverse mode, still prefer entries that do
  // not share the displayed prompt meaning before falling back to exact synonyms.
  if (isReverse) {
    const nonPromptSynonyms = candidates.filter(
      obj =>
        haveOverlappingMeanings(correctWordObj, obj) &&
        !sharesExactPromptMeaning(correctWordObj, obj),
    );
    collectUniqueOptions(
      nonPromptSynonyms,
      count,
      getLabel,
      getKey,
      usedKeys,
      shuffleItems,
      result,
    );
  }

  if (result.length >= count) return result;

  // Tier 4 (last-resort fallback when the selected pool has no other words):
  // fill remaining slots with any distinct-label candidates.
  collectUniqueOptions(
    candidates,
    count,
    getLabel,
    getKey,
    usedKeys,
    shuffleItems,
    result,
  );

  return result;
};

export interface IsVocabOptionCorrectParams {
  selectedOption: string;
  correctWordObj: IVocabObj | undefined;
  correctAnswer: string;
  quizType: 'meaning' | 'reading';
  isReverse: boolean;
  wordObjMap?: Map<string, IVocabObj>;
}

/**
 * Checks whether a selected quiz option is correct, accepting equivalent
 * meaning-sharing entries if a small pool forced a synonym fallback option.
 */
export const isVocabOptionCorrect = ({
  selectedOption,
  correctWordObj,
  correctAnswer,
  quizType,
  isReverse,
  wordObjMap,
}: IsVocabOptionCorrectParams): boolean => {
  if (selectedOption === correctAnswer) return true;
  if (!correctWordObj) return false;

  if (quizType === 'reading') {
    return (
      toHiragana(normalizeAnswerValue(selectedOption)) ===
      toHiragana(normalizeAnswerValue(correctAnswer))
    );
  }

  if (!isReverse) {
    return isVocabularyMeaningAnswerCorrect(
      correctWordObj,
      selectedOption,
      false,
    );
  }

  const selectedWordObj = wordObjMap?.get(selectedOption);
  if (!selectedWordObj) return false;

  if (sharesExactPromptMeaning(correctWordObj, selectedWordObj)) {
    return true;
  }

  const promptOverlapKeys = getMeaningOverlapKeys([
    correctWordObj.meanings[0] ?? '',
  ]);
  for (const key of getMeaningOverlapKeys(selectedWordObj.meanings)) {
    if (promptOverlapKeys.has(key)) return true;
  }

  return false;
};
