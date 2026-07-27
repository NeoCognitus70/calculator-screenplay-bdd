/**
 * Responsibility: pin the shared strict port parser (CAL-18).
 *
 * Pedagogical decision: this is a pure unit test at the bottom of the pyramid —
 * no server, no browser — proving the single parser the application and the
 * Playwright config both use rejects the lax cases `parseInt`/`Number` accept.
 */
import { expect, test } from '@playwright/test';
import { parsePort } from '../src/parsePort.js';

test.describe('parsePort', () => {
  const accepted: ReadonlyArray<readonly [string, number]> = [
    ['1', 1],
    ['65535', 65535],
    ['3100', 3100],
  ];

  for (const [value, expected] of accepted) {
    test(`accepts the in-range port "${value}"`, () => {
      expect(parsePort(value)).toBe(expected);
    });
  }

  // Every value parseInt/Number would silently mangle or accept: prefixes,
  // fractions, exponents, signs, out-of-range, blank and whitespace.
  const rejected: readonly string[] = [
    '0', // below range
    '65536', // above range
    '1.5', // fraction (parseInt would truncate to 1)
    '1e3', // exponent (parseInt would stop at 'e' -> 1)
    '3100abc', // trailing characters (parseInt would accept the 3100 prefix)
    '-1', // signed / below range
    '+80', // signed
    '', // blank (Number('') is 0)
    '   ', // whitespace only (Number('  ') is 0)
    ' 80 ', // whitespace-padded
  ];

  for (const value of rejected) {
    test(`rejects "${value}" with the accepted format in the message`, () => {
      expect(() => parsePort(value)).toThrow(/between 1 and 65535/);
    });
  }
});
