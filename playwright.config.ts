/**
 * Responsibility: define the single Playwright test toolchain for fast tests,
 * REST tests, and Gherkin-generated BDD scenarios.
 *
 * Pedagogical decision: the config starts the application once through
 * Playwright's webServer support so tests exercise the same deployed boundary
 * a user would reach in a browser or via HTTP.
 */
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { parsePort } from './src/parsePort.js';

// Parse the port with the same strict parser the application uses (CAL-18), so
// the test toolchain and the app never disagree about what CALCULATOR_PORT means.
const port = parsePort(process.env.CALCULATOR_PORT ?? '3100');
const baseUrl = process.env.CALCULATOR_BASE_URL ?? `http://127.0.0.1:${port}`;

const bddTestDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['tests/calculatorFixtures.ts', 'tests/calculatorSteps.ts'],
  outputDir: 'features/.features-gen',
});

const providerContractSpecs = /calculatorProvider(?:Conformance|Contract)\.spec\.ts/;

export default defineConfig({
  // Single shared webServer with no per-test data isolation: tests run serially
  // (every script also pins --workers=1). Flip to true only once each test owns
  // isolated state or a server-per-worker. See docs/project-structure-and-test-architecture.md.
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: baseUrl,
    // Always-on screenshots aid teaching here; switch to 'only-on-failure' for a
    // larger suite (storage/report cost). See the "Screenshots" section in README.md.
    screenshot: 'on',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: `${baseUrl}/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      CALCULATOR_PORT: String(port),
      CALCULATOR_HOST: '127.0.0.1',
    },
  },
  projects: [
    {
      name: 'unit-and-api',
      testDir: 'tests',
      testMatch: /.*\.spec\.ts/,
      testIgnore: providerContractSpecs,
      // No devices['Desktop Chrome'] profile here (deliberate): only
      // uiController.spec.ts uses the page fixture, and Playwright's default
      // browser settings are sufficient for its one network-abort scenario —
      // headless Chromium either way. Add the profile if a second
      // browser-backed spec needs a specific viewport/UA.
    },
    {
      // CAL-25: a named, bounded profile. npm test excludes this project so
      // npm run verify can run it once before the remaining full suite.
      name: 'provider-contract',
      testDir: 'tests',
      testMatch: providerContractSpecs,
    },
    {
      name: 'bdd',
      testDir: bddTestDir,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
