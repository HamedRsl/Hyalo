// Fails when a stylesheet uses a physical direction property.
// RTL support depends on logical properties (inline-start, inline-end), so
// left/right have to be spelled out as such. Add `/* physical-ok */` to a
// line when a physical value is really meant, for example a shadow offset.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['projects'];
const banned = [
  /\b(margin|padding|border)-(left|right)\b/,
  /(^|[\s;{])(left|right)\s*:/,
  /\btext-align\s*:\s*(left|right)\b/,
  /\bfloat\s*:\s*(left|right)\b/,
  /\bborder-(top|bottom)-(left|right)-radius\b/,
];

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (name === 'node_modules' || name.startsWith('.')) continue;
    if (statSync(path).isDirectory()) yield* files(path);
    else if (/\.(css|scss)$/.test(name) || /\.ts$/.test(name)) yield path;
  }
}

let failures = 0;
for (const root of roots) {
  for (const file of files(root)) {
    const lines = readFileSync(file, 'utf8').split('\n');
    const isTs = file.endsWith('.ts');
    let inStyles = !isTs;
    lines.forEach((line, i) => {
      if (isTs) {
        if (/styles:\s*[[`]/.test(line)) inStyles = true;
        if (inStyles && /^\s*`[,\]]/.test(line)) inStyles = false;
      }
      if (!inStyles || line.includes('physical-ok')) return;
      if (banned.some((rule) => rule.test(line))) {
        console.error(`${file}:${i + 1}: physical property, use a logical one: ${line.trim()}`);
        failures++;
      }
    });
  }
}

if (failures) {
  console.error(`\n${failures} physical CSS propert${failures === 1 ? 'y' : 'ies'} found.`);
  process.exit(1);
}
