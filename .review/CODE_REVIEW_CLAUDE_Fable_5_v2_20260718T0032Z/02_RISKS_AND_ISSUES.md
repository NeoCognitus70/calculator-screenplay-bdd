# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md)

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-18T00:32Z

Findings are numbered high-to-low priority. There are **no High findings and no correctness
defects**: the suite, the application, CI, and the dependency tree all validated green (see
[ANNEX/METRICS.md](ANNEX/METRICS.md)). Everything below is documentation currency or process
paper-trail, most of it exposed by the repository's recent change to public visibility.

Severity legend: High = correctness/reliability defect; Medium = notable risk or maintainability
debt; Low = refinement; Info = observation, no action required.

Validation constraint: per the registry coupling note, the cross-tree `prepare:screenplay` gate
(which installs and builds **inside** the sibling `hand-baked-screenplay-pattern` working tree)
was **not run**; the sibling was confirmed present and built by read-only inspection instead, and
its build scripts were reviewed as static source only. The in-repo `npm run verify` gate and
`npm audit` were run in full.

---

## Risk 1 [Medium]: The public README tells visitors the repository is private

**Description.** The repository is **public**: the GitHub API reports
`"private": false, "visibility": "public"`, licence detection returns `Apache-2.0`, and an active
branch ruleset (`main: PR + verify (Node 20)`) protects `main`. Yet the README's
"Public-readiness status" section still says, in the present tense, that the repository "remains
private" and that publication is a pending future action. Anyone reading the repo on github.com
is reading a landing page that denies its own observable state.

The project's own publication runbook anticipated this step:
[docs/audits/2026-07-14_public-readiness.md](../../docs/audits/2026-07-14_public-readiness.md)
(line 88), step 7 - "update the public landing card/source links and close Calculator's half of
P-07". The safeguard steps (ruleset, licence detection) are observably done; the landing-page
step is the one with no in-repo trace. The backlog (v9, last updated 2026-07-17 - after the
visibility change window) likewise never records that publication happened.

**Evidence.**
- [README.md](../../README.md) (lines 79-84): "This repository remains private. ... Publication
  is a separate, explicit action ...".
- GitHub API (2026-07-18): `gh api repos/NeoCognitus70/calculator-screenplay-bdd` returns
  `{"private": false, "visibility": "public", "license": "Apache-2.0"}`; the rulesets endpoint
  returns one active branch ruleset named `main: PR + verify (Node 20)`.
- [docs/audits/2026-07-14_public-readiness.md](../../docs/audits/2026-07-14_public-readiness.md)
  (lines 72-89): the publication runbook, including step 7.
- [docs/backlog.md](../../docs/backlog.md) (lines 10-16): v9 header, "Last Updated: 2026-07-17",
  no mention of the visibility change.

**Impact.** Medium, and reputational rather than operational. This is a portfolio repo whose
audience is reviewers and hiring managers; the first thing its README tells them about its
publication process is factually wrong, which undercuts the (genuinely strong) audit-driven
publication story the repo wants to tell. It also leaves the audit runbook formally uncloseable:
step 7 and the post-publication anonymous-bootstrap check (audit "mandatory post-change check",
line 44) have no recorded completion anywhere in the tree.

**Remediation.** Replace the README "Public-readiness status" section with a short post-publication
note: repository made public (with date), link to the audit as the evidence trail, and a line
confirming the runbook's post-change checks (anonymous clone + verify, ruleset, secret scanning)
were completed. Record the same closure - including the owner's historical-email decision the
audit gates on - in `docs/backlog.md` as a dated resolved entry, and cross-reference the
portfolio P-07 close-out. Roughly a 30-minute documentation change.

**Question for the maintainer (recorded, not blocking - review ran unattended):** were the
runbook's post-publication checks (audit lines 81-87: anonymous clone/bootstrap repeat, secret
scanning and push protection) actually performed at publication time? The ruleset is verifiable
from outside; the others are not, and the closure note should state them from knowledge, not
inference.

---

## Risk 2 [Low]: The audit's "request-size capping" refinement has no recorded disposition

**Description.** The public-readiness audit listed four optional engineering refinements in one
sentence: "CAL-06 (OpenAPI contract-drift guard), controller network-failure handling,
request-size capping, and scenario-memory cleanup". Three of the four became worklist items and
were delivered on PR #15 (CAL-06, CAL-11, CAL-12). The third item - capping the size of request
bodies read by `readJsonBody` - was neither implemented nor recorded as consciously declined,
yet backlog v9 states "No outstanding items remain" and "All prior recommendations ... are
delivered".

`readJsonBody` buffers the entire request body into memory with no length limit before parsing:

```typescript
// src/calculatorHttpServer.ts (lines 145-154)
async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  ...
}
```

**Evidence.**
- [docs/audits/2026-07-14_public-readiness.md](../../docs/audits/2026-07-14_public-readiness.md)
  (lines 69-70): the four-item optional-refinement list.
- [docs/backlog.md](../../docs/backlog.md) (lines 40-55): the close-out entry names CAL-06,
  CAL-11, CAL-12 only; (lines 191-192): "No open next steps remain."
- [src/calculatorHttpServer.ts](../../src/calculatorHttpServer.ts) (lines 145-154): unbounded
  body read.

**Impact.** Low. The exposure is theoretical for a teaching SUT that binds to `127.0.0.1` by
default ([src/environment.ts](../../src/environment.ts) line 18) and is only started by
Playwright's webServer hook or a local `npm run dev`. The real cost is to the backlog's
source-of-truth guarantee: an item from the project's own audit silently fell out of the
paper trail, which is precisely the drift the backlog discipline exists to prevent - and the
portfolio's recurring cross-project theme.

**Remediation.** Either (a) implement a small cap (count bytes in the read loop; on exceeding,
say, 10 KiB, respond 413 with the standard error shape - one test, ~15 lines total), or
(b) add a dated backlog note recording request-size capping as consciously declined for a
loopback teaching SUT, with (a) as the revisit trigger if the server ever binds non-locally.
Option (b) is defensible; the point is that a disposition exists.

---

## Risk 3 [Low]: Structure documentation was not updated when CAL-11 added a browser test to `unit-and-api`

**Description.** `tests/uiController.spec.ts` (added by CAL-11, merged in PR #15) is a
browser-backed Playwright test - it uses the `page` fixture, routes and aborts a network call,
and drives the real UI. It matches `testMatch: /.*\.spec\.ts/` and therefore runs in the
`unit-and-api` project. Two documents that describe the `tests/` layout were not updated:

- the README labels `tests/*.spec.ts` as "Unit and REST integration tests";
- the structure note enumerates the plain spec files as "i.e. `tests/api.spec.ts` and
  `tests/domain.spec.ts`" and describes the `unit-and-api` project accordingly - despite its own
  opening rule: "Every structural claim below is taken from `playwright.config.ts` and
  `package.json` as of writing; if those files change, update this note."

A secondary consequence: the project named `unit-and-api` now silently runs a Chromium test
**without** the `devices['Desktop Chrome']` profile the `bdd` project pins
([playwright.config.ts](../../playwright.config.ts) lines 44-57), so the one UI-resilience test
runs on Playwright's default browser settings rather than the declared desktop profile. Behaviour
is currently identical in practice (both are headless Chromium), but the config no longer says
what the suite does.

**Evidence.**
- [tests/uiController.spec.ts](../../tests/uiController.spec.ts) (lines 12-30): `page` fixture,
  `page.route(...)` abort, full browser workflow.
- [README.md](../../README.md) (line 41): "`*.spec.ts`  Unit and REST integration tests."
- [docs/project-structure-and-test-architecture.md](../../docs/project-structure-and-test-architecture.md)
  (lines 9-10): the self-imposed update rule; (lines 49-51 and 66): the now-incomplete
  enumeration of spec files and the `unit-and-api` row.
- [playwright.config.ts](../../playwright.config.ts) (lines 44-57): device profile on `bdd` only.

**Impact.** Low. A learner following the structure note will mispredict what
`npm run test:unit` runs (it now launches a browser), and the doc's credibility rests on the
maintenance rule it visibly broke. No functional risk today.

**Remediation.** One short pass: update the README line and the structure note's `tests/` section
and project table to name `uiController.spec.ts` and describe it as a browser-backed controller
test; either add the Desktop Chrome profile to `unit-and-api` (harmless for the non-browser
specs, which ignore it) or add a comment stating the default-browser choice is deliberate.

---

## Risk 4 [Low]: `CHANGELOG.md` has accumulated three delivery waves under `[Unreleased]` with no version cut

**Description.** The changelog claims Keep-a-Changelog/SemVer discipline, but the only release
section is `[0.1.0] - 2026-06-11`. Everything since - the CAL-01..05 review refinements, the
P-04 licensing work, the P-07 public-readiness remediation, and the CAL-06/11/12 close-out - sits
in one ever-growing `[Unreleased]` block (roughly 90 lines spanning 2026-06-12 to 2026-07-17),
including changes that are plainly released in every meaningful sense (they are on public `main`,
green in CI, and announced in the backlog as delivered).

**Evidence.**
- [CHANGELOG.md](../../CHANGELOG.md) (lines 20-108): the `[Unreleased]` block; (line 112): the
  sole version section `[0.1.0] - 2026-06-11`.
- [package.json](../../package.json) (line 3): `"version": "0.1.0"` - unchanged through all of
  the above.

**Impact.** Low. For a now-public repo the changelog is part of the portfolio surface; a
14-month-looking wall of `[Unreleased]` (actually five weeks, but a reader cannot tell) makes
history illegible and quietly contradicts the SemVer claim. It also means `0.1.0` no longer
describes the artefact anyone would clone.

**Remediation.** Cut `0.2.0`: move the `[Unreleased]` content into a dated `[0.2.0]` section
(optionally grouped by the three waves), bump `package.json`, and tag the release - which would
also give ADR 0001's pin-to-tag revisit trigger a concrete tag to point at if it ever fires.

---

## Risk 5 [Info]: Backlog v9 header pins a superseded ref

**Description.** The backlog header says "Based on: `main` at `f52e72c` (branch
`worklist/cal-06-contract-drift-guard`, PR #15)" - but `f52e72c` was never `main`; it was the PR
branch head, and `main` is now the merge commit `4b3f223`. A pedantic reading of the header is
therefore false on both counts.

**Evidence.**
- [docs/backlog.md](../../docs/backlog.md) (lines 14-16).
- `git log --oneline -3`: `4b3f223` (merge of PR #15) -> `4b31dc1` -> `f52e72c`.

**Impact.** Info. Cosmetic; the content it summarises is accurate.

**Remediation.** Fold into the Risk 1 backlog edit: re-point the header at the current `main`
merge commit next time the file is touched. No standalone change needed.

---

## Risk 6 [Info]: The remembered-calculation oracle is derived through production code - currently sound, worth a guard comment

**Description.** The CAL-12 questions derive their expected values by passing the recalled
request through the **production** `calculate()`
([tests/calculatorQuestions.ts](../../tests/calculatorQuestions.ts) lines 66-81). In isolation
that would be a tautological oracle: a domain bug would corrupt expectation and observation
equally and the assertion could not fail. As implemented it is sound, because every Then step
pairs the derived assertion with an **independent literal** from the Gherkin text
([tests/calculatorSteps.ts](../../tests/calculatorSteps.ts) lines 60-67 and 104-112), so the
literal anchors correctness and the derived check proves the memory round trip. The soundness
therefore depends on an invariant the code does not state: *never remove the literal assertion*.

**Evidence.** As cited above; also [SCREENPLAY.md](../../SCREENPLAY.md) (lines 43-50), which
documents the round trip but not the pairing invariant.

**Impact.** Info. No action required; a future refactor that drops the literal expectation in
favour of "the question already checks it" would silently weaken the suite.

**Remediation (optional).** One sentence in `SCREENPLAY.md` or beside `TheRememberedCalculation`
noting that the derived oracle is only valid alongside the literal Gherkin expectation.

---

## Previous findings - verification of claimed closures

Backlog v9 claims every finding from both prior reviews is dispositioned. Spot-verified against
the current tree rather than taken on trust:

| Prior finding | Claimed disposition | Verified in this review |
|---|---|---|
| v1 Risk 1/3 - audit debt (playwright-bdd v8, unused tsx) | Fixed (v9 bump, tsx removed) | `npm audit` = 0; [package.json](../../package.json) lines 26-31 show `playwright-bdd ^9.2.0`, no `tsx` |
| v1 Risk 2 - no licence | Apache-2.0 added (P-04) | `LICENSE` present; `"license": "Apache-2.0"`; GitHub detects `Apache-2.0` |
| v1 Risk 4 - stale backlog on `main` | v7..v9 merged | backlog v9 on `main`, dated 2026-07-17 |
| v1 Risk 5 - undocumented Node floor | `engines` + README | [package.json](../../package.json) lines 8-10; [README.md](../../README.md) line 48 |
| v1 Risk 6 / CAL-11 - non-total `data-state` | try/catch + spec | [src/uiController.ts](../../src/uiController.ts) lines 42-61; [tests/uiController.spec.ts](../../tests/uiController.spec.ts); test 14 passed |
| v1 Risk 8 / CAL-12 - write-only Remember | Recall round trip | [tests/calculatorQuestions.ts](../../tests/calculatorQuestions.ts) lines 59-82; wired in both Then steps |
| v1 Risk 9 - CI diagnostics/action majors | v7 actions, failure artefacts | [.github/workflows/ci.yml](../../.github/workflows/ci.yml) lines 41-83 |
| CAL-06 - contract-drift guard | New API test | [tests/api.spec.ts](../../tests/api.spec.ts) lines 102-129; test 7 passed |
| CAL-04 - CI sibling pin | Deferred, ADR-logged | [docs/adr/0001-...md](../../docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md) lines 63-71 |

All checked closures hold. The single loose end found is the request-size item (Risk 2), which
came from the audit's optional list rather than a numbered review risk - consistent with how it
escaped the worklist.

---

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md)
