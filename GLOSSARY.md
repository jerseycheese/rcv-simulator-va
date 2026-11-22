# RCV Simulator

A voter-education simulator: a voter ranks one sample election and watches, round by round, what ranked-choice voting does with their ballot. This glossary fixes the words the code, the on-page copy, and the docs use for the count.

## Language

### The election

**Ranked-choice voting (RCV)**:
The voting method the simulator teaches: voters rank candidates, and the count runs in rounds until one candidate crosses the majority line.
_Avoid_: IRV, instant-runoff, preferential voting

**Sample election**:
The fictional four-candidate race the simulator runs: 20 prepared ballots plus the user ballot.
_Avoid_: Demo data, scenario, test election

**Candidate**:
A named choice in the sample election, with a short non-partisan blurb. The original name is the stable key even after a rename.
_Avoid_: Option, contestant, choice

**Ballot**:
One voter's ranking: an ordered list of candidate names, first choice first.
_Avoid_: Vote, ranking list, submission

**User ballot**:
The ballot the person using the simulator fills in. On-page copy calls it "your ballot".
_Avoid_: My ballot, input ballot, player ballot

**Ranking**:
The order a voter gives the candidates on a ballot. A voter can rank fewer than all of them.
_Avoid_: Preference order, ordering, picks

**First choice**:
The candidate ranked first on a ballot.
_Avoid_: First preference, top pick

### The count

**Tabulation**:
Running the full count over a set of ballots. The `ranked-voting` library counts the rounds, and `src/lib/election.ts` wraps it.
_Avoid_: IRV engine, the algorithm, scoring

**Round**:
One pass of the count: tally each ballot's current choice, then eliminate.
_Avoid_: Stage, step, iteration, pass

**Current choice**:
The candidate a ballot counts for in a round: its highest-ranked candidate still in the race.
_Avoid_: Active choice, top choice, live choice

**Tally**:
A candidate's count of ballots in one round.
_Avoid_: Score, total, vote count

**Ballots still counting**:
The ballots that count for some candidate in a round, which leaves out exhausted ballots. `totalActiveBallots` in code.
_Avoid_: Active ballots, live ballots, valid ballots

**Majority line**:
The number of ballots a candidate needs to win: more than half the ballots still counting in that round. `threshold` in code.
_Avoid_: Quota, 50% mark, winning number

**Eliminated**:
Out of the race for having the fewest votes in a round, and out in every later round. On-page copy says a candidate "was out" or "goes out".
_Avoid_: Dropped, defeated, removed, knocked out

**Transfer**:
The move of a ballot from an eliminated candidate to its next current choice.
_Avoid_: Redistribution, reallocation, reassignment

**Exhausted ballot**:
A ballot with no ranked candidate left in the race, so it stops counting. On-page copy says the ballot "stopped" and names the term in place.
_Avoid_: Spoiled ballot, wasted vote, inactive ballot, dead ballot

**Tie for last**:
Two or more candidates sharing the fewest votes in a round. Virginia's rule takes out one of them per round, not all of them.
_Avoid_: Bottom tie, multi-elimination

**Draw by lot**:
How a tie for last is settled: one tied candidate is picked to go out. The simulator seeds the draw from the ballots, so the same ballots always get the same draw.
_Avoid_: Coin flip, random pick, tiebreaker

**Winner**:
The candidate who crosses the majority line in the final round. A count whose last candidates are tied ends in a tie and has no winner.
_Avoid_: Victor, leader, top candidate

### Explaining the count

**Ballot journey**:
The plain-language story of what happened to the user ballot, round by round.
_Avoid_: Ballot story, walkthrough, recap

**Ballot trace**:
For each round, the candidate the user ballot is counting for, or none once it's exhausted.
_Avoid_: Ballot path, ballot history

**Round explanation**:
The plain-language text on a round that says who went out and what happened to their ballots.
_Avoid_: Round summary, caption, tooltip

**Plurality**:
The method that counts only first choices and names whoever has the most, with no rounds and no transfers.
_Avoid_: First past the post, FPTP, winner-take-all

**Method comparison**:
The side-by-side of plurality and ranked-choice voting run on the same ballots.
_Avoid_: Versus view, showdown, A/B

**Takeaway**:
The one sentence under the method comparison that says what each count did, without arguing for either method.
_Avoid_: Verdict, conclusion, moral

### Saving and sharing

**Rename**:
The user's change to a candidate's displayed name. Ballots, saved state, and shared links keep using the original name.
_Avoid_: Custom candidate, alias

**Saved ballot**:
The in-progress ranking and renames kept in the browser so a refresh doesn't lose them.
_Avoid_: Draft, session, cache

**Shared link**:
A URL that carries a ranking in its `r` parameter. It seeds the ballot once, then the parameter is dropped from the address.
_Avoid_: Permalink, scenario URL, deep link

### Principles

**Civic neutrality**:
The rule that sample candidates, copy, and palette take no side: no parties, no ideology, no case for or against a voting method.
_Avoid_: Unbiased mode, disclaimer

**Explain in place**:
The rule that a term a voter might not know is defined right where it appears on the page, not in a separate glossary.
_Avoid_: Tooltip help, FAQ
