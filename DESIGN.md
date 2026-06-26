---
name: RCV Simulator
description: A friendly, non-partisan tool that teaches ranked-choice voting by letting a voter rank a sample ballot and watch it move.
colors:
  paper: "#f3f5f8"
  surface: "#ffffff"
  ink: "#14202e"
  ink-soft: "#51606e"
  rule: "#d9e0e8"
  federal: "#1b3a6b"
  federal-soft: "#e8eef6"
  flag-red: "#9e2b2b"
  eliminated: "#9aa6b2"
  cand-teal: "#0e7068"
  cand-goldenrod: "#8c6209"
  cand-slate-blue: "#34508c"
  cand-plum: "#87295b"
  cand-olive: "#4c6a2b"
  cand-burnt-orange: "#9f481c"
typography:
  display:
    fontFamily: "Libre Franklin, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 600
    letterSpacing: "0.1em"
rounded:
  pip: "2px"
  sm: "4px"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.federal}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "0.625rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
  button-primary-disabled:
    backgroundColor: "{colors.eliminated}"
    textColor: "{colors.surface}"
  candidate-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  candidate-card-selected:
    backgroundColor: "{colors.federal-soft}"
    textColor: "{colors.ink}"
  rank-pip:
    backgroundColor: "{colors.federal}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
---

# Design System: RCV Simulator

## 1. Overview

**Creative North Star: "The Approachable Civic Explainer"**

This is the look of a trustworthy public notice that decided to be warm instead of cold. It borrows the structural calm of official election material — a cool paper ground, a single federal blue, generous rules and dividers — but strips out everything intimidating about a government form. The voice is plain-spoken and encouraging: it wants a hesitant first-timer to click a candidate and learn by doing, not to feel quizzed. Density is low and deliberate; whitespace does the reassuring.

The system rejects four things by construction. It is **not partisan or campaign-shaped** — no party reds and blues in opposition, candidate colors are a neutral categorical set chosen for legibility, not allegiance. It is **not a bureaucratic government form** — no dense gray fields, no walls of fine print. It is **not a flashy data dashboard** — the bar charts serve comprehension of a single ballot's journey, never spectacle or KPI theater. And it is **not childish or gamified** — warmth comes from copy and color, never from mascots, badges, or confetti, because the subject is voting.

Color carries meaning, never decoration. Every candidate hue is a colorblind-aware value verified to AA contrast on the paper ground, and color is always paired with a second signal (a label, a rank number, a diagonal hatch on eliminated bars) so it is never load-bearing alone.

**Key Characteristics:**
- Cool civic paper, not the warm AI cream default
- One federal blue does the structural work; candidate colors are categorical, not partisan
- Plain-language copy that explains jargon in place
- Accessibility (AA, colorblind-aware, keyboard, reduced-motion) is a floor, not a feature

## 2. Colors

A restrained civic palette: a cool near-white ground, one institutional blue, and a categorical set of candidate hues tuned for contrast and colorblind safety.

### Primary
- **Federal Blue** (#1b3a6b): The single structural accent. Carries primary buttons, selected-card borders, the focus ring, eyebrow labels, and section accents. It is the only "official" color in the system.
- **Federal Wash** (#e8eef6): A pale tint of the federal blue used to fill a selected candidate card, signaling "chosen" without shouting.

### Secondary
- **Flag Red** (#9e2b2b): Reserved strictly for validation errors (duplicate names). Never decorative, never an accent — its rarity is what makes it read as "stop."

### Tertiary — Candidate Categorical Set
Six hues, each AA on paper, ordered for maximum perceptual separation including for common color-vision deficiencies:
- **Teal** (#0e7068), **Goldenrod** (#8c6209), **Slate Blue** (#34508c), **Plum** (#87295b), **Olive** (#4c6a2b), **Burnt Orange** (#9f481c).

### Neutral
- **Cool Paper** (#f3f5f8): Body background. Cool, not warm — a deliberate rejection of the cream/sand AI default.
- **Surface** (#ffffff): Cards, panels, inputs.
- **Ink** (#14202e): Primary text. Near-black with a cool cast.
- **Ink Soft** (#51606e): Secondary text, blurbs, labels. Verified ≥4.5:1 on surface.
- **Rule** (#d9e0e8): Borders, dividers, the round-connector line.
- **Eliminated** (#9aa6b2): Muted gray for eliminated candidates and disabled buttons; always reinforced by a diagonal hatch, never color alone.

### Named Rules
**The Neutral-By-Construction Rule.** Candidate colors are categorical, never partisan. Never map a candidate to red-vs-blue opposition or any party signal. The set exists to tell four people apart, not to take a side.

**The Earned Red Rule.** Flag Red (#9e2b2b) appears only on validation errors. If it shows up as an accent or decoration, it's wrong.

## 3. Typography

**Display Font:** Libre Franklin (700/800), with ui-sans-serif fallback
**Body Font:** Public Sans (400/500/600), with ui-sans-serif fallback
**Label/Mono Font:** IBM Plex Mono (500/600)

**Character:** Two American-civic grotesque sans (Libre Franklin, Public Sans — the latter is the US government's own typeface) paired on a weight axis, not a style axis. The display face carries real heft (800, tight tracking); the body stays calm and readable. IBM Plex Mono handles eyebrow labels and rank numbers, lending a quiet "official document" texture without going full institutional.

### Hierarchy
- **Display / Headline** (Libre Franklin 800, ~1.25–1.5rem, tight -0.02em): Panel and result titles ("Your ballot's trip").
- **Body** (Public Sans 400, 0.875rem, line-height 1.6): Instructions, explanations, ballot copy. Kept readable, well under 75ch in the centered column.
- **Emphasis Body** (Public Sans 600): Candidate names, button labels.
- **Label / Eyebrow** (IBM Plex Mono 600, 0.625–0.75rem, uppercase, tracking 0.1em+): Section eyebrows ("CANDIDATES", "YOUR RANKING"), rank pips.

### Named Rules
**The Weight-Axis Rule.** The display and body faces are both grotesque sans; contrast comes from weight and size, never from setting them at similar weights side by side. Don't pair them as if they were a serif/sans contrast — they aren't.

## 4. Elevation

Flat by construction. The system conveys depth through tonal layering and 1px rules, not shadows — surfaces sit on the paper ground separated by borders (`--rule`) and a faint fractal-noise grain (3.5% opacity) that gives the paper texture without lifting anything. This is intentional: shadows would read as "app chrome" and pull the design toward the dashboard aesthetic the product rejects.

### Named Rules
**The No-Lift Rule.** No drop shadows on cards or panels. Separation is a border and a background shift, never elevation. If a surface looks like it's floating, flatten it.

## 5. Components

### Buttons
- **Shape:** Slightly rounded (4px, `rounded-sm`).
- **Primary:** Federal blue fill, white text, 0.625rem×1.25rem padding ("See what happens with my ballot").
- **Hover / Focus:** Darkens to ink (#14202e) on hover; 2px federal focus-visible ring with 2px offset.
- **Disabled:** Eliminated gray (#9aa6b2), not-allowed cursor — appears until at least one candidate is ranked.
- **Tertiary / text actions:** Mono uppercase, ink-soft, underline-on-hover ("Clear", "Reset names", "Vote again").

### Candidate Card (signature component)
- **Corner Style:** 4px.
- **Default:** White surface, rule border.
- **Selected:** Federal-wash fill, federal border, plus a 3px left edge in the candidate's own hue and a filled rank pip. The hue-coded left edge is a deliberate exception to the usual side-stripe ban: here it encodes which candidate, it isn't decoration.
- **Internal Padding:** 1rem; a divided rename sub-region below the choice button.

### Rank Pip
- **Unranked:** Dashed rule border, en-dash, ink-soft — reads as an empty slot.
- **Ranked:** Solid fill in the candidate's hue, white number — the ballot's running order made visual.

### Inputs (Rename field)
- **Style:** White surface, rule border, 4px radius, normal-case (overrides the mono label's uppercase).
- **Focus:** Border shifts to federal.
- **Error:** Border shifts to flag-red with a "Names must be unique." message below.

### Legend
- A horizontal, rule-bounded strip mapping each candidate swatch to its name. Always present so color is never the only key.

## 6. Do's and Don'ts

### Do:
- **Do** keep candidate colors categorical and AA-verified on paper (#f3f5f8). Pair every color with a label, number, or hatch.
- **Do** reserve federal blue (#1b3a6b) as the one structural accent and flag red (#9e2b2b) for errors only.
- **Do** explain jargon ("exhausted ballot") in plain language right where it appears.
- **Do** keep surfaces flat — borders and tonal shifts for separation, never shadows.
- **Do** honor `prefers-reduced-motion`: every entrance, bar-grow, and threshold-draw animation must collapse to no-motion.

### Don't:
- **Don't** make it look like **partisan or campaign material** — no party red-vs-blue, no slogans, no candidate advocacy.
- **Don't** make it look like a **bureaucratic government form** — no dense gray fields, no intimidating fine print.
- **Don't** make it look like a **flashy data dashboard** — no KPI cards, no chart spectacle; the viz serves one ballot's story.
- **Don't** make it **childish or gamified** — no mascots, badges, points, or confetti.
- **Don't** introduce any color outside the locked palette in globals.css.
- **Don't** add a colored side-stripe border anywhere except the candidate card's hue edge, where it carries meaning.
