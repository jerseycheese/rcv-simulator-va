---
target: RCV Simulator UI
total_score: 34
p0_count: 0
p1_count: 1
timestamp: 2026-06-26T16-21-25Z
slug: src-components-simulator-tsx
---
# Critique: RCV Simulator

## Design Health Score: 34/40 (Good, high end)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Live pips, disabled-until-valid submit, "your vote" tag through rounds; no "ranked 2 of 4" counter |
| 2 | Match System / Real World | 4 | Plain-language throughout; "exhausted ballot" explained in place |
| 3 | User Control and Freedom | 3 | Clear / Reset / Vote-again present; changing rank order means unrank-and-re-add |
| 4 | Consistency and Standards | 4 | Cohesive palette, mono eyebrows, card patterns |
| 5 | Error Prevention | 4 | Submit gated on validity; duplicate-name blocked inline; prototype-pollution guard |
| 6 | Recognition Rather Than Recall | 4 | Always-visible legend, rank recap, "your vote" trace |
| 7 | Flexibility and Efficiency | 2 | No keyboard accelerators; reordering ranks is clunky |
| 8 | Aesthetic and Minimalist Design | 3 | Clean; results view dense; side-stripe tells |
| 9 | Error Recovery | 4 | Dup-names error is plain-language, precise, at source |
| 10 | Help and Documentation | 3 | Self-documenting inline; no contextual term tooltips |

## Anti-Patterns Verdict

Largely NOT AI-generated: cool civic paper (rejects cream default), bespoke candidate-color-flow, round-card timeline, plain civic copy.

One tell: side-tab accent borders. Detector flagged border-l-2 at MethodComparison.tsx:88; same move at Simulator.tsx:97, 169 and MethodComparison.tsx:123. Nuance: hue-coded stripes (RCV winner column, ranked card 3px edge) encode candidate identity = defensible. Federal-blue ones are decorative = the actual slop.

## Priority Issues

- [P1] Rank reordering fights the product's core promise. Clicking a ranked card removes+cascades; reordering should be smoothest interaction. Fix: direct rank reassignment (number control or drag). Command: /impeccable shape
- [P2] Decorative side-stripe borders (detector + LLM agree). Replace federal-blue border-l-2 on instructions/journey/takeaway with full hairline / tinted bg / leading icon. Keep hue-coded edges. Command: /impeccable quieter
- [P2] Results view is a wall (legend + journey + comparison + all rounds at once). Peak moment competes. Fix: sequence or collapse rounds to expand-on-demand. Command: /impeccable layout
- [P3] No "ranked 2 of 4" status text; rankedCount computed but not surfaced.

## Persona Red Flags

- Jordan (first-timer): clicking a ranked card silently removes the rank — surprising destructive toggle.
- Sam (screen-reader): rank toggle button has no aria-pressed / state in accessible name; pip flip to "2" not announced. Highest-impact a11y fix.
- Casey (mobile): rankings live only in component state; refresh/interruption wipes ballot. No persistence.

## Questions

- What if reordering were the easiest thing in the ballot, not the hardest?
- Should your ballot's journey get the stage first instead of everything at once?
- Should a half-finished ballot survive a refresh?
