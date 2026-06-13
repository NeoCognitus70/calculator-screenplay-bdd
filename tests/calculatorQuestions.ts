/**
 * Responsibility: define Screenplay questions that observe calculator outcomes
 * without exposing assertion code to browser or HTTP mechanics.
 *
 * Pedagogical decision: questions separate "what we want to know" from "how
 * Playwright or HTTP obtains it", which keeps BDD steps readable.
 */
import {
  LastResponse,
  Question,
  type Answerable,
} from 'hand-baked-screenplay-pattern';
import type {
  ApiErrorResponse,
  CalculationSuccessResponse,
} from '../src/calculatorContracts.js';
import { BrowseTheWeb } from './screenplayBrowseTheWeb.js';

export class TheApiCalculation {
  static result(): Answerable<number> {
    return Question.about('the API calculation result', async (actor) => {
      const body = await actor.answer(LastResponse.body<CalculationSuccessResponse>());
      return body.result;
    });
  }

  static errorDetails(): Answerable<readonly string[]> {
    return Question.about('the API calculation error details', async (actor) => {
      const body = await actor.answer(LastResponse.body<ApiErrorResponse>());
      return body.details;
    });
  }
}

export class TheDisplayedCalculation {
  static message(): Answerable<string> {
    return Question.about('the displayed calculation message', async (actor) => {
      // The controller renders asynchronously after the fetch settles, marking
      // the outcome via data-state. Wait explicitly for a settled render before
      // reading — a one-shot textContent() races the response and flakes on
      // fast CI runners (the element still shows the idle prompt).
      const settled = actor
        .abilityTo(BrowseTheWeb)
        .page.locator(
          '#calculation-result[data-state="success"], #calculation-result[data-state="error"]',
        );

      await settled.waitFor({ state: 'attached' });
      const text = await settled.textContent();

      return text?.trim() ?? '';
    });
  }
}
