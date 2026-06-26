# Product

## Register

product

## Users

Everyday voters — primarily Virginians, but the tool forks cleanly for any state. They arrive curious and often a little wary: they've heard "ranked-choice voting" and want to know what it actually does to their ballot without reading a white paper. Context is a few minutes on a phone or laptop, no account, no prior knowledge assumed. Secondary users are civic educators and election officials who want a neutral thing to point people at.

## Product Purpose

Let someone rank one sample election and watch, round by round, what happens to their ballot — with a plain-language explanation of why at every step. It fills a real gap: the open-source RCV landscape has tabulators, results visualizers, and method-comparison sites, but nothing built for a curious voter to learn by doing. Success is a voter finishing the flow and being able to explain, in their own words, how RCV moved their vote.

## Brand Personality

Friendly, approachable, encouraging — warm enough to coax a hesitant first-timer into clicking, never so playful it undercuts the seriousness of voting. Plain-spoken over technical; jargon like "exhausted ballot" gets explained in place rather than assumed. Non-partisan to the core: the tool teaches a mechanism, it doesn't sell a position.

## Anti-references

- **Partisan / campaign material** — no party colors, slogans, or candidate advocacy. Sample candidates stay on neutral topics (housing, schools, parks).
- **Bureaucratic government form** — not a dense, gray, intimidating gov-form aesthetic that makes people bounce.
- **Flashy data dashboard** — not an over-engineered analytics surface of KPI cards and dense charts; the visualization serves comprehension, not spectacle.
- **Childish / gamified** — no cartoon mascots or points-and-badges treatment that would trivialize the subject.

## Design Principles

- **Learn by doing.** The ballot is the teacher. Every interaction should advance understanding, not just collect input.
- **Explain in place.** When a term or step could lose someone, define it right where it appears — no glossary detours.
- **Neutral by construction.** Non-partisanship is a structural choice (sample content, palette, copy), not a disclaimer bolted on top.
- **Show the journey, not just the result.** The round-by-round transfer of a ballot is the whole point; make the movement legible.
- **Accessible is non-negotiable.** If a voter can't read it or operate it, it failed the mission.

## Accessibility & Inclusion

WCAG 2.1 AA as the floor. The candidate palette is colorblind-aware with AA contrast verified against the paper background (documented in globals.css) — color is never the only signal (hatching marks eliminated bars, labels accompany every color). Full keyboard operability with a visible focus ring (`:focus-visible` outline). Motion respects `prefers-reduced-motion` (all entrance/bar/threshold animations collapse to no-motion). Mobile-responsive down to <640px, where the chart scale and threshold line adapt rather than collapse.
