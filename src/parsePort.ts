/**
 * Responsibility: parse a TCP port from an untyped string in ONE strict place,
 * shared by the application (`environment.ts`) and the Playwright config, so the
 * two never disagree about what a valid port is.
 *
 * Pedagogical decision: `Number.parseInt` and `Number` are too lax for a port.
 * `parseInt('3100abc', 10)` is `3100` (accepts a numeric prefix), `parseInt('1.5')`
 * is `1` and `parseInt('1e3')` is `1` (silently truncate), and `Number('')` /
 * `Number('  ')` are `0`. A port must be a whole number in `[1, 65535]` and
 * nothing else, so this parser accepts only a full string of ASCII digits and
 * range-checks the result.
 */

const MIN_PORT = 1;
const MAX_PORT = 65_535;

/**
 * Parses a full-string port. Throws with the accepted format on any value that
 * is not a run of digits naming an integer in `[1, 65535]` — this rejects blank
 * and whitespace-only input, fractions (`1.5`), exponents (`1e3`), signed values
 * (`-1`, `+80`), trailing characters (`3100abc`) and out-of-range numbers
 * (`0`, `65536`).
 */
export function parsePort(value: string): number {
  if (!/^\d+$/.test(value) || !inRange(Number(value))) {
    throw new Error(
      `Invalid port ${JSON.stringify(value)}: expected a whole number between ${MIN_PORT} and ${MAX_PORT}.`,
    );
  }

  return Number(value);
}

function inRange(port: number): boolean {
  return port >= MIN_PORT && port <= MAX_PORT;
}
