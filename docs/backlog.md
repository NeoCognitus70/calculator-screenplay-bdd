<!--
  AUDIENCE: Engineers, AI agents, and project leads maintaining work-in-progress tracking.
  PURPOSE:  Single source of truth for outstanding work, risks, and planning for this project.
  LOCATION: docs/backlog.md
  TEMPLATE: test-automation-portfolio/templates/backlog.template.md
-->

# Calculator Screenplay BDD — Backlog

**Version:** 4 — Risk #2 (CI gate) resolved via side-by-side checkout (library made public, user
decision 2026-06-12); Risk #3 (flaky displayed-message question) recorded and resolved
**Last Updated:** 2026-06-13
**Based on:** survey of the repo at commit `16deca9` (README, SCREENPLAY.md, package scripts, PR #1)

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

## Risk Summary

| Priority | Count | Total Effort | Status Distribution |
|---|---|---|---|
| HIGH (20–30) | 0 | — | — |
| MEDIUM (10–19) | 0 | — | — |
| LOW (0–9) | 0 | — | — |
| **Total Outstanding** | **0** | **—** | |
| Resolved | 3 | ~2.5 hrs completed | |

---

## Potential Next Steps

### MEDIUM Priority

1. **Add `CHANGELOG.md`** — ~1 hr, NOT STARTED. The portfolio layout contract recommends one; the
   sibling `hand-baked-screenplay-pattern` project has an established example to follow.

### LOW Priority

1. **Expand `docs/`** — the only doc beyond the README is
   `docs/screenplay-flow-through-the-sut.md`; consider a short architecture note covering the
   playwright-bdd project structure (`features/`, `src/`, `tests/`, the unit-and-api vs bdd
   Playwright projects).

---

## Maintenance Notes

- Include links/paths to affected files when adding new items.
- Update the version number at the top when items change status.
- Cross-reference code review findings in `.review/` once a review exists.
- Mark completion dates when items move to ✅ Resolved.
- Update effort estimates with actuals after completion.
