/**
 * Responsibility: bind Gherkin sentences to Screenplay actors, tasks, and
 * questions.
 *
 * Pedagogical decision: step definitions intentionally contain only scenario
 * translation and actor setup. Assertions and system operations stay in
 * Screenplay tasks and questions.
 */
import { createBdd } from 'playwright-bdd';
import type { CalculationRequest, CalculatorOperator } from '../src/calculatorContracts.js';
import { test } from './calculatorFixtures.js';
import { Calculate } from './calculatorTasks.js';
import {
  TheApiCalculation,
  TheDisplayedCalculation,
  TheRememberedCalculation,
} from './calculatorQuestions.js';
import {
  ensure,
  equals,
  includes,
  type CalculatorActor,
} from './screenplay/calculatorScreenplay.js';

const { When, Then } = createBdd(test);

interface CalculatorScenarioWorld {
  actor?: CalculatorActor;
}

When(
  /^(.+) calculates (-?\d+(?:\.\d+)?) (plus|minus|times|divided by) (-?\d+(?:\.\d+)?) using the REST API$/,
  async function (
    this: CalculatorScenarioWorld,
    { calculatorScenario },
    actorName: string,
    leftOperand: string,
    operatorPhrase: string,
    rightOperand: string,
  ) {
    const actor = calculatorScenario.actor(actorName, 'rest');
    this.actor = actor;

    await actor.attemptsTo(
      Calculate.usingTheApi(
        calculationRequest(Number(leftOperand), operatorPhrase, Number(rightOperand)),
      ),
    );
  },
);

Then(
  /^the API result should be (-?\d+(?:\.\d+)?)$/,
  async function (this: CalculatorScenarioWorld, {}, expectedResult: string) {
    await actorFrom(this).attemptsTo(
      Calculate.shouldHaveBeenAccepted(),
      ensure(TheApiCalculation.result(), equals(Number(expectedResult))),
      // CAL-12: recall the request Calculate.usingTheApi remembered and prove
      // it explains the observed result (closes the Remember loop; see
      // TheRememberedCalculation in calculatorQuestions.ts).
      ensure(TheRememberedCalculation.result(), equals(Number(expectedResult))),
    );
  },
);

Then(
  /^the API should reject the calculation with "([^"]+)"$/,
  async function (this: CalculatorScenarioWorld, {}, expectedMessage: string) {
    await actorFrom(this).attemptsTo(
      Calculate.shouldHaveBeenRejectedAsUnsupported(),
      ensure(TheApiCalculation.errorDetails(), includes(expectedMessage)),
    );
  },
);

When(
  /^(.+) calculates (-?\d+(?:\.\d+)?) (plus|minus|times|divided by) (-?\d+(?:\.\d+)?) using the browser interface$/,
  async function (
    this: CalculatorScenarioWorld,
    { calculatorScenario },
    actorName: string,
    leftOperand: string,
    operatorPhrase: string,
    rightOperand: string,
  ) {
    const actor = calculatorScenario.actor(actorName, 'browser');
    this.actor = actor;

    await actor.attemptsTo(
      Calculate.usingTheBrowser(
        calculationRequest(Number(leftOperand), operatorPhrase, Number(rightOperand)),
      ),
    );
  },
);

Then(
  /^the displayed result should be "([^"]+)"$/,
  async function (this: CalculatorScenarioWorld, {}, expectedMessage: string) {
    await actorFrom(this).attemptsTo(
      ensure(TheDisplayedCalculation.message(), equals(expectedMessage)),
      // CAL-12: recall the request Calculate.usingTheBrowser remembered and
      // prove it explains the displayed expression (closes the Remember
      // loop; see TheRememberedCalculation in calculatorQuestions.ts).
      ensure(TheRememberedCalculation.expression(), equals(expectedMessage)),
    );
  },
);

Then(
  /^the displayed error should include "([^"]+)"$/,
  async function (this: CalculatorScenarioWorld, {}, expectedMessage: string) {
    await actorFrom(this).attemptsTo(
      ensure(TheDisplayedCalculation.message(), includes(expectedMessage)),
    );
  },
);

function calculationRequest(
  leftOperand: number,
  operatorPhrase: string,
  rightOperand: number,
): CalculationRequest {
  return {
    leftOperand,
    operator: operatorFromPhrase(operatorPhrase),
    rightOperand,
  };
}

function operatorFromPhrase(operatorPhrase: string): CalculatorOperator {
  switch (operatorPhrase) {
    case 'plus':
      return 'add';
    case 'minus':
      return 'subtract';
    case 'times':
      return 'multiply';
    case 'divided by':
      return 'divide';
    default:
      throw new Error(`Unsupported operator phrase: ${operatorPhrase}`);
  }
}

function actorFrom(world: CalculatorScenarioWorld): CalculatorActor {
  if (!world.actor) {
    throw new Error('No actor has performed a calculator action yet.');
  }

  return world.actor;
}
