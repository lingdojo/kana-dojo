import {
  Noto_Sans_JP,
  Zen_Maru_Gothic,
  Rampart_One,
  Zen_Kurenaido,
  Klee_One,
  DotGothic16,
  Kiwi_Maru,
  Potta_One,
  Hachi_Maru_Pop,
  Yuji_Mai,
  RocknRoll_One,
  Reggae_One,
  Stick,
  M_PLUS_Rounded_1c,
  M_PLUS_1,
  Yusei_Magic,
  Dela_Gothic_One,
  New_Tegomin,
  Kosugi_Maru,
  Hina_Mincho,
  Shippori_Mincho,
  Kaisei_Decol,
  Mochiy_Pop_One,
  Yuji_Boku,
  Kaisei_HarunoUmi,
  Sawarabi_Gothic,
  Zen_Old_Mincho,
  Sawarabi_Mincho,
  Zen_Antique,
  Kaisei_Tokumin,
  Yuji_Syuku,
  WDXL_Lubrifont_JP_N, // Commented out - causes font override error
  Murecho,
  Kaisei_Opti,
  BIZ_UDMincho,
  Shippori_Antique
} from 'next/font/google';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif']
});

const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif']
});

const rampartOne = Rampart_One({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const zenKurenaido = Zen_Kurenaido({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const kleeOne = Klee_One({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const dotGothic16 = DotGothic16({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const kiwiMaru = Kiwi_Maru({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const pottaOne = Potta_One({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const hachiMaruPop = Hachi_Maru_Pop({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const yujiMai = Yuji_Mai({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const rocknRollOne = RocknRoll_One({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const reggaeOne = Reggae_One({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const stick = Stick({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const mPlusRounded1c = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const mPlus1 = M_PLUS_1({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const yuseiMagic = Yusei_Magic({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});
const delaGothicOne = Dela_Gothic_One({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});
const newTegomin = New_Tegomin({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});
const kosugiMaru = Kosugi_Maru({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const hinaMincho = Hina_Mincho({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const shipporiMincho = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const kaiseiDecol = Kaisei_Decol({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const mochiyPopOne = Mochiy_Pop_One({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const yujiBoku = Yuji_Boku({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const kaiseiHarunoUmi = Kaisei_HarunoUmi({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const sawarabiGothic = Sawarabi_Gothic({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const zenOldMincho = Zen_Old_Mincho({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const sawarabiMincho = Sawarabi_Mincho({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const zenAntique = Zen_Antique({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const kaiseiTokumin = Kaisei_Tokumin({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const yujiSyuku = Yuji_Syuku({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const wdxlLubrifontJPN = WDXL_Lubrifont_JP_N({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const murecho = Murecho({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const kaiseiOpti = Kaisei_Opti({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const bIZUDMincho = BIZ_UDMincho({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const shipporiAntique = Shippori_Antique({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const fonts = [
  {
    name: 'Zen Maru Gothic',
    font: zenMaruGothic
  },
  {
    name: 'Noto Sans JP',
    font: notoSansJP
  },

  {
    name: 'Rampart One',
    font: rampartOne
  },
  {
    name: 'Zen Kurenaido',
    font: zenKurenaido
  },
  {
    name: 'Klee One',
    font: kleeOne
  },
  {
    name: 'Dot Gothic 16',
    font: dotGothic16
  },
  {
    name: 'Kiwi Maru',
    font: kiwiMaru
  },
  {
    name: 'Potta One',
    font: pottaOne
  },
  {
    name: 'Hachi Maru Pop',
    font: hachiMaruPop
  },
  {
    name: 'Yuji Mai',
    font: yujiMai
  },
  {
    name: 'RocknRoll One',
    font: rocknRollOne
  },
  {
    name: 'Reggae One',
    font: reggaeOne
  },
  {
    name: 'Stick',
    font: stick
  },
  {
    name: 'M PLUS Rounded 1c',
    font: mPlusRounded1c
  },
  {
    name: 'M PLUS 1',
    font: mPlus1
  },
  {
    name: 'Yusei Magic',
    font: yuseiMagic
  },
  {
    name: 'Dela Gothic One',
    font: delaGothicOne
  },
  {
    name: 'New Tegomin',
    font: newTegomin
  },
  {
    name: 'Kosugi Maru',
    font: kosugiMaru
  },
  {
    name: 'Hina Mincho',
    font: hinaMincho
  },
  {
    name: 'Shippori Mincho',
    font: shipporiMincho
  },
  {
    name: 'Kaisei Decol',
    font: kaiseiDecol
  },
  {
    name: 'Mochiy Pop One',
    font: mochiyPopOne
  },
  {
    name: 'Yuji Boku',
    font: yujiBoku
  },
  {
    name: 'Kaisei HarunoUmi',
    font: kaiseiHarunoUmi
  },
  {
    name: 'Sawarabi Gothic',
    font: sawarabiGothic
  },
  {
    name: 'Zen Old Mincho',
    font: zenOldMincho
  },
  {
    name: 'Sawarabi Mincho',
    font: sawarabiMincho
  },
  {
    name: 'Zen Antique',
    font: zenAntique
  },
  {
    name: 'Kaisei Tokumin',
    font: kaiseiTokumin
  },
  {
    name: 'Yuji Syuku',
    font: yujiSyuku
  },
  {
    name: 'WDXL Lubrifont JP N',
    font: wdxlLubrifontJPN
  },
  {
    name: 'Murecho',
    font: murecho
  },
  {
    name: 'Kaisei Opti',
    font: kaiseiOpti
  },
  {
    name: 'BIZ UDMincho',
    font: bIZUDMincho
  },
  {
    name: 'Shippori Antique',
    font: shipporiAntique
  }
];

export default fonts;