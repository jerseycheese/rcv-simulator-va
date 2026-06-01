import test from 'node:test';
import assert from 'node:assert/strict';
import { renameElection, sampleElection, tabulate } from '../src/lib/election.ts';

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

test('renames candidates and remaps stored ballots to match', () => {
  const renamed = renameElection(sampleElection.candidates, sampleElection.ballots, {
    'Aisha Patel': 'Alex',
    'Brent Walker': 'Blair',
    'Carmen Ortiz': 'Casey',
    'Dale Hutchins': 'Devon',
  });

  assert.deepEqual(
    renamed.candidates.map((candidate) => candidate.name),
    ['Alex', 'Blair', 'Casey', 'Devon'],
  );
  assert.deepEqual(renamed.ballots[0], ['Alex', 'Blair', 'Casey']);
  assert.deepEqual(renamed.ballots.at(-1), ['Devon', 'Casey', 'Blair']);
});

test('tabulates renamed elections without leaking original candidate names', () => {
  const renamed = renameElection(sampleElection.candidates, sampleElection.ballots, {
    'Aisha Patel': 'Alex',
    'Brent Walker': 'Blair',
    'Carmen Ortiz': 'Casey',
    'Dale Hutchins': 'Devon',
  });
  const userBallot = ['Devon'];
  const view = tabulate(renamed.candidates, [...renamed.ballots, userBallot]);

  assert.deepEqual(view.rounds[0].eliminatedThisRound, ['Casey', 'Devon']);
  assert.deepEqual(view.rounds[0].transfers, [
    { from: 'Casey', to: 'Alex', votes: 3 },
    { from: 'Casey', to: 'Blair', votes: 1 },
    { from: 'Devon', to: 'Alex', votes: 2 },
    { from: 'Devon', to: 'Blair', votes: 1 },
    { from: 'Devon', to: null, votes: 1 },
  ]);
});
