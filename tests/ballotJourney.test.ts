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

test('explains when a ballot moves to the next active ranked choice', () => {
  const userBallot = ['Dale Hutchins', 'Carmen Ortiz', 'Aisha Patel'];
  const view = tabulate(sampleElection.candidates, [...sampleElection.ballots, userBallot]);

  const journey = describeBallotJourney(userBallot, view.rounds, view.winner);

  assert.equal(journey.title, 'Your vote helped Aisha Patel in round 2');
  assert.deepEqual(journey.steps, [
    'Your vote started with Dale Hutchins.',
    'Dale Hutchins was out after round 1.',
    'Carmen Ortiz was already out, so your vote moved to Aisha Patel in round 2.',
    'Aisha Patel won.',
  ]);
});
