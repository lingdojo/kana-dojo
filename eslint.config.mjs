// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
let storybook = null;
try {
  storybook = (await import('eslint-plugin-storybook')).default;
} catch {
  storybook = null;
}

import importPlugin from 'eslint-plugin-import';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['.next/**/*', 'next-env.d.ts'],
  },
  {
    plugins: {
      import: importPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'import/no-restricted-paths': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      // Trailing commas are handled by Prettier, not enforced by ESLint
      'comma-dangle': 'off',

      // Layer Enforcement Rules - Hybrid Modular Architecture
      'import/no-restricted-paths': [
        'warn',
        {
          zones: [
            // Rule 1: shared/ CANNOT import from features/
            {
              target: './shared',
              from: './features/*/store',
              message:
                'shared/ layer cannot import from feature stores directly. Use facades exported from features/*/index.ts instead.',
            },
            {
              target: './shared',
              from: './features/*/data',
              message:
                'shared/ layer cannot import from feature data directly. Use facades exported from features/*/index.ts instead.',
            },
            {
              target: './shared',
              from: './features/*/lib',
              message:
                'shared/ layer cannot import from feature internal lib directly. Use facades exported from features/*/index.ts instead.',
            },
            {
              target: './shared',
              from: './widgets/**/*',
              message:
                'shared/ layer cannot import from widgets/. shared/ is a foundational layer.',
            },
            {
              target: './shared',
              from: './app/**/*',
              message:
                'shared/ layer cannot import from app/. Keep shared independent from routes/pages.',
            },

            // Rule 1b: API routes should use shared infra entrypoints, not legacy shared/lib server adapters
            {
              target: './app/api/**/*',
              from: './shared/lib/rateLimit',
              message:
                'Use shared infra entrypoints: import from shared/infra/server/rateLimit instead of shared/lib/rateLimit.',
            },
            {
              target: './app/api/**/*',
              from: './shared/lib/redis',
              message:
                'Use shared infra entrypoints: import from shared/infra/server/redis instead of shared/lib/redis.',
            },
            {
              target: './app/api/**/*',
              from: './shared/lib/apiCache',
              message:
                'Use shared infra entrypoints: import from shared/infra/client/apiCache instead of shared/lib/apiCache.',
            },
            {
              target: './app/api/**/*',
              from: './shared/lib/server/*',
              message:
                'Use shared infra entrypoints: import from shared/infra/server/* instead of shared/lib/server/*.',
            },
            {
              target: './app/**/*',
              from: './shared/lib/constants',
              message:
                'Use shared config entrypoint: import from shared/config/constants instead of shared/lib/constants.',
            },
            {
              target: './features/**/*',
              from: './shared/lib/constants',
              message:
                'Use shared config entrypoint: import from shared/config/constants instead of shared/lib/constants.',
            },
            {
              target: './widgets/**/*',
              from: './shared/lib/constants',
              message:
                'Use shared config entrypoint: import from shared/config/constants instead of shared/lib/constants.',
            },
            {
              target: './app/**/*',
              from: './shared/lib/*',
              message:
                'Legacy shared/lib imports are disallowed. Use shared/utils, shared/infra, or shared/config entrypoints.',
            },
            {
              target: './features/**/*',
              from: './shared/lib/*',
              message:
                'Legacy shared/lib imports are disallowed. Use shared/utils, shared/infra, or shared/config entrypoints.',
            },
            {
              target: './widgets/**/*',
              from: './shared/lib/*',
              message:
                'Legacy shared/lib imports are disallowed. Use shared/utils, shared/infra, or shared/config entrypoints.',
            },
            {
              target: './app/**/*',
              from: './shared/components/*',
              message:
                'Legacy shared/components imports are disallowed. Use shared/ui/components or shared/ui-composite.',
            },
            {
              target: './features/**/*',
              from: './shared/components/*',
              message:
                'Legacy shared/components imports are disallowed. Use shared/ui/components or shared/ui-composite.',
            },
            {
              target: './widgets/**/*',
              from: './shared/components/*',
              message:
                'Legacy shared/components imports are disallowed. Use shared/ui/components or shared/ui-composite.',
            },

            // Rule 2: widgets/ CANNOT import from feature stores or data
            {
              target: './widgets',
              from: './features/*/store',
              message:
                'widgets/ cannot import from feature stores directly. Use facades exported from features/*/index.ts instead.',
            },
            {
              target: './widgets',
              from: './features/*/data',
              message:
                'widgets/ cannot import from feature data directly. Use facades exported from features/*/index.ts instead.',
            },
            // Rule 3: Features CANNOT import from other features' internal directories
            {
              target: './features/!(Kana)/**/*',
              from: './features/Kana/store',
              message:
                'Cannot import from Kana internal store. Use facade from features/Kana/index.ts instead.',
            },
            {
              target: './features/!(Kana)/**/*',
              from: './features/Kana/lib',
              message:
                'Cannot import from Kana internal lib. Use public API from features/Kana/index.ts instead.',
            },
            {
              target: './features/!(Kana)/**/*',
              from: './features/Kana/data',
              message:
                'Cannot import from Kana internal data. Use facade from features/Kana/index.ts instead.',
            },

            {
              target: './features/!(Kanji)/**/*',
              from: './features/Kanji/store',
              message:
                'Cannot import from Kanji internal store. Use facade from features/Kanji/index.ts instead.',
            },
            {
              target: './features/!(Kanji)/**/*',
              from: './features/Kanji/lib',
              message:
                'Cannot import from Kanji internal lib. Use public API from features/Kanji/index.ts instead.',
            },
            {
              target: './features/!(Kanji)/**/*',
              from: './features/Kanji/data',
              message:
                'Cannot import from Kanji internal data. Use facade from features/Kanji/index.ts instead.',
            },

            {
              target: './features/!(Vocabulary)/**/*',
              from: './features/Vocabulary/store',
              message:
                'Cannot import from Vocabulary internal store. Use facade from features/Vocabulary/index.ts instead.',
            },
            {
              target: './features/!(Vocabulary)/**/*',
              from: './features/Vocabulary/lib',
              message:
                'Cannot import from Vocabulary internal lib. Use public API from features/Vocabulary/index.ts instead.',
            },
            {
              target: './features/!(Vocabulary)/**/*',
              from: './features/Vocabulary/data',
              message:
                'Cannot import from Vocabulary internal data. Use facade from features/Vocabulary/index.ts instead.',
            },

            {
              target: './features/!(Progress)/**/*',
              from: './features/Progress/store',
              message:
                'Cannot import from Progress internal store. Use facade from features/Progress/index.ts instead.',
            },
            {
              target: './features/!(Progress)/**/*',
              from: './features/Progress/lib',
              message:
                'Cannot import from Progress internal lib. Use public API from features/Progress/index.ts instead.',
            },

            {
              target: './features/!(Preferences)/**/*',
              from: './features/Preferences/store',
              message:
                'Cannot import from Preferences internal store. Use facade from features/Preferences/index.ts instead.',
            },
            {
              target: './features/!(Preferences)/**/*',
              from: './features/Preferences/lib',
              message:
                'Cannot import from Preferences internal lib. Use public API from features/Preferences/index.ts instead.',
            },
            {
              target: './features/!(Preferences)/**/*',
              from: './features/Preferences/data',
              message:
                'Cannot import from Preferences internal data. Use facade from features/Preferences/index.ts instead.',
            },
          ],
        },
      ],
    },
  },
  ...(storybook ? storybook.configs['flat/recommended'] : []),
];

export default eslintConfig;
