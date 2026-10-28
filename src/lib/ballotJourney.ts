import { currentChoice, type Ballot, type RoundView } from './election.ts';
import { formatNames } from './roundExplanation.ts';

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

    if (round.eliminatedThisRound.includes(activeChoice)) {
      steps.push(`${activeChoice} was out after round ${round.round}.`);
    }

    for (const candidate of round.eliminatedThisRound) {
      eliminated.add(candidate);
    }

    const nextChoice = currentChoice(userBallot, eliminated);

    if (!nextChoice) {
      const nextRound = round.round + 1;
      const skippedChoices = skippedRankedChoices(userBallot, activeChoice, eliminated);
      const exhaustedStep =
        skippedChoices.length > 0
          ? `${formatNames(skippedChoices)} ${skippedChoices.length === 1 ? 'was' : 'were'} already out, so your ballot had nowhere left to go. This is called an exhausted ballot.`
          : 'You did not rank anyone else, so your ballot stopped there. This is called an exhausted ballot.';
      return {
        title: `Your ballot stopped in round ${nextRound}`,
        steps: [...steps, exhaustedStep],
      };
    }

    if (nextChoice !== activeChoice) {
      const skippedChoices = skippedRankedChoices(userBallot, activeChoice, eliminated, nextChoice);
      if (skippedChoices.length > 0) {
        steps.push(
          `${formatNames(skippedChoices)} ${skippedChoices.length === 1 ? 'was' : 'were'} already out, so your vote moved to ${nextChoice} in round ${round.round + 1}.`,
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

// With no `nextChoice`, looks all the way to the end of the ballot — the
// exhausted-ballot case, where every remaining ranked choice is already out.
function skippedRankedChoices(
  userBallot: Ballot,
  previousChoice: string,
  eliminated: Set<string>,
  nextChoice?: string,
): string[] {
  const previousIndex = userBallot.indexOf(previousChoice);
  const nextIndex = nextChoice ? userBallot.indexOf(nextChoice) : userBallot.length;
  if (previousIndex < 0 || nextIndex <= previousIndex + 1) return [];

  return userBallot
    .slice(previousIndex + 1, nextIndex)
    .filter((name) => eliminated.has(name));
}
