import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import fs from 'fs';
import path from 'path';

const TRIVIA_FILES = {
  easy: 'japan-trivia-easy.json',
  medium: 'japan-trivia-medium.json',
  hard: 'japan-trivia-hard.json',
  legacy: 'japan-trivia.json',
} as const;

type Difficulty = 'easy' | 'medium' | 'hard' | 'all';

type TriviaQuestion = {
  question: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  answers: string[];
  correctIndex: number;
};

function readJsonFile(fileName: string): TriviaQuestion[] {
  const filePath = path.join(process.cwd(), 'public', fileName);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw) as TriviaQuestion[];
  return Array.isArray(data) ? data : [];
}

const getTriviaByDifficulty = unstable_cache(
  async (difficulty: Difficulty) => {
    if (difficulty === 'all') {
      return [
        ...readJsonFile(TRIVIA_FILES.easy),
        ...readJsonFile(TRIVIA_FILES.medium),
        ...readJsonFile(TRIVIA_FILES.hard),
        ...readJsonFile(TRIVIA_FILES.legacy),
      ];
    }

    const fileName = TRIVIA_FILES[difficulty];
    return readJsonFile(fileName);
  },
  ['trivia-data'],
  { revalidate: 60 * 60 * 12 },
);

function parseNumber(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return fallback;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const difficultyParam =
    searchParams.get('difficulty')?.toLowerCase() ?? 'all';
  const difficulty = ['easy', 'medium', 'hard', 'all'].includes(difficultyParam)
    ? (difficultyParam as Difficulty)
    : 'all';

  const offset = parseNumber(searchParams.get('offset'), 0);
  const limit = parseNumber(searchParams.get('limit'), 0);

  const trivia = await getTriviaByDifficulty(difficulty);
  const sliced =
    limit > 0 ? trivia.slice(offset, offset + limit) : trivia.slice(offset);

  return NextResponse.json({
    difficulty,
    offset,
    limit: limit > 0 ? limit : null,
    total: trivia.length,
    items: sliced,
  });
}
