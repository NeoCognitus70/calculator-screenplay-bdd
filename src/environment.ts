/**
 * Responsibility: convert untyped process environment variables into a small,
 * typed configuration object.
 *
 * Pedagogical decision: tests and applications become easier to reason about
 * when environment access is centralized and validated at startup.
 */

import { parsePort } from './parsePort.js';

export interface CalculatorEnvironment {
  readonly host: string;
  readonly port: number;
}

export function readCalculatorEnvironment(
  variables: NodeJS.ProcessEnv = process.env,
): CalculatorEnvironment {
  return {
    host: variables.CALCULATOR_HOST ?? '127.0.0.1',
    // Parsed by the shared strict parser so the app and the Playwright config
    // agree on what a valid CALCULATOR_PORT is (CAL-18).
    port: parsePort(variables.CALCULATOR_PORT ?? '3100'),
  };
}
