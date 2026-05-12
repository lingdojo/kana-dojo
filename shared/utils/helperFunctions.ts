type KeyStats = {
  correct: number;
  wrong: number;
};

type Data = {
  [key: string]: KeyStats;
};

type HighestCounts = {
  highestCorrectChars: string[]; // Now returns an array of keys (for ties)
  highestCorrectCharsValue: number;

  highestWrongChars: string[]; // Now returns an array of keys (for ties)
  highestWrongCharsValue: number;
};

export function findHighestCounts(data: Data): HighestCounts {
  let maxCorrectKeys: string[] = [];
  let maxCorrectValue = 2;

  let maxWrongKeys: string[] = [];
  let maxWrongValue = 2;

  for (const key in data) {
    const { correct, wrong } = data[key];

    // Check for highest correct (handles ties)
    if (correct > maxCorrectValue) {
      maxCorrectValue = correct;
      maxCorrectKeys = [key]; // Reset array with new highest key
    } else if (correct === maxCorrectValue) {
      maxCorrectKeys.push(key); // Add to array if tied
    }

    // Check for highest wrong (handles ties)
    if (wrong > maxWrongValue) {
      maxWrongValue = wrong;
      maxWrongKeys = [key]; // Reset array with new highest key
    } else if (wrong === maxWrongValue) {
      maxWrongKeys.push(key); // Add to array if tied
    }
  }

  return {
    highestCorrectChars: maxCorrectKeys,
    highestCorrectCharsValue: maxCorrectValue,

    highestWrongChars: maxWrongKeys,
    highestWrongCharsValue: maxWrongValue,
  };
}

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

// Group per range, 1-10, 20-40
export const formatLevelsAsRanges = (sets: string[]): string => {
  if (sets.length === 0) return 'None';

  // Extract numbers and sort
  const numbers = sets
    .map(set => parseInt(set.replace('Set ', '')))
    .sort((a, b) => a - b);

  const ranges: string[] = [];
  let rangeStart = numbers[0];
  let rangeEnd = numbers[0];

  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] === rangeEnd + 1) {
      // Consecutive number, extend the range
      rangeEnd = numbers[i];
    } else {
      // gap, save current range and start new one
      ranges.push(
        rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`,
      );
      rangeStart = numbers[i];
      rangeEnd = numbers[i];
    }
  }

  ranges.push(
    rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`,
  );

  return ranges.join(', ');
};
