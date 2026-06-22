<!--
  AUDIENCE: Engineers, AI agents, and project leads maintaining work-in-progress tracking.
  PURPOSE:  Single source of truth for outstanding work, risks, and planning for this project.
  LOCATION: docs/backlog.md
  TEMPLATE: test-automation-portfolio/templates/backlog.template.md
-->

# Calculator Screenplay BDD — Backlog

**Version:** 7 — reconciled with the 2026-06-16 code review (`CLAUDE_Opus_4_8` v1) and the
CAL-01..05 refinement cycle: recorded the review and folded all five findings in as resolved
(see "Code Review (2026-06-16) — refinements actioned"). The CHANGELOG already carried these;
this catches the backlog up.
**Last Updated:** 2026-06-22
**Based on:** survey of the repo at commit `16deca9` (README, SCREENPLAY.md, package scripts,
PR #1), plus the `.review/CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z/` code review and the
CAL-01..05 worklist (PRs #8–#10), with `main` at `2a9fe0b` (PR #10 merged).

This backlog tracks outstanding work and risks for the calculator Screenplay/BDD demo project,
ordered by priority score (highest first). It is the project's **source of truth** for item
status — session handovers narrate; this file records.

**Priority Scoring System:**
- **Score = Security Impact (0–10) + Breakage Probability (0–10) + Maintenance Burden (0–10)**
- **HIGH (20–30):** Critical — immediate action required
- **MEDIUM (10–19):** Important — schedule within current sprint cycle
- **LOW (0–9):** Desirable — schedule when capacity allows

---

## Outstanding Risks

_No outstanding risks._

---

### Resolved Risks

Resolved risks are kept here as a record that the gap existed — do not delete them.

#### Risk #2: No CI gate — `npm run verify` never runs on PRs or pushes to `main` ✅ Resolved 2026-06-13

**Priority Score was:** Security Impact (0) + Breakage Probability (6) + Maintenance Burden (4) = **10 points** (MEDIUM)
**Resolution:** Added `.github/workflows/ci.yml` running `npm run verify` on pull requests and
pushes to `main` (Node 20, npm cache). Per
[ADR 0001](./adr/0001-consume-screenplay-library-via-sibling-checkout.md) the workflow checks out
`NeoCognitus70/hand-baked-screenplay-pattern` (its `main`) side by side, so `file:../` and
`prepare:screenplay` resolve exactly as they do locally. `npm_config_cache` redirects the
repo-local `.npmrc` cache path to the runner default so setup-node's cache is effective.

**Unblocked by user decision (2026-06-12):** the library repo was made **public** (option (b)),
so the default `GITHUB_TOKEN` suffices for the second checkout — no PAT secret needed. (The item
was BLOCKED 2026-06-12 while the library was private and no PAT secret existed.)

**Success Criteria:**
- [x] `.github/workflows/` workflow runs `npm run verify` on PRs and pushes to `main` (Node 20, npm cache)
- [x] The workflow checks out the sibling library (its `main`) side by side, so `file:../` resolves as locally
- [x] A green run on the PR introducing it — **run `27450198314`** on PR #4 (`worklist/ci-and-prepare-fix`)
**See:** PR #4.

#### Risk #3: Flaky displayed-message question raced the UI controller's async render ✅ Resolved 2026-06-13

**Priority Score was:** Security Impact (0) + Breakage Probability (5) + Maintenance Burden (2) = **7 points** (LOW)
**Discovered:** 2026-06-13, when Risk #2's first CI run (`27450065305`) failed the divide-by-zero
UI scenario on a fast runner. `TheDisplayedCalculation.message()` read `#calculation-result` with
a one-shot `textContent()` that raced the controller's `fetch → JSON → DOM` update and read the
idle prompt.
**Resolution:** the question now waits for the controller's settled `data-state`
(`success`/`error`) on the element before reading — an explicit wait on a settled-state attribute
rather than racing text content (durable lesson carried from the magento project). Local `test:bdd`
green; CI run `27450198314` green.

**Success Criteria:**
- [x] The displayed-message question waits for a settled render before reading
- [x] Green locally and in CI

#### Risk #4: `prepare:screenplay` mutated the sibling repository on every run ✅ Resolved 2026-06-13

**Priority Score was:** Security Impact (0) + Breakage Probability (5) + Maintenance Burden (3) = **8 points** (LOW)
**Discovered:** 2026-06-12 while running the worklist loop. `npm --prefix ../hand-baked-screenplay-pattern install`
resolved this project's `file:../` reference from the *consumer's* directory (an npm 10.8.2 quirk)
and injected a circular `"calculator-screenplay-bdd": "file:../calculator-screenplay-bdd"`
dependency into the sibling's `package.json`/`package-lock.json` every run — dirtying the provider
repo's tree (and tripping the hand-baked loop's dirty-tree stop condition).
**Resolution:** `prepare:screenplay` now `cd`s into the sibling (`cd ../hand-baked-screenplay-pattern
&& npm install && npm run build`) instead of using `--prefix`, so installs resolve from the
sibling's own directory and its tree stays clean.

**Success Criteria:**
- [x] `prepare:screenplay` no longer modifies any tracked file in `../hand-baked-screenplay-pattern`
  (verified: `git -C ../hand-baked-screenplay-pattern status --porcelain` empty after a prepare run
  from a clean sibling tree)
- [x] `npm run verify` still green afterwards (11/11)
- [x] Recorded in `CHANGELOG.md` [Unreleased] Fixed

#### Risk #1: Hard dependency on a sibling checkout of `hand-baked-screenplay-pattern` ✅ Resolved 2026-06-12

**Priority Score was:** Security Impact (0) + Breakage Probability (6) + Maintenance Burden (4) = **10 points** (MEDIUM)
**Resolution:** Strategy (c), user-confirmed — the `file:../` sibling convention is kept
deliberately for this co-developed teaching pair. Added
`scripts/preflight-screenplay.mjs`, run before `prepare:screenplay` (sibling present?) and before
`verify` (sibling present and built?), failing fast with the exact clone remedy; promoted the
sibling requirement into the README quick-start ("clone both, side by side"); recorded the
decision and its revisit trigger (external consumers ⇒ pinned git dependency with a tagged
release) in
[`docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md`](./adr/0001-consume-screenplay-library-via-sibling-checkout.md).
Actual effort: ~1 hr.

**Success Criteria:**
- [x] A documented, reproducible path from `git clone` to a green `npm run verify` (README
  Prerequisites/Install: clone both repos side by side, `prepare:screenplay`, `install`, `verify`)
- [x] The dependency is explicitly documented with a preflight check that fails with a clear
  error message when the sibling is missing
- [x] Decision recorded (ADR 0001)
**See:** PR introducing the change (worklist branch `worklist/sibling-dependency-and-ci`).

---

## Code Review (2026-06-16) — refinements actioned (CAL-01..05) ✅ All resolved

A full static code review was run on 2026-06-16
(`.review/CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z/`, reviewer `CLAUDE_Opus_4_8`). It
**confirmed the backlog's four resolved risks still hold** and recorded **no blockers** — every
finding is a Low/Info robustness, coverage, or reproducibility refinement on an already-complete
project. A worklist (`WORKLIST_calculator-screenplay-bdd`, derived 2026-06-16) turned the five
findings into CAL-01..05; all five were delivered and merged across **PRs #8, #9, #10** (2026-06-17),
and the CHANGELOG `[Unreleased]` section records each change. This entry catches the backlog up.

| Item | Review finding | Severity | Resolution | Commit / PR |
|---|---|---|---|---|
| **CAL-01** | Risk 1 — `fullyParallel: true` contradicted by `--workers=1` everywhere (latent isolation mixed-message) | Low | Set `fullyParallel: false` (option (a), the honest KISS choice) with a comment naming the single shared `webServer`, the lack of per-test isolation, and the `--workers=1` guard. | `418eef2` / PR #8 |
| **CAL-02** | Risk 2 — the 400-vs-422 rejection contract was invisible at the BDD layer (hard-coded only in the Screenplay task) | Low | Documented the "reject … with …" → 422 (unsupported) convention vs the 400 (bad-request) path in the `features/calculator-api.feature` header comment (lighter option; a new 400 scenario was left to CAL-05's scope). | `daafb01` / PR #8 |
| **CAL-03** | Risk 3 — always-on `screenshot: 'on'` caveat lived only in README prose | Low | Added an inline comment beside `screenshot: 'on'` in `playwright.config.ts` pointing at the README "Screenshots" guidance (switch to `only-on-failure` for larger suites). No behaviour change. | `5eb82db` / PR #9 |
| **CAL-04** | Risk 4 — CI pins the sibling at floating `ref: main`, so an unrelated sibling commit can turn a green PR red (reproducibility) | Low | **DEFER** (user-confirmed 2026-06-17): no CI pin — the floating ref is the intended design for this co-developed teaching pair. Recorded a dated review-log note in ADR 0001; pin-to-tag stays gated on the ADR's external-consumers trigger. | `c881374` / PR #9 |
| **CAL-05** | Risk 5 [Info] — edge-coverage gaps in the API and domain layers | Info | Added bottom-of-pyramid tests: `tests/api.spec.ts` malformed-JSON 400 (raw `Buffer` body) + unknown-route 404; `tests/domain.spec.ts` three ISTQB boundary-value cases (negative operands across zero, a 1e6×1e6 product, the finite non-terminating 1/3 division). BDD layer untouched. Suite went **11 → 16** Playwright tests, `npm run verify` green. The optional `/uiController.js` asset branch was left uncovered as non-trivial. | `3bbe03d` / PR #10 |

**Net effect:** the test suite grew from 11 to **16** Playwright tests (6 `api.spec.ts` + 6
`domain.spec.ts` + 4 BDD scenarios). No new outstanding risk arose from the review; the only
review recommendation **not** actioned by this cycle is the optional OpenAPI contract-drift guard
(see Potential Next Steps below).

---

## Risk Summary

| Priority | Count | Total Effort | Status Distribution |
|---|---|---|---|
| HIGH (20–30) | 0 | — | — |
| MEDIUM (10–19) | 0 | — | — |
| LOW (0–9) | 0 | — | — |
| **Total Outstanding** | **0** | **—** | |
| Resolved | 4 risks + 5 review refinements (CAL-01..05) | ~3 hrs + ~1 review cycle | |

---

## Potential Next Steps

One optional refinement remains open (CAL-06, below); all earlier next steps are delivered.

### LOW Priority — open

1. ⬜ **OpenAPI contract-drift guard (CAL-06)** — Add a fast test (under the `unit-and-api`
   Playwright project) asserting the operator `enum` served at `/openapi.json`
   (`src/openApiDocument.ts`) is exactly equal (order-insensitive) to `calculatorOperators`
   (`src/calculatorContracts.ts`), so adding/removing an operator without updating the
   hand-written OpenAPI document fails the test. **Source:** review `05_RECOMMENDATIONS.md`
   "Next Steps"; carried as item **CAL-06** in `WORKLIST_calculator-screenplay-bdd.md` (derived
   2026-06-20). **Status: NOT STARTED.** This is the one review recommendation the CAL-01..05
   cycle deliberately left out (not tied to a numbered risk); optional and Low priority.

### Delivered

### MEDIUM Priority

1. ✅ **Add `CHANGELOG.md`** — DONE 2026-06-12 (W3, commit `076309c`, PR #3). Scaffolded from the
   portfolio `templates/changelog.template.md`; `[0.1.0]` records the initial suite + PRs #1–#2 and
   `[Unreleased]` tracks ongoing changes; linked from the README's Change History section. (This
   entry was stale — listed NOT STARTED after delivery; pruned in v6.)

### LOW Priority

1. ✅ **Expand `docs/`** — DONE 2026-06-13 (W4). Added
   [`docs/project-structure-and-test-architecture.md`](./project-structure-and-test-architecture.md):
   a short architecture note covering the project layout (`features/`, `src/`, `tests/`), the
   `unit-and-api` vs `bdd` Playwright projects, and how `bddgen` generates the BDD specs. Linked
   from the README. Every claim checked against `playwright.config.ts` and `package.json`.

---

## Maintenance Notes

- Include links/paths to affected files when adding new items.
- Update the version number at the top when items change status.
- Cross-reference code review findings in `.review/` once a review exists.
- Mark completion dates when items move to ✅ Resolved.
- Update effort estimates with actuals after completion.
