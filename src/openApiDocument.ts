/**
 * Responsibility: describe the REST API in OpenAPI form without involving the
 * HTTP server implementation.
 *
 * Pedagogical decision: the OpenAPI document is hand-written because the API is
 * deliberately tiny. This keeps the contract visible without adding a generator
 * dependency that would distract from the Screenplay lesson.
 */

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Calculator Screenplay BDD API',
    // Policy (CAL-15): the API version tracks the package release. `package.json`
    // is the single source of truth; the CAL-16 drift test fails if this, the
    // lockfile root, and `package.json` ever diverge.
    version: '0.2.0',
    description: 'A tiny REST API used to teach BDD and the Screenplay Pattern.',
  },
  paths: {
    '/health': {
      get: {
        summary: 'Report service health',
        responses: {
          '200': {
            description: 'The service is running.',
          },
        },
      },
    },
    '/api/calculations': {
      post: {
        summary: 'Calculate a binary arithmetic expression',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CalculationRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'The calculation succeeded.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CalculationSuccessResponse',
                },
              },
            },
          },
          '400': {
            description: 'The request body is malformed or violates the contract.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiErrorResponse',
                },
              },
            },
          },
          '422': {
            description: 'The request is valid JSON but the calculation is unsupported.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiErrorResponse',
                },
              },
            },
          },
          '413': {
            description: 'The request body exceeds the server\'s size limit.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/openapi.json': {
      get: {
        summary: 'Return the OpenAPI contract',
        responses: {
          '200': {
            description: 'The OpenAPI document.',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      CalculationRequest: {
        type: 'object',
        required: ['leftOperand', 'operator', 'rightOperand'],
        properties: {
          leftOperand: { type: 'number' },
          operator: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
          rightOperand: { type: 'number' },
        },
      },
      CalculationSuccessResponse: {
        type: 'object',
        required: ['result', 'expression'],
        properties: {
          result: { type: 'number' },
          expression: { type: 'string' },
        },
      },
      ApiErrorResponse: {
        type: 'object',
        required: ['error', 'details'],
        properties: {
          error: { type: 'string' },
          details: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  },
} as const;
