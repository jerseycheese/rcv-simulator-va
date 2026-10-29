# RCV Simulator (Virginia)

A voter-education simulator for ranked-choice voting. Rank a sample election, see what happens to your ballot round-by-round, get a plain-language explanation of why.

Built for Virginia, but forks cleanly for any state.

**Live:** https://jerseycheese.github.io/rcv-simulator-va/

**Status:** Live on GitHub Pages. Core simulator built — a ballot ranked with per-candidate number menus, round-by-round tally, plain-language explanations, candidate renaming, a plurality-vs-RCV comparison, and shareable links (`?r=Aisha Patel,Carmen Ortiz` pre-ranks the ballot). Next up: custom candidate lists.

## Why this exists

After surveying the open-source RCV tools (FairVote, NYC Civic Engagement Commission, GitHub) the voter-education shape was missing. There are tabulator libraries, results visualizers, poll-running platforms, and voting-method comparison sites — but nothing where a curious voter can rank one sample election and walk through what RCV actually does with their ballot. That's the gap this fills.

## MVP scope

- Sample election (4 fictional candidates) with a ranked ballot interface.
- User ranks candidates 1–N.
- Submit runs round-by-round elimination, shows tallies and who got eliminated each round.
- Plain-language explanation per round ("Candidate X was out after this round. If a voter ranked someone still in the race, the ballot moves to that person. If not, the ballot stops.").
- Mobile-responsive, static-deployed.

Stretch: custom candidate lists, embed-friendly version any org can drop into their site.

## Stack

- Next.js 15 (App Router) with `output: 'export'` for static deployment.
- TypeScript + Tailwind.
- [`ranked-voting`](https://www.npmjs.com/package/ranked-voting) ([repo](https://github.com/mikey-t/ranked-voting-ts), MIT) for the IRV tabulation algorithm — no need to reimplement.
- Local component state, no backend, no auth.
- Deploys to GitHub Pages via Actions (`.github/workflows/deploy.yml`) on push to `main`.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To produce the static site:

```bash
npm run build
# output in ./out/
```

## License

MIT. Fork it for your state.
