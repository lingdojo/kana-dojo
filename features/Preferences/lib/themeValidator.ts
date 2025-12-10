/**
 * Theme Validator
 * Validates themes against WCAG accessibility requirements
 */

import {
  getContrastRatio,
  getHueDifference,
  getLuminanceRatio,
  isRedHue,
  isGreenHue
} from './colorUtils';

interface Theme {
  id: string;
  backgroundColor: string;
  cardColor: string;
  borderColor: string;
  mainColor: string;
  secondaryColor: string;
}

interface ContrastIssue {
  property: string;
  background: string;
  actualRatio: number;
  requiredRatio: number;
  wcagLevel: string;
}

interface ValidationResult {
  themeId: string;
  isValid: boolean;
  issues: ContrastIssue[];
  warnings: string[];
}

// WCAG Contrast Requirements
const CONTRAST_REQUIREMENTS = {
  // Text on backgrounds - WCAG AA (4.5:1)
  TEXT_AA: 4.5,
  // Large text / UI components - WCAG AA (3:1)
  UI_AA: 3,
  // Card distinction from background
  CARD_DISTINCTION: 1.1,
  // Border on card
  BORDER_ON_CARD: 1.5,
  // Accent color luminance ratio
  ACCENT_LUMINANCE: 2,
  // Red-green safety luminance ratio
  RED_GREEN_SAFETY: 3
};

/**
 * Validate a single theme against all WCAG requirements
 */
export function validateTheme(theme: Theme): ValidationResult {
  const issues: ContrastIssue[] = [];
  const warnings: string[] = [];

  // 1. mainColor on backgroundColor (4.5:1)
  const mainOnBg = getContrastRatio(theme.mainColor, theme.backgroundColor);
  if (mainOnBg < CONTRAST_REQUIREMENTS.TEXT_AA) {
    issues.push({
      property: 'mainColor',
      background: 'backgroundColor',
      actualRatio: Math.round(mainOnBg * 100) / 100,
      requiredRatio: CONTRAST_REQUIREMENTS.TEXT_AA,
      wcagLevel: 'AA'
    });
  }

  // 2. mainColor on cardColor (4.5:1)
  const mainOnCard = getContrastRatio(theme.mainColor, theme.cardColor);
  if (mainOnCard < CONTRAST_REQUIREMENTS.TEXT_AA) {
    issues.push({
      property: 'mainColor',
      background: 'cardColor',
      actualRatio: Math.round(mainOnCard * 100) / 100,
      requiredRatio: CONTRAST_REQUIREMENTS.TEXT_AA,
      wcagLevel: 'AA'
    });
  }

  // 3. secondaryColor on backgroundColor (4.5:1)
  const secondaryOnBg = getContrastRatio(
    theme.secondaryColor,
    theme.backgroundColor
  );
  if (secondaryOnBg < CONTRAST_REQUIREMENTS.TEXT_AA) {
    issues.push({
      property: 'secondaryColor',
      background: 'backgroundColor',
      actualRatio: Math.round(secondaryOnBg * 100) / 100,
      requiredRatio: CONTRAST_REQUIREMENTS.TEXT_AA,
      wcagLevel: 'AA'
    });
  }

  // 4. secondaryColor on cardColor (4.5:1)
  const secondaryOnCard = getContrastRatio(
    theme.secondaryColor,
    theme.cardColor
  );
  if (secondaryOnCard < CONTRAST_REQUIREMENTS.TEXT_AA) {
    issues.push({
      property: 'secondaryColor',
      background: 'cardColor',
      actualRatio: Math.round(secondaryOnCard * 100) / 100,
      requiredRatio: CONTRAST_REQUIREMENTS.TEXT_AA,
      wcagLevel: 'AA'
    });
  }

  // 5. borderColor on backgroundColor (3:1)
  const borderOnBg = getContrastRatio(theme.borderColor, theme.backgroundColor);
  if (borderOnBg < CONTRAST_REQUIREMENTS.UI_AA) {
    issues.push({
      property: 'borderColor',
      background: 'backgroundColor',
      actualRatio: Math.round(borderOnBg * 100) / 100,
      requiredRatio: CONTRAST_REQUIREMENTS.UI_AA,
      wcagLevel: 'AA (UI)'
    });
  }

  // 6. borderColor on cardColor (1.5:1)
  const borderOnCard = getContrastRatio(theme.borderColor, theme.cardColor);
  if (borderOnCard < CONTRAST_REQUIREMENTS.BORDER_ON_CARD) {
    issues.push({
      property: 'borderColor',
      background: 'cardColor',
      actualRatio: Math.round(borderOnCard * 100) / 100,
      requiredRatio: CONTRAST_REQUIREMENTS.BORDER_ON_CARD,
      wcagLevel: 'UI distinction'
    });
  }

  // 7. cardColor distinction from backgroundColor (1.1:1)
  const cardOnBg = getContrastRatio(theme.cardColor, theme.backgroundColor);
  if (cardOnBg < CONTRAST_REQUIREMENTS.CARD_DISTINCTION) {
    issues.push({
      property: 'cardColor',
      background: 'backgroundColor',
      actualRatio: Math.round(cardOnBg * 100) / 100,
      requiredRatio: CONTRAST_REQUIREMENTS.CARD_DISTINCTION,
      wcagLevel: 'Visual distinction'
    });
  }

  // 8. Check accent color distinguishability
  const hueDiff = getHueDifference(theme.mainColor, theme.secondaryColor);
  const luminanceRatio = getLuminanceRatio(
    theme.mainColor,
    theme.secondaryColor
  );

  if (hueDiff < 30 && luminanceRatio < CONTRAST_REQUIREMENTS.ACCENT_LUMINANCE) {
    warnings.push(
      `mainColor and secondaryColor may be hard to distinguish (hue diff: ${Math.round(
        hueDiff
      )}°, luminance ratio: ${Math.round(luminanceRatio * 100) / 100})`
    );
  }

  // 9. Check red-green color blindness safety
  const mainIsRed = isRedHue(theme.mainColor);
  const mainIsGreen = isGreenHue(theme.mainColor);
  const secondaryIsRed = isRedHue(theme.secondaryColor);
  const secondaryIsGreen = isGreenHue(theme.secondaryColor);

  if ((mainIsRed && secondaryIsGreen) || (mainIsGreen && secondaryIsRed)) {
    if (luminanceRatio < CONTRAST_REQUIREMENTS.RED_GREEN_SAFETY) {
      warnings.push(
        `Red-green color combination may be problematic for color blind users (luminance ratio: ${
          Math.round(luminanceRatio * 100) / 100
        }, recommended: ${CONTRAST_REQUIREMENTS.RED_GREEN_SAFETY})`
      );
    }
  }

  return {
    themeId: theme.id,
    isValid: issues.length === 0,
    issues,
    warnings
  };
}

/**
 * Validate all themes and return results
 */
export function validateAllThemes(themes: Theme[]): ValidationResult[] {
  return themes.map(validateTheme);
}

/**
 * Get a summary of validation results
 */
export function getValidationSummary(results: ValidationResult[]): {
  total: number;
  valid: number;
  invalid: number;
  withWarnings: number;
  issuesByType: Record<string, number>;
} {
  const issuesByType: Record<string, number> = {};

  results.forEach(result => {
    result.issues.forEach(issue => {
      const key = `${issue.property} on ${issue.background}`;
      issuesByType[key] = (issuesByType[key] || 0) + 1;
    });
  });

  return {
    total: results.length,
    valid: results.filter(r => r.isValid).length,
    invalid: results.filter(r => !r.isValid).length,
    withWarnings: results.filter(r => r.warnings.length > 0).length,
    issuesByType
  };
}

/**
 * Format validation result as readable string
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];
  lines.push(`Theme: ${result.themeId}`);
  lines.push(`Status: ${result.isValid ? '✓ PASS' : '✗ FAIL'}`);

  if (result.issues.length > 0) {
    lines.push('Issues:');
    result.issues.forEach(issue => {
      lines.push(
        `  - ${issue.property} on ${issue.background}: ${issue.actualRatio}:1 (required: ${issue.requiredRatio}:1 ${issue.wcagLevel})`
      );
    });
  }

  if (result.warnings.length > 0) {
    lines.push('Warnings:');
    result.warnings.forEach(warning => {
      lines.push(`  ⚠ ${warning}`);
    });
  }

  return lines.join('\n');
}

export { CONTRAST_REQUIREMENTS };
