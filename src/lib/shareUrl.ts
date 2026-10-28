// A ranking encoded in the page URL (`?r=Aisha Patel,Carmen Ortiz`) so a
// scenario can be shared as a link. Uses the original (stable) candidate names.
export const RANK_PARAM = 'r';

// The query string is untrusted: drop names that aren't current candidates and
// repeats, without erroring.
export function parseRankParam(search: string, candidateNames: string[]): string[] {
  const value = new URLSearchParams(search).get(RANK_PARAM);
  if (!value) return [];
  const known = new Set(candidateNames);
  const order: string[] = [];
  for (const part of value.split(',')) {
    const name = part.trim();
    if (known.has(name) && !order.includes(name)) order.push(name);
  }
  return order;
}

// Returns `href` with the ranking set, or with it removed when `order` is empty.
export function withRankParam(href: string, order: string[]): string {
  const url = new URL(href);
  if (order.length === 0) {
    url.searchParams.delete(RANK_PARAM);
  } else {
    url.searchParams.set(RANK_PARAM, order.join(','));
  }
  return url.toString();
}

// A shared link seeds the ballot once. Returns the link's ranking plus the URL
// with the param stripped (null when there was none to strip), so the next
// load falls back to the saved ballot instead of re-applying a stale link.
export function consumeRankParam(
  href: string,
  candidateNames: string[]
): { order: string[]; cleanHref: string | null } {
  const url = new URL(href);
  if (!url.searchParams.has(RANK_PARAM)) return { order: [], cleanHref: null };
  return {
    order: parseRankParam(url.search, candidateNames),
    cleanHref: withRankParam(href, []),
  };
}
