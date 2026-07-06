# Architecture Assessment

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1043Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-06T10:43Z

## Test Pyramid

- **Aligned.** 7 fast pure-domain tests at the base, 6 REST integration tests in the middle, 4
  browser/API BDD scenarios at the top - and the proportions are argued explicitly in
  [SCREENPLAY.md](../../SCREENPLAY.md) (lines 84-91) as risk-based layer selection.
- Broad arithmetic coverage was deliberately pushed down the pyramid when CAL-05 landed
  ([tests/domain.spec.ts](../../tests/domain.spec.ts) lines 53-87), keeping the BDD layer at four
  workflow-proving scenarios. Gap: none of consequence.

## SOLID Principles

- **SRP:** strong - each file states one responsibility and holds to it; validation, calculation,
  transport mapping, and rendering are four separate modules.
- **OCP:** the operator union + exhaustive switches ([src/calculatorDomain.ts](../../src/calculatorDomain.ts)
  lines 74-98) mean a new operator is a compile-checked extension; `noFallthroughCasesInSwitch`
  and the missing-default pattern enforce it.
- **LSP/ISP:** the Screenplay `HttpClient` interface is minimal and honoured by the Playwright
  adapter ([tests/screenplayApiClient.ts](../../tests/screenplayApiClient.ts)); abilities expose
  only what their layer needs.
- **DIP:** the domain depends on nothing; the server depends on the domain's abstractions; tests
  depend on the library's interfaces, not Playwright globals. The one inversion *not* taken -
  the UI controller calling `fetch` directly - is proportionate at this size.

## KISS

- **Aligned.** No framework where `node:http` suffices; no OpenAPI generator for a four-path API;
  no state management library for one form. The honesty items (`fullyParallel: false`, the
  screenshot caveat inline) are KISS applied to configuration.
- Two KISS violations, both trivial: the unused `tsx` dependency (Risk 3) and the write-only
  `Remember` (Risk 8).

## YAGNI

- **Aligned.** ADR 0001 is essentially a YAGNI ruling (no version pin until external consumers
  exist), reviewed and reaffirmed with a dated log entry rather than re-litigated.
- The deferred items are correctly deferred with named triggers (pin-on-external-consumers,
  parallelise-after-isolation), which is YAGNI done properly - deferral with a tripwire, not
  amnesia.

## REST + OpenAPI

- **Aligned.** Correct verb/status usage including the often-fudged 400-vs-422 distinction; a
  served, hand-written OpenAPI 3.1 document ([src/openApiDocument.ts](../../src/openApiDocument.ts))
  matching the implementation; contract presence asserted by test.
- Gap: the OpenAPI document is unvalidated against the types (drift risk noted in
  [04_CROSS_PROJECT_ANALYSIS.md](04_CROSS_PROJECT_ANALYSIS.md), with a cheap guard suggested in
  [05_RECOMMENDATIONS.md](05_RECOMMENDATIONS.md)).

## ISTQB Strategies

- **Aligned, and now evidenced.** Equivalence partitioning (one example per operator class),
  boundary-value analysis (zero-crossing negatives, large product, non-terminating division -
  [tests/domain.spec.ts](../../tests/domain.spec.ts) lines 53-87), and error-guessing on the
  input surface (malformed JSON, wrong types, unknown routes -
  [tests/api.spec.ts](../../tests/api.spec.ts) lines 42-99).
- Decision-table thinking is claimed in the README but is the thinnest of the cited techniques -
  the 400/422/200 mapping is effectively a small decision table, though it is never presented as
  one. Minor.

## Pedagogical Comments

- **Aligned - this is the repo's standout quality.** Comments explain *why* at the point of
  decision: the race the settled-state wait prevents, why a raw `Buffer` reaches the JSON-syntax
  branch, why screenshots are always-on and when to change that, why parallelism is off.
- Gap: the unhappy paths teach less than the happy ones (unhandled `fetch` failure, Risk 6; the
  unread `Remember`, Risk 8). Closing those would make the pedagogy total.

---

[<- Previous: Recommendations](05_RECOMMENDATIONS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1043Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)
