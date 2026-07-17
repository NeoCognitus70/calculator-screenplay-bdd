<!--
  AUDIENCE: Engineers, AI agents, and consumers tracking what changed between versions.
  PURPOSE:  Provide a human-readable history of all notable changes. Append only — never
            edit or delete past entries.
  LOCATION: CHANGELOG.md (repository root)
  TEMPLATE: test-automation-portfolio/templates/changelog.template.md
  FORMAT:   Based on https://keepachangelog.com/en/1.0.0/
            Versioning follows https://semver.org/spec/v2.0.0.html
-->

# Changelog

All notable changes to calculator-screenplay-bdd will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- Added a [publication-readiness audit](./docs/audits/2026-07-14_public-readiness.md) covering
  source and GitHub history, licences, generated and large artefacts, documentation/CI safety,
  dependency state, and clean bootstrap evidence. The repository remains private pending explicit
  owner approval.
- Added failure-only retention of Playwright reports, traces, and screenshots in CI.
- Added the canonical Apache License 2.0 terms, aligned package metadata, and a README boundary
  distinguishing this project from its separately licensed sibling Screenplay provider
  (portfolio P-04 / D-05).
- Added `scripts/preflight-screenplay.mjs`, run before `prepare:screenplay` and `verify`
  (`--built`), which fails fast with the exact clone remedy when the sibling
  `hand-baked-screenplay-pattern` checkout is missing or unbuilt.
- Added [ADR 0001](./docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md)
  recording the decision to keep the `file:../` sibling-checkout convention (with its
  revisit trigger), resolving backlog Risk #1.
- Added this `CHANGELOG.md`, scaffolded from the portfolio changelog template.
- Added a CI workflow (`.github/workflows/ci.yml`) running `npm run verify` on pull requests
  and pushes to `main` (Node 20, npm cache). Per [ADR 0001](./docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md)
  it checks out the now-public sibling `hand-baked-screenplay-pattern` (its `main`) side by
  side, so the `file:../` dependency and `prepare:screenplay` resolve as they do locally.
  Resolves backlog Risk #2.
- Added bottom-of-pyramid edge-coverage tests (review Risk 5 / CAL-05): `tests/api.spec.ts`
  now covers the malformed-JSON 400 path and an unknown-route 404; `tests/domain.spec.ts` adds
  ISTQB boundary-value cases (negative operands across zero, a large product, a finite but
  non-terminating division) backing the README's boundary-value claim. The BDD layer is
  unchanged.
- Added a contract-drift guard test (CAL-06): `tests/api.spec.ts` now asserts the operator
  `enum` published at `/openapi.json` (`src/openApiDocument.ts`) is set-equal to
  `calculatorOperators` (`src/calculatorContracts.ts`), so an operator added or removed in one
  place without the other fails the suite. Suite grew 16 → 17.

### Fixed

- Fixed the UI controller's `data-state` contract being non-total (CAL-11): `submitCalculation`
  in `src/uiController.ts` now wraps its `fetch`/`response.json()` call in `try/catch`, routing
  a network failure or unparseable response through the existing `showError(...)` path ("The
  calculator service could not be reached."). Every submission now settles to `success` or
  `error`; previously a failed fetch left an unhandled rejection and the element stuck at
  `data-state="idle"`. Verified by a new `tests/uiController.spec.ts` that aborts the
  `/api/calculations` route and asserts the settled error state. Suite grew 17 → 18.
- Fixed the write-only `Remember` loop (CAL-12): added `TheRememberedCalculation`
  (`tests/calculatorQuestions.ts`), which recalls `lastCalculationRequest` via `Recall.the(...)`
  and passes it through the same pure `calculate()` the server/UI use. The "the API result
  should be" and "the displayed result should be" Then steps now assert the recalled/derived
  value matches the observed outcome, so `Remember` is exercised, not just written.
  `SCREENPLAY.md`'s scenario-memory claim is now true. No reduction in scenario coverage;
  suite count unchanged (18).
- Fixed `prepare:screenplay` mutating the sibling repository. `npm --prefix ../hand-baked-screenplay-pattern install`
  resolved this project's `file:../` reference from the *consumer's* directory and injected a
  circular `"calculator-screenplay-bdd": "file:../calculator-screenplay-bdd"` dependency into the
  sibling's `package.json`/`package-lock.json` on every run. The script now `cd`s into the sibling
  before `npm install && npm run build`, leaving the sibling's tree clean.
- Fixed a flaky displayed-message question: `TheDisplayedCalculation.message()` read
  `#calculation-result` with a one-shot `textContent()` that raced the UI controller's async
  render and read the idle prompt on fast CI runners. It now waits for the controller's settled
  `data-state` (`success`/`error`) before reading.

### Changed

- Updated the CI actions to their current v7 majors and disabled persisted checkout credentials.
- Raised the documented and machine-readable Node.js floor to 20, matching the sibling project and
  CI, and made `npm ci` the reproducible Calculator install command.
- Made `prepare:screenplay` use `npm ci` so preparing a clean sibling checkout does not rewrite its
  tracked lockfile.
- Upgraded `playwright-bdd` from v8 to v9 and removed unused `tsx`, clearing six dev-only dependency
  advisories without changing the application dependency surface.
- Changed the README prerequisites from "the sibling project must be present" to an explicit
  clone-both-repositories-side-by-side quick-start linking ADR 0001.
- Set `fullyParallel: false` in `playwright.config.ts` to match reality: there is a single
  shared `webServer` with no per-test data isolation, and every test script already pins
  `--workers=1`. The config previously advertised `fullyParallel: true`, an isolation guarantee
  the scripts silently overrode. A comment records what must change (per-test state isolation or
  a server-per-worker) before parallelism is safe.
- Documented the REST rejection-contract convention in the `features/calculator-api.feature`
  header: "reject the calculation with ..." denotes a well-formed but unsupported request (HTTP
  422), distinct from a malformed request (HTTP 400) covered at the API-integration layer. This
  surfaces the 400-vs-422 distinction at the business-readable BDD layer, which previously only
  lived in the Screenplay task `Calculate.shouldHaveBeenRejectedAsUnsupported()`.
- Moved the `screenshot: 'on'` trade-off next to the setting in `playwright.config.ts`: an
  inline comment now points at the README "Screenshots" guidance to switch to
  `only-on-failure` for larger suites. The config is the most-copied file, so the caveat
  travels with it.
- Recorded a dated review-log entry in [ADR 0001](./docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md):
  the CI sibling checkout's floating `ref: main` was reviewed 2026-06-17 (review Risk 4 / CAL-04)
  and deferral reaffirmed — no CI pin added; the pin-to-tag remedy stays gated on the ADR's
  external-consumers trigger.

---

## [0.1.0] — 2026-06-11

The initial release: a pedagogical calculator application and a test suite that climbs the
test pyramid from unit checks to Screenplay-backed Gherkin scenarios.

### Added

- **Application**: a pure calculator domain (`src/calculatorDomain.ts`), a dependency-free
  Node HTTP server with static asset serving (`src/calculatorHttpServer.ts`), a hand-written
  OpenAPI document served at `/openapi.json`, and a static browser UI (`public/`).
- **Test suite**: Playwright `unit-and-api` project (domain and REST integration specs under
  `tests/`) and a `bdd` project generating specs from Gherkin (`features/`) via playwright-bdd,
  with Screenplay tasks, interactions, questions, and abilities consuming the sibling
  `hand-baked-screenplay-pattern` library (`file:../`).
- **Screenplay guide**: `SCREENPLAY.md` mapping the core primitives to the calculator examples,
  plus always-on screenshots as teaching evidence in browser-backed tests.
- **Documentation**: `docs/screenplay-flow-through-the-sut.md`, a pedagogical walkthrough of the
  Screenplay flow through the system under test (PR #1).
- **Process**: `docs/backlog.md` as the project's source of truth for outstanding work, added
  when the project was onboarded to the portfolio prompt conventions (PR #2).
