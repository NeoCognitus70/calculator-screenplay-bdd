# Recommendations

[<- Back to Index](00_CODE_REVIEW_Gemini_v1_20260807T1409Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

---

## Recommended Refactors

- **Refactor Stage Lifecycle in Step Definitions:** Update `tests/calculatorSteps.ts` to manage a scenario-scoped `Stage` via Cucumber/Playwright-BDD hooks rather than creating new `Stage` instances per step call.
- **Expose Shared Contracts for Frontend:** Add `/calculatorContracts.js` to the HTTP server's static asset allow-list so `uiController.ts` can import `isCalculatorOperator` at runtime instead of duplicating the operator array.
- **Enhance Preflight Script Configuration:** Add support for a `SCREENPLAY_LIB_PATH` environment variable in `scripts/preflight-screenplay.mjs` to support custom repository layouts.

## Next Steps

- Maintain the current zero-outstanding backlog state (`docs/backlog.md`).
- Periodically run `npm audit` to ensure devDependencies (`@playwright/test`, `playwright-bdd`) remain free of security vulnerabilities.
- Keep GitHub Pages deployment (`pages.yml`) active for the static API reference.

## Future Project Ideas

- **Multi-Tenant / Session Isolation:** Introduce session headers or worker-isolated server instances to allow parallel Playwright test execution (`fullyParallel: true`).
- **OpenAPI Schema Validation Middleware:** Add lightweight runtime JSON schema validation (e.g. via `Ajv`) to automatically validate incoming POST bodies against `openApiDocument.ts`.
- **Extended Operator Support:** Add support for exponentiation or square root operators to demonstrate adding new operations across domain, API, contract, and BDD layers.

---

[<- Previous: Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_Gemini_v1_20260807T1409Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)
