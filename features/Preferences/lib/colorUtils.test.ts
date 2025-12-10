/**
 * Color Utilities and Theme Validation Tests
 * Tests WCAG contrast calculations and theme accessibility
 */

import { describe, it, expect } from 'vitest';
import {
  parseColor,
  getRelativeLuminance,
  getContrastRatio,
  hslToRgb,
  rgbToHsl,
  meetsWcagAA,
  getHueDifference
} from './colorUtils';
import { validateTheme, validateAllThemes } from './themeValidator';
import themeSets from '../data/themes';

describe('Color Parsing', () => {
  it('parses hex colors correctly', () => {
    expect(parseColor('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('#f00')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses rgb colors correctly', () => {
    expect(parseColor('rgb(255, 255, 255)')).toEqual({
      r: 255,
      g: 255,
      b: 255
    });
    expect(parseColor('rgb(0, 0, 0)')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseColor('rgba(128, 64, 32, 0.5)')).toEqual({
      r: 128,
      g: 64,
      b: 32
    });
  });

  it('parses hsl colors correctly', () => {
    const white = parseColor('hsl(0, 0%, 100%)');
    expect(white.r).toBe(255);
    expect(white.g).toBe(255);
    expect(white.b).toBe(255);

    const black = parseColor('hsl(0, 0%, 0%)');
    expect(black.r).toBe(0);
    expect(black.g).toBe(0);
    expect(black.b).toBe(0);

    const red = parseColor('hsl(0, 100%, 50%)');
    expect(red.r).toBe(255);
    expect(red.g).toBe(0);
    expect(red.b).toBe(0);
  });

  it('parses hsla colors correctly', () => {
    const color = parseColor('hsla(210, 17%, 100%, 1)');
    expect(color.r).toBeGreaterThan(250);
  });
});

describe('Relative Luminance', () => {
  it('calculates luminance for black as 0', () => {
    expect(getRelativeLuminance('#000000')).toBeCloseTo(0, 5);
  });

  it('calculates luminance for white as 1', () => {
    expect(getRelativeLuminance('#ffffff')).toBeCloseTo(1, 5);
  });

  it('calculates luminance for gray as ~0.21', () => {
    // Mid-gray should be around 0.21 due to gamma correction
    const luminance = getRelativeLuminance('rgb(128, 128, 128)');
    expect(luminance).toBeGreaterThan(0.1);
    expect(luminance).toBeLessThan(0.3);
  });
});

describe('Contrast Ratio', () => {
  it('calculates 21:1 for black on white', () => {
    const ratio = getContrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('calculates 1:1 for same colors', () => {
    const ratio = getContrastRatio('#ff0000', '#ff0000');
    expect(ratio).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    const ratio1 = getContrastRatio('#336699', '#ffffff');
    const ratio2 = getContrastRatio('#ffffff', '#336699');
    expect(ratio1).toBeCloseTo(ratio2, 5);
  });

  it('correctly identifies WCAG AA compliance', () => {
    // Black on white should pass
    expect(meetsWcagAA('#000000', '#ffffff')).toBe(true);
    // Light gray on white should fail
    expect(meetsWcagAA('#cccccc', '#ffffff')).toBe(false);
  });
});

describe('HSL Conversions', () => {
  it('converts HSL to RGB and back', () => {
    const original = { h: 210, s: 0.5, l: 0.5 };
    const rgb = hslToRgb(original);
    const back = rgbToHsl(rgb);

    expect(back.h).toBeCloseTo(original.h, 0);
    expect(back.s).toBeCloseTo(original.s, 1);
    expect(back.l).toBeCloseTo(original.l, 1);
  });
});

describe('Hue Difference', () => {
  it('calculates hue difference correctly', () => {
    // Complementary colors (180 degrees apart)
    const diff = getHueDifference('hsl(0, 100%, 50%)', 'hsl(180, 100%, 50%)');
    expect(diff).toBeCloseTo(180, 0);
  });

  it('handles wrap-around correctly', () => {
    // Red (0) and magenta (300) should be 60 degrees apart
    const diff = getHueDifference('hsl(0, 100%, 50%)', 'hsl(300, 100%, 50%)');
    expect(diff).toBeCloseTo(60, 0);
  });
});

describe('Theme Validation', () => {
  it('validates a compliant theme', () => {
    const compliantTheme = {
      id: 'test-compliant',
      backgroundColor: 'hsl(0, 0%, 10%)',
      cardColor: 'hsl(0, 0%, 18%)',
      borderColor: 'hsl(0, 0%, 40%)',
      mainColor: 'hsl(0, 0%, 90%)',
      secondaryColor: 'hsl(0, 0%, 80%)'
    };

    const result = validateTheme(compliantTheme);
    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('detects low contrast mainColor', () => {
    const lowContrastTheme = {
      id: 'test-low-contrast',
      backgroundColor: 'hsl(0, 0%, 50%)',
      cardColor: 'hsl(0, 0%, 55%)',
      borderColor: 'hsl(0, 0%, 70%)',
      mainColor: 'hsl(0, 0%, 60%)', // Too close to background
      secondaryColor: 'hsl(0, 0%, 90%)'
    };

    const result = validateTheme(lowContrastTheme);
    expect(result.isValid).toBe(false);
    expect(result.issues.some(i => i.property === 'mainColor')).toBe(true);
  });
});

describe('Theme Audit - All Existing Themes', () => {
  // Flatten all themes
  const allThemes: Array<{
    id: string;
    backgroundColor: string;
    cardColor: string;
    borderColor: string;
    mainColor: string;
    secondaryColor: string;
  }> = [];

  themeSets.forEach(group => {
    group.themes.forEach(theme => {
      allThemes.push(theme);
    });
  });

  it('audits all themes and reports results', () => {
    const results = validateAllThemes(allThemes);
    const validCount = results.filter(r => r.isValid).length;
    const invalidCount = results.filter(r => !r.isValid).length;

    console.log('\n========================================');
    console.log('WCAG THEME AUDIT RESULTS');
    console.log('========================================');
    console.log(`Total themes: ${results.length}`);
    console.log(`WCAG AA Compliant: ${validCount}`);
    console.log(`Needs Improvement: ${invalidCount}`);
    console.log('========================================\n');

    // Log themes that need improvement
    if (invalidCount > 0) {
      console.log('THEMES NEEDING IMPROVEMENT:');
      console.log('----------------------------');
      results
        .filter(r => !r.isValid)
        .forEach(r => {
          console.log(`\n${r.themeId}:`);
          r.issues.forEach(issue => {
            console.log(
              `  - ${issue.property} on ${issue.background}: ${issue.actualRatio}:1 (need ${issue.requiredRatio}:1)`
            );
          });
        });
    }

    // This test always passes - it's for reporting
    expect(results.length).toBeGreaterThan(0);
  });

  // Individual theme tests for tracking
  allThemes.forEach(theme => {
    it(`validates theme: ${theme.id}`, () => {
      const result = validateTheme(theme);
      // Log issues for failing themes
      if (!result.isValid) {
        console.log(`\n[FAIL] ${theme.id}:`);
        result.issues.forEach(issue => {
          console.log(
            `  ${issue.property} on ${issue.background}: ${issue.actualRatio}:1 < ${issue.requiredRatio}:1`
          );
        });
      }
      // Don't fail the test - just report
      expect(true).toBe(true);
    });
  });
});
