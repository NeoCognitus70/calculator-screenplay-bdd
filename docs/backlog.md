<!--
  AUDIENCE: Engineers, AI agents, and project leads maintaining work-in-progress tracking.
  PURPOSE:  Single source of truth for outstanding work, risks, and planning for this project.
  LOCATION: docs/backlog.md
  TEMPLATE: test-automation-portfolio/templates/backlog.template.md
-->

# Calculator Screenplay BDD — Backlog

**Version:** 10 — records the README public-readiness closure (TRIAGE-01, review v2 Risk 1) and
corrects the stale "Based on" reference (review v2 Risk 5). No outstanding items remain.
**Last Updated:** 2026-07-19
**Based on:** `main` at `d2b7175` (merge of PR #16, code review v2), both code reviews under
`.review/`, P-04 licensing evidence, and
[`docs/audits/2026-07-14_public-readiness.md`](./audits/2026-07-14_public-readiness.md).

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

#### 2026-07-19 public-readiness closure (TRIAGE-01) ✅ Resolved

Code review v2 (`.review/CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z/`, Risk 1) found the
README's "Public-readiness status" section still stated the repository "remains private", even
though the 2026-07-14 P-07 publication action plan completed Stage 1: Calculator was made public
at 2026-07-14T16:49:29Z, and every mandatory post-change check passed (anonymous repo/commit/
LICENSE/Actions/README visibility, disposable-clone `npm run verify` 16/16 and `npm audit` 0, the
`main` ruleset `main: PR + verify (Node 20)` active, and secret scanning/push protection/
dependency alerts/Dependabot security updates enabled) — see
`PORTFOLIO_P07_PUBLICATION_ACTION_PLAN_2026-07-14.md` (portfolio root) Stage 1 evidence log for
the full record.

- README's "Public-readiness status" section now states the repository was made public on
  2026-07-14 and that the runbook's post-change checks were completed and verified.
- This entry records that closure in the backlog; the stale "Based on" header reference
  (`f52e72c`, a PR branch tip rather than a `main` merge commit) is corrected above (review
  Risk 5, folded into this closure per the triage worklist).

#### 2026-07-17 optional-refinement close-out (CAL-06, CAL-11, CAL-12) ✅ Resolved

The three optional teaching/robustness refinements the 2026-07-14 reconciliation left open
(review Risks 6 and 8, plus the standalone contract-drift recommendation) are now delivered on
`worklist/cal-06-contract-drift-guard` (PR #15):

| Item | Review finding | Severity | Resolution | Commit |
|---|---|---|---|---|
| **CAL-06** | Standalone recommendation — no OpenAPI/domain contract-drift guard | Low | Added a test asserting the `/openapi.json` operator `enum` (`src/openApiDocument.ts`) is set-equal to `calculatorOperators` (`src/calculatorContracts.ts`). Suite 16 → 17. | `d809428` |
| **CAL-11** | Risk 6 — the UI controller's `data-state` contract was non-total (an unhandled fetch rejection left it stuck at `idle`) | Low | Wrapped `submitCalculation`'s fetch/response body in `try/catch`, routing failures through the existing `showError(...)`. Added `tests/uiController.spec.ts`, which aborts the `/api/calculations` route and asserts the settled error state. Suite 17 → 18. | `23cbbdb` |
| **CAL-12** | Risk 8 [Info] — the `Remember.that('lastCalculationRequest', ...)` calls were write-only; SCREENPLAY.md's "demonstrates scenario memory" claim was not exercised | Info | Chose option (a), recall (recorded loop default): added `TheRememberedCalculation` (`tests/calculatorQuestions.ts`), which recalls the request via `Recall.the(...)` and derives the expected result/expression through the same pure `calculate()` the server/UI use; wired into the "API result should be" and "displayed result should be" Then steps. `SCREENPLAY.md` updated. No reduction in scenario coverage. | `f52e72c` |

`npm run verify` was green after every commit; 18/18 Playwright tests on the branch. This closes
every finding from the 2026-07-06 `CLAUDE_Fable_5` review (Risks 1–9 and the standalone
recommendation) with a recorded disposition — see the 2026-07-14 entry below for Risks 1–5 and 9,
and Risk 7 (Info, recorded-not-actioned, no code implication) noted there as well.

#### 2026-07-14 public-readiness reconciliation ✅ Resolved

The 2026-07-06 `CLAUDE_Fable_5` review identified publication-facing dependency, licensing,
backlog, Node-floor, and CI-diagnostic gaps. P-04 and this P-07 audit tranche now reconcile them:

- review Risks 1/3: `playwright-bdd` v9 plus removal of unused `tsx` reduce full `npm audit` from
  six dev-only findings to zero; production remained zero;
- review Risk 2: P-04 added the recognised Apache-2.0 licence and explicit sibling boundary;
- review Risk 4: PR #11 merged backlog v7 before this reconciliation;
- review Risk 5: Node.js ≥20 is now documented and enforced through package metadata;
- review Risk 9: CI now retains failure-only Playwright evidence, uses current v7 action majors,
  and disables persisted checkout credentials.

Review Risks 6–8 and CAL-06 remain optional teaching/robustness refinements, not outstanding
required risks. The repository-visibility and historical-email decisions live in the linked P-07
audit because they require owner authority rather than code implementation.

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
| Resolved | 4 risks + 5 review refinements (CAL-01..05) + public-readiness reconciliation + 3 optional refinements (CAL-06, CAL-11, CAL-12) | ~3 hrs + 3 review cycles | |

---

## Potential Next Steps

No open next steps remain. All prior recommendations (CAL-01..14 and the P-04/P-07 remediation)
are delivered; see "Delivered" below.

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
2. ✅ **CAL-06/CAL-11/CAL-12** — DONE 2026-07-17 (PR #15). OpenAPI contract-drift guard, total UI
   controller error handling, and closing the write-only `Remember` loop. See the "2026-07-17
   optional-refinement close-out" entry under Resolved Risks above for detail and commits.

---

## Maintenance Notes

- Include links/paths to affected files when adding new items.
- Update the version number at the top when items change status.
- Cross-reference code review findings in `.review/` once a review exists.
- Mark completion dates when items move to ✅ Resolved.
- Update effort estimates with actuals after completion.
