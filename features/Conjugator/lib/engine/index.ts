/**
 * Conjugation Engine - Public API
 */

// Main conjugation API
export {
  conjugate,
  conjugateOrThrow,
  conjugateToForm,
  isValidVerb,
  getVerbInfo,
  type ConjugateResult,
} from './conjugate';

// Verb classification
export {
  classifyVerb,
  getGodanMap,
  hiraganaToRomaji,
  isHiragana,
  isKatakana,
  isKanji,
  isJapanese,
  detectSuruCompound,
  detectKuruCompound,
} from './classifyVerb';

// Godan conjugation
export {
  conjugateGodan,
  getGodanStem,
  getGodanTeForm,
  getGodanTaForm,
} from './conjugateGodan';

// Ichidan conjugation
export {
  conjugateIchidan,
  getIchidanStem,
  getIchidanColloquialPotential,
  getIchidanTraditionalPotential,
  isColloquialPotential,
} from './conjugateIchidan';

// Irregular conjugation
export {
  conjugateIrregular,
  getAruNegative,
  getIkuTeForm,
  getHonorificMasuStem,
  isHonorificVerb,
} from './conjugateIrregular';

// Compound verb conjugation
export {
  conjugateCompound,
  isSuruCompound,
  isKuruCompound,
  getSuruCompoundPrefix,
  getKuruCompoundPrefix,
  verifyPrefixPreservation,
  conjugateCompoundVerb,
  COMMON_SURU_COMPOUNDS,
  COMMON_KURU_COMPOUNDS,
} from './conjugateCompound';
