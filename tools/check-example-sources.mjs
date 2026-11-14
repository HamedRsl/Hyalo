// Compile the code tabs together as standalone Angular examples.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
await import('./sync-example-sources.mjs');

const root = resolve('.angular/example-source-check');
const files = [];
for (const name of readdirSync('projects/docs/src/app/pages/examples')) {
  const file = join('projects/docs/src/app/pages/examples', name);
  const text = readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const initializer = source.statements.find(ts.isVariableStatement).declarationList.declarations[0]
    .initializer.expression;
  // Generated literals contain only strings, arrays and plain records.
  const literal = (node) =>
    ts.isStringLiteral(node)
      ? node.text
      : ts.isArrayLiteralExpression(node)
        ? node.elements.map(literal)
        : Object.fromEntries(
            node.properties.map((property) => [
              property.name.getText(source).replace(/^['"]|['"]$/g, ''),
              literal(property.initializer),
            ]),
          );
  const data = literal(initializer);
  for (const [index, snippet] of (Array.isArray(data)
    ? data
    : [data, ...(data.variants ?? [])]
  ).entries()) {
    const relative = name.slice(0, -3) + '-' + index;
    const dir = join(root, relative);
    mkdirSync(dir, { recursive: true });
    for (const [ext, code] of [
      ['ts', snippet.ts],
      ['html', snippet.html],
      ['css', snippet.css],
    ])
      writeFileSync(join(dir, 'example.' + ext), code);
    files.push('./' + relative + '/example.ts');
  }
}
writeFileSync(
  join(root, 'tsconfig.json'),
  JSON.stringify({
    extends: '../../tsconfig.json',
    compilerOptions: { noEmit: true, types: [] },
    angularCompilerOptions: { extendedDiagnostics: { defaultCategory: 'suppress' } },
    files,
  }),
);
const result = spawnSync(
  process.execPath,
  ['node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js', '-p', join(root, 'tsconfig.json')],
  { stdio: 'inherit' },
);
if (result.error) throw result.error;
if (result.status) process.exit(result.status);
console.log(`Verified ${files.length} standalone Angular examples.`);
