/**
 * Responsibility: guard Calculator's approved immutable Screenplay-provider
 * source across the dependency manifest, lockfile, CI workflows and ADRs.
 *
 * Decision record: docs/adr/0002-consume-screenplay-provider-via-pinned-release.md
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const providerName = 'hand-baked-screenplay-pattern';
const approved = Object.freeze({
  version: '0.3.0',
  tarballUrl:
    'https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/releases/download/v0.3.0/hand-baked-screenplay-pattern-0.3.0.tgz',
  sha256: 'ac5bd1f6d9bddf95c9a42f99f05f093c7875b1835ecd3ae0d5ca2385e810c36d',
  integrity:
    'sha512-paEH0LQFxnc4AtwiYeWd+oyvHYsikPq0jXr5NcL28VP6OfA1b4XoMs7/qti/3UpSucp71ZP7sTzzxi8evXI91w==',
});

const readText = (path) => readFileSync(resolve(repoRoot, path), 'utf8');
const readJson = (path) => JSON.parse(readText(path));
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const manifest = readJson('package.json');
const lockfile = readJson('package-lock.json');
const rootLock = lockfile.packages?.[''];
const providerLock = lockfile.packages?.[`node_modules/${providerName}`];
const providerEntries = Object.keys(lockfile.packages ?? {}).filter(
  (key) => key === `node_modules/${providerName}` || key.endsWith(`/node_modules/${providerName}`),
);

check(
  manifest.dependencies?.[providerName] === approved.tarballUrl,
  `package.json must pin ${providerName} to ${approved.tarballUrl}`,
);
check(
  rootLock?.dependencies?.[providerName] === approved.tarballUrl,
  'package-lock.json root dependency must match the approved tarball URL',
);
check(providerEntries.length === 1, 'package-lock.json must resolve exactly one provider package');
check(providerLock?.version === approved.version, `locked provider version must be ${approved.version}`);
check(providerLock?.resolved === approved.tarballUrl, 'locked provider URL must match the approved release');
check(providerLock?.integrity === approved.integrity, 'locked provider integrity must match the approved asset');
check(
  !Object.keys(lockfile.packages ?? {}).some((key) => key.includes(`../${providerName}`)),
  'package-lock.json must not contain a sibling provider entry',
);

const scriptText = Object.values(manifest.scripts ?? {}).join('\n');
check(!scriptText.includes('preflight-screenplay'), 'the retired sibling preflight must not return');
check(!scriptText.includes('prepare:screenplay'), 'the retired sibling build step must not return');
check(
  manifest.scripts?.verify?.includes('npm run check:screenplay-provider'),
  'npm run verify must execute the provider-pin guard',
);
check(
  !existsSync(resolve(repoRoot, 'scripts/preflight-screenplay.mjs')),
  'scripts/preflight-screenplay.mjs must remain retired',
);

for (const workflow of ['.github/workflows/ci.yml', '.github/workflows/pages.yml']) {
  const contents = readText(workflow);
  check(
    !contents.includes('repository: NeoCognitus70/hand-baked-screenplay-pattern'),
    `${workflow} must not check out a mutable provider repository`,
  );
  check(!contents.includes('npm run prepare:screenplay'), `${workflow} must not build a sibling provider`);
}

const supersededDecision = readText('docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md');
const currentDecision = readText('docs/adr/0002-consume-screenplay-provider-via-pinned-release.md');
check(
  supersededDecision.includes('**Status:** Superseded by [ADR 0002]'),
  'ADR 0001 must remain explicitly superseded by ADR 0002',
);
for (const evidence of [approved.version, approved.tarballUrl, approved.sha256, approved.integrity]) {
  check(currentDecision.includes(evidence), `ADR 0002 must record approved evidence: ${evidence}`);
}

const readme = readText('README.md');
check(readme.includes(approved.tarballUrl), 'README must document the approved provider tarball URL');
check(readme.includes(approved.sha256), 'README must document the published provider SHA-256');
check(!readme.includes(`file:../${providerName}`), 'README must not describe the retired sibling dependency');

if (failures.length > 0) {
  console.error('check-screenplay-provider: FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `check-screenplay-provider: PASS — ${providerName} ${approved.version} is locked to the approved immutable release`,
);
