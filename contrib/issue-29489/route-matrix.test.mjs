// Run after applying contrib/issue-29489/apply_fix.py to a KanaDojo checkout.
// Dependency-free route regression checks; execute with:
//   node --test contrib/issue-29489/route-matrix.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const sourceFile = process.env.KANADOJO_CLIENT_LAYOUT || resolve(here, '../../app/ClientLayout.tsx');
const source = readFileSync(sourceFile, 'utf8');
const marker = 'const isTrainingRoute = (path: string) =>';
const start = source.indexOf(marker);
assert.ok(start >= 0, 'ClientLayout route recognition function not found');
const declaration = source.slice(start + marker.length, start + marker.length + 250);
const match = declaration.match(/(\/\^[^\n]+\/)\.test\(path\)/);
assert.ok(match, 'Expected a simple literal route regex in ClientLayout');
const routeRegex = new RegExp(match[1].slice(1, -1));

// These guard conditions must exist in the patched ClientLayout.
test('milestone donation request is deferred', () => {
  assert.match(source, /pendingDonationUntilPracticeEndRef\.current = true;/);
});
test('deferred donation is delivered after navigation', () => {
  assert.match(source, /pendingDonationUntilPracticeEndRef\.current = false;/);
  assert.match(source, /showDonationTimer/);
});
test('after-session advertising does not overlap the donation modal', () => {
  assert.match(source, /setIsTransitionAdvertisementOpen\(false\)/);
  assert.match(source, /pendingDonationUntilPracticeEndRef\.current/);
});

const cases = readFileSync(resolve(here, 'route-scenarios.jsonl'), 'utf8')
  .split('\n').filter(Boolean).map(line => JSON.parse(line));
for (const [i, scenario] of cases.entries()) {
  test(`route matrix ${String(i+1).padStart(3, '0')}: ${scenario.path}`, () => {
    assert.equal(routeRegex.test(scenario.path), scenario.training,
      `route ${JSON.stringify(scenario.path)} incorrectly classified`);
  });
}
