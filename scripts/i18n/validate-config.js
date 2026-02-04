#!/usr/bin/env node
/**
 * Validate i18n config drift between routing/request and validation scripts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const routingPath = path.join(projectRoot, 'core/i18n/routing.ts');
const requestPath = path.join(projectRoot, 'core/i18n/request.ts');
const validatorPath = path.join(
  projectRoot,
  'scripts/i18n/validate-translations.js',
);

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseArrayLiteral(source, label) {
  const arrayMatch = source.match(
    new RegExp(`${label}\\s*:\\s*\\[([^\\]]*)\\]`, 'm'),
  );
  if (!arrayMatch) return null;
  const raw = arrayMatch[1];
  const values = raw
    .split(',')
    .map(value => value.trim().replace(/^['"`]|['"`]$/g, ''))
    .filter(Boolean);
  return values;
}

function parseConstArray(source, constName) {
  const match = source.match(
    new RegExp(`const\\s+${constName}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s`, 'm'),
  );
  if (!match) return null;
  const raw = match[1];
  return raw
    .split(',')
    .map(value => value.trim().replace(/^['"`]|['"`]$/g, ''))
    .filter(Boolean);
}

function parseValidatorArray(source, constName) {
  const match = source.match(
    new RegExp(`const\\s+${constName}\\s*=\\s*\\[([^\\]]*)\\]`, 'm'),
  );
  if (!match) return null;
  const raw = match[1];
  return raw
    .split(',')
    .map(value => value.trim().replace(/^['"`]|['"`]$/g, ''))
    .filter(Boolean);
}

function arraysEqual(a, b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function main() {
  const routingSource = readFile(routingPath);
  const requestSource = readFile(requestPath);
  const validatorSource = readFile(validatorPath);

  const routingLocales = parseArrayLiteral(routingSource, 'locales');
  const requestNamespaces = parseConstArray(requestSource, 'NAMESPACES');
  const validatorLanguages = parseValidatorArray(validatorSource, 'LANGUAGES');
  const validatorNamespaces = parseValidatorArray(validatorSource, 'NAMESPACES');

  if (!routingLocales || routingLocales.length === 0) {
    fail('Could not parse locales from core/i18n/routing.ts');
  }

  if (!requestNamespaces || requestNamespaces.length === 0) {
    fail('Could not parse namespaces from core/i18n/request.ts');
  }

  if (!validatorLanguages || validatorLanguages.length === 0) {
    fail('Could not parse LANGUAGES from validate-translations.js');
  }

  if (!validatorNamespaces || validatorNamespaces.length === 0) {
    fail('Could not parse NAMESPACES from validate-translations.js');
  }

  if (!arraysEqual(routingLocales, validatorLanguages)) {
    fail(
      `Locale mismatch. routing.ts: [${routingLocales.join(
        ', ',
      )}] vs validate-translations.js: [${validatorLanguages.join(', ')}]`,
    );
  }

  if (!arraysEqual(requestNamespaces, validatorNamespaces)) {
    fail(
      `Namespace mismatch. request.ts: [${requestNamespaces.join(
        ', ',
      )}] vs validate-translations.js: [${validatorNamespaces.join(', ')}]`,
    );
  }

  console.log('✅ i18n config validation passed');
}

main();
