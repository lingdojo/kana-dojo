/**
 * Romaji Conversion Module
 *
 * This module provides comprehensive conversion between Japanese scripts
 * (hiragana, katakana) and romaji (romanized Japanese).
 *
 * Requirements: 1.5
 */

import { HIRAGANA_TO_ROMAJI, HIRAGANA_COMBINATIONS } from '../data/verbData';

// ============================================================================
// Katakana to Romaji Mapping
// ============================================================================

/**
 * Katakana to Romaji mapping
 * Generated from hiragana mapping by shifting Unicode code points
 */
const KATAKANA_TO_ROMAJI: Record<string, string> = {
  // Basic vowels
  ア: 'a',
  イ: 'i',
  ウ: 'u',
  エ: 'e',
  オ: 'o',
  // K-row
  カ: 'ka',
  キ: 'ki',
  ク: 'ku',
  ケ: 'ke',
  コ: 'ko',
  // S-row
  サ: 'sa',
  シ: 'shi',
  ス: 'su',
  セ: 'se',
  ソ: 'so',
  // T-row
  タ: 'ta',
  チ: 'chi',
  ツ: 'tsu',
  テ: 'te',
  ト: 'to',
  // N-row
  ナ: 'na',
  ニ: 'ni',
  ヌ: 'nu',
  ネ: 'ne',
  ノ: 'no',
  // H-row
  ハ: 'ha',
  ヒ: 'hi',
  フ: 'fu',
  ヘ: 'he',
  ホ: 'ho',
  // M-row
  マ: 'ma',
  ミ: 'mi',
  ム: 'mu',
  メ: 'me',
  モ: 'mo',
  // Y-row
  ヤ: 'ya',
  ユ: 'yu',
  ヨ: 'yo',
  // R-row
  ラ: 'ra',
  リ: 'ri',
  ル: 'ru',
  レ: 're',
  ロ: 'ro',
  // W-row
  ワ: 'wa',
  ヲ: 'wo',
  // N
  ン: 'n',
  // Dakuten (voiced)
  ガ: 'ga',
  ギ: 'gi',
  グ: 'gu',
  ゲ: 'ge',
  ゴ: 'go',
  ザ: 'za',
  ジ: 'ji',
  ズ: 'zu',
  ゼ: 'ze',
  ゾ: 'zo',
  ダ: 'da',
  ヂ: 'ji',
  ヅ: 'zu',
  デ: 'de',
  ド: 'do',
  バ: 'ba',
  ビ: 'bi',
  ブ: 'bu',
  ベ: 'be',
  ボ: 'bo',
  // Handakuten (p-sounds)
  パ: 'pa',
  ピ: 'pi',
  プ: 'pu',
  ペ: 'pe',
  ポ: 'po',
  // Small characters
  ャ: 'ya',
  ュ: 'yu',
  ョ: 'yo',
  ッ: '', // Double consonant (handled specially)
  ァ: 'a',
  ィ: 'i',
  ゥ: 'u',
  ェ: 'e',
  ォ: 'o',
  // Extended katakana
  ヴ: 'vu',
  ー: '', // Long vowel mark (handled specially)
};

/**
 * Katakana combination characters
 */
const KATAKANA_COMBINATIONS: Record<string, string> = {
  キャ: 'kya',
  キュ: 'kyu',
  キョ: 'kyo',
  シャ: 'sha',
  シュ: 'shu',
  ショ: 'sho',
  チャ: 'cha',
  チュ: 'chu',
  チョ: 'cho',
  ニャ: 'nya',
  ニュ: 'nyu',
  ニョ: 'nyo',
  ヒャ: 'hya',
  ヒュ: 'hyu',
  ヒョ: 'hyo',
  ミャ: 'mya',
  ミュ: 'myu',
  ミョ: 'myo',
  リャ: 'rya',
  リュ: 'ryu',
  リョ: 'ryo',
  ギャ: 'gya',
  ギュ: 'gyu',
  ギョ: 'gyo',
  ジャ: 'ja',
  ジュ: 'ju',
  ジョ: 'jo',
  ビャ: 'bya',
  ビュ: 'byu',
  ビョ: 'byo',
  ピャ: 'pya',
  ピュ: 'pyu',
  ピョ: 'pyo',
  // Extended combinations for foreign words
  ティ: 'ti',
  ディ: 'di',
  ファ: 'fa',
  フィ: 'fi',
  フェ: 'fe',
  フォ: 'fo',
  ヴァ: 'va',
  ヴィ: 'vi',
  ヴェ: 've',
  ヴォ: 'vo',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a character is hiragana
 */
function isHiragana(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x3040 && code <= 0x309f;
}

/**
 * Check if a character is katakana
 */
function isKatakana(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x30a0 && code <= 0x30ff;
}

/**
 * Get the last vowel from a romaji string
 * Used for handling long vowel marks
 */
function getLastVowel(romaji: string): string {
  const vowels = ['a', 'i', 'u', 'e', 'o'];
  for (let i = romaji.length - 1; i >= 0; i--) {
    if (vowels.includes(romaji[i])) {
      return romaji[i];
    }
  }
  return '';
}

// ============================================================================
// Main Conversion Functions
// ============================================================================

/**
 * Convert hiragana string to romaji
 *
 * @param hiragana - String containing hiragana characters
 * @returns Romanized string
 *
 * Requirements: 1.5
 */
export function hiraganaToRomaji(hiragana: string): string {
  let result = '';
  let i = 0;

  while (i < hiragana.length) {
    // Check for small tsu (っ) - doubles the next consonant
    if (hiragana[i] === 'っ' && i + 1 < hiragana.length) {
      const nextChar = hiragana[i + 1];
      // Check for combination first
      if (i + 2 < hiragana.length) {
        const combo = hiragana.slice(i + 1, i + 3);
        if (HIRAGANA_COMBINATIONS[combo]) {
          result += HIRAGANA_COMBINATIONS[combo][0]; // Double the first consonant
          i++;
          continue;
        }
      }
      const nextRomaji = HIRAGANA_TO_ROMAJI[nextChar];
      if (nextRomaji && nextRomaji.length > 0) {
        result += nextRomaji[0]; // Double the first consonant
      }
      i++;
      continue;
    }

    // Check for two-character combinations (きゃ, しゅ, etc.)
    if (i + 1 < hiragana.length) {
      const combo = hiragana.slice(i, i + 2);
      if (HIRAGANA_COMBINATIONS[combo]) {
        result += HIRAGANA_COMBINATIONS[combo];
        i += 2;
        continue;
      }
    }

    // Single character
    const romaji = HIRAGANA_TO_ROMAJI[hiragana[i]];
    if (romaji !== undefined) {
      result += romaji;
    } else {
      // Keep non-hiragana characters as-is (kanji, etc.)
      result += hiragana[i];
    }
    i++;
  }

  return result;
}

/**
 * Convert katakana string to romaji
 *
 * @param katakana - String containing katakana characters
 * @returns Romanized string
 *
 * Requirements: 1.5
 */
export function katakanaToRomaji(katakana: string): string {
  let result = '';
  let i = 0;

  while (i < katakana.length) {
    // Check for small tsu (ッ) - doubles the next consonant
    if (katakana[i] === 'ッ' && i + 1 < katakana.length) {
      const nextChar = katakana[i + 1];
      // Check for combination first
      if (i + 2 < katakana.length) {
        const combo = katakana.slice(i + 1, i + 3);
        if (KATAKANA_COMBINATIONS[combo]) {
          result += KATAKANA_COMBINATIONS[combo][0];
          i++;
          continue;
        }
      }
      const nextRomaji = KATAKANA_TO_ROMAJI[nextChar];
      if (nextRomaji && nextRomaji.length > 0) {
        result += nextRomaji[0];
      }
      i++;
      continue;
    }

    // Check for long vowel mark (ー)
    if (katakana[i] === 'ー') {
      const lastVowel = getLastVowel(result);
      if (lastVowel) {
        result += lastVowel;
      }
      i++;
      continue;
    }

    // Check for two-character combinations
    if (i + 1 < katakana.length) {
      const combo = katakana.slice(i, i + 2);
      if (KATAKANA_COMBINATIONS[combo]) {
        result += KATAKANA_COMBINATIONS[combo];
        i += 2;
        continue;
      }
    }

    // Single character
    const romaji = KATAKANA_TO_ROMAJI[katakana[i]];
    if (romaji !== undefined) {
      result += romaji;
    } else {
      // Keep non-katakana characters as-is
      result += katakana[i];
    }
    i++;
  }

  return result;
}

/**
 * Convert any Japanese text (hiragana, katakana, or mixed) to romaji
 *
 * @param text - String containing Japanese characters
 * @returns Romanized string
 *
 * Requirements: 1.5
 */
export function toRomaji(text: string): string {
  let result = '';
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    // Handle hiragana small tsu
    if (char === 'っ' && i + 1 < text.length) {
      const nextChar = text[i + 1];
      if (i + 2 < text.length) {
        const combo = text.slice(i + 1, i + 3);
        if (HIRAGANA_COMBINATIONS[combo]) {
          result += HIRAGANA_COMBINATIONS[combo][0];
          i++;
          continue;
        }
      }
      const nextRomaji = HIRAGANA_TO_ROMAJI[nextChar];
      if (nextRomaji && nextRomaji.length > 0) {
        result += nextRomaji[0];
      }
      i++;
      continue;
    }

    // Handle katakana small tsu
    if (char === 'ッ' && i + 1 < text.length) {
      const nextChar = text[i + 1];
      if (i + 2 < text.length) {
        const combo = text.slice(i + 1, i + 3);
        if (KATAKANA_COMBINATIONS[combo]) {
          result += KATAKANA_COMBINATIONS[combo][0];
          i++;
          continue;
        }
      }
      const nextRomaji = KATAKANA_TO_ROMAJI[nextChar];
      if (nextRomaji && nextRomaji.length > 0) {
        result += nextRomaji[0];
      }
      i++;
      continue;
    }

    // Handle katakana long vowel mark
    if (char === 'ー') {
      const lastVowel = getLastVowel(result);
      if (lastVowel) {
        result += lastVowel;
      }
      i++;
      continue;
    }

    // Check for hiragana combinations
    if (isHiragana(char) && i + 1 < text.length) {
      const combo = text.slice(i, i + 2);
      if (HIRAGANA_COMBINATIONS[combo]) {
        result += HIRAGANA_COMBINATIONS[combo];
        i += 2;
        continue;
      }
    }

    // Check for katakana combinations
    if (isKatakana(char) && i + 1 < text.length) {
      const combo = text.slice(i, i + 2);
      if (KATAKANA_COMBINATIONS[combo]) {
        result += KATAKANA_COMBINATIONS[combo];
        i += 2;
        continue;
      }
    }

    // Single hiragana character
    if (isHiragana(char)) {
      const romaji = HIRAGANA_TO_ROMAJI[char];
      if (romaji !== undefined) {
        result += romaji;
      } else {
        result += char;
      }
      i++;
      continue;
    }

    // Single katakana character
    if (isKatakana(char)) {
      const romaji = KATAKANA_TO_ROMAJI[char];
      if (romaji !== undefined) {
        result += romaji;
      } else {
        result += char;
      }
      i++;
      continue;
    }

    // Non-Japanese character (kanji, punctuation, etc.)
    result += char;
    i++;
  }

  return result;
}

/**
 * Convert romaji to hiragana
 *
 * @param romaji - Romanized Japanese string
 * @returns Hiragana string
 */
export function romajiToHiragana(romaji: string): string {
  // Build reverse mapping
  const romajiToHiraganaMap: Record<string, string> = {};

  // Add single characters
  for (const [hiragana, rom] of Object.entries(HIRAGANA_TO_ROMAJI)) {
    if (rom && rom.length > 0) {
      romajiToHiraganaMap[rom] = hiragana;
    }
  }

  // Add combinations
  for (const [hiragana, rom] of Object.entries(HIRAGANA_COMBINATIONS)) {
    romajiToHiraganaMap[rom] = hiragana;
  }

  let result = '';
  let i = 0;
  const lowerRomaji = romaji.toLowerCase();

  while (i < lowerRomaji.length) {
    let matched = false;

    // Try matching longest patterns first (up to 4 characters)
    for (let len = 4; len >= 1; len--) {
      if (i + len <= lowerRomaji.length) {
        const substr = lowerRomaji.slice(i, i + len);

        // Check for double consonant (e.g., "kk" -> っk)
        if (
          len === 2 &&
          substr[0] === substr[1] &&
          'kstcnhfmyrwgzdbp'.includes(substr[0])
        ) {
          result += 'っ';
          i += 1;
          matched = true;
          break;
        }

        if (romajiToHiraganaMap[substr]) {
          result += romajiToHiraganaMap[substr];
          i += len;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      // Keep unmatched characters as-is
      result += romaji[i];
      i++;
    }
  }

  return result;
}
