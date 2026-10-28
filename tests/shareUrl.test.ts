import test from 'node:test';
import assert from 'node:assert/strict';
import { consumeRankParam, parseRankParam, withRankParam } from '../src/lib/shareUrl.ts';

const candidates = ['Aisha Patel', 'Brent Walker', 'Carmen Ortiz', 'Dale Hutchins'];
const base = 'https://example.org/rcv-simulator-va/';

test('a ranking round-trips through the URL', () => {
  const order = ['Dale Hutchins', 'Aisha Patel', 'Carmen Ortiz'];
  const href = withRankParam(base, order);
  assert.deepEqual(parseRankParam(new URL(href).search, candidates), order);
});

test('drops unknown names and repeats instead of erroring', () => {
  const search = '?r=Ghost,Carmen%20Ortiz,Carmen+Ortiz,__proto__,,Brent%20Walker';
  assert.deepEqual(parseRankParam(search, candidates), ['Carmen Ortiz', 'Brent Walker']);
  assert.deepEqual(parseRankParam('', candidates), []);
});

test('an empty ranking removes the param and keeps the path', () => {
  const href = withRankParam(`${base}?r=Aisha+Patel&x=1`, []);
  assert.equal(href, `${base}?x=1`);
});

test('a shared link seeds once, then the saved ballot wins on the next load', () => {
  const first = consumeRankParam(`${base}?r=Aisha+Patel&x=1`, candidates);
  assert.deepEqual(first.order, ['Aisha Patel']);
  assert.equal(first.cleanHref, `${base}?x=1`);

  const second = consumeRankParam(first.cleanHref as string, candidates);
  assert.deepEqual(second, { order: [], cleanHref: null });
});
