'use client';

import { useState } from 'react';
import { tabulate, type Ballot, type Candidate } from '@/lib/election';
import { describeBallotJourney } from '@/lib/ballotJourney';
import { RoundCard } from './RoundCard';

type Ranks = Record<string, number | undefined>;

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

export function Simulator({
  candidates,
  baseBallots,
}: {
  candidates: Candidate[];
  baseBallots: Ballot[];
}) {
  const [ranks, setRanks] = useState<Ranks>({});
  const [submitted, setSubmitted] = useState(false);

  const rankedCount = Object.values(ranks).filter((r) => typeof r === 'number').length;

  const userBallot: Ballot = candidates
    .filter((c) => typeof ranks[c.name] === 'number')
    .sort((a, b) => (ranks[a.name] as number) - (ranks[b.name] as number))
    .map((c) => c.name);

  function toggleRank(name: string) {
    setRanks((prev) => {
      if (typeof prev[name] === 'number') return unrank(prev, name);
      return { ...prev, [name]: nextRank(prev) };
    });
  }

  function reset() {
    setRanks({});
    setSubmitted(false);
  }

  if (submitted) {
    const view = tabulate(candidates, [...baseBallots, userBallot]);
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
            onClick={reset}
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
          all four people. If you leave someone blank, your ballot will not move to that person.
        </p>
      </section>

      <ol className="rcv-candidate-choices grid grid-cols-1 gap-3 sm:grid-cols-2">
        {candidates.map((c) => {
          const rank = ranks[c.name];
          const isRanked = typeof rank === 'number';
          return (
            <li key={c.name}>
              <button
                type="button"
                onClick={() => toggleRank(c.name)}
                className={`rcv-candidate-button flex w-full items-center gap-3 rounded-lg border p-4 text-left transition ${
                  isRanked
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-slate-200 bg-white hover:border-slate-400'
                }`}
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
                <span>
                  <span className="rcv-candidate-name block font-medium">{c.name}</span>
                  <span className="rcv-candidate-blurb block text-xs text-slate-500">
                    {c.blurb}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rcv-submit-row mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={rankedCount === 0}
          onClick={() => setSubmitted(true)}
          className="rcv-submit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          See what happens with my ballot
        </button>
        {rankedCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="rcv-clear text-sm font-medium text-slate-600 hover:underline"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
