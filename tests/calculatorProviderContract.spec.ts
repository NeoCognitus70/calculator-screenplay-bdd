/** Bounded CAL-24 REST proof using identical domain activities through both providers. */
import { expect, test } from '@playwright/test';
import type { CalculationRequest } from '../src/calculatorContracts.js';
import { TheApiCalculation, TheRememberedCalculation } from './calculatorQuestions.js';
import { Calculate } from './calculatorTasks.js';
import { PlaywrightApiClient } from './screenplayApiClient.js';
import {
  ensure,
  equals,
  includes,
  lastResponseStatus,
  memoryAbilityProvider,
  requestAbilityProvider,
  type CalculatorHttpClient,
  type CalculatorLifecycleEvent,
  type CalculatorProfileAbilities,
  type CalculatorScreenplayProvider,
} from './screenplay/calculatorScreenplay.js';
import { HandBakedScreenplayProvider } from './screenplay/handBakedScreenplayProvider.js';
import { PromiseNativeScreenplayProvider } from './screenplay/promiseNativeScreenplayProvider.js';

const providers: readonly CalculatorScreenplayProvider[] = [
  new HandBakedScreenplayProvider(),
  new PromiseNativeScreenplayProvider(),
];

test('keeps the bounded REST contract equivalent across both Calculator providers', async ({
  request,
}) => {
  const client = new PlaywrightApiClient(request);
  const observations = [];

  for (const provider of providers) {
    observations.push(await runRestContractProfile(provider, client));
  }

  const [handBaked, promiseNative] = observations;
  expect(handBaked.accepted.status).toBe(200);
  expect(handBaked.accepted.result).toBe(48);
  expect(handBaked.accepted.rememberedResult).toBe(48);
  expect(handBaked.rejected.status).toBe(422);
  expect(handBaked.rejected.details).toContain('Division by zero is undefined.');
  expect(handBaked.rejected.assertionFailure).toMatchObject({
    name: 'CalculatorAssertionError',
    message: expect.stringContaining('provider comparison sentinel'),
  });
  expect(handBaked.rejected.originalFailurePreserved).toBe(true);
  expect(handBaked.accepted.descriptions).toEqual({
    task: '#actor calculates using the REST API',
    resultQuestion: 'the API calculation result',
    rememberedQuestion: 'the result derived from the remembered calculation request',
  });
  expect(promiseNative).toEqual(handBaked);
});

async function runRestContractProfile(
  provider: CalculatorScreenplayProvider,
  client: CalculatorHttpClient,
) {
  return {
    accepted: await runAcceptedCalculation(provider, client),
    rejected: await runRejectedCalculation(provider, client),
  };
}

async function runAcceptedCalculation(
  provider: CalculatorScreenplayProvider,
  client: CalculatorHttpClient,
) {
  const scenario = provider.createScenario(
    'REST contract accepts a calculation',
    restAbilities(client),
  );
  const actor = scenario.actor('Avery', 'rest');
  const request: CalculationRequest = {
    leftOperand: 8,
    operator: 'multiply',
    rightOperand: 6,
  };
  const calculation = Calculate.usingTheApi(request);
  const resultQuestion = TheApiCalculation.result();
  const rememberedQuestion = TheRememberedCalculation.result();

  try {
    await actor.attemptsTo(
      calculation,
      Calculate.shouldHaveBeenAccepted(),
      ensure(resultQuestion, equals(48)),
      ensure(rememberedQuestion, equals(48)),
    );
    const status = await actor.answer(lastResponseStatus());
    const result = await actor.answer(resultQuestion);
    const rememberedResult = await actor.answer(rememberedQuestion);
    scenario.finish({ status: 'success' });

    return {
      status,
      result,
      rememberedResult,
      descriptions: {
        task: calculation.description,
        resultQuestion: resultQuestion.description,
        rememberedQuestion: rememberedQuestion.description,
      },
      lifecycle: normalizedLifecycle(scenario.events()),
    };
  } catch (error) {
    scenario.finish({ status: 'failure', error: asError(error) });
    throw error;
  }
}

async function runRejectedCalculation(
  provider: CalculatorScreenplayProvider,
  client: CalculatorHttpClient,
) {
  const scenario = provider.createScenario(
    'REST contract rejects division by zero',
    restAbilities(client),
  );
  const actor = scenario.actor('Avery', 'rest');
  const request: CalculationRequest = {
    leftOperand: 8,
    operator: 'divide',
    rightOperand: 0,
  };
  const calculation = Calculate.usingTheApi(request);
  const detailsQuestion = TheApiCalculation.errorDetails();

  await actor.attemptsTo(
    calculation,
    Calculate.shouldHaveBeenRejectedAsUnsupported(),
    ensure(detailsQuestion, includes('Division by zero is undefined.')),
  );
  const status = await actor.answer(lastResponseStatus());
  const details = await actor.answer(detailsQuestion);

  const failingAssertion = ensure(
    detailsQuestion,
    includes('provider comparison sentinel'),
  );
  let assertionFailure: Error | undefined;
  try {
    await actor.attemptsTo(failingAssertion);
  } catch (error) {
    assertionFailure = asError(error);
  }
  if (!assertionFailure) {
    throw new Error('The deliberately failing REST assertion unexpectedly passed.');
  }

  scenario.finish({ status: 'failure', error: assertionFailure });
  const failedActivity = scenario
    .events()
    .find((event) => event.type === 'activity:fails');
  const finishedScene = scenario
    .events()
    .find((event) => event.type === 'scene:finishes');

  return {
    status,
    details,
    descriptions: {
      task: calculation.description,
      detailsQuestion: detailsQuestion.description,
      failingAssertion: failingAssertion.description,
    },
    assertionFailure: {
      name: assertionFailure.name,
      message: assertionFailure.message,
    },
    originalFailurePreserved:
      failedActivity?.type === 'activity:fails' &&
      failedActivity.error === assertionFailure &&
      finishedScene?.type === 'scene:finishes' &&
      finishedScene.outcome.status === 'failure' &&
      finishedScene.outcome.error === assertionFailure,
    lifecycle: normalizedLifecycle(scenario.events()),
  };
}

function restAbilities(client: CalculatorHttpClient): CalculatorProfileAbilities {
  return {
    rest: [requestAbilityProvider(client), memoryAbilityProvider()],
    browser: [],
  };
}

function normalizedLifecycle(events: readonly CalculatorLifecycleEvent[]) {
  return events.map((event) => {
    switch (event.type) {
      case 'activity:starts':
      case 'activity:finishes':
        return {
          type: event.type,
          actor: event.actor,
          description: event.description,
        };
      case 'activity:fails':
        return {
          type: event.type,
          actor: event.actor,
          description: event.description,
          error: { name: event.error.name, message: event.error.message },
        };
      case 'scene:starts':
        return { type: event.type, description: event.description };
      case 'scene:finishes':
        return {
          type: event.type,
          description: event.description,
          outcome:
            event.outcome.status === 'success'
              ? { status: 'success' }
              : {
                  status: 'failure',
                  error: {
                    name: event.outcome.error.name,
                    message: event.outcome.error.message,
                  },
                },
        };
    }
  });
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
