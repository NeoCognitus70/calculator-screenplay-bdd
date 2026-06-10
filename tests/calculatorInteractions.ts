/**
 * Responsibility: define low-level Screenplay interactions that operate the
 * calculator's browser UI.
 *
 * Pedagogical decision: interactions are the only Screenplay activities here
 * that know Playwright locator mechanics. Higher-level tasks can stay focused
 * on business intent.
 */
import { Interaction } from 'hand-baked-screenplay-pattern';
import type { CalculationRequest } from '../src/calculatorContracts.js';
import { BrowseTheWeb } from './screenplayBrowseTheWeb.js';

export const OpenTheCalculator = () =>
  Interaction.where('#actor opens the calculator', async (actor) => {
    await actor.abilityTo(BrowseTheWeb).page.goto('/');
  });

export const EnterTheCalculation = (request: CalculationRequest) =>
  Interaction.where('#actor enters a calculation', async (actor) => {
    const page = actor.abilityTo(BrowseTheWeb).page;

    await page.getByLabel('Left operand').fill(String(request.leftOperand));
    await page.getByLabel('Operator').selectOption(request.operator);
    await page.getByLabel('Right operand').fill(String(request.rightOperand));
  });

export const SubmitTheCalculation = () =>
  Interaction.where('#actor submits the calculation', async (actor) => {
    await actor.abilityTo(BrowseTheWeb).page.getByRole('button', { name: 'Calculate' }).click();
  });
