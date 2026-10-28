import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// Tailwind's outline utilities land in the utilities layer after the base
// :focus-visible ring in globals.css, so any of them silently hides the ring,
// with or without a variant prefix like focus: or focus-visible:.
const killsRing = /(^|[\s"'`:!])outline-(none|0)([\s"'`]|$)/m;

test('the matcher catches every way to hide the ring', () => {
  for (const cls of ['outline-none', 'focus:outline-none', 'focus-visible:outline-none', 'outline-0']) {
    assert.ok(killsRing.test(`<div className="p-2 ${cls}" />`), cls);
  }
  assert.ok(!killsRing.test('<div className="outline-2 outline-offset-2" />'));
});

test('no component or app file kills the global focus-visible ring', () => {
  const offenders = ['../src/components/', '../src/app/'].flatMap((rel) => {
    const dir = new URL(rel, import.meta.url);
    return readdirSync(dir, { recursive: true })
      .map(String)
      .filter((f) => f.endsWith('.tsx'))
      .filter((f) => killsRing.test(readFileSync(new URL(f, dir), 'utf8')))
      .map((f) => rel + f);
  });
  assert.deepEqual(offenders, []);
});
