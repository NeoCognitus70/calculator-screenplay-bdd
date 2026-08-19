/** Guards CAL-23's single provider/composition boundary. */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const testsRoot = resolve(repoRoot, 'tests');
const failures = [];
const packageJson = JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf8'));

const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const typescriptFiles = filesBelow(testsRoot).filter((path) => path.endsWith('.ts'));
const providerImport = /(?:from\s+|import\s*\()['"]hand-baked-screenplay-pattern['"]/;
const providerImports = typescriptFiles
  .filter((path) => providerImport.test(readFileSync(path, 'utf8')))
  .map((path) => relative(repoRoot, path).replaceAll('\\', '/'))
  .sort();

check(
  JSON.stringify(providerImports) ===
    JSON.stringify([
      'tests/calculatorProviderConformance.spec.ts',
      'tests/screenplay/handBakedScreenplayProvider.ts',
    ]),
  `direct provider imports must be confined to the hand-baked adapter and exported-kit conformance spec; found: ${providerImports.join(', ') || 'none'}`,
);

const steps = readFileSync(resolve(testsRoot, 'calculatorSteps.ts'), 'utf8');
check(!steps.includes('new Stage('), 'calculatorSteps.ts must not construct a Stage');
check(!steps.includes('new Actor('), 'calculatorSteps.ts must not construct an Actor');
check(!steps.includes('hand-baked-screenplay-pattern'), 'calculatorSteps.ts must use the Calculator seam');
check(
  steps.includes("calculatorScenario.actor(actorName, 'rest')") &&
    steps.includes("calculatorScenario.actor(actorName, 'browser')"),
  'calculatorSteps.ts must request both profiles through the scenario gateway',
);

const gateway = readFileSync(
  resolve(testsRoot, 'screenplay/screenplayProviderGateway.ts'),
  'utf8',
);
check(
  gateway.includes('new HandBakedScreenplayProvider()'),
  'the gateway must statically select the hand-baked provider',
);
check(!gateway.includes('process.env'), 'provider choice must not be an environment runtime toggle');
check(
  !gateway.includes('PromiseNativeScreenplayProvider'),
  'the alternate provider must not enter the default BDD/browser gateway',
);

const alternate = readFileSync(
  resolve(testsRoot, 'screenplay/promiseNativeScreenplayProvider.ts'),
  'utf8',
);
check(
  !alternate.includes('hand-baked-screenplay-pattern') &&
    !alternate.includes('@playwright/test'),
  'the Promise-native provider must not reuse hand-baked or Playwright runtime classes',
);

const restProof = readFileSync(
  resolve(testsRoot, 'calculatorProviderContract.spec.ts'),
  'utf8',
);
check(
  restProof.includes("scenario.actor('Avery', 'rest')") &&
    restProof.includes('providerContractProfile') &&
    !restProof.includes('BrowseTheWeb'),
  'the alternate-provider proof must remain confined to the REST profile',
);

const config = readFileSync(resolve(repoRoot, 'playwright.config.ts'), 'utf8');
check(
  packageJson.scripts['test:provider-contract']?.includes(
    '--project=provider-contract',
  ),
  'package.json must expose the named provider-contract project',
);
check(
  packageJson.scripts.verify?.includes('npm run test:provider-contract'),
  'npm run verify must include the named provider-contract profile',
);
check(
  packageJson.scripts.test?.includes('--project=unit-and-api --project=bdd') &&
    !packageJson.scripts.test.includes('--project=provider-contract'),
  'npm test must run the remaining suite without duplicating provider-contract',
);
check(
  config.includes("name: 'provider-contract'") &&
    config.includes('testIgnore: providerContractSpecs'),
  'Playwright must isolate provider-contract from the remaining unit/API project',
);

const fixtures = readFileSync(resolve(testsRoot, 'calculatorFixtures.ts'), 'utf8');
check(
  fixtures.includes('createCalculatorScenario') && fixtures.includes('scenario.finish('),
  'the BDD fixture must own scenario creation and completion',
);

if (failures.length > 0) {
  console.error('check-screenplay-boundary: FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  'check-screenplay-boundary: PASS — static BDD gateway and bounded provider-contract profile are isolated',
);

function filesBelow(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...filesBelow(path));
    else files.push(path);
  }
  return files;
}
