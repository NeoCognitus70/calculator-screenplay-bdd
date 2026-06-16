# Annex: Test Strategy

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)
**Date:** 2026-06-16T15:42Z

This annex breaks the suite down by layer and records the coverage map and gaps. Counts are by
static inspection of source; the suite was **not executed** (build-race constraint), so there is no
coverage-report figure here.

## Layer breakdown

| Layer | File | What it covers | Count |
|---|---|---|---|
| Unit (domain) | [tests/domain.spec.ts](../../../tests/domain.spec.ts) | each operator (one example each), invalid-shape validation, divide-by-zero rejection | 3 tests |
| Integration (REST) | [tests/api.spec.ts](../../../tests/api.spec.ts) | health + OpenAPI shape, valid calc (200), invalid contract (400), divide-by-zero (422) | 4 tests |
| Acceptance (BDD API) | [features/calculator-api.feature](../../../features/calculator-api.feature) | add (200), divide-by-zero rejection | 2 scenarios |
| Acceptance (BDD UI) | [features/calculator-ui.feature](../../../features/calculator-ui.feature) | multiply in browser, divide-by-zero error message | 2 scenarios |

Pyramid shape is correct: most coverage in the cheap layers, four acceptance scenarios on top.

## Runtime lifecycle and isolation

- One shared `webServer` for the whole run ([playwright.config.ts](../../../playwright.config.ts)
  lines 29-38); `reuseExistingServer` on locally, off in CI. The server is built and started via
  `npm run dev`.
- `--workers=1` on every script ([package.json](../../../package.json) lines 14-16) serialises
  execution, so the shared server and the actors' per-scenario `ManageData` stores do not collide.
  This is the de facto isolation mechanism; `fullyParallel: true` is nominally set but inert (Risk
  1).
- Each BDD scenario builds a fresh `Stage`/`Cast` and a fresh actor
  ([tests/calculatorSteps.ts](../../../tests/calculatorSteps.ts) lines 112-126), so no actor state
  leaks across scenarios.

## Waits / synchronisation

- The one async-render race (the W6 flake) is correctly handled: `TheDisplayedCalculation.message()`
  waits on a settled `data-state` attribute before reading
  ([tests/calculatorQuestions.ts](../../../tests/calculatorQuestions.ts) lines 42-50). No arbitrary
  sleeps anywhere.
- API questions read `LastResponse` synchronously after the awaited request -- no polling needed.

## Data setup, API/token/auth assumptions

- No auth: the calculator API is unauthenticated by design; no tokens, headers, or secrets are
  required by the suite.
- Test data is inline literals in features and specs; no fixtures, factories, or external data
  files. `ManageData.usingAnEmptyStore()` is used purely to demonstrate scenario memory
  (`Remember.that('lastCalculationRequest', ...)`), not to seed external state.
- The only environment inputs are `CALCULATOR_PORT`/`CALCULATOR_HOST`, validated at startup
  ([src/environment.ts](../../../src/environment.ts) lines 23-31) and defaulted in the config.

## Coverage gaps (see Risk 5)

- No malformed-JSON 400 test (server branch:
  [src/calculatorHttpServer.ts](../../../src/calculatorHttpServer.ts) lines 114-120).
- No 404-route test (lines 81-85) and no `/uiController.js` static-asset test (lines 171-176).
- No domain boundary-value tests (negatives, large products, non-terminating finite division,
  empty body -> `null`).
- The BDD 422 contract is hidden in a Task, not expressed in Gherkin (Risk 2).

---

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md)
