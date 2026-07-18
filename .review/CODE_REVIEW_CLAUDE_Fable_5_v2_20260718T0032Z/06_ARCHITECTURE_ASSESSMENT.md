# Architecture Assessment

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-18T00:32Z

## Test Pyramid

- Textbook shape, honestly implemented: 6 fast domain unit tests at the base
  ([tests/domain.spec.ts](../../tests/domain.spec.ts)), 7 REST integration tests
  ([tests/api.spec.ts](../../tests/api.spec.ts)) plus 1 browser resilience test in the middle,
  and only 4 E2E BDD scenarios at the top.
- The pyramid is argued in prose as well as practised ([SCREENPLAY.md](../../SCREENPLAY.md)
  lines 87-96): broad arithmetic coverage stays cheap and low; browser scenarios prove workflows.
- One structural wrinkle: the middle layer's project is named `unit-and-api` but now also hosts
  a browser test (Risk 3) - a naming/doc currency issue, not a pyramid violation.

## SOLID Principles

- **SRP:** every module states one responsibility in its header and holds to it; the server file
  routes and translates, the domain calculates, the controller renders.
- **OCP/LSP:** the `HttpClient` interface lets `PlaywrightApiClient` substitute for the library's
  fake transports without changes upstream; `BrowseTheWeb` extends the library's `Ability` base
  cleanly.
- **ISP/DIP:** tasks and questions depend on intention-revealing abilities, never on raw
  Playwright fixtures; the domain depends on nothing above it. The dependency arrows all point
  inward.

## KISS (Keep It Simple, Stupid)

- The SUT uses only `node:http` and the platform - no framework, no generator, no runtime deps -
  which keeps the entire application readable in one sitting.
- `fullyParallel: false` with a comment naming the real constraint is KISS applied to test
  infrastructure: the config says what the suite actually does.
- The preflight script is 49 lines and produces the exact remedy command on failure - simplicity
  in the service of onboarding.

## YAGNI (You Aren't Gonna Need It)

- Previous reviews' YAGNI findings were acted on (unused `tsx` removed); nothing in the current
  tree is speculative.
- Deferrals are recorded with triggers instead of built ahead of need: CI sibling pin (ADR 0001
  review log), coverage tooling, parallelism.
- The hand-written OpenAPI document (instead of a generator dependency) is YAGNI done right for
  a four-operation API - now with a drift test covering its one duplication risk.

## REST + OpenAPI

- Correct method/status usage including the uncommon-but-right 422 for well-formed-unsupported
  requests, distinguished from 400 malformed - and that distinction is now taught at the BDD
  layer too ([features/calculator-api.feature](../../features/calculator-api.feature) lines 8-15).
- OpenAPI 3.1 served from the SUT itself and asserted in tests (`toMatchObject` on the paths, and
  set-equality on the operator enum).
- Gap (minor, acknowledged): 404/500 response shapes are implemented and tested but not described
  in the OpenAPI document.

## ISTQB Strategies

- Equivalence partitioning and boundary-value analysis are explicit in
  [tests/domain.spec.ts](../../tests/domain.spec.ts) (negative operands across zero, magnitude,
  non-terminating division - lines 53-87), added deliberately under CAL-05 to back the README's
  claim.
- Error-guessing/negative testing covers malformed JSON (raw `Buffer`), invalid contract, unknown
  route, aborted network - each at the cheapest layer that can prove it.
- Decision-table thinking shows in the 400-vs-422 taxonomy; state-transition testing appears as
  the UI `data-state` contract (`idle -> success|error`) with the CAL-11 test proving totality.

## Pedagogical Comments

- Uniform file-header pattern (Responsibility + Pedagogical decision) across `src/`, `tests/`,
  config, and even the feature files - the repo's strongest signature.
- Comments consistently explain *why* at the point of risk: the Buffer re-serialisation trap, the
  settled-state wait, the derived-oracle intent (CAL-12 comments in steps and questions).
- The one missing why-comment this review found is the pairing invariant behind the derived
  oracle (Risk 6, optional one-liner).

---

[<- Previous: Recommendations](05_RECOMMENDATIONS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)
