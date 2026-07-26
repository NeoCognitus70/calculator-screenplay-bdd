# Project Review: Calculator Screenplay BDD

[<- Back to Index](../00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Next: Cross-Cutting Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)

Reviewer: AI assistant (Codex GPT-5)

## Project Intent and Stack

The repository teaches layered test automation around a small calculator SUT:

- TypeScript 5.x on Node 20+.
- Playwright Test for pure-domain, HTTP integration, browser-controller, and generated BDD tests.
- `playwright-bdd` for Gherkin-to-Playwright generation.
- A sibling `hand-baked-screenplay-pattern` package for Actor, Ability, Task, Interaction,
  Question, memory, HTTP, and assertion primitives.
- A dependency-free Node HTTP server, static browser UI, REST endpoint, and hand-written OpenAPI
  3.1 document.

## Review Summary

- **Architecture:** The pure domain, transport contract, HTTP adapter, UI adapter, startup, and
  tests are separated clearly. Dependency direction supports SRP and DIP without framework-heavy
  abstraction.
- **Screenplay fidelity:** Tasks describe calculator goals, interactions contain browser mechanics,
  questions observe API/UI state, abilities wrap Playwright, and steps remain thin. This is a
  faithful and teachable implementation.
- **Specifications:** Four small scenarios express success and division-by-zero behaviour through
  API and UI boundaries. No selector or HTTP-client detail leaks into Gherkin.
- **Coverage approach:** Fifteen plain specs plus four scenarios form a sensible pyramid. Domain and
  API cases carry most combinatorial detail; browser BDD stays focused.
- **Reliability:** The suite uses isolated Playwright fixtures, a stateless SUT, an empty data store
  per actor, settled-state waiting, and forced serial execution. No external data or authentication
  dependency exists.
- **CI and security:** CI reproduces the side-by-side clone, uses least-privilege repository
  permissions, caches npm data, installs Chromium only, runs verify, and retains failure evidence.
  Current remote checks and security settings are healthy.
- **Documentation:** README, Screenplay guide, architecture guide, ADR, changelog, implementation
  log, audit, and backlog are rich for the repository size. Release version metadata and the
  backlog's zero-risk claim need reconciliation.

## Executable Specifications

### Strengths

- [calculator-api.feature](../../../features/calculator-api.feature) (lines 16-28) distinguishes an
  accepted calculation from a well-formed but unsupported one.
- [calculator-ui.feature](../../../features/calculator-ui.feature) (lines 6-16) uses user-visible
  language and keeps browser coverage intentionally small.
- [calculatorSteps.ts](../../../tests/calculatorSteps.ts) (lines 36-121) translates values and delegates
  work to tasks/questions instead of embedding selectors or request parsing.
- Regexes support negative and decimal examples while constraining operator phrases.
- No skipped, quarantined, focused, or WIP scenario was found.

### Gaps

- Missing/blank operand behaviour is not represented at the controller or BDD layer, allowing Risk
  2 to remain green.
- The BDD API layer intentionally omits malformed-request cases, which are well covered at the API
  layer and therefore not a pyramid defect.
- The current four scenarios are examples rather than broad combinatorial coverage, appropriately
  backed by lower layers.

## Source Layers

### Domain and Contracts

- [calculatorDomain.ts](../../../src/calculatorDomain.ts) is pure, deterministic, and exhaustive over
  the `CalculatorOperator` union.
- Validation accumulates field errors and differentiates malformed input from unsupported
  division by zero.
- [calculatorContracts.ts](../../../src/calculatorContracts.ts) provides a small typed transport
  vocabulary shared by server, UI, and tests.
- Finite-number checks protect the domain from `NaN` and infinities that TypeScript types cannot
  exclude at runtime.

### HTTP and OpenAPI

- The HTTP adapter maps domain failures into coherent status codes and one error shape.
- The 10 KiB streaming cap is a sound defence against unbounded buffering.
- The OpenAPI operator enum has a targeted drift guard.
- Release-version drift and absent media-type enforcement weaken the otherwise clear contract.
- Static file serving is deliberately simple and constrained to four explicit paths.

### Browser Controller

- The controller centralises request reading, service calls, and output state.
- Fetch and JSON parsing failures settle the output into an error state.
- Accessible labels, role-based test locators, and `aria-live` support usable automation.
- Blank-string conversion is the principal user-visible correctness defect.
- Reset and overlapping submissions are not tested; these are future growth considerations rather
  than current backlog blockers.

## Runtime Lifecycle, Isolation, Waits, and Stability

- Playwright owns the web-server process and waits on `/health`.
- Local runs may reuse an existing server; CI forces a fresh process.
- Every script pins one worker and the config states `fullyParallel: false`, matching the shared
  process model.
- The SUT has no mutable business state, database, queue, or cache, so cross-test data leakage is
  minimal.
- Each Gherkin action creates a new Stage and an empty memory store.
- `TheDisplayedCalculation.message()` waits for success/error state before reading text, removing a
  previously documented race.
- `listen()` needs an error-rejection path to complete the lifecycle abstraction.

## Data Setup, API, Token, and Authentication Assumptions

- Test data is inline and deterministic; no seed script or cleanup transaction is required.
- API tests use Playwright's request context against the local SUT.
- Browser tests use a fresh page fixture and semantic locators.
- No authentication, token, secret, external endpoint, or personal data is required.
- The only environmental inputs are host, port, and the sibling checkout/build.
- The sibling checkout is an intentionally floating code dependency, not runtime test data.

## CI Assessment

- **Workflow correctness:** Pull requests to and pushes on `main` run the same root verify gate.
- **Coupling:** The workflow checks out the provider beside the consumer and then builds it,
  matching ADR 0001.
- **Caching and image strategy:** setup-node caches from the consumer lockfile; only Chromium is
  installed. `ubuntu-latest` and floating provider `main` retain accepted variability.
- **Secrets:** `contents: read`, no workflow secret references, and checkout credentials are not
  persisted.
- **Artefacts:** HTML report and test results are retained for seven days only after failure.
- **Reproducibility:** Node 20 is fixed, dependencies use `npm ci`, but the sibling branch remains
  deliberately unpinned.
- **Remote evidence:** latest fetched main run at `5fd5460` passed; an active ruleset requires PR
  plus verify.

## Dependency, Security, and Licence Pass

- `npm audit --json` reported zero vulnerabilities across 45 total dependency entries.
- `npm outdated --json` reported only major-line differences for `@types/node` and TypeScript;
  installed versions meet the current ranges. No update is recommended solely for novelty.
- The package lock records 7 Apache-2.0, 36 MIT, and 1 BSD-3-Clause package entries, with none
  missing a licence field in the aggregation.
- The root [LICENSE](../../../LICENSE) and [package.json](../../../package.json) (line 5) declare
  Apache-2.0. The README describes the independent sibling licence boundary.
- A tracked-file secret-pattern scan found no candidate files. GitHub reports zero open Dependabot
  and secret-scanning alerts.
- No unsafe shell interpolation or user-controlled command execution surface was found.
- The lockfile is resolution-current enough for a clean audit but metadata-stale at version 0.1.0.

## Deferred and Planned Coverage

- No runtime quarantine, skipped test, focused test, or WIP tag exists.
- ADR 0001 explicitly accepts a floating provider `main` reference until external consumers appear.
  That is an accepted architecture trade-off, not hidden unfinished work.
- The backlog records `/uiController.js` static-asset failure coverage as a historical optional
  branch not taken. It is not promoted as outstanding work.
- The backlog claims every CAL and TRIAGE item is delivered. The new findings should be triaged
  before retaining the zero-outstanding status.

## Documentation Alignment

- README structure and test topology match the source.
- The architecture guide correctly describes the browser-backed spec inside `unit-and-api`.
- The changelog records the 0.2.0 release, but lockfile and OpenAPI metadata do not.
- Handover v3 is structurally paired but stale: it still describes PR #21 as open, while fetched
  `main` contains the merge at `5fd5460`.
- The backlog baseline at `b4c891a` is expected history, but its zero-risk conclusion is no longer
  complete after this review.

---

[<- Previous: Risks and Issues](../02_RISKS_AND_ISSUES.md) | [Back to Index](../00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Next: Cross-Cutting Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)
