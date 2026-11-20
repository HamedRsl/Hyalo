import assert from 'node:assert/strict';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const inventoryPath = 'docs/superpowers/specs/2026-11-16-api-audit-inventory.md';
const inventory = await readFile(path.join(root, inventoryPath), 'utf8');
const originals = new Map(
  [...inventory.matchAll(/^\| (API-\d{3})\s*\| ([\w-]+)\s*\| [\w-]+\s*\| P\d\s*\|/gm)]
    .map((match) => [match[1], match[2]]),
);
const differentRoles = new Set(
  [...inventory.matchAll(/^\| (API-\d{3})\s*\| [\w-]+\s*\| different-role\s*\|/gm)].map((match) => match[1]),
);
assert.equal(originals.size, 329, 'Original inventory must contain exactly 329 IDs');
const ledgerPath = process.argv[2] ?? 'docs/api-audit-status.json';
const rows = JSON.parse(await readFile(path.resolve(root, ledgerPath), 'utf8'));
assert.ok(Array.isArray(rows), 'Ledger must be a JSON array');
assert.equal(rows.length, 329, 'Ledger must contain exactly 329 rows');
const statuses = new Set(['resolved', 'partial', 'open', 'different-role']);
const kinds = new Set(['inventory', 'snapshot', 'implementation', 'test', 'context']);
const seen = new Set();
const counts = Object.fromEntries([...statuses].map((status) => [status, 0]));
const cache = new Map();
async function evidenceFile(relative) {
  assert.equal(typeof relative, 'string', 'Evidence path must be a string');
  assert.ok(relative.length && !relative.includes('\\') && !path.isAbsolute(relative), `Use a repository-relative POSIX path: ${relative}`);
  assert.ok(!relative.split('/').includes('..') && !relative.includes(':') && !relative.includes('#'), `Invalid evidence path: ${relative}`);
  if (!cache.has(relative)) {
    const absolute = await realpath(path.resolve(root, relative));
    const within = path.relative(await realpath(root), absolute);
    assert.ok(within && !within.startsWith('..') && !path.isAbsolute(within), `Evidence escapes repository: ${relative}`);
    assert.ok((await stat(absolute)).isFile(), `Evidence is not a file: ${relative}`);
    cache.set(relative, await readFile(absolute, 'utf8'));
  }
  return cache.get(relative);
}
for (const row of rows) {
  assert.deepEqual(Object.keys(row).sort(), ['evidence', 'family', 'id', 'remaining', 'status'], 'Unexpected row fields');
  assert.match(row.id, /^API-\d{3}$/);
  assert.ok(originals.has(row.id), `Unknown original ID: ${row.id}`);
  assert.ok(!seen.has(row.id), `Duplicate ID: ${row.id}`);
  seen.add(row.id);
  assert.equal(row.family, originals.get(row.id), `${row.id}: wrong original family`);
  assert.ok(statuses.has(row.status), `${row.id}: invalid status`);
  counts[row.status]++;
  assert.equal(row.status === 'different-role', differentRoles.has(row.id), `${row.id}: preserve original different-role scope`);
  assert.equal(typeof row.remaining, 'string', `${row.id}: remaining must be a string`);
  if (row.status === 'resolved') assert.equal(row.remaining, '', `${row.id}: resolved cannot retain outstanding work`);
  else assert.ok(row.remaining.trim().length > 15, `${row.id}: explicit remaining work/disposition required`);
  assert.ok(Array.isArray(row.evidence) && row.evidence.length, `${row.id}: evidence required`);
  assert.ok(row.evidence.some((item) => item.kind === 'inventory' && item.path === inventoryPath), `${row.id}: original inventory evidence required`);
  let tested = false;
  for (const item of row.evidence) {
    assert.deepEqual(Object.keys(item).sort(), ['detail', 'kind', 'path'], `${row.id}: evidence schema`);
    assert.ok(kinds.has(item.kind), `${row.id}: invalid evidence kind`);
    assert.ok(typeof item.detail === 'string' && item.detail.trim(), `${row.id}: evidence detail required`);
    const content = await evidenceFile(item.path);
    if (item.kind === 'test') {
      assert.match(item.path, /\.(?:spec|test)\.[cm]?[jt]sx?$/, `${row.id}: test evidence must point to a test file`);
      assert.match(content, /\b(?:it|test)\s*(?:\.[\w]+(?:\([^;]*?\))?)?\s*\(/, `${row.id}: test file has no test case`);
      assert.match(content, /\b(?:expect|assert)\b/, `${row.id}: test file has no assertion`);
      tested = true;
    }
  }
  if (row.status === 'resolved') assert.ok(tested, `${row.id}: resolved requires test evidence`);
}
assert.deepEqual([...seen].sort(), [...originals.keys()].sort(), 'Missing original IDs');
console.log(`API audit ledger valid: ${rows.length} unique original IDs; ${Object.entries(counts).map(([status, count]) => `${count} ${status}`).join(', ')}.`);
console.log('Schema/evidence gate only: component tests and release/browser/device acceptance are separate.');
