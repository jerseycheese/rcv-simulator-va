import { VoteController, VoteOption, UserVotes, type FinalResult } from 'ranked-voting';

export type Ballot = string[];

export type Candidate = {
  name: string;
  blurb: string;
};

export type TransferView = {
  from: string;
  to: string | null;
  votes: number;
};

export type RoundView = {
  round: number;
  tallies: { name: string; votes: number; eliminated: boolean }[];
  eliminatedThisRound: string[];
  transfers: TransferView[];
  totalActiveBallots: number;
  threshold: number;
  // Set when candidates tied for fewest votes and one had to be picked to go out.
  tieBreak: { tied: string[]; eliminated: string } | null;
};

export type ElectionView = {
  rounds: RoundView[];
  winner: string | null;
  tieOptions: string[] | null;
  totalVoters: number;
};

export type PluralityView = {
  tallies: { name: string; votes: number }[];
  winner: string | null;
  tieOptions: string[] | null;
  totalVotes: number;
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
    // Brent leads on first choices but his support can't grow past his base.
    ...repeat(['Brent Walker', 'Dale Hutchins'], 5),
    ...repeat(['Brent Walker', 'Carmen Ortiz'], 3),
    // Aisha and Carmen voters rank each other second — the broad public-services
    // bloc that plurality splits but ranked-choice lets consolidate.
    ...repeat(['Aisha Patel', 'Carmen Ortiz', 'Brent Walker'], 4),
    ...repeat(['Aisha Patel', 'Carmen Ortiz', 'Dale Hutchins'], 2),
    ...repeat(['Carmen Ortiz', 'Aisha Patel', 'Brent Walker'], 3),
    ...repeat(['Carmen Ortiz', 'Aisha Patel', 'Dale Hutchins'], 1),
    // Dale's handful breaks toward Aisha once he's eliminated.
    ...repeat(['Dale Hutchins', 'Aisha Patel', 'Carmen Ortiz'], 2),
  ],
};

function repeat<T>(value: T, n: number): T[] {
  return Array.from({ length: n }, () => value);
}

export type RenamedElection = {
  candidates: Candidate[];
  ballots: Ballot[];
};

// The `ranked-voting` library keys its internal tallies on a plain object
// (candidate name -> counts). Assigning to the exact key "__proto__" on a
// plain object doesn't create a normal property — it swaps the object's own
// prototype, which corrupts every `for...in` lookup the library does over
// that object and throws deep inside getFinalResult(). colors.ts and
// tabulatePlurality already guard against this same name; tabulate() needs
// the same guard at its own entry point.
export const RESERVED_CANDIDATE_NAME = '__proto__';

export function isReservedCandidateName(name: string): boolean {
  return name === RESERVED_CANDIDATE_NAME;
}

// Presentation-only: candidate names are the ballot identity (ballots are
// arrays of name strings), so renaming a candidate means rewriting every
// ballot that references the old name. Keeps the original name as the stable
// key on the caller side; this just produces a renamed copy to tabulate.
export function renameElection(
  candidates: Candidate[],
  ballots: Ballot[],
  renameMap: Record<string, string>,
): RenamedElection {
  return {
    candidates: candidates.map((candidate) => ({
      ...candidate,
      name: renameMap[candidate.name] ?? candidate.name,
    })),
    ballots: ballots.map((ballot) => ballot.map((name) => renameMap[name] ?? name)),
  };
}

// Plurality ("first past the post"): count only each ballot's first choice and
// crown whoever has the most. No rounds, no transfers. It's the foil — running
// the same ballots through plurality and RCV side by side is where the point of
// ranked-choice voting becomes visible.
export function tabulatePlurality(
  candidates: Candidate[],
  ballots: Ballot[],
): PluralityView {
  // Map (not a plain object) so a candidate renamed to "__proto__" is a real key.
  const counts = new Map<string, number>(candidates.map((c) => [c.name, 0]));
  for (const ballot of ballots) {
    const first = ballot[0];
    if (first !== undefined && counts.has(first)) {
      counts.set(first, (counts.get(first) ?? 0) + 1);
    }
  }

  const tallies = candidates
    .map((c) => ({ name: c.name, votes: counts.get(c.name) ?? 0 }))
    .sort((a, b) => b.votes - a.votes);

  const totalVotes = tallies.reduce((sum, t) => sum + t.votes, 0);
  const top = tallies[0]?.votes ?? 0;
  // Only a positive top counts as a result — all-blank ballots leave no winner.
  const leaders = top > 0 ? tallies.filter((t) => t.votes === top).map((t) => t.name) : [];

  return {
    tallies,
    winner: leaders.length === 1 ? leaders[0] : null,
    tieOptions: leaders.length > 1 ? leaders : null,
    totalVotes,
  };
}

export function tabulate(
  candidates: Candidate[],
  ballots: Ballot[],
): ElectionView {
  if (candidates.some((c) => isReservedCandidateName(c.name))) {
    throw new Error(`Candidate name "${RESERVED_CANDIDATE_NAME}" is reserved and cannot be tabulated.`);
  }

  const { stages, tieBreaks, result } = countWithSingleEliminations(candidates, ballots);
  const eliminatedBeforeRound = new Set<string>();

  const rounds: RoundView[] = stages.map((stage, idx) => {
    const tallies = candidates.map((c) => {
      const counts = stage.rankedVoteCounts[c.name];
      const firstPlace = counts ? counts.voteCounts[0] : 0;
      // Cumulative: a candidate eliminated in an earlier round stays marked
      // out in every later round, not just the round they went out in.
      return { name: c.name, votes: firstPlace, eliminated: eliminatedBeforeRound.has(c.name) };
    });

    const totalActive = tallies.reduce((sum, t) => sum + t.votes, 0);
    const threshold = Math.floor(totalActive / 2) + 1;

    const eliminatedThisRound: string[] = [];
    if (idx === 0) {
      // A candidate on no ballot at all is never dropped by the library
      // (getLosers skips options with no votes), so mark them out up front.
      for (const t of tallies) {
        if (!rankedAnywhere(stage, t.name)) {
          t.eliminated = true;
          eliminatedThisRound.push(t.name);
        }
      }
    }
    const next = stages[idx + 1];
    if (next) {
      for (const t of tallies) {
        if (rankedAnywhere(stage, t.name) && !rankedAnywhere(next, t.name)) {
          t.eliminated = true;
          eliminatedThisRound.push(t.name);
        }
      }
    }

    const transfers = buildTransfers(ballots, eliminatedBeforeRound, eliminatedThisRound);
    for (const name of eliminatedThisRound) {
      eliminatedBeforeRound.add(name);
    }

    return {
      round: idx + 1,
      tallies,
      eliminatedThisRound,
      transfers,
      totalActiveBallots: totalActive,
      threshold,
      tieBreak: tieBreaks.get(idx) ?? null,
    };
  });

  return {
    rounds,
    winner: result.winner,
    tieOptions: result.tieOptions,
    totalVoters: result.totalNumVoters,
  };
}

type Stage = FinalResult['stageResults'][number];

// The library strips eliminated candidates from every ballot, so a candidate
// still in the race keeps some count at some rank. Checking every rank (not
// just first choices) catches a candidate nobody ranked first, whom the
// library drops in round 1.
function rankedAnywhere(stage: Stage, name: string): boolean {
  return (stage.rankedVoteCounts[name]?.voteCounts ?? []).some((n) => n > 0);
}

// When candidates tie for fewest votes, `ranked-voting` drops all of them in
// the same round. Virginia (1VAC20-100-40 3(b)) defeats one at a time and
// settles which one by lot under Code of Virginia § 24.2-674, with no look-back
// to earlier rounds; with transfers that can change the winner. So: let the
// library count up to that round, draw one tied candidate to take out, and
// hand the rest of the count back to the library. Ties at zero first choices
// are left alone, since those candidates hold no ballots and dropping them
// together can't move a vote.
function countWithSingleEliminations(candidates: Candidate[], ballots: Ballot[]) {
  const stages: Stage[] = [];
  const tieBreaks = new Map<number, { tied: string[]; eliminated: string }>();
  const removed = new Set<string>();

  for (;;) {
    const inRace = candidates.filter((c) => !removed.has(c.name));
    const controller = new VoteController(inRace.map((c) => new VoteOption(c.name)));
    controller.acceptPopulationVotes(
      ballots.map((b) => new UserVotes(b.filter((name) => !removed.has(name)))),
    );
    const result: FinalResult = controller.getFinalResult();

    const tieAt = result.stageResults.findIndex((stage, i) => {
      const next = result.stageResults[i + 1];
      if (!next) return false;
      const dropped = inRace.filter(
        (c) =>
          (stage.rankedVoteCounts[c.name]?.voteCounts[0] ?? 0) > 0 &&
          !rankedAnywhere(next, c.name),
      );
      return dropped.length > 1 && inRace.some((c) => rankedAnywhere(next, c.name));
    });

    if (tieAt === -1) {
      stages.push(...result.stageResults);
      return { stages, tieBreaks, result };
    }

    const stage = result.stageResults[tieAt];
    const next = result.stageResults[tieAt + 1];
    const tied = inRace
      .filter((c) => rankedAnywhere(stage, c.name) && !rankedAnywhere(next, c.name))
      .map((c) => c.name);
    const eliminated = drawByLot(tied, candidates, ballots);

    stages.push(...result.stageResults.slice(0, tieAt + 1));
    tieBreaks.set(stages.length - 1, { tied, eliminated });
    for (const c of inRace) {
      if (!rankedAnywhere(stage, c.name)) removed.add(c.name);
    }
    removed.add(eliminated);
  }
}

// The draw is seeded from the count itself rather than Math.random, so the
// same ballots always get the same draw: the result can't flip on a re-render
// or reload. Ballots are keyed by candidate position, not name, so renaming a
// candidate doesn't redraw, and sorted, so ballot order doesn't either.
function drawByLot(tied: string[], candidates: Candidate[], ballots: Ballot[]): string {
  const position = new Map(candidates.map((c, i) => [c.name, i]));
  const key = [
    tied.map((name) => position.get(name)).join(','),
    ...ballots.map((b) => b.map((name) => position.get(name) ?? '?').join(',')).sort(),
  ].join('|');
  // FNV-1a: small, stable, and spreads similar inputs apart.
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash = Math.imul(hash ^ key.charCodeAt(i), 0x01000193) >>> 0;
  }
  return tied[hash % tied.length];
}

// The candidate a ballot counts for: its highest-ranked choice still in the race.
export function currentChoice(ballot: Ballot, eliminated: Set<string>): string | undefined {
  return ballot.find((name) => !eliminated.has(name));
}

function buildTransfers(
  ballots: Ballot[],
  eliminatedBeforeRound: Set<string>,
  eliminatedThisRound: string[],
): TransferView[] {
  if (eliminatedThisRound.length === 0) return [];

  const eliminatedAfterRound = new Set([...eliminatedBeforeRound, ...eliminatedThisRound]);
  const counts = new Map<string, TransferView>();

  for (const ballot of ballots) {
    const current = currentChoice(ballot, eliminatedBeforeRound);
    if (!current || !eliminatedThisRound.includes(current)) continue;

    const next = currentChoice(ballot, eliminatedAfterRound) ?? null;
    // Structural key so candidate names containing "->" or the literal
    // "stopped" can't collide distinct transfer paths (names are user-editable).
    const key = JSON.stringify([current, next]);
    const existing = counts.get(key);
    if (existing) {
      existing.votes += 1;
    } else {
      counts.set(key, { from: current, to: next, votes: 1 });
    }
  }

  return Array.from(counts.values());
}
