# Executive Summary

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1043Z.md) | [Next: Risks and Issues ->](02_RISKS_AND_ISSUES.md)

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-06T10:43Z

## Verdict

`calculator-screenplay-bdd` is a compact, honest, and well-layered teaching repository. It does
what its README claims: a pure domain, a dependency-free HTTP adapter, a static UI, and a test
suite that climbs the pyramid from unit specs to Screenplay-backed Gherkin. The previous review
cycle (2026-06-16, five findings) was **fully actioned in source** - `fullyParallel: false` now
matches the single-worker reality, the 400-vs-422 rejection contract is documented at the BDD
layer, the screenshot trade-off travels with the config, the CI sibling-pin deferral is a dated
ADR entry, and the edge-coverage tests exist. The new findings in this review are hygiene items
(dev-dependency advisories, a missing licence, a stale-on-`main` backlog awaiting PR #11, Node
floor drift), not defects in the tests or the application.

**This was a static-source review by constraint**: the `verify` gate builds inside the sibling
`hand-baked-screenplay-pattern` working tree, which was under concurrent review by another agent,
so no build, typecheck, or test was executed here. `npm audit` (lockfile metadata only) was the
sole toolchain command run.

## Design Quality

- Clean hexagonal separation: [src/calculatorDomain.ts](../../src/calculatorDomain.ts) is pure and
  transport-free; [src/calculatorHttpServer.ts](../../src/calculatorHttpServer.ts) (lines 1-8) is
  explicitly the adapter; the browser controller and the tests both consume the shared contract in
  [src/calculatorContracts.ts](../../src/calculatorContracts.ts).
- The Screenplay layering is faithful and well-policed: steps translate only
  ([tests/calculatorSteps.ts](../../tests/calculatorSteps.ts) lines 1-8), tasks compose intent
  ([tests/calculatorTasks.ts](../../tests/calculatorTasks.ts)), interactions alone touch locators
  ([tests/calculatorInteractions.ts](../../tests/calculatorInteractions.ts)), questions alone read
  outcomes ([tests/calculatorQuestions.ts](../../tests/calculatorQuestions.ts)).
- The REST boundary distinguishes malformed (400) from well-formed-but-unsupported (422) requests
  and teaches that distinction at every layer, including the feature-file header
  ([features/calculator-api.feature](../../features/calculator-api.feature) lines 8-15).
- Risky decisions are recorded, not hidden: the sibling-checkout convention has an ADR with a
  revisit trigger and a dated review log
  ([docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md](../../docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md)).

## Code Quality

- Strict TypeScript throughout (`strict`, `exactOptionalPropertyTypes`, `noUnusedLocals` in
  [tsconfig.json](../../tsconfig.json)); every source file opens with a responsibility comment and
  a pedagogical-decision note.
- Waits are explicit and state-based, not sleep-based: the displayed-message question waits for
  the controller's settled `data-state` before reading
  ([tests/calculatorQuestions.ts](../../tests/calculatorQuestions.ts) lines 38-51), with a comment
  explaining the race it prevents.
- The error taxonomy is typed (`CalculationValidationError` vs `UnsupportedCalculationError`,
  [src/calculatorDomain.ts](../../src/calculatorDomain.ts) lines 16-26) and mapped to status codes
  in exactly one place ([src/calculatorHttpServer.ts](../../src/calculatorHttpServer.ts)
  lines 113-142).
- Two small blemishes: the browser controller has no `fetch` failure handling
  ([src/uiController.ts](../../src/uiController.ts) lines 29-53), and `tsx` sits unused in
  `devDependencies` ([package.json](../../package.json) line 26) while carrying an esbuild
  advisory.

## Main Highlights

- **Previous review cycle fully closed and verifiable in source** - each of the five 2026-06-16
  findings maps to a concrete, inspectable change (see
  [02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md), "Previous review findings").
- **The suite architecture is honest about its constraints**: `fullyParallel: false` with a
  comment naming the shared `webServer` as the reason
  ([playwright.config.ts](../../playwright.config.ts) lines 22-25) is exactly the kind of
  truth-in-configuration a teaching repo should model.
- **CI reproduces the documented local layout** rather than inventing a parallel one: two
  side-by-side checkouts, the same `prepare:screenplay` + `npm run verify` sequence
  ([.github/workflows/ci.yml](../../.github/workflows/ci.yml)).
- **ISTQB claims are now backed by tests**, not just prose: boundary-value cases live in
  [tests/domain.spec.ts](../../tests/domain.spec.ts) (lines 53-87) with a comment tying them to
  the README claim.

## Pedagogical Value

- The three-document set - [SCREENPLAY.md](../../SCREENPLAY.md),
  [docs/screenplay-flow-through-the-sut.md](../../docs/screenplay-flow-through-the-sut.md), and
  [docs/project-structure-and-test-architecture.md](../../docs/project-structure-and-test-architecture.md) -
  gives a learner three altitudes: what the primitives are, how a scenario flows through them, and
  how the toolchain is wired. Few teaching repos separate those concerns this cleanly.
- Comments consistently explain *why* (e.g. why the raw `Buffer` is needed to reach the
  JSON-syntax path, [tests/api.spec.ts](../../tests/api.spec.ts) lines 75-78).
- The one pedagogical gap worth closing is legal, not technical: a public teaching repo without a
  licence cannot actually be reused by the people it teaches (Risk 2).

---

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1043Z.md) | [Next: Risks and Issues ->](02_RISKS_AND_ISSUES.md)
