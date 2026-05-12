import { describe, it, expect } from 'vitest';
import themes from './community-themes.json';

describe('community-themes.json', () => {
  it('should be a valid JSON array', () => {
    expect(Array.isArray(themes)).toBe(true);
    expect(themes.length).toBeGreaterThan(0);
  });

  it('should contain the tsukiji-morning theme', () => {
    const theme = themes.find(t => t.id === 'tsukiji-morning');
    expect(theme).toBeDefined();
  });

  it('tsukiji-morning theme should have all required color fields', () => {
    const theme = themes.find(t => t.id === 'tsukiji-morning');
    expect(theme).toHaveProperty('id', 'tsukiji-morning');
    expect(theme).toHaveProperty('backgroundColor');
    expect(theme).toHaveProperty('mainColor');
    expect(theme).toHaveProperty('secondaryColor');
  });

  it('tsukiji-morning theme should have correct color values', () => {
    const theme = themes.find(t => t.id === 'tsukiji-morning');
    expect(theme!.backgroundColor).toBe('oklch(22.0% 0.020 235.0 / 1)');
    expect(theme!.mainColor).toBe('oklch(78.0% 0.135 215.0 / 1)');
    expect(theme!.secondaryColor).toBe('oklch(85.0% 0.155 90.0 / 1)');
  });

  it('tsukiji-morning should have a unique id among themes', () => {
    const tsukijiCount = themes.filter(t => t.id === 'tsukiji-morning').length;
    expect(tsukijiCount).toBe(1);
  });
});
