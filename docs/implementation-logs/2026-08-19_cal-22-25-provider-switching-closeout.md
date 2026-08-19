# Provider-switching Phase 2 close-out (CAL-22..25) — 2026-08-19

## Session Summary

Provider-switching Phase 2 is complete after four dependency-ordered PRs established the immutable
provider baseline, Calculator-owned composition gateway, bounded alternate-provider REST proof and
permanent CI gate. CAL-25 now has green implementation-head and merged-main evidence, the backlog
records zero outstanding risks, and Phases 3–5 remain deliberately unpromoted.

---

## Objectives

1. ✅ Complete CAL-22..25 in dependency order without widening the owner-authorised Phase 2 scope.
2. ✅ Make the dual-provider proof a named, non-duplicating part of `npm run verify` and required CI.
3. ✅ Recover the required gate from the GitHub-hosted runner's stalled Ubuntu package installation.
4. ✅ Record implementation-head and merged-main CI evidence before closing CAL-25.
5. ✅ Relocate the phase to Resolved Risks and reconcile the canonical backlog to zero outstanding.

---

## Test Results

| Stack | Suite | Before | After | Status |
|---|---|---|---|---|
| Node 20 / Playwright | Full Calculator gate | 42/42 before Phase 2 | 9/9 provider contract + 42/42 remainder | ✅ PASS (`npm run verify`, 2026-08-19) |
| npm | Dependency audit | 0 vulnerabilities at CAL-25 implementation | 0 vulnerabilities at close-out | ✅ PASS (`npm audit --audit-level=low`, 2026-08-19) |
| GitHub Actions | PR #40 implementation head | Stalled host package install, run 32156618021 cancelled | 1/1 required job in 56 seconds | ✅ PASS ([run 32259992244](https://github.com/NeoCognitus70/calculator-screenplay-bdd/actions/runs/32259992244)) |
| GitHub Actions | Merged `main` | Pending until PR #40 merged | 1/1 required job in 1 minute 1 second | ✅ PASS ([run 32260198682](https://github.com/NeoCognitus70/calculator-screenplay-bdd/actions/runs/32260198682)) |

---

## Changes Implemented

### CAL-22 — immutable provider baseline

**Files changed:**
- `package.json`, `package-lock.json` — replaced the moving sibling dependency with the immutable
  hand-baked v0.3.0 release artefact.
- `docs/adr/0002-consume-screenplay-provider-via-pinned-release.md` — recorded the approved release URL,
  SHA-256 and standalone-development policy.
- `scripts/check-screenplay-provider.mjs` — added deterministic manifest, lockfile, workflow and
  decision drift protection.

PR #37 (`4d15bc2`, merge `6c86ffc`) proved a provider-free standalone install and verification.

### CAL-23 — Calculator-owned composition boundary

**Files changed:**
- `tests/screenplay/calculatorScreenplay.ts` — defined the Calculator-owned structural provider seam.
- `tests/screenplay/handBakedScreenplayProvider.ts` — confined the native hand-baked adapter.
- `tests/calculatorFixtures.ts`, `tests/calculatorSteps.ts` — moved scenario Actor/lifecycle creation
  behind the static gateway.
- `scripts/check-screenplay-boundary.mjs` — guarded import, selection and lifecycle ownership.

PR #38 (`66b839f`, merge `d7574c4`) preserved the then-42-test hand-baked browser/BDD default.

### CAL-24 — bounded alternate-provider proof

**Files changed:**
- `tests/screenplay/promiseNativeScreenplayProvider.ts` — added the deliberately small independent
  Promise-native adapter.
- `tests/calculatorProviderConformance.spec.ts` — ran the exported semantic cases through both
  adapters.
- `tests/calculatorProviderContract.spec.ts` — compared the shared accepted/rejected REST slice and
  deliberate assertion-failure observations.

PR #39 (`cfa4a0a`, merge `9bc20d3`) expanded the suite from 42 to 51 without changing the default
browser/BDD provider.

### CAL-25 — permanent gate and evidence boundary

**Files changed:**
- `tests/screenplay/providerContractProfile.ts` — single-sourced the exact providers, REST cases,
  semantics and protected descriptions.
- `playwright.config.ts`, `package.json` — isolated the 9-check `provider-contract` project and kept
  the remaining 42 tests non-duplicating.
- `.github/workflows/ci.yml` — ran the normal verify command in the version-matched Playwright
  1.61.1 Noble container and bounded the job to 15 minutes.
- `README.md`, `SCREENPLAY.md`, `docs/project-structure-and-test-architecture.md`,
  `docs/adr/0003-bound-provider-portability-proof.md`, `docs/adr/README.md`, `CHANGELOG.md` — recorded
  the proof, limitations, evidence boundary and explicit non-goals.

PR #40 (`f595b23`, CI recovery `c18f2be`, merge `dfcace7`) supplied both required CI links. The
container recovery removed the host `npx playwright install --with-deps chromium` path after two
attempts of run 32156618021 stalled in Ubuntu mirror downloads; no project test had failed.

### Phase 2 backlog reconciliation

**Files changed:**
- `docs/backlog.md` — checked every CAL-25 acceptance criterion, moved CAL-22..25 beneath Resolved
  Risks, recorded both CI runs and reconciled the Risk Summary and required sequence to zero.

---

## Technical Decisions

| Decision | Rationale | Alternatives rejected |
|---|---|---|
| Run the required gate in `mcr.microsoft.com/playwright:v1.61.1-noble`, matching `package-lock.json`. | The image pre-provisions Chromium and its Linux dependencies, removing the degraded host Ubuntu mirror from the path to project verification. | A third host-install rerun would repeat the same infrastructure dependency; pinning another Ubuntu runner still requires host package downloads. |
| Bound the CI job to 15 minutes. | The complete containerised gate finishes in about one minute; a bounded failure is more actionable than GitHub's six-hour default cancellation. | Retaining the platform maximum hid the infrastructure fault and consumed two long attempts. |
| Keep Phases 3–5 unpromoted after Phase 2 completion. | The owner authorised only CAL-22..25, and ADR 0003 explicitly limits the proof to two providers and two REST cases. | Treating a bounded proof as standing approval for runtime switching or wider migrations would overstate the evidence. |

No new ADR was created: ADR 0002 and ADR 0003 already own the durable dependency and portability
boundaries; the container choice is an operational implementation of the existing required gate.

---

## Documentation Updates

- `docs/backlog.md` — recorded CAL-25 evidence, resolved CAL-22..25 and reconciled zero outstanding.
- `CHANGELOG.md` — recorded Phase 2 completion and the bounded container-based CI recovery.
- `docs/project-structure-and-test-architecture.md` — aligned the CI architecture with the
  version-matched container and timeout.
- `docs/implementation-logs/2026-08-19_cal-22-25-provider-switching-closeout.md` — added this
  immutable implementation record.

---

## Lessons Learned

- A browser-install bootstrap can fail before any project test runs; separate infrastructure setup
  from test failures in status reports and retain step-level evidence.
- Matching the Playwright package lock to a pre-built Playwright container removes mutable OS-package
  downloads while keeping local and CI verification on the same command.
- Backlog completion evidence should be deferred until both implementation-head and merged-main
  required checks exist; this prevented CAL-25 from being rounded up prematurely.
- Executable scope metadata is stronger than copied documentation for a deliberately bounded proof:
  provider count, case IDs, semantics and descriptions now drift together or fail together.

---

## Recommendations / Next Steps

- [ ] Merge the documentation-only CAL-22..25 close-out PR after its required CI passes — owner,
      current priority.
- [ ] Change the central `portfolio-prompts/registry.yml` row for `calculator-screenplay-bdd` from
      `active` to `resting` after the zero-outstanding backlog reaches `main` — portfolio control
      plane, current priority.
- [ ] Write the terminal project handover after the close-out merge — portfolio support repository,
      current priority.
- [ ] Do not add provider-switching Phases 3–5 without a fresh explicit owner promotion recorded in
      `docs/backlog.md` — governance guard, ongoing.

---

*Session logged: 2026-08-19. Author: Codex.*
