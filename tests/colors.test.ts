import test from 'node:test';
import assert from 'node:assert/strict';
import { buildColorMap } from '../src/lib/colors.ts';
import { sampleElection } from '../src/lib/election.ts';

test('assigns a stable distinct color token to each candidate by index', () => {
  const map = buildColorMap(sampleElection.candidates);
  assert.equal(map['Aisha Patel'], 'var(--cand-0)');
  assert.equal(map['Brent Walker'], 'var(--cand-1)');
  assert.equal(map['Carmen Ortiz'], 'var(--cand-2)');
  assert.equal(map['Dale Hutchins'], 'var(--cand-3)');
});

test('wraps the palette when there are more candidates than colors', () => {
  const many = Array.from({ length: 7 }, (_, i) => ({ name: `C${i}`, blurb: '' }));
  const map = buildColorMap(many);
  assert.equal(map['C6'], map['C0']);
});
