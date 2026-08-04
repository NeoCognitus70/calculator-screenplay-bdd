/**
 * Static API-reference renderer (CAL-21 / portfolio landing LAND-09C).
 *
 * Turns an OpenAPI document into ONE self-contained HTML page with inline CSS
 * only — no third-party renderer, no external assets, no network requests, and
 * no new runtime dependency. It is **documentation for the committed contract**:
 * it renders `src/openApiDocument.ts` (which the server serves verbatim at
 * `/openapi.json`) and deliberately does **not** call or claim to host
 * `/health` or `/api/calculations`.
 *
 * Rendering is deterministic (object keys are emitted in their source order and
 * no timestamps are embedded), so the same document always produces the same
 * bytes.
 */

interface SchemaObject {
  readonly type?: string;
  readonly required?: readonly string[];
  readonly properties?: { readonly [name: string]: SchemaObject };
  readonly items?: SchemaObject;
  readonly enum?: readonly (string | number)[];
  readonly $ref?: string;
}
interface MediaTypeObject {
  readonly schema?: SchemaObject;
}
interface RequestBodyObject {
  readonly required?: boolean;
  readonly content?: { readonly [mime: string]: MediaTypeObject };
}
interface ResponseObject {
  readonly description?: string;
  readonly content?: { readonly [mime: string]: MediaTypeObject };
}
interface OperationObject {
  readonly summary?: string;
  readonly requestBody?: RequestBodyObject;
  readonly responses?: { readonly [status: string]: ResponseObject };
}
interface PathItemObject {
  readonly [method: string]: OperationObject;
}
export interface OpenApiDocument {
  readonly openapi: string;
  readonly info: { readonly title: string; readonly version: string; readonly description?: string };
  readonly paths: { readonly [path: string]: PathItemObject };
  readonly components?: { readonly schemas?: { readonly [name: string]: SchemaObject } };
}

/** The relative filename of the raw contract emitted beside this page. */
export const OPENAPI_JSON_FILENAME = 'openapi.json';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** A stable DOM id for a schema section, so `$ref`s can link to it. */
function schemaAnchor(name: string): string {
  return `schema-${name.replace(/[^A-Za-z0-9_-]/g, '-')}`;
}

/** The schema name a `$ref` points at, or `undefined` for a non-local ref. */
function refName(ref: string): string | undefined {
  const prefix = '#/components/schemas/';
  return ref.startsWith(prefix) ? ref.slice(prefix.length) : undefined;
}

/** Renders a schema reference as a link to its section (or the raw ref). */
function renderSchemaRef(schema: SchemaObject | undefined): string {
  if (!schema || !schema.$ref) return '<span class="muted">—</span>';
  const name = refName(schema.$ref);
  return name
    ? `<a class="schema-ref" href="#${schemaAnchor(name)}">${escapeHtml(name)}</a>`
    : `<code>${escapeHtml(schema.$ref)}</code>`;
}

/** Describes a schema property's type inline (type, enum, or array items). */
function describeType(schema: SchemaObject): string {
  if (schema.$ref) {
    const name = refName(schema.$ref);
    return name
      ? `<a class="schema-ref" href="#${schemaAnchor(name)}">${escapeHtml(name)}</a>`
      : `<code>${escapeHtml(schema.$ref)}</code>`;
  }
  if (schema.type === 'array' && schema.items) {
    return `array&lt;${describeType(schema.items)}&gt;`;
  }
  const base = schema.type ? `<code>${escapeHtml(schema.type)}</code>` : '<span class="muted">any</span>';
  if (schema.enum && schema.enum.length > 0) {
    const values = schema.enum.map((v) => `<code>${escapeHtml(String(v))}</code>`).join(', ');
    return `${base} <span class="muted">(one of ${values})</span>`;
  }
  return base;
}

/** Renders one named schema as a table of its properties. */
function renderSchema(name: string, schema: SchemaObject): string {
  const required = new Set(schema.required ?? []);
  const rows = Object.entries(schema.properties ?? {})
    .map(([propName, propSchema]) => {
      const req = required.has(propName)
        ? '<span class="req">required</span>'
        : '<span class="muted">optional</span>';
      return [
        '<tr>',
        `<td><code>${escapeHtml(propName)}</code></td>`,
        `<td>${describeType(propSchema)}</td>`,
        `<td>${req}</td>`,
        '</tr>',
      ].join('');
    })
    .join('');
  const table = rows
    ? `<table class="props"><thead><tr><th>Property</th><th>Type</th><th></th></tr></thead><tbody>${rows}</tbody></table>`
    : '<p class="muted">No properties.</p>';
  return [
    `<section class="schema" id="${schemaAnchor(name)}">`,
    `<h3><code>${escapeHtml(name)}</code>`,
    schema.type ? ` <span class="muted">(${escapeHtml(schema.type)})</span>` : '',
    '</h3>',
    table,
    '</section>',
  ].join('');
}

/** Renders one operation (method + path) with its request and responses. */
function renderOperation(method: string, path: string, op: OperationObject): string {
  const methodUpper = escapeHtml(method.toUpperCase());
  const requestSchema = op.requestBody?.content?.['application/json']?.schema;
  const request = op.requestBody
    ? `<p class="op-request"><strong>Request body</strong> ${
        op.requestBody.required ? '<span class="req">required</span>' : '<span class="muted">optional</span>'
      } — <code>application/json</code>: ${renderSchemaRef(requestSchema)}</p>`
    : '';
  const responseRows = Object.entries(op.responses ?? {})
    .map(([code, response]) => {
      const schema = response.content?.['application/json']?.schema;
      return [
        '<tr>',
        `<td><code>${escapeHtml(code)}</code></td>`,
        `<td>${escapeHtml(response.description ?? '')}</td>`,
        `<td>${schema ? renderSchemaRef(schema) : '<span class="muted">—</span>'}</td>`,
        '</tr>',
      ].join('');
    })
    .join('');
  return [
    '<section class="op">',
    '<header class="op-header">',
    `<span class="method method-${escapeHtml(method.toLowerCase())}">${methodUpper}</span>`,
    `<code class="op-path">${escapeHtml(path)}</code>`,
    '</header>',
    op.summary ? `<p class="op-summary">${escapeHtml(op.summary)}</p>` : '',
    request,
    responseRows
      ? `<table class="responses"><thead><tr><th>Status</th><th>Description</th><th>Body</th></tr></thead><tbody>${responseRows}</tbody></table>`
      : '',
    '</section>',
  ].join('');
}

/**
 * An illustrative, clearly-labelled request/response example for the primary
 * calculation endpoint. It is a hand-written illustration in the renderer, not
 * part of the contract — so the OpenAPI document (and the CAL-16 version policy)
 * stays untouched. Rendered only when the endpoint exists.
 */
function renderIllustrativeExample(doc: OpenApiDocument): string {
  if (!doc.paths['/api/calculations']?.['post']) return '';
  const request = JSON.stringify({ leftOperand: 2, operator: 'add', rightOperand: 3 }, null, 2);
  const response = JSON.stringify({ result: 5, expression: '2 add 3' }, null, 2);
  return [
    '<section class="example">',
    '<h2>Illustrative example</h2>',
    '<p class="muted">Illustrative only — hand-written to show the shape of a request and a ',
    'successful response. It is not executed and not part of the contract.</p>',
    '<p><strong>POST</strong> <code>/api/calculations</code></p>',
    `<pre class="code" aria-label="Example request body">${escapeHtml(request)}</pre>`,
    '<p class="muted">→ <code>200 OK</code></p>',
    `<pre class="code" aria-label="Example response body">${escapeHtml(response)}</pre>`,
    '</section>',
  ].join('');
}

const STYLE = `
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
         margin: 0; padding: 1.5rem; line-height: 1.5; max-width: 960px; }
  h1 { margin: 0 0 .25rem; font-size: 1.5rem; }
  h2 { font-size: 1.15rem; margin: 1.8rem 0 .6rem; }
  h3 { font-size: 1rem; margin: 1.1rem 0 .4rem; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: .92em; }
  .banner { border: 1px solid #c9a227; border-left: 6px solid #c9a227; border-radius: 8px;
            background: #fff8e1; color: #4a3b0a; padding: .85rem 1.1rem; margin: .8rem 0 1.4rem;
            font-size: .92rem; }
  .meta { color: #666; font-size: .9rem; margin: 0 0 .4rem; }
  .muted { color: #777; }
  .req { color: #c62828; font-size: .8rem; font-weight: 700; }
  .op { border: 1px solid #d7d7d7; border-radius: 8px; padding: .8rem 1rem; margin: 0 0 1rem; }
  .op-header { display: flex; align-items: center; gap: .6rem; }
  .method { font-weight: 700; font-size: .78rem; letter-spacing: .04em; padding: .12rem .5rem;
            border-radius: 6px; color: #fff; }
  .method-get { background: #2e7d32; } .method-post { background: #1565c0; }
  .method-put { background: #b8860b; } .method-delete { background: #c62828; }
  .op-path { font-size: 1rem; } .op-summary { margin: .5rem 0; }
  table { border-collapse: collapse; width: 100%; margin: .5rem 0; font-size: .92rem; }
  th, td { border: 1px solid #e0e0e0; padding: .35rem .55rem; text-align: left; vertical-align: top; }
  th { background: #f5f5f5; font-size: .82rem; }
  .schema { border-top: 1px solid #eee; padding-top: .3rem; }
  .schema-ref { text-decoration: none; border-bottom: 1px dotted currentColor; }
  pre.code { background: #f6f8fa; border: 1px solid #e0e0e0; border-radius: 6px; padding: .7rem .9rem;
             overflow-x: auto; font-size: .88rem; }
  footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e0e0e0; color: #777;
           font-size: .85rem; }
  footer a { color: inherit; }
`.trim();

/**
 * Renders the OpenAPI document as a complete, self-contained HTML reference.
 * Pure: no I/O, no network, no timestamps.
 */
export function renderApiReference(doc: OpenApiDocument): string {
  const operations = Object.entries(doc.paths)
    .flatMap(([path, item]) =>
      Object.entries(item).map(([method, op]) => renderOperation(method, path, op)),
    )
    .join('\n');
  const schemas = Object.entries(doc.components?.schemas ?? {})
    .map(([name, schema]) => renderSchema(name, schema))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(doc.info.title)} &mdash; API reference</title>
<style>${STYLE}</style>
</head>
<body>
<h1>${escapeHtml(doc.info.title)}</h1>
<p class="meta">OpenAPI ${escapeHtml(doc.openapi)} &middot; version ${escapeHtml(doc.info.version)}</p>
<div class="banner">
<strong>Static API reference.</strong> This page is generated from the project's committed OpenAPI
contract (<code>src/openApiDocument.ts</code>) and documents the contract only. It is <strong>not</strong>
a running service and does <strong>not</strong> call <code>/health</code> or
<code>/api/calculations</code>. The raw document is available as
<a href="${OPENAPI_JSON_FILENAME}"><code>${OPENAPI_JSON_FILENAME}</code></a>.
</div>
${doc.info.description ? `<p>${escapeHtml(doc.info.description)}</p>` : ''}
<h2>Endpoints</h2>
${operations}
${renderIllustrativeExample(doc)}
<h2>Schemas</h2>
${schemas}
<footer>
Generated from <code>src/openApiDocument.ts</code>. Documentation only &mdash; independent of any
running server.
</footer>
</body>
</html>
`;
}
