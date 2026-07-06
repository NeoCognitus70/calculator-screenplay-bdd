# Recommendations

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1043Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-06T10:43Z

## Recommended Refactors

- **Clear the dev-dependency audit debt (Risk 1):** bump `playwright-bdd` `^8.0.0` -> `^9.2.0`
  (major - check the v9 migration notes against `defineBddConfig`/`createBdd` usage) and remove
  the unused `tsx` (Risk 3). Run the full `verify` gate after, once the sibling tree is free.
  Target `npm audit` = 0.
- **Add a licence (Risk 2):** `LICENSE` file + `"license"` field; mirror in the sibling repo so
  the co-cloned pair is uniformly reusable. Maintainer decision required on which licence (MIT
  recommended).
- **Total the UI controller's error handling (Risk 6):** `try/catch` in `submitCalculation`
  routing to `showError(...)`, so every submission ends in a settled `data-state`.
- **Close the Remember loop or cut it (Risk 8):** either recall `lastCalculationRequest` in a
  question or remove the two `Remember.that(...)` calls and the SCREENPLAY.md claim.

## Next Steps

- **Merge PR #11** (backlog v7 reconcile) - written, correct, and two weeks old; until it lands,
  the declared source of truth misdescribes the project on `main` (Risk 4).
- **Fix the Node floor in one commit (Risk 5):** README "Node.js 20 or newer" +
  `"engines": { "node": ">=20" }` in `package.json`.
- **Add a failure-only artefact upload to CI (Risk 9):** `actions/upload-artifact` with
  `if: failure()` for `playwright-report/` and `test-results/`.
- **Record this review in the backlog** when it is next edited (per its own maintenance note,
  [docs/backlog.md](../../docs/backlog.md) line 152), and prune the merged/stale branches
  (`worklist/cal-05-edge-coverage` on the remote; `master`, `docs/screenplay-flow`,
  `docs/backlog-reconcile-changelog` locally).

## Future Project Ideas

- **Contract-drift guard:** a small unit test generating the operator `enum` in
  [src/openApiDocument.ts](../../src/openApiDocument.ts) from `calculatorOperators` (or asserting
  they match), turning the hand-written OpenAPI document into a checked artefact.
- **Parallelism as a lesson:** the `fullyParallel: false` comment already names the preconditions;
  a future chapter could implement server-per-worker isolation and flip the flag, teaching the
  isolation work the comment defers.
- **Consumer-contract demo:** once the sibling library tags a release, demonstrate the ADR 0001
  revisit path (pinned git dependency) in a branch, as a worked example of the trigger firing.

---

[<- Previous: Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1043Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)
