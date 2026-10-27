import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSavedBallot, serializeBallot } from '../src/lib/savedBallot.ts';

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
