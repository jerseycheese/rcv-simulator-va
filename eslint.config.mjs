import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

// Bridge Next's shareable configs (eslintrc format) into ESLint 9 flat config.
// next/core-web-vitals + next/typescript bring React, React Hooks, Next, and
// typescript-eslint rules — plus the right browser/node globals — in one shot,
// so we don't load typescript-eslint separately and trip the duplicate-plugin guard.
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  {
    ignores: ['out', '.next', 'build', 'node_modules', '.claude/worktrees', 'next-env.d.ts'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // CommonJS dev scripts (the worktree-port helper) legitimately use require().
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

export default config;
