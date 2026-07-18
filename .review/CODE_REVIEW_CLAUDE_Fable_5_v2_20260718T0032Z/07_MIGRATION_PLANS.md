# Migration Strategy and Plans

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: ANNEX Metrics ->](ANNEX/METRICS.md)

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-18T00:32Z

Per the template's single-repository customisation notes, the three canonical plans scale to
what this repo actually contains. No migration is *required*; each plan below states its
trigger.

## Single Source of Truth for Features

- Already achieved for behaviour: the Gherkin features plus `tests/calculatorSteps.ts` are the
  declared source of truth, with `features/.features-gen/` treated as ignored build output
  ([docs/project-structure-and-test-architecture.md](../../docs/project-structure-and-test-architecture.md)
  lines 84-103).
- Already achieved for contracts: `src/calculatorContracts.ts` is the single typed source, and
  the CAL-06 test polices the one hand-written duplicate (OpenAPI enum).
- Remaining consolidation candidates are small and optional: the UI operator list duplicated
  between `isUiOperator` and the `<select>` markup, and the idle-prompt string duplicated between
  [public/index.html](../../public/index.html) (line 46) and the reset handler in
  [src/uiController.ts](../../src/uiController.ts) (lines 23-27).
- Trigger for action: adding a fifth operator. At that point, generate or guard the UI list the
  same way the OpenAPI enum is guarded.
- Status: no plan needed now; record the trigger (this review suffices as that record).

## Docker Compose for Local Development

- N/A as a need - the SUT is a single dependency-free Node process started by `npm run dev` or
  Playwright's `webServer`; a container would add weight to a project whose lesson is that none
  is required.
- The reproducibility work containers usually buy is already delivered by other means: `engines`
  Node floor, `npm ci`, repo-local npm cache (`.npmrc`), the sibling preflight with exact
  remedies, and a CI job that reproduces the documented two-checkout layout.
- The only Docker-shaped gap is that the sibling layout must exist on the host; the preflight
  makes that failure self-explanatory in seconds.
- Trigger: only if the portfolio ever standardises a containerised dev environment across
  projects; adopt the portfolio pattern then rather than inventing one here.
- Status: consciously not planned (KISS/YAGNI, consistent with ADR 0001's reasoning).

## GitHub Actions / Workflow

- Current status: healthy and hardened. One `verify (Node 20)` job on PR + push to `main`,
  `permissions: contents: read`, `persist-credentials: false` on both checkouts, concurrency
  cancellation, npm cache redirected correctly past the repo-local `.npmrc`, current v7 action
  majors, failure-only Playwright artefacts with 7-day retention
  ([.github/workflows/ci.yml](../../.github/workflows/ci.yml) lines 1-83).
- Enforcement: an active branch ruleset (`main: PR + verify (Node 20)`) requires the gate -
  verified via the GitHub API during this review.
- Known accepted risk: the sibling checkout floats on `ref: main` (lines 46-52); reviewed twice,
  deferral reaffirmed in ADR 0001's review log with the external-consumers trigger. This review
  does not re-open it.
- Plan (small, optional): if Risk 4's `0.2.0` tag is cut, consider a release workflow step or at
  least a tag-protection rule so tags stay trustworthy as ADR pin targets.
- Local reproducibility: CI runs exactly `npm run verify` after the same two-checkout layout a
  developer clones - the parity claim held in this review's local run (18/18, matching CI run
  `29581023044` on `main`).

---

[<- Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: ANNEX Metrics ->](ANNEX/METRICS.md)
