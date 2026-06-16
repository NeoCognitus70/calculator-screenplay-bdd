# Migration Plans

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md) | [Next: Annex - Test Strategy ->](ANNEX/TEST_STRATEGY.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)
**Date:** 2026-06-16T15:42Z

The template names three migration plans. For this small single-repo project, two apply
meaningfully (sibling-dependency promotion and CI evolution) and one is `N/A`. Headings are kept as
required.

## Single Source of Truth for Features

- **Status: largely already achieved; this plan is about the sibling-library dependency, not
  features.** The feature files are already the single source for BDD examples
  ([features/](../../features/)), and the REST contract is single-sourced in
  [src/calculatorContracts.ts](../../src/calculatorContracts.ts).
- The live "single source of truth" question is the **sibling Screenplay library**, consumed via
  `file:../hand-baked-screenplay-pattern` ([package.json](../../package.json) line 20). Today the
  truth is "whatever the sibling working tree holds" -- intentional per ADR 0001.
- **Migration trigger (from ADR 0001):** once `hand-baked-screenplay-pattern` gains consumers
  outside this portfolio, promote the dependency to a **pinned git dependency with a tagged
  release**.
- **Steps:** (1) the sibling cuts a semver tag; (2) change this repo's dependency to a pinned git
  ref (`github:NeoCognitus70/hand-baked-screenplay-pattern#vX.Y.Z`) or a published package; (3)
  retire the preflight's clone remedy in favour of the pinned reference; (4) update the README
  quick-start and ADR 0001 status; (5) update CI to drop the second checkout.
- **Risk:** medium effort, low urgency. Until the trigger fires this plan should not start (YAGNI).
- **Drift guard meanwhile:** optionally add the OpenAPI-enum-vs-contract test
  ([05_RECOMMENDATIONS.md](05_RECOMMENDATIONS.md)) so the one duplicated contract artefact cannot
  silently diverge.

## Docker Compose for Local Development

- **N/A -- the project deliberately ships no containers and needs none.** The app is a single
  dependency-free Node process started by Playwright's `webServer`
  ([playwright.config.ts](../../playwright.config.ts) lines 29-38); there is no database, queue, or
  multi-service topology to orchestrate.
- Adding Docker Compose here would violate the project's stated KISS/YAGNI posture. If a future
  variant introduces a real datastore, revisit; today there is nothing to containerise.

## GitHub Actions / Workflow

- **Status: implemented and healthy.** [.github/workflows/ci.yml](../../.github/workflows/ci.yml)
  runs `npm run verify` on PRs and pushes to `main` (Node 20), checks out the public sibling side
  by side, installs Playwright Chromium, and uses npm caching with `npm_config_cache` redirected to
  the runner default so the repo-local `.npmrc` cache path does not defeat `setup-node`'s cache.
- **Evolution steps worth considering** (none urgent): (1) pin `actions/checkout` and
  `actions/setup-node` are at `@v4` -- fine today; a future Node-version bump (the portfolio
  elsewhere moved to Node 24 actions) could be mirrored here. (2) Pin the sibling checkout to a
  tag/SHA for reproducibility (Risk 4). (3) Add a `concurrency`-safe matrix only if the project
  grows multiple Node versions -- not needed now.
- **Local reproducibility:** strong. The CI sequence (preflight -> typecheck -> build -> test) is
  the same `npm run verify` a developer runs locally, and the side-by-side checkout reproduces the
  documented two-repo layout exactly.
- **Secrets:** none required -- the sibling is public, so the default `GITHUB_TOKEN` suffices
  (recorded in the workflow header and backlog Risk #2). No PAT, no stored secrets: a clean posture.
- **Caveat:** the floating `ref: main` sibling checkout (Risk 4) is the one reproducibility
  trade-off, accepted by ADR 0001.

---

[<- Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md) | [Next: Annex - Test Strategy ->](ANNEX/TEST_STRATEGY.md)
