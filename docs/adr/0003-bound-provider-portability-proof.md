# ADR 0003 — Bound the provider portability proof to a static REST profile

**Status:** Accepted (owner-authorised 2026-08-18 as CAL-23..25)
**Date:** 2026-08-18
**Depends on:** [ADR 0002](./0002-consume-screenplay-provider-via-pinned-release.md)
**Relates to:** `docs/backlog.md` Provider-switching Phase 2, items CAL-23..25

## Context

ADR 0002 established the immutable hand-baked v0.3.0 baseline. CAL-23 then moved provider
selection, Actor construction, ability profiles and scenario lifecycle behind one Calculator-owned
gateway. CAL-24 used that seam to compare hand-baked with a deliberately small independent
Promise-native adapter.

The proof needs a durable project gate without implying a runtime provider registry or paying for
the full Playwright/BDD suite twice. Its scope must remain executable and reviewable: two adapters,
the provider package's four conformance cases, and two Calculator REST cases (accepted
multiplication and rejected division by zero).

## Decision

Calculator exposes `npm run test:provider-contract`, backed by the dedicated Playwright
`provider-contract` project. It selects only:

- `tests/calculatorProviderConformance.spec.ts`; and
- `tests/calculatorProviderContract.spec.ts`.

`tests/screenplay/providerContractProfile.ts` is the executable scope record. It names exactly two
providers (`hand-baked-v0.3.0`, `calculator-promise-native`), exactly two REST case IDs
(`accepted-multiplication`, `rejected-division-by-zero`), their request/result semantics, and the
Calculator Task/Question/assertion descriptions that must remain unchanged. The specs compare live
provider names, cases and descriptions with those invariants.

`npm run verify` runs the named profile first, then `npm test`. The latter explicitly selects only
the `unit-and-api` and `bdd` projects; `unit-and-api` ignores the two provider specs. The provider
profile therefore runs once, while the remaining 42-test suite continues unchanged. The required
Node 20 CI job runs `npm run verify` and labels this inclusion explicitly.

The static BDD gateway continues to select hand-baked v0.3.0 for both REST and browser profiles.
The alternate adapter is not a gateway option and has no hand-baked or Playwright runtime import.

## Non-goals and limits

- No environment-variable, per-scenario or runtime hot-switching.
- No mixing of native Actor, Activity, Question, ability or lifecycle objects between providers.
- No alternate-provider browser/BDD coverage; the comparison is the recorded REST slice only.
- No claim of byte-identical reports, timestamps, screenshots or report-feature parity.
- No adoption proof for Serenity/JS, Cypress, Cucumber or any wider portfolio project.
- No promotion of the portfolio assessment's Phases 3–5.

The proof establishes equivalent required semantics and observations for this bounded slice. It is
not a general compatibility certification.

## Consequences

- Provider portability regressions fail a named, fast profile in the normal local and CI gate.
- Widening provider count, REST cases or protected domain descriptions requires an intentional
  change to executable profile metadata and its review evidence.
- The browser/BDD teaching path stays simple and retains one provider/lifecycle owner.
- Completion status and linked implementation-head/main-branch CI evidence are recorded in the
  backlog only after those runs exist.

## Revisit trigger

Revisit this decision only through separately authorised backlog work that names a concrete new
consumer need and defines its own bounded semantics. Do not treat this proof as standing approval
for runtime selection or further providers.
