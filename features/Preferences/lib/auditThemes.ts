/**
 * Theme Accessibility Audit Script
 * Run this to validate all themes against WCAG requirements
 */

import themeSets from '../data/themes';
import {
  validateTheme,
  getValidationSummary,
  formatValidationResult
} from './themeValidator';

interface Theme {
  id: string;
  backgroundColor: string;
  cardColor: string;
  borderColor: string;
  mainColor: string;
  secondaryColor: string;
}

/**
 * Flatten all themes from theme groups
 */
function getAllThemes(): Theme[] {
  const allThemes: Theme[] = [];
  themeSets.forEach(group => {
    group.themes.forEach(theme => {
      allThemes.push(theme);
    });
  });
  return allThemes;
}

/**
 * Run full audit on all themes
 */
export function auditAllThemes() {
  const allThemes = getAllThemes();
  const results = allThemes.map(validateTheme);
  const summary = getValidationSummary(results);

  console.log('='.repeat(60));
  console.log('WCAG THEME ACCESSIBILITY AUDIT REPORT');
  console.log('='.repeat(60));
  console.log(`\nTotal themes: ${summary.total}`);
  console.log(`Valid (WCAG AA compliant): ${summary.valid}`);
  console.log(`Invalid (needs improvement): ${summary.invalid}`);
  console.log(`With warnings: ${summary.withWarnings}`);

  console.log('\n--- Issues by Type ---');
  Object.entries(summary.issuesByType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} themes`);
    });

  console.log('\n--- Failed Themes ---');
  results
    .filter(r => !r.isValid)
    .forEach(result => {
      console.log('\n' + formatValidationResult(result));
    });

  console.log('\n--- Themes with Warnings ---');
  results
    .filter(r => r.isValid && r.warnings.length > 0)
    .forEach(result => {
      console.log('\n' + formatValidationResult(result));
    });

  return { results, summary };
}

/**
 * Get list of themes that need improvement
 */
export function getThemesNeedingImprovement(): {
  themeId: string;
  issues: string[];
}[] {
  const allThemes = getAllThemes();
  const results = allThemes.map(validateTheme);

  return results
    .filter(r => !r.isValid)
    .map(r => ({
      themeId: r.themeId,
      issues: r.issues.map(
        i =>
          `${i.property} on ${i.background}: ${i.actualRatio}:1 < ${i.requiredRatio}:1`
      )
    }));
}

// Export for use in other modules
export { getAllThemes };
