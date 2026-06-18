import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { jsonEscape } = require('./json-escape.cjs');

describe('jsonEscape', () => {
  it('returns plain ASCII unchanged', () => {
    expect(jsonEscape('hello')).toBe('hello');
  });

  it('does not over-escape single quotes', () => {
    expect(jsonEscape("it's")).toBe("it's");
  });

  it('escapes empty string so JSON.stringify round-trips', () => {
    expect(JSON.stringify(jsonEscape(''))).toBe('""');
  });

  it('escapes backslash', () => {
    expect(jsonEscape('a\\b')).toBe('a\\\\b');
  });

  it('escapes double quote', () => {
    expect(jsonEscape('say "hi"')).toBe('say \\"hi\\"');
  });

  it('escapes newline', () => {
    expect(jsonEscape('line1\nline2')).toBe('line1\\nline2');
  });

  it('escapes tab', () => {
    expect(jsonEscape('col1\tcol2')).toBe('col1\\tcol2');
  });

  it('escapes control character as \\uXXXX', () => {
    expect(jsonEscape('\x01')).toBe('\\u0001');
  });

  it('round-trips through JSON.parse', () => {
    const input = 'any string';
    expect(JSON.parse('"' + jsonEscape(input) + '"')).toBe(input);
  });
});
