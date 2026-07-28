/**
 * Responsibility: adapt HTTP requests to the calculator use case and translate
 * domain outcomes into REST responses.
 *
 * Pedagogical decision: this file is the adapter layer. It depends on the
 * domain, but the domain does not depend on HTTP, which keeps the design SOLID
 * and testable.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { URL } from 'node:url';
import {
  CalculationValidationError,
  UnsupportedCalculationError,
  calculate,
  validateCalculationRequest,
} from './calculatorDomain.js';
import { openApiDocument } from './openApiDocument.js';

const MAX_REQUEST_BODY_BYTES = 10 * 1024;

class RequestBodyTooLargeError extends Error {}

export interface CalculatorServer {
  readonly server: Server;
  listen(): Promise<void>;
  close(): Promise<void>;
}

export interface CalculatorServerOptions {
  readonly host: string;
  readonly port: number;
}

export function createCalculatorServer(options: CalculatorServerOptions): CalculatorServer {
  const server = createServer((request, response) => {
    void routeRequest(request, response);
  });

  return {
    server,
    listen: () =>
      new Promise<void>((resolve, reject) => {
        // Resolve on a successful bind, reject on failure (e.g. EADDRINUSE).
        // Both listeners are one-shot and each removes the other, so a failed
        // bind rejects the promise instead of surfacing as an uncaught 'error'
        // event, and neither listener leaks past startup.
        const onError = (error: Error): void => {
          server.removeListener('listening', onListening);
          reject(error);
        };
        const onListening = (): void => {
          server.removeListener('error', onError);
          resolve();
        };

        server.once('error', onError);
        server.once('listening', onListening);
        server.listen(options.port, options.host);
      }),
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
}

async function routeRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const path = request.url
    ? new URL(request.url, 'http://calculator.local').pathname
    : '/';

  if (request.method === 'GET' && path === '/health') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  if (request.method === 'GET' && path === '/openapi.json') {
    sendJson(response, 200, openApiDocument);
    return;
  }

  if (request.method === 'GET' && isStaticAssetPath(path)) {
    await handleStaticAsset(path, response);
    return;
  }

  if (request.method === 'POST' && path === '/api/calculations') {
    await handleCalculation(request, response);
    return;
  }

  sendJson(response, 404, {
    error: 'Not Found',
    details: [`No route matches ${request.method ?? 'UNKNOWN'} ${path}.`],
  });
}

async function handleStaticAsset(path: string, response: ServerResponse): Promise<void> {
  const asset = assetFor(path);

  try {
    const content = await readFile(asset.filePath);
    response.writeHead(200, {
      'content-type': asset.contentType,
      'content-length': content.byteLength,
    });
    response.end(content);
  } catch {
    sendJson(response, 404, {
      error: 'Not Found',
      details: [`Static asset ${path} was not found.`],
    });
  }
}

async function handleCalculation(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  // Enforce the documented JSON media type *before* reading the body, so an
  // unsupported or missing Content-Type is a clean 415 rather than reaching the
  // JSON parser (which would surface as a 400). This does not touch the 413
  // size-cap or the 400/422 body paths below.
  if (!isJsonContentType(request)) {
    sendJson(response, 415, {
      error: 'Unsupported Media Type',
      details: ['Content-Type must be application/json.'],
    });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const calculationRequest = validateCalculationRequest(body);
    sendJson(response, 200, calculate(calculationRequest));
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      sendJson(response, 413, {
        error: 'Payload Too Large',
        details: [error.message],
      });
      return;
    }

    if (error instanceof SyntaxError) {
      sendJson(response, 400, {
        error: 'Bad Request',
        details: ['Request body must be valid JSON.'],
      });
      return;
    }

    if (error instanceof CalculationValidationError) {
      sendJson(response, 400, {
        error: 'Bad Request',
        details: error.details,
      });
      return;
    }

    if (error instanceof UnsupportedCalculationError) {
      sendJson(response, 422, {
        error: 'Unprocessable Content',
        details: error.details,
      });
      return;
    }

    sendJson(response, 500, {
      error: 'Internal Server Error',
      details: ['The calculator failed unexpectedly.'],
    });
  }
}

function isJsonContentType(request: IncomingMessage): boolean {
  const header = request.headers['content-type'];
  if (typeof header !== 'string') {
    return false;
  }

  // Accept `application/json` case-insensitively and ignore any parameters
  // (e.g. `; charset=utf-8`). A missing or unsupported type returns false.
  const mediaType = header.split(';', 1)[0]?.trim().toLowerCase();
  return mediaType === 'application/json';
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.byteLength;

    if (totalBytes > MAX_REQUEST_BODY_BYTES) {
      throw new RequestBodyTooLargeError(
        `Request body exceeds the ${MAX_REQUEST_BODY_BYTES}-byte limit.`,
      );
    }

    chunks.push(buffer);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(rawBody.length === 0 ? 'null' : rawBody);
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  const payload = JSON.stringify(body);

  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  response.end(payload);
}

function isStaticAssetPath(path: string): boolean {
  return path === '/' || path === '/index.html' || path === '/styles.css' || path === '/uiController.js';
}

function assetFor(path: string): { readonly filePath: string; readonly contentType: string } {
  if (path === '/uiController.js') {
    return {
      filePath: join(process.cwd(), 'dist', 'uiController.js'),
      contentType: 'text/javascript; charset=utf-8',
    };
  }

  if (path === '/styles.css') {
    return {
      filePath: join(process.cwd(), 'public', 'styles.css'),
      contentType: 'text/css; charset=utf-8',
    };
  }

  return {
    filePath: join(process.cwd(), 'public', 'index.html'),
    contentType: 'text/html; charset=utf-8',
  };
}
