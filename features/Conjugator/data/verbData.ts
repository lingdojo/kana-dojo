/**
 * Japanese Verb Classification Data
 *
 * This module contains all data needed for verb classification:
 * - Irregular verb mappings
 * - Godan verb ending transformations
 * - Ichidan verb detection rules
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import type { IrregularType, GodanConjugationMap } from '../types';

// ============================================================================
// Irregular Verb Mappings
// ============================================================================

/**
 * Mapping of irregular verbs to their classification type
 * Includes: する, 来る, ある, 行く, and honorific verbs
 */
export const IRREGULAR_VERBS: Record<string, IrregularType> = {
  // する (to do) - Requirements 2.3
  する: 'suru',
  // 来る (to come) - Requirements 2.4
  来る: 'kuru',
  くる: 'kuru',
  // ある (to exist) - Requirements 2.5
  ある: 'aru',
  // 行く (to go) - Requirements 2.6
  行く: 'iku',
  いく: 'iku',
  // Honorific verbs - Requirements 4.7
  くださる: 'honorific',
  なさる: 'honorific',
  いらっしゃる: 'honorific',
  おっしゃる: 'honorific',
  ござる: 'honorific',
};

/**
 * する-compound verb suffixes
 * Used to detect compound verbs like 勉強する
 */
export const SURU_COMPOUND_SUFFIXES = ['する'];

/**
 * 来る-compound verb suffixes
 * Used to detect compound verbs like 持ってくる
 */
export const KURU_COMPOUND_SUFFIXES = ['くる', '来る'];

// ============================================================================
// Godan Verb Endings
// ============================================================================

/**
 * Godan verb ending mappings for conjugation
 * Maps the dictionary form ending to all vowel-grade transformations
 *
 * Requirements: 2.1, 4.1-4.6
 */
export const GODAN_ENDINGS: Record<string, GodanConjugationMap> = {
  // う-ending verbs (e.g., 買う, 会う)
  う: { a: 'わ', i: 'い', e: 'え', o: 'お', te: 'って', ta: 'った' },
  // く-ending verbs (e.g., 書く, 聞く)
  く: { a: 'か', i: 'き', e: 'け', o: 'こ', te: 'いて', ta: 'いた' },
  // ぐ-ending verbs (e.g., 泳ぐ, 急ぐ)
  ぐ: { a: 'が', i: 'ぎ', e: 'げ', o: 'ご', te: 'いで', ta: 'いだ' },
  // す-ending verbs (e.g., 話す, 出す)
  す: { a: 'さ', i: 'し', e: 'せ', o: 'そ', te: 'して', ta: 'した' },
  // つ-ending verbs (e.g., 待つ, 持つ)
  つ: { a: 'た', i: 'ち', e: 'て', o: 'と', te: 'って', ta: 'った' },
  // ぬ-ending verbs (e.g., 死ぬ - the only common one)
  ぬ: { a: 'な', i: 'に', e: 'ね', o: 'の', te: 'んで', ta: 'んだ' },
  // ぶ-ending verbs (e.g., 遊ぶ, 飛ぶ)
  ぶ: { a: 'ば', i: 'び', e: 'べ', o: 'ぼ', te: 'んで', ta: 'んだ' },
  // む-ending verbs (e.g., 読む, 飲む)
  む: { a: 'ま', i: 'み', e: 'め', o: 'も', te: 'んで', ta: 'んだ' },
  // る-ending verbs (Godan, e.g., 帰る, 走る)
  る: { a: 'ら', i: 'り', e: 'れ', o: 'ろ', te: 'って', ta: 'った' },
};

/**
 * All possible Godan verb endings
 */
export const GODAN_ENDING_CHARS = Object.keys(GODAN_ENDINGS);

// ============================================================================
// Ichidan Verb Detection
// ============================================================================

/**
 * Ichidan verbs end in -iru or -eru (in hiragana: いる or える before る)
 * However, some verbs that look like Ichidan are actually Godan
 *
 * Requirements: 2.2
 */

/**
 * Characters that can precede る in Ichidan verbs
 * These are the い-row and え-row hiragana
 */
export const ICHIDAN_PRECEDING_CHARS = [
  // い-row (for -iru verbs)
  'い',
  'き',
  'し',
  'ち',
  'に',
  'ひ',
  'み',
  'り',
  'ぎ',
  'じ',
  'ぢ',
  'び',
  'ぴ',
  // え-row (for -eru verbs)
  'え',
  'け',
  'せ',
  'て',
  'ね',
  'へ',
  'め',
  'れ',
  'げ',
  'ぜ',
  'で',
  'べ',
  'ぺ',
];

/**
 * Common Godan verbs that look like Ichidan (false Ichidan)
 * These end in -iru or -eru but conjugate as Godan
 * This is a non-exhaustive list of the most common ones
 */
export const FALSE_ICHIDAN_VERBS: string[] = [
  // -iru verbs that are actually Godan
  '要る', // いる (to need)
  'いる', // いる (to need) - hiragana
  '入る', // はいる (to enter)
  'はいる',
  '走る', // はしる (to run)
  'はしる',
  '知る', // しる (to know)
  'しる',
  '切る', // きる (to cut)
  'きる',
  '帰る', // かえる (to return)
  'かえる',
  '限る', // かぎる (to limit)
  'かぎる',
  '握る', // にぎる (to grip)
  'にぎる',
  '参る', // まいる (to go/come - humble)
  'まいる',
  '散る', // ちる (to scatter)
  'ちる',
  '混じる', // まじる (to mix)
  'まじる',
  '嘲る', // あざける (to ridicule)
  '滑る', // すべる (to slip)
  'すべる',
  '蹴る', // ける (to kick)
  'ける',
  '照る', // てる (to shine)
  'てる',
  '練る', // ねる (to knead)
  'ねる',
  '減る', // へる (to decrease)
  'へる',
  // -eru verbs that are actually Godan
  '焦る', // あせる (to be in a hurry)
  'あせる',
  '喋る', // しゃべる (to chat)
  'しゃべる',
];

/**
 * Known Ichidan verbs (for disambiguation)
 * These are common verbs that are definitely Ichidan
 */
export const KNOWN_ICHIDAN_VERBS: string[] = [
  // Common -iru Ichidan verbs
  '見る', // みる (to see)
  'みる',
  '着る', // きる (to wear)
  '起きる', // おきる (to wake up)
  'おきる',
  '降りる', // おりる (to descend)
  'おりる',
  '借りる', // かりる (to borrow)
  'かりる',
  '居る', // いる (to exist - animate)
  '信じる', // しんじる (to believe)
  'しんじる',
  '感じる', // かんじる (to feel)
  'かんじる',
  '落ちる', // おちる (to fall)
  'おちる',
  '過ぎる', // すぎる (to pass)
  'すぎる',
  '生きる', // いきる (to live)
  'いきる',
  '浴びる', // あびる (to bathe)
  'あびる',
  // Common -eru Ichidan verbs
  '食べる', // たべる (to eat)
  'たべる',
  '寝る', // ねる (to sleep)
  '出る', // でる (to exit)
  'でる',
  '開ける', // あける (to open)
  'あける',
  '閉める', // しめる (to close)
  'しめる',
  '教える', // おしえる (to teach)
  'おしえる',
  '覚える', // おぼえる (to remember)
  'おぼえる',
  '答える', // こたえる (to answer)
  'こたえる',
  '考える', // かんがえる (to think)
  'かんがえる',
  '変える', // かえる (to change)
  '始める', // はじめる (to begin)
  'はじめる',
  '止める', // とめる (to stop)
  'とめる',
  '集める', // あつめる (to collect)
  'あつめる',
  '調べる', // しらべる (to investigate)
  'しらべる',
  '比べる', // くらべる (to compare)
  'くらべる',
];

// ============================================================================
// Romaji Conversion Data
// ============================================================================

/**
 * Hiragana to Romaji mapping
 */
export const HIRAGANA_TO_ROMAJI: Record<string, string> = {
  // Basic vowels
  あ: 'a',
  い: 'i',
  う: 'u',
  え: 'e',
  お: 'o',
  // K-row
  か: 'ka',
  き: 'ki',
  く: 'ku',
  け: 'ke',
  こ: 'ko',
  // S-row
  さ: 'sa',
  し: 'shi',
  す: 'su',
  せ: 'se',
  そ: 'so',
  // T-row
  た: 'ta',
  ち: 'chi',
  つ: 'tsu',
  て: 'te',
  と: 'to',
  // N-row
  な: 'na',
  に: 'ni',
  ぬ: 'nu',
  ね: 'ne',
  の: 'no',
  // H-row
  は: 'ha',
  ひ: 'hi',
  ふ: 'fu',
  へ: 'he',
  ほ: 'ho',
  // M-row
  ま: 'ma',
  み: 'mi',
  む: 'mu',
  め: 'me',
  も: 'mo',
  // Y-row
  や: 'ya',
  ゆ: 'yu',
  よ: 'yo',
  // R-row
  ら: 'ra',
  り: 'ri',
  る: 'ru',
  れ: 're',
  ろ: 'ro',
  // W-row
  わ: 'wa',
  を: 'wo',
  // N
  ん: 'n',
  // Dakuten (voiced)
  が: 'ga',
  ぎ: 'gi',
  ぐ: 'gu',
  げ: 'ge',
  ご: 'go',
  ざ: 'za',
  じ: 'ji',
  ず: 'zu',
  ぜ: 'ze',
  ぞ: 'zo',
  だ: 'da',
  ぢ: 'ji',
  づ: 'zu',
  で: 'de',
  ど: 'do',
  ば: 'ba',
  び: 'bi',
  ぶ: 'bu',
  べ: 'be',
  ぼ: 'bo',
  // Handakuten (p-sounds)
  ぱ: 'pa',
  ぴ: 'pi',
  ぷ: 'pu',
  ぺ: 'pe',
  ぽ: 'po',
  // Small characters
  ゃ: 'ya',
  ゅ: 'yu',
  ょ: 'yo',
  っ: '', // Double consonant (handled specially)
  ぁ: 'a',
  ぃ: 'i',
  ぅ: 'u',
  ぇ: 'e',
  ぉ: 'o',
};

/**
 * Combination characters (きゃ, しゅ, etc.)
 */
export const HIRAGANA_COMBINATIONS: Record<string, string> = {
  きゃ: 'kya',
  きゅ: 'kyu',
  きょ: 'kyo',
  しゃ: 'sha',
  しゅ: 'shu',
  しょ: 'sho',
  ちゃ: 'cha',
  ちゅ: 'chu',
  ちょ: 'cho',
  にゃ: 'nya',
  にゅ: 'nyu',
  にょ: 'nyo',
  ひゃ: 'hya',
  ひゅ: 'hyu',
  ひょ: 'hyo',
  みゃ: 'mya',
  みゅ: 'myu',
  みょ: 'myo',
  りゃ: 'rya',
  りゅ: 'ryu',
  りょ: 'ryo',
  ぎゃ: 'gya',
  ぎゅ: 'gyu',
  ぎょ: 'gyo',
  じゃ: 'ja',
  じゅ: 'ju',
  じょ: 'jo',
  びゃ: 'bya',
  びゅ: 'byu',
  びょ: 'byo',
  ぴゃ: 'pya',
  ぴゅ: 'pyu',
  ぴょ: 'pyo',
};
