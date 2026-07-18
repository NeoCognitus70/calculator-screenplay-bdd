# Executive Summary

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Risks and Issues ->](02_RISKS_AND_ISSUES.md)

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-18T00:32Z

## Verdict

`calculator-screenplay-bdd` is a small, deliberately compact teaching project in demonstrably
excellent health. Every gate this review could run honestly is green: `npm run verify` passes
18/18 (typecheck, build, unit, API, UI-controller, and Screenplay BDD layers), `npm audit`
reports zero vulnerabilities, the default branch's latest CI run succeeded, GitHub shows zero
open Dependabot alerts, and an active `main` ruleset requires the `verify (Node 20)` check. The
backlog (v9) claims zero outstanding items, and with one paper-trail exception (Risk 2) the repo
substantiates that claim. All findings from both previous reviews (CLAUDE_Opus_4_8 v1 and
CLAUDE_Fable_5 v1) have verifiable dispositions. The residual findings of this v2 review are
documentation-currency items exposed by the repository's recent move to public visibility - the
code itself gave this reviewer nothing of substance to fault.

## Design Quality

- Clean hexagonal separation: the pure domain ([src/calculatorDomain.ts](../../src/calculatorDomain.ts))
  has no HTTP, browser, or Playwright imports; the HTTP server and browser controller are thin
  adapters over the same shared contract module.
- The Screenplay layer is faithful to the pattern: tasks compose interactions in domain language,
  interactions alone know Playwright mechanics, questions alone observe outcomes, and step
  definitions carry only translation and actor setup.
- The test pyramid is real, not rhetorical: 6 domain unit tests, 7 API integration tests, 1
  controller-resilience browser test, and 4 business-readable BDD scenarios - broad coverage low,
  workflow proof high.
- Decisions are governed: the sibling-checkout coupling has an ADR with a revisit trigger and a
  dated review log; the CI floating-`main` trade-off was reviewed and deferral reaffirmed rather
  than left implicit.

## Code Quality

- TypeScript is strict (`strict`, `exactOptionalPropertyTypes`, `noUnusedLocals`,
  `noFallthroughCasesInSwitch`) and the code passes with no suppressions anywhere in the tree.
- Every file opens with a responsibility-plus-pedagogical-decision header, and inline comments
  consistently explain *why* (e.g. the Buffer trick in the malformed-JSON test, the settled
  `data-state` wait rationale).
- Error handling is total on both sides of the wire: the server maps SyntaxError/validation/
  unsupported/unknown to 400/400/422/500, and the UI controller (post-CAL-11) settles every
  submission to `success` or `error`.
- The suite avoids the classic flake traps: the one async-render race ever found was fixed with
  an explicit settled-state wait and is regression-documented in the question itself.

## Main Highlights

- **A closed review loop, twice over.** Two prior reviews produced findings; all were delivered
  or explicitly deferred with recorded rationale (CAL-01..14), and this review re-verified the
  deliveries against the current tree rather than trusting the narrative.
- **Security and hygiene at zero across the board**: `npm audit` 0, Dependabot alerts 0, CI with
  `contents: read`, `persist-credentials: false`, current v7 action majors, failure-only
  artefact retention, and a branch ruleset gating `main` on the verify check.
- **The CAL-12 fix is a genuine teaching upgrade**: `Remember`/`Recall` now forms a proven round
  trip - the Then steps recall the remembered request and derive the expected outcome through
  the same pure `calculate()` the production code uses, alongside the literal Gherkin expectation.

## Pedagogical Value

- The repo teaches by contrast: plain Playwright specs and Screenplay-backed BDD live side by
  side against the same SUT, letting a learner see exactly what the pattern buys.
- `SCREENPLAY.md`, the flow walkthrough, and the structure note form a graded reading path, and
  the structure note even states its own maintenance contract - which Risk 3 shows being missed,
  itself a useful lesson in documentation debt.
- Trade-offs are argued, not hidden: always-on screenshots, `fullyParallel: false`, and the
  unpinned sibling each carry an inline justification and an exit condition.

---

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Risks and Issues ->](02_RISKS_AND_ISSUES.md)
