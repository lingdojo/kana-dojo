import yaml from 'js-yaml';

export interface ParsedMdxFrontmatter {
  content: string;
  data: Record<string, unknown>;
}

const FRONTMATTER_DELIMITER = '---';
const OPENING_FRONTMATTER = /^---\r?\n/;

/**
 * Parses YAML frontmatter from the start of an MDX document.
 */
export function parseMdxFrontmatter(source: string): ParsedMdxFrontmatter {
  const normalized = source.replace(/^\uFEFF/, '');
  const opening = normalized.match(OPENING_FRONTMATTER);

  if (!opening) {
    return { data: {}, content: source };
  }

  const closingDelimiter = new RegExp(`\\r?\\n${FRONTMATTER_DELIMITER}\\r?\\n`);
  const closingMatch = closingDelimiter.exec(
    normalized.slice(opening[0].length),
  );

  if (!closingMatch) {
    return { data: {}, content: source };
  }

  const closingIndex = opening[0].length + closingMatch.index;
  const rawFrontmatter = normalized.slice(opening[0].length, closingIndex);
  const parsed = yaml.load(rawFrontmatter, { schema: yaml.JSON_SCHEMA });
  const data =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};

  return {
    data,
    content: normalized.slice(closingIndex + closingMatch[0].length),
  };
}
