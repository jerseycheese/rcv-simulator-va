export function describeRoundTransfer(eliminatedNames: string[]): string {
  const names = formatNames(eliminatedNames);
  const verb = eliminatedNames.length === 1 ? 'was' : 'were';

  return `${names} ${verb} out after this round. They cannot win now, so each ballot that counted for them is checked. If a voter ranked someone still in the race, the ballot moves to that person. If not, the ballot stops.`;
}

// Shown when candidates tie for fewest votes. Virginia breaks that tie by lot;
// the simulator can't draw lots, so it says which stand-in rule it used.
export function describeTieBreak(tied: string[], eliminated: string): string {
  return `${formatNames(tied)} tied for the fewest votes. Only one candidate goes out per round. In a real Virginia count, officials draw lots to decide who. This simulator instead takes out the tied candidate listed last on the ballot: ${eliminated}.`;
}

export function describeFinalRound(winner: string | null): string {
  if (winner) return 'A candidate has crossed the majority line. The count stops here.';
  return 'No one crossed the majority line, and the candidates left are tied. The count ends in a tie.';
}

export function formatNames(names: string[]): string {
  if (names.length <= 2) return names.join(' and ');
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

// Takeaway for when the two counts don't both name a winner. Each side is
// described by what it actually did, so a tie on one side is never reported as
// a majority on the other.
export function describeUnsettledTakeaway(
  pluralityWinner: string | null,
  rcvWinner: string | null,
  rcvTieOptions: string[] | null,
): string {
  const rcvSide = rcvWinner
    ? `once rankings are counted, ${rcvWinner} has a majority of the ballots still in the count.`
    : rcvTieOptions && rcvTieOptions.length > 0
      ? `once rankings are counted, the race ends in a tie between ${formatNames(rcvTieOptions)}.`
      : 'ranked-choice has no ballots to count.';
  if (pluralityWinner) return `${pluralityWinner} has the most first-choice votes, but ${rcvSide}`;
  return `First choices alone can't settle this race, and ${rcvSide}`;
}
