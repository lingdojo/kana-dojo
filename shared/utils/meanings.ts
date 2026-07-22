export function removeVerbDuplicates(meanings: string[]): string[] {
  const set = new Set(meanings);
  return meanings.filter(m => {
    const match = m.match(/^to\s+(.+)/i);
    return !match || !set.has(match[1]);
  });
}
