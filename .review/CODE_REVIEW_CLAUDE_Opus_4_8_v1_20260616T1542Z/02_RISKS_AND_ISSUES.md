# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)
**Date:** 2026-06-16T15:42Z

Findings are numbered high-to-low priority. This project's `docs/backlog.md` records **zero
outstanding risks** (four resolved), and the static review confirms that assessment: none of the
findings below is a blocker. They are robustness, coverage, and reproducibility refinements. Each
has a description, evidence (file + line), impact, and a remediation strategy.

Severity legend: High = correctness/reliability defect; Medium = notable risk or maintainability
debt; Low = refinement; Info = observation with no action required.

---

## Risk 1 [Low]: `fullyParallel: true` is contradicted by `--workers=1` everywhere, masking a latent isolation risk

**Description.** The Playwright config declares full parallelism, but every test script pins a
single worker, and the suite shares one `webServer` instance with mutable scenario state held on
the actor's `ManageData` store. The parallel intent is therefore inert today, but the config
*advertises* an isolation guarantee the scripts quietly override. A maintainer who later drops
`--workers=1` (the obvious "speed it up" change) would run scenarios concurrently against a single
server with no per-test data partitioning.

**Evidence.**
- [playwright.config.ts](../../playwright.config.ts) (line 22): `fullyParallel: true`.
- [package.json](../../package.json) (lines 14-16): `test`, `test:unit`, and `test:bdd` all pass
  `--workers=1`.
- The shared server is defined once in [playwright.config.ts](../../playwright.config.ts)
  (lines 29-38) with `reuseExistingServer: !process.env.CI`.

**Impact.** Low today (the pin neutralises it). The risk is latent and future-facing: the config
documents a parallelism posture the suite does not actually run under, so the next maintainer's
mental model is wrong. For a teaching repo, that is a subtle mixed message about isolation.

**Remediation.** Either (a) set `fullyParallel: false` to match how the suite is actually run and
add a one-line comment that the single shared `webServer` is the reason; or (b) keep
`fullyParallel: true` but add a comment in `playwright.config.ts` explaining that `--workers=1` is
the deliberate guard and what would have to change (per-test data isolation, possibly a server per
worker) before parallelism is safe. Option (a) is the more honest KISS choice for a project this
small.

---

## Risk 2 [Low]: The BDD layer's rejection semantics hard-code HTTP 422 invisibly to the business reader

**Description.** The API divide-by-zero scenario reads "the API should reject the calculation
with <message>", and the step binds that to `Calculate.shouldHaveBeenRejectedAsUnsupported()`,
which asserts `LastResponse.status() equals 422`. The 422 contract is correct, but it lives only in
the Screenplay task; the Gherkin and the feature comments never state which rejection is meant, so
the business-readable layer cannot distinguish a 400 (bad request) from a 422 (unsupported) -- the
exact distinction the server is careful to make.

**Evidence.**
- [features/calculator-api.feature](../../features/calculator-api.feature) (lines 17-19): the
  scenario asserts only a message, not a status class.
- [tests/calculatorTasks.ts](../../tests/calculatorTasks.ts) (lines 54-59):
  `shouldHaveBeenRejectedAsUnsupported()` hard-codes `equals(422)`.
- [tests/calculatorSteps.ts](../../tests/calculatorSteps.ts) (lines 63-71): the
  "should reject ... with" step calls that task.
- The server's 400-vs-422 split is in
  [src/calculatorHttpServer.ts](../../src/calculatorHttpServer.ts) (lines 122-136).

**Impact.** Low. The test is correct and stable. The cost is pedagogical: a key REST design point
(validation error vs semantic error) is taught in the source and the unit/API specs but is
invisible at the BDD altitude, which slightly undercuts the "business-readable executable
specification" lesson.

**Remediation.** Optional. Add a second BDD step or rename the existing one so the Gherkin can say,
e.g., "Then the API should reject the calculation as unsupported with <message>" versus a separate
"reject as a bad request" phrasing, keeping the 400/422 distinction expressible in the feature
text. Alternatively, document in the feature comment header that "reject ... with" maps to 422 by
convention.

---

## Risk 3 [Low]: Always-on screenshots (`screenshot: 'on'`) scale poorly and are easy to copy unthinkingly

**Description.** Playwright is configured to capture a screenshot for every browser-backed test,
pass or fail. The README documents this as an intentional teaching choice (so learners can see what
the actor saw) and explicitly tells readers to switch to `only-on-failure` for a larger suite.
The setting is therefore a documented trade-off, not a defect -- but it is still a real cost worth
recording in a review, because the config is the thing people copy.

**Evidence.**
- [playwright.config.ts](../../playwright.config.ts) (line 26): `screenshot: 'on'`.
- [README.md](../../README.md) (lines 121-129): documents the choice and the recommended change for
  larger projects.

**Impact.** Low. For this two-scenario UI suite the artefact cost is negligible. The risk is that
the config is the most copyable file in a teaching repo, and `'on'` propagated into a real suite
inflates storage, slows report handling, and adds noise.

**Remediation.** No change required given the README guidance. If wanted, add an inline comment in
`playwright.config.ts` next to the setting (not just in the README) pointing to the
`only-on-failure` guidance, so the caveat travels with the config when it is copied.

---

## Risk 4 [Low]: CI pins the sibling library to floating `ref: main`, so a green PR here can be broken by an unrelated sibling commit

**Description.** The CI workflow checks out `NeoCognitus70/hand-baked-screenplay-pattern` at
`ref: main` and builds it via `prepare:screenplay`. This faithfully reproduces the documented local
workflow (ADR 0001's deliberate decision) and is correct for a co-developed teaching pair. The
review records it as a reproducibility risk only: this repo's CI result depends on a moving target
it does not control, so a passing PR can later fail to reproduce, or a sibling commit can turn this
repo red without any change here.

**Evidence.**
- [.github/workflows/ci.yml](../../.github/workflows/ci.yml) (lines 45-50): second checkout with
  `ref: main`.
- [docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md](../../docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md)
  (lines 48-61): records the floating-tree consequence and the revisit trigger (pin to a tagged
  release once there are external consumers).
- The `file:../` dependency is in [package.json](../../package.json) (line 20).

**Impact.** Low and accepted. The ADR already names the exact mitigation (pin to a tagged release).
The practical exposure today is small because both repos are maintained together.

**Remediation.** No action needed now; the ADR's revisit trigger is the right gate. If a touch of
extra reproducibility is wanted before then, pin the CI second checkout to a specific sibling SHA or
tag (overriding `ref: main`) so a given PR's CI is reproducible even if it diverges from local
`main`. This is a CI-only pin and does not change the local sibling convention.

---

## Risk 5 [Info]: Edge-case coverage gaps in the API and domain layers

**Description.** The suite proves the main paths (each operator, 400 for a bad contract, 422 for
divide-by-zero, health/OpenAPI) but skips several error and boundary paths the server actually
implements.

**Evidence.**
- No test exercises the malformed-JSON branch -- [src/calculatorHttpServer.ts](../../src/calculatorHttpServer.ts)
  (lines 114-120) returns 400 "Request body must be valid JSON." with no covering test in
  [tests/api.spec.ts](../../tests/api.spec.ts).
- No test covers the 404 route ([src/calculatorHttpServer.ts](../../src/calculatorHttpServer.ts)
  lines 81-85) or the static `/uiController.js` asset branch (lines 171-176).
- The domain unit tests ([tests/domain.spec.ts](../../tests/domain.spec.ts) lines 18-35) cover one
  example per operator but omit ISTQB boundary values: negative operands, very large numbers,
  float-precision results, and the empty-body -> `null` path
  ([src/calculatorHttpServer.ts](../../src/calculatorHttpServer.ts) line 153).

**Impact.** Informational. The uncovered branches are simple and currently correct; the gap is
coverage breadth, not a known defect. For a portfolio piece that teaches ISTQB techniques, the
boundary-value omission is the most visible.

**Remediation.** Add a small number of targeted tests: one API test posting an invalid JSON string
(asserting 400 "must be valid JSON"), one asserting a 404 body, and 2-3 domain tests for boundary
values (negatives, a large product, a non-terminating-but-finite division). These are cheap,
bottom-of-pyramid additions that strengthen the ISTQB story without inflating the BDD layer.

---

## Resolved risks (confirmed by static review)

The backlog's four resolved risks were spot-checked against the source and all hold:

- **Risk #1** (sibling hard dependency) -- preflight present
  ([scripts/preflight-screenplay.mjs](../../scripts/preflight-screenplay.mjs)), README quick-start
  and ADR 0001 present.
- **Risk #2** (no CI gate) -- [.github/workflows/ci.yml](../../.github/workflows/ci.yml) runs
  `npm run verify` on PRs and pushes to `main`.
- **Risk #3** (flaky displayed-message question) -- the settled-state wait is present in
  [tests/calculatorQuestions.ts](../../tests/calculatorQuestions.ts) (lines 42-50).
- **Risk #4** (`prepare:screenplay` mutating the sibling) -- the script now `cd`s into the sibling
  ([package.json](../../package.json) line 9) instead of using `--prefix`.

I did not re-run the gate to verify the green CI runs the backlog cites (`27450198314`), per the
build-race constraint; those run IDs are taken from the backlog as recorded evidence, not
re-verified here.

---

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md)
