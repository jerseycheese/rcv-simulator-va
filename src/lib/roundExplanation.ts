export function describeRoundTransfer(eliminatedNames: string[]): string {
  const names = formatNames(eliminatedNames);
  const verb = eliminatedNames.length === 1 ? 'was' : 'were';

  return `${names} ${verb} out after this round. They cannot win now, so each ballot that counted for them is checked. If a voter ranked someone still in the race, the ballot moves to that person. If not, the ballot stops.`;
}

export function describeFinalRound(winner: string | null): string {
  if (winner) return 'A candidate has crossed the majority line. The count stops here.';
  return 'No one crossed the majority line, and the candidates left are tied. The count ends in a tie.';
}

export function formatNames(names: string[]): string {
  if (names.length <= 2) return names.join(' and ');
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}
