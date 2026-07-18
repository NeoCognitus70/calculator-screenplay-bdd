# ANNEX: Metrics and Validation Evidence

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md)

**Reviewer:** AI assistant (CLAUDE_Fable_5)
**Date:** 2026-07-18T00:32Z

Raw evidence for the claims made in the review. All commands were run on 2026-07-17/18 (UTC)
against `main` at `4b3f223` with a clean working tree.

## Repository state

```text
$ git log --oneline -5
4b3f223 Merge pull request #15 from NeoCognitus70/worklist/cal-06-contract-drift-guard
4b31dc1 docs(CAL-14): reconcile backlog v8 -> v9 and prune merged/stale branches
f52e72c fix(CAL-12): close the write-only Remember loop
23cbbdb fix(CAL-11): total the UI controller's error handling
d809428 test(CAL-06): guard the OpenAPI operator enum against domain-contract drift

$ git status --short
(clean)

Tracked files: 59 (git ls-files). Branches: main only (stale worklist branches pruned per CAL-14).
```

## GitHub state (API, 2026-07-18)

```text
$ gh api repos/NeoCognitus70/calculator-screenplay-bdd
  {"private": false, "visibility": "public", "default_branch": "main", "license": "Apache-2.0"}

$ gh api repos/NeoCognitus70/calculator-screenplay-bdd/rulesets
  [{"name": "main: PR + verify (Node 20)", "enforcement": "active", "target": "branch"}]

$ gh pr list --state open
  (none)

$ gh api repos/NeoCognitus70/calculator-screenplay-bdd/dependabot/alerts | length
  0

$ gh run list --limit 3   (all conclusion: success)
  29581023044  main                                  (merge of PR #15)
  29542164951  worklist/cal-06-contract-drift-guard
  29541880920  worklist/cal-06-contract-drift-guard
```

## Sibling coupling constraint (what was and was not run)

Per the registry coupling note, `prepare:screenplay` (which runs `npm ci && npm run build`
**inside** `../hand-baked-screenplay-pattern`) was **not** executed. Read-only checks instead:

```text
../hand-baked-screenplay-pattern/package.json  present
../hand-baked-screenplay-pattern/dist/         populated (abilities/, crew/, errors/,
                                               expectations/, index.d.ts, ...)
git -C ../hand-baked-screenplay-pattern status --porcelain   (clean, before AND after verify)
git -C ../hand-baked-screenplay-pattern log --oneline -1     77e6df6
```

Because the sibling was already built, the in-repo registry gate could run without any
cross-tree build.

## Validation commands and results

| Command | Result |
|---|---|
| `npm audit` | **found 0 vulnerabilities** |
| `npm run verify` (preflight `--built` + typecheck + build + `bddgen` + full Playwright suite) | **18 passed (1.8m)**, 0 failed, 0 skipped |
| Sibling tree re-check after verify | clean (untouched) |

Test-by-test (from the verify run, `--workers=1`):

```text
unit-and-api  api.spec.ts        7 passed  (health+contract, valid calc, 400 contract,
                                            422 divide-by-zero, 400 malformed JSON,
                                            404 unknown route, CAL-06 enum drift guard)
unit-and-api  domain.spec.ts     6 passed  (four operations, validation, divide-by-zero,
                                            negative boundaries, large product, 1/3)
unit-and-api  uiController.spec.ts 1 passed (CAL-11 aborted-fetch settles to error state)
bdd           calculator-api     2 passed  (add via REST, reject divide-by-zero)
bdd           calculator-ui      2 passed  (multiply in browser, divide-by-zero explanation)
```

## Suite and source size

| Metric | Value |
|---|---|
| Playwright tests | 18 (6 unit, 7 API, 1 UI controller, 4 BDD) |
| Feature files / scenarios | 2 files, 4 scenarios, 4 Rules |
| Step definitions | 5 (2 When, 3 Then + 1 error-include Then) in one file |
| Production modules (`src/`) | 7 files |
| Test/glue modules (`tests/`) | 9 files (3 specs + 6 Screenplay/adapters) |
| Runtime dependencies | 1 (`file:../hand-baked-screenplay-pattern`, itself dependency-free) |
| Dev dependencies | 4 (`@playwright/test`, `@types/node`, `playwright-bdd`, `typescript`) |

## Dependency and licence pass

- `npm audit`: 0 vulnerabilities (full tree). Production surface: zero registry dependencies.
- Declared licence: `Apache-2.0` in [package.json](../../../package.json) (line 5) with the
  canonical text in `LICENSE`; GitHub licence detection concurs. README documents the licence
  boundary with the independently licensed sibling.
- Lockfile: `package-lock.json` present, regenerated during the P-07 remediation (2026-07-14);
  `npm ci` documented as the install command. No secrets found in the tree; the only network
  surfaces are localhost HTTP in tests and the GitHub/npm endpoints in CI.
- No CVE claims are made in this review beyond the zero-findings audit output above.

---

[Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md)
