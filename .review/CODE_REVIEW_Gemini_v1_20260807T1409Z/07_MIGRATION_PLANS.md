# Migration Strategy & Plans

[<- Back to Index](00_CODE_REVIEW_Gemini_v1_20260807T1409Z.md)

---

## 1. Single Source of Truth for Features

- **Current State:** Gherkin feature files live in `features/` and step definitions live in `tests/calculatorSteps.ts`.
- **Target State:** Maintain current layout as the canonical source of truth for executable specifications.
- **Migration Action:** Ensure any new feature scenario is added directly to `features/*.feature` and step glue updated in `tests/calculatorSteps.ts`.
- **Validation:** Running `npm run bddgen` generates Playwright specs in `features/.features-gen/`.

## 2. Docker Compose for Local Development

- **Current State:** The application is lightweight and runs directly via `node dist/startServer.js` (or `npm run dev`).
- **Target State:** Optional `docker-compose.yml` for isolated containerized execution.
- **Migration Action:** Create a multi-stage `Dockerfile` using `node:20-alpine` and a lightweight `docker-compose.yml` exposing port 3100.
- **Validation:** Verify container health via `curl http://localhost:3100/health`.

## 3. GitHub Actions / Workflow

- **Current State:** CI workflow (`.github/workflows/ci.yml`) runs `npm run verify` on Node 20; Pages workflow (`.github/workflows/pages.yml`) deploys static API reference on push to `main`.
- **Target State:** Complete, secure CI/CD pipeline.
- **Migration Action:** Maintain existing workflows. When sibling dependency stability is desired, update checkout refs from `main` to pinned release SHAs.
- **Validation:** GitHub Actions status badges remain green on PRs and `main`.

---

[<- Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_Gemini_v1_20260807T1409Z.md)
