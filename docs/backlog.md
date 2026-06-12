<!--
  AUDIENCE: Engineers, AI agents, and project leads maintaining work-in-progress tracking.
  PURPOSE:  Single source of truth for outstanding work, risks, and planning for this project.
  LOCATION: docs/backlog.md
  TEMPLATE: test-automation-portfolio/templates/backlog.template.md
-->

# Calculator Screenplay BDD — Backlog

**Version:** 3 — recorded Risk #2 (no CI gate), found during worklist derivation; BLOCKED on a credential decision
**Last Updated:** 2026-06-12
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

### MEDIUM Priority (Score: 10–19)

#### Risk #2: No CI gate — `npm run verify` never runs on PRs or pushes to `main` — Score: 10

**Priority Score:** Security Impact (0) + Breakage Probability (6) + Maintenance Burden (4) = **10 points**
**Impact:** Regressions can merge unchecked; the sibling `hand-baked-screenplay-pattern` project gates every PR with verify, this project gates nothing.
**Effort:** 1–2 hrs once unblocked
**Status:** BLOCKED — needs a user credential/visibility decision (see below)
**Affected Stacks:** CI (`.github/workflows/`), build

**Problem:**
There is no `.github/workflows/` directory. A CI workflow must run `npm run verify` (Node 20,
npm cache) and, per [ADR 0001](./adr/0001-consume-screenplay-library-via-sibling-checkout.md),
check out `NeoCognitus70/hand-baked-screenplay-pattern` side by side with this repository so the
`file:../` dependency and `prepare:screenplay` resolve exactly as they do locally.

**Blocker (2026-06-12):** `hand-baked-screenplay-pattern` is **private**, and `actions/checkout`
cannot read a second private repository with the default `GITHUB_TOKEN`. No PAT secret exists on
this repository (`gh secret list` is empty). To unblock, the user must either:
- (a) create a fine-grained PAT with read-only Contents access to
  `hand-baked-screenplay-pattern` and store it as a repo secret (e.g. `SCREENPLAY_REPO_TOKEN`)
  on this repository, for the workflow to pass to `actions/checkout`; or
- (b) make `hand-baked-screenplay-pattern` public.

**Success Criteria:**
- [ ] `.github/workflows/` workflow runs `npm run verify` on PRs and pushes to `main` (Node 20, npm cache)
- [ ] The workflow checks out the sibling library (its `main`) side by side, so `file:../` resolves as locally
- [ ] A green run on the PR introducing it, cited by run id

---

### Resolved Risks

Resolved risks are kept here as a record that the gap existed — do not delete them.

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
| MEDIUM (10–19) | 1 | 1–2 hrs | 1 BLOCKED |
| LOW (0–9) | 0 | — | — |
| **Total Outstanding** | **1** | **1–2 hrs** | |
| Resolved | 1 | ~1 hr completed | |

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
