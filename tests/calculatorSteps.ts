/**
 * Responsibility: bind Gherkin sentences to Screenplay actors, tasks, and
 * questions.
 *
 * Pedagogical decision: step definitions intentionally contain only scenario
 * translation and actor setup. Assertions and system operations stay in
 * Screenplay tasks and questions.
 */
import type { Actor } from 'hand-baked-screenplay-pattern';
import {
  Cast,
  Ensure,
  MakeRequests,
  ManageData,
  Stage,
  equals,
  includes,
} from 'hand-baked-screenplay-pattern';
import { createBdd, test } from 'playwright-bdd';
import type { CalculationRequest, CalculatorOperator } from '../src/calculatorContracts.js';
import { Calculate } from './calculatorTasks.js';
import { TheApiCalculation, TheDisplayedCalculation } from './calculatorQuestions.js';
import { PlaywrightApiClient } from './screenplayApiClient.js';
import { BrowseTheWeb } from './screenplayBrowseTheWeb.js';

const { When, Then } = createBdd(test);

interface CalculatorScenarioWorld {
  actor?: Actor;
}

When(
  /^(.+) calculates (-?\d+(?:\.\d+)?) (plus|minus|times|divided by) (-?\d+(?:\.\d+)?) using the REST API$/,
  async function (
    this: CalculatorScenarioWorld,
    { request },
    actorName: string,
    leftOperand: string,
    operatorPhrase: string,
    rightOperand: string,
  ) {
    const actor = actorWhoCanUseTheApi(actorName, new PlaywrightApiClient(request));
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
      Ensure.that(TheApiCalculation.result(), equals(Number(expectedResult))),
    );
  },
);

Then(
  /^the API should reject the calculation with "([^"]+)"$/,
  async function (this: CalculatorScenarioWorld, {}, expectedMessage: string) {
    await actorFrom(this).attemptsTo(
      Calculate.shouldHaveBeenRejectedAsUnsupported(),
      Ensure.that(TheApiCalculation.errorDetails(), includes(expectedMessage)),
    );
  },
);

When(
  /^(.+) calculates (-?\d+(?:\.\d+)?) (plus|minus|times|divided by) (-?\d+(?:\.\d+)?) using the browser interface$/,
  async function (
    this: CalculatorScenarioWorld,
    { page },
    actorName: string,
    leftOperand: string,
    operatorPhrase: string,
    rightOperand: string,
  ) {
    const actor = actorWhoCanUseTheBrowser(actorName, page);
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
      Ensure.that(TheDisplayedCalculation.message(), equals(expectedMessage)),
    );
  },
);

Then(
  /^the displayed error should include "([^"]+)"$/,
  async function (this: CalculatorScenarioWorld, {}, expectedMessage: string) {
    await actorFrom(this).attemptsTo(
      Ensure.that(TheDisplayedCalculation.message(), includes(expectedMessage)),
    );
  },
);

function actorWhoCanUseTheApi(actorName: string, client: PlaywrightApiClient): Actor {
  const stage = new Stage(
    Cast.whereEveryoneCan(MakeRequests.using(client), ManageData.usingAnEmptyStore()),
  );

  return stage.actor(actorName);
}

function actorWhoCanUseTheBrowser(actorName: string, page: Parameters<typeof BrowseTheWeb.using>[0]): Actor {
  const stage = new Stage(
    Cast.whereEveryoneCan(BrowseTheWeb.using(page), ManageData.usingAnEmptyStore()),
  );

  return stage.actor(actorName);
}

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

function actorFrom(world: CalculatorScenarioWorld): Actor {
  if (!world.actor) {
    throw new Error('No actor has performed a calculator action yet.');
  }

  return world.actor;
}
