// Minimal flat ESLint config for TS/React projects
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['node_modules', '.next', 'out', 'dist'],
  },
  {
    files: ['**/*.js'],
    ...js.configs.recommended,
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // keep lint lightweight; rely on typecheck (tsc) for types
    },
  },
];
