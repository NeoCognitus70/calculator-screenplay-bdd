/**
 * Responsibility: connect the browser form to the calculator REST API.
 *
 * Pedagogical decision: this file treats the browser as an adapter. It
 * translates user input into the shared API contract and renders the response
 * without duplicating calculator rules in the frontend.
 */
import {
  type ApiErrorResponse,
  type CalculationRequest,
  type CalculationSuccessResponse,
  type CalculatorOperator,
} from './calculatorContracts.js';

// This module is served to the browser as a standalone ES file (see the static
// allow-list in `calculatorHttpServer.ts`), so it must import only *types* from
// sibling modules — a runtime import (the shared `isCalculatorOperator` guard or
// the `calculatorOperators` array) would make the browser fetch an unserved
// `/calculatorContracts.js` and fail to load. The operator set is therefore a
// local literal, but `satisfies` ties it to the shared `CalculatorOperator`
// type at compile time, so an entry that is not a valid operator fails the build.
const uiOperators = ['add', 'subtract', 'multiply', 'divide'] as const satisfies readonly CalculatorOperator[];

const form = requireElement<HTMLFormElement>('calculator-form');
const resultOutput = requireElement<HTMLOutputElement>('calculation-result');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  void submitCalculation(new FormData(form));
});

form.addEventListener('reset', () => {
  resultOutput.dataset.state = 'idle';
  resultOutput.value = 'Enter values and calculate.';
  resultOutput.textContent = 'Enter values and calculate.';
});

async function submitCalculation(formData: FormData): Promise<void> {
  const request = readCalculationRequest(formData);

  if (!request) {
    showError('Enter finite numbers for both operands.');
    return;
  }

  // The data-state contract is total: every submission must settle to
  // 'success' or 'error', never stay stuck at 'idle' with an unhandled
  // rejection. A network failure (offline, DNS, aborted request) or a
  // response body that is not valid JSON both throw before `response.ok` can
  // be checked, so both the fetch and the body parse are covered.
  try {
    const response = await fetch('/api/calculations', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const body = (await response.json()) as CalculationSuccessResponse | ApiErrorResponse;

    if (!response.ok) {
      showError('details' in body ? body.details.join(' ') : 'The calculation failed.');
      return;
    }

    showResult((body as CalculationSuccessResponse).expression);
  } catch {
    showError('The calculator service could not be reached.');
  }
}

function readCalculationRequest(formData: FormData): CalculationRequest | undefined {
  const leftOperand = readNumber(formData.get('leftOperand'));
  const rightOperand = readNumber(formData.get('rightOperand'));
  const operator = formData.get('operator');

  if (
    leftOperand === undefined ||
    rightOperand === undefined ||
    !isUiOperator(operator)
  ) {
    return undefined;
  }

  return {
    leftOperand,
    operator,
    rightOperand,
  };
}

function readNumber(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  // Reject blank/whitespace-only input as *missing*, not as the number zero:
  // `Number('')` and `Number('   ')` are both `0`, so without this guard an
  // empty operand would silently calculate as zero. A trimmed-empty string is
  // missing input. Numeric zero ('0'), negatives and decimals still pass, and a
  // non-finite value (e.g. 'abc') is rejected by the `Number.isFinite` check.
  if (value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isUiOperator(value: FormDataEntryValue | null): value is CalculatorOperator {
  return typeof value === 'string' && (uiOperators as readonly string[]).includes(value);
}

function showResult(message: string): void {
  resultOutput.dataset.state = 'success';
  resultOutput.value = message;
  resultOutput.textContent = message;
}

function showError(message: string): void {
  resultOutput.dataset.state = 'error';
  resultOutput.value = message;
  resultOutput.textContent = message;
}

function requireElement<ElementType extends HTMLElement>(id: string): ElementType {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Expected #${id} to exist.`);
  }

  return element as ElementType;
}
