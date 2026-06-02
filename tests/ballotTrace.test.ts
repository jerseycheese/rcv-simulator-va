import test from 'node:test';
import assert from 'node:assert/strict';
import { traceUserBallot } from '../src/lib/ballotTrace.ts';
import { sampleElection, tabulate } from '../src/lib/election.ts';

test('tracks which candidate the ballot counts for, round by round', () => {
  const userBallot = ['Dale Hutchins', 'Carmen Ortiz', 'Aisha Patel'];
  const view = tabulate(sampleElection.candidates, [...sampleElection.ballots, userBallot]);

  const trace = traceUserBallot(userBallot, view.rounds);

  // Round 1: still with first choice. After Dale and Carmen fall, it lands on Aisha.
  assert.equal(trace[0], 'Dale Hutchins');
  assert.equal(trace[trace.length - 1], 'Aisha Patel');
});

test('returns null once the ballot exhausts', () => {
  const userBallot = ['Dale Hutchins'];
  const view = tabulate(sampleElection.candidates, [...sampleElection.ballots, userBallot]);

  const trace = traceUserBallot(userBallot, view.rounds);

  assert.equal(trace[0], 'Dale Hutchins');
  assert.equal(trace[trace.length - 1], null);
});
