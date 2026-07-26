# Executive Summary

[<- Back to Index](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Next: Risks and Issues ->](02_RISKS_AND_ISSUES.md)

Reviewer: AI assistant (Codex GPT-5)

## Overall Assessment

Calculator Screenplay BDD is a compact and unusually well-explained teaching repository. Its pure
domain, dependency-free HTTP adapter, small browser controller, layered Playwright suite, and
faithful Screenplay vocabulary form a coherent example rather than a collection of test
techniques. The current tree has no HIGH finding and no known dependency or secret alert.

The main weakness is release and boundary validation. The recent 0.2.0 close-out did not update
the lockfile root version or OpenAPI version. Two small parsing choices also make the running
application less strict than its documentation: blank UI fields become zero, and malformed port
strings are accepted. These are limited fixes, but they matter in a repository whose purpose is to
teach precise automation and contract thinking.

## Design Quality

- The dependency direction is clean: HTTP and browser adapters depend on the pure calculator
  domain, while the domain has no Playwright, HTTP, or DOM dependency.
- The Screenplay separation is faithful. Tasks express goals, interactions contain mechanics,
  questions observe outcomes, and step definitions remain translation glue.
- One stateless SUT supports unit-like, API, controller, API-BDD, and browser-BDD coverage without
  infrastructure overhead.
- Serial execution and the shared server lifecycle are stated explicitly rather than hidden behind
  a misleading parallel setting.
- The deliberate sibling-checkout coupling is recorded in an ADR with a revisit trigger, although
  it reduces reproducibility by design.

## Code Quality

- TypeScript strictness is strong: unused declarations, exact optional properties, fall-through,
  casing, and override checks are enabled.
- Domain errors are typed and mapped consistently to `400`, `413`, and `422` response shapes.
- The request-body cap is applied while streaming, preventing unbounded buffering.
- Browser locators use labels and roles, and the UI question waits on a settled state rather than
  racing transient text.
- Input and lifecycle edge validation is incomplete: blank form fields, malformed port values, an
  unsupported media type, and listen errors need explicit handling.

## Main Highlights

- 15 plain Playwright tests plus 4 generated BDD scenarios give 19 expected runtime tests with no
  skip, focus, quarantine, or WIP marker.
- The test pyramid is proportionate: broad arithmetic cases remain low in the pyramid while only
  four stakeholder-readable examples occupy the BDD layer.
- CI checks out both repositories side by side, installs only Chromium, uses a dependency cache,
  runs the canonical verify command, and retains failure evidence for seven days.
- The latest fetched main CI run for `5fd5460` passed, and repository security settings include an
  active PR-plus-verify ruleset, Dependabot security updates, secret scanning, and push protection.
- `npm audit` reports zero vulnerabilities and the lockfile records only permissive licences.

## Pedagogical Value

- Responsibility comments explain why layers exist rather than paraphrasing syntax.
- The Gherkin remains business-readable and does not expose selectors or request-client mechanics.
- `SCREENPLAY.md` and the flow guide connect abstract Screenplay terms to concrete code paths.
- The OpenAPI contract and service-level tests make the difference between transport validation
  and unsupported domain operations visible.
- The present gaps are also pedagogically important: a teaching project should demonstrate that UI
  parsing, environment parsing, release metadata, and HTTP media types are contract boundaries.

## Suite Health and Stability

- Tests are deterministic and require no credentials, database, external API, token, or mutable
  fixture data.
- Each BDD scenario creates a new Stage and an empty scenario-memory store; Playwright provides a
  fresh page or request context through its fixtures.
- The application holds no cross-test domain state. Serialisation is conservative but honest.
- Explicit settled-state waiting protects the asynchronous browser render.
- No quantitative line or branch coverage is collected, so the 19-test count is a topology metric,
  not proof of source coverage.

## Status Against the Backlog

The backlog accurately records the closure of earlier sibling, CI, wait, request-cap, OpenAPI enum,
controller-error, and documentation findings. It does not yet account for the current 0.2.0
metadata split or the newly identified input and lifecycle gaps. Its "zero outstanding" claim
should therefore be treated as stale pending triage.

---

[<- Previous: Index](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Back to Index](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Next: Risks and Issues ->](02_RISKS_AND_ISSUES.md)
