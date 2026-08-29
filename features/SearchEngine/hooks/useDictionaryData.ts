import { useState, useEffect } from 'react';
import { KanjiItem, VocabItem } from '../types';

export function useDictionaryData() {
  const [kanjiData, setKanjiData] = useState<KanjiItem[]>([]);
  const [vocabData, setVocabData] = useState<VocabItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Fetch all levels in parallel
        const kanjiLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];
        const vocabLevels = ['n5', 'n4', 'n3', 'n2', 'n1', 'anime'];

        const kanjiPromises = kanjiLevels.map(level =>
          fetch(`/data-kanji/${level}.json`).then(res => res.json())
        );
        const vocabPromises = vocabLevels.map(level =>
          fetch(`/data-vocab/${level}.json`).then(res => res.json())
        );

        const kanjiResults = await Promise.all(kanjiPromises);
        const vocabResults = await Promise.all(vocabPromises);

        // Flatten the array of arrays
        setKanjiData(kanjiResults.flat());
        setVocabData(vocabResults.flat());
      } catch (error) {
        console.error('Failed to load dictionary data', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return { kanjiData, vocabData, isLoading };
}
