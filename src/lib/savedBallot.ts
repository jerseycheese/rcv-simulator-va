// The in-progress ballot, saved to localStorage so a refresh or a long
// interruption doesn't wipe it. Keys are the original (stable) candidate names.
export type SavedBallot = {
  order: string[];
  names: Record<string, string>;
};

export const SAVED_BALLOT_KEY = 'rcv-simulator:ballot';

export function serializeBallot(ballot: SavedBallot): string {
  return JSON.stringify(ballot);
}

// Stored data is untrusted: it may be from an older candidate list, hand-edited,
// or not JSON at all. Keep only entries that match a current candidate, and
// read them as own properties so a "__proto__" key can't reach the prototype.
export function parseSavedBallot(
  raw: string | null,
  candidateNames: string[]
): SavedBallot | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  const { order, names } = data as { order?: unknown; names?: unknown };

  const known = new Set(candidateNames);
  const savedOrder = Array.isArray(order)
    ? order.filter(
        (n, i): n is string => known.has(n) && order.indexOf(n) === i
      )
    : [];

  const savedNames: Record<string, string> = {};
  if (names && typeof names === 'object') {
    for (const name of candidateNames) {
      const value = Object.hasOwn(names, name)
        ? (names as Record<string, unknown>)[name]
        : undefined;
      if (typeof value === 'string') savedNames[name] = value;
    }
  }

  return { order: savedOrder, names: savedNames };
}
