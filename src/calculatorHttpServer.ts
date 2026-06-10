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
      new Promise<void>((resolve) => {
        server.listen(options.port, options.host, resolve);
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
  try {
    const body = await readJsonBody(request);
    const calculationRequest = validateCalculationRequest(body);
    sendJson(response, 200, calculate(calculationRequest));
  } catch (error) {
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

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
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
