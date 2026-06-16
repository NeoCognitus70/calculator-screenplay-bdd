# Code Review: calculator-screenplay-bdd

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)
**Date:** 2026-06-16T15:42Z
**Scope:** Full single-repository review of `calculator-screenplay-bdd` (static source only)
**Review version:** v1
**Template:** [templates/code-review.template.md](../../../templates/code-review.template.md)

---

## Table of Contents

1. [Executive Summary](01_EXECUTIVE_SUMMARY.md)
2. [Risks and Issues](02_RISKS_AND_ISSUES.md)
3. [Project Reviews](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md)
4. [Cross-Cutting Analysis](04_CROSS_PROJECT_ANALYSIS.md)
5. [Recommendations](05_RECOMMENDATIONS.md)
6. [Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md)
7. [Migration Plans](07_MIGRATION_PLANS.md)
8. Annex
   - [Test Strategy](ANNEX/TEST_STRATEGY.md)
   - [Screenplay Parity](ANNEX/SCREENPLAY_PARITY.md)
   - [API Contract](ANNEX/API_CONTRACT.md)

## Structure Summary

This is a single-project portfolio repository, so the review follows the template's
"Single-repository reviews" customisation: `03_PROJECT_REVIEWS/` carries a single
`PROJECT_001_*.md`, and `04_CROSS_PROJECT_ANALYSIS.md` is a cross-cutting analysis *within* the
repo (suite vs CI vs application vs docs vs the sibling-library coupling). Where a template section
does not apply to a repo this small, the heading is kept and marked `N/A` with a one-line
justification rather than padded.

The review covers: the pure calculator domain (`src/`), the dependency-free Node HTTP server, the
static browser UI and its controller, the Playwright + `playwright-bdd` test toolchain, the
Screenplay glue that consumes the sibling `hand-baked-screenplay-pattern` library, the CI workflow
(side-by-side checkout of the now-public sibling), the `prepare:screenplay`/preflight machinery,
and the project documentation set (README, SCREENPLAY.md, ADR 0001, two `docs/` notes, CHANGELOG,
backlog).

## Key Findings

The project is in strong health. The backlog records zero outstanding risks (four resolved), and
the static review corroborates that: the W6 settled-state wait fix, the W5 `prepare:screenplay`
non-mutation fix, and the W2 CI gate are all present and consistent with the backlog narrative. The
findings below are improvements and small correctness/robustness observations, not blockers.

1. **[Low] `npm test` declares `fullyParallel: true` but the suite relies on a single shared
   server and `--workers=1`; the parallel intent is misleading** -- the config advertises full
   parallelism while every script pins `--workers=1`, so a future maintainer who removes the pin
   inherits cross-test interference risk against the one shared `webServer`. See
   [02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md) Risk 1.
2. **[Low] The API `divide-by-zero` Gherkin asserts a 422 message but the feature text implies a
   rejection without naming the status; the BDD/contract coupling is implicit** -- the step
   `shouldHaveBeenRejectedAsUnsupported()` hard-codes 422, which is correct but invisible to the
   business-readable layer. See [02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md) Risk 2.
3. **[Low] `screenshot: 'on'` ships always-on screenshots** -- intentional and documented for
   pedagogy in the README, but it is a real cost/scaling caveat worth flagging for anyone copying
   the config. See [02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md) Risk 3.
4. **[Low] CI pins the sibling to `ref: main` (floating), matching ADR 0001 by design, but it means
   a green PR here can be silently broken by an unrelated sibling commit** -- the documented
   trade-off, restated as a reproducibility/observability risk. See
   [02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md) Risk 4.
5. **[Info] Light edge-coverage gaps** -- no negative test for malformed-JSON (400 "must be valid
   JSON"), 404 routing, or the `/uiController.js` static path; the domain unit tests skip boundary
   values (very large numbers, negative operands, float precision). See
   [02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md) Risk 5.

## Navigation Guide

Read [01_EXECUTIVE_SUMMARY.md](01_EXECUTIVE_SUMMARY.md) for the design/code-quality verdict, then
[02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md) for the ranked findings with evidence and
remediation. [03_PROJECT_REVIEWS](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md)
gives the per-layer walkthrough; [04_CROSS_PROJECT_ANALYSIS.md](04_CROSS_PROJECT_ANALYSIS.md)
covers the cross-cutting concerns. [06_ARCHITECTURE_ASSESSMENT.md](06_ARCHITECTURE_ASSESSMENT.md)
maps the repo against Test Pyramid / SOLID / KISS / YAGNI / REST+OpenAPI / ISTQB. The annex files
hold the deeper test-strategy, Screenplay-parity, and API-contract evidence.

## Validation Note

This review was conducted against **static source only**. The build gate (`npm run verify`,
`npm install`, `prepare:screenplay`, `bddgen`) was **deliberately not run** because this project's
`verify`/`prepare:screenplay` builds *inside* the sibling `hand-baked-screenplay-pattern` working
tree (`cd ../hand-baked-screenplay-pattern && npm install && npm run build`), and that sibling was
being reviewed concurrently by another agent. Running the gate here would have triggered a
cross-tree build race. The repository's node_modules and the sibling's `dist/` were observed to be
present (so a prior local build exists), but no command that mutates or rebuilds either tree was
executed for this review. Claims about runtime behaviour are therefore inferences from source and
from the backlog's recorded CI run IDs, labelled as such where they appear.

---

[Executive Summary ->](01_EXECUTIVE_SUMMARY.md)
