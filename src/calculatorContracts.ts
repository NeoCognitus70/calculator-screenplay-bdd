/**
 * Responsibility: define the API-facing calculator contract shared by the
 * server, UI, and tests.
 *
 * Pedagogical decision: keeping transport contracts separate from business
 * logic makes the REST boundary explicit and gives the Screenplay tests stable
 * typed data to talk about.
 */

export const calculatorOperators = ['add', 'subtract', 'multiply', 'divide'] as const;

export type CalculatorOperator = (typeof calculatorOperators)[number];

export interface CalculationRequest {
  readonly leftOperand: number;
  readonly operator: CalculatorOperator;
  readonly rightOperand: number;
}

export interface CalculationSuccessResponse {
  readonly result: number;
  readonly expression: string;
}

export interface ApiErrorResponse {
  readonly error: string;
  readonly details: readonly string[];
}

export type CalculationResponse = CalculationSuccessResponse | ApiErrorResponse;

export function isCalculatorOperator(value: unknown): value is CalculatorOperator {
  return (
    typeof value === 'string' &&
    calculatorOperators.includes(value as CalculatorOperator)
  );
}

export function isCalculationSuccessResponse(
  response: CalculationResponse,
): response is CalculationSuccessResponse {
  return 'result' in response;
}
