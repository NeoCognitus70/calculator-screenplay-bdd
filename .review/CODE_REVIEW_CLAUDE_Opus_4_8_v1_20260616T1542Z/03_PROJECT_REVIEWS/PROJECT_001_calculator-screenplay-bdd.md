# Project Review 001: calculator-screenplay-bdd

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md) | [Next: Cross-Cutting Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)
**Date:** 2026-06-16T15:42Z
**Repository:** `calculator-screenplay-bdd` (single-project portfolio repo)
**Stack (from README + package.json):** TypeScript (strict, ESM/NodeNext), Node built-in `http`,
Playwright Test, `playwright-bdd`, the sibling `hand-baked-screenplay-pattern` Screenplay library
consumed via `file:../`.

## Architecture and design patterns

- Strict hexagonal layering. The pure domain ([src/calculatorDomain.ts](../../../src/calculatorDomain.ts))
  knows nothing of HTTP, the browser, or Playwright; the HTTP server
  ([src/calculatorHttpServer.ts](../../../src/calculatorHttpServer.ts)) and the UI controller
  ([src/uiController.ts](../../../src/uiController.ts)) are adapters around it. The transport
  contract is isolated in [src/calculatorContracts.ts](../../../src/calculatorContracts.ts) with a
  hand-written OpenAPI document in [src/openApiDocument.ts](../../../src/openApiDocument.ts).
- Faithful Screenplay implementation. Tasks express intent
  ([tests/calculatorTasks.ts](../../../tests/calculatorTasks.ts)), Interactions hold mechanics
  ([tests/calculatorInteractions.ts](../../../tests/calculatorInteractions.ts)), Questions read
  outcomes ([tests/calculatorQuestions.ts](../../../tests/calculatorQuestions.ts)), and Abilities
  encapsulate Playwright (`BrowseTheWeb`) and a typed API adapter (`PlaywrightApiClient implements
  HttpClient`, [tests/screenplayApiClient.ts](../../../tests/screenplayApiClient.ts)). The
  primitives come from the sibling library, not copied in -- a clean dependency-inversion demo.
- The two-Playwright-project split (`unit-and-api` matching `*.spec.ts`, `bdd` over generated
  specs) is the mechanism that lets plain Playwright tests and Screenplay glue coexist in one
  `tests/` folder. It is well chosen and well documented in
  [docs/project-structure-and-test-architecture.md](../../../docs/project-structure-and-test-architecture.md).

## Code quality and maintainability

- TypeScript is configured strictly ([tsconfig.json](../../../tsconfig.json) lines 5-16:
  `strict`, `noUnusedLocals/Parameters`, `exactOptionalPropertyTypes`,
  `noFallthroughCasesInSwitch`). The operator `switch` statements
  ([src/calculatorDomain.ts](../../../src/calculatorDomain.ts) lines 74-98) are exhaustive over the
  union with no `default`, leaning on compiler totality checks -- a clean idiom.
- Every file carries a "Responsibility / Pedagogical decision" header, which makes the codebase
  self-documenting for the mid-level audience it targets.
- Error mapping in the server is precise: `SyntaxError` -> 400 JSON-invalid,
  `CalculationValidationError` -> 400 contract, `UnsupportedCalculationError` -> 422, catch-all ->
  500 ([src/calculatorHttpServer.ts](../../../src/calculatorHttpServer.ts) lines 113-142).
- The `PlaywrightApiClient` builds request options with `exactOptionalPropertyTypes`-safe
  conditional spreads ([tests/screenplayApiClient.ts](../../../tests/screenplayApiClient.ts) lines
  21-28), showing the strictness is real and respected.

## Test coverage and approach

- A genuine pyramid: unit ([tests/domain.spec.ts](../../../tests/domain.spec.ts)), REST integration
  ([tests/api.spec.ts](../../../tests/api.spec.ts)), and acceptance via two small feature files
  ([features/calculator-api.feature](../../../features/calculator-api.feature),
  [features/calculator-ui.feature](../../../features/calculator-ui.feature)). The BDD layer is
  deliberately thin and pushes broad arithmetic coverage down to the cheaper layers -- correct
  risk-based design, explicitly justified in SCREENPLAY.md.
- The W6 settled-state wait in `TheDisplayedCalculation.message()`
  ([tests/calculatorQuestions.ts](../../../tests/calculatorQuestions.ts) lines 42-50) is a model
  fix: it waits on the controller's `data-state="success"|"error"` attribute rather than racing
  `textContent()`. This is the right synchronisation primitive and resolves the recorded flake.
- Coverage gaps (all Low/Info, see [02_RISKS_AND_ISSUES.md](../02_RISKS_AND_ISSUES.md) Risk 5):
  no malformed-JSON 400 test, no 404 test, no domain boundary-value tests, and the BDD rejection
  scenario hides its 422 contract from the feature text (Risk 2).

## Documentation quality

- Outstanding alignment. The [README.md](../../../README.md), [SCREENPLAY.md](../../../SCREENPLAY.md),
  [CHANGELOG.md](../../../CHANGELOG.md), [docs/backlog.md](../../../docs/backlog.md),
  ADR 0001, and the two `docs/` architecture notes are mutually consistent and match the code.
- The architecture note states its own maintenance contract ("if those files change, update this
  note"), and the backlog is a real source of truth with a priority-scoring system, resolved-risk
  retention, and CI run IDs as evidence.
- The Screenplay flow document includes Mermaid diagrams and a "Common Smells" section, making the
  repo usable as a reference rather than a one-off sample.

## Strengths

- Transport-agnostic Screenplay proof: the same `Send.a(...)` grammar drives real REST calls
  through the Playwright-backed adapter, mirroring the sibling library's own fake-transport
  examples.
- A visible, honest debugging arc (flake discovered by the first CI run, fixed in W6) recorded in
  both backlog and git history -- exactly the reviewable senior judgement a portfolio wants.
- Decision hygiene: ADR 0001 documents the sibling-coupling trade-off with options, rationale, and
  a revisit trigger.

## Weaknesses

- `fullyParallel: true` contradicts the `--workers=1` reality (Risk 1) -- a mixed message about
  isolation in the most copyable config file.
- The BDD layer cannot express the 400-vs-422 distinction the server is careful to make (Risk 2).
- Always-on screenshots (Risk 3) and a floating-`main` sibling pin (Risk 4) are documented
  trade-offs but remain real costs/risks for anyone copying the patterns.

---

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md) | [Next: Cross-Cutting Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)
