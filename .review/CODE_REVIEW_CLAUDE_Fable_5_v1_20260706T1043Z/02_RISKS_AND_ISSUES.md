# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1043Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md)

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-06T10:43Z

Findings are numbered high-to-low priority. None is a correctness defect in the test suite or the
application under normal use; the highest items are dependency hygiene and legal/documentation
gaps. Severity legend: High = correctness/reliability defect; Medium = notable risk or
maintainability debt; Low = refinement; Info = observation, no action required.

Validation constraint: this review ran **no build, typecheck, or test** because the `verify` gate
builds inside the sibling `hand-baked-screenplay-pattern` working tree, which was under concurrent
review by another agent. The only toolchain command executed was `npm audit` (registry advisory
lookup against `package-lock.json`; no compilation, no sibling access).

---

## Risk 1 [Medium]: `npm audit` reports 6 vulnerabilities (5 moderate, 1 low), all in dev-dependency chains

**Description.** An `npm audit` against the committed lockfile reports two advisory chains, both
confined to `devDependencies` (the shipped application has **zero** runtime dependencies):

- **Moderate x5:** `uuid < 11.1.1` - "Missing buffer bounds check in v3/v5/v6 when buf is
  provided" ([GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq)) - reached
  through `playwright-bdd 8.5.1 -> @cucumber/gherkin / @cucumber/gherkin-utils ->
  @cucumber/messages -> uuid`. npm's proposed fix is `playwright-bdd@9.2.0`, a **major** bump.
- **Low x1:** `esbuild 0.27.3 - 0.28.0` - "arbitrary file read when running the development
  server on Windows" ([GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr)) -
  reached only through `tsx`, which nothing in this repository invokes (see Risk 3).

**Evidence.**
- [package.json](../../package.json) (line 25): `"playwright-bdd": "^8.0.0"` (lockfile resolves
  8.5.1); (line 26): `"tsx": "^4.20.0"`.
- Full `npm audit` output captured in [ANNEX/METRICS.md](ANNEX/METRICS.md).
- Runtime dependency surface: [package.json](../../package.json) (lines 19-21) - only the
  `file:../` Screenplay library, itself dependency-free.

**Impact.** Medium. No production exposure (dev/test toolchain only, and the vulnerable code
paths - uuid buffer writes in Gherkin message IDs, esbuild's dev server - are unlikely to be
exercised meaningfully here). The real costs are portfolio-credibility ones: a public repo whose
default branch audits dirty invites Dependabot noise and undermines the security-hygiene story the
portfolio otherwise tells (the sibling library cleared its equivalent audit debt with a major
vitest bump in June 2026).

**Remediation.** Bump `playwright-bdd` to `^9.2.0` (major; review its v9 changelog - the
`defineBddConfig`/`createBdd` API used in [playwright.config.ts](../../playwright.config.ts)
lines 15-19 and [tests/calculatorSteps.ts](../../tests/calculatorSteps.ts) line 26 is the core
API and is expected to survive, but verify against the migration notes), delete the unused `tsx`
(clears the esbuild advisory outright), refresh the lockfile, and run the full `verify` gate once
the sibling tree is free. Target: `npm audit` reporting 0 vulnerabilities.

**Question for the maintainer (recorded, not blocking - review ran unattended):** accept the
playwright-bdd v8 -> v9 major bump now, or defer until the next feature touch? The recommendation
is to accept now while the suite is small and green.

---

## Risk 2 [Medium]: The repository declares no licence at all

**Description.** `package.json` carries no `license` field and the repository contains no
`LICENSE`/`LICENCE` file. The repo is public (`github.com/NeoCognitus70/calculator-screenplay-bdd`)
and the README's quick-start explicitly invites cloning it. Under copyright default rules, no
licence means **all rights reserved**: the learners and hiring managers the project is written for
have no legal right to reuse, adapt, or even retain the code the docs encourage them to copy.

**Evidence.**
- [package.json](../../package.json) (lines 1-29): no `license` key (checked programmatically:
  `require('./package.json').license === undefined`).
- Repository root listing: no licence file present (`rg --files` output; root contains only
  `CHANGELOG.md`, `README.md`, `SCREENPLAY.md` as top-level docs).
- [README.md](../../README.md) (lines 53-56): instructs readers to `git clone` both repositories.

**Impact.** Medium for a portfolio/teaching repo (the entire point is reuse); nil operationally.
It also produces an npm warning ("no license field") on some operations, a small polish blemish.

**Remediation.** Choose a permissive licence (MIT is the conventional fit for teaching code), add
a `LICENSE` file, set `"license": "MIT"` in `package.json`, and mirror the same choice in the
sibling `hand-baked-screenplay-pattern` repo (the pair is co-developed and cloned together, so a
licence on one and not the other still blocks reuse). Record the decision in the CHANGELOG.

**Question for the maintainer (recorded, not blocking):** which licence? MIT recommended; this
is a decision only the copyright holder can make, so no file was added by this review.

---

## Risk 3 [Low]: `tsx` is declared but never used, and it is what drags in the esbuild advisory

**Description.** `tsx` appears in `devDependencies`, but no npm script, config, source file, or
doc references it: builds use `tsc` directly, tests run through the Playwright CLI, and `bddgen`
runs playwright-bdd's own CLI. A workspace-wide search finds exactly one hit - the
`package.json` declaration itself. Its transitive `esbuild` is the sole source of the audit's
low-severity advisory.

**Evidence.**
- [package.json](../../package.json) (line 26): `"tsx": "^4.20.0"`.
- [package.json](../../package.json) (lines 8-17): every script invokes `node`, `tsc`,
  `playwright-bdd`'s CLI, or `@playwright/test`'s CLI - none uses `tsx`.
- Search evidence: `rg tsx` (excluding the lockfile) matches only the declaration line.

**Impact.** Low. Pure YAGNI weight: an unused toolchain dependency inflates install time and the
audit surface for zero benefit, in a repo that otherwise makes a point of having no unnecessary
dependencies (the server deliberately uses only `node:http`).

**Remediation.** Remove `tsx` from `devDependencies` and refresh the lockfile. This closes the
esbuild advisory without any version negotiation.

---

## Risk 4 [Low]: The backlog on `main` is stale - the v7 reconcile that records CAL-01..05 and the previous review sits unmerged on PR #11

**Description.** [docs/backlog.md](../../docs/backlog.md) declares itself the project's source of
truth, but the copy on `main` is **v6, last updated 2026-06-13**, and knows nothing about the
2026-06-16 code review or the CAL-01..05 refinement cycle merged into `main` between 2026-06-16
and 2026-06-17 (PRs #7-#10). The catch-up exists - branch `docs/backlog-reconcile-cal01-05`
carries a v7 backlog dated 2026-06-22 that folds all five findings in as resolved - but it has
been sitting on **open PR #11** since 2026-06-22, roughly two weeks at the time of this review.

**Evidence.**
- [docs/backlog.md](../../docs/backlog.md) (lines 10-12): `Version: 6`, `Last Updated: 2026-06-13`.
- [docs/backlog.md](../../docs/backlog.md) (line 152): the maintenance note "Cross-reference code
  review findings in `.review/` once a review exists" is unmet on `main` - a review has existed
  since 2026-06-16 (`.review/CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z/`).
- `git log main -- docs/backlog.md`: last change `a60b9ed` (2026-06-14).
- `gh pr list`: PR #11 "docs(backlog): reconcile with 2026-06-16 review + CAL-01..05 (v7)" OPEN
  since 2026-06-22; its backlog header correctly records `main` at `2a9fe0b`.
- Merged-but-unrecorded work: e.g. the CAL-05 tests in [tests/api.spec.ts](../../tests/api.spec.ts)
  (lines 74-99) and [tests/domain.spec.ts](../../tests/domain.spec.ts) (lines 53-87) are on `main`
  with no backlog trace in v6.

**Impact.** Low, because the fix is already written and correct - this is a process latency, not
a content error. But until PR #11 merges, anyone (or any agent) treating the default branch's
backlog as authoritative reconstructs a two-cycles-old picture of the project, and the portfolio's
own recurring-theme diagnosis ("documentation/metadata drift") repeats itself.

**Remediation.** Merge PR #11 (its content was spot-checked here and matches the repo state).
Then, when the backlog is next touched, record this review (v1 by CLAUDE_Fable_5) and the new
Risks 1-3 above as items. Housekeeping: the remote still carries the merged
`worklist/cal-05-edge-coverage` branch and the local clone several stale ones (`master`,
`docs/screenplay-flow`, `docs/backlog-reconcile-changelog`) - prune opportunistically.

---

## Risk 5 [Low]: Node floor drift - README says "Node.js 18 or newer", CI runs Node 20, the sibling requires Node 20, and no `engines` field exists

**Description.** The README's prerequisite is "Node.js 18 or newer". Node 18 reached end-of-life
in April 2025, the CI gate runs Node 20 exclusively, `@types/node` targets the 22 line, and the
co-developed sibling library set its floor to Node 20 (with an `engines` field) in its June 2026
review cycle. Because `prepare:screenplay` runs `npm install && npm run build` **inside the
sibling**, a learner on Node 18 following this README would be building a Node-20-floor package
on an EOL runtime that no CI configuration here ever exercises. `package.json` declares no
`engines` range, so nothing warns them.

**Evidence.**
- [README.md](../../README.md) (line 48): "Node.js 18 or newer."
- [.github/workflows/ci.yml](../../.github/workflows/ci.yml) (lines 52-57): `node-version: 20` -
  the only version CI tests.
- [package.json](../../package.json) (lines 1-29): no `engines` field; (line 24)
  `"@types/node": "^22.10.0"`.
- Sibling floor: `../hand-baked-screenplay-pattern/package.json` declares `"engines": { "node":
  ">=20" }` (inspected read-only in the sibling checkout; recorded as context, not reviewed here).

**Impact.** Low. Worst case is a confusing first-run failure or an untested-runtime green for a
learner on old Node; day-to-day contributors are unaffected. It is the same
documentation-vs-reality drift class the portfolio keeps finding.

**Remediation.** Update the README prerequisite to "Node.js 20 or newer" and add
`"engines": { "node": ">=20" }` to `package.json`, matching the sibling and CI. One line each.

---

## Risk 6 [Low]: The UI controller has no `fetch` failure handling, so a network error leaves the page stuck in `idle` and the promise rejected

**Description.** `submitCalculation` awaits `fetch` and `response.json()` with no `try/catch`.
The submit handler discards the promise (`void submitCalculation(...)`), so if the server is
unreachable (or returns a non-JSON body) the rejection is unhandled, no message is rendered, and
`#calculation-result` stays at `data-state="idle"`. The test suite's displayed-message question
waits precisely for a settled `success`/`error` state, so in that failure mode the question blocks
until the Playwright timeout with no diagnostic from the page itself.

**Evidence.**
- [src/uiController.ts](../../src/uiController.ts) (lines 18-21): `void submitCalculation(...)` in
  the submit listener.
- [src/uiController.ts](../../src/uiController.ts) (lines 29-53): `await fetch(...)` and
  `await response.json()` with no error handling on either.
- The dependent wait: [tests/calculatorQuestions.ts](../../tests/calculatorQuestions.ts)
  (lines 42-49) waits for `[data-state="success"], [data-state="error"]`.

**Impact.** Low in practice - Playwright's `webServer` guarantees the API is up before any test
runs, so the path is unreachable in the suite today. The cost is pedagogical: the controller
teaches the settled-state pattern but leaves its own unhappy path unsettled, and a learner
running the UI with the server stopped gets silent console noise instead of the on-page error the
design otherwise models.

**Remediation.** Wrap the body of `submitCalculation` in `try/catch` and route failures through
the existing `showError(...)` (e.g. "The calculator service could not be reached."). That keeps
the `data-state` contract total: every submission ends in `success` or `error`.

---

## Risk 7 [Info]: `readJsonBody` buffers request bodies without a size cap

**Description.** The HTTP adapter accumulates all request chunks into memory before parsing, with
no `content-length` check or cumulative cap. An arbitrarily large POST body is buffered in full.

**Evidence.**
- [src/calculatorHttpServer.ts](../../src/calculatorHttpServer.ts) (lines 145-154): the
  `for await` chunk loop and `Buffer.concat`.

**Impact.** Informational. This is a loopback teaching server started by Playwright and `npm run
dev`; it is not deployed and binds `127.0.0.1` by default
([src/environment.ts](../../src/environment.ts) line 18). Recorded because the adapter is
otherwise careful (static-asset allowlist at lines 166-168 prevents path traversal, so this is
the one unguarded input surface) and because teaching servers get copied.

**Remediation.** Optional: reject bodies over a small cap (e.g. 10 KB) with 413, or add a comment
stating the omission is deliberate for the teaching context.

---

## Risk 8 [Info]: `Remember.that('lastCalculationRequest', ...)` is write-only

**Description.** Both `Calculate` tasks remember the request under `lastCalculationRequest`, and
`SCREENPLAY.md` says this "demonstrate[s] scenario memory", but nothing ever reads the note back -
no question, task, or step recalls it.

**Evidence.**
- [tests/calculatorTasks.ts](../../tests/calculatorTasks.ts) (lines 28, 40): the two
  `Remember.that(...)` calls.
- [SCREENPLAY.md](../../SCREENPLAY.md) (lines 44-45): the stated demonstration purpose.
- Workspace search: no `Recall`/read of `lastCalculationRequest` anywhere in `tests/`.

**Impact.** Informational. Harmless at runtime; slightly undercuts the lesson, since scenario
memory is only demonstrated when something is recalled. A reader may wonder whether code is
missing.

**Remediation.** Optional: either recall the remembered request in a question (e.g. derive the
expected expression string from it instead of hard-coding it in the feature), or trim the
`Remember` calls and the SCREENPLAY.md claim (KISS). Either direction restores the
docs-match-code property.

---

## Risk 9 [Info]: CI publishes no artefacts on failure

**Description.** The workflow runs `npm run verify` but uploads nothing: on a red run there are no
Playwright HTML report, traces, or the always-on screenshots the project is otherwise proud of.
Diagnosis of a CI-only failure (like the historical fast-runner flake the backlog records as
Risk #3) falls back to the list reporter's stdout.

**Evidence.**
- [.github/workflows/ci.yml](../../.github/workflows/ci.yml) (lines 32-69): no
  `actions/upload-artifact` step.
- [playwright.config.ts](../../playwright.config.ts) (line 26): the HTML reporter is generated
  (`open: 'never'`) but discarded on the runner; (lines 31-32) screenshots and first-retry traces
  likewise.

**Impact.** Informational today (the suite is small and green). The cost appears exactly when it
matters most - an unreproducible CI-only failure.

**Remediation.** Add a conditional upload step (`if: failure()`) for `playwright-report/` and
`test-results/`, with a short retention. Three lines of YAML.

---

## Previous review findings (2026-06-16, CLAUDE_Opus_4_8 v1) - verified remediated

All five findings from the previous review were checked against `main` at `2a9fe0b`; each is
genuinely fixed in source, not just narrated:

- **Risk 1 (`fullyParallel` contradiction)** - now `fullyParallel: false` with an explanatory
  comment naming the shared `webServer` and the flip conditions
  ([playwright.config.ts](../../playwright.config.ts) lines 22-25). CAL-01.
- **Risk 2 (422 semantics invisible at BDD altitude)** - the rejection-contract convention is
  documented in the feature header, naming both the 422 and 400 paths and where each is covered
  ([features/calculator-api.feature](../../features/calculator-api.feature) lines 8-15). CAL-02.
- **Risk 3 (always-on screenshots easy to copy unthinkingly)** - the trade-off comment now sits
  on the setting itself ([playwright.config.ts](../../playwright.config.ts) lines 29-31). CAL-03.
- **Risk 4 (floating `ref: main` sibling checkout in CI)** - deferral reviewed and reaffirmed in
  a dated ADR review-log entry
  ([docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md](../../docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md)
  lines 63-71). CAL-04. This review concurs with the deferral: the ADR's external-consumers
  trigger remains the right gate.
- **Risk 5 (edge-coverage gaps)** - malformed-JSON 400 and unknown-route 404 tests exist
  ([tests/api.spec.ts](../../tests/api.spec.ts) lines 74-99), and three ISTQB boundary-value
  domain tests back the README claim ([tests/domain.spec.ts](../../tests/domain.spec.ts)
  lines 53-87). CAL-05. The one sub-item left uncovered from that finding is the
  `/uiController.js` static-asset branch
  ([src/calculatorHttpServer.ts](../../src/calculatorHttpServer.ts) lines 171-176) - exercised
  implicitly by every UI scenario's page load, so no action recommended.

The only gap in that cycle is bookkeeping, not engineering: the backlog reconcile recording it is
still unmerged (Risk 4 above).

---

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1043Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md)
