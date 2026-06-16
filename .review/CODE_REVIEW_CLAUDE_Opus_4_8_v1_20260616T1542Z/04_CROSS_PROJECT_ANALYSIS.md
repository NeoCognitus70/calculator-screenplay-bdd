# Cross-Cutting Analysis

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)
**Date:** 2026-06-16T15:42Z

This is a single-project repository, so per the template's "Single-repository reviews" guidance the
nine cross-project areas are reinterpreted as cross-cutting concerns *within* the repo: suite vs CI
vs application vs documentation vs the sibling-library coupling. Areas that do not apply are marked
`N/A` with a one-line justification rather than padded.

## Tool-Agnostic Tests

- The suite is single-tool by design: Playwright Test is the only runner, used both for plain specs
  ([tests/api.spec.ts](../../tests/api.spec.ts), [tests/domain.spec.ts](../../tests/domain.spec.ts))
  and, via `playwright-bdd`, for the generated BDD specs. This is a deliberate KISS choice, not a
  gap.
- The Screenplay Questions and Tasks are abstracted from Playwright behind Abilities, so the
  *intent* layer is tool-agnostic even though the execution layer is not -- e.g.
  `TheApiCalculation.result()` reads `LastResponse.body()` and never touches Playwright directly
  ([tests/calculatorQuestions.ts](../../tests/calculatorQuestions.ts) lines 19-33).
- The API ability is genuinely swappable: `PlaywrightApiClient implements HttpClient`
  ([tests/screenplayApiClient.ts](../../tests/screenplayApiClient.ts) line 18) means the same tasks
  would run against any `HttpClient`, including the sibling library's fake transport.

## Code-Agnostic Tests

- The feature files are language-agnostic Gherkin
  ([features/calculator-api.feature](../../features/calculator-api.feature),
  [features/calculator-ui.feature](../../features/calculator-ui.feature)); they describe behaviour
  without referencing TypeScript, selectors, or HTTP.
- The Screenplay grammar (Actor/Ability/Task/Interaction/Question) is a portable pattern; the same
  scenarios could be re-implemented in another language binding to the same features. The portfolio
  sibling projects (e.g. the sudoku multi-stack POC) demonstrate this idea elsewhere.
- Coupling to implementation leaks only where it should: selectors live in Interactions
  ([tests/calculatorInteractions.ts](../../tests/calculatorInteractions.ts)) and the 422 contract
  lives in a Task ([tests/calculatorTasks.ts](../../tests/calculatorTasks.ts) line 56) -- the
  latter is the Risk 2 visibility concern.

## Single Source of Truth

- The REST contract has one definition shared by server, UI, and tests
  ([src/calculatorContracts.ts](../../src/calculatorContracts.ts)); the operator list is a single
  `as const` tuple reused by the domain, the type guard, and the OpenAPI enum.
- The OpenAPI document ([src/openApiDocument.ts](../../src/openApiDocument.ts)) is hand-written and
  therefore a *parallel* source to the contract types -- a small duplication risk (see
  [API Contract annex](ANNEX/API_CONTRACT.md)). The operator enum appears in both
  `calculatorContracts.ts` (line 10) and `openApiDocument.ts` (line 93).
- `docs/backlog.md` is the declared source of truth for work status and is honoured: the CHANGELOG
  and handover-style narrative defer to it.

## API Contract Compliance

- Status-code semantics are REST-correct: 200 success, 400 malformed/contract-violating, 422
  semantically-unsupported (divide-by-zero), 404 unknown route, 500 catch-all
  ([src/calculatorHttpServer.ts](../../src/calculatorHttpServer.ts) lines 61-142).
- The OpenAPI document declares 200/400/422 for `/api/calculations`
  ([src/openApiDocument.ts](../../src/openApiDocument.ts) lines 41-72) and matches the server. It
  does **not** declare the 404/500 responses or the static-asset routes -- a minor contract-coverage
  gap, acceptable for a teaching API.
- The API spec test asserts the contract shape against `/openapi.json`
  ([tests/api.spec.ts](../../tests/api.spec.ts) lines 11-24), giving a light contract self-check.

## Screenplay Parity

- Within this repo the Screenplay primitives are used consistently and idiomatically; see the
  [Screenplay Parity annex](ANNEX/SCREENPLAY_PARITY.md) for the per-primitive walkthrough.
- Parity with the sibling library is structural: this project supplies its own `BrowseTheWeb`
  ability and `PlaywrightApiClient` adapter while reusing `MakeRequests`, `Send`, `LastResponse`,
  `Remember`, `Ensure`, `Cast`, `Stage`, and the matchers from the library -- a clean consumer
  relationship.

## Batch File Design

- N/A -- this repo ships no `.bat`/`.ps1` batch scripts. Its only script is the Node preflight
  ([scripts/preflight-screenplay.mjs](../../scripts/preflight-screenplay.mjs)), reviewed under
  Migration Plans and the CI section.

## Documentation Alignment

- Strong. README, SCREENPLAY.md, CHANGELOG, backlog, ADR 0001, and the two `docs/` notes are
  mutually consistent and match the code (verified file-by-file in this review).
- The backlog v6 explicitly records pruning a stale "Add CHANGELOG.md" next step after delivery
  ([docs/backlog.md](../../docs/backlog.md) lines 133-136) -- evidence the alignment is actively
  maintained, not accidental.
- One residual: the architecture note and README both describe `screenshot: 'on'` correctly, but
  the caveat lives in prose, not next to the setting in the config (Risk 3).

## Logging Alignment

- Minimal and appropriate: the server logs a single startup line
  ([src/startServer.ts](../../src/startServer.ts) line 17) and the preflight logs structured
  OK/FAIL messages with remedies ([scripts/preflight-screenplay.mjs](../../scripts/preflight-screenplay.mjs)
  lines 16-48). There is no logging framework, which is the right YAGNI call at this size.
- No drift to analyse across modules -- the surface is too small. N/A for cross-module logging
  standardisation.

## Test Coverage Metrics

- Quantitatively (by static count): 3 unit assertions-of-behaviour in `domain.spec.ts`, 4 REST
  cases in `api.spec.ts`, and 4 BDD scenarios across 2 feature files (2 API, 2 UI). See the
  [Test Strategy annex](ANNEX/TEST_STRATEGY.md) for the per-layer breakdown and the gap list.
- The shape is a correct pyramid (more lower-layer coverage, few BDD scenarios). The gaps are
  breadth, not balance: malformed-JSON, 404, static-asset, and domain boundary values
  ([02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md) Risk 5). I did not run the suite (build-race
  constraint), so these counts are from source, not from a coverage report.

---

[<- Previous: Project Reviews](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
