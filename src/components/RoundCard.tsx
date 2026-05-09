import type { RoundView } from '@/lib/election';

export function RoundCard({ round, isFinalRound }: { round: RoundView; isFinalRound: boolean }) {
  const max = Math.max(...round.tallies.map((t) => t.votes), 1);

  return (
    <section className="rcv-round-card rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="rcv-round-header mb-4 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">Round {round.round}</h3>
        <span className="text-sm text-slate-500">
          {round.totalActiveBallots} active ballots · {round.threshold} to win
        </span>
      </header>

      <ul className="rcv-tally-list space-y-2">
        {round.tallies.map((t) => {
          const pct = (t.votes / max) * 100;
          const isWinningThisRound = isFinalRound && t.votes >= round.threshold;
          return (
            <li
              key={t.name}
              className={`rcv-tally-row flex items-center gap-3 ${t.eliminated ? 'opacity-60' : ''}`}
            >
              <span className="rcv-candidate-name w-36 shrink-0 text-sm font-medium">
                {t.name}
                {t.eliminated && <span className="ml-1 text-xs text-rose-600">(eliminated)</span>}
              </span>
              <span className="rcv-bar-track relative block h-6 flex-1 overflow-hidden rounded bg-slate-100">
                <span
                  className={`rcv-bar absolute inset-y-0 left-0 rounded ${
                    isWinningThisRound
                      ? 'bg-emerald-500'
                      : t.eliminated
                        ? 'bg-rose-300'
                        : 'bg-slate-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="rcv-tally-count w-10 shrink-0 text-right text-sm tabular-nums">
                {t.votes}
              </span>
            </li>
          );
        })}
      </ul>

      {round.eliminatedThisRound && (
        <p className="rcv-round-explanation mt-4 text-sm text-slate-600">
          <strong>{round.eliminatedThisRound}</strong> had the fewest first-choice votes this round.
          Their ballots get redistributed to each voter&apos;s next-ranked candidate.
        </p>
      )}
      {isFinalRound && (
        <p className="rcv-round-explanation mt-4 text-sm text-slate-600">
          A candidate has crossed the {round.threshold}-vote majority threshold. RCV stops here.
        </p>
      )}
    </section>
  );
}
