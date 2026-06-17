/**
 * Responsibility: prove the pure calculator rules at the bottom of the test
 * pyramid.
 *
 * Pedagogical decision: these tests use Playwright Test as the single test
 * tool, but they avoid HTTP and browser mechanics so failures point directly to
 * business rules.
 */
import { expect, test } from '@playwright/test';
import {
  CalculationValidationError,
  UnsupportedCalculationError,
  calculate,
  validateCalculationRequest,
} from '../src/calculatorDomain.js';

test.describe('Calculator domain', () => {
  test('calculates each supported operation', () => {
    expect(calculate({ leftOperand: 7, operator: 'add', rightOperand: 5 })).toEqual({
      result: 12,
      expression: '7 + 5 = 12',
    });
    expect(calculate({ leftOperand: 7, operator: 'subtract', rightOperand: 5 })).toEqual({
      result: 2,
      expression: '7 - 5 = 2',
    });
    expect(calculate({ leftOperand: 7, operator: 'multiply', rightOperand: 5 })).toEqual({
      result: 35,
      expression: '7 * 5 = 35',
    });
    expect(calculate({ leftOperand: 10, operator: 'divide', rightOperand: 4 })).toEqual({
      result: 2.5,
      expression: '10 / 4 = 2.5',
    });
  });

  test('validates the request shape before calculation', () => {
    expect(() =>
      validateCalculationRequest({
        leftOperand: '7',
        operator: 'power',
        rightOperand: Number.NaN,
      }),
    ).toThrow(CalculationValidationError);
  });

  test('rejects division by zero as an unsupported calculation', () => {
    expect(() =>
      calculate({ leftOperand: 7, operator: 'divide', rightOperand: 0 }),
    ).toThrow(UnsupportedCalculationError);
  });

  // ISTQB boundary-value coverage backing the README's claim: exercise the
  // edges the happy-path examples skip — sign boundaries, magnitude, and a
  // division whose result is finite but does not terminate in decimal.
  test('handles negative operands across the zero boundary', () => {
    expect(calculate({ leftOperand: -7, operator: 'add', rightOperand: 5 })).toEqual({
      result: -2,
      expression: '-7 + 5 = -2',
    });
    expect(calculate({ leftOperand: -7, operator: 'subtract', rightOperand: -5 })).toEqual({
      result: -2,
      expression: '-7 - -5 = -2',
    });
    expect(calculate({ leftOperand: -4, operator: 'multiply', rightOperand: 5 })).toEqual({
      result: -20,
      expression: '-4 * 5 = -20',
    });
  });

  test('computes a large product without losing exactness within safe-integer range', () => {
    expect(calculate({ leftOperand: 1_000_000, operator: 'multiply', rightOperand: 1_000_000 })).toEqual({
      result: 1_000_000_000_000,
      expression: '1000000 * 1000000 = 1000000000000',
    });
  });

  test('divides into a finite but non-terminating result', () => {
    const oneThird = 1 / 3;

    expect(calculate({ leftOperand: 1, operator: 'divide', rightOperand: 3 })).toEqual({
      result: oneThird,
      expression: `1 / 3 = ${oneThird}`,
    });
    expect(Number.isFinite(oneThird)).toBe(true);
  });
});
