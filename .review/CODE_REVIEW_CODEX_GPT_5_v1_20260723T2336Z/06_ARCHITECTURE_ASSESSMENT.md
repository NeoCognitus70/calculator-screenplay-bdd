# Architecture Assessment

[<- Back to Index](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)

Reviewer: AI assistant (Codex GPT-5)

## Test Pyramid

- **Unit/base:** Six domain tests exercise operations, validation, division by zero, sign
  boundaries, magnitude, and non-terminating division.
- **Service/integration:** Eight API tests cover health, contract exposure, success, validation,
  unsupported operation, malformed JSON, request-size capping, 404, and operator-enum drift.
- **Controller:** One browser-backed test proves failed-fetch settlement.
- **Acceptance:** Four generated BDD scenarios cover API and UI success/error examples through
  Screenplay.
- The distribution is proportionate. Risk 2 shows that the browser parsing boundary needs one more
  focused controller test, not a broad expansion of UI BDD.

## SOLID Principles

### Single Responsibility

- Domain calculation, contracts, HTTP adaptation, OpenAPI, environment, startup, UI control,
  Screenplay activities, and test glue have clear responsibilities.
- `calculatorHttpServer.ts` is the largest file but remains a coherent adapter at current scale.

### Open/Closed

- Adding an operator requires intentional changes to the union, domain switches, UI options,
  Gherkin phrase mapping, and OpenAPI. The enum drift test protects one part of that path.
- This explicit change surface is acceptable for a four-operator teaching app, but broader
  contract checks would make extension safer.

### Liskov Substitution

- `PlaywrightApiClient` conforms to the provider's `HttpClient` interface and returns status,
  headers, and typed-unknown body consistently.
- No subclass hierarchy or behavioural substitution risk exists in the SUT.

### Interface Segregation

- `BrowseTheWeb` exposes only a Page and `PlaywrightApiClient` only the provider HTTP interface.
- Actors receive only the abilities needed for their API or UI scenario.

### Dependency Inversion

- Screenplay tasks depend on abilities and provider interfaces rather than global Playwright state.
- The pure domain is independent of transport and framework code.
- The consumer still has a source-layout dependency on the sibling repository, explicitly accepted
  by ADR 0001.

## KISS

- Built-in Node HTTP, a static page, inline OpenAPI, and one test runner keep the example small.
- Serial execution avoids premature server-per-worker infrastructure.
- Four Gherkin scenarios communicate the pattern without duplicating every arithmetic case.
- Strict parsing and lifecycle fixes can remain small local changes; no new framework is needed.

## YAGNI

- No database, container stack, authentication service, DI container, page-object hierarchy, or
  report platform is introduced.
- The sibling package is not vendored or published merely for ceremony.
- Quantitative coverage and pinned releases are correctly optional until a portfolio or external
  consumer need appears.
- The accepted floating provider branch is a conscious YAGNI trade-off, not an accidental omission.

## REST and OpenAPI

- Status semantics distinguish malformed/invalid (`400`), oversized (`413`), unsupported domain
  operation (`422`), not found (`404`), and success (`200`).
- A consistent error body improves client and Screenplay-question reuse.
- OpenAPI 3.1 describes the core request/response schemas and operator enumeration.
- Missing media-type enforcement and stale `info.version` are concrete contract gaps.
- The contract guard should expand beyond the operator enum before the API surface grows.

## ISTQB Strategies

- **Equivalence partitioning:** supported vs unsupported operator/domain outcomes, valid vs invalid
  request shapes, reachable vs failed service.
- **Boundary value analysis:** zero divisor, negative/zero sign boundary, large exact product, 10 KiB
  body cap, and port range logic.
- **Decision tables:** HTTP response mapping is implicit in code/tests; UI input parsing would
  benefit from an explicit table for blank, invalid, zero, and valid values.
- **State transition:** browser output moves from idle to success/error and the test waits on the
  settled state. Reset and overlapping request transitions are not covered.
- **Use-case testing:** Gherkin covers calculator use through API and browser with both successful
  and unsupported outcomes.
- **Risk-based selection:** broad arithmetic stays low in the pyramid, while only important
  workflows reach the browser.

## Pedagogical Comments

- File headers consistently explain responsibility and design intent.
- Screenplay documentation traces the flow from Gherkin to Actor, Ability, Task, Interaction,
  Question, and Ensure.
- Comments around raw malformed JSON, streaming size limits, waits, and serial execution capture
  non-obvious lessons.
- Some comments risk becoming historical narrative inside production/test code; they are currently
  useful and proportionate to the teaching purpose.
- Fixes should retain concise "why" comments while moving historical detail to changelog/backlog.

## Security and Supply Chain

- The HTTP body cap, loopback default host, no authentication surface, and no external service reduce
  exposure.
- CI uses `contents: read`, does not persist credentials, and names no secret.
- Actions use major-version tags rather than immutable SHAs. This is common and the repository's
  security posture is otherwise strong; treat SHA pinning as optional hardening, not a vulnerability.
- The provider `main` ref is floating by accepted ADR decision and can change CI outcomes.
- `npm audit` and GitHub alerts are currently clean; licence metadata is permissive and explicit.

## Pedagogical Value Rating

**Strong.** The repository demonstrates senior judgement in layering, readable BDD, Screenplay
boundaries, deterministic local infrastructure, explicit CI coupling, and durable documentation.
Resolving the small boundary-validation and metadata findings would make its "contracts are
executable" lesson more complete.

---

[<- Previous: Recommendations](05_RECOMMENDATIONS.md) | [Back to Index](00_CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)
