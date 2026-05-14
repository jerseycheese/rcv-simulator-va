import type { Ballot, RoundView } from './election';

export type BallotJourney = {
  title: string;
  steps: string[];
};

export function describeBallotJourney(
  userBallot: Ballot,
  rounds: RoundView[],
  winner: string | null,
): BallotJourney {
  const firstChoice = userBallot[0];
  if (!firstChoice) {
    return {
      title: 'Your ballot was empty',
      steps: ['You did not rank any candidates.'],
    };
  }

  const steps = [`Your vote started with ${firstChoice}.`];
  const eliminated = new Set<string>();
  let activeChoice = firstChoice;
  let activeRound = 1;

  for (const round of rounds) {
    const eliminatedThisRound = round.tallies
      .filter((tally) => tally.eliminated)
      .map((tally) => tally.name);

    if (eliminatedThisRound.includes(activeChoice)) {
      steps.push(`${activeChoice} was out after round ${round.round}.`);
    }

    for (const candidate of eliminatedThisRound) {
      eliminated.add(candidate);
    }

    const nextChoice = userBallot.find((name) => !eliminated.has(name));

    if (!nextChoice) {
      const nextRound = round.round + 1;
      return {
        title: `Your ballot stopped in round ${nextRound}`,
        steps: [
          ...steps,
          'You did not rank anyone else, so your ballot stopped there. This is called an exhausted ballot.',
        ],
      };
    }

    if (nextChoice !== activeChoice) {
      const skippedChoices = skippedRankedChoices(userBallot, activeChoice, nextChoice, eliminated);
      if (skippedChoices.length > 0) {
        steps.push(
          `${skippedChoices.join(' and ')} ${skippedChoices.length === 1 ? 'was' : 'were'} already out, so your vote moved to ${nextChoice} in round ${round.round + 1}.`,
        );
      } else {
        steps.push(`Your vote moved to ${nextChoice} in round ${round.round + 1}.`);
      }
      activeChoice = nextChoice;
      activeRound = round.round + 1;
    }
  }

  if (winner) {
    steps.push(`${winner} won.`);
  }

  return {
    title:
      activeChoice === winner
        ? `Your vote helped ${activeChoice} in round ${activeRound}`
        : `Your vote ended with ${activeChoice}`,
    steps,
  };
}

function skippedRankedChoices(
  userBallot: Ballot,
  previousChoice: string,
  nextChoice: string,
  eliminated: Set<string>,
): string[] {
  const previousIndex = userBallot.indexOf(previousChoice);
  const nextIndex = userBallot.indexOf(nextChoice);
  if (previousIndex < 0 || nextIndex <= previousIndex + 1) return [];

  return userBallot
    .slice(previousIndex + 1, nextIndex)
    .filter((name) => eliminated.has(name));
}
