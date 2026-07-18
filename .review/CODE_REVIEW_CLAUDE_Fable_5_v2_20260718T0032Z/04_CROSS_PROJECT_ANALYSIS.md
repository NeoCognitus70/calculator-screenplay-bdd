# Cross-Cutting Analysis (within the repository)

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-18T00:32Z

Single-repository review: per the template's customisation notes, the nine cross-project areas
are applied as cross-cutting analyses *within* the repo (application vs suite vs CI vs docs).

## Tool-Agnostic Tests

- The Gherkin features are genuinely tool-agnostic: no Playwright, selector, or HTTP vocabulary
  appears in any scenario line, so the same features could bind to another runner.
- The Screenplay glue is deliberately tool-adjacent by design: `PlaywrightApiClient` and
  `BrowseTheWeb` isolate the Playwright dependency into two adapter files
  ([tests/screenplayApiClient.ts](../../tests/screenplayApiClient.ts),
  [tests/screenplayBrowseTheWeb.ts](../../tests/screenplayBrowseTheWeb.ts)); swapping runners
  would touch those and the interactions, not the tasks or features.
- The lower-pyramid specs are Playwright-native on purpose (single-toolchain KISS,
  [docs/project-structure-and-test-architecture.md](../../docs/project-structure-and-test-architecture.md)
  lines 105-117); portability was traded away consciously.

## Code-Agnostic Tests

- API and BDD layers test through the deployed HTTP/browser boundary and are implementation-
  agnostic; only `domain.spec.ts` and the CAL-12 questions import production modules directly.
- That direct import is the derived-oracle nuance recorded as
  [Risk 6](02_RISKS_AND_ISSUES.md#risk-6-info-the-remembered-calculation-oracle-is-derived-through-production-code---currently-sound-worth-a-guard-comment):
  sound while paired with literal Gherkin expectations.
- N/A beyond this - a single-language repo has no cross-language parity dimension.

## Single Source of Truth

- The operator enum and request/response shapes live once in
  [src/calculatorContracts.ts](../../src/calculatorContracts.ts) and are imported by server, UI
  controller, and tests alike; the one necessary duplicate (the hand-written OpenAPI enum) is
  guarded by the CAL-06 drift test ([tests/api.spec.ts](../../tests/api.spec.ts) lines 102-129).
- `docs/backlog.md` is the declared status source of truth and is on `main` and current to
  2026-07-17 - the gap being the unrecorded publication event and the request-size item
  (Risks 1-2).
- The UI operator list is hand-duplicated in two places (`isUiOperator` in
  [src/uiController.ts](../../src/uiController.ts) lines 93-100, and the `<select>` options in
  [public/index.html](../../public/index.html) lines 29-34) without a guard; acceptable at four
  operators, worth noting if the enum ever grows.

## API Contract Compliance

- The REST surface is small and clean: POST for the calculation command, correct 200/400/422/404
  taxonomy (422 reserved for well-formed-but-unsupported), JSON error bodies with a stable
  `{error, details}` shape, and `content-type`/`content-length` set on every response.
- The OpenAPI 3.1 document is served at `/openapi.json` and its schemas match the TypeScript
  contracts; the drift-guard test now enforces the enum half of that mechanically.
- Minor honest gap: the OpenAPI document does not describe the 404 unknown-route or 500 fallback
  responses - defensible scope for a teaching contract, and both are covered by tests.

## Screenplay Parity

- Parity with the sibling library's idiom is strong: the project consumes `Task.where`,
  `Interaction.where`, `Question.about`, `Ensure`, `Remember`/`Recall`, `Cast`/`Stage` exactly
  as the provider's own examples do, and extends `Ability` for the browser rather than inventing
  a parallel mechanism.
- The provider was verified present and built at `77e6df6` (read-only); its internals were out of
  scope here per the cross-tree constraint.

## Batch File Design

- N/A - the repository contains no batch/shell scripts; automation is npm scripts plus one
  Node preflight script ([scripts/preflight-screenplay.mjs](../../scripts/preflight-screenplay.mjs)),
  which is well designed: exact remedy on failure, `--built` mode for the verify gate, exit
  codes correct.

## Documentation Alignment

- Strong overall (ADR review log, backlog reconciliation discipline, changelog cross-links), but
  this is where all four actionable findings of this review live: the stale "remains private"
  README section (Risk 1), the missing request-size disposition (Risk 2), the structure note
  missing `uiController.spec.ts` (Risk 3), and the uncut changelog (Risk 4).
- The pattern matches the portfolio's recurring cross-project theme: implementation lands
  cleanly; prose that describes the implementation lags one beat behind.

## Logging Alignment

- The application logs exactly one startup line ([src/startServer.ts](../../src/startServer.ts)
  line 17); the preflight logs a single OK/FAILED verdict. Proportionate to the SUT - N/A beyond
  that; there is no logging framework to drift.

## Test Coverage Metrics

- 18 tests: 6 domain unit, 7 REST integration, 1 browser controller resilience, 4 BDD scenarios
  (2 API, 2 UI) - all green in this review's `npm run verify` run (1.8 minutes, workers=1).
- Every HTTP status the server can emit except the 500 fallback is exercised; the 500 path is
  unreachable without fault injection and is acknowledged rather than padded.
- No coverage tooling is configured; at 18 tests over ~600 lines of `src/`, manual inspection
  suffices and adding instrumentation would be YAGNI - the one intentionally uncovered branch
  (the `/uiController.js` asset read) is recorded in the backlog's CAL-05 entry.

---

[<- Previous: Project Reviews](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
