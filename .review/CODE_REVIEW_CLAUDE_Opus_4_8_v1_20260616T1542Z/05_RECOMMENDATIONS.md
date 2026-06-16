# Recommendations

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)
**Date:** 2026-06-16T15:42Z

These recommendations are improvements to an already-complete project. None is a defect fix; the
backlog correctly records zero outstanding risks. Priorities are relative to each other, not
absolute urgency.

## Recommended Refactors

- **Reconcile the parallelism story (Risk 1).** Either set `fullyParallel: false` to match the
  `--workers=1` reality, or keep it and add a comment explaining that the single worker is the
  deliberate guard against the shared `webServer`. Honesty in the most-copied config file.
  ([playwright.config.ts](../../playwright.config.ts) line 22.)
- **Make the rejection contract visible at the BDD layer (Risk 2).** Add a Gherkin phrasing that
  distinguishes "reject as unsupported" (422) from "reject as a bad request" (400) so the
  business-readable layer can express the REST distinction the server makes.
  ([tests/calculatorTasks.ts](../../tests/calculatorTasks.ts) lines 54-59;
  [tests/calculatorSteps.ts](../../tests/calculatorSteps.ts) lines 63-71.)
- **Move the screenshot caveat next to the setting (Risk 3).** A one-line comment by
  `screenshot: 'on'` pointing to the README guidance keeps the trade-off with the config when it is
  copied.

## Next Steps

- **Close the cheap coverage gaps (Risk 5).** Add a malformed-JSON 400 API test, a 404 API test,
  and 2-3 domain boundary-value unit tests (negatives, a large product, non-terminating finite
  division). All are bottom-of-pyramid, fast, and strengthen the ISTQB story without touching the
  BDD layer.
- **Optionally pin the CI sibling checkout (Risk 4).** If a touch more CI reproducibility is wanted
  before ADR 0001's revisit trigger fires, pin the second checkout to a sibling tag/SHA. CI-only;
  the local sibling convention stays as documented.
- **Consider a contract-drift guard for OpenAPI.** A tiny test asserting the OpenAPI operator enum
  equals `calculatorOperators` would prevent the hand-written document drifting from
  `calculatorContracts.ts` ([src/openApiDocument.ts](../../src/openApiDocument.ts) line 93 vs
  [src/calculatorContracts.ts](../../src/calculatorContracts.ts) line 10).

## Future Project Ideas

- **A second consumer of the sibling library in another language binding** (e.g. a Python or C#
  Screenplay harness against the same calculator API) to demonstrate the code-agnostic claim
  end-to-end, mirroring the multi-stack approach used elsewhere in the portfolio.
- **A generated-OpenAPI variant** showing the trade-off the project deliberately avoided (a
  generator vs the hand-written document), as a teaching contrast on KISS/YAGNI.
- **A parallel-safe variant** that introduces per-worker server instances and data isolation, used
  to teach exactly why `--workers=1` is needed here and what it costs to lift that constraint.

---

[<- Previous: Cross-Cutting Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)
