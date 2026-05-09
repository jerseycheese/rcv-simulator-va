import { VoteController, VoteOption, UserVotes, type FinalResult } from 'ranked-voting';

export type Ballot = string[];

export type Candidate = {
  name: string;
  blurb: string;
};

export type RoundView = {
  round: number;
  tallies: { name: string; votes: number; eliminated: boolean }[];
  eliminatedThisRound: string | null;
  totalActiveBallots: number;
  threshold: number;
};

export type ElectionView = {
  rounds: RoundView[];
  winner: string | null;
  tieOptions: string[] | null;
  totalVoters: number;
};

export const sampleElection: {
  title: string;
  context: string;
  candidates: Candidate[];
  ballots: Ballot[];
} = {
  title: 'Sample Election: 2026 City Council, District 3',
  context:
    "A fictional four-way race used to show how ranked-choice voting works. The numbers are small (20 voters) so you can follow each ballot, but the mechanics are exactly what runs in a real RCV election.",
  candidates: [
    { name: 'Aisha Patel', blurb: 'Housing & transit' },
    { name: 'Brent Walker', blurb: 'Small business' },
    { name: 'Carmen Ortiz', blurb: 'Schools & libraries' },
    { name: 'Dale Hutchins', blurb: 'Public safety' },
  ],
  ballots: [
    ...repeat(['Aisha Patel', 'Brent Walker', 'Carmen Ortiz'], 5),
    ...repeat(['Aisha Patel', 'Carmen Ortiz', 'Brent Walker'], 2),
    ...repeat(['Brent Walker', 'Aisha Patel', 'Carmen Ortiz'], 4),
    ...repeat(['Brent Walker', 'Carmen Ortiz', 'Aisha Patel'], 2),
    ...repeat(['Carmen Ortiz', 'Aisha Patel', 'Brent Walker'], 3),
    ...repeat(['Carmen Ortiz', 'Brent Walker', 'Aisha Patel'], 1),
    ...repeat(['Dale Hutchins', 'Aisha Patel', 'Brent Walker'], 2),
    ...repeat(['Dale Hutchins', 'Carmen Ortiz', 'Brent Walker'], 1),
  ],
};

function repeat<T>(value: T, n: number): T[] {
  return Array.from({ length: n }, () => value);
}

export function tabulate(
  candidates: Candidate[],
  ballots: Ballot[],
): ElectionView {
  const controller = new VoteController(
    candidates.map((c) => new VoteOption(c.name)),
  );
  controller.acceptPopulationVotes(
    ballots.map((b) => new UserVotes(b)),
  );
  const result: FinalResult = controller.getFinalResult();

  const rounds: RoundView[] = result.stageResults.map((stage, idx) => {
    const tallies = candidates.map((c) => {
      const counts = stage.rankedVoteCounts[c.name];
      const firstPlace = counts ? counts.voteCounts[0] : 0;
      return { name: c.name, votes: firstPlace, eliminated: false };
    });

    const totalActive = tallies.reduce((sum, t) => sum + t.votes, 0);
    const threshold = Math.floor(totalActive / 2) + 1;

    let eliminatedThisRound: string | null = null;
    const next = result.stageResults[idx + 1];
    if (next) {
      for (const t of tallies) {
        const nextCount = next.rankedVoteCounts[t.name]?.voteCounts[0] ?? 0;
        if (t.votes > 0 && nextCount === 0) {
          t.eliminated = true;
          eliminatedThisRound = t.name;
        }
      }
    }

    return {
      round: idx + 1,
      tallies,
      eliminatedThisRound,
      totalActiveBallots: totalActive,
      threshold,
    };
  });

  return {
    rounds,
    winner: result.winner,
    tieOptions: result.tieOptions,
    totalVoters: result.totalNumVoters,
  };
}
