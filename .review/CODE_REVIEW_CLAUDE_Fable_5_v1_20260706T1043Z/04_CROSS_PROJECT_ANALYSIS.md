# Cross-Cutting Analysis (within the repository)

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1043Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-06T10:43Z

Single-repository review: per the template's customisation notes, this section analyses the
cross-cutting seams *within* the repo - application vs test suite vs CI vs documentation vs the
sibling-library boundary.

## Tool-Agnostic Tests

- The Gherkin layer is genuinely tool-agnostic: [features/](../../features/) contains no
  selectors, HTTP verbs, or status codes; the same feature text could drive cucumber-js or
  SpecFlow-style glue.
- The Screenplay glue is tool-partitioned rather than tool-agnostic: Playwright specifics are
  confined to two adapter files ([tests/screenplayApiClient.ts](../../tests/screenplayApiClient.ts),
  [tests/screenplayBrowseTheWeb.ts](../../tests/screenplayBrowseTheWeb.ts)) plus the interactions,
  so swapping the driver would touch a known, small surface.
- The domain unit tests use Playwright Test as a plain runner
  ([tests/domain.spec.ts](../../tests/domain.spec.ts) lines 1-8) - portable to any runner by
  changing imports only.

## Code-Agnostic Tests

- API scenarios and integration tests assert only on the wire contract (status, JSON body), never
  on implementation internals; the UI scenarios assert on user-visible text and ARIA-labelled
  controls ([tests/calculatorInteractions.ts](../../tests/calculatorInteractions.ts) uses
  `getByLabel`/`getByRole`, not CSS internals).
- The one implementation-coupled hook is deliberate and minimal: the settled-state wait keys on
  the controller's `data-state` attribute, a documented test seam
  ([src/uiController.ts](../../src/uiController.ts) lines 93-103,
  [tests/calculatorQuestions.ts](../../tests/calculatorQuestions.ts) lines 38-49).

## Single Source of Truth

- The REST contract has one authoritative shape ([src/calculatorContracts.ts](../../src/calculatorContracts.ts))
  consumed by server, UI, and tests alike - good.
- The OpenAPI document is hand-written and therefore a *second* statement of the same contract
  ([src/openApiDocument.ts](../../src/openApiDocument.ts)); it currently matches the types, and
  its `enum` mirrors `calculatorOperators`, but drift is possible and only the
  `/api/calculations` presence is asserted by test ([tests/api.spec.ts](../../tests/api.spec.ts)
  lines 16-23). Acceptable at this size; noted.
- Project status has one declared source of truth (`docs/backlog.md`), currently stale on `main`
  pending PR #11 - the single-source rule is honoured in structure but not, at review time, in
  currency (Risk 4).

## API Contract Compliance

- Status-code semantics are RESTful and consistent: 200 success, 400 malformed (bad contract or
  bad JSON), 422 well-formed-but-unsupported, 404 unknown route, 500 fallback
  ([src/calculatorHttpServer.ts](../../src/calculatorHttpServer.ts) lines 109-142); every one of
  those codes is exercised by a test except 500 (unreachable by construction - acceptable).
- The OpenAPI document declares 3.1.0 and matches the implemented paths and schemas; error
  responses share one `ApiErrorResponse` schema, mirrored by the typed client-side handling.

## Screenplay Parity

- Parity with the sibling library's idioms is high: this repo uses the library's own
  `MakeRequests`/`Send`/`LastResponse`/`Ensure`/`Remember` primitives against a real API where
  the library's examples use fakes - exactly the intended consumer story.
- One asymmetry: `BrowseTheWeb` is defined locally (the library ships no browser ability), which
  is correct layering, and the adapter comment explains it
  ([tests/screenplayBrowseTheWeb.ts](../../tests/screenplayBrowseTheWeb.ts) lines 1-8).
- The write-only `Remember` (Risk 8) is the only place the Screenplay usage demonstrates a
  primitive without completing its loop.

## Batch File Design

- N/A - the repository ships no batch/shell scripts; the only script is the Node preflight
  ([scripts/preflight-screenplay.mjs](../../scripts/preflight-screenplay.mjs)), which is
  well-designed: single purpose, exact remedy text, `--built` mode for the verify gate.

## Documentation Alignment

- README, SCREENPLAY.md, the architecture note, the ADR, and the CHANGELOG were cross-checked
  against source: every structural claim held (the architecture note's project-split table
  matches [playwright.config.ts](../../playwright.config.ts) exactly).
- Two currency misalignments: backlog v6 on `main` lags merged work (Risk 4), and the README Node
  floor lags CI and the sibling (Risk 5).
- The CHANGELOG is exemplary - the CAL-01..05 cycle is recorded there in detail, which is what
  made the backlog staleness detectable as a pure bookkeeping gap.

## Logging Alignment

- The application logs exactly one startup line ([src/startServer.ts](../../src/startServer.ts)
  line 17); the preflight prints a single OK/FAILED block. Appropriate to scale; no drift to
  analyse.
- Test-side diagnostics rely on Playwright's list reporter, HTML report, screenshots, and
  first-retry traces - none of which CI preserves on failure (Risk 9), the only logging gap of
  consequence.

## Test Coverage Metrics

- Static count on `main`: 7 domain unit tests + 6 API integration tests + 4 BDD scenarios
  (2 API + 2 UI) = 17 executable checks across three layers; see
  [ANNEX/METRICS.md](ANNEX/METRICS.md) for the breakdown.
- Every domain operator, every implemented status code except the unreachable 500, and both UI
  outcome states (`success`, `error`) are covered; no coverage tooling is configured (reasonable -
  branch coverage of a ~100-line domain would be ceremony).

---

[<- Previous: Project Reviews](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1043Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
