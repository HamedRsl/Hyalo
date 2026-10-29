// Packs dist/hyalo and installs the tarball into node_modules, the way an
// app gets it from npm. The size check then builds against that install, so
// it covers the files list, the exports map and the stylesheet paths, not
// just the compiled code. Run `npm run build:lib` first.
import { execSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const dist = resolve('dist/hyalo');
if (!existsSync(join(dist, 'package.json'))) {
  console.error('dist/hyalo is missing. Run `npm run build:lib` first.');
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), 'hyalo-pack-'));
try {
  const [{ filename }] = JSON.parse(
    execSync(`npm pack "${dist}" --pack-destination "${dir}" --json`, { encoding: 'utf8' }),
  );
  execSync(`npm install --no-save --no-audit --no-fund --ignore-scripts "${join(dir, filename)}"`, {
    stdio: 'inherit',
  });
} finally {
  rmSync(dir, { recursive: true, force: true });
}
