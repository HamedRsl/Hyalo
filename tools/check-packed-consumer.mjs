// Fresh consumer smoke test. No project node_modules or lockfile is modified.
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = resolve('.');
const scratch = process.env.TMPDIR;
assert.ok(scratch, 'TMPDIR must point to the Hermes scratch directory');
const dir = mkdtempSync(join(scratch, 'hyalo-consumer-'));
const npmCli =
  process.env.npm_execpath ?? join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
assert.ok(existsSync(npmCli), 'Run this check with npm run check:consumer so npm_cli is known');
const run = (command, args) => {
  const result = spawnSync(process.execPath, command === 'npm' ? [npmCli, ...args] : args, {
    cwd: dir,
    encoding: 'utf8',
    shell: false,
  });
  if (result.status !== 0) throw new Error(`${command} failed\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
};
try {
  const packed = JSON.parse(
    run('npm', ['pack', resolve('dist/hyalo'), '--json', '--pack-destination', dir]),
  );
  const dependencies = {};
  for (const name of [
    '@angular/core',
    '@angular/common',
    '@angular/compiler',
    '@angular/compiler-cli',
    '@angular/forms',
    '@angular/platform-browser',
    '@angular/aria',
    '@angular/cdk',
    'rxjs',
    'typescript',
  ]) {
    dependencies[name] = JSON.parse(
      readFileSync(join(root, 'node_modules', name, 'package.json'), 'utf8'),
    ).version;
  }
  dependencies['@hyalo/angular'] = `file:./${packed[0].filename}`;
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ private: true, type: 'module', dependencies }),
  );
  console.log(
    run('npm', ['install', '--omit=optional', '--ignore-scripts', '--no-audit', '--no-fund']),
  );
  for (const name of [
    'gsap',
    'chart.js',
    'highlight.js',
    'jalaali-js',
    'three',
    '@tiptap/core',
    '@fullcalendar/core',
    'luxon',
  ]) {
    assert.equal(
      existsSync(join(dir, 'node_modules', name)),
      false,
      `Unexpected optional engine: ${name}`,
    );
  }
  writeFileSync(
    join(dir, 'main.ts'),
    `
import { Component } from '@angular/core';
import { provideHyalo } from '@hyalo/angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HySelect } from '@hyalo/angular/select';
import { HySparkline } from '@hyalo/angular/sparkline';
@Component({selector:'consumer-root',imports:[HyButton,HySelect,HySparkline],template:'<button hyButton>Continue</button><hy-select [options]="options" /><hy-sparkline label="Trend" [data]="[1,2,3]" />'})
export class Consumer { readonly options=[{value:1,label:'One'}]; }
export const providers=provideHyalo();
`,
  );
  writeFileSync(
    join(dir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ES2022',
        moduleResolution: 'bundler',
        strict: true,
        experimentalDecorators: true,
        skipLibCheck: true,
        outDir: './out',
      },
      angularCompilerOptions: { strictTemplates: true },
      files: ['main.ts'],
    }),
  );
  console.log(
    run('node', [
      'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js',
      '-p',
      'tsconfig.json',
    ]),
  );
  writeFileSync(
    join(dir, 'smoke.mjs'),
    `import '@angular/compiler';
for(const entry of ['core','button','select','sparkline']) {
  const module=await import('@hyalo/angular/'+entry);
  if(!Object.keys(module).length) throw new Error('Empty export '+entry);
  console.log('Loaded packed entry: '+entry);
}
`,
  );
  console.log(run('node', ['smoke.mjs']));
  console.log('Fresh packed-consumer compile and imports passed without optional engines.');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
