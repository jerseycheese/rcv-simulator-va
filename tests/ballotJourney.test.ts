import test from 'node:test';
import assert from 'node:assert/strict';
import { describeBallotJourney } from '../src/lib/ballotJourney.ts';
import { sampleElection, tabulate } from '../src/lib/election.ts';

test('explains when a one-choice ballot exhausts after its candidate is eliminated', () => {
  const userBallot = ['Dale Hutchins'];
  const view = tabulate(sampleElection.candidates, [...sampleElection.ballots, userBallot]);

  const journey = describeBallotJourney(userBallot, view.rounds, view.winner);

  assert.equal(journey.title, 'Your ballot stopped in round 2');
  assert.deepEqual(journey.steps, [
    'Your vote started with Dale Hutchins.',
    'Dale Hutchins was out after round 1.',
    'You did not rank anyone else, so your ballot stopped there. This is called an exhausted ballot.',
  ]);
});

test('explains an empty ballot', () => {
  const userBallot: string[] = [];
  const view = tabulate(sampleElection.candidates, [...sampleElection.ballots, userBallot]);

  const journey = describeBallotJourney(userBallot, view.rounds, view.winner);

  assert.equal(journey.title, 'Your ballot was empty');
  assert.deepEqual(journey.steps, ['You did not rank any candidates.']);
});

test('names an already-eliminated later choice when a ballot exhausts, instead of claiming nothing was ranked', () => {
  const userBallot = ['Carmen Ortiz', 'Dale Hutchins'];
  const view = tabulate(sampleElection.candidates, [...sampleElection.ballots, userBallot]);

  const journey = describeBallotJourney(userBallot, view.rounds, view.winner);

  assert.equal(journey.title, 'Your ballot stopped in round 3');
  assert.deepEqual(journey.steps, [
    'Your vote started with Carmen Ortiz.',
    'Carmen Ortiz was out after round 2.',
    'Dale Hutchins was already out, so your ballot had nowhere left to go. This is called an exhausted ballot.',
  ]);
});

test('explains when a ballot moves to the next active ranked choice', () => {
  const userBallot = ['Dale Hutchins', 'Carmen Ortiz', 'Aisha Patel'];
  const view = tabulate(sampleElection.candidates, [...sampleElection.ballots, userBallot]);

  const journey = describeBallotJourney(userBallot, view.rounds, view.winner);

  assert.equal(journey.title, 'Your vote helped Aisha Patel in round 3');
  assert.deepEqual(journey.steps, [
    'Your vote started with Dale Hutchins.',
    'Dale Hutchins was out after round 1.',
    'Your vote moved to Carmen Ortiz in round 2.',
    'Carmen Ortiz was out after round 2.',
    'Your vote moved to Aisha Patel in round 3.',
    'Aisha Patel won.',
  ]);
});

test('names a skipped already-eliminated choice when a ballot moves past it to a later one', () => {
  const userBallot = ['Carmen Ortiz', 'Dale Hutchins', 'Aisha Patel'];
  const view = tabulate(sampleElection.candidates, [...sampleElection.ballots, userBallot]);

  const journey = describeBallotJourney(userBallot, view.rounds, view.winner);

  assert.equal(journey.title, 'Your vote helped Aisha Patel in round 3');
  assert.deepEqual(journey.steps, [
    'Your vote started with Carmen Ortiz.',
    'Carmen Ortiz was out after round 2.',
    'Dale Hutchins was already out, so your vote moved to Aisha Patel in round 3.',
    'Aisha Patel won.',
  ]);
});

test('skips a zero-first-choice candidate the library already dropped', () => {
  const candidates = ['A', 'B', 'C', 'Z'].map((name) => ({ name, blurb: '' }));
  const userBallot = ['C', 'Z', 'B'];
  const ballots = [['A'], ['A'], ['A'], ['A'], ['B'], ['B'], ['B'], ['C', 'Z', 'B'], userBallot];
  const view = tabulate(candidates, ballots);

  const journey = describeBallotJourney(userBallot, view.rounds, view.winner);

  assert.ok(!journey.steps.some((step) => step.includes('moved to Z')), journey.steps.join(' | '));
  assert.ok(journey.steps.some((step) => step.includes('moved to B')), journey.steps.join(' | '));
});
