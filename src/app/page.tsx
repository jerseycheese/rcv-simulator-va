import { sampleElection } from '@/lib/election';
import { Simulator } from '@/components/Simulator';

export default function Home() {
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
          The race
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Four candidates, 20 voters have already submitted ranked ballots. Add your own below to
          see how ranked-choice voting plays out.
        </p>
      </section>

      <Simulator candidates={sampleElection.candidates} baseBallots={sampleElection.ballots} />
    </main>
  );
}
