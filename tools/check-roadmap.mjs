// Coverage is a file-evidence gate, not a claim of behavioral acceptance.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';

const entries = JSON.parse(readFileSync('docs/roadmap-families.json', 'utf8'));
const counts = new Map();
const identities = new Set();
const untested = [];
for (const entry of entries) {
  assert.ok(Number.isInteger(entry.phase) && entry.phase >= 1 && entry.phase <= 6, 'Invalid phase');
  assert.ok(typeof entry.family === 'string' && entry.family.length > 0, 'Missing family');
  const identity = `${entry.phase}:${entry.family}`;
  assert.ok(!identities.has(identity), `Duplicate family: ${identity}`);
  identities.add(identity);
  counts.set(entry.phase, (counts.get(entry.phase) ?? 0) + 1);
  assert.ok(['family', 'block'].includes(entry.kind), `Invalid kind: ${identity}`);
  for (const field of ['entryPoints', 'docs', 'tests']) {
    assert.ok(Array.isArray(entry[field]), `Missing ${field}: ${identity}`);
    if (field !== 'tests') assert.ok(entry[field].length > 0, `Empty ${field}: ${identity}`);
    for (const path of entry[field]) {
      assert.ok(
        typeof path === 'string' && !path.includes('..') && !path.includes(':'),
        `Unsafe path: ${path}`,
      );
      assert.ok(existsSync(resolve(path)), `Missing ${field} evidence: ${path}`);
      if (field === 'entryPoints')
        assert.ok(
          existsSync(resolve(dirname(path), 'ng-package.json')),
          `Missing entry-point configuration: ${path}`,
        );
    }
  }
  if (!entry.tests.length) untested.push(identity);
}
assert.deepEqual(untested, [], 'Every scheduled row must retain explicit regression-test evidence');
assert.deepEqual(
  [...counts].sort(([a], [b]) => a - b).map(([, count]) => count),
  [12, 21, 23, 14, 15, 11],
);
assert.equal(entries.filter((entry) => entry.kind === 'block').length, 3);
assert.equal(entries.filter((entry) => entry.phase === 5 && entry.kind === 'family').length, 12);
console.log(
  `Roadmap evidence: ${entries.length} original scheduled rows; 12 Phase 5 families + 3 blocks.`,
);
console.log(
  `Rows without targeted test evidence: ${untested.length}${untested.length ? '\n' + untested.join('\n') : ''}`,
);
console.log(
  'Browser, hydration, accessibility and device-performance acceptance remain separately evidenced gates.',
);
