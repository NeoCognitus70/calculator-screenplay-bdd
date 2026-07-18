# Project Review: calculator-screenplay-bdd

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-18T00:32Z

This is a single-project repository; per the template's customisation notes this is the only
project file.

## Stack and intent

TypeScript (strict, NodeNext ESM) throughout. The SUT is a dependency-free Node `http` server
plus a static browser UI; the test stack is `@playwright/test` with `playwright-bdd` generating
BDD specs from Gherkin, and the Screenplay primitives consumed from the sibling
`hand-baked-screenplay-pattern` library via a `file:../` dependency
([package.json](../../../package.json) lines 23-25). Intent (per
[README.md](../../../README.md) lines 1-18): teach the test pyramid, SOLID boundaries, REST +
OpenAPI, and the Screenplay Pattern in one compact, reviewable repo.

## Assessment

- **Architecture and design patterns.** Exemplary at this scale. The domain
  ([src/calculatorDomain.ts](../../../src/calculatorDomain.ts)) is pure and imports only the
  contract module; HTTP ([src/calculatorHttpServer.ts](../../../src/calculatorHttpServer.ts))
  and the browser controller ([src/uiController.ts](../../../src/uiController.ts)) are adapters
  over the same shared contract ([src/calculatorContracts.ts](../../../src/calculatorContracts.ts)),
  so the 400/422 error taxonomy and operator enum have a single source with a drift-guard test
  (CAL-06) watching the one hand-written copy in the OpenAPI document.

- **Screenplay fidelity.** The layer boundaries hold exactly as taught: step definitions
  ([tests/calculatorSteps.ts](../../../tests/calculatorSteps.ts)) contain only translation and
  actor setup; tasks ([tests/calculatorTasks.ts](../../../tests/calculatorTasks.ts)) compose in
  domain language; interactions ([tests/calculatorInteractions.ts](../../../tests/calculatorInteractions.ts))
  alone touch locators; questions ([tests/calculatorQuestions.ts](../../../tests/calculatorQuestions.ts))
  alone observe. Abilities adapt Playwright cleanly (`PlaywrightApiClient` implements the
  library's `HttpClient`; `BrowseTheWeb` wraps `Page`). The `Remember`/`Recall` round trip added
  by CAL-12 makes scenario memory demonstrable rather than asserted (with the oracle caveat in
  [02_RISKS_AND_ISSUES.md](../02_RISKS_AND_ISSUES.md) Risk 6).

- **Executable specifications.** Both feature files stay business-readable - no selectors, no
  HTTP jargon in scenario lines - and use `Rule:` blocks to group behaviour. The
  [calculator-api.feature](../../../features/calculator-api.feature) header comment (lines 8-15)
  documents the 400-vs-422 rejection convention at the BDD layer, a direct and well-executed
  CAL-02 outcome. Four scenarios is deliberately few; breadth lives lower in the pyramid, and
  [SCREENPLAY.md](../../../SCREENPLAY.md) (lines 87-96) argues that choice explicitly.

- **Test coverage and approach.** 18 tests across four genuine layers: 6 domain unit tests
  (including ISTQB boundary-value cases from CAL-05), 7 REST integration tests (health, contract,
  happy path, 400 validation, 400 malformed JSON via raw `Buffer`, 404, enum drift guard), 1
  browser controller-resilience test (aborted fetch settles to a visible error), and 4 Screenplay
  BDD scenarios. All 18 passed in this review's run; the same `verify` sequence gates CI and is
  ruleset-required on `main`.

- **Isolation, waits, and stability.** Tests run serially by design (`fullyParallel: false` with
  an honest comment naming the shared `webServer` and the `--workers=1` pin -
  [playwright.config.ts](../../../playwright.config.ts) lines 22-25). The one historical flake
  (a one-shot `textContent()` racing the async render) is fixed with an explicit settled
  `data-state` wait and documented in the question itself
  ([tests/calculatorQuestions.ts](../../../tests/calculatorQuestions.ts) lines 40-54). No
  hard-coded sleeps anywhere in the suite.

- **Documentation quality.** Above portfolio par: graded reading path (README -> SCREENPLAY.md ->
  flow walkthrough -> structure note), ADR with revisit trigger and review log, scored backlog,
  keep-a-changelog file, and a publication audit with runbook. The weaknesses are currency, not
  substance: the README's stale "remains private" section (Risk 1), the structure note missing
  `uiController.spec.ts` (Risk 3), and the uncut `[Unreleased]` wall (Risk 4).

- **Weaknesses.** All recorded in [02_RISKS_AND_ISSUES.md](../02_RISKS_AND_ISSUES.md); none are
  code defects. The most substantive is process-level: one audit refinement (request-size
  capping) slipped out of the tracked worklist without a disposition (Risk 2), which matters
  mainly because the backlog stakes its credibility on "zero outstanding" being provable.

---

[<- Previous: Risks and Issues](../02_RISKS_AND_ISSUES.md) | [Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)
