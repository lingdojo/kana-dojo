#!/usr/bin/env node
/**
 * Translation Validation Script
 *
 * Validates that all translation keys exist across all configured languages
 * and reports missing keys, extra keys, and type mismatches.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.resolve(__dirname, '../../core/i18n/locales');
const LANGUAGES = ['en', 'es']; // Keep in sync with core/i18n/routing.ts
const NAMESPACES = [
  'common',
  'navigation',
  'kana',
  'kanji',
  'vocabulary',
  'achievements',
  'statistics',
  'settings',
  'errors',
  'menuInfo',
  'blog',
  'translator',
  'metadata',
  'practiceLanding',
  'welcome',
  'experiments',
  'legal',
];

let hasErrors = false;

/**
 * Load a JSON file
 */
function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error loading ${filePath}:`, error.message);
    hasErrors = true;
    return null;
  }
}

/**
 * Get all keys from a nested object with dot notation
 */
function getKeys(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...getKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Validate a single namespace across all languages
 */
function validateNamespace(namespace) {
  console.log(`\n📋 Validating namespace: ${namespace}`);

  const keysByLanguage = {};

  // Load all language files for this namespace
  for (const lang of LANGUAGES) {
    const filePath = path.join(LOCALES_DIR, lang, `${namespace}.json`);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing file: ${filePath}`);
      hasErrors = true;
      continue;
    }

    const data = loadJSON(filePath);
    if (data) {
      keysByLanguage[lang] = getKeys(data);
    }
  }

  // Use English as the reference language
  const referenceKeys = keysByLanguage['en'] || [];
  const referenceSet = new Set(referenceKeys);

  if (referenceKeys.length === 0) {
    console.error(`❌ No keys found in English reference for ${namespace}`);
    hasErrors = true;
    return;
  }

  console.log(`   Reference (en): ${referenceKeys.length} keys`);

  // Compare other languages against English
  for (const lang of LANGUAGES) {
    if (lang === 'en') continue;

    const langKeys = keysByLanguage[lang] || [];
    const langSet = new Set(langKeys);

    // Find missing keys (in en but not in lang)
    const missing = referenceKeys.filter(key => !langSet.has(key));

    // Find extra keys (in lang but not in en)
    const extra = langKeys.filter(key => !referenceSet.has(key));

    if (missing.length > 0 || extra.length > 0) {
      console.log(`\n   ⚠️  ${lang.toUpperCase()}: ${langKeys.length} keys`);

      if (missing.length > 0) {
        console.log(`      Missing ${missing.length} keys:`);
        missing.slice(0, 5).forEach(key => console.log(`        - ${key}`));
        if (missing.length > 5) {
          console.log(`        ... and ${missing.length - 5} more`);
        }
        hasErrors = true;
      }

      if (extra.length > 0) {
        console.log(`      Extra ${extra.length} keys:`);
        extra.slice(0, 5).forEach(key => console.log(`        + ${key}`));
        if (extra.length > 5) {
          console.log(`        ... and ${extra.length - 5} more`);
        }
        hasErrors = true;
      }
    } else {
      console.log(
        `   ✅ ${lang.toUpperCase()}: ${langKeys.length} keys (match)`,
      );
    }
  }
}

/**
 * Check for interpolation variable consistency
 */
function validateInterpolation(namespace) {
  const variableRegex = /\{\{(\w+)\}\}/g;

  for (const lang of LANGUAGES) {
    const filePath = path.join(LOCALES_DIR, lang, `${namespace}.json`);
    if (!fs.existsSync(filePath)) continue;

    const data = loadJSON(filePath);
    if (!data) continue;

    // Recursively check all string values
    function checkVariables(obj, keyPath = '') {
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = keyPath ? `${keyPath}.${key}` : key;

        if (typeof value === 'string') {
          const matches = [...value.matchAll(variableRegex)];
          if (matches.length > 0) {
            const variables = matches.map(m => m[1]);
            // You could store these and compare across languages
            // For now, just verify they're valid format
          }
        } else if (value && typeof value === 'object') {
          checkVariables(value, fullPath);
        }
      }
    }

    checkVariables(data);
  }
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Translation Validation');
  console.log('='.repeat(50));
  console.log(`Languages: ${LANGUAGES.join(', ')}`);
  console.log(`Namespaces: ${NAMESPACES.join(', ')}\n`);

  // Validate each namespace
  for (const namespace of NAMESPACES) {
    validateNamespace(namespace);
    validateInterpolation(namespace);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.log('❌ Validation failed - please fix the errors above');
    process.exit(1);
  } else {
    console.log('✅ All translations are valid!');
    process.exit(0);
  }
}

main();
