'use client';
import { useState } from 'react';

const hiraganaData = {
  basic: [
    ['あ', 'い', 'う', 'え', 'お'],
    ['か', 'き', 'く', 'け', 'こ'],
    ['さ', 'し', 'す', 'せ', 'そ'],
    ['た', 'ち', 'つ', 'て', 'と'],
    ['な', 'に', 'ぬ', 'ね', 'の'],
    ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    ['ま', 'み', 'む', 'め', 'も'],
    ['や', '', 'ゆ', '', 'よ'],
    ['ら', 'り', 'る', 'れ', 'ろ'],
    ['わ', '', '', '', 'を'],
    ['n', '', '', '', ''],
  ],
  romanji: [
    ['a', 'i', 'u', 'e', 'o'],
    ['ka', 'ki', 'ku', 'ke', 'ko'],
    ['sa', 'shi', 'su', 'se', 'so'],
    ['ta', 'chi', 'tsu', 'te', 'to'],
    ['na', 'ni', 'nu', 'ne', 'no'],
    ['ha', 'hi', 'fu', 'he', 'ho'],
    ['ma', 'mi', 'mu', 'me', 'mo'],
    ['ya', '', 'yu', '', 'yo'],
    ['ra', 'ri', 'ru', 're', 'ro'],
    ['wa', '', '', '', 'wo'],
    ['ん', '', '', '', ''],
  ],
};

const katakanaData = {
  basic: [
    ['ア', 'イ', 'ウ', 'エ', 'オ'],
    ['カ', 'キ', 'ク', 'ケ', 'コ'],
    ['サ', 'シ', 'ス', 'セ', 'ソ'],
    ['タ', 'チ', 'ツ', 'テ', 'ト'],
    ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
    ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
    ['マ', 'ミ', 'ム', 'メ', 'モ'],
    ['ヤ', '', 'ユ', '', 'ヨ'],
    ['ラ', 'リ', 'ル', 'レ', 'ロ'],
    ['ワ', '', '', '', 'ヲ'],
    ['n', '', '', '', ''],
  ],
  romanji: [
    ['a', 'i', 'u', 'e', 'o'],
    ['ka', 'ki', 'ku', 'ke', 'ko'],
    ['sa', 'shi', 'su', 'se', 'so'],
    ['ta', 'chi', 'tsu', 'te', 'to'],
    ['na', 'ni', 'nu', 'ne', 'no'],
    ['ha', 'hi', 'fu', 'he', 'ho'],
    ['ma', 'mi', 'mu', 'me', 'mo'],
    ['ya', '', 'yu', '', 'yo'],
    ['ra', 'ri', 'ru', 're', 'ro'],
    ['wa', '', '', '', 'wo'],
    ['ン', '', '', '', ''],
  ],
};

export default function KanaChartDisplay() {
  const [activeTab, setActiveTab] = useState<'hiragana' | 'katakana'>(
    'hiragana',
  );

  const currentData = activeTab === 'hiragana' ? hiraganaData : katakanaData;

  return (
    <div>
      {/* Tab Selector */}
      <div className='mb-6 flex justify-center gap-4'>
        <button
          onClick={() => setActiveTab('hiragana')}
          className={`rounded-lg px-6 py-3 text-lg font-semibold transition-all ${
            activeTab === 'hiragana'
              ? 'bg-(--main-color) text-(--background-color)'
              : 'border-2 border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:border-(--main-color)'
          }`}
        >
          Hiragana (ひらがな)
        </button>
        <button
          onClick={() => setActiveTab('katakana')}
          className={`rounded-lg px-6 py-3 text-lg font-semibold transition-all ${
            activeTab === 'katakana'
              ? 'bg-(--main-color) text-(--background-color)'
              : 'border-2 border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:border-(--main-color)'
          }`}
        >
          Katakana (カタカナ)
        </button>
      </div>

      {/* Kana Chart */}
      <div className='overflow-x-auto'>
        <table className='mx-auto w-full max-w-4xl border-2 border-(--border-color)'>
          <thead>
            <tr className='bg-(--card-color)'>
              <th className='border border-(--border-color) px-4 py-2 text-(--secondary-color)'>
                a
              </th>
              <th className='border border-(--border-color) px-4 py-2 text-(--secondary-color)'>
                i
              </th>
              <th className='border border-(--border-color) px-4 py-2 text-(--secondary-color)'>
                u
              </th>
              <th className='border border-(--border-color) px-4 py-2 text-(--secondary-color)'>
                e
              </th>
              <th className='border border-(--border-color) px-4 py-2 text-(--secondary-color)'>
                o
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.basic.map((row, rowIndex) => (
              <tr key={rowIndex} className='hover:bg-(--card-color)'>
                {row.map((char, colIndex) => (
                  <td
                    key={colIndex}
                    className='border border-(--border-color) px-4 py-3 text-center'
                  >
                    {char ? (
                      <div>
                        <div className='text-3xl font-bold text-(--main-color)'>
                          {char}
                        </div>
                        <div className='mt-1 text-sm text-(--secondary-color)'>
                          {currentData.romanji[rowIndex][colIndex]}
                        </div>
                      </div>
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Download/Print Info */}
      <div className='mt-8 text-center'>
        <p className='text-(--secondary-color)'>
          Tip: Press{' '}
          <kbd className='rounded bg-(--card-color) px-2 py-1 text-xs'>
            Ctrl+P
          </kbd>{' '}
          or{' '}
          <kbd className='rounded bg-(--card-color) px-2 py-1 text-xs'>
            ⌘+P
          </kbd>{' '}
          to print or save this chart as PDF
        </p>
      </div>
    </div>
  );
}
