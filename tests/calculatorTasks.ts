/**
 * Responsibility: capture calculator use cases as business-level Screenplay
 * tasks.
 *
 * Pedagogical decision: tasks compose interactions and assertions in domain
 * language. This is where BDD scenarios gain readable intent instead of
 * becoming procedural Playwright scripts.
 */
import type { CalculationRequest } from '../src/calculatorContracts.js';
import {
  EnterTheCalculation,
  OpenTheCalculator,
  SubmitTheCalculation,
} from './calculatorInteractions.js';
import {
  ensure,
  equals,
  lastResponseStatus,
  remember,
  send,
  task,
  type CalculatorActivity,
} from './screenplay/calculatorScreenplay.js';

export class Calculate {
  static usingTheApi(request: CalculationRequest): CalculatorActivity {
    return task(
      '#actor calculates using the REST API',
      remember('lastCalculationRequest', request),
      send({
        method: 'POST',
        url: '/api/calculations',
        body: request,
      }),
    );
  }

  static usingTheBrowser(request: CalculationRequest): CalculatorActivity {
    return task(
      '#actor calculates using the browser interface',
      remember('lastCalculationRequest', request),
      OpenTheCalculator(),
      EnterTheCalculation(request),
      SubmitTheCalculation(),
    );
  }

  static shouldHaveBeenAccepted(): CalculatorActivity {
    return task(
      '#actor confirms the calculation was accepted',
      ensure(lastResponseStatus(), equals(200)),
    );
  }

  static shouldHaveBeenRejectedAsUnsupported(): CalculatorActivity {
    return task(
      '#actor confirms the calculation was rejected as unsupported',
      ensure(lastResponseStatus(), equals(422)),
    );
  }
}
