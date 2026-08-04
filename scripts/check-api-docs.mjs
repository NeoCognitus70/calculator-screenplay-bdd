// Drift + self-containment gate for the static API reference (CAL-21 /
// LAND-09C). Runs on plain Node against built `dist/`. Fails (exit 1) if the
// generated reference drifts from the committed contract, is non-deterministic,
// pulls external assets, or would call the documented endpoints.
//
// Run via `npm run check:api-docs` (builds first) or directly after a build.
import { buildApiDocsArtefacts } from '../dist/apidocs/generateApiDocs.js';
import { openApiDocument } from '../dist/openApiDocument.js';

const problems = [];
const check = (ok, message) => {
  if (!ok) problems.push(message);
};

const first = buildApiDocsArtefacts();
const second = buildApiDocsArtefacts();

// Determinism: same source -> identical bytes.
check(first.indexHtml === second.indexHtml, 'index.html is not byte-stable across runs');
check(first.openapiJson === second.openapiJson, 'openapi.json is not byte-stable across runs');

const { indexHtml: html, openapiJson } = first;

// The emitted contract must deep-equal the source the server serves verbatim.
let parsed;
try {
  parsed = JSON.parse(openapiJson);
} catch (error) {
  problems.push(`openapi.json is not valid JSON: ${error.message}`);
}
if (parsed) {
  check(
    JSON.stringify(parsed) === JSON.stringify(openApiDocument),
    'openapi.json does not deep-equal src/openApiDocument.ts (drift)',
  );
}

// Content coverage: every path, operation, response code and schema (with each
// property) in the contract must appear in the rendered reference.
for (const [path, item] of Object.entries(openApiDocument.paths)) {
  check(html.includes(path), `reference is missing path ${path}`);
  for (const [method, op] of Object.entries(item)) {
    check(html.includes(method.toUpperCase()), `reference is missing method ${method.toUpperCase()} for ${path}`);
    for (const code of Object.keys(op.responses ?? {})) {
      check(html.includes(`>${code}<`), `reference is missing response ${code} for ${method} ${path}`);
    }
  }
}
for (const [name, schema] of Object.entries(openApiDocument.components?.schemas ?? {})) {
  check(html.includes(name), `reference is missing schema ${name}`);
  for (const propName of Object.keys(schema.properties ?? {})) {
    check(html.includes(propName), `reference is missing property ${propName} of schema ${name}`);
  }
}

// Self-containment: no external URLs, no asset src, no runtime calls. The only
// links are the relative openapi.json and in-page schema anchors.
check(!/https?:\/\//.test(html), 'reference must not reference any external http(s):// URL');
check(!/\bsrc=/.test(html), 'reference must not load external assets (src=)');
check(
  !/\bfetch\s*\(|XMLHttpRequest|EventSource|new\s+WebSocket/.test(html),
  'reference must not call the documented endpoints (no fetch/XHR/WebSocket)',
);
check(html.includes('openapi.json'), 'reference must expose the raw openapi.json');

if (problems.length > 0) {
  console.error('check-api-docs: FAIL');
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(
  `check-api-docs: PASS (deterministic, contract-faithful, self-contained; ` +
    `${Buffer.byteLength(html, 'utf8')} bytes)`,
);
