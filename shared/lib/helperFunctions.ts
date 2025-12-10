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
    highestWrongCharsValue: maxWrongValue
  };
}

export function chunkArray(
  array: { name: string; start: number; end: number; id: string }[],
  chunkSize: number
) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}
