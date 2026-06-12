/**
 * Responsibility: fail fast, with the exact remedy, when the sibling
 * `hand-baked-screenplay-pattern` checkout this project builds against is
 * missing (or, with --built, not yet built).
 *
 * Decision record: docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md
 */
import { existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const siblingRoot = resolve(repoRoot, '..', 'hand-baked-screenplay-pattern');
const requireBuilt = process.argv.includes('--built');

function fail(lines) {
  console.error(['', 'preflight-screenplay: FAILED', '', ...lines, ''].join('\n'));
  process.exit(1);
}

if (!existsSync(resolve(siblingRoot, 'package.json'))) {
  fail([
    `This project consumes the Screenplay library from a sibling checkout, but none was found at:`,
    `  ${siblingRoot}`,
    '',
    'Remedy — clone the library beside this repository:',
    '  git clone https://github.com/NeoCognitus70/hand-baked-screenplay-pattern ../hand-baked-screenplay-pattern',
    '',
    'Then run:  npm run prepare:screenplay && npm install',
  ]);
}

if (requireBuilt) {
  const distDir = resolve(siblingRoot, 'dist');
  const built = existsSync(distDir) && readdirSync(distDir).length > 0;
  if (!built) {
    fail([
      `The sibling Screenplay library at ${siblingRoot} has not been built (no dist/ output).`,
      '',
      'Remedy:  npm run prepare:screenplay',
    ]);
  }
}

console.log(
  `preflight-screenplay: OK — sibling library present at ${siblingRoot}` +
    (requireBuilt ? ' and built (dist/ exists)' : ''),
);
