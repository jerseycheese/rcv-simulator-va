'use client';

import { useState } from 'react';
import { tabulate, type Ballot, type Candidate } from '@/lib/election';
import { describeBallotJourney } from '@/lib/ballotJourney';
import { buildColorMap } from '@/lib/colors';
import { traceUserBallot } from '@/lib/ballotTrace';
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

  const colorMap = buildColorMap(candidates);
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
    const maxScale = view.rounds[0]?.totalActiveBallots ?? 1;
    const trace = traceUserBallot(userBallot, view.rounds);

    return (
      <div className="rcv-results relative z-10">
        <Legend candidates={candidates} colorMap={colorMap} />

        <aside className="rcv-ballot-journey rcv-fade-up mb-6 border-l-2 border-federal bg-surface p-5">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-federal">
            Your ballot&apos;s trip
          </p>
          <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-ink">
            {journey.title}
          </h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-ink">
            {journey.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="mt-4 border-t border-rule pt-3">
            <p className="font-mono text-[0.625rem] uppercase tracking-widest text-ink-soft">
              Your ranking
            </p>
            <ol className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
              {userBallot.map((name, i) => (
                <li key={name} className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-semibold text-ink">{i + 1}</span>
                  <span
                    className="h-2.5 w-2.5 rounded-[2px]"
                    style={{ backgroundColor: colorMap[name] }}
                    aria-hidden="true"
                  />
                  {name}
                </li>
              ))}
            </ol>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rcv-vote-again mt-4 font-mono text-xs font-semibold uppercase tracking-wide text-federal hover:underline"
          >
            ← Vote again with different rankings
          </button>
        </aside>

        {view.winner && (
          <aside
            className="rcv-winner-banner rcv-fade-up mb-8 flex items-center gap-4 border-l-2 bg-surface p-5"
            style={{ borderColor: colorMap[view.winner], ['--i' as string]: 1 }}
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl text-white"
              style={{ backgroundColor: colorMap[view.winner] }}
              aria-hidden="true"
            >
              ✓
            </span>
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-ink-soft">
                Winner
              </p>
              <p className="font-display text-2xl font-bold tracking-tight text-ink">
                {view.winner}
              </p>
              <p className="mt-0.5 text-sm text-ink-soft">
                Decided in {view.rounds.length} round{view.rounds.length === 1 ? '' : 's'} from{' '}
                {view.totalVoters} ballots, including yours.
              </p>
            </div>
          </aside>
        )}

        {view.tieOptions && (
          <aside className="rcv-tie-banner rcv-fade-up mb-8 border-l-2 border-flag-red bg-surface p-5">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-flag-red">
              Tie
            </p>
            <p className="mt-1 text-ink">Tie between: {view.tieOptions.join(', ')}.</p>
          </aside>
        )}

        <section className="rcv-rounds relative space-y-4 sm:pl-12">
          <span
            className="pointer-events-none absolute bottom-8 left-6 top-8 hidden w-px bg-rule sm:block"
            aria-hidden="true"
          />
          {view.rounds.map((round, idx) => (
            <RoundCard
              key={round.round}
              round={round}
              isFinalRound={idx === view.rounds.length - 1}
              colorMap={colorMap}
              maxScale={maxScale}
              youSupport={trace[idx]}
            />
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="rcv-ballot-form relative z-10">
      <Legend candidates={candidates} colorMap={colorMap} />

      <section className="rcv-instructions mb-5 border-l-2 border-federal bg-surface p-4">
        <p className="text-sm leading-relaxed text-ink">
          Pick your favorite first. Then pick your next choices. You can rank one, two, three, or
          all four people. If you leave someone blank, your ballot will not move to that person.
        </p>
      </section>

      <ol className="rcv-candidate-choices grid grid-cols-1 gap-3 sm:grid-cols-2">
        {candidates.map((c) => {
          const rank = ranks[c.name];
          const isRanked = typeof rank === 'number';
          const color = colorMap[c.name];
          return (
            <li key={c.name}>
              <button
                type="button"
                onClick={() => toggleRank(c.name)}
                className={`rcv-candidate-button flex w-full items-center gap-3 rounded-sm border p-4 text-left transition ${
                  isRanked
                    ? 'border-federal bg-federal-soft'
                    : 'border-rule bg-surface hover:border-ink-soft'
                }`}
                style={isRanked ? { borderLeftColor: color, borderLeftWidth: '3px' } : undefined}
              >
                <span
                  className="rcv-rank-pip flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold"
                  style={
                    isRanked
                      ? { backgroundColor: color, color: '#fff' }
                      : { border: '1px dashed var(--rule)', color: 'var(--ink-soft)' }
                  }
                >
                  {isRanked ? rank : '–'}
                </span>
                <span className="min-w-0">
                  <span className="rcv-candidate-name flex items-center gap-1.5 font-semibold text-ink">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                    {c.name}
                  </span>
                  <span className="rcv-candidate-blurb mt-0.5 block text-xs text-ink-soft">
                    {c.blurb}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rcv-submit-row mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
        <button
          type="button"
          disabled={rankedCount === 0}
          onClick={() => setSubmitted(true)}
          className="rcv-submit rounded-sm bg-federal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-eliminated"
        >
          See what happens with my ballot
        </button>
        {rankedCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="rcv-clear font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft hover:underline"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function Legend({
  candidates,
  colorMap,
}: {
  candidates: Candidate[];
  colorMap: ReturnType<typeof buildColorMap>;
}) {
  return (
    <div className="rcv-legend mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-rule py-2.5">
      <span className="font-mono text-[0.625rem] uppercase tracking-widest text-ink-soft">
        Candidates
      </span>
      {candidates.map((c) => (
        <span key={c.name} className="flex items-center gap-1.5 text-xs font-medium text-ink">
          <span
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: colorMap[c.name] }}
            aria-hidden="true"
          />
          {c.name}
        </span>
      ))}
    </div>
  );
}
