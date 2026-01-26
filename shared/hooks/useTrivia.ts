import { useEffect, useMemo, useState } from 'react';

export type TriviaDifficulty = 'easy' | 'medium' | 'hard' | 'all';

export interface TriviaQuestion {
  question: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  answers: string[];
  correctIndex: number;
}

interface TriviaResponse {
  difficulty: TriviaDifficulty;
  offset: number;
  limit: number | null;
  total: number;
  items: TriviaQuestion[];
}

interface UseTriviaOptions {
  difficulty?: TriviaDifficulty;
  offset?: number;
  limit?: number;
  enabled?: boolean;
}

interface UseTriviaResult {
  data: TriviaResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTrivia(options: UseTriviaOptions = {}): UseTriviaResult {
  const { difficulty = 'all', offset = 0, limit, enabled = true } = options;
  const [data, setData] = useState<TriviaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      difficulty,
      offset: String(offset),
    });
    if (typeof limit === 'number') {
      params.set('limit', String(limit));
    }
    return params.toString();
  }, [difficulty, offset, limit]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    const loadTrivia = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/trivia?${query}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Trivia request failed (${response.status})`);
        }

        const json = (await response.json()) as TriviaResponse;
        setData(json);
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadTrivia();

    return () => controller.abort();
  }, [enabled, query, reloadKey]);

  return {
    data,
    isLoading,
    error,
    refetch: () => setReloadKey(prev => prev + 1),
  };
}
