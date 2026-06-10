/**
 * Responsibility: capture calculator use cases as business-level Screenplay
 * tasks.
 *
 * Pedagogical decision: tasks compose interactions and assertions in domain
 * language. This is where BDD scenarios gain readable intent instead of
 * becoming procedural Playwright scripts.
 */
import {
  Ensure,
  LastResponse,
  Remember,
  Send,
  Task,
  equals,
} from 'hand-baked-screenplay-pattern';
import type { CalculationRequest } from '../src/calculatorContracts.js';
import {
  EnterTheCalculation,
  OpenTheCalculator,
  SubmitTheCalculation,
} from './calculatorInteractions.js';

export class Calculate {
  static usingTheApi(request: CalculationRequest): Task {
    return Task.where(
      '#actor calculates using the REST API',
      Remember.that('lastCalculationRequest', request),
      Send.a({
        method: 'POST',
        url: '/api/calculations',
        body: request,
      }),
    );
  }

  static usingTheBrowser(request: CalculationRequest): Task {
    return Task.where(
      '#actor calculates using the browser interface',
      Remember.that('lastCalculationRequest', request),
      OpenTheCalculator(),
      EnterTheCalculation(request),
      SubmitTheCalculation(),
    );
  }

  static shouldHaveBeenAccepted(): Task {
    return Task.where(
      '#actor confirms the calculation was accepted',
      Ensure.that(LastResponse.status(), equals(200)),
    );
  }

  static shouldHaveBeenRejectedAsUnsupported(): Task {
    return Task.where(
      '#actor confirms the calculation was rejected as unsupported',
      Ensure.that(LastResponse.status(), equals(422)),
    );
  }
}
