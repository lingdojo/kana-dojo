import {
  Zen_Maru_Gothic,
  Rampart_One,
  Klee_One,
  DotGothic16,
  Kiwi_Maru,
  Potta_One,
  Zen_Kurenaido,
  Noto_Sans_JP
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

const zenKurenaido = Zen_Kurenaido({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
});

export const modalFonts = [
  { name: 'Zen Maru Gothic', font: zenMaruGothic },
  { name: 'Rampart One', font: rampartOne },
  { name: 'Klee One', font: kleeOne },
  { name: 'Dot Gothic 16', font: dotGothic16 },
  { name: 'Kiwi Maru', font: kiwiMaru },
  { name: 'Potta One', font: pottaOne },
  { name: 'Zen Kurenaido', font: zenKurenaido },
  { name: 'Noto Sans JP', font: notoSansJP }
];
