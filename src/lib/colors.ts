import type { Candidate } from './election';

// Candidate categorical palette, defined as CSS custom properties in globals.css.
// Presentation-only: assigns a stable color to each candidate by index so the
// same hue follows a candidate across every round.
const PALETTE = [
  'var(--cand-0)',
  'var(--cand-1)',
  'var(--cand-2)',
  'var(--cand-3)',
  'var(--cand-4)',
  'var(--cand-5)',
];

export type ColorMap = Record<string, string>;

export function buildColorMap(candidates: Candidate[]): ColorMap {
  // Null-prototype map: candidate names are user-editable, so a name like
  // "__proto__" must be a plain key rather than hitting the object prototype.
  const map: ColorMap = Object.create(null);
  candidates.forEach((c, i) => {
    map[c.name] = PALETTE[i % PALETTE.length];
  });
  return map;
}
