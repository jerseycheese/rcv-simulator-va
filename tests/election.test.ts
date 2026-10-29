import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isReservedCandidateName,
  renameElection,
  sampleElection,
  tabulate,
  tabulatePlurality,
} from '../src/lib/election.ts';

test('tracks who is eliminated in each round', () => {
  const userBallot = ['Dale Hutchins'];
  const view = tabulate(sampleElection.candidates, [...sampleElection.ballots, userBallot]);

  assert.deepEqual(
    view.rounds.map((r) => r.eliminatedThisRound),
    [['Dale Hutchins'], ['Carmen Ortiz'], []],
  );
});

test('a candidate stays marked eliminated in every later round, not just the one they go out in', () => {
  const userBallot = ['Dale Hutchins'];
  const view = tabulate(sampleElection.candidates, [...sampleElection.ballots, userBallot]);

  const daleEliminated = view.rounds.map(
    (r) => r.tallies.find((t) => t.name === 'Dale Hutchins')?.eliminated,
  );
  assert.deepEqual(daleEliminated, [true, true, true]);

  const carmenEliminated = view.rounds.map(
    (r) => r.tallies.find((t) => t.name === 'Carmen Ortiz')?.eliminated,
  );
  assert.deepEqual(carmenEliminated, [false, true, true]);
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

test('a candidate renamed to "__proto__" is rejected instead of crashing tabulate', () => {
  // The `ranked-voting` library keys its internal tallies on a plain object,
  // and assigning to the exact key "__proto__" swaps the object's own
  // prototype instead of creating a normal property — that corrupts the
  // library's internal for...in loops and throws a cryptic TypeError deep
  // inside getFinalResult(). tabulate() should refuse this input up front
  // with a clear error instead.
  const renameMap = { 'Aisha Patel': '__proto__' };
  const { candidates, ballots } = renameElection(
    sampleElection.candidates,
    sampleElection.ballots,
    renameMap,
  );

  assert.throws(() => tabulate(candidates, ballots), /reserved/);
});

test('isReservedCandidateName only flags the exact "__proto__" string', () => {
  assert.equal(isReservedCandidateName('__proto__'), true);
  assert.equal(isReservedCandidateName('constructor'), false);
  assert.equal(isReservedCandidateName('Aisha Patel'), false);
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

test('a candidate nobody ranks first is shown eliminated in round 1, and transfers skip them', () => {
  const candidates = ['A', 'B', 'C', 'Z'].map((name) => ({ name, blurb: '' }));
  const ballots = [['A'], ['A'], ['A'], ['A'], ['B'], ['B'], ['B'], ['C', 'Z', 'B'], ['C', 'Z', 'B']];
  const view = tabulate(candidates, ballots);

  assert.deepEqual(
    view.rounds.map((r) => r.eliminatedThisRound),
    [['Z'], ['C'], []],
  );
  assert.deepEqual(view.rounds[1].transfers, [{ from: 'C', to: 'B', votes: 2 }]);
});

test('a candidate nobody ranks is marked out from round 1', () => {
  const candidates = [...sampleElection.candidates, { name: 'Zed', blurb: '' }];
  const view = tabulate(candidates, sampleElection.ballots);

  assert.ok(view.rounds[0].eliminatedThisRound.includes('Zed'));
  assert.deepEqual(
    view.rounds.map((r) => r.tallies.find((t) => t.name === 'Zed')?.eliminated),
    view.rounds.map(() => true),
  );
});

test('candidates tied for last go out one at a time, drawn by lot, so the survivor picks up their ballots', () => {
  const candidates = ['A', 'B', 'C'].map((name) => ({ name, blurb: '' }));
  const ballots = [
    ...Array.from({ length: 4 }, () => ['A']),
    ...Array.from({ length: 3 }, () => ['B', 'C']),
    ...Array.from({ length: 3 }, () => ['C', 'B']),
  ];
  const view = tabulate(candidates, ballots);
  const out = view.rounds[0].tieBreak?.eliminated;
  const survivor = out === 'B' ? 'C' : 'B';

  assert.ok(out === 'B' || out === 'C');
  assert.deepEqual(view.rounds[0].tieBreak, { tied: ['B', 'C'], eliminated: out });
  assert.deepEqual(
    view.rounds.map((r) => r.eliminatedThisRound),
    [[out], []],
  );
  assert.equal(view.rounds[1].tallies.find((t) => t.name === survivor)?.votes, 6);
  assert.equal(view.rounds[1].tallies.find((t) => t.name === 'A')?.votes, 4);
  assert.equal(view.winner, survivor);

  for (let i = 0; i < 5; i++) {
    assert.deepEqual(tabulate(candidates, ballots).rounds[0].tieBreak, view.rounds[0].tieBreak);
  }
});
