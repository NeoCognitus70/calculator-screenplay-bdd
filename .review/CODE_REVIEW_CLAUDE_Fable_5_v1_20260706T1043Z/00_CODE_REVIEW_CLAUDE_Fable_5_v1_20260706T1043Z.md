# Code Review: calculator-screenplay-bdd

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-06T10:43Z
**Scope:** Full repository review (static source, configuration, CI, and documentation)
**Baseline:** `main` at `2a9fe0b` (Merge pull request #10)

## Review Metadata

- **Project:** `calculator-screenplay-bdd` (portfolio registry: Active; gates `npm run verify`)
- **Stack:** TypeScript, Playwright Test, playwright-bdd, hand-baked Screenplay Pattern library
  consumed from a sibling checkout (`file:../hand-baked-screenplay-pattern`, ADR 0001)
- **Review version:** v1 for this agent (a prior review by a different agent exists at
  `.review/CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z/`; versions are per-agent)
- **Source of truth consulted:** [docs/backlog.md](../../docs/backlog.md) (v6, 2026-06-13 on
  `main`; a v7 reconcile is in flight on open PR #11 - see Risk 4)

### Validation constraint (read first)

This project's `prepare:screenplay` and `verify` gates install and build **inside the sibling
`hand-baked-screenplay-pattern` working tree** (registry coupling note; ADR 0001). At the time of
this review another agent was reviewing that sibling tree concurrently, so running the gate would
have raced a working tree this review does not own. **`npm run verify` (and any typecheck/build/
test step that reads or builds the sibling) was deliberately NOT run. This is a static-source
review.** The only command executed against the toolchain was `npm audit` (registry metadata
resolved from `package-lock.json` only; no build, no sibling access). Test results, CI run IDs,
and report contents cited from the backlog/CHANGELOG are recorded evidence, not re-verified here.

## Table of Contents

1. [Executive Summary](01_EXECUTIVE_SUMMARY.md)
2. [Risks and Issues](02_RISKS_AND_ISSUES.md)
3. [Project Reviews](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md)
4. [Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md)
5. [Recommendations](05_RECOMMENDATIONS.md)
6. [Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md)
7. [Migration Plans](07_MIGRATION_PLANS.md)
8. [Annex: Metrics and Dependency Audit](ANNEX/METRICS.md)

## Structure Summary

This is a single-repository review following the portfolio code-review template. `03_PROJECT_REVIEWS/`
carries one project file; `04_CROSS_PROJECT_ANALYSIS.md` is a cross-cutting analysis *within* the
repo (application vs test suite vs CI vs documentation). Sections that genuinely do not apply are
marked `N/A` with a one-line justification rather than padded.

## Key Findings

1. **[Medium] `npm audit` reports 6 vulnerabilities (5 moderate, 1 low), all in dev-dependency
   chains** - the moderate chain runs playwright-bdd 8.5.1 -> @cucumber/messages -> uuid
   (GHSA-w5hq-g745-h8pq); the low is esbuild (GHSA-g7r4-m6w7-qqqr) reached only through `tsx`,
   which nothing in the repo uses. Fix is a major playwright-bdd v8 -> v9 bump plus deleting `tsx`.
2. **[Medium] No licence anywhere** - `package.json` has no `license` field and there is no
   `LICENSE` file, yet the repo is public and its README invites cloning. Legally this is
   "all rights reserved", which contradicts the teaching intent.
3. **[Low] The backlog on `main` (v6, 2026-06-13) predates the merged CAL-01..05 cycle** - the
   catch-up (v7) exists but only on open PR #11, so the declared "source of truth" is stale on the
   default branch until that PR merges.
4. **[Low] Node floor drift** - README says "Node.js 18 or newer" (EOL) while CI runs Node 20 and
   the sibling library's floor is Node 20; no `engines` field pins anything.
5. **[Low] The UI controller's `fetch` has no failure handling** - a network error becomes an
   unhandled rejection and the result element never leaves `data-state="idle"`, which would stall
   the settled-state wait the questions rely on.

Overall the project is in **good health**: the architecture is clean and honestly documented, all
five findings from the previous (2026-06-16) review were verified as genuinely remediated in
source, and nothing found here is a correctness defect in the test suite itself.

## Navigation Guide

Read [01_EXECUTIVE_SUMMARY.md](01_EXECUTIVE_SUMMARY.md) for the overall verdict, then
[02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md) for the prioritised findings with evidence and
remediation. The project deep-dive is in
[03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md).
Architecture-principle scoring is in [06_ARCHITECTURE_ASSESSMENT.md](06_ARCHITECTURE_ASSESSMENT.md).
Raw dependency/audit evidence is in [ANNEX/METRICS.md](ANNEX/METRICS.md). All file references are
repository-relative from this directory (`../../`).

---

[Next: Executive Summary ->](01_EXECUTIVE_SUMMARY.md)
