import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleElection, tabulate } from '../src/lib/election.ts';

test('tracks all candidates who are eliminated after a round', () => {
  const userBallot = ['Dale Hutchins'];
  const view = tabulate(sampleElection.candidates, [...sampleElection.ballots, userBallot]);

  assert.deepEqual(view.rounds[0].eliminatedThisRound, ['Carmen Ortiz', 'Dale Hutchins']);
});

test('counts where eliminated ballots go next', () => {
  const userBallot = ['Dale Hutchins'];
  const view = tabulate(sampleElection.candidates, [...sampleElection.ballots, userBallot]);

  assert.deepEqual(view.rounds[0].transfers, [
    { from: 'Carmen Ortiz', to: 'Aisha Patel', votes: 3 },
    { from: 'Carmen Ortiz', to: 'Brent Walker', votes: 1 },
    { from: 'Dale Hutchins', to: 'Aisha Patel', votes: 2 },
    { from: 'Dale Hutchins', to: 'Brent Walker', votes: 1 },
    { from: 'Dale Hutchins', to: null, votes: 1 },
  ]);
});
