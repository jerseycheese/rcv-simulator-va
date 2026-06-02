import type { Ballot, RoundView } from './election';

// Presentation-only: for each round, returns the candidate the user's ballot is
// currently counting for (the first ranked choice not yet eliminated going into
// that round), or null if the ballot has exhausted. Mirrors the first-non-eliminated
// logic used by buildTransfers in election.ts.
export function traceUserBallot(userBallot: Ballot, rounds: RoundView[]): (string | null)[] {
  const eliminated = new Set<string>();
  return rounds.map((round) => {
    const current = userBallot.find((name) => !eliminated.has(name)) ?? null;
    for (const tally of round.tallies) {
      if (tally.eliminated) eliminated.add(tally.name);
    }
    return current;
  });
}
