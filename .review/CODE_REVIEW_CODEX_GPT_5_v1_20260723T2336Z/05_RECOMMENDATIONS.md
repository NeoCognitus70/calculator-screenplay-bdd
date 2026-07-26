# Recommendations

[<- Back to Index](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

Reviewer: AI assistant (Codex GPT-5)

## Recommended Refactors

1. **P1 - Reconcile 0.2.0 metadata.** Align package-lock root fields, decide the OpenAPI versioning
   policy, update the document, and add a static drift check.
2. **P1 - Reject blank browser operands.** Treat empty strings as missing before numeric conversion
   and add a focused browser/controller regression test.
3. **P2 - Make port parsing strict and shared.** Reject partial and fractional values and cover
   boundaries with table-driven tests.
4. **P2 - Enforce JSON media type.** Add a `415` path, OpenAPI response, and integration tests.
5. **P2 - Complete server lifecycle error handling.** Reject listen failures and prove the port
   conflict path.

## Next Steps

1. Triage Risks 1-5 into the backlog; do not preserve the zero-outstanding claim without recorded
   dispositions.
2. Resolve the unattended review questions about API version policy and blank-input semantics.
3. Deliver release metadata and blank-input fixes before optional coverage/reporting work.
4. Run the full `npm run verify` gate in an exclusive two-repository session after implementation;
   record both consumer and sibling tree status before and after.
5. Refresh the project handover only if the next session resumes work or changes the public claims;
   the current stale-handover warning is advisory for a resting project.

## Future Project Ideas

1. Add a small OpenAPI conformance test that validates example requests/responses against the
   document, keeping the hand-written contract honest without adding a production dependency.
2. Demonstrate a decision table for browser input parsing, separating missing, malformed, boundary,
   and valid values.
3. Add optional coverage reporting for the pure domain and HTTP adapter if quantitative portfolio
   evidence becomes a goal.
4. When ADR 0001's external-consumer trigger fires, release and pin the sibling package and compare
   reproducibility before/after.

## Priority Roadmap

| Priority | Item | Acceptance Signal |
|---|---|---|
| P1 | Version metadata | Package, lock root, OpenAPI policy, changelog, and backlog agree; static drift check passes |
| P1 | Blank operands | Both empty fields produce an accessible error; zero remains a valid operand |
| P2 | Port parsing | Full-string integer validation and boundary tests pass |
| P2 | Media type | Unsupported types return documented 415; JSON with charset remains valid |
| P2 | Listen lifecycle | A port conflict rejects `listen()` predictably |
| Optional | Coverage evidence | A useful summary is published without distorting test design |

## Recorded Questions

1. **OpenAPI version policy:** independent API contract version or package release version?
2. **Blank operand semantics:** required validation error or deliberate zero coercion?

The review proceeded with the evidence-based assumptions documented in Risks 1 and 2.

---

[<- Previous: Cross-Cutting Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)
