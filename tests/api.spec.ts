/**
 * Responsibility: verify the REST boundary exposed by the calculator server.
 *
 * Pedagogical decision: these tests sit in the service layer of the pyramid.
 * They check status codes and response bodies without paying the cost of a
 * browser for cases the API can prove directly.
 */
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { calculatorOperators } from '../src/calculatorContracts.js';

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

  test('returns 413 when the request body exceeds the size limit', async ({ request }) => {
    // The cap is enforced while streaming the body, before JSON.parse runs, so
    // the payload does not need to be valid JSON — only oversized.
    const oversizedBody = Buffer.from('a'.repeat(10 * 1024 + 1));

    const response = await request.post('/api/calculations', {
      headers: { 'content-type': 'application/json' },
      data: oversizedBody,
    });

    expect(response.status()).toBe(413);
    expect(await response.json()).toMatchObject({
      error: 'Payload Too Large',
      details: [expect.stringContaining('exceeds the 10240-byte limit')],
    });
  });

  test('accepts application/json with a charset parameter', async ({ request }) => {
    const response = await request.post('/api/calculations', {
      headers: { 'content-type': 'application/json; charset=utf-8' },
      data: JSON.stringify({ leftOperand: 2, operator: 'add', rightOperand: 3 }),
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ result: 5, expression: '2 + 3 = 5' });
  });

  test('returns 415 when the Content-Type is missing', async ({ request }) => {
    // A bare POST carries no Content-Type; the media-type guard runs before the
    // body is read, so this is a clean 415 rather than a 400 from the parser.
    const response = await request.post('/api/calculations');

    expect(response.status()).toBe(415);
    expect(await response.json()).toMatchObject({
      error: 'Unsupported Media Type',
      details: ['Content-Type must be application/json.'],
    });
  });

  test('returns 415 for a non-JSON Content-Type', async ({ request }) => {
    const response = await request.post('/api/calculations', {
      headers: { 'content-type': 'text/plain' },
      data: JSON.stringify({ leftOperand: 2, operator: 'add', rightOperand: 3 }),
    });

    expect(response.status()).toBe(415);
    expect(await response.json()).toMatchObject({ error: 'Unsupported Media Type' });
  });

  test('returns 404 for an unknown route', async ({ request }) => {
    const response = await request.get('/api/does-not-exist');

    expect(response.status()).toBe(404);
    expect(await response.json()).toMatchObject({
      error: 'Not Found',
      details: ['No route matches GET /api/does-not-exist.'],
    });
  });

  test('keeps the published OpenAPI operator enum in sync with the domain contract', async ({
    request,
  }) => {
    // Contract-drift guard (CAL-06): src/openApiDocument.ts hand-writes the
    // operator enum, so it can silently fall out of step with
    // calculatorOperators (src/calculatorContracts.ts) if an operator is
    // added or removed in one place but not the other. Order-insensitive set
    // equality catches either kind of drift without demanding a specific
    // ordering in the hand-written document.
    const contract = await request.get('/openapi.json');
    expect(contract.status()).toBe(200);

    const body = (await contract.json()) as {
      components: {
        schemas: {
          CalculationRequest: {
            properties: {
              operator: { enum: readonly string[] };
            };
          };
        };
      };
    };
    const publishedOperators = body.components.schemas.CalculationRequest.properties.operator.enum;

    expect(new Set(publishedOperators)).toEqual(new Set(calculatorOperators));
    expect(publishedOperators).toHaveLength(calculatorOperators.length);
  });

  test('keeps the release version single-sourced across package, lockfile and OpenAPI', async ({
    request,
  }) => {
    // Single-source policy (CAL-15/16): package.json is the source of truth for
    // the release version; the lockfile's two root version fields and the
    // OpenAPI info.version must all match it. This deterministic check fails if
    // a bump in one place silently drifts from the others.
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    const lock = JSON.parse(readFileSync('package-lock.json', 'utf8')) as {
      version: string;
      packages: Record<string, { version?: string }>;
    };
    const contract = await request.get('/openapi.json');
    expect(contract.status()).toBe(200);
    const openapi = (await contract.json()) as { info: { version: string } };

    const source = pkg.version;
    expect(lock.version).toBe(source);
    expect(lock.packages['']?.version).toBe(source);
    expect(openapi.info.version).toBe(source);
  });
});
