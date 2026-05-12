// Helpers to export/import user preferences and stats (client-side only)

import { preferencesBackup } from '@/features/Preferences';
import { progressBackup } from '@/features/Progress';

// JSON-safe type
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [k: string]: JSONValue }
  | JSONValue[];

export type BackupFile = {
  version: string;
  createdAt: string;
  theme?: Record<string, JSONValue>;
  customTheme?: Record<string, JSONValue>;
  stats?: Record<string, JSONValue>;
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function toJSONValue(v: unknown): JSONValue | undefined {
  const t = typeof v;
  if (v === null) return null;
  if (t === 'string' || t === 'number' || t === 'boolean')
    return v as JSONValue;
  if (Array.isArray(v)) {
    const arr: JSONValue[] = [];
    for (const item of v) {
      const j = toJSONValue(item);
      if (j !== undefined) arr.push(j);
    }
    return arr;
  }
  if (isPlainObject(v)) {
    const obj: { [k: string]: JSONValue } = {};
    for (const [k, val] of Object.entries(v)) {
      const j = toJSONValue(val);
      if (j !== undefined) obj[k] = j;
    }
    return obj;
  }
  // Skip functions, symbols, undefined, etc.
  return undefined;
}

// Keep only keys from current state that are non-functions and exist in source
function filterToKnownKeys<T extends object>(
  current: T,
  source: Record<string, JSONValue>,
): Partial<T> {
  const result: Record<string, JSONValue> = {};
  for (const [k, v] of Object.entries(current as Record<string, unknown>)) {
    if (typeof v === 'function') continue;
    if (k in source) result[k] = source[k];
  }
  return result as Partial<T>;
}

function getAppVersion(): string {
  type G = typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  const env = (globalThis as G).process?.env;
  return env?.NEXT_PUBLIC_APP_VERSION ?? 'dev';
}

export function createBackup(): BackupFile {
  const themeState = preferencesBackup.getPreferencesState();
  const customThemeState = preferencesBackup.getCustomThemeState();
  const statsState = progressBackup.getStatsState();

  return {
    version: getAppVersion(),
    createdAt: new Date().toISOString(),
    theme: toJSONValue(themeState) as Record<string, JSONValue>,
    customTheme: toJSONValue(customThemeState) as Record<string, JSONValue>,
    stats: toJSONValue(statsState) as Record<string, JSONValue>,
  };
}

export function applyBackup(data: BackupFile): boolean {
  try {
    if (data.theme) {
      const current = preferencesBackup.getPreferencesState();
      const picked = filterToKnownKeys(current, data.theme);
      preferencesBackup.setPreferencesState(picked);
    }
    if (data.customTheme) {
      const current = preferencesBackup.getCustomThemeState();
      const picked = filterToKnownKeys(current, data.customTheme);
      preferencesBackup.setCustomThemeState(picked);
    }
    if (data.stats) {
      const current = progressBackup.getStatsState();
      const picked = filterToKnownKeys(current, data.stats);
      progressBackup.setStatsState(picked);
    }
    return true;
  } catch (err) {
    console.error('[backup] apply failed', err);
    return false;
  }
}
