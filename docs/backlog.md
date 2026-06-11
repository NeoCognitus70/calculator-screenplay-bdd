<!--
  AUDIENCE: Engineers, AI agents, and project leads maintaining work-in-progress tracking.
  PURPOSE:  Single source of truth for outstanding work, risks, and planning for this project.
  LOCATION: docs/backlog.md
  TEMPLATE: test-automation-portfolio/templates/backlog.template.md
-->

# Calculator Screenplay BDD — Backlog

**Version:** 1 — initial backlog, created when the project was onboarded to the portfolio prompt conventions
**Last Updated:** 2026-06-11
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

#### Risk #1: Hard dependency on a sibling checkout of `hand-baked-screenplay-pattern` — Score: 10

**Priority Score:** Security Impact (0) + Breakage Probability (6) + Maintenance Burden (4) = **10 points**
**Impact:** A fresh clone cannot build or test without `../hand-baked-screenplay-pattern` checked out beside it.
**Effort:** 2–6 hrs depending on chosen strategy
**Status:** READY TO START
**Affected Stacks:** build (`prepare:screenplay` in `package.json`), CI, local onboarding

**Problem:**
`package.json`'s `prepare:screenplay` script runs `npm --prefix ../hand-baked-screenplay-pattern
install && ... run build`, binding this repo to an unversioned, sibling-path checkout of the
Screenplay library. The dependency is invisible to `npm install`, unpinned (whatever the sibling's
working tree holds), and breaks any environment that clones this repo alone.

**Impact Analysis:**
- **Security (0/10):** none.
- **Breakage (6/10):** fresh clones and single-repo CI runners fail at build time; the failure
  mode (missing sibling path) is confusing for newcomers.
- **Maintenance (4/10):** changes in the sibling library can break this repo silently; there is
  no version pin to bisect against.

**Refactor Strategy:**
Choose and document one of: (a) consume the library as a pinned git dependency or published
package; (b) vendor a built copy; (c) keep the sibling-path convention but document it prominently
in the README and add a preflight check with a clear error message. Record the choice as an ADR.

**Success Criteria:**
- [ ] A documented, reproducible path from `git clone` of this repo alone to a green `npm run verify`
- [ ] The dependency on the Screenplay library is pinned or explicitly documented with a preflight check
- [ ] Decision recorded (ADR or README section)

---

### Resolved Risks

None yet. Resolved risks are kept here as a record that the gap existed — do not delete them.

---

## Risk Summary

| Priority | Count | Total Effort | Status Distribution |
|---|---|---|---|
| HIGH (20–30) | 0 | — | — |
| MEDIUM (10–19) | 1 | 2–6 hrs | 1 READY TO START |
| LOW (0–9) | 0 | — | — |
| **Total Outstanding** | **1** | **2–6 hrs** | |
| Resolved | 0 | — | |

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
