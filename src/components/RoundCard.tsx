import type { RoundView } from '@/lib/election';
import { describeRoundTransfer } from '@/lib/roundExplanation';

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

      {round.eliminatedThisRound.length > 0 && (
        <div className="rcv-round-transfer mt-4 space-y-3">
          <p className="rcv-round-explanation text-sm text-slate-600">
            {describeRoundTransfer(round.eliminatedThisRound)}
          </p>
          {round.transfers.length > 0 && (
            <div className="rcv-transfer-flow border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Where those ballots went
              </p>
              <ul className="mt-2 space-y-2">
                {round.transfers.map((transfer) => (
                  <li
                    key={`${transfer.from}-${transfer.to ?? 'stopped'}`}
                    className="rcv-transfer-row grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2 text-sm"
                  >
                    <span className="truncate rounded border border-rose-200 bg-rose-50 px-2 py-1 text-rose-900">
                      {transfer.from}
                    </span>
                    <span className="text-slate-400" aria-hidden="true">
                      →
                    </span>
                    <span
                      className={`truncate rounded border px-2 py-1 ${
                        transfer.to
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {transfer.to ?? 'Stopped'}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-1 text-right text-xs font-semibold tabular-nums text-slate-700">
                      {transfer.votes}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {isFinalRound && (
        <p className="rcv-round-explanation mt-4 text-sm text-slate-600">
          A candidate has enough votes to win. The count stops here.
        </p>
      )}
    </section>
  );
}
