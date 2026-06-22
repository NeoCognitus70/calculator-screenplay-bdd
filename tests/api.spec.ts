/**
 * Responsibility: verify the REST boundary exposed by the calculator server.
 *
 * Pedagogical decision: these tests sit in the service layer of the pyramid.
 * They check status codes and response bodies without paying the cost of a
 * browser for cases the API can prove directly.
 */
import { expect, test } from '@playwright/test';

test.describe('Calculator REST API', () => {
  test('reports service health and exposes its OpenAPI contract', async ({ request }) => {
    const health = await request.get('/health');
    expect(health.status()).toBe(200);
    expect(await health.json()).toEqual({ status: 'ok' });

    const contract = await request.get('/openapi.json');
    expect(contract.status()).toBe(200);
    expect(await contract.json()).toMatchObject({
      openapi: '3.1.0',
      paths: {
        '/api/calculations': expect.any(Object),
      },
    });
  });

  test('calculates valid API requests', async ({ request }) => {
    const response = await request.post('/api/calculations', {
      data: {
        leftOperand: 8,
        operator: 'multiply',
        rightOperand: 6,
      },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      result: 48,
      expression: '8 * 6 = 48',
    });
  });

  test('returns 400 for invalid request contracts', async ({ request }) => {
    const response = await request.post('/api/calculations', {
      data: {
        leftOperand: 'eight',
        operator: 'multiply',
        rightOperand: 6,
      },
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      error: 'Bad Request',
      details: ['leftOperand must be a finite number.'],
    });
  });

  test('returns 422 for valid requests that cannot be calculated', async ({ request }) => {
    const response = await request.post('/api/calculations', {
      data: {
        leftOperand: 8,
        operator: 'divide',
        rightOperand: 0,
      },
    });

    expect(response.status()).toBe(422);
    expect(await response.json()).toMatchObject({
      error: 'Unprocessable Content',
      details: ['Division by zero is undefined.'],
    });
  });

  test('returns 400 when the request body is not valid JSON', async ({ request }) => {
    // Send a raw, unparseable body so the server reaches JSON.parse and throws
    // a SyntaxError. A Buffer is sent verbatim; a plain string would be
    // re-serialised by Playwright into a valid JSON string literal and so would
    // parse successfully (hitting the validation path, not the JSON-syntax one).
    const response = await request.post('/api/calculations', {
      headers: { 'content-type': 'application/json' },
      data: Buffer.from('{ not json'),
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      error: 'Bad Request',
      details: ['Request body must be valid JSON.'],
    });
  });

  test('returns 404 for an unknown route', async ({ request }) => {
    const response = await request.get('/api/does-not-exist');

    expect(response.status()).toBe(404);
    expect(await response.json()).toMatchObject({
      error: 'Not Found',
      details: ['No route matches GET /api/does-not-exist.'],
    });
  });
});
