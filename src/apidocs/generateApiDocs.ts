/**
 * Deterministic API-docs artefacts (CAL-21 / landing LAND-09C).
 *
 * Single typed seam that turns the authoritative `openApiDocument` into the two
 * published files. Importing it here typechecks that the document satisfies the
 * renderer's `OpenApiDocument` shape. Both the generator and the drift-check
 * script consume this from built `dist/`, so they cannot diverge.
 */
import { openApiDocument } from '../openApiDocument.js';
import { OPENAPI_JSON_FILENAME, renderApiReference } from './renderApiReference.js';

export { OPENAPI_JSON_FILENAME };

export interface ApiDocsArtefacts {
  /** The self-contained HTML reference page. */
  readonly indexHtml: string;
  /** The raw contract, pretty-printed (trailing newline) — byte-for-byte stable. */
  readonly openapiJson: string;
}

/**
 * Builds the artefacts from the committed contract. Pure and deterministic: the
 * same source always yields the same bytes.
 */
export function buildApiDocsArtefacts(): ApiDocsArtefacts {
  return {
    indexHtml: renderApiReference(openApiDocument),
    openapiJson: `${JSON.stringify(openApiDocument, null, 2)}\n`,
  };
}
