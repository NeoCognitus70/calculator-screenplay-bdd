/**
 * Responsibility: convert untyped process environment variables into a small,
 * typed configuration object.
 *
 * Pedagogical decision: tests and applications become easier to reason about
 * when environment access is centralized and validated at startup.
 */

export interface CalculatorEnvironment {
  readonly host: string;
  readonly port: number;
}

export function readCalculatorEnvironment(
  variables: NodeJS.ProcessEnv = process.env,
): CalculatorEnvironment {
  return {
    host: variables.CALCULATOR_HOST ?? '127.0.0.1',
    port: readPort(variables.CALCULATOR_PORT ?? '3100'),
  };
}

function readPort(value: string): number {
  const port = Number.parseInt(value, 10);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('CALCULATOR_PORT must be an integer between 1 and 65535.');
  }

  return port;
}
