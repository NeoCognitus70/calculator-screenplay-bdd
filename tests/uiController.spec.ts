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

test.describe('Calculator UI controller input validation (CAL-17)', () => {
  // The form is `novalidate`, so the controller — not the browser's native
  // validation bubble — owns the accessible feedback. A blank/whitespace operand
  // is *missing input* and must settle to an error, never silently calculate as
  // zero (`Number('')` is 0). Numeric zero and decimals are valid and reach the
  // API. (A non-numeric string like 'abc' is unreachable through the
  // `type="number"` inputs; the non-finite path is defended by `readNumber`'s
  // `Number.isFinite` guard and, in depth, by the server's 400 contract test.)
  const missingInputMessage = 'Enter finite numbers for both operands.';

  const cases = [
    { name: 'a blank left operand', left: '', operator: 'multiply', right: '6', state: 'error' },
    { name: 'a blank right operand', left: '8', operator: 'multiply', right: '', state: 'error' },
    { name: 'numeric zero operands', left: '0', operator: 'add', right: '0', state: 'success', text: '0 + 0 = 0' },
    { name: 'decimal operands', left: '2.5', operator: 'multiply', right: '4', state: 'success', text: '2.5 * 4 = 10' },
  ] as const;

  for (const testCase of cases) {
    test(`settles ${testCase.name} to a visible ${testCase.state} state`, async ({ page }) => {
      await page.goto('/');
      await page.getByLabel('Left operand').fill(testCase.left);
      await page.getByLabel('Operator').selectOption(testCase.operator);
      await page.getByLabel('Right operand').fill(testCase.right);
      await page.getByRole('button', { name: 'Calculate' }).click();

      const result = page.locator('#calculation-result');
      await expect(result).toHaveAttribute('data-state', testCase.state);
      await expect(result).toHaveText(
        testCase.state === 'error' ? missingInputMessage : testCase.text,
      );
    });
  }
});
