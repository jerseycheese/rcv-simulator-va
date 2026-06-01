import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        rule: 'var(--rule)',
        federal: 'var(--federal)',
        'federal-soft': 'var(--federal-soft)',
        'flag-red': 'var(--flag-red)',
        eliminated: 'var(--eliminated)',
        cand: {
          0: 'var(--cand-0)',
          1: 'var(--cand-1)',
          2: 'var(--cand-2)',
          3: 'var(--cand-3)',
          4: 'var(--cand-4)',
          5: 'var(--cand-5)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
