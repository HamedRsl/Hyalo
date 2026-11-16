import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import ts from 'typescript';
const root = resolve('projects/hyalo');
const entries = new Set([
  '.',
  ...readdirSync(root).filter((name) => existsSync(join(root, name, 'ng-package.json'))),
]);
const edges = new Map([...entries].map((entry) => [entry, new Set()]));
const problems = [];
function* files(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, item.name);
    if (item.isDirectory()) yield* files(file);
    else if (
      item.name.endsWith('.ts') &&
      !item.name.endsWith('.spec.ts') &&
      !file.includes(`${sep}testing${sep}`)
    )
      yield file;
  }
}
for (const file of files(root)) {
  const first = relative(root, file).split(sep)[0];
  const owner = entries.has(first) ? first : '.';
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const visit = (node) => {
    let specifier;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
      specifier = node.moduleSpecifier;
    else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
      specifier = node.arguments[0];
    if (specifier && ts.isStringLiteral(specifier)) {
      const name = specifier.text;
      if (name === '@hyalo/angular' || name.startsWith('@hyalo/angular/')) {
        const target = name === '@hyalo/angular' ? '.' : name.slice('@hyalo/angular/'.length);
        if (!entries.has(target)) problems.push(`${file}: unknown entry point ${name}`);
        else if (target !== owner) edges.get(owner).add(target);
        if (owner !== '.' && target === '.')
          problems.push(`${file}: implementation imports compatibility facade`);
      } else if (name.startsWith('.')) {
        const target = relative(root, resolve(dirname(file), name)).split(sep)[0];
        if (entries.has(target) && target !== owner)
          problems.push(`${file}: relative import crosses into ${target}`);
      }
      if (owner === 'core' && /^(gsap|chart\.js|highlight\.js|jalaali-js)(\/|$)/.test(name))
        problems.push(`${file}: optional engine imported by core`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}
for (const target of edges.get('core') ?? [])
  if (target !== 'core') problems.push(`core depends on ${target}`);
for (const target of edges.get('motion') ?? [])
  if (!['core', 'motion'].includes(target)) problems.push(`motion depends on ${target}`);
const seen = new Set(),
  stack = new Set();
function walk(node, path = []) {
  if (stack.has(node)) {
    problems.push(`cycle: ${[...path, node].join(' -> ')}`);
    return;
  }
  if (seen.has(node)) return;
  stack.add(node);
  for (const next of edges.get(node) ?? []) walk(next, [...path, node]);
  stack.delete(node);
  seen.add(node);
}
for (const entry of entries) walk(entry);
if (process.argv.includes('--built')) {
  const built = resolve('dist/hyalo');
  if (!existsSync(join(built, 'package.json')))
    problems.push('Build the library before checking generated exports');
  else {
    const pkg = JSON.parse(readFileSync(join(built, 'package.json'), 'utf8'));
    for (const entry of entries) {
      const key = entry === '.' ? '.' : './' + entry;
      if (!pkg.exports?.[key]) problems.push(`Missing generated export ${key}`);
    }
    const inspect = (entry, visited = new Set()) => {
      if (visited.has(entry)) return;
      visited.add(entry);
      const exported = pkg.exports?.[entry === '.' ? '.' : './' + entry];
      const file = exported?.default ?? exported?.import;
      if (!file || !existsSync(join(built, file))) {
        problems.push(`Missing build artifact for ${entry}`);
        return;
      }
      const source = readFileSync(join(built, file), 'utf8');
      // Optional engines must remain outside the static import closure of basic controls.
      const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
      for (const node of ast.statements)
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
          const name = node.moduleSpecifier.text;
          if (/^(gsap|chart\.js|highlight\.js|jalaali-js)(\/|$)/.test(name))
            problems.push(`${entry}: eagerly imports ${name}`);
          if (name.startsWith('@hyalo/angular/'))
            inspect(name.slice('@hyalo/angular/'.length), visited);
        }
    };
    for (const entry of ['core', 'button', 'select', 'sparkline']) inspect(entry);
    for (const dependency of ['gsap', 'chart.js', 'highlight.js', 'jalaali-js'])
      if (!pkg.peerDependenciesMeta?.[dependency]?.optional)
        problems.push(`${dependency}: missing optional peer metadata`);
  }
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Package boundaries verified: ${entries.size} entry points, acyclic dependencies${process.argv.includes('--built') ? ', generated exports and isolated engine imports' : ''}`,
  );
