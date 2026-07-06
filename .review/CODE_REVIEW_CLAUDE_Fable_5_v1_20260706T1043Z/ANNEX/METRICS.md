# Annex: Metrics, Dependency and Security Evidence

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1043Z.md)

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-06T10:43Z

Raw evidence backing [02_RISKS_AND_ISSUES.md](../02_RISKS_AND_ISSUES.md) and the coverage counts
in [04_CROSS_PROJECT_ANALYSIS.md](../04_CROSS_PROJECT_ANALYSIS.md). All commands were run on
2026-07-06 against `main` at `2a9fe0b`.

## Commands run (and deliberately not run)

Run:

- `git status --short` - clean tree.
- `git log --oneline -10` - history through PR #10.
- `rg --files` - 30 tracked source/doc files (hidden dotfiles such as `.npmrc`, `.gitignore`,
  and `.github/workflows/ci.yml` enumerated separately).
- `npm audit` (and `npm audit --json`) - registry advisory lookup resolved from
  `package-lock.json` only; no compilation, no test execution, no access to the sibling checkout.
- `gh pr list --state open` - PR #11 open (backlog v7 reconcile).

Deliberately **not** run (registry coupling constraint): `npm run verify`, `npm run typecheck`,
`npm run build`, `npm test`, `npm run bddgen`, `npm run prepare:screenplay`. All of these either
build inside, or read the built output of, the sibling `hand-baked-screenplay-pattern` working
tree, which was under concurrent review by another agent at review time. Suite-green claims in
this review therefore cite the CHANGELOG/backlog/CI record, not a fresh local run.

## npm audit output (2026-07-06)

```text
# npm audit report

esbuild  0.27.3 - 0.28.0
esbuild allows arbitrary file read when running the development server on Windows
- https://github.com/advisories/GHSA-g7r4-m6w7-qqqr
fix available via `npm audit fix`
node_modules/esbuild            <- reached only via tsx (unused, see Risk 3)

uuid  <11.1.1
Severity: moderate
uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided
- https://github.com/advisories/GHSA-w5hq-g745-h8pq
fix available via `npm audit fix --force`
Will install playwright-bdd@9.2.0, which is a breaking change
node_modules/@cucumber/gherkin-utils/node_modules/uuid
node_modules/uuid
  @cucumber/messages  <=28.1.0     (depends on vulnerable uuid)
    @cucumber/gherkin  <=34.0.0    (depends on vulnerable @cucumber/messages)
      @cucumber/gherkin-utils  <=10.0.0
      playwright-bdd  7.0.0-0 - 8.5.1

6 vulnerabilities (1 low, 5 moderate)
```

All six advisories sit in `devDependencies` chains. The application itself has **one** dependency
(the `file:../` Screenplay library, which is itself dependency-free) and **zero** vulnerable
runtime packages.

## Dependency snapshot (declared vs locked)

| Package | Declared ([package.json](../../../package.json)) | Locked | Note |
|---|---|---|---|
| hand-baked-screenplay-pattern | `file:../hand-baked-screenplay-pattern` | (link) | Runtime; unpinned by design (ADR 0001) |
| @playwright/test | ^1.53.0 | 1.60.0 | Current line; healthy |
| playwright-bdd | ^8.0.0 | 8.5.1 | One major behind (9.2.0); carries the moderate chain |
| typescript | ^5.7.0 | 5.9.3 | Current line |
| tsx | ^4.20.0 | 4.22.4 | **Unused**; sole path to the esbuild advisory |
| @types/node | ^22.10.0 | 22.19.20 | Node 22 types vs Node 20 CI - cosmetic skew |

Lockfile freshness: consistent with the declared ranges (no stale pins); `package-lock.json` is
committed and used by CI via `npm ci`.

## Security pass (beyond the audit)

- **Secrets:** none found in the tree; CI uses only the default `GITHUB_TOKEN` with
  `permissions: contents: read` ([.github/workflows/ci.yml](../../../.github/workflows/ci.yml)
  lines 18-19). No `.env` committed (and it is git-ignored).
- **Injection/unsafe input:** the static-asset handler is an exact-match allowlist
  ([src/calculatorHttpServer.ts](../../../src/calculatorHttpServer.ts) lines 166-168) - no path
  concatenation from user input, so no traversal surface. JSON parsing failures are caught and
  mapped to 400. The UI writes only `textContent`/`value`, never `innerHTML`
  ([src/uiController.ts](../../../src/uiController.ts) lines 93-103) - no XSS sink.
- **Unbounded input:** request bodies are buffered without a size cap (Risk 7, informational for
  a loopback teaching server).
- **Licence:** none declared anywhere (Risk 2) - `package.json` has no `license` field and no
  `LICENSE` file exists.

## Test inventory (static count on `main`)

| Layer | File | Checks |
|---|---|---|
| Unit (pure domain) | [tests/domain.spec.ts](../../../tests/domain.spec.ts) | 7 tests (4 originals + 3 CAL-05 boundary-value) |
| Integration (REST) | [tests/api.spec.ts](../../../tests/api.spec.ts) | 6 tests (health+OpenAPI, 200, 400 contract, 422, 400 malformed JSON, 404) |
| BDD (API) | [features/calculator-api.feature](../../../features/calculator-api.feature) | 2 scenarios |
| BDD (UI, Desktop Chrome) | [features/calculator-ui.feature](../../../features/calculator-ui.feature) | 2 scenarios |
| **Total** | | **17 executable checks** |

Status-code coverage: 200, 400 (both branches), 404, 422 all asserted; 500 unreachable by
construction and untested (acceptable). UI `data-state` coverage: `success` and `error` asserted;
`idle` is the untested initial/reset state.

---

[Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1043Z.md)
