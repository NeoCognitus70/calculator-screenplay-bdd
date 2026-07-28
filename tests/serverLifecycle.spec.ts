/**
 * Responsibility: pin the server startup lifecycle contract (CAL-20).
 *
 * Pedagogical decision: a pure lifecycle test at the bottom of the pyramid —
 * no HTTP requests — proving `listen()` rejects a failed bind instead of leaking
 * an uncaught 'error' event. It uses an OS-assigned ephemeral port (port 0) to
 * avoid colliding with the shared webServer or a fixed port.
 */
import type { AddressInfo } from 'node:net';
import { expect, test } from '@playwright/test';
import { createCalculatorServer } from '../src/calculatorHttpServer.js';

test.describe('CalculatorServer lifecycle', () => {
  test('listen() resolves on a successful bind and close() releases the port', async () => {
    const server = createCalculatorServer({ host: '127.0.0.1', port: 0 });

    await expect(server.listen()).resolves.toBeUndefined();
    expect(server.server.listening).toBe(true);

    await server.close();
    expect(server.server.listening).toBe(false);
  });

  test('listen() rejects when the port is already in use, without leaking a server', async () => {
    const first = createCalculatorServer({ host: '127.0.0.1', port: 0 });
    await first.listen();
    const { port } = first.server.address() as AddressInfo;

    // A second server bound to the same host/port must reject (EADDRINUSE)
    // rather than emit an uncaught 'error' — the promise owns the failure.
    const second = createCalculatorServer({ host: '127.0.0.1', port });
    await expect(second.listen()).rejects.toThrow(/EADDRINUSE/);

    // The failed second server never started listening (no leak), and the
    // first is still the sole owner of the port until we release it.
    expect(second.server.listening).toBe(false);
    expect(first.server.listening).toBe(true);

    await first.close();
  });
});
