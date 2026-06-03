import type { ElectionView, PluralityView } from '@/lib/election';
import type { ColorMap } from '@/lib/colors';

// Side-by-side scoreboard: the same ballots counted two ways. Plurality (first
// choices only) on the left, ranked-choice on the right, and the takeaway —
// loudest when the two methods crown different winners.
export function MethodComparison({
  plurality,
  rcv,
  colorMap,
  totalVoters,
}: {
  plurality: PluralityView;
  rcv: ElectionView;
  colorMap: ColorMap;
  totalVoters: number;
}) {
  const pluralityWinner = plurality.winner;
  const rcvWinner = rcv.winner;
  const disagree =
    pluralityWinner !== null && rcvWinner !== null && pluralityWinner !== rcvWinner;
  const agree =
    pluralityWinner !== null && rcvWinner !== null && pluralityWinner === rcvWinner;
  const pluralityMax = plurality.tallies[0]?.votes ?? 0;

  return (
    <section className="rcv-method-comparison rcv-fade-up mb-8" style={{ ['--i' as string]: 1 }}>
      <header className="rcv-method-comparison-header mb-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-federal">
          Same ballots, two ways to count
        </p>
        <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-ink">
          {disagree
            ? 'The two systems pick different winners'
            : 'How each system reads this race'}
        </h2>
      </header>

      <div className="rcv-method-columns grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rcv-method-plurality rounded-sm border border-rule bg-surface p-5">
          <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-widest text-ink-soft">
            Plurality · first choices only
          </p>
          <ul className="rcv-plurality-tally mt-3 space-y-2.5">
            {plurality.tallies.map((t) => {
              const pct = pluralityMax > 0 ? (t.votes / pluralityMax) * 100 : 0;
              const isLeader = t.name === pluralityWinner;
              return (
                <li key={t.name} className="rcv-plurality-row">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: colorMap[t.name] }}
                        aria-hidden="true"
                      />
                      <span className={isLeader ? 'font-semibold text-ink' : 'text-ink-soft'}>
                        {t.name}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono tabular-nums text-ink">{t.votes}</span>
                  </div>
                  <span className="mt-1 block h-2 overflow-hidden rounded-sm bg-paper">
                    <span
                      className="block h-full rounded-sm"
                      style={{ width: `${pct}%`, backgroundColor: colorMap[t.name] }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="rcv-plurality-result mt-4 border-t border-rule pt-3 text-sm text-ink-soft">
            {pluralityWinner ? (
              <>
                Winner: <span className="font-semibold text-ink">{pluralityWinner}</span> — most
                first-choice votes, and the count stops there.
              </>
            ) : plurality.tieOptions ? (
              <>Tied for the lead: {plurality.tieOptions.join(', ')}. Plurality can&apos;t break it.</>
            ) : (
              <>No first-choice votes to count.</>
            )}
          </p>
        </div>

        <div
          className="rcv-method-rcv rounded-sm border border-l-2 border-rule bg-surface p-5"
          style={{ borderLeftColor: rcvWinner ? colorMap[rcvWinner] : 'var(--federal)' }}
        >
          <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-widest text-ink-soft">
            Ranked-choice · every ranking counts
          </p>
          {rcvWinner ? (
            <div className="rcv-method-rcv-winner mt-3 flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-white"
                style={{ backgroundColor: colorMap[rcvWinner] }}
                aria-hidden="true"
              >
                ✓
              </span>
              <div>
                <p className="font-display text-xl font-bold tracking-tight text-ink">{rcvWinner}</p>
                <p className="text-sm text-ink-soft">
                  Majority after {rcv.rounds.length} round{rcv.rounds.length === 1 ? '' : 's'}.
                </p>
              </div>
            </div>
          ) : (
            <p className="rcv-method-rcv-tie mt-3 text-ink">
              Tie between: {rcv.tieOptions?.join(', ')}.
            </p>
          )}
          <p className="rcv-method-rcv-note mt-4 border-t border-rule pt-3 text-sm text-ink-soft">
            Trailing candidates drop out and their ballots move to each voter&apos;s next choice,
            until someone clears a majority of {totalVoters} ballots — yours included.
          </p>
        </div>
      </div>

      <p
        className={`rcv-method-takeaway mt-4 border-l-2 bg-surface p-4 text-sm leading-relaxed ${
          disagree ? 'border-flag-red text-ink' : 'border-rule text-ink-soft'
        }`}
      >
        {disagree ? (
          <>
            <span className="font-semibold">Different winners, identical ballots.</span>{' '}
            {pluralityWinner} has the most first-choice votes, but once every voter&apos;s full
            ranking is counted, a majority backs {rcvWinner}. That gap is the case for ranked-choice
            voting.
          </>
        ) : agree ? (
          <>
            <span className="font-semibold">Both systems pick {rcvWinner}.</span> Here the
            first-choice leader held up once rankings were counted — that won&apos;t always happen,
            so try rearranging your ballot.
          </>
        ) : (
          <>
            First choices alone can&apos;t settle this race, but ranked-choice keeps counting until a
            majority forms.
          </>
        )}
      </p>
    </section>
  );
}
