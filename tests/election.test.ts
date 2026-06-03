import test from 'node:test';
import assert from 'node:assert/strict';
import { renameElection, sampleElection, tabulate, tabulatePlurality } from '../src/lib/election.ts';

test('tracks who is eliminated in each round', () => {
  const userBallot = ['Dale Hutchins'];
  const view = tabulate(sampleElection.candidates, [...sampleElection.ballots, userBallot]);

  assert.deepEqual(
    view.rounds.map((r) => r.eliminatedThisRound),
    [['Dale Hutchins'], ['Carmen Ortiz'], []],
  );
});

test('counts where eliminated ballots go next, including exhausted ones', () => {
  const userBallot = ['Dale Hutchins'];
  const view = tabulate(sampleElection.candidates, [...sampleElection.ballots, userBallot]);

  // Dale is out first: his two ranked ballots move to Aisha, the user's
  // single-choice ballot has nowhere to go and exhausts.
  assert.deepEqual(view.rounds[0].transfers, [
    { from: 'Dale Hutchins', to: 'Aisha Patel', votes: 2 },
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

test('plurality crowns the candidate with the most first choices', () => {
  const result = tabulatePlurality(sampleElection.candidates, sampleElection.ballots);

  assert.equal(result.winner, 'Brent Walker');
  assert.equal(result.tieOptions, null);
  assert.equal(result.tallies[0].name, 'Brent Walker'); // sorted most-first
  assert.equal(result.totalVotes, 20);
});

test('plurality and ranked-choice pick different winners on the same ballots', () => {
  // The whole point of the comparison: this divergence must hold, or the
  // side-by-side has nothing to teach. Guards the sample election against
  // edits that would flatten it.
  const plurality = tabulatePlurality(sampleElection.candidates, sampleElection.ballots);
  const rcv = tabulate(sampleElection.candidates, sampleElection.ballots);

  assert.equal(plurality.winner, 'Brent Walker');
  assert.equal(rcv.winner, 'Aisha Patel');
  assert.notEqual(plurality.winner, rcv.winner);
});

test('plurality reports a tie when candidates share the lead', () => {
  const candidates = [
    { name: 'A', blurb: '' },
    { name: 'B', blurb: '' },
    { name: 'C', blurb: '' },
  ];
  const result = tabulatePlurality(candidates, [['A'], ['A'], ['B'], ['B'], ['C']]);

  assert.equal(result.winner, null);
  assert.deepEqual(result.tieOptions, ['A', 'B']);
});

test('plurality has no winner when every ballot is blank', () => {
  const candidates = [
    { name: 'A', blurb: '' },
    { name: 'B', blurb: '' },
  ];
  const result = tabulatePlurality(candidates, [[], [], []]);

  assert.equal(result.winner, null);
  assert.equal(result.tieOptions, null);
  assert.equal(result.totalVotes, 0);
});
