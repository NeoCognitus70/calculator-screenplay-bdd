# Architecture Assessment

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)
**Date:** 2026-06-16T15:42Z

Assessment against the template's seven principles. Each notes alignment and any gap.

## Test Pyramid

- **Aligned.** Unit ([tests/domain.spec.ts](../../tests/domain.spec.ts)) at the base, REST
  integration ([tests/api.spec.ts](../../tests/api.spec.ts)) in the middle, and a deliberately thin
  acceptance layer (4 BDD scenarios across two features). The README and SCREENPLAY.md both state
  the risk-based rationale: broad arithmetic coverage stays in cheap layers; BDD reserves itself
  for product workflows.
- **Gap.** Breadth, not shape: the base layer omits boundary values and the middle layer omits
  malformed-JSON/404 paths ([02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md) Risk 5). The balance
  between layers is correct.

## SOLID Principles

- **SRP.** Each module and Screenplay primitive has one role -- domain rules, HTTP adapter, UI
  controller, contract types, OpenAPI doc, and the Task/Interaction/Question/Ability split are all
  clean. Strong.
- **OCP.** New operators would extend the `calculatorOperators` tuple and the two exhaustive
  switches ([src/calculatorDomain.ts](../../src/calculatorDomain.ts) lines 74-98); the compiler's
  totality check flags every site to update -- closed-for-modification pressure done well.
- **LSP.** `PlaywrightApiClient implements HttpClient`
  ([tests/screenplayApiClient.ts](../../tests/screenplayApiClient.ts) line 18) is a faithful
  substitution for the library's client interface; the fake transport and the real one are
  interchangeable.
- **ISP.** Abilities are narrow (`BrowseTheWeb` exposes only `page`; the API client exposes only
  `send`). No fat interfaces.
- **DIP.** Tasks and Questions depend on the library's abstractions (`HttpClient`, `LastResponse`,
  `Ability`), not on Playwright concretes -- the central lesson, delivered.

## KISS

- **Aligned.** Node's built-in `http` serves the API and static UI with no framework; the OpenAPI
  document is hand-written precisely to avoid a generator dependency
  ([src/openApiDocument.ts](../../src/openApiDocument.ts) header comment). The preflight is a single
  ~50-line script. Simplicity is a stated and honoured value.

## YAGNI

- **Aligned.** No logging framework, no DI container, no build tooling beyond `tsc`, no pinned
  release ceremony for the sibling (ADR 0001 rejects it until there are external consumers). The
  project resists over-engineering deliberately.
- **Minor tension.** `fullyParallel: true` is configuration the suite does not use (Risk 1) -- a
  small "you aren't gonna need it (yet)" artefact in the config.

## REST + OpenAPI

- **Aligned.** Correct verb/status semantics (200/400/422/404/500), a JSON contract, and a served
  `/openapi.json` that the API spec self-checks
  ([tests/api.spec.ts](../../tests/api.spec.ts) lines 11-24). See the
  [API Contract annex](ANNEX/API_CONTRACT.md).
- **Gap.** The OpenAPI document omits the 404/500 responses and the static routes, and it duplicates
  the operator enum rather than deriving it from `calculatorContracts.ts` -- a small drift risk
  (Recommendations: contract-drift guard).

## ISTQB Strategies

- **Partially applied.** The README claims equivalence partitioning, boundary values, decision-table
  thinking, and risk-based UI coverage. Equivalence classes (valid op, invalid op, divide-by-zero)
  and risk-based UI selection are clearly present. **Boundary-value analysis is the weakest** --
  the domain tests use single representative values, not boundaries
  ([tests/domain.spec.ts](../../tests/domain.spec.ts) lines 18-35). Closing Risk 5 would make the
  ISTQB claim fully earned.

## Pedagogical Comments

- **Exemplary.** Every source and config file opens with a "Responsibility / Pedagogical decision"
  header explaining *why*, not just *what*; the Screenplay flow note carries Mermaid diagrams and a
  "Common Smells" section. This is the strongest single dimension of the repo and squarely hits the
  mid-level target audience.

---

[<- Previous: Recommendations](05_RECOMMENDATIONS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)
