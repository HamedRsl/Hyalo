import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

// Run the real generator in an isolated fixture, never alter the live pages.
test('copyable examples preserve local data contracts and helpers', () => {
  const root = mkdtempSync(join(tmpdir(), 'hyalo-example-source-'));
  try {
    const pages = join(root, 'projects/docs/src/app/pages');
    mkdirSync(pages, { recursive: true });
    writeFileSync(join(root, 'projects/docs/src/styles.css'), '');
    writeFileSync(
      join(pages, 'fixture.html'),
      '<docs-example><section class="fixture"><p>{{ label(item) }}</p><a>Link</a><textarea></textarea></section></docs-example>',
    );
    writeFileSync(
      join(pages, 'fixture.css'),
      '.fixture :is(a, button, textarea):focus-visible { outline: 2px solid purple; }',
    );
    writeFileSync(
      join(pages, 'fixture.ts'),
      `
import { Component, ChangeDetectionStrategy } from '@angular/core';
interface Item { readonly name: string; }
type State = 'idle' | 'error';
const initialItem: Item = { name: 'Sample' };
function itemLabel(item: Item): string { return item.name; }
@Component({ imports: [], templateUrl: './fixture.html', styleUrl: './fixture.css' })
export default class Page {
  readonly item: Item = initialItem;
  readonly state: State = 'idle';
  readonly label = itemLabel;
}
`,
    );
    const result = spawnSync(process.execPath, [resolve('tools/sync-example-sources.mjs')], {
      cwd: root,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    const generated = readFileSync(join(pages, 'examples/fixture.ts'), 'utf8');
    for (const declaration of [
      'interface Item',
      'type State',
      'const initialItem',
      'function itemLabel',
    ]) {
      assert.ok(generated.includes(declaration), `Missing ${declaration} in copyable TypeScript`);
    }
    assert.ok(generated.includes(':is(a, button, textarea):focus-visible'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
