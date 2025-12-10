import { Random } from 'random-js';

const random = new Random();

export type KanaCharacter = {
  kana: string;
  romaji: string;
  type: string;
  group: string;
};

export function generateKanaQuestion(
  selectedKana: KanaCharacter[]
): KanaCharacter {
  if (selectedKana.length === 0) {
    throw new Error('No kana selected');
  }

  const randomIndex = random.integer(0, selectedKana.length - 1);
  return selectedKana[randomIndex];
}
