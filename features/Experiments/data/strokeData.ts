export interface StrokeData {
  kana: string;
  romanji: string;
  paths: string[];
}

export const strokeDatabase: Record<string, StrokeData> = {
  'あ': {
    kana: 'あ',
    romanji: 'a',
    paths: [
      // Stroke 1
      'M 22,30 C 38,27 63,27 82,30',
      // Stroke 2
      'M 44,12 C 44,22 43,42 41,58 C 40,70 40,81 47,86',
      // Stroke 3
      'M 27,48 C 24,50 20,66 29,76 C 40,88 71,86 84,56 C 90,39 76,34 60,44 C 45,56 49,73 58,82 C 62,86 69,84 73,76'
    ]
  },
  'い': {
    kana: 'い',
    romanji: 'i',
    paths: [
      'M 32,22 C 30,40 25,65 18,78 C 15,82 25,85 30,75',
      'M 68,25 C 72,40 72,55 65,68 C 60,75 55,70 60,60'
    ]
  }
};