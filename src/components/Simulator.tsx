'use client';

import { useState } from 'react';
import { renameElection, tabulate, type Ballot, type Candidate } from '@/lib/election';
import { describeBallotJourney } from '@/lib/ballotJourney';
import { RoundCard } from './RoundCard';

type Ranks = Record<string, number | undefined>;
type CandidateNames = Record<string, string>;

function nextRank(ranks: Ranks): number {
  const used = new Set(Object.values(ranks).filter((r): r is number => typeof r === 'number'));
  let r = 1;
  while (used.has(r)) r++;
  return r;
}

function unrank(ranks: Ranks, name: string): Ranks {
  const removed = ranks[name];
  if (removed === undefined) return ranks;
  const next: Ranks = {};
  for (const [k, v] of Object.entries(ranks)) {
    if (k === name) continue;
    if (typeof v === 'number' && v > removed) next[k] = v - 1;
    else next[k] = v;
  }
  return next;
}

function defaultCandidateNames(candidates: Candidate[]): CandidateNames {
  return Object.fromEntries(candidates.map((candidate) => [candidate.name, candidate.name]));
}

export function Simulator({
  candidates,
  baseBallots,
}: {
  candidates: Candidate[];
  baseBallots: Ballot[];
}) {
  const [ranks, setRanks] = useState<Ranks>({});
  const [candidateNames, setCandidateNames] = useState<CandidateNames>(() => defaultCandidateNames(candidates));
  const [submitted, setSubmitted] = useState(false);

  const rankedCount = Object.values(ranks).filter((r) => typeof r === 'number').length;
  const effectiveNameMap = Object.fromEntries(
    candidates.map((candidate) => {
      const nextName = candidateNames[candidate.name]?.trim();
      return [candidate.name, nextName || candidate.name];
    }),
  );
  const customizedCandidates = candidates.map((candidate) => ({
    ...candidate,
    name: effectiveNameMap[candidate.name],
  }));
  const duplicateNames = customizedCandidates
    .map((candidate) => candidate.name)
    .filter((name, index, names) => names.indexOf(name) !== index);
  const duplicateNameSet = new Set(duplicateNames);
  const userBallot: Ballot = candidates
    .filter((candidate) => typeof ranks[candidate.name] === 'number')
    .sort((a, b) => (ranks[a.name] as number) - (ranks[b.name] as number))
    .map((candidate) => effectiveNameMap[candidate.name]);

  function toggleRank(name: string) {
    setRanks((prev) => {
      if (typeof prev[name] === 'number') return unrank(prev, name);
      return { ...prev, [name]: nextRank(prev) };
    });
  }

  function resetBallot() {
    setRanks({});
    setSubmitted(false);
  }

  function resetCandidateLabels() {
    setCandidateNames(defaultCandidateNames(candidates));
  }

  if (submitted) {
    const election = renameElection(candidates, baseBallots, effectiveNameMap);
    const view = tabulate(election.candidates, [...election.ballots, userBallot]);
    const journey = describeBallotJourney(userBallot, view.rounds, view.winner);
    return (
      <div className="rcv-results">
        <aside className="rcv-your-ballot mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Your ballot
          </p>
          <ol className="mt-2 list-decimal pl-5 text-sm text-slate-800">
            {userBallot.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ol>
          <button
            type="button"
            onClick={resetBallot}
            className="rcv-vote-again mt-3 text-sm font-medium text-blue-700 hover:underline"
          >
            ← Vote again with different rankings
          </button>
        </aside>

        <aside className="rcv-ballot-journey mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-700">
            Your ballot&apos;s trip
          </p>
          <h2 className="mt-1 text-xl font-bold text-blue-950">{journey.title}</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-blue-950">
            {journey.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </aside>

        {view.winner && (
          <aside className="rcv-winner-banner mb-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
              Winner
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-900">{view.winner}</p>
            <p className="mt-1 text-sm text-emerald-800">
              Decided in {view.rounds.length} round{view.rounds.length === 1 ? '' : 's'} from{' '}
              {view.totalVoters} ballots (including yours).
            </p>
          </aside>
        )}

        {view.tieOptions && (
          <aside className="rcv-tie-banner mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium uppercase tracking-wide text-amber-700">Tie</p>
            <p className="mt-1 text-amber-900">Tie between: {view.tieOptions.join(', ')}.</p>
          </aside>
        )}

        <section className="rcv-rounds space-y-4">
          {view.rounds.map((round, idx) => (
            <RoundCard
              key={round.round}
              round={round}
              isFinalRound={idx === view.rounds.length - 1}
            />
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="rcv-ballot-form">
      <section className="rcv-instructions mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          Pick your favorite first. Then pick your next choices. You can rank one, two, three, or
          all four people. You can also rename the candidates below to make the example feel more
          familiar. If you leave someone blank, your ballot will not move to that person.
        </p>
      </section>

      <ol className="rcv-candidate-choices grid grid-cols-1 gap-3 sm:grid-cols-2">
        {candidates.map((candidate) => {
          const rank = ranks[candidate.name];
          const isRanked = typeof rank === 'number';
          const isDuplicateName = duplicateNameSet.has(effectiveNameMap[candidate.name]);
          return (
            <li key={candidate.name}>
              <div
                className={`rounded-lg border p-4 transition ${
                  isRanked
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleRank(candidate.name)}
                  className="rcv-candidate-button flex w-full items-center gap-3 text-left"
                >
                  <span
                    className={`rcv-rank-pip flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isRanked
                        ? 'bg-blue-600 text-white'
                        : 'border border-dashed border-slate-300 text-slate-400'
                    }`}
                  >
                    {isRanked ? rank : '–'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="rcv-candidate-name block font-medium">{effectiveNameMap[candidate.name]}</span>
                    <span className="rcv-candidate-blurb block text-xs text-slate-500">
                      {candidate.blurb}
                    </span>
                  </span>
                </button>
                <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Candidate label
                  <input
                    type="text"
                    value={candidateNames[candidate.name]}
                    onChange={(event) => {
                      const nextName = event.currentTarget.value;
                      setCandidateNames((prev) => ({
                        ...prev,
                        [candidate.name]: nextName,
                      }));
                    }}
                    className={`mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 outline-none transition ${
                      isDuplicateName
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-slate-300 focus:border-blue-500'
                    }`}
                    aria-label={`Candidate label for ${candidate.name}`}
                  />
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  Leave blank to fall back to {candidate.name}.
                </p>
                {isDuplicateName && (
                  <p className="mt-2 text-xs text-rose-700">
                    Candidate names must stay unique so ballot transfers remain readable.
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {duplicateNames.length > 0 && (
        <p className="mt-4 text-sm text-rose-700">
          Rename duplicates before submitting your ballot.
        </p>
      )}

      <div className="rcv-submit-row mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={rankedCount === 0 || duplicateNames.length > 0}
          onClick={() => setSubmitted(true)}
          className="rcv-submit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          See what happens with my ballot
        </button>
        {rankedCount > 0 && (
          <button
            type="button"
            onClick={resetBallot}
            className="rcv-clear text-sm font-medium text-slate-600 hover:underline"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={resetCandidateLabels}
          className="text-sm font-medium text-slate-600 hover:underline"
        >
          Reset candidate names
        </button>
      </div>
    </div>
  );
}
