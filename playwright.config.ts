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

const port = Number.parseInt(process.env.CALCULATOR_PORT ?? '3100', 10);
const baseUrl = process.env.CALCULATOR_BASE_URL ?? `http://127.0.0.1:${port}`;

const bddTestDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'tests/calculatorSteps.ts',
  outputDir: 'features/.features-gen',
});

export default defineConfig({
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: baseUrl,
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
