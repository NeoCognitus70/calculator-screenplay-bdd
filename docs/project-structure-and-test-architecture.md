# Project Structure and Test Architecture

This note explains how the calculator project is laid out and how its
Playwright + `playwright-bdd` test toolchain fits together. It is a map for
anyone reading the repository for the first time; for the *why* of the
Screenplay style itself, read
[Screenplay Flow Through The System Under Test](./screenplay-flow-through-the-sut.md).

Every structural claim below is taken from `playwright.config.ts` and
`package.json` as of writing; if those files change, update this note.

## Directory layout

```text
public/      Static browser UI (index.html, styles.css) served by the HTTP adapter.
src/         The system under test (SUT): pure domain, HTTP server, UI controller.
features/    Gherkin .feature files — the business-readable BDD examples.
tests/       Two distinct kinds of test code (see below).
docs/        This note, the Screenplay flow guide, ADRs, and the backlog.
scripts/     The sibling-checkout preflight (preflight-screenplay.mjs).
```

### `src/` — the system under test

The application is a small, dependency-free calculator. The domain
(`calculatorDomain.ts`) is pure and knows nothing about HTTP or the browser;
`calculatorHttpServer.ts` adapts it to Node's built-in `http` module and serves
the static `public/` UI; `uiController.ts` is the browser-side controller; and
`startServer.ts` is the entry point that `npm run dev` builds and runs. The REST
contract lives in `calculatorContracts.ts` with a hand-written OpenAPI document
in `openApiDocument.ts`.

### `features/` — the Gherkin examples

Two feature files describe externally meaningful behaviour:

- `calculator-api.feature` — REST API examples.
- `calculator-ui.feature` — browser-workflow examples.

These contain no selectors or HTTP mechanics; they are the readable top of the
test pyramid. `playwright-bdd` turns them into runnable Playwright specs (see
[bddgen](#how-bddgen-generates-the-bdd-specs) below).

### `tests/` — two kinds of code in one folder

The `tests/` directory holds **two distinct things**, and the Playwright
project split (below) is what keeps them separate:

1. **Plain Playwright spec files** (`*.spec.ts`) — `api.spec.ts` (REST
   integration), `domain.spec.ts` (unit tests over the pure domain), and
   `uiController.spec.ts` (a browser-backed test that loads the UI, aborts the
   `/api/calculations` route, and asserts the controller settles to an error
   state). These are ordinary Playwright tests, not Gherkin-driven — but
   `uiController.spec.ts` uses the `page` fixture like the `bdd` project's
   specs do, it just is not generated from a feature file.
2. **Screenplay glue for the BDD layer** — `calculatorSteps.ts` (the Gherkin
   step bindings), plus the tasks/interactions/questions
   (`calculatorTasks.ts`, `calculatorInteractions.ts`, `calculatorQuestions.ts`)
   and the Playwright-to-Screenplay adapters (`screenplayApiClient.ts`,
   `screenplayBrowseTheWeb.ts`). These are imported by the generated BDD specs;
   they are not `*.spec.ts` files and so are never picked up directly as tests.

## The two Playwright projects

`playwright.config.ts` defines **two** Playwright projects, which is how the two
kinds of `tests/` code stay apart:

| Project | `testDir` | What it runs |
|---|---|---|
| `unit-and-api` | `tests` | The plain spec files, matched by `testMatch: /.*\.spec\.ts/` — i.e. `tests/api.spec.ts`, `tests/domain.spec.ts`, and `tests/uiController.spec.ts`. The last of these is browser-backed (it uses the `page` fixture), so despite its name this project is not purely non-browser. |
| `bdd` | the `playwright-bdd` output dir | The Playwright specs **generated** from the Gherkin features, run under `devices['Desktop Chrome']`. |

Because `unit-and-api` matches only `*.spec.ts`, the Screenplay glue files in
`tests/` are excluded from that project; they reach the runner only via the
generated BDD specs in the `bdd` project.

Both projects share one `webServer`: Playwright starts the calculator once
(`npm run dev`) and waits on `/health`, so every test — unit, API, or BDD —
exercises the same deployed boundary a real user would reach. `reuseExistingServer`
is on locally and off in CI.

The npm scripts target the projects directly:

- `npm run test:unit` → `--project=unit-and-api`.
- `npm run test:bdd` → `bddgen` then the `--project=bdd` tests.
- `npm test` → `bddgen` then **all** projects.

## How `bddgen` generates the BDD specs

The `bdd` project does not point at the `features/` folder directly. Instead,
`playwright.config.ts` calls `defineBddConfig({ ... })`, which wires up:

- `features: 'features/**/*.feature'` — the Gherkin source.
- `steps: 'tests/calculatorSteps.ts'` — the step definitions that bind each
  Gherkin sentence to Screenplay actors, tasks, and questions.
- `outputDir: 'features/.features-gen'` — where generated specs are written.

`defineBddConfig(...)` returns that output directory, and the `bdd` project uses
it as its `testDir`. The `npm run bddgen` script (`playwright-bdd`'s CLI) reads
the features and steps and **writes runnable Playwright spec files into
`features/.features-gen/`**. The `test` and `test:bdd` scripts run `bddgen`
before invoking Playwright, so the generated specs are always current.

The generated directory is build output, not source: the source of truth is the
feature text plus the step definitions, so `features/.features-gen/` is
git-ignored. Run `bddgen` (or any script that calls it) after editing a feature
or a step.

## Putting it together — the test pyramid

```text
domain.spec.ts        unit         fast checks on the pure calculator rules
api.spec.ts           integration  the REST boundary directly
uiController.spec.ts  integration  browser-backed controller error handling
                                    (network-failure state, no Gherkin)
*.feature (via bdd)   acceptance   business-readable API + UI examples,
                                    automated through the Screenplay layer
```

`npm run verify` runs the sibling preflight, the typecheck, the build, and then
the full test suite (`bddgen` + all Playwright projects), which is the same
sequence CI runs on every pull request.
