# Code Review: calculator-screenplay-bdd

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-18T00:32Z
**Scope:** Full single-repository review of `calculator-screenplay-bdd` at `main` `4b3f223`
(merge of PR #15), reviewed against `docs/backlog.md` v9 as the project's source of truth.
**Review version:** v2 for this agent (v1: `CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1043Z`,
whose nine findings and standalone recommendation the backlog records as fully dispositioned).

## Table of Contents

1. [Executive Summary](01_EXECUTIVE_SUMMARY.md)
2. [Risks and Issues](02_RISKS_AND_ISSUES.md)
3. [Project Reviews](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md)
4. [Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md)
5. [Recommendations](05_RECOMMENDATIONS.md)
6. [Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md)
7. [Migration Plans](07_MIGRATION_PLANS.md)
8. [ANNEX: Metrics and Validation Evidence](ANNEX/METRICS.md)

## Structure Summary

This is a single-repository review, so the template's multi-project sections are applied per its
"Single-repository reviews" customisation notes: `03_PROJECT_REVIEWS/` carries one project file,
and `04_CROSS_PROJECT_ANALYSIS.md` analyses cross-cutting concerns *within* the repo (suite vs
CI vs application vs documentation). Sections that genuinely do not apply carry an explicit
`N/A` with a one-line justification rather than filler.

## Validation constraint (read before the findings)

The registry row couples this project to the sibling `hand-baked-screenplay-pattern` checkout:
`prepare:screenplay` installs and builds **inside the sibling's working tree**. Per the review
instructions, that cross-tree gate was **not run**. Instead:

- the sibling was verified present and already built by read-only inspection (`dist/` populated,
  clean tree at `77e6df6`, before and after validation);
- the in-repo registry gate `npm run verify` **was** run in full (preflight `--built` read-only
  check, typecheck, build, `bddgen`, and the complete Playwright suite): **18/18 passed**;
- `npm audit` was run: **0 vulnerabilities**;
- the sibling's tree was re-checked clean afterwards.

So this v2 review is validated end-to-end except for the sibling *build* step itself, which was
reviewed as static source only. See [ANNEX/METRICS.md](ANNEX/METRICS.md) for command evidence.

## Key Findings

1. **[Medium] The README still tells the public the repository is private.** GitHub reports the
   repository `public` (Apache-2.0 detected, active `main` ruleset requiring `verify (Node 20)`),
   yet [README.md](../../README.md) (lines 79-84) states "This repository remains private" and
   frames publication as a future action. The P-07 audit's own runbook step 7 (update the public
   landing) is the one step with no in-repo trace. Details in
   [02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md) Risk 1.
2. **[Low] One audit refinement lost its paper trail.** The public-readiness audit named four
   optional refinements; three became CAL-06/CAL-11/CAL-12 and were delivered, but
   **request-size capping** for `readJsonBody` has neither an implementation nor a recorded
   disposition, while backlog v9 declares "No outstanding items remain". Risk 2.
3. **[Low] Structure documentation drifted when CAL-11 landed.** `tests/uiController.spec.ts` is
   a browser-backed test in the `unit-and-api` project, but the README and
   `docs/project-structure-and-test-architecture.md` still describe `tests/*.spec.ts` as
   "Unit and REST integration tests" naming only `api.spec.ts` and `domain.spec.ts`. Risk 3.
4. **[Low] `CHANGELOG.md` has absorbed three delivery waves without a version cut** since
   `0.1.0` (2026-06-11); a public semver-claiming repo deserves a `0.2.0`. Risk 4.
5. **Overall health is excellent**: suite green 18/18 locally and in CI, `npm audit` 0,
   0 open Dependabot alerts, hardened CI, ADR-recorded decisions, and a faithful, well-taught
   Screenplay implementation. No High findings; nothing blocks continued Resting status.

## Navigation Guide

Read [01_EXECUTIVE_SUMMARY.md](01_EXECUTIVE_SUMMARY.md) for the overall verdict, then
[02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md) for the prioritised findings with evidence and
remediations. The remaining sections serve deeper dives: the project review for a guided tour,
the architecture assessment for principle-by-principle alignment, and the annex for raw
validation evidence. Repository-relative links in review files resolve from the repo root.

---

[Next: Executive Summary ->](01_EXECUTIVE_SUMMARY.md)
