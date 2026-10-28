import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ballotToSave,
  parseSavedBallot,
  restoreBallot,
  serializeBallot,
} from '../src/lib/savedBallot.ts';

const candidates = ['Aisha Patel', 'Carmen Ortiz', 'Dale Hutchins'];

test('a saved ballot round-trips through serialize and parse', () => {
  const ballot = {
    order: ['Dale Hutchins', 'Aisha Patel'],
    names: {
      'Aisha Patel': 'Mayor A',
      'Carmen Ortiz': 'Carmen Ortiz',
      'Dale Hutchins': 'Dale',
    },
  };
  assert.deepEqual(
    parseSavedBallot(serializeBallot(ballot), candidates),
    ballot
  );
});

test('drops names that are not current candidates, duplicates, and proto keys', () => {
  const raw =
    '{"order":["Ghost","Carmen Ortiz","Carmen Ortiz","__proto__"],' +
    '"names":{"__proto__":{"polluted":true},"Ghost":"x","Carmen Ortiz":7,"Aisha Patel":"A"}}';
  const parsed = parseSavedBallot(raw, candidates);
  assert.deepEqual(parsed, {
    order: ['Carmen Ortiz'],
    names: { 'Aisha Patel': 'A' },
  });
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
});

test('returns null for missing or corrupt storage', () => {
  assert.equal(parseSavedBallot(null, candidates), null);
  assert.equal(parseSavedBallot('not json', candidates), null);
  assert.equal(parseSavedBallot('42', candidates), null);
});

const page = 'https://example.org/';
const stored = serializeBallot({
  order: ['Dale Hutchins'],
  names: { 'Aisha Patel': 'Mayor A' },
});

test('a shared link ranking beats the saved one, saved renames still apply', () => {
  const restored = restoreBallot(stored, `${page}?r=Carmen Ortiz,Aisha Patel`, candidates);
  assert.deepEqual(restored, {
    order: ['Carmen Ortiz', 'Aisha Patel'],
    names: { 'Aisha Patel': 'Mayor A' },
    cleanHref: page,
  });
});

test('without a shared link the saved ranking comes back', () => {
  assert.deepEqual(restoreBallot(stored, page, candidates), {
    order: ['Dale Hutchins'],
    names: { 'Aisha Patel': 'Mayor A' },
    cleanHref: null,
  });
});

test('a renames-only ballot is saved, an untouched one is cleared', () => {
  const defaults = Object.fromEntries(candidates.map((n) => [n, n]));
  const renamed = { order: [], names: { ...defaults, 'Dale Hutchins': 'Dale' } };
  assert.deepEqual(ballotToSave(renamed, candidates), renamed);
  assert.equal(ballotToSave({ order: [], names: defaults }, candidates), null);
});
