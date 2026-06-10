/**
 * Responsibility: hold the pure calculator rules without HTTP, browser, or
 * Playwright concerns.
 *
 * Pedagogical decision: this is the base of the test pyramid. Most examples
 * should prove behavior here first because pure functions are fast, precise,
 * and easy to reason about.
 */
import {
  type CalculationRequest,
  type CalculationSuccessResponse,
  type CalculatorOperator,
  isCalculatorOperator,
} from './calculatorContracts.js';

export class CalculationValidationError extends Error {
  constructor(readonly details: readonly string[]) {
    super('The calculation request is invalid.');
  }
}

export class UnsupportedCalculationError extends Error {
  constructor(readonly details: readonly string[]) {
    super('The calculation cannot be performed.');
  }
}

export function validateCalculationRequest(candidate: unknown): CalculationRequest {
  if (!isObjectRecord(candidate)) {
    throw new CalculationValidationError(['Request body must be a JSON object.']);
  }

  const details: string[] = [];
  const leftOperand = candidate.leftOperand;
  const operator = candidate.operator;
  const rightOperand = candidate.rightOperand;

  if (!isFiniteNumber(leftOperand)) {
    details.push('leftOperand must be a finite number.');
  }

  if (!isCalculatorOperator(operator)) {
    details.push('operator must be one of: add, subtract, multiply, divide.');
  }

  if (!isFiniteNumber(rightOperand)) {
    details.push('rightOperand must be a finite number.');
  }

  if (details.length > 0) {
    throw new CalculationValidationError(details);
  }

  return {
    leftOperand: leftOperand as number,
    operator: operator as CalculationRequest['operator'],
    rightOperand: rightOperand as number,
  };
}

export function calculate(request: CalculationRequest): CalculationSuccessResponse {
  if (request.operator === 'divide' && request.rightOperand === 0) {
    throw new UnsupportedCalculationError(['Division by zero is undefined.']);
  }

  const result = applyOperator(request.operator, request.leftOperand, request.rightOperand);

  return {
    result,
    expression: `${request.leftOperand} ${symbolFor(request.operator)} ${request.rightOperand} = ${result}`,
  };
}

function applyOperator(operator: CalculatorOperator, leftOperand: number, rightOperand: number): number {
  switch (operator) {
    case 'add':
      return leftOperand + rightOperand;
    case 'subtract':
      return leftOperand - rightOperand;
    case 'multiply':
      return leftOperand * rightOperand;
    case 'divide':
      return leftOperand / rightOperand;
  }
}

function symbolFor(operator: CalculatorOperator): string {
  switch (operator) {
    case 'add':
      return '+';
    case 'subtract':
      return '-';
    case 'multiply':
      return '*';
    case 'divide':
      return '/';
  }
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
