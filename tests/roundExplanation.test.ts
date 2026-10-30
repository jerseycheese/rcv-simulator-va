import test from 'node:test';
import assert from 'node:assert/strict';
import {
  describeFinalRound,
  describeRoundTransfer,
  describeTieBreak,
  describeUnsettledTakeaway,
} from '../src/lib/roundExplanation.ts';
import { tabulate, tabulatePlurality } from '../src/lib/election.ts';

test('explains why eliminated ballots move and how they are distributed', () => {
  assert.equal(
    describeRoundTransfer(['Carmen Ortiz', 'Dale Hutchins']),
    'Carmen Ortiz and Dale Hutchins were out after this round. They cannot win now, so each ballot that counted for them is checked. If a voter ranked someone still in the race, the ballot moves to that person. If not, the ballot stops.',
  );
});

test('tie-break note names the tie and who the draw sent out', () => {
  assert.equal(
    describeTieBreak(['A', 'B'], 'B'),
    'A and B tied for the fewest votes. Only one can go out per round, so Virginia draws lots. The simulator drew too: B goes out.',
  );
});

test('final round only claims a majority when there is a winner', () => {
  assert.match(describeFinalRound('A'), /crossed the majority line/);
  assert.match(describeFinalRound(null), /ends in a tie/);
  assert.doesNotMatch(describeFinalRound(null), /has crossed/);
});

test('names one, two, or several eliminated candidates in plain English', () => {
  assert.match(describeRoundTransfer(['Carmen Ortiz']), /^Carmen Ortiz was out/);
  assert.match(
    describeRoundTransfer(['Aisha Patel', 'Carmen Ortiz', 'Dale Hutchins']),
    /^Aisha Patel, Carmen Ortiz, and Dale Hutchins were out/,
  );
});

test('takeaway never claims an RCV majority when the ranked count ties', () => {
  const candidates = [
    { name: 'A', blurb: '' },
    { name: 'B', blurb: '' },
    { name: 'C', blurb: '' },
  ];
  const ballots = [['A'], ['A'], ['A'], ['B', 'C'], ['B', 'C'], ['C', 'B']];
  const plurality = tabulatePlurality(candidates, ballots);
  const rcv = tabulate(candidates, ballots);
  assert.equal(plurality.winner, 'A');
  assert.equal(rcv.winner, null);

  const text = describeUnsettledTakeaway(plurality.winner, rcv.winner, rcv.tieOptions);
  assert.doesNotMatch(text, /majority|can't settle/);
  assert.match(text, /^A has the most first-choice votes/);
  assert.match(text, /tie between A and B/);
});
