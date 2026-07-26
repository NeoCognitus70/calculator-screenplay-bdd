# Cross-Cutting Analysis

[<- Back to Index](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

Reviewer: AI assistant (Codex GPT-5)

This is a single-repository review. "Cross-project" here means the alignment between executable
specifications, Screenplay glue, application layers, CI, the sibling provider, and documentation.

## Tool-Agnostic Tests

- Gherkin examples express calculator behaviour without naming Playwright APIs.
- Domain and REST expectations describe portable behaviour, although their current executable form
  uses Playwright Test.
- Screenplay Tasks and Questions are intention-revealing, but adapters deliberately bind execution
  to Playwright request/page fixtures.
- The features could be reused by another BDD runner if equivalent step bindings were supplied.

## Code-Agnostic Tests

- Feature language is implementation-independent and could drive a non-TypeScript calculator.
- The REST endpoint, request body, status codes, and response bodies form the strongest
  language-neutral boundary.
- The OpenAPI document supports independent client generation or contract validation.
- Plain domain specs import TypeScript implementation directly and are intentionally code-bound.

## Single Source of Truth

- `calculatorOperators` is the typed domain operator source, and an API test compares its set with
  the hand-written OpenAPI enum.
- Feature files plus step definitions are the BDD source; generated specs are ignored.
- The request/response interfaces are shared by server, browser controller, and tests.
- Version truth is currently split between package 0.2.0 and lock/OpenAPI 0.1.0.
- UI operator validation duplicates the operator list rather than calling the shared
  `isCalculatorOperator`, a small drift surface that has not yet caused a defect.

## API Contract Compliance

- OpenAPI 3.1 documents health, calculation, and contract endpoints plus the core schemas.
- Runtime success, 400, 413, and 422 shapes match the documented forms in the reviewed source.
- The operator-enum drift guard is useful but narrow; it does not validate release version,
  response codes, required fields, or media types.
- The server accepts JSON under unsupported content types, creating a runtime/contract mismatch.
- No authentication or token contract exists, correctly matching the local public demo.

## Screenplay Parity

- API actors receive `MakeRequests` and UI actors receive `BrowseTheWeb`; both receive isolated
  scenario memory.
- Both paths use the same `Calculate` task vocabulary and assert through Questions.
- The API path reuses the provider's `Send` and `LastResponse`; the UI path isolates Playwright
  mechanics in local Interactions.
- `Remember` and `Recall` are exercised on successful API and UI examples.
- Provider/consumer boundaries are explicit; no Screenplay primitive is copied into this repo.

## Batch File Design

N/A - this repository contains no batch or PowerShell orchestration. npm scripts and GitHub Actions
are assessed under CI and migration planning.

## Documentation Alignment

- README, Screenplay guide, and architecture note agree on the two Playwright projects and three
  plain spec files.
- ADR 0001 explains the sibling dependency and its accepted reproducibility cost.
- Changelog and backlog record earlier review remediation in detail.
- The 0.2.0 metadata drift and blank-input behaviour are absent from the zero-outstanding backlog.
- Handover v3 predates the fetched default head and still describes the now-merged PR #21.

## Logging Alignment

- Application logging is intentionally minimal: startup writes one address line.
- API errors return structured client-facing bodies but unexpected server errors are not logged,
  which is acceptable for a tiny local sample but limits diagnosis if deployed.
- Playwright list and HTML reporters provide test diagnostics; traces are retained on first retry
  and failure evidence is uploaded in CI.
- There is no central correlation or structured logging requirement because the SUT is stateless,
  single-process, and unauthenticated.

## Test Coverage Metrics

- Static declarations: 15 plain Playwright tests and 4 Gherkin scenarios, giving 19 expected
  runtime tests.
- Layer mix: 6 domain, 8 API, 1 browser-controller, 2 API-BDD, and 2 UI-BDD.
- No skipped, focused, quarantined, or WIP tests were found.
- No line, branch, mutation, or historical duration/pass-rate metric is produced.
- Runtime count was not re-executed in this review because the canonical gate builds inside the
  sibling checkout; the last fetched main CI run passed.

## Infrastructure and Local Reproduction

- No Docker, database, queue, cloud service, or third-party API is required.
- Reproduction needs Node 20+, Chromium, and two sibling Git checkouts.
- `npm ci` and a checked-in lockfile make the consumer dependency graph reproducible, apart from
  the deliberately floating sibling branch.
- Local npm cache redirection differs from CI by design and is documented in the workflow.
- The cross-tree build gate was skipped during this review to avoid concurrent writes.

---

[<- Previous: Project Review](03_PROJECT_REVIEWS/PROJECT_001_CALCULATOR_SCREENPLAY_BDD.md) | [Back to Index](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
