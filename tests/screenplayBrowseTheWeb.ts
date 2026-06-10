/**
 * Responsibility: provide a Screenplay ability for browser interaction through
 * Playwright's Page object.
 *
 * Pedagogical decision: the ability owns the Playwright integration. Tasks and
 * questions depend on the intention-revealing ability, not on global browser
 * state or raw fixtures.
 */
import type { Page } from '@playwright/test';
import { Ability } from 'hand-baked-screenplay-pattern';

export class BrowseTheWeb extends Ability {
  static using(page: Page): BrowseTheWeb {
    return new BrowseTheWeb(page);
  }

  protected constructor(readonly page: Page) {
    super();
  }
}
