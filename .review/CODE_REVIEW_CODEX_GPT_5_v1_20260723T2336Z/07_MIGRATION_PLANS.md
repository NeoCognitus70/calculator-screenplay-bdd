# Migration Plans

[<- Back to Index](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Next: Index ->](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md)

Reviewer: AI assistant (Codex GPT-5)

## Plan 1 - Single Source of Truth for Features and Contracts

1. Decide whether application, lockfile, and OpenAPI versions are one release version or separately
   versioned concepts; record the policy in README or an ADR.
2. Reconcile the current 0.2.0/0.1.0 split without changing dependency resolution.
3. Keep `calculatorOperators` as the domain source and reuse `isCalculatorOperator` in the UI to
   reduce the duplicated operator list.
4. Expand the static contract check from operator enum equality to version, required fields, media
   types, and documented status codes.
5. Keep Gherkin plus steps as the BDD source and continue ignoring generated specs.
6. Add the drift checks to `verify` only after proving they are deterministic and do not write into
   either checkout.

## Plan 2 - Docker Compose for Local Development

N/A - the SUT is a dependency-free local Node process with no database or supporting service.
Docker Compose would add ceremony without improving isolation, reproducibility, or teaching value
at the present scale.

## Plan 3 - GitHub Actions and Reproducibility

1. Retain the existing PR/push triggers, read-only permission, npm cache, Chromium-only install,
   failure evidence, and canonical verify command.
2. Keep provider-first side-by-side checkout while ADR 0001 remains accepted.
3. When the external-consumer trigger fires, tag the provider, pin the consumer dependency and CI
   checkout to the same release, and remove the source-layout preflight.
4. Consider an additional supported Node LTS lane before claiming all Node versions covered by
   `>=20`; keep Node 20 as the required gate until policy changes.
5. Consider immutable commit SHA pins for GitHub Actions as optional supply-chain hardening, with
   comments or automation preserving readable version context.
6. Add a concise machine-readable test-result or coverage summary only if portfolio trend reporting
   becomes a real requirement.
7. Continue running cross-tree gates only in exclusive sessions and verify that both repositories
   remain clean before and after.

## Execution Order

1. Version policy and metadata reconciliation.
2. Blank-input correctness and regression coverage.
3. Strict environment/media-type/lifecycle hardening.
4. Backlog and changelog reconciliation.
5. Exclusive full verify run across the coupled checkouts.
6. Optional CI and coverage enhancements.

## Rollback and Safety

- Each improvement should be a small reviewable commit with no unrelated provider edits.
- Capture consumer and sibling `git status --short` before and after any coupled gate.
- Do not modify the accepted sibling strategy while fixing independent application defects.
- Preserve the existing `400` vs `413` vs `422` semantics when adding `415`.
- If a new contract check proves brittle, keep the source fix and remove only the brittle assertion;
  do not weaken runtime validation.

---

[<- Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Next: Index ->](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md)
