import type { RoundView } from '@/lib/election';
import type { ColorMap } from '@/lib/colors';
import { describeRoundTransfer } from '@/lib/roundExplanation';

export function RoundCard({
  round,
  isFinalRound,
  colorMap,
  maxScale,
  youSupport,
}: {
  round: RoundView;
  isFinalRound: boolean;
  colorMap: ColorMap;
  maxScale: number;
  youSupport: string | null;
}) {
  const thresholdFraction = round.threshold / maxScale;

  return (
    <section className="rcv-round-card relative rounded-sm border border-rule bg-surface p-5 sm:p-6">
      <span
        className="rcv-round-station absolute -left-[2.375rem] top-5 hidden h-7 w-7 items-center justify-center rounded-full border border-rule bg-surface font-mono text-xs font-semibold text-federal sm:flex"
        aria-hidden="true"
      >
        {round.round}
      </span>

      <header className="rcv-round-header mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-base font-bold tracking-tight text-ink">
          Round {round.round}
        </h3>
        <span className="font-mono text-xs text-ink-soft">
          {round.totalActiveBallots} active · {round.threshold} to win
        </span>
      </header>

      <div
        className="rcv-chart relative"
        style={
          {
            '--name-w': '8.25rem',
            '--count-w': '2.75rem',
            '--gap': '0.75rem',
          } as React.CSSProperties
        }
      >
        {/* Majority threshold line, drawn at its true position for this round */}
        <span
          className="rcv-threshold pointer-events-none absolute bottom-0 top-0 z-10 border-l-2 border-dashed border-flag-red/70"
          style={{
            left: 'calc(var(--name-w) + var(--gap) + (100% - var(--name-w) - var(--count-w) - var(--gap) - var(--gap)) * var(--f))',
            ['--f' as string]: thresholdFraction,
          }}
          aria-hidden="true"
        />
        <span
          className="rcv-threshold-label pointer-events-none absolute -top-1 z-10 -translate-x-1/2 whitespace-nowrap font-mono text-[0.625rem] font-semibold uppercase tracking-wide text-flag-red"
          style={{
            left: 'calc(var(--name-w) + var(--gap) + (100% - var(--name-w) - var(--count-w) - var(--gap) - var(--gap)) * var(--f))',
            ['--f' as string]: thresholdFraction,
          }}
          aria-hidden="true"
        >
          majority
        </span>

        <ul className="rcv-tally-list space-y-2.5 pt-3">
          {round.tallies.map((t, i) => {
            const pct = (t.votes / maxScale) * 100;
            const isWinningThisRound = isFinalRound && t.votes >= round.threshold;
            const color = colorMap[t.name];
            const isYou = youSupport === t.name;
            return (
              <li
                key={t.name}
                className="rcv-tally-row grid items-center"
                style={{
                  gridTemplateColumns: 'var(--name-w) 1fr var(--count-w)',
                  columnGap: 'var(--gap)',
                }}
              >
                <span className="rcv-candidate-label flex min-w-0 flex-col text-right">
                  <span
                    className={`truncate text-sm font-semibold ${
                      t.eliminated ? 'text-ink-soft line-through' : 'text-ink'
                    }`}
                  >
                    {t.name}
                  </span>
                  {t.eliminated && (
                    <span className="font-mono text-[0.625rem] uppercase tracking-wide text-ink-soft">
                      out
                    </span>
                  )}
                  {isYou && (
                    <span className="rcv-you-tag font-mono text-[0.625rem] font-semibold uppercase tracking-wide text-federal">
                      ◂ your vote
                    </span>
                  )}
                </span>

                <span className="rcv-bar-track relative block h-7 overflow-hidden rounded-sm bg-paper">
                  <span
                    className={`rcv-bar rcv-bar-fill absolute inset-y-0 left-0 rounded-sm ${
                      t.eliminated ? 'rcv-hatch' : ''
                    } ${isYou ? 'ring-2 ring-inset ring-ink/25' : ''}`}
                    style={
                      {
                        width: `${pct}%`,
                        backgroundColor: t.eliminated ? 'var(--eliminated)' : color,
                        '--i': i,
                      } as React.CSSProperties
                    }
                  />
                  {isWinningThisRound && (
                    <span
                      className="rcv-win-tag absolute inset-y-0 left-0 z-10 flex items-center justify-end pr-2 font-mono text-[0.625rem] font-bold uppercase tracking-wide text-white"
                      style={{ right: `${100 - pct}%` }}
                    >
                      wins ✓
                    </span>
                  )}
                </span>

                <span
                  className={`rcv-tally-count text-right font-mono text-sm tabular-nums ${
                    t.eliminated ? 'text-ink-soft' : 'text-ink'
                  }`}
                >
                  {t.votes}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {round.eliminatedThisRound.length > 0 && (
        <div className="rcv-round-transfer mt-5 border-t border-rule pt-4">
          <p className="rcv-round-explanation text-sm leading-relaxed text-ink-soft">
            {describeRoundTransfer(round.eliminatedThisRound)}
          </p>
          {round.transfers.length > 0 && (
            <div className="rcv-transfer-flow mt-3">
              <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-wide text-ink-soft">
                Where those ballots went
              </p>
              <ul className="mt-2 space-y-1.5">
                {round.transfers.map((transfer, i) => (
                  <li
                    key={`${transfer.from}-${transfer.to ?? 'stopped'}`}
                    className="rcv-transfer-row rcv-fade-up flex items-center gap-2 text-sm"
                    style={{ ['--i' as string]: i }}
                  >
                    <Swatch color={colorMap[transfer.from]} />
                    <span className="text-ink-soft line-through">{transfer.from}</span>
                    <span className="text-ink-soft" aria-hidden="true">
                      →
                    </span>
                    {transfer.to ? (
                      <>
                        <Swatch color={colorMap[transfer.to]} />
                        <span className="font-medium text-ink">{transfer.to}</span>
                      </>
                    ) : (
                      <>
                        <span className="rcv-hatch h-3 w-3 shrink-0 rounded-[2px] bg-eliminated" />
                        <span className="italic text-ink-soft">exhausted</span>
                      </>
                    )}
                    <span className="ml-auto font-mono text-xs font-semibold tabular-nums text-ink">
                      +{transfer.votes}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {isFinalRound && (
        <p className="rcv-round-explanation mt-4 text-sm leading-relaxed text-ink-soft">
          A candidate has crossed the majority line. The count stops here.
        </p>
      )}
    </section>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="rcv-swatch h-3 w-3 shrink-0 rounded-[2px]"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}
