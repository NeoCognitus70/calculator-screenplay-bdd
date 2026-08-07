# Cross-Project (In-Repo Cross-Cutting) Analysis

[<- Back to Index](00_CODE_REVIEW_Gemini_v1_20260807T1409Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

---

## 1. Tool-Agnostic Tests

- Screenplay tasks (`calculatorTasks.ts`) and questions (`calculatorQuestions.ts`) express domain intent independently of Playwright API details.
- Custom abilities (`PlaywrightApiClient`, `BrowseTheWeb`) isolate runner mechanics so tasks can run against alternative HTTP or browser drivers.
- Step definitions (`calculatorSteps.ts`) delegate execution entirely to Screenplay primitives.

## 2. Code-Agnostic Tests

- Gherkin feature files (`calculator-api.feature`, `calculator-ui.feature`) use pure business language (`Ada calculates 7 plus 5 using the REST API`).
- Rejection contracts are clearly documented (`"reject the calculation with ..."` maps to 422 Unprocessable Content).
- Specifications are decoupled from TypeScript implementation details and can serve as business specifications for non-JS implementations.

## 3. Single Source of Truth

- `package.json` version (`0.2.0`) is enforced as the single version source across `package-lock.json` root and OpenAPI `info.version` via automated tests (`tests/api.spec.ts`).
- `calculatorOperators` (`src/calculatorContracts.ts`) serves as the single source for valid math operations, enforced against OpenAPI schemas via `api.spec.ts`.
- `docs/backlog.md` (v15) serves as the canonical project status tracking document.

## 4. API Contract Compliance

- OpenAPI 3.1.0 specification (`src/openApiDocument.ts`) accurately describes `/health`, `/openapi.json`, and `/api/calculations`.
- Server handles content type validation (`415`), payload size enforcement (`413`), validation failures (`400`), and domain errors (`422`).
- `check-api-docs.mjs` verifies that every path, method, response code, and schema property in OpenAPI is rendered in the static API documentation.

## 5. Screenplay Parity

- Implements all standard Screenplay primitives from `hand-baked-screenplay-pattern` (Actor, Ability, Task, Interaction, Question, Ensure, Stage, Cast).
- Demonstrates scenario memory using `Remember.that()` and `Recall.the()` round-trips (`TheRememberedCalculation`).
- Maintains clean separation: Interactions operate systems, Tasks explain intent, Questions inspect outcomes.

## 6. Batch / Script File Design

- `scripts/preflight-screenplay.mjs` checks sibling dependency existence and build status with actionable remedies.
- `scripts/generate-api-docs.mjs` and `scripts/check-api-docs.mjs` run standalone Node scripts without third-party CLI dependencies.
- Scripts use clean Node.js ES module syntax (`import.meta.url`, `node:fs`, `node:path`).

## 7. Documentation Alignment

- `README.md`, `SCREENPLAY.md`, `CHANGELOG.md`, and `docs/` files are fully synchronized with the codebase state.
- `docs/backlog.md` (v15) accurately records CAL-01 through CAL-21 resolution dates and commit references.
- `docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md` documents architectural rationale for the `file:../` sibling strategy.

## 8. Logging Alignment

- Standard HTTP server uses clean stdout error logging for unhandled exceptions while routing structured JSON responses (`ApiErrorResponse`).
- Preflight script and docs check script print clear, formatted success (`PASS`) or failure (`FAIL`) diagnostic messages to stdout/stderr.
- Playwright runner is configured with `list` and `html` reporters (`open: 'never'`).

## 9. Test Coverage Metrics

- **Unit Layer:** 6 domain unit tests in `domain.spec.ts` covering arithmetic rules and boundary conditions.
- **Integration Layer:** 11 REST integration tests in `api.spec.ts` covering endpoints, 400/413/415/422 status codes, and schema drift guards.
- **Controller Layer:** 4 browser controller tests in `uiController.spec.ts` for DOM state and network error handling.
- **BDD Layer:** 4 Gherkin scenarios in `features/` generated via `playwright-bdd`.
- **Total Suite:** 25 Playwright tests executing serially with zero failures.

---

[<- Previous: Project Review](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md) | [Back to Index](00_CODE_REVIEW_Gemini_v1_20260807T1409Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
