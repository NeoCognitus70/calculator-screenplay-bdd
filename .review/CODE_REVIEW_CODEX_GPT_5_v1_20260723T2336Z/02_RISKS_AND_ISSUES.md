# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Next: Project Review ->](03_PROJECT_REVIEWS/PROJECT_001_CALCULATOR_SCREENPLAY_BDD.md)

Reviewer: AI assistant (Codex GPT-5)

## Severity Legend

- **HIGH:** likely security, data-loss, or core-suite failure requiring immediate action.
- **MEDIUM:** user-visible correctness, release-integrity, or repeatability gap that should be
  scheduled next.
- **LOW:** bounded robustness, contract, or maintainability gap.
- **INFO:** improvement or accepted condition with no present correctness failure.

No HIGH findings were identified.

## Risk 1 - Release and API Version Metadata Disagree

**Severity:** MEDIUM

### Risk Description

The repository presents the current release as 0.2.0, but the package lock's two root version
fields and the served OpenAPI document remain 0.1.0. The backlog says the 0.2.0 version bump is
complete and that no outstanding work remains, so the source-of-truth record also misses the drift.

### Evidence Outline

- [package.json](../../package.json) (line 3) declares `"version": "0.2.0"`.
- [package-lock.json](../../package-lock.json) (lines 2-9) declares `0.1.0` both at the lockfile
  top level and in `packages[""]`.
- [openApiDocument.ts](../../src/openApiDocument.ts) (lines 10-15) publishes
  `info.version: '0.1.0'`.
- [CHANGELOG.md](../../CHANGELOG.md) (line 22) declares release 0.2.0.
- [backlog.md](../../docs/backlog.md) (lines 10-12, 45-54) records the 0.2.0 cut as delivered and
  says no items remain.
- A read-only Node probe returned package `0.2.0`, lock top `0.1.0`, and lock root `0.1.0`.

### Impact Analysis

- Package tooling and generated metadata can report a different version depending on whether it
  reads the manifest or lockfile.
- The public OpenAPI contract identifies an older release, weakening the repository's REST/OpenAPI
  teaching claim.
- The backlog and changelog overstate release reconciliation, reducing portfolio credibility.
- Future reviews cannot tell whether the API version is intentionally independent or simply stale.

### Refactor Recommendation and Strategy

1. Decide and document whether OpenAPI versioning follows the package or an independent API
   contract.
2. Refresh both package-lock root version fields without changing dependency resolution.
3. Align `openApiDocument.info.version` with the selected policy.
4. Add a small static check comparing `package.json`, `package-lock.json`, and the OpenAPI version
   when they are intended to move together.
5. Reconcile the backlog and changelog after the fix.

## Risk 2 - Blank Browser Operands Are Silently Calculated as Zero

**Severity:** MEDIUM

### Risk Description

The form marks both operands required but disables browser validation. The controller passes an
empty string to `Number`, which converts it to zero. Clearing either field and submitting can
therefore produce a calculation with zero rather than the controller's "Enter finite numbers"
error.

### Evidence Outline

- [index.html](../../public/index.html) (line 24) uses `novalidate`.
- [index.html](../../public/index.html) (lines 26 and 37) marks both numeric operands `required`.
- [uiController.ts](../../src/uiController.ts) (lines 29-35) intends to reject an invalid request.
- [uiController.ts](../../src/uiController.ts) (lines 84-90) applies `Number(value)` without first
  rejecting an empty string.
- [uiController.spec.ts](../../tests/uiController.spec.ts) (lines 12-29) covers only a failed
  network request.
- [calculator-ui.feature](../../features/calculator-ui.feature) (lines 8-16) covers success and
  division by zero, not missing operands.
- A read-only Node probe confirmed `Number('') === 0`.

### Impact Analysis

- A required user input is interpreted as a valid domain value, producing the wrong user-visible
  behaviour.
- The UI, domain validator, HTML constraints, and error message no longer express one contract.
- The test suite can remain green because no browser-level invalid-input example exercises the
  conversion boundary.
- Learners may copy an unsafe form-parsing idiom into larger projects.

### Refactor Recommendation and Strategy

1. Reject `value.trim() === ''` before numeric conversion, or remove `novalidate` and deliberately
   use `form.checkValidity()` with accessible feedback.
2. Keep the domain's finite-number validation as defence in depth.
3. Add a focused controller/browser test that clears each operand and asserts an error state.
4. Use a compact decision table covering blank, non-finite/unparseable, zero, negative, and valid
   decimal values.
5. Add a Gherkin example only if missing operands are a stakeholder-facing rule; otherwise keep the
   coverage at the controller layer.

## Risk 3 - Port Validation Accepts Malformed Values

**Severity:** LOW

### Risk Description

Both application and test-runner configuration use `Number.parseInt`, which accepts a valid numeric
prefix and discards the remainder. Values such as `3100abc` and `1.5` are accepted as 3100 and 1,
despite the application error saying the variable must be an integer.

### Evidence Outline

- [environment.ts](../../src/environment.ts) (lines 23-27) parses with `Number.parseInt` and checks
  only the resulting integer and range.
- [playwright.config.ts](../../playwright.config.ts) (lines 12-13) independently uses the same
  lenient parsing for the web-server URL.
- No environment/configuration spec exists in [tests](../../tests).
- A read-only Node probe confirmed `Number.parseInt('3100abc', 10) === 3100` and
  `Number.parseInt('1.5', 10) === 1`.

### Impact Analysis

- Operator mistakes are silently normalised rather than rejected at startup.
- Application and runner happen to agree today, but duplicated parsing can drift later.
- Diagnostics are less trustworthy because the stated validation rule is stricter than the code.

### Refactor Recommendation and Strategy

1. Parse the entire value using a strict decimal-integer expression or `Number(value)`.
2. Reject whitespace-only, fractional, exponent, signed-out-of-range, and trailing-character
   values explicitly.
3. Export or share the parsing helper so Playwright configuration and application startup use one
   rule where practical.
4. Add table-driven unit tests for `1`, `65535`, `0`, `65536`, `1.5`, `3100abc`, and blank input.

## Risk 4 - HTTP Content Type Is Not Enforced

**Severity:** LOW

### Risk Description

The OpenAPI request body advertises only `application/json`, but the server routes every POST to
the JSON parser without checking `Content-Type`. A syntactically valid JSON body sent as
`text/plain` is therefore accepted.

### Evidence Outline

- [openApiDocument.ts](../../src/openApiDocument.ts) (lines 31-39) exposes only
  `application/json`.
- [calculatorHttpServer.ts](../../src/calculatorHttpServer.ts) (lines 80-82) dispatches the POST
  based only on method and path.
- [calculatorHttpServer.ts](../../src/calculatorHttpServer.ts) (lines 109-116, 157-175) parses the
  body as JSON without a media-type guard.
- [api.spec.ts](../../tests/api.spec.ts) (lines 75-106) sets JSON content type for malformed and
  oversized raw bodies but does not test an unsupported media type.

### Impact Analysis

- Runtime behaviour is more permissive than the published contract.
- A client integration error can go unnoticed until the server is replaced by a stricter
  implementation.
- The project misses an opportunity to teach `415 Unsupported Media Type` as a transport-level
  failure distinct from `400` validation and `422` domain rejection.

### Refactor Recommendation and Strategy

1. Accept `application/json` with optional parameters such as `charset=utf-8`.
2. Return `415` using the standard `ApiErrorResponse` shape for unsupported media types.
3. Document the response in OpenAPI.
4. Add integration cases for JSON, JSON with charset, missing content type, and `text/plain`.

## Risk 5 - Server Listen Errors Bypass the Promise Contract

**Severity:** LOW

### Risk Description

`CalculatorServer.listen()` returns a promise that can resolve but has no rejection path. Node
reports bind failures through the server's `error` event. The wrapper therefore does not fulfil its
own async lifecycle abstraction for port collisions or invalid host binding.

### Evidence Outline

- [calculatorHttpServer.ts](../../src/calculatorHttpServer.ts) (lines 25-29) advertises an async
  `listen(): Promise<void>` lifecycle.
- [calculatorHttpServer.ts](../../src/calculatorHttpServer.ts) (lines 41-46) resolves on the listen
  callback but does not subscribe to an error event or reject.
- [startServer.ts](../../src/startServer.ts) (lines 12-17) awaits the incomplete promise contract.
- [playwright.config.ts](../../playwright.config.ts) (lines 34-42) relies on that process for the
  suite's shared web server.

### Impact Analysis

- Startup failures surface as process-level errors rather than a controlled rejection with a clear
  message.
- A direct consumer of `createCalculatorServer` cannot reliably catch a failed listen call.
- The suite's runtime lifecycle is less reusable than the interface suggests.

### Refactor Recommendation and Strategy

1. Attach a one-shot `error` listener before calling `listen`.
2. Remove that listener on successful startup and reject on failure.
3. Add a lifecycle test that binds one server, attempts a second bind on the same port, and asserts
   a rejection.
4. Consider a small `SIGINT`/`SIGTERM` shutdown path in `startServer.ts` if the example is extended
   beyond Playwright's managed process.

## Risk 6 - Coverage and Trend Evidence Is Declaration-Based Only

**Severity:** INFO

### Risk Description

The repository can count tests and collect Playwright HTML evidence, but it has no line, branch,
mutation, or historical test-result signal. This is acceptable for the current teaching sample,
but "coverage" claims must remain qualitative.

### Evidence Outline

- [playwright.config.ts](../../playwright.config.ts) (lines 26-32) configures list and HTML
  reporters, screenshots, and first-retry traces.
- [ci.yml](../../.github/workflows/ci.yml) (lines 73-82) uploads Playwright evidence only on
  failure.
- [.gitignore](../../.gitignore) (line 11) anticipates a coverage directory, but no coverage
  command or threshold is defined.
- Static declaration count: 15 plain `test(...)` cases plus 4 Gherkin scenarios = 19 expected
  runtime tests.

### Impact Analysis

- A reviewer can see topology but not which branches remain unexecuted.
- Historical pass-rate and duration trends are not retained.
- This does not undermine current correctness evidence, but it limits quantitative portfolio
  claims.

### Refactor Recommendation and Strategy

Keep this as an optional enhancement. If quantitative evidence becomes a portfolio goal, instrument
the pure domain and HTTP/controller source, publish a concise coverage summary, and avoid imposing
an arbitrary threshold that encourages low-value tests.

## Recorded Questions

1. Is OpenAPI `info.version` independently versioned? No policy says so; this review assumes it
   should track 0.2.0.
2. Is blank input intended to mean zero? HTML `required` and controller error copy imply not; this
   review treats it as a defect.

---

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Next: Project Review ->](03_PROJECT_REVIEWS/PROJECT_001_CALCULATOR_SCREENPLAY_BDD.md)
