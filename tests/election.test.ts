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

test('renamed candidates flow through tabulation and transfers', () => {
  const renameMap = { 'Aisha Patel': 'Sam', 'Carmen Ortiz': 'Lee' };
  const { candidates, ballots } = renameElection(
    sampleElection.candidates,
    sampleElection.ballots,
    renameMap,
  );

  const view = tabulate(candidates, [...ballots, ['Lee']]);

  // Original-name candidates are gone; renamed ones carry their ballots.
  const names = view.rounds[0].tallies.map((t) => t.name);
  assert.ok(names.includes('Sam') && names.includes('Lee'));
  assert.ok(!names.includes('Aisha Patel') && !names.includes('Carmen Ortiz'));
  assert.equal(view.winner, 'Sam');
});

test('a candidate named "stopped" does not collide with exhausted ballots', () => {
  // Renaming is unrestricted, so a transfer to a candidate literally named
  // "stopped" must stay distinct from an exhausted (null) transfer.
  const candidates = [
    { name: 'A', blurb: '' },
    { name: 'stopped', blurb: '' },
    { name: 'B', blurb: '' },
  ];
  const ballots = [['A'], ['A', 'stopped'], ['stopped'], ['stopped'], ['stopped'], ['B'], ['B'], ['B']];

  const view = tabulate(candidates, ballots);
  const transfersFromA = view.rounds[0].transfers.filter((t) => t.from === 'A');

  assert.deepEqual(transfersFromA, [
    { from: 'A', to: null, votes: 1 },
    { from: 'A', to: 'stopped', votes: 1 },
  ]);
});
