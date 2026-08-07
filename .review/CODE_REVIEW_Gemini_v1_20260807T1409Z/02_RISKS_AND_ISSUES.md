# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_Gemini_v1_20260807T1409Z.md) | [Next: Project Review ->](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md)

---

### Risk 1: Step-level `Stage` re-instantiation in `calculatorSteps.ts` limits multi-actor orchestration

- **Risk Description:** Step definition helpers `actorWhoCanUseTheApi` and `actorWhoCanUseTheBrowser` instantiate a new `Stage` (`new Stage(...)`) and `Cast` every time a step is invoked.
- **Evidence Outline:** `tests/calculatorSteps.ts` (lines 124-138).
- **Impact Analysis:** While single-actor scenarios function because `this.actor` is preserved in the scenario world, instantiating new stages per step isolates actors onto separate stage instances. This prevents multi-actor collaboration in a shared stage and bypasses centralized stage management.
- **Refactor Recommendation:** Instantiate a scenario-scoped `Stage` inside a scenario `Before` hook or world constructor, allowing steps to retrieve actors via `stage.actor(name)`.

---

### Risk 2: Duplicated `isUiOperator` guard in `uiController.ts` uses type-casting instead of runtime contract validation

- **Risk Description:** `uiController.ts` defines a local `uiOperators` array with `satisfies readonly CalculatorOperator[]` and casts it at runtime (`uiOperators as readonly string[]`) in `isUiOperator`, duplicating `isCalculatorOperator` from `calculatorContracts.ts`.
- **Evidence Outline:** `src/uiController.ts` (lines 22-23, 111-113) vs `src/calculatorContracts.ts` (lines 32-37).
- **Impact Analysis:** Comment lines 15-21 explain why runtime ES imports of `calculatorContracts.js` fail under static asset serving. However, maintaining separate frontend operator lists introduces subtle drift risk if static asset routes are modified in future.
- **Refactor Recommendation:** Expose shared contracts on a dedicated static route (e.g., `/calculatorContracts.js`), allowing `uiController.ts` to import `isCalculatorOperator` directly at runtime.

---

### Risk 3: Sibling checkout preflight relies on relative parent path without environment validation

- **Risk Description:** `scripts/preflight-screenplay.mjs` verifies the existence of `../hand-baked-screenplay-pattern` relative to the local repository root.
- **Evidence Outline:** `scripts/preflight-screenplay.mjs` (line 13).
- **Impact Analysis:** If the repository is checked out in a non-standard nested directory structure, preflight script checks fail unless the sibling is placed at the exact relative parent path.
- **Refactor Recommendation:** Check an optional `SCREENPLAY_LIB_PATH` environment variable first before falling back to `../hand-baked-screenplay-pattern`.

---

### Risk 4: CI workflow checks out unpinned floating branch (`ref: main`) for sibling dependency

- **Risk Description:** Workflows `.github/workflows/ci.yml` and `.github/workflows/pages.yml` pull the sibling repository using floating `ref: main`.
- **Evidence Outline:** `.github/workflows/ci.yml` (line 50).
- **Impact Analysis:** Commits pushed to `hand-baked-screenplay-pattern` main branch could break CI runs in `calculator-screenplay-bdd` without code changes in this repository.
- **Refactor Recommendation:** As noted in backlog item CAL-04 (deferred for teaching pair co-development), pin the sibling repository checkout to a specific release tag or commit SHA when external stability is required.

---

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_Gemini_v1_20260807T1409Z.md) | [Next: Project Review ->](03_PROJECT_REVIEWS/PROJECT_001_calculator-screenplay-bdd.md)
