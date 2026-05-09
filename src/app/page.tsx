import { sampleElection, tabulate } from '@/lib/election';
import { RoundCard } from '@/components/RoundCard';

export default function Home() {
  const view = tabulate(sampleElection.candidates, sampleElection.ballots);

  return (
    <main className="rcv-home mx-auto max-w-3xl px-6 py-12">
      <header className="rcv-home-header mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          RCV Simulator
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{sampleElection.title}</h1>
        <p className="mt-3 text-slate-600">{sampleElection.context}</p>
      </header>

      <section className="rcv-candidates mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Candidates
        </h2>
        <ul className="rcv-candidate-list mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {sampleElection.candidates.map((c) => (
            <li key={c.name} className="rcv-candidate-card rounded border border-slate-200 p-3">
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-slate-500">{c.blurb}</p>
            </li>
          ))}
        </ul>
      </section>

      {view.winner && (
        <aside className="rcv-winner-banner mb-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Winner
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-900">{view.winner}</p>
          <p className="mt-1 text-sm text-emerald-800">
            Decided in {view.rounds.length} round{view.rounds.length === 1 ? '' : 's'} from{' '}
            {view.totalVoters} ballots.
          </p>
        </aside>
      )}

      {view.tieOptions && (
        <aside className="rcv-tie-banner mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium uppercase tracking-wide text-amber-700">Tie</p>
          <p className="mt-1 text-amber-900">
            Tie between: {view.tieOptions.join(', ')}.
          </p>
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
    </main>
  );
}
