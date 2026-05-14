import test from 'node:test';
import assert from 'node:assert/strict';
import { describeRoundTransfer } from '../src/lib/roundExplanation.ts';

test('explains why eliminated ballots move and how they are distributed', () => {
  assert.equal(
    describeRoundTransfer(['Carmen Ortiz', 'Dale Hutchins']),
    'Carmen Ortiz and Dale Hutchins were out after this round. They cannot win now, so each ballot that counted for them is checked. If a voter ranked someone still in the race, the ballot moves to that person. If not, the ballot stops.',
  );
});
