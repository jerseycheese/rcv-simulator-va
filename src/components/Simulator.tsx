'use client';

import { useState } from 'react';
import { renameElection, tabulate, type Ballot, type Candidate } from '@/lib/election';
import { describeBallotJourney } from '@/lib/ballotJourney';
import { buildColorMap, type ColorMap } from '@/lib/colors';
import { traceUserBallot } from '@/lib/ballotTrace';
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

function defaultNames(candidates: Candidate[]): CandidateNames {
  return Object.fromEntries(candidates.map((c) => [c.name, c.name]));
}

export function Simulator({
  candidates,
  baseBallots,
}: {
  candidates: Candidate[];
  baseBallots: Ballot[];
}) {
  const [ranks, setRanks] = useState<Ranks>({});
  const [names, setNames] = useState<CandidateNames>(() => defaultNames(candidates));
  const [submitted, setSubmitted] = useState(false);

  // Colors are keyed by the original (stable) name so a candidate keeps the
  // same hue no matter what it's renamed to.
  const colorMap = buildColorMap(candidates);
  const rankedCount = Object.values(ranks).filter((r) => typeof r === 'number').length;

  // Original name -> effective display name (trimmed, falls back to original).
  const effectiveName: CandidateNames = Object.fromEntries(
    candidates.map((c) => [c.name, names[c.name]?.trim() || c.name]),
  );
  const effectiveList = candidates.map((c) => effectiveName[c.name]);
  const duplicateNames = new Set(
    effectiveList.filter((name, i) => effectiveList.indexOf(name) !== i),
  );
  const canSubmit = rankedCount > 0 && duplicateNames.size === 0;

  const userBallot: Ballot = candidates
    .filter((c) => typeof ranks[c.name] === 'number')
    .sort((a, b) => (ranks[a.name] as number) - (ranks[b.name] as number))
    .map((c) => effectiveName[c.name]);

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
    // Tabulate against the renamed election; colors re-key onto the new names
    // by position, so each candidate keeps its hue from the ballot form.
    const renamed = renameElection(candidates, baseBallots, effectiveName);
    const resultColors: ColorMap = buildColorMap(renamed.candidates);
    const view = tabulate(renamed.candidates, [...renamed.ballots, userBallot]);
    const journey = describeBallotJourney(userBallot, view.rounds, view.winner);
    const maxScale = view.rounds[0]?.totalActiveBallots ?? 1;
    const trace = traceUserBallot(userBallot, view.rounds);

    return (
      <div className="rcv-results relative z-10">
        <Legend
          items={renamed.candidates.map((c) => ({ name: c.name, color: resultColors[c.name] }))}
        />

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
                    style={{ backgroundColor: resultColors[name] }}
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
            style={{ borderColor: resultColors[view.winner], ['--i' as string]: 1 }}
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl text-white"
              style={{ backgroundColor: resultColors[view.winner] }}
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
              colorMap={resultColors}
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
      <Legend
        items={candidates.map((c) => ({ name: effectiveName[c.name], color: colorMap[c.name] }))}
      />

      <section className="rcv-instructions mb-5 border-l-2 border-federal bg-surface p-4">
        <p className="text-sm leading-relaxed text-ink">
          Pick your favorite first, then your next choices — rank one, two, three, or all four. If
          you leave someone blank, your ballot will not move to that person. You can also rename the
          candidates to something familiar; the colors stay put.
        </p>
      </section>

      <ol className="rcv-candidate-choices grid grid-cols-1 gap-3 sm:grid-cols-2">
        {candidates.map((c) => {
          const rank = ranks[c.name];
          const isRanked = typeof rank === 'number';
          const color = colorMap[c.name];
          const isDuplicate = duplicateNames.has(effectiveName[c.name]);
          return (
            <li key={c.name}>
              <div
                className={`rcv-candidate-card rounded-sm border transition ${
                  isRanked ? 'border-federal bg-federal-soft' : 'border-rule bg-surface'
                }`}
                style={isRanked ? { borderLeftColor: color, borderLeftWidth: '3px' } : undefined}
              >
                <button
                  type="button"
                  onClick={() => toggleRank(c.name)}
                  className="rcv-candidate-button flex w-full items-center gap-3 p-4 text-left"
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
                      {effectiveName[c.name]}
                    </span>
                    <span className="rcv-candidate-blurb mt-0.5 block text-xs text-ink-soft">
                      {c.blurb}
                    </span>
                  </span>
                </button>

                <div className="rcv-rename border-t border-rule px-4 pb-3 pt-2.5">
                  <label className="block font-mono text-[0.625rem] font-semibold uppercase tracking-widest text-ink-soft">
                    Rename
                    <input
                      type="text"
                      value={names[c.name]}
                      placeholder={c.name}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setNames((prev) => ({ ...prev, [c.name]: value }));
                      }}
                      aria-label={`Rename ${c.name}`}
                      className={`rcv-rename-input mt-1 w-full rounded-sm border bg-surface px-2.5 py-1.5 text-sm font-normal normal-case tracking-normal text-ink outline-none transition focus:border-federal ${
                        isDuplicate ? 'border-flag-red' : 'border-rule'
                      }`}
                    />
                  </label>
                  {isDuplicate && (
                    <p className="mt-1.5 text-xs text-flag-red">Names must be unique.</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="rcv-submit-row mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
        <button
          type="button"
          disabled={!canSubmit}
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
        <button
          type="button"
          onClick={() => setNames(defaultNames(candidates))}
          className="rcv-reset-names font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft hover:underline sm:ml-auto"
        >
          Reset names
        </button>
      </div>
    </div>
  );
}

function Legend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <div className="rcv-legend mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-rule py-2.5">
      <span className="font-mono text-[0.625rem] uppercase tracking-widest text-ink-soft">
        Candidates
      </span>
      {items.map((item) => (
        <span key={item.name} className="flex items-center gap-1.5 text-xs font-medium text-ink">
          <span
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          {item.name}
        </span>
      ))}
    </div>
  );
}
