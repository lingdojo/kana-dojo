// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import importPlugin from 'eslint-plugin-import';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [...compat.extends('next/core-web-vitals', 'next/typescript'), {
  ignores: ['.next/**/*', 'next-env.d.ts']
}, {
  plugins: {
    import: importPlugin
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // Layer Enforcement Rules - Hybrid Modular Architecture
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // Rule 1: shared/ CANNOT import from features/
          {
            target: './shared',
            from: './features/*/store',
            message:
              'shared/ layer cannot import from feature stores directly. Use facades exported from features/*/index.ts instead.'
          },
          {
            target: './shared',
            from: './features/*/data',
            message:
              'shared/ layer cannot import from feature data directly. Use facades exported from features/*/index.ts instead.'
          },
          {
            target: './shared',
            from: './features/*/lib',
            message:
              'shared/ layer cannot import from feature internal lib directly. Use facades exported from features/*/index.ts instead.'
          },

          // Rule 2: widgets/ CANNOT import from feature stores or data
          {
            target: './widgets',
            from: './features/*/store',
            message:
              'widgets/ cannot import from feature stores directly. Use facades exported from features/*/index.ts instead.'
          },
          {
            target: './widgets',
            from: './features/*/data',
            message:
              'widgets/ cannot import from feature data directly. Use facades exported from features/*/index.ts instead.'
          },

          // Rule 3: Features CANNOT import from other features' internal directories
          {
            target: './features/!(Kana)/**/*',
            from: './features/Kana/store',
            message:
              'Cannot import from Kana internal store. Use facade from features/Kana/index.ts instead.'
          },
          {
            target: './features/!(Kana)/**/*',
            from: './features/Kana/lib',
            message:
              'Cannot import from Kana internal lib. Use public API from features/Kana/index.ts instead.'
          },
          {
            target: './features/!(Kana)/**/*',
            from: './features/Kana/data',
            message:
              'Cannot import from Kana internal data. Use facade from features/Kana/index.ts instead.'
          },

          {
            target: './features/!(Kanji)/**/*',
            from: './features/Kanji/store',
            message:
              'Cannot import from Kanji internal store. Use facade from features/Kanji/index.ts instead.'
          },
          {
            target: './features/!(Kanji)/**/*',
            from: './features/Kanji/lib',
            message:
              'Cannot import from Kanji internal lib. Use public API from features/Kanji/index.ts instead.'
          },
          {
            target: './features/!(Kanji)/**/*',
            from: './features/Kanji/data',
            message:
              'Cannot import from Kanji internal data. Use facade from features/Kanji/index.ts instead.'
          },

          {
            target: './features/!(Vocabulary)/**/*',
            from: './features/Vocabulary/store',
            message:
              'Cannot import from Vocabulary internal store. Use facade from features/Vocabulary/index.ts instead.'
          },
          {
            target: './features/!(Vocabulary)/**/*',
            from: './features/Vocabulary/lib',
            message:
              'Cannot import from Vocabulary internal lib. Use public API from features/Vocabulary/index.ts instead.'
          },
          {
            target: './features/!(Vocabulary)/**/*',
            from: './features/Vocabulary/data',
            message:
              'Cannot import from Vocabulary internal data. Use facade from features/Vocabulary/index.ts instead.'
          },

          {
            target: './features/!(Progress)/**/*',
            from: './features/Progress/store',
            message:
              'Cannot import from Progress internal store. Use facade from features/Progress/index.ts instead.'
          },
          {
            target: './features/!(Progress)/**/*',
            from: './features/Progress/lib',
            message:
              'Cannot import from Progress internal lib. Use public API from features/Progress/index.ts instead.'
          },

          {
            target: './features/!(Preferences)/**/*',
            from: './features/Preferences/store',
            message:
              'Cannot import from Preferences internal store. Use facade from features/Preferences/index.ts instead.'
          },
          {
            target: './features/!(Preferences)/**/*',
            from: './features/Preferences/lib',
            message:
              'Cannot import from Preferences internal lib. Use public API from features/Preferences/index.ts instead.'
          },
          {
            target: './features/!(Preferences)/**/*',
            from: './features/Preferences/data',
            message:
              'Cannot import from Preferences internal data. Use facade from features/Preferences/index.ts instead.'
          }
        ]
      }
    ]
  }
}, ...storybook.configs["flat/recommended"]];

export default eslintConfig;
