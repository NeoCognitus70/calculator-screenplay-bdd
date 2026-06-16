# Annex: API Contract

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)
**Date:** 2026-06-16T15:42Z

This annex records the REST contract, its OpenAPI alignment, and the one duplication risk.

## Endpoints (from src/calculatorHttpServer.ts)

| Method | Path | Behaviour | Status codes |
|---|---|---|---|
| GET | `/health` | `{ status: 'ok' }` | 200 |
| GET | `/openapi.json` | the hand-written OpenAPI document | 200 |
| GET | `/`, `/index.html`, `/styles.css`, `/uiController.js` | static assets | 200 / 404 if missing |
| POST | `/api/calculations` | validate + calculate | 200 / 400 / 422 |
| any | unmatched | not found | 404 |
| any | unhandled error | catch-all | 500 |

Evidence: routing in [src/calculatorHttpServer.ts](../../../src/calculatorHttpServer.ts) lines
56-85; error mapping lines 113-142; static asset handling lines 87-103 and 166-189.

## Status-code semantics

- **400 (Bad Request)** -- two distinct causes correctly share the class: malformed JSON
  (`SyntaxError`, lines 114-120) and contract violation (`CalculationValidationError`, lines
  122-128). Both return `{ error, details[] }`.
- **422 (Unprocessable Content)** -- semantically valid request that cannot be computed
  (divide-by-zero, `UnsupportedCalculationError`, lines 130-136). This 400-vs-422 distinction is
  the project's strongest REST teaching point.
- **404 / 500** present and correct.

## OpenAPI alignment

- The hand-written document ([src/openApiDocument.ts](../../../src/openApiDocument.ts)) declares
  `/health`, `/api/calculations` (200/400/422), and `/openapi.json`, with `CalculationRequest`,
  `CalculationSuccessResponse`, and `ApiErrorResponse` schemas. This matches the server's main
  contract.
- **Gaps (minor, acceptable for a teaching API):**
  - The 404 and 500 responses are not declared in the OpenAPI document.
  - The static-asset routes are not declared (reasonable -- they are not part of the JSON API).
  - The `application/json` request content-type expectation is implicit; the server does not reject
    a wrong `content-type`, it simply attempts to parse the body.

## Duplication / drift risk

- The operator enum is defined twice: as the `calculatorOperators` tuple
  ([src/calculatorContracts.ts](../../../src/calculatorContracts.ts) line 10) and inline in the
  OpenAPI schema ([src/openApiDocument.ts](../../../src/openApiDocument.ts) line 93). They agree
  today but are not derived from one another, so a future operator added to the domain could leave
  the OpenAPI enum stale.
- **Mitigation (recommended, optional):** a one-line test asserting the OpenAPI enum deep-equals
  `calculatorOperators`, or deriving the schema enum from the tuple at module load. Either makes the
  contract single-sourced.

## Contract self-check in the suite

- [tests/api.spec.ts](../../../tests/api.spec.ts) (lines 11-24) fetches `/openapi.json` and asserts
  `openapi: '3.1.0'` and the presence of the `/api/calculations` path -- a light but real guard
  that the served contract is structurally intact.

---

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md)
