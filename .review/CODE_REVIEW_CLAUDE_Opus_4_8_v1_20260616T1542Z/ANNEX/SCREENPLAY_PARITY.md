# Annex: Screenplay Parity

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)
**Date:** 2026-06-16T15:42Z

This annex records how faithfully the project applies the Screenplay primitives and how cleanly it
consumes the sibling `hand-baked-screenplay-pattern` library.

## Primitive-by-primitive

| Primitive | Source | Usage in this project | Verdict |
|---|---|---|---|
| Actor | library, via `Stage.actor(name)` | `Ada`, named in Gherkin, built per scenario ([tests/calculatorSteps.ts](../../../tests/calculatorSteps.ts) lines 112-126) | Idiomatic |
| Ability | library `Ability` base | `BrowseTheWeb` (own, [tests/screenplayBrowseTheWeb.ts](../../../tests/screenplayBrowseTheWeb.ts)); `MakeRequests`/`ManageData` (library) | Idiomatic; clean own/library split |
| Task | library `Task.where` | `Calculate.usingTheApi/usingTheBrowser/shouldHaveBeen...` ([tests/calculatorTasks.ts](../../../tests/calculatorTasks.ts)) | Named in domain language; strong |
| Interaction | library `Interaction.where` | `OpenTheCalculator`, `EnterTheCalculation`, `SubmitTheCalculation` ([tests/calculatorInteractions.ts](../../../tests/calculatorInteractions.ts)) | Mechanics correctly isolated here |
| Question | library `Question.about` | `TheApiCalculation.result/errorDetails`, `TheDisplayedCalculation.message` ([tests/calculatorQuestions.ts](../../../tests/calculatorQuestions.ts)) | Named by intent, not DOM |
| Ensure + matchers | library `Ensure`, `equals`, `includes` | assertions in steps and tasks | Idiomatic |
| Cast / Stage | library | per-scenario actor wiring ([tests/calculatorSteps.ts](../../../tests/calculatorSteps.ts) lines 112-126) | Correct |
| HTTP primitives | library `Send`, `LastResponse`, `Remember`, `MakeRequests` | API task composition ([tests/calculatorTasks.ts](../../../tests/calculatorTasks.ts) lines 25-35) | Reused, not reimplemented |

## Consumer relationship with the sibling library

- The project supplies exactly two adapters of its own -- `BrowseTheWeb` (a Playwright `Page`
  ability) and `PlaywrightApiClient` (an `HttpClient` implementation,
  [tests/screenplayApiClient.ts](../../../tests/screenplayApiClient.ts)) -- and reuses everything
  else from the library. This is the right boundary: the project owns its transport bindings, the
  library owns the grammar.
- `PlaywrightApiClient implements HttpClient` proves the library's transport abstraction is real:
  the same `Send.a(...)` interaction drives Playwright's `APIRequestContext` here and a fake
  transport in the library's own examples (noted in the file's header comment).
- No Screenplay primitives are copied into this repo (confirmed: `tests/` contains only glue and
  adapters, no re-implemented `Task`/`Question`/`Ability` engine), matching the SCREENPLAY.md
  claim.

## Smells checklist (from docs/screenplay-flow-through-the-sut.md)

- Step definitions full of selectors/HTTP parsing? **No** -- steps only translate and wire actors
  ([tests/calculatorSteps.ts](../../../tests/calculatorSteps.ts)).
- Tasks named after mechanics? **No** -- `Calculate.usingTheBrowser` is intent-named.
- Questions named after DOM? **No** -- `TheDisplayedCalculation.message`, not `GetResultText`.
- Actors with too many unrelated abilities? **No** -- API actors get `MakeRequests`+`ManageData`;
  UI actors get `BrowseTheWeb`+`ManageData`.
- BDD duplicating every unit/API case through the browser? **No** -- two UI scenarios only;
  arithmetic breadth stays in lower layers.

The project passes its own smell checklist.

---

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z.md)
