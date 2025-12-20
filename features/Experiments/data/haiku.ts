// Collection of famous haiku for Daily Haiku experiment
export interface Haiku {
  japanese: string[];
  romanji: string[];
  english: string[];
  author: string;
  authorJapanese: string;
}

export const haikus: Haiku[] = [
  {
    japanese: ['古池や', '蛙飛び込む', '水の音'],
    romanji: ['furuike ya', 'kawazu tobikomu', 'mizu no oto'],
    english: [
      'An old silent pond',
      'A frog jumps into the pond',
      'Splash! Silence again'
    ],
    author: 'Matsuo Bashō',
    authorJapanese: '松尾芭蕉'
  },
  {
    japanese: ['閑さや', '岩にしみ入る', '蝉の声'],
    romanji: ['shizukasa ya', 'iwa ni shimiiru', 'semi no koe'],
    english: [
      'Such stillness',
      'The cries of the cicadas',
      'Sink into the rocks'
    ],
    author: 'Matsuo Bashō',
    authorJapanese: '松尾芭蕉'
  },
  {
    japanese: ['菜の花や', '月は東に', '日は西に'],
    romanji: ['na no hana ya', 'tsuki wa higashi ni', 'hi wa nishi ni'],
    english: ['Canola flowers', 'The moon in the east', 'The sun in the west'],
    author: 'Yosa Buson',
    authorJapanese: '与謝蕪村'
  },
  {
    japanese: ['春の海', 'ひねもすのたり', 'のたりかな'],
    romanji: ['haru no umi', 'hinemosu notari', 'notari kana'],
    english: ['The spring sea', 'Rising and falling', 'All day long'],
    author: 'Yosa Buson',
    authorJapanese: '与謝蕪村'
  },
  {
    japanese: ['痩蛙', '負けるな一茶', 'これにあり'],
    romanji: ['yasegaeru', 'makeruna issa', 'kore ni ari'],
    english: ['Lean frog', "Don't give up the fight", 'Issa is here'],
    author: 'Kobayashi Issa',
    authorJapanese: '小林一茶'
  },
  {
    japanese: ['雪とけて', '村いっぱいの', '子どもかな'],
    romanji: ['yuki tokete', 'mura ippai no', 'kodomo kana'],
    english: ['Snow melting', 'The village overflows', 'With children'],
    author: 'Kobayashi Issa',
    authorJapanese: '小林一茶'
  },
  {
    japanese: ['柿くへば', '鐘が鳴るなり', '法隆寺'],
    romanji: ['kaki kueba', 'kane ga narunari', 'hōryūji'],
    english: ['I eat a persimmon', 'And the bell rings', 'At Hōryūji'],
    author: 'Masaoka Shiki',
    authorJapanese: '正岡子規'
  },
  {
    japanese: ['夏草や', '兵どもが', '夢の跡'],
    romanji: ['natsukusa ya', 'tsuwamono domo ga', 'yume no ato'],
    english: ['Summer grasses', 'All that remains', "Of warriors' dreams"],
    author: 'Matsuo Bashō',
    authorJapanese: '松尾芭蕉'
  },
  {
    japanese: ['荒海や', '佐渡によこたふ', '天の川'],
    romanji: ['araumi ya', 'sado ni yokotau', 'amanogawa'],
    english: ['Rough sea', 'Stretching to Sado', 'The Milky Way'],
    author: 'Matsuo Bashō',
    authorJapanese: '松尾芭蕉'
  },
  {
    japanese: ['五月雨を', 'あつめて早し', '最上川'],
    romanji: ['samidare wo', 'atsumete hayashi', 'mogamigawa'],
    english: [
      'Gathering the rains',
      'Of May, how swift it is',
      'The Mogami River'
    ],
    author: 'Matsuo Bashō',
    authorJapanese: '松尾芭蕉'
  }
];

export const getDailyHaiku = (): Haiku => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return haikus[dayOfYear % haikus.length];
};

export const getRandomHaiku = (): Haiku => {
  return haikus[Math.floor(Math.random() * haikus.length)];
};
