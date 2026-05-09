# RCV Simulator (Virginia)

A voter-education simulator for ranked-choice voting. Rank a sample election, see what happens to your ballot round-by-round, get a plain-language explanation of why.

Built for [UpVote Virginia](https://www.upvotevirginia.org/) as the first target user, but the whole thing forks cleanly for any state.

**Status:** Building (skeleton bootstrapped, MVP not yet shipped).

## Why this exists

After surveying the open-source RCV landscape (FairVote, NYC Civic Engagement Commission, GitHub) the voter-education shape was missing. There are tabulator libraries, results visualizers, poll-running platforms, and voting-method comparison sites — but nothing where a curious voter can rank one sample election and walk through what RCV actually does with their ballot. That's the gap this fills.

Full landscape notes live in the [ai-for-good](https://github.com/jerseycheese/ai-for-good) knowledge hub under `projects/rcv-simulator.md`.

## MVP scope

- Sample election (4 fictional candidates) with a ranked ballot interface.
- User ranks candidates 1–N.
- Submit runs round-by-round elimination, shows tallies and who got eliminated each round.
- Plain-language explanation per round ("Candidate X had the fewest first-choice votes, so their ballots get redistributed to each voter's second choice.").
- Mobile-responsive, static-deployed.

Stretch: custom candidate lists, RCV-vs-plurality side-by-side, shareable URL scenarios, embed-friendly version for UpVote VA's site.

## Stack

- Next.js 15 (App Router) with `output: 'export'` for static deployment.
- TypeScript + Tailwind.
- [`ranked-voting`](https://www.npmjs.com/package/ranked-voting) ([repo](https://github.com/mikey-t/ranked-voting-ts), MIT) for the IRV tabulation algorithm — no need to reimplement.
- Local component state, no backend, no auth.
- Deploys to Vercel free tier or GitHub Pages.

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
