# Recommendations

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-18T00:32Z

## Recommended Refactors

- No code refactors are recommended. The application and suite are clean, small, and green; any
  structural change now would be churn. The items below are documentation and process.
- (Risk 1) Rewrite the README "Public-readiness status" section as a dated post-publication note
  linking the audit, and record the publication event (plus the owner's historical-email
  decision and the runbook's post-change check results) in `docs/backlog.md`.
- (Risk 2) Give request-size capping a disposition: either the ~15-line cap + 413 test, or a
  dated declined-with-rationale backlog note with a revisit trigger.
- (Risk 3) Refresh [README.md](../../README.md) line 41 and the structure note's `tests/`
  section/table for `uiController.spec.ts`; state (or change) the browser profile the
  `unit-and-api` project uses for it.
- (Risk 4) Cut `0.2.0`: move `[Unreleased]` into a dated release section, bump `package.json`,
  and tag - the tag also gives ADR 0001's pin-to-tag trigger a concrete target.

## Next Steps

- Bundle Risks 1, 3, 4 and the Risk 5 header fix into one documentation-currency PR - roughly an
  hour of work, no code risk, and it restores the "backlog proves its own claims" property the
  project sells.
- Answer the two recorded unattended questions: (a) were the audit runbook's post-publication
  checks performed (Risk 1)? (b) implement or decline the request-size cap (Risk 2)?
- After that PR merges, this project genuinely has zero outstanding findings across three review
  cycles; its Resting registry status is then fully evidenced.

## Future Project Ideas

- Optional teaching annex: a short "anatomy of a flake" note expanding the settled `data-state`
  story (one-shot read -> race -> explicit state wait) - the repo's best real-world lesson, and
  currently told only in comments and the backlog.
- If the sibling library ever gains an external consumer, exercise ADR 0001's revisit trigger
  end-to-end as a demonstration: tag the provider, pin the dependency, and record the migration -
  a compelling portfolio artefact about dependency governance.
- A tiny mutation-testing demonstration (e.g. Stryker on `calculatorDomain.ts`) would show
  quantitatively that the literal Gherkin oracles catch what the derived oracle alone would not
  (Risk 6), reinforcing the test-design lesson.

---

[<- Previous: Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)
