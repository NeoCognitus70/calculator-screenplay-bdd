/**
 * Calculator's single composition gateway.
 *
 * Provider selection is deliberately static. This module owns scenario
 * creation and all REST/browser ability bindings; callers request only a
 * scenario-scoped Actor for the required profile.
 */
import type { Page } from '@playwright/test';
import { BrowseTheWeb } from '../screenplayBrowseTheWeb.js';
import {
  memoryAbilityProvider,
  provideCalculatorAbility,
  requestAbilityProvider,
  type CalculatorHttpClient,
  type CalculatorScenario,
  type CalculatorScreenplayProvider,
} from './calculatorScreenplay.js';
import { HandBakedScreenplayProvider } from './handBakedScreenplayProvider.js';

const selectedProvider: CalculatorScreenplayProvider = new HandBakedScreenplayProvider();

export const calculatorProviderName = selectedProvider.name;

export interface CalculatorScenarioDependencies {
  readonly description: string;
  readonly apiClient: CalculatorHttpClient;
  readonly page: Page;
}

export function createCalculatorScenario(
  dependencies: CalculatorScenarioDependencies,
): CalculatorScenario {
  return selectedProvider.createScenario(dependencies.description, {
    rest: [requestAbilityProvider(dependencies.apiClient), memoryAbilityProvider()],
    browser: [
      provideCalculatorAbility(BrowseTheWeb.token, () => BrowseTheWeb.using(dependencies.page)),
      memoryAbilityProvider(),
    ],
  });
}
