/** Scenario-scoped Calculator provider/Actor composition for BDD tests. */
import type { TestInfo } from '@playwright/test';
import { test as bddTest } from 'playwright-bdd';
import { PlaywrightApiClient } from './screenplayApiClient.js';
import type {
  CalculatorScenario,
  CalculatorSceneOutcome,
} from './screenplay/calculatorScreenplay.js';
import { createCalculatorScenario } from './screenplay/screenplayProviderGateway.js';

export interface CalculatorFixtures {
  readonly calculatorScenario: CalculatorScenario;
}

export const test = bddTest.extend<CalculatorFixtures>({
  calculatorScenario: async ({ page, request }, use, testInfo) => {
    const scenario = createCalculatorScenario({
      description: testInfo.titlePath.join(' › '),
      apiClient: new PlaywrightApiClient(request),
      page,
    });

    try {
      await use(scenario);
    } finally {
      scenario.finish(outcomeFrom(testInfo));
    }
  },
});

function outcomeFrom(testInfo: TestInfo): CalculatorSceneOutcome {
  if (testInfo.status === 'passed') return { status: 'success' };

  return {
    status: 'failure',
    error: new Error(
      testInfo.error?.message ??
        `Calculator scenario finished with status ${testInfo.status ?? 'unknown'}.`,
    ),
  };
}
