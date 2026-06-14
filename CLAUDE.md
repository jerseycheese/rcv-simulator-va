# CLAUDE.md — RCV Simulator (Virginia)

Voter-education tool: an interactive ranked-choice voting simulator built for Virginia audiences, forkable for any state. Next.js 15 App Router, fully static (`output: 'export'` in next.config.mjs) — no backend, no API routes, no analytics, no external data at runtime. The civic framing is a feature, not styling: non-partisan content, plain language, accessible palette.

## Run it

```bash
npm run dev    # bash scripts/dev.sh — computes this checkout's port, frees it, starts next dev
```

Port logic (`scripts/worktree-port.cjs`):

- Main checkout: 3000.
- Linked worktrees: a stable hash of the worktree path mapped into 3001–3899, so each worktree keeps its own port across sessions.
- Override: `PORT=3050 npm run dev` wins.

Verify: the dev script prints the chosen port; `curl -s localhost:<port> | head -1` returns HTML. Don't hardcode 3000 in tooling — only the main checkout owns it, and narraitor's dev server also defaults to 3000, so don't run both main checkouts at once.

## Test and lint

```bash
npm test             # node --test tests/*.test.ts (Node's built-in runner; TS runs natively)
npm run type-check   # tsc --noEmit --incremental false
npm run lint         # eslint . (flat config: next/core-web-vitals + next/typescript)
npm run format       # prettier --write . (optional; not a gate)
```

Type-check, lint, and tests all must pass before any commit. Passing: `npm test` reports every test passing with exit 0; type-check and lint exit clean. CI (`.github/workflows/ci.yml`) runs the same checks plus the build on every push and PR.

## Layout

```
src/app/          layout.tsx, page.tsx (mounts the Simulator), globals.css (civic palette)
src/components/   Simulator.tsx (ballot + state), RoundCard.tsx (round tallies),
                  MethodComparison.tsx (plurality vs RCV side by side)
src/lib/          election.ts (ballot types + tabulation via the ranked-voting lib),
                  ballotJourney.ts / ballotTrace.ts (plain-language ballot explanations),
                  colors.ts (stable candidate colors), roundExplanation.ts
tests/            *.test.ts per lib module
scripts/          dev.sh, worktree-port.cjs, kill-port.sh (port management)
```

## Hard rules

- Static export: no API routes, no SSR data fetching, no next/image optimization (`unoptimized: true`). Build output is `out/`.
- Don't reimplement IRV. The `ranked-voting` npm package owns tabulation; `src/lib/election.ts` wraps it.
- Civic neutrality: sample candidates keep non-partisan blurbs (housing, schools, parks — no parties, no ideology). Explanations stay plain-language; jargon like "exhausted ballot" gets explained in place.
- The palette is colorblind-aware with AA contrast on the paper background (documented in globals.css). Don't introduce colors outside it.
- Candidate names are user-editable state. Keep the prototype-pollution guard (`__proto__` keys) and collision-proof name keys — both were deliberate fixes.

## Common tasks

1. Change tabulation behavior or sample data: `src/lib/election.ts`, then `npm test` (election.test.ts covers transfers, renames, and the plurality comparison).
2. Adjust round-by-round explanations: `ballotJourney.ts` / `roundExplanation.ts` plus their tests.
3. Visual changes: stay inside the globals.css palette; verify mobile at <640px (that breakpoint had a dedicated fix pass).

## Known failure modes

- Port already in use → dev.sh frees its own computed port via kill-port.sh; if something else squats on it, `lsof -iTCP:<port>` and deal with that process.
- Hydration warnings → some were deliberately suppressed; check git history before "fixing" them.
- `.claude/launch.json` hardcodes port 3000 — only correct for the main checkout.

## Pointers

- README.md — MVP scope, stack, deploy status (static export; deployment is the next milestone).
- scripts/worktree-port.cjs — the port derivation, commented.
