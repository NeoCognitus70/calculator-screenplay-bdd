/**
 * Responsibility: provide a Screenplay ability for browser interaction through
 * Playwright's Page object.
 *
 * Pedagogical decision: the ability owns the Playwright integration. Tasks and
 * questions depend on the intention-revealing ability, not on global browser
 * state or raw fixtures.
 */
import type { Page } from '@playwright/test';
import { calculatorAbilityToken } from './screenplay/calculatorScreenplay.js';

export interface BrowseTheWebAbility {
  readonly page: Page;
}

export const BrowseTheWeb = {
  token: calculatorAbilityToken<BrowseTheWebAbility>('browse the Calculator web interface'),
  using: (page: Page): BrowseTheWebAbility => ({ page }),
} as const;
