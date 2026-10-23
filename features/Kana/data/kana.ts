export interface KanaGroup {
  kana: string[];
  romaji: string[];
  altRomaji?: string[][];
  groupName: string;
}

export const kana: KanaGroup[] = [
  {
    kana: ['あ', 'い', 'う', 'え', 'お'],
    romaji: ['a', 'i', 'u', 'e', 'o'],
    groupName: 'h.b.a',
  },
  {
    kana: ['か', 'き', 'く', 'け', 'こ'],
    romaji: ['ka', 'ki', 'ku', 'ke', 'ko'],
    groupName: 'h.b.k',
  },
  {
    kana: ['さ', 'し', 'す', 'せ', 'そ'],
    romaji: ['sa', 'shi', 'su', 'se', 'so'],
    altRomaji: [[], ['si'], [], [], []],
    groupName: 'h.b.s',
  },
  {
    kana: ['た', 'ち', 'つ', 'て', 'と'],
    romaji: ['ta', 'chi', 'tsu', 'te', 'to'],
    altRomaji: [[], ['ti'], ['tu'], [], []],
    groupName: 'h.b.t',
  },
  {
    kana: ['な', 'に', 'ぬ', 'ね', 'の'],
    romaji: ['na', 'ni', 'nu', 'ne', 'no'],
    groupName: 'h.b.n',
  },
  {
    kana: ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    romaji: ['ha', 'hi', 'fu', 'he', 'ho'],
    altRomaji: [[], [], ['hu'], [], []],
    groupName: 'h.b.h',
  },
  {
    kana: ['ま', 'み', 'む', 'め', 'も'],
    romaji: ['ma', 'mi', 'mu', 'me', 'mo'],
    groupName: 'h.b.m',
  },
  {
    kana: ['や', 'ゆ', 'よ'],
    romaji: ['ya', 'yu', 'yo'],
    groupName: 'h.b.y',
  },
  {
    kana: ['ら', 'り', 'る', 'れ', 'ろ'],
    romaji: ['ra', 'ri', 'ru', 're', 'ro'],
    groupName: 'h.b.r',
  },
  {
    kana: ['わ', 'を', 'ん'],
    romaji: ['wa', 'wo', 'n'],
    altRomaji: [[], [], ['nn']],
    groupName: 'h.b.w',
  },
  {
    kana: ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
    romaji: ['ga', 'gi', 'gu', 'ge', 'go'],
    groupName: 'h.d.g',
  },
  {
    kana: ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
    romaji: ['za', 'ji', 'zu', 'ze', 'zo'],
    groupName: 'h.d.z',
  },
  {
    kana: ['だ', 'ぢ', 'づ', 'で', 'ど'],
    romaji: ['da', 'ji', 'zu', 'de', 'do'],
    altRomaji: [[], ['di'], ['du'], [], []],
    groupName: 'h.d.d',
  },
  {
    kana: ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
    romaji: ['ba', 'bi', 'bu', 'be', 'bo'],
    groupName: 'h.d.b',
  },
  {
    kana: ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
    romaji: ['pa', 'pi', 'pu', 'pe', 'po'],
    groupName: 'h.d.p',
  },
  {
    kana: ['きゃ', 'きゅ', 'きょ'],
    romaji: ['kya', 'kyu', 'kyo'],
    groupName: 'h.y.ky',
  },
  {
    kana: ['ぎゃ', 'ぎゅ', 'ぎょ'],
    romaji: ['gya', 'gyu', 'gyo'],
    groupName: 'h.y.gy',
  },
  {
    kana: ['しゃ', 'しゅ', 'しょ'],
    romaji: ['sha', 'shu', 'sho'],
    groupName: 'h.y.shy',
  },
  {
    kana: ['じゃ', 'じゅ', 'じょ'],
    romaji: ['ja', 'ju', 'jo'],
    groupName: 'h.y.jy',
  },
  {
    kana: ['ちゃ', 'ちゅ', 'ちょ'],
    romaji: ['cha', 'chu', 'cho'],
    groupName: 'h.y.chy',
  },
  {
    kana: ['にゃ', 'にゅ', 'にょ'],
    romaji: ['nya', 'nyu', 'nyo'],
    groupName: 'h.y.ny',
  },
  {
    kana: ['みゃ', 'みゅ', 'みょ'],
    romaji: ['mya', 'myu', 'myo'],
    groupName: 'h.y.my',
  },
  {
    kana: ['りゃ', 'りゅ', 'りょ'],
    romaji: ['rya', 'ryu', 'ryo'],
    groupName: 'h.y.ry',
  },
  {
    kana: ['ひゃ', 'ひゅ', 'ひょ'],
    romaji: ['hya', 'hyu', 'hyo'],
    groupName: 'h.y.hy',
  },
  {
    kana: ['びゃ', 'びゅ', 'びょ'],
    romaji: ['bya', 'byu', 'byo'],
    groupName: 'h.y.by',
  },
  {
    kana: ['ぴゃ', 'ぴゅ', 'ぴょ'],
    romaji: ['pya', 'pyu', 'pyo'],
    groupName: 'h.y.py',
  },
  {
    kana: ['ア', 'イ', 'ウ', 'エ', 'オ'],
    romaji: ['a', 'i', 'u', 'e', 'o'],
    groupName: 'k.b.a',
  },
  {
    kana: ['カ', 'キ', 'ク', 'ケ', 'コ'],
    romaji: ['ka', 'ki', 'ku', 'ke', 'ko'],
    groupName: 'k.b.k',
  },
  {
    kana: ['サ', 'シ', 'ス', 'セ', 'ソ'],
    romaji: ['sa', 'shi', 'su', 'se', 'so'],
    altRomaji: [[], ['si'], [], [], []],
    groupName: 'k.b.s',
  },
  {
    kana: ['タ', 'チ', 'ツ', 'テ', 'ト'],
    romaji: ['ta', 'chi', 'tsu', 'te', 'to'],
    altRomaji: [[], ['ti'], ['tu'], [], []],
    groupName: 'k.b.t',
  },
  {
    kana: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
    romaji: ['na', 'ni', 'nu', 'ne', 'no'],
    groupName: 'k.b.n',
  },
  {
    kana: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
    romaji: ['ha', 'hi', 'fu', 'he', 'ho'],
    altRomaji: [[], [], ['hu'], [], []],
    groupName: 'k.b.h',
  },
  {
    kana: ['マ', 'ミ', 'ム', 'メ', 'モ'],
    romaji: ['ma', 'mi', 'mu', 'me', 'mo'],
    groupName: 'k.b.m',
  },
  {
    kana: ['ヤ', 'ユ', 'ヨ'],
    romaji: ['ya', 'yu', 'yo'],
    groupName: 'k.b.y',
  },
  {
    kana: ['ラ', 'リ', 'ル', 'レ', 'ロ'],
    romaji: ['ra', 'ri', 'ru', 're', 'ro'],
    groupName: 'k.b.r',
  },
  {
    kana: ['ワ', 'ヲ', 'ン'],
    romaji: ['wa', 'wo', 'n'],
    altRomaji: [[], [], ['nn']],
    groupName: 'k.b.w',
  },
  {
    kana: ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'],
    romaji: ['ga', 'gi', 'gu', 'ge', 'go'],
    groupName: 'k.d.g',
  },
  {
    kana: ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'],
    romaji: ['za', 'ji', 'zu', 'ze', 'zo'],
    groupName: 'k.d.z',
  },
  {
    kana: ['ダ', 'ヂ', 'ヅ', 'デ', 'ド'],
    romaji: ['da', 'ji', 'zu', 'de', 'do'],
    altRomaji: [[], ['di'], ['du'], [], []],
    groupName: 'k.d.d',
  },
  {
    kana: ['バ', 'ビ', 'ブ', 'ベ', 'ボ'],
    romaji: ['ba', 'bi', 'bu', 'be', 'bo'],
    groupName: 'k.d.b',
  },
  {
    kana: ['パ', 'ピ', 'プ', 'ペ', 'ポ'],
    romaji: ['pa', 'pi', 'pu', 'pe', 'po'],
    groupName: 'k.d.p',
  },
  {
    kana: ['キャ', 'キュ', 'キョ'],
    romaji: ['kya', 'kyu', 'kyo'],
    groupName: 'k.y.ky',
  },
  {
    kana: ['ギャ', 'ギュ', 'ギョ'],
    romaji: ['gya', 'gyu', 'gyo'],
    groupName: 'k.y.gy',
  },
  {
    kana: ['シャ', 'シュ', 'ショ'],
    romaji: ['sha', 'shu', 'sho'],
    groupName: 'k.y.shy',
  },
  {
    kana: ['ジャ', 'ジュ', 'ジョ'],
    romaji: ['ja', 'ju', 'jo'],
    groupName: 'k.y.jy',
  },
  {
    kana: ['チャ', 'チュ', 'チョ'],
    romaji: ['cha', 'chu', 'cho'],
    groupName: 'k.y.chy',
  },
  {
    kana: ['ニャ', 'ニュ', 'ニョ'],
    romaji: ['nya', 'nyu', 'nyo'],
    groupName: 'k.y.ny',
  },
  {
    kana: ['ミャ', 'ミュ', 'ミョ'],
    romaji: ['mya', 'myu', 'myo'],
    groupName: 'k.y.my',
  },
  {
    kana: ['リャ', 'リュ', 'リョ'],
    romaji: ['rya', 'ryu', 'ryo'],
    groupName: 'k.y.ry',
  },
  {
    kana: ['ヒャ', 'ヒュ', 'ヒョ'],
    romaji: ['hya', 'hyu', 'hyo'],
    groupName: 'k.y.hy',
  },
  {
    kana: ['ビャ', 'ビュ', 'ビョ'],
    romaji: ['bya', 'byu', 'byo'],
    groupName: 'k.y.by',
  },
  {
    kana: ['ピャ', 'ピュ', 'ピョ'],
    romaji: ['pya', 'pyu', 'pyo'],
    groupName: 'k.y.py',
  },
  {
    romaji: ['fa', 'fi', 'fe', 'fo', 'fyu'],
    kana: ['ファ', 'フィ', 'フェ', 'フォ', 'フュ'],
    groupName: 'k.f.f',
  },
  {
    romaji: ['wi', 'we', 'wo'],
    kana: ['ウィ', 'ウェ', 'ウォ'],
    groupName: 'k.f.w',
  },
  {
    romaji: ['va', 'vi', 'vu', 've', 'vo'],
    kana: ['ヴァ', 'ヴィ', 'ヴ', 'ヴェ', 'ヴォ'],
    groupName: 'k.f.v',
  },
  {
    romaji: ['ti', 'tu'],
    kana: ['ティ', 'トゥ'],
    groupName: 'k.f.t',
  },
  {
    romaji: ['di', 'du'],
    kana: ['ディ', 'ドゥ'],
    groupName: 'k.f.d',
  },
  {
    romaji: ['she', 'si'],
    kana: ['シェ', 'スィ'],
    groupName: 'k.f.s',
  },
  {
    romaji: ['che', 'je'],
    kana: ['チェ', 'ジェ'],
    groupName: 'k.f.c',
  },
  {
    romaji: ['tsa', 'tsi', 'tse', 'tso'],
    kana: ['ツァ', 'ツィ', 'ツェ', 'ツォ'],
    groupName: 'k.f.ts',
  },
  {
    kana: ['さ', 'ち', 'き'],
    romaji: ['sa', 'chi', 'ki'],
    groupName: 'challenge.similar.sachiki',
  },
  {
    kana: ['れ', 'ね', 'わ'],
    romaji: ['re', 'ne', 'wa'],
    groupName: 'challenge.similar.newa',
  },
  {
    kana: ['る', 'ろ'],
    romaji: ['ru', 'ro'],
    groupName: 'challenge.similar.ruro',
  },
  {
    kana: ['ぬ', 'め'],
    romaji: ['nu', 'me'],
    groupName: 'challenge.similar.nume',
  },
  {
    kana: ['は', 'ほ'],
    romaji: ['ha', 'ho'],
    groupName: 'challenge.similar.haho',
  },
  {
    kana: ['ソ', 'ン', 'シ', 'ツ'],
    romaji: ['so', 'n', 'shi', 'tsu'],
    groupName: 'challenge.katakana.sonshitsu',
  },
  {
    kana: ['ク', 'ワ', 'ウ', 'ラ'],
    romaji: ['ku', 'wa', 'u', 'ra'],
    groupName: 'challenge.katakana.kuwaura',
  },
  {
    kana: ['ク', 'ケ', 'タ'],
    romaji: ['ku', 'ke', 'ta'],
    groupName: 'challenge.katakana.kuketa',
  },
  {
    // タ (ta) vs テ (te) — commonly confused by beginners (see issue #24283)
    kana: ['タ', 'テ'],
    romaji: ['ta', 'te'],
    groupName: 'challenge.katakana.tate',
  },
];
