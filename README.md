# Calculator Screenplay BDD

A small calculator application used to teach BDD-style test automation with
Playwright, TypeScript, REST + OpenAPI, and the sibling
`hand-baked-screenplay-pattern` package.

The project is intentionally compact: a pure calculator domain, a dependency-free
Node HTTP server, a static browser UI, and tests that climb the test pyramid from
unit checks to Screenplay-backed Gherkin scenarios.

## What This Demonstrates

- Test pyramid: fast domain tests, REST integration tests, and focused BDD UI/API scenarios.
- SOLID boundaries: domain rules do not depend on HTTP, browser, or Playwright.
- KISS/YAGNI: Node's built-in `http` module serves the API and static UI.
- REST + OpenAPI: the API contract is available at `/openapi.json`.
- Screenplay Pattern: actors use abilities, perform tasks, and ask questions.
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
  *.spec.ts               Unit and REST integration tests.
  calculator*.ts          Screenplay tasks, interactions, questions, and steps.
  screenplay*.ts          Playwright-to-Screenplay abilities/adapters.
```

## Prerequisites

- Node.js 18 or newer.
- The sibling `../hand-baked-screenplay-pattern` project must be present.

The dependency on `hand-baked-screenplay-pattern` is local:

```json
"hand-baked-screenplay-pattern": "file:../hand-baked-screenplay-pattern"
```

## Install

Build the sibling Screenplay package first, then install this project:

```bash
npm run prepare:screenplay
npm install
```

This repository keeps npm's cache local through `.npmrc` so installs do not rely
on a global cache location.

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

## Test And Verify

```bash
npm run typecheck
npm run build
npm run test:unit
npm run test:bdd
npm run verify
```

`npm run test:bdd` generates Playwright tests from the Gherkin files under
`features/.features-gen/`. Generated files are ignored because the source of
truth is the feature text plus the step definitions.

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
