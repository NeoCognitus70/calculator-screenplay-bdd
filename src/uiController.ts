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

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isUiOperator(value: FormDataEntryValue | null): value is CalculatorOperator {
  return (
    value === 'add' ||
    value === 'subtract' ||
    value === 'multiply' ||
    value === 'divide'
  );
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
