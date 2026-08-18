/**
 * Responsibility: adapt Playwright's APIRequestContext to the dependency-free
 * Screenplay HTTP client interface.
 *
 * Pedagogical decision: this adapter lets Screenplay tasks use the same
 * `Send.a(...)` interaction for real REST calls that the source library uses
 * for fake transports in its own examples.
 */
import type { APIRequestContext, APIResponse } from '@playwright/test';
import type {
  CalculatorHttpClient,
  CalculatorHttpRequest,
  CalculatorHttpResponse,
} from './screenplay/calculatorScreenplay.js';

interface PlaywrightRequestOptions {
  readonly method: string;
  readonly headers?: Record<string, string>;
  readonly data?: unknown;
}

export class PlaywrightApiClient implements CalculatorHttpClient {
  constructor(private readonly requestContext: APIRequestContext) {}

  async send(request: CalculatorHttpRequest): Promise<CalculatorHttpResponse> {
    const options: PlaywrightRequestOptions = {
      method: request.method,
      ...(request.headers ? { headers: { ...request.headers } } : {}),
      ...(request.body === undefined ? {} : { data: request.body }),
    };
    const response = await this.requestContext.fetch(request.url, options);

    return {
      status: response.status(),
      headers: response.headers(),
      body: await readResponseBody(response),
    };
  }
}

async function readResponseBody(response: APIResponse): Promise<unknown> {
  const contentType = response.headers()['content-type'] ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}
