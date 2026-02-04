'use client';
import { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { Random } from 'random-js';

// Module-level cache for facts - prevents refetching on every mount
let factsCache: string[] | null = null;
let factsLoadingPromise: Promise<string[]> | null = null;

const loadFacts = async (): Promise<string[]> => {
  if (factsCache) return factsCache;
  if (factsLoadingPromise) return factsLoadingPromise;

  factsLoadingPromise = (async () => {
    try {
      const response = await fetch('/api/facts');
      if (!response.ok) {
        throw new Error(`Facts request failed: ${response.status}`);
      }
      const facts = (await response.json()) as unknown;
      if (!Array.isArray(facts)) {
        throw new Error('Facts payload is not an array');
      }
      factsCache = facts;
      return facts;
    } finally {
      factsLoadingPromise = null;
    }
  })();

  return factsLoadingPromise;
};

/**
 * Component that displays a random fact about Japan or the Japanese language
 * The fact changes each time the component mounts (page reload/visit)
 * Facts are fetched from a JSON file to optimize bundle size
 */
const RandomFact = () => {
  const [fact, setFact] = useState<string>('');

  useEffect(() => {
    // Use cached facts to avoid refetching on every mount
    const fetchRandomFact = async () => {
      try {
        const facts = await loadFacts();
        if (!facts.length) return;
        const random = new Random();
        const randomIndex = random.integer(0, facts.length - 1);
        setFact(facts[randomIndex]);
      } catch (error) {
        console.error('Failed to load Japan facts:', error);
      }
    };

    fetchRandomFact();
  }, []);

  if (!fact) return null;

  return (
    <div className='mt-3 border-t border-(--border-color) pt-3'>
      <div className='flex items-start gap-2'>
        <Lightbulb className='size-4 flex-shrink-0 text-(--main-color)' />
        <p className='text-xs text-(--secondary-color) italic md:text-sm'>
          {fact}
        </p>
      </div>
    </div>
  );
};

export default RandomFact;
