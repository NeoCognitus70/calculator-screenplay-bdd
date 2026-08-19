/** Bounded CAL-24 REST proof using identical domain activities through both providers. */
import { expect, test } from '@playwright/test';
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
import { providerContractProfile } from './screenplay/providerContractProfile.js';

test('keeps the bounded REST contract equivalent across both Calculator providers', async ({
  request,
}) => {
  expect(providerContractProfile.providers).toHaveLength(
    providerContractProfile.scope.providerCount,
  );
  expect(providerContractProfile.providers.map((entry) => entry.id)).toEqual(
    providerContractProfile.scope.providerIds,
  );
  expect(
    providerContractProfile.providers.map((entry) => entry.create().name),
  ).toEqual(providerContractProfile.scope.providerIds);
  expect(Object.values(providerContractProfile.cases).map((entry) => entry.id)).toEqual(
    providerContractProfile.scope.restCaseIds,
  );
  expect(Object.values(providerContractProfile.cases)).toEqual(
    providerContractProfile.scope.restCases,
  );
  expect(providerContractProfile.executableDomainDescriptions).toEqual(
    providerContractProfile.scope.domainDescriptions,
  );

  const client = new PlaywrightApiClient(request);
  const observations = [];

  for (const entry of providerContractProfile.providers) {
    observations.push(await runRestContractProfile(entry.create(), client));
  }

  const [handBaked, promiseNative] = observations;
  expect(handBaked.accepted.status).toBe(
    providerContractProfile.cases.accepted.expected.status,
  );
  expect(handBaked.accepted.result).toBe(
    providerContractProfile.cases.accepted.expected.result,
  );
  expect(handBaked.accepted.rememberedResult).toBe(
    providerContractProfile.cases.accepted.expected.result,
  );
  expect(handBaked.rejected.status).toBe(
    providerContractProfile.cases.rejected.expected.status,
  );
  expect(handBaked.rejected.details).toContain(
    providerContractProfile.cases.rejected.expected.detail,
  );
  expect(handBaked.rejected.assertionFailure).toMatchObject({
    name: 'CalculatorAssertionError',
    message: expect.stringContaining(
      providerContractProfile.cases.rejected.expected.assertionSentinel,
    ),
  });
  expect(handBaked.rejected.originalFailurePreserved).toBe(true);
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
  const { request, expected } = providerContractProfile.cases.accepted;
  const calculation = Calculate.usingTheApi(request);
  const resultQuestion = TheApiCalculation.result();
  const rememberedQuestion = TheRememberedCalculation.result();

  try {
    await actor.attemptsTo(
      calculation,
      Calculate.shouldHaveBeenAccepted(),
      ensure(resultQuestion, equals(expected.result)),
      ensure(rememberedQuestion, equals(expected.result)),
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
  const { request, expected } = providerContractProfile.cases.rejected;
  const calculation = Calculate.usingTheApi(request);
  const detailsQuestion = TheApiCalculation.errorDetails();

  await actor.attemptsTo(
    calculation,
    Calculate.shouldHaveBeenRejectedAsUnsupported(),
    ensure(detailsQuestion, includes<string>(expected.detail)),
  );
  const status = await actor.answer(lastResponseStatus());
  const details = await actor.answer(detailsQuestion);

  const failingAssertion = ensure(
    detailsQuestion,
    includes<string>(expected.assertionSentinel),
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
