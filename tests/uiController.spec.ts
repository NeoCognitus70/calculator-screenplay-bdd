/**
 * Responsibility: verify the browser UI controller's resilience to a failed
 * `/api/calculations` request.
 *
 * Pedagogical decision: this sits alongside the other unit-and-api tests
 * (bottom of the pyramid) rather than inside a Gherkin scenario, because it
 * proves an engineering property of the controller (the `data-state`
 * contract is total) rather than a user-facing business rule.
 */
import { expect, test } from '@playwright/test';

test.describe('Calculator UI controller error handling', () => {
  test('settles to a visible error state when the calculations request fails', async ({
    page,
  }) => {
    // CAL-11: before the fix, an aborted/failed fetch left an unhandled
    // rejection and #calculation-result stuck at data-state="idle".
    await page.route('**/api/calculations', (route) => route.abort());

    await page.goto('/');
    await page.getByLabel('Left operand').fill('8');
    await page.getByLabel('Operator').selectOption('multiply');
    await page.getByLabel('Right operand').fill('6');
    await page.getByRole('button', { name: 'Calculate' }).click();

    const result = page.locator('#calculation-result');
    await expect(result).toHaveAttribute('data-state', 'error');
    await expect(result).toHaveText('The calculator service could not be reached.');
  });
});
