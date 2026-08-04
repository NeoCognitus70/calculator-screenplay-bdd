// Writes the static API reference (CAL-21 / landing LAND-09C) to disk for
// GitHub Pages. Runs on plain Node against built `dist/` (no ts-node/tsx, no new
// dependency). Build first (`npm run build`) or use `npm run docs:api`.
//
// Usage: node scripts/generate-api-docs.mjs [outDir]   (default: docs-site)
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildApiDocsArtefacts, OPENAPI_JSON_FILENAME } from '../dist/apidocs/generateApiDocs.js';

const outDir = resolve(process.cwd(), process.argv[2] ?? 'docs-site');
const { indexHtml, openapiJson } = buildApiDocsArtefacts();

mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'index.html'), indexHtml, 'utf8');
writeFileSync(resolve(outDir, OPENAPI_JSON_FILENAME), openapiJson, 'utf8');

console.log(
  `api-docs: wrote ${outDir}/index.html (${Buffer.byteLength(indexHtml, 'utf8')} bytes) ` +
    `and ${outDir}/${OPENAPI_JSON_FILENAME} (${Buffer.byteLength(openapiJson, 'utf8')} bytes)`,
);
