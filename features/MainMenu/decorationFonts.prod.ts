import {
  Zen_Maru_Gothic,
  Rampart_One,
  Klee_One,
  Hachi_Maru_Pop,
  Yuji_Mai,
  RocknRoll_One,
  Yusei_Magic,
  Mochiy_Pop_One
} from 'next/font/google';

const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const rampartOne = Rampart_One({
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



const yuseiMagic = Yusei_Magic({
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

export const decorationFonts = [
  {
    name: 'Zen Maru Gothic',
    font: zenMaruGothic
  },
  {
    name: 'Rampart One',
    font: rampartOne
  },
  {
    name: 'Klee One',
    font: kleeOne
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
    name: 'Yusei Magic',
    font: yuseiMagic
  },
  {
    name: 'Mochiy Pop One',
    font: mochiyPopOne
  }
];
