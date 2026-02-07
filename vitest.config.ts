import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import type { PluginOption } from 'vite';
const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const require = createRequire(import.meta.url);

let storybookTest: ((options: { configDir: string }) => PluginOption) | null =
  null;
let playwright: ((options: Record<string, unknown>) => PluginOption) | null =
  null;

try {
  // Loaded dynamically so TypeScript doesn't require these deps for `npm run check`.
  storybookTest = require('@storybook/addon-vitest/vitest-plugin')
    .storybookTest as (options: { configDir: string }) => PluginOption;
} catch {
  storybookTest = null;
}

try {
  playwright = require('@vitest/browser-playwright').playwright as (
    options: Record<string, unknown>,
  ) => PluginOption;
} catch {
  playwright = null;
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.test.ts', '**/*.test.tsx'],
    ...(storybookTest && playwright
      ? {
          projects: [
            {
              extends: true,
              plugins: [
                // The plugin will run tests for the stories defined in your Storybook config
                // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                storybookTest({
                  configDir: path.join(dirname, '.storybook'),
                }),
              ],
              test: {
                name: 'storybook',
                browser: {
                  enabled: true,
                  headless: true,
                  provider: playwright({}) as unknown as 'playwright',
                  instances: [
                    {
                      browser: 'chromium',
                    },
                  ],
                },
                setupFiles: ['.storybook/vitest.setup.ts'],
              },
            },
          ],
        }
      : {}),
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, '.'),
    },
  },
});
