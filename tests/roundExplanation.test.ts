import test from 'node:test';
import assert from 'node:assert/strict';
import { describeFinalRound, describeRoundTransfer } from '../src/lib/roundExplanation.ts';

test('explains why eliminated ballots move and how they are distributed', () => {
  assert.equal(
    describeRoundTransfer(['Carmen Ortiz', 'Dale Hutchins']),
    'Carmen Ortiz and Dale Hutchins were out after this round. They cannot win now, so each ballot that counted for them is checked. If a voter ranked someone still in the race, the ballot moves to that person. If not, the ballot stops.',
  );
});

test('final round only claims a majority when there is a winner', () => {
  assert.match(describeFinalRound('A'), /crossed the majority line/);
  assert.match(describeFinalRound(null), /ends in a tie/);
  assert.doesNotMatch(describeFinalRound(null), /has crossed/);
});
