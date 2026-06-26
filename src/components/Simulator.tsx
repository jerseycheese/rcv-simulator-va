'use client';

import { useState } from 'react';
import { renameElection, tabulate, tabulatePlurality, type Ballot, type Candidate } from '@/lib/election';
import { describeBallotJourney } from '@/lib/ballotJourney';
import { buildColorMap, type ColorMap } from '@/lib/colors';
import { traceUserBallot } from '@/lib/ballotTrace';
import { RoundCard } from './RoundCard';
import { MethodComparison } from './MethodComparison';

type Ranks = Record<string, number | undefined>;
type CandidateNames = Record<string, string>;

function rankedOrder(ranks: Ranks): string[] {
  return Object.keys(ranks)
    .filter((name) => typeof ranks[name] === 'number')
    .sort((a, b) => (ranks[a] as number) - (ranks[b] as number));
}

// Set a candidate's rank to a 1-based position (or null to unrank), keeping the
// remaining ranks contiguous with no gaps. Inserting at a taken position pushes
// the others down — that ripple is what makes reordering feel direct.
function setRank(ranks: Ranks, name: string, position: number | null): Ranks {
  const order = rankedOrder(ranks).filter((n) => n !== name);
  if (position !== null) {
    const index = Math.max(0, Math.min(position - 1, order.length));
    order.splice(index, 0, name);
  }
  const next: Ranks = {};
  order.forEach((n, i) => {
    next[n] = i + 1;
  });
  return next;
}

function defaultNames(candidates: Candidate[]): CandidateNames {
  return Object.fromEntries(candidates.map((c) => [c.name, c.name]));
}

// Down-caret for the rank <select> (which uses appearance-none, so the native
// arrow is gone). `stroke` is a URL-encoded color, e.g. '%23ffffff'.
function caretSvg(stroke: string): string {
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6' fill='none' stroke='${stroke}' stroke-width='1.5'%3E%3Cpath d='M1 1l4 4 4-4'/%3E%3C/svg%3E")`;
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

  // Clicking an unranked candidate appends them at the end of the ballot. Once
  // ranked, the per-candidate menu (changeRank) owns reordering and removal —
  // so a click never silently un-ranks someone.
  function addToRanking(name: string) {
    setRanks((prev) => {
      if (typeof prev[name] === 'number') return prev;
      return setRank(prev, name, rankedOrder(prev).length + 1);
    });
  }

  function changeRank(name: string, value: string) {
    setRanks((prev) => setRank(prev, name, value === '' ? null : Number(value)));
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
    const plurality = tabulatePlurality(renamed.candidates, [...renamed.ballots, userBallot]);
    const journey = describeBallotJourney(userBallot, view.rounds, view.winner);
    const maxScale = view.rounds[0]?.totalActiveBallots ?? 1;
    const trace = traceUserBallot(userBallot, view.rounds);

    return (
      <div className="rcv-results relative z-10">
        <Legend
          items={renamed.candidates.map((c) => ({ name: c.name, color: resultColors[c.name] }))}
        />

        <aside className="rcv-ballot-journey rcv-fade-up mb-6 rounded-sm border border-rule bg-federal-soft p-5">
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

        <MethodComparison
          plurality={plurality}
          rcv={view}
          colorMap={resultColors}
          totalVoters={view.totalVoters}
        />

        <details className="rcv-rounds-disclosure mt-2 [&[open]_.rcv-rounds-caret]:rotate-180">
          <summary className="rcv-rounds-summary flex cursor-pointer list-none items-center gap-2 rounded-sm border border-rule bg-surface px-4 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-federal [&::-webkit-details-marker]:hidden">
            See it count, round by round
            <span className="font-normal normal-case tracking-normal text-ink-soft">
              ({view.rounds.length} {view.rounds.length === 1 ? 'round' : 'rounds'})
            </span>
            <span
              className="rcv-rounds-caret ml-auto text-ink-soft transition-transform"
              aria-hidden="true"
            >
              ▾
            </span>
          </summary>

          <section className="rcv-rounds relative mt-4 space-y-4 sm:pl-12">
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
        </details>
      </div>
    );
  }

  return (
    <div className="rcv-ballot-form relative z-10">
      <Legend
        items={candidates.map((c) => ({ name: effectiveName[c.name], color: colorMap[c.name] }))}
      />

      <section className="rcv-instructions mb-5 rounded-sm border border-rule bg-federal-soft p-4">
        <p className="text-sm leading-relaxed text-ink">
          Pick your favorite first, then your next choices — rank one, two, three, or all four. Use
          each candidate&apos;s number menu to set or change their place, or pick &ldquo;–&rdquo; to
          drop them. If you leave someone blank, your ballot will not move to that person. You can
          also rename the candidates to something familiar; the colors stay put.
        </p>
      </section>

      <ol className="rcv-candidate-choices grid grid-cols-1 gap-3 sm:grid-cols-2">
        {candidates.map((c, i) => {
          const rank = ranks[c.name];
          const isRanked = typeof rank === 'number';
          const color = colorMap[c.name];
          const isDuplicate = duplicateNames.has(effectiveName[c.name]);
          // A ranked candidate can move to any taken position (1..rankedCount);
          // an unranked one can also take the next open slot (rankedCount + 1).
          const maxRank = Math.min(candidates.length, isRanked ? rankedCount : rankedCount + 1);
          const meta = (
            <>
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
            </>
          );
          return (
            <li key={c.name}>
              <div
                className={`rcv-candidate-card rounded-sm border transition ${
                  isRanked ? 'border-federal bg-federal-soft' : 'border-rule bg-surface'
                }`}
                style={isRanked ? { borderLeftColor: color, borderLeftWidth: '3px' } : undefined}
              >
                <div className="rcv-candidate-row flex w-full items-center gap-3 p-4">
                  <label htmlFor={`rcv-rank-${i}`} className="sr-only">
                    Rank for {effectiveName[c.name]}
                  </label>
                  <select
                    id={`rcv-rank-${i}`}
                    value={isRanked ? String(rank) : ''}
                    onChange={(e) => changeRank(c.name, e.currentTarget.value)}
                    className="rcv-rank-select h-9 w-14 shrink-0 appearance-none rounded-sm border bg-no-repeat pl-3 text-left font-mono text-sm font-bold outline-none transition focus:border-federal"
                    style={
                      isRanked
                        ? {
                            backgroundColor: color,
                            color: '#fff',
                            borderColor: color,
                            backgroundImage: caretSvg('%23ffffff'),
                            backgroundPosition: 'right 0.4rem center',
                            backgroundSize: '0.55rem',
                          }
                        : {
                            borderStyle: 'dashed',
                            borderColor: 'var(--rule)',
                            color: 'var(--ink-soft)',
                            backgroundImage: caretSvg('%2351606e'),
                            backgroundPosition: 'right 0.4rem center',
                            backgroundSize: '0.55rem',
                          }
                    }
                  >
                    <option value="">–</option>
                    {Array.from({ length: maxRank }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>

                  {isRanked ? (
                    <span className="rcv-candidate-meta min-w-0">{meta}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToRanking(c.name)}
                      className="rcv-candidate-add min-w-0 text-left"
                    >
                      {meta}
                    </button>
                  )}
                </div>

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
