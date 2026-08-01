'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Book, JapaneseYen, Loader2 } from 'lucide-react';
import { toRomaji } from 'wanakana';
import { useDictionaryData } from '../hooks/useDictionaryData';
import { searchKanji, searchVocab } from '../lib/dictionarySearch';

export function DictionarySearch() {
  const { kanjiData, vocabData, isLoading } = useDictionaryData();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the query to prevent lag on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Perform search
  const { kanjiResults, vocabResults } = useMemo(() => {
    if (!debouncedQuery) return { kanjiResults: [], vocabResults: [] };
    
    // We limit results to 50 for performance
    const kResults = searchKanji(debouncedQuery, kanjiData).slice(0, 50);
    const vResults = searchVocab(debouncedQuery, vocabData, toRomaji).slice(0, 50);

    return { kanjiResults: kResults, vocabResults: vResults };
  }, [debouncedQuery, kanjiData, vocabData]);

  const hasSearched = debouncedQuery.length > 0;
  const noResults = hasSearched && kanjiResults.length === 0 && vocabResults.length === 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Search Header */}
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-2 shadow-lg shadow-blue-500/20">
          <Book className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-center bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          Dictionary Search
        </h1>
        <p className="text-muted-foreground text-center max-w-md">
          Search across thousands of Kanji and Vocabulary words using English, Romaji, or Kana.
        </p>

        {/* Search Bar */}
        <div className="relative w-full max-w-2xl mt-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary/50 border-2 border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none text-lg shadow-sm placeholder:text-muted-foreground/60"
            placeholder={isLoading ? "Loading dictionary data..." : "Try 'apple', 'tsuki', or '日'..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="pt-8">
        {noResults && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-xl font-medium">No results found for "{debouncedQuery}"</p>
            <p className="text-sm mt-2">Try searching by English meaning or Romaji.</p>
          </div>
        )}

        {!hasSearched && !isLoading && (
          <div className="text-center py-20 text-muted-foreground/40 flex flex-col items-center">
            <Search className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">Enter a search term above to begin</p>
          </div>
        )}

        {hasSearched && kanjiResults.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full mr-3 shadow-md shadow-orange-500/20">Kanji</span>
              Found {kanjiResults.length} {kanjiResults.length === 50 ? '+' : ''}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kanjiResults.map((result) => (
                <div key={result.item.id} className="group bg-card border rounded-2xl p-5 hover:shadow-xl hover:border-orange-500/50 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <span className="text-6xl font-black text-foreground drop-shadow-sm group-hover:scale-110 transition-transform origin-left">
                      {result.item.kanjiChar}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                      Score: {Math.round(result.score)}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {result.item.onyomi.length > 0 && (
                      <p className="text-sm"><span className="font-semibold text-orange-500/80 mr-2">ON</span> {result.item.onyomi.join(', ')}</p>
                    )}
                    {result.item.kunyomi.length > 0 && (
                      <p className="text-sm"><span className="font-semibold text-blue-500/80 mr-2">KUN</span> {result.item.kunyomi.join(', ')}</p>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                    {result.item.meanings.map(meaning => (
                      <span key={meaning} className="text-xs bg-secondary/80 px-2 py-1 rounded-md text-secondary-foreground font-medium">
                        {meaning}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasSearched && vocabResults.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="bg-indigo-500 text-white text-sm px-3 py-1 rounded-full mr-3 shadow-md shadow-indigo-500/20">Vocabulary</span>
              Found {vocabResults.length} {vocabResults.length === 50 ? '+' : ''}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vocabResults.map((result) => (
                <div key={result.item.jmdict_seq} className="group bg-card border rounded-2xl p-5 hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-bold mb-1 text-foreground">{result.item.kanji || result.item.kana}</h3>
                      {result.item.kanji && (
                        <p className="text-lg text-muted-foreground font-medium">{result.item.kana}</p>
                      )}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                      Score: {Math.round(result.score)}
                    </span>
                  </div>
                  <div className="mt-5 pt-4 border-t">
                    <p className="text-sm text-foreground/90 font-medium">
                      {result.item.waller_definition}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
