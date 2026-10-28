import { currentChoice, type Ballot, type RoundView } from './election.ts';

// Presentation-only: for each round, returns the candidate the user's ballot is
// currently counting for (the first ranked choice not yet eliminated going into
// that round), or null if the ballot has exhausted.
export function traceUserBallot(userBallot: Ballot, rounds: RoundView[]): (string | null)[] {
  const eliminated = new Set<string>();
  return rounds.map((round) => {
    const current = currentChoice(userBallot, eliminated) ?? null;
    for (const tally of round.tallies) {
      if (tally.eliminated) eliminated.add(tally.name);
    }
    return current;
  });
}
