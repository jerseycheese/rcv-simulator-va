import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// Tailwind's outline-none lands in the utilities layer after the base
// :focus-visible ring in globals.css, so it silently hides the ring.
test('no component kills the global focus-visible ring with outline-none', () => {
  const dir = new URL('../src/components/', import.meta.url);
  const offenders = readdirSync(dir)
    .filter((f) => f.endsWith('.tsx'))
    .filter((f) => /(^|[\s"`])outline-none([\s"`]|$)/m.test(readFileSync(new URL(f, dir), 'utf8')));
  assert.deepEqual(offenders, []);
});
