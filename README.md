# Calculator Screenplay BDD

A small calculator application used to teach BDD-style test automation with
Playwright, TypeScript, REST + OpenAPI, and the versioned
`hand-baked-screenplay-pattern` provider.

The project is intentionally compact: a pure calculator domain, a dependency-free
Node HTTP server, a static browser UI, and tests that climb the test pyramid from
unit checks to Screenplay-backed Gherkin scenarios.

## What This Demonstrates

- Test pyramid: fast domain tests, REST integration tests, and focused BDD UI/API scenarios.
- SOLID boundaries: domain rules do not depend on HTTP, browser, or Playwright.
- KISS/YAGNI: Node's built-in `http` module serves the API and static UI.
- REST + OpenAPI: the API contract is available at `/openapi.json`.
- Screenplay Pattern: actors use abilities, perform tasks, and ask questions.
- Provider boundary: a Calculator-owned gateway composes one scenario-scoped provider/Actor; the
  full suite statically selects the hand-baked v0.3.0 adapter.
- Bounded portability proof: dedicated REST/conformance specs also exercise a small independent
  Promise-native adapter without changing the browser/BDD provider or adding a runtime dependency.
- ISTQB techniques where useful: equivalence partitioning, boundary values, decision-table thinking, and risk-based UI coverage.

## Project Layout

```text
public/
  index.html              Static calculator page.
  styles.css              Restrained responsive UI styling.

src/
  calculatorContracts.ts  Shared REST request/response types.
  calculatorDomain.ts     Pure calculator rules and validation.
  calculatorHttpServer.ts HTTP adapter and static asset serving.
  environment.ts          Typed process environment model.
  openApiDocument.ts      Hand-written OpenAPI document.
  startServer.ts          Application entry point.
  uiController.ts         Browser-side TypeScript controller.

features/
  calculator-api.feature  BDD examples for the REST API.
  calculator-ui.feature   BDD examples for the browser workflow.

tests/
  api.spec.ts             REST integration tests.
  domain.spec.ts          Unit tests over the pure calculator domain.
  uiController.spec.ts    Browser-backed controller test (network-failure error state).
  calculatorFixtures.ts   Scenario-scoped BDD provider lifecycle.
  calculator*.ts          Screenplay tasks, interactions, questions, and steps.
  calculatorProvider*.spec.ts  Dual-provider conformance and bounded REST proof.
  screenplay*.ts          Playwright-to-Screenplay abilities/adapters.
  screenplay/             Calculator seam, provider gateway, and two provider adapters.
```

## Prerequisites

- Node.js 20 or newer (the same supported floor as the provider and CI).

The provider is pinned to the immutable public v0.3.0 release artefact, as recorded in
[ADR 0002](./docs/adr/0002-consume-screenplay-provider-via-pinned-release.md):

```json
"hand-baked-screenplay-pattern": "https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/releases/download/v0.3.0/hand-baked-screenplay-pattern-0.3.0.tgz"
```

Published SHA-256:
`ac5bd1f6d9bddf95c9a42f99f05f093c7875b1835ecd3ae0d5ca2385e810c36d`.
The lockfile also records npm's SHA-512 integrity. `npm run check:screenplay-provider` fails if the
manifest, lockfile, workflows, README, or ADR evidence drifts from this approved pin.

No provider checkout, build, token, or runtime registry lookup is required.

## Install

Install this project from its own checkout:

```bash
npm ci
```

This repository keeps npm's cache local through `.npmrc` so installs do not rely
on a global cache location.

Provider changes are developed and gated in the provider repository. Calculator adopts one only
after a new immutable release and digest have been reviewed; do not commit a local `file:` override,
branch URL, `npm link`, or provider-checkout workflow step here. A disposable experiment may use a
locally packed candidate, but restore the approved manifest and lockfile before citing verification.

## Public-readiness status

This repository was made public on 2026-07-14. The
[2026-07-14 public-readiness audit](./docs/audits/2026-07-14_public-readiness.md) records the
evidence and owner decisions that preceded the change; its Publication Runbook's post-change
checks (anonymous clone and `npm run verify`, dependency/licence visibility, the `main` ruleset,
and secret scanning/push protection) were completed and verified at publication time.

## Run The Application

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:3100
```

Useful endpoints:

```text
GET  /health
GET  /openapi.json
POST /api/calculations
```

Example request:

```bash
curl -X POST http://127.0.0.1:3100/api/calculations \
  -H "content-type: application/json" \
  -d "{\"leftOperand\":8,\"operator\":\"multiply\",\"rightOperand\":6}"
```

## Live API reference

A published, static rendering of the API contract is at
**<https://neocognitus70.github.io/calculator-screenplay-bdd/>**.

It is a **static reference generated from the committed contract** (`src/openApiDocument.ts`) — it is
**not** a running service and does **not** call `/health` or `/api/calculations`. The raw document is
exposed beside it as `openapi.json`. The page is self-contained (inline CSS only, no external assets
or CDN) and is produced deterministically by `renderApiReference()` (`src/apidocs/`);
`npm run docs:api` builds and writes `docs-site/`, and `npm run check:api-docs` fails if the reference
drifts from the contract, is non-deterministic, or would load an external asset. The `Pages` workflow
publishes it on pushes to `main` after the build and that check pass; the drift check also runs inside
`npm run verify`.

## Test And Verify

```bash
npm run check:screenplay-provider
npm run check:screenplay-boundary
npm run typecheck
npm run build
npm run test:unit
npm run test:bdd
npm run verify
```

`npm run test:bdd` generates Playwright tests from the Gherkin files under
`features/.features-gen/`. Generated files are ignored because the source of
truth is the feature text plus the step definitions.

`tests/calculatorProviderConformance.spec.ts` registers the provider package's exported semantic
cases against both Calculator adapters. `tests/calculatorProviderContract.spec.ts` runs one bounded
REST profile through both adapters and compares required observations. These are ordinary
`unit-and-api` specs; the alternate provider is never selected by the BDD fixture or browser lane.

Playwright is configured with `screenshot: 'on'`, so browser-backed tests record
screenshots even when they pass. That is intentional for this small pedagogical
project: the screenshots make it easier to inspect what the Screenplay actor saw,
connect Gherkin scenarios to visible UI behavior, and discuss test evidence with
people learning the pattern.

For a larger test project, change this setting to `only-on-failure` or remove it.
Always-on screenshots increase storage use, slow report handling, and can make
test artifacts noisy once the suite grows substantially.

## Screenplay Guide

Read [SCREENPLAY.md](./SCREENPLAY.md) for the Screenplay architecture used by
this project and how the core primitives map to the calculator examples.

For deeper pedagogical notes, start with
[Screenplay Flow Through The System Under Test](./docs/screenplay-flow-through-the-sut.md).

For a map of how the repository and its Playwright + `playwright-bdd` toolchain
fit together, see
[Project Structure and Test Architecture](./docs/project-structure-and-test-architecture.md).

## Licence

[Apache License 2.0](./LICENSE) — © 2026 Gary Brooks.

This licence covers the original calculator application, tests, and documentation in this
repository. The
[`hand-baked-screenplay-pattern`](https://github.com/NeoCognitus70/hand-baked-screenplay-pattern)
provider is an independently licensed Apache-2.0 project; its own
[`LICENSE`](https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/blob/main/LICENSE)
remains authoritative. Consuming its immutable release artefact does not vendor or relicense that
repository. Other dependencies retain their respective terms.

## Change History

Notable changes are recorded in [CHANGELOG.md](./CHANGELOG.md); outstanding work and risks live
in [docs/backlog.md](./docs/backlog.md).
