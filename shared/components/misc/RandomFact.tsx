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

  factsLoadingPromise = fetch('/japan-facts.json')
    .then(res => res.json())
    .then((facts: string[]) => {
      factsCache = facts;
      factsLoadingPromise = null;
      return facts;
    });

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
    <div className='mt-3 pt-3 border-t border-[var(--border-color)]'>
      <div className='flex items-start gap-2'>
        <Lightbulb className='size-4 flex-shrink-0 text-[var(--main-color)]' />
        <p className='text-xs md:text-sm text-[var(--secondary-color)] italic'>
          {fact}
        </p>
      </div>
    </div>
  );
};

export default RandomFact;
