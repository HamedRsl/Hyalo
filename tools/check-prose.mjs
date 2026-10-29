// House style for written text: no em dashes and no emoji in docs, comments
// or UI copy. Commas, colons or a new sentence read better anyway.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['projects', 'tools', 'README.md', 'CONTRIBUTING.md', 'docs', '.github'];
const extensions = /\.(ts|html|css|md|mjs|json|ya?ml)$/;
const emDash = new RegExp(String.fromCharCode(0x2014));
const emoji = /\p{Extended_Pictographic}/u;

function* files(path) {
  let stat;
  try {
    stat = statSync(path);
  } catch {
    return;
  }
  if (stat.isFile()) {
    if (extensions.test(path)) yield path;
    return;
  }
  for (const name of readdirSync(path)) {
    if (name === 'node_modules' || name === 'public') continue;
    yield* files(join(path, name));
  }
}

let failures = 0;
for (const root of roots) {
  for (const file of files(root)) {
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (emDash.test(line)) {
          console.error(`${file}:${i + 1}: em dash`);
          failures++;
        }
        if (emoji.test(line.replace(/[©®™]/g, ''))) {
          console.error(`${file}:${i + 1}: emoji`);
          failures++;
        }
      });
  }
}

if (failures) process.exit(1);
