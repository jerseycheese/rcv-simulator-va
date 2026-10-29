import type { RoundView } from '@/lib/election';
import type { ColorMap } from '@/lib/colors';
import { describeFinalRound, describeRoundTransfer, describeTieBreak } from '@/lib/roundExplanation';
import { Swatch } from './Swatch';

export function RoundCard({
  round,
  isFinalRound,
  winner,
  colorMap,
  maxScale,
  youSupport,
}: {
  round: RoundView;
  isFinalRound: boolean;
  winner: string | null;
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

      <header className="rcv-round-header mb-4 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <h3 className="font-display text-base font-bold tracking-tight text-ink">
          Round {round.round}
        </h3>
        <span className="font-mono text-xs text-ink-soft">
          {round.totalActiveBallots} ballots still counting · {round.threshold} to win
        </span>
      </header>

      <div className="rcv-chart relative">
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
                    className={`text-sm font-semibold ${
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
          {round.tieBreak && (
            <p className="rcv-round-tie-break mb-2 text-sm leading-relaxed text-ink-soft">
              {describeTieBreak(round.tieBreak.tied, round.tieBreak.eliminated)}
            </p>
          )}
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
                    key={JSON.stringify([transfer.from, transfer.to])}
                    className="rcv-transfer-row rcv-fade-up flex items-center gap-2 text-sm"
                    style={{ ['--i' as string]: i }}
                  >
                    <Swatch color={colorMap[transfer.from]} />
                    <span className="min-w-0 break-words text-ink-soft line-through">{transfer.from}</span>
                    <span className="text-ink-soft" aria-hidden="true">
                      →
                    </span>
                    {transfer.to ? (
                      <>
                        <Swatch color={colorMap[transfer.to]} />
                        <span className="min-w-0 break-words font-medium text-ink">{transfer.to}</span>
                      </>
                    ) : (
                      <>
                        <span className="rcv-hatch h-3 w-3 shrink-0 rounded-[2px] bg-eliminated" />
                        <span className="min-w-0 break-words italic text-ink-soft">stopped (no one left on the ballot)</span>
                      </>
                    )}
                    <span className="ml-auto shrink-0 font-mono text-xs font-semibold tabular-nums text-ink">
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
          {describeFinalRound(winner)}
        </p>
      )}
    </section>
  );
}
