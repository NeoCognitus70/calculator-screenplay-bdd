# Screenplay Architecture

The full Calculator BDD suite consumes the immutable v0.3.0 release of the
`hand-baked-screenplay-pattern` package. A bounded REST-only proof also exercises a deliberately
small Calculator-owned Promise-native provider. It does not copy the hand-baked primitives into
this repository or depend on a provider worktree.

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
| Provider lifecycle | The selected adapter gives actors abilities and owns each scenario outcome. |

## How The Pieces Fit

```text
Gherkin scenario
  -> calculatorFixtures.ts (one scenario lifecycle)
    -> screenplayProviderGateway.ts (static hand-baked selection)
      -> handBakedScreenplayProvider.ts (native Stage/Actor adapter)
        -> calculatorSteps.ts (requests one REST or browser Actor)
      -> Calculate task
        -> API: send(...) through the Calculator HTTP ability
        -> UI: OpenTheCalculator + EnterTheCalculation + SubmitTheCalculation
      -> Ensure.that(...)
        -> TheApiCalculation or TheDisplayedCalculation question

Dedicated CAL-24 proof (ordinary Playwright specs)
  -> exported provider conformance cases -> hand-baked adapter + Promise-native adapter
  -> one shared Calculator REST profile  -> hand-baked adapter + Promise-native adapter
```

## Abilities

`PlaywrightApiClient` adapts Playwright's `APIRequestContext` to Calculator's provider-neutral HTTP
contract. Calculator-owned request, response and memory abilities are bound for each Actor. The
hand-baked adapter maps typed tokens to native ability tokens; the Promise-native adapter maintains
an independent per-Actor ability map. Domain Tasks and Questions never import a concrete provider.

`BrowseTheWeb` wraps Playwright's `Page`. Browser-specific mechanics stay in
interactions and questions instead of leaking into feature steps.

Both API and UI actors also receive isolated Calculator scenario memory. The tasks remember the last
calculation request, and the "should be" Then steps recall it through
`TheRememberedCalculation` (`calculatorQuestions.ts`) — passing it through the
same pure `calculate()` the server/UI use and asserting the result matches the
observed outcome. This demonstrates scenario memory as a genuine round trip
(`Remember` -> `Recall`) rather than a write-only side effect, without needing
global state.

## Tasks

`Calculate.usingTheApi(request)` expresses the intent to calculate through the
REST boundary. It composes Calculator-owned `remember(...)` and `send(...)` activities.

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

BDD assertions use `ensure(question, expectation)` so the step definitions
stay focused on scenario language.

## BDD Layer

The feature files are intentionally small:

- API scenarios prove accepted and unsupported calculations at the REST boundary.
- UI scenarios prove that users can calculate and see domain errors in the browser.

Broader arithmetic coverage remains in `tests/domain.spec.ts` and
`tests/api.spec.ts`. This is risk-based testing: use lower-cost layers for broad
coverage, and reserve browser BDD scenarios for product workflows.

The `calculatorScenario` Playwright fixture creates exactly one provider lifecycle per generated
scenario. The first When step requests either the `rest` or `browser` profile from that scenario;
the gateway locks the lifecycle to that profile so native objects cannot be mixed. Provider choice
is a static composition decision — there is no environment or scenario-level hot switch.

## Bounded Provider Proof

`calculatorProviderConformance.spec.ts` registers all four exported v0.3.0 conformance cases
against the real Calculator adapters. The hand-baked adapter translates its native `Stage` events;
the independent adapter translates events from its own Promise scheduler. The shared observations
cover ability and memory isolation, synchronous/asynchronous Questions, ordered and stop-on-failure
execution, preserved descriptions and errors, and exactly-once lifecycle outcomes.

`calculatorProviderContract.spec.ts` then sends one accepted multiplication and one rejected
division-by-zero request through the same `Calculate`, `TheApiCalculation`,
`TheRememberedCalculation`, `ensure`, `equals` and `includes` vocabulary for both providers. It
compares only required semantics and human-readable observations—not native Actor objects,
timestamps, report bytes or feature sets. A deliberate final assertion failure proves original
error propagation. This proof is REST-only; the browser and generated BDD suite remain hand-baked.

Run the bounded proof directly with `npm run test:provider-contract`. Its executable source of
scope is `providerContractProfile.ts`, which locks two provider IDs, two REST case IDs, expected
request/result semantics and protected domain descriptions. `npm run verify` runs those 9 checks
once, then the separately selected 42-test remainder.

This is intentionally not a provider switch. There is no environment toggle or registry, native
objects never cross provider boundaries, and no report/timestamp/screenshot parity is claimed.
ADR 0003 records these limits and the trigger for any future widening.

## File Responsibilities

- `tests/calculatorSteps.ts`: translates Gherkin phrases into Screenplay actions.
- `tests/calculatorFixtures.ts`: owns scenario creation and completion for the BDD runner.
- `tests/calculatorTasks.ts`: captures calculator business activities.
- `tests/calculatorInteractions.ts`: performs browser mechanics.
- `tests/calculatorQuestions.ts`: reads API and UI outcomes.
- `tests/screenplayApiClient.ts`: adapts Playwright API requests to Screenplay HTTP.
- `tests/screenplayBrowseTheWeb.ts`: grants actors the ability to use a browser page.
- `tests/screenplay/calculatorScreenplay.ts`: defines Calculator-owned portable Actor, Activity,
  Question, ability, REST, memory, expectation, and lifecycle contracts.
- `tests/screenplay/screenplayProviderGateway.ts`: statically selects the provider and binds the REST
  and browser profiles.
- `tests/screenplay/handBakedScreenplayProvider.ts`: the only test module importing
  hand-baked runtime classes; translates Calculator contracts and native Stage events.
- `tests/screenplay/promiseNativeScreenplayProvider.ts`: independent Calculator-owned Promise
  scheduler used only by the bounded provider proof.
- `tests/screenplay/providerContractProfile.ts`: executable two-provider/two-case scope metadata and
  protected Calculator descriptions.
- `tests/calculatorProviderConformance.spec.ts`: dedicated import of the provider's exported
  conformance kit and translation to both Calculator adapters.
- `tests/calculatorProviderContract.spec.ts`: shared dual-provider REST contract profile.
