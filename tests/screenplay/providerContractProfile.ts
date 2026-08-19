/** Executable scope metadata for the deliberately bounded CAL-25 provider proof. */
import type { CalculationRequest } from '../../src/calculatorContracts.js';
import { TheApiCalculation, TheRememberedCalculation } from '../calculatorQuestions.js';
import { Calculate } from '../calculatorTasks.js';
import { ensure, includes, type CalculatorScreenplayProvider } from './calculatorScreenplay.js';
import { HandBakedScreenplayProvider } from './handBakedScreenplayProvider.js';
import { PromiseNativeScreenplayProvider } from './promiseNativeScreenplayProvider.js';

export interface ProviderContractEntry {
  readonly id: string;
  create(): CalculatorScreenplayProvider;
}

interface AcceptedRestCase {
  readonly id: 'accepted-multiplication';
  readonly kind: 'accepted';
  readonly request: CalculationRequest;
  readonly expected: {
    readonly status: 200;
    readonly result: 48;
  };
}

interface RejectedRestCase {
  readonly id: 'rejected-division-by-zero';
  readonly kind: 'rejected';
  readonly request: CalculationRequest;
  readonly expected: {
    readonly status: 422;
    readonly detail: 'Division by zero is undefined.';
    readonly assertionSentinel: 'provider comparison sentinel';
  };
}

const accepted: AcceptedRestCase = {
  id: 'accepted-multiplication',
  kind: 'accepted',
  request: { leftOperand: 8, operator: 'multiply', rightOperand: 6 },
  expected: { status: 200, result: 48 },
};

const rejected: RejectedRestCase = {
  id: 'rejected-division-by-zero',
  kind: 'rejected',
  request: { leftOperand: 8, operator: 'divide', rightOperand: 0 },
  expected: {
    status: 422,
    detail: 'Division by zero is undefined.',
    assertionSentinel: 'provider comparison sentinel',
  },
};

const providers: readonly ProviderContractEntry[] = [
  {
    id: 'hand-baked-v0.3.0',
    create: () => new HandBakedScreenplayProvider(),
  },
  {
    id: 'calculator-promise-native',
    create: () => new PromiseNativeScreenplayProvider(),
  },
];

/**
 * This object is the single executable statement of the approved proof scope.
 * The contract spec compares live provider/case/description data to these
 * invariants, so widening the profile requires an intentional metadata change.
 */
export const providerContractProfile = {
  name: 'calculator-rest-provider-contract-v1',
  providers,
  cases: { accepted, rejected },
  scope: {
    providerCount: 2,
    providerIds: ['hand-baked-v0.3.0', 'calculator-promise-native'],
    restCaseIds: ['accepted-multiplication', 'rejected-division-by-zero'],
    restCases: [
      {
        id: 'accepted-multiplication',
        kind: 'accepted',
        request: { leftOperand: 8, operator: 'multiply', rightOperand: 6 },
        expected: { status: 200, result: 48 },
      },
      {
        id: 'rejected-division-by-zero',
        kind: 'rejected',
        request: { leftOperand: 8, operator: 'divide', rightOperand: 0 },
        expected: {
          status: 422,
          detail: 'Division by zero is undefined.',
          assertionSentinel: 'provider comparison sentinel',
        },
      },
    ],
    domainDescriptions: {
      calculationTask: '#actor calculates using the REST API',
      acceptedOutcomeTask: '#actor confirms the calculation was accepted',
      rejectedOutcomeTask:
        '#actor confirms the calculation was rejected as unsupported',
      resultQuestion: 'the API calculation result',
      rememberedQuestion:
        'the result derived from the remembered calculation request',
      errorDetailsQuestion: 'the API calculation error details',
      deliberateFailure:
        "#actor ensures that the value does include 'provider comparison sentinel'",
    },
  },
  executableDomainDescriptions: {
    calculationTask: Calculate.usingTheApi(accepted.request).description,
    acceptedOutcomeTask: Calculate.shouldHaveBeenAccepted().description,
    rejectedOutcomeTask: Calculate.shouldHaveBeenRejectedAsUnsupported().description,
    resultQuestion: TheApiCalculation.result().description,
    rememberedQuestion: TheRememberedCalculation.result().description,
    errorDetailsQuestion: TheApiCalculation.errorDetails().description,
    deliberateFailure: ensure(
      TheApiCalculation.errorDetails(),
      includes<string>(rejected.expected.assertionSentinel),
    ).description,
  },
} as const;
