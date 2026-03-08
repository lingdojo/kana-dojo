import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(
  root,
  'public',
  'sounds',
  'monkeytype-pack',
  'manifest.json',
);
const outPath = path.join(
  root,
  'features',
  'Preferences',
  'data',
  'audio',
  'clickSounds.ts',
);

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const ids = manifest.sounds.map(s => s.slug);

const lines = [];
lines.push('export type ClickSoundId =');
ids.forEach(id => lines.push(`  | '${id}'`));
lines.push('');
lines.push('export interface ClickSoundOption {');
lines.push('  id: ClickSoundId;');
lines.push('  label: string;');
lines.push('  monkeytypeId: string | null;');
lines.push("  sourceType: 'file' | 'synthetic-generated';");
lines.push('  variants: string[];');
lines.push('}');
lines.push('');
lines.push("export const DEFAULT_CLICK_SOUND_ID: ClickSoundId = 'nk-creams';");
lines.push('');
lines.push('export const CLICK_SOUND_OPTIONS: ClickSoundOption[] = [');
for (const sound of manifest.sounds) {
  const monkeytypeId = /^x/.test(sound.id) ? 'null' : `'${sound.id}'`;
  lines.push('  {');
  lines.push(`    id: '${sound.slug}',`);
  lines.push(`    label: '${String(sound.label).replace(/'/g, "\\'")}',`);
  lines.push(`    monkeytypeId: ${monkeytypeId},`);
  lines.push(`    sourceType: '${sound.sourceType}',`);
  lines.push('    variants: [');
  sound.variants.forEach(v => lines.push(`      '${v}',`));
  lines.push('    ],');
  lines.push('  },');
}
lines.push('];');
lines.push('');
lines.push(
  'export const CLICK_SOUND_OPTIONS_BY_ID: Record<ClickSoundId, ClickSoundOption> =',
);
lines.push('  CLICK_SOUND_OPTIONS.reduce((acc, option) => {');
lines.push('    acc[option.id] = option;');
lines.push('    return acc;');
lines.push('  }, {} as Record<ClickSoundId, ClickSoundOption>);');
lines.push('');
lines.push('export function getClickSoundVariantBaseUrls(id: ClickSoundId): string[] {');
lines.push('  const option = CLICK_SOUND_OPTIONS_BY_ID[id];');
lines.push('  if (!option) return [];');
lines.push(
  "  return option.variants.map(variant => `/sounds/monkeytype-pack/${option.id}/${variant}`);",
);
lines.push('}');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${lines.join('\n')}\n`);
console.warn('Updated clickSounds.ts from manifest');
