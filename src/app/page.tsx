import { sampleElection } from '@/lib/election';
import { Simulator } from '@/components/Simulator';

export default function Home() {
  return (
    <main className="rcv-home relative z-10 mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="rcv-home-header rcv-fade-up mb-10">
        <p className="rcv-kicker font-mono text-xs font-semibold uppercase tracking-[0.2em] text-federal">
          Ranked-Choice Voting · Virginia
        </p>
        <h1 className="rcv-title mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
          {sampleElection.title}
        </h1>
        <div className="rcv-rule mt-5 flex items-center gap-2" aria-hidden="true">
          <span className="h-1 w-12 bg-federal" />
          <span className="h-1 w-4 bg-flag-red" />
          <span className="h-px flex-1 bg-rule" />
        </div>
        <p className="rcv-dek mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">
          {sampleElection.context}
        </p>
      </header>

      <section className="rcv-candidates rcv-fade-up mb-8" style={{ ['--i' as string]: 1 }}>
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-ink-soft">
          The race
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Four candidates. Twenty voters have already submitted ranked ballots. Add your own below
          to see how ranked-choice voting plays out, round by round.
        </p>
      </section>

      <Simulator candidates={sampleElection.candidates} baseBallots={sampleElection.ballots} />
    </main>
  );
}
