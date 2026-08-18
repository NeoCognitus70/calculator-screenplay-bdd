# Screenplay Architecture

This project consumes the immutable v0.3.0 release of the
`hand-baked-screenplay-pattern` package. It does not copy the Screenplay primitives into this
repository or depend on a provider worktree.

The goal is pedagogical: show how a small dependency-free Screenplay
implementation can structure Playwright API and browser tests while preserving
BDD readability.

## Core Primitives

| Primitive | Responsibility In This Project |
| --- | --- |
| Actor | A named participant such as `Ada` who performs calculator scenarios. |
| Ability | A capability the actor can use, such as making REST calls or browsing the UI. |
| Task | A business-level activity, such as calculating through the API or browser. |
| Interaction | A low-level operation, such as filling fields or clicking Calculate. |
| Question | A typed observation, such as the API result or displayed browser message. |
| Ensure | An assertion interaction that checks a question against an expectation. |
| Cast / Stage | The setup that gives actors their abilities for each scenario. |

## How The Pieces Fit

```text
Gherkin scenario
  -> calculatorSteps.ts
    -> Actor on a Stage
      -> Calculate task
        -> API: Send.a(...) through MakeRequests
        -> UI: OpenTheCalculator + EnterTheCalculation + SubmitTheCalculation
      -> Ensure.that(...)
        -> TheApiCalculation or TheDisplayedCalculation question
```

## Abilities

`PlaywrightApiClient` adapts Playwright's `APIRequestContext` to the
Screenplay library's `HttpClient` interface. That lets actors use the built-in
`MakeRequests`, `Send`, and `LastResponse` primitives against the real API.

`BrowseTheWeb` wraps Playwright's `Page`. Browser-specific mechanics stay in
interactions and questions instead of leaking into feature steps.

Both API and UI actors also receive `ManageData`. The tasks remember the last
calculation request, and the "should be" Then steps recall it through
`TheRememberedCalculation` (`calculatorQuestions.ts`) — passing it through the
same pure `calculate()` the server/UI use and asserting the result matches the
observed outcome. This demonstrates scenario memory as a genuine round trip
(`Remember` -> `Recall`) rather than a write-only side effect, without needing
global state.

## Tasks

`Calculate.usingTheApi(request)` expresses the intent to calculate through the
REST boundary. It composes `Remember.that(...)` and `Send.a(...)`.

`Calculate.usingTheBrowser(request)` expresses the intent to calculate through
the user interface. It composes opening the calculator, entering the operands,
choosing the operator, and submitting the form.

The tasks are intentionally named in domain language. They hide the mechanics
that would otherwise make Gherkin steps read like scripts.

## Interactions

Interactions are the first layer allowed to know about Playwright browser
mechanics:

- `OpenTheCalculator()`
- `EnterTheCalculation(request)`
- `SubmitTheCalculation()`

This follows the Screenplay rule of thumb: interactions operate the system,
tasks explain why the actor is operating it.

## Questions

Questions describe observations:

- `TheApiCalculation.result()`
- `TheApiCalculation.errorDetails()`
- `TheDisplayedCalculation.message()`

BDD assertions use `Ensure.that(question, expectation)` so the step definitions
stay focused on scenario language.

## BDD Layer

The feature files are intentionally small:

- API scenarios prove accepted and unsupported calculations at the REST boundary.
- UI scenarios prove that users can calculate and see domain errors in the browser.

Broader arithmetic coverage remains in `tests/domain.spec.ts` and
`tests/api.spec.ts`. This is risk-based testing: use lower-cost layers for broad
coverage, and reserve browser BDD scenarios for product workflows.

## File Responsibilities

- `tests/calculatorSteps.ts`: translates Gherkin phrases into Screenplay actions.
- `tests/calculatorTasks.ts`: captures calculator business activities.
- `tests/calculatorInteractions.ts`: performs browser mechanics.
- `tests/calculatorQuestions.ts`: reads API and UI outcomes.
- `tests/screenplayApiClient.ts`: adapts Playwright API requests to Screenplay HTTP.
- `tests/screenplayBrowseTheWeb.ts`: grants actors the ability to use a browser page.
