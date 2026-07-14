# P-04 Apache licence alignment — 2026-07-14

## Session summary

Implemented portfolio backlog P-04 decision D-05 after explicit owner approval. Calculator
Screenplay BDD now has canonical Apache License 2.0 terms, matching package/lock metadata, a README
licence boundary, and a documented relationship to its separately licensed sibling Screenplay
provider. Repository visibility remains private and unchanged. No application or test behaviour
changed.

---

## Objectives

1. ✅ Apply the owner-approved Apache-2.0 licence to original Calculator project material.
2. ✅ Align `package.json`, `package-lock.json`, README, and changelog signals.
3. ✅ Explain the provider/consumer boundary without relicensing the Hand-baked Screenplay project.
4. ✅ Verify canonical text, metadata consistency, and the full project gate.

---

## Scope boundary

- Original Calculator application, tests, and documentation: Apache-2.0.
- `hand-baked-screenplay-pattern`: a separate Apache-2.0 repository with its own authoritative
  `LICENSE`; consumed through the existing sibling `file:../` dependency.
- npm/Playwright development dependencies: retain their respective package terms.
- Repository visibility: still private; D-05 does not authorise or perform publication.

---

## Validation

| Check | Result | Status |
|---|---|---|
| Root `LICENSE` comparison | Exact canonical Apache-2.0 text after newline normalisation | ✅ PASS |
| Package/lock root metadata | Both resolve to `Apache-2.0` | ✅ PASS |
| Provider licence check | Hand-baked Screenplay default branch detected as `Apache-2.0` | ✅ PASS |
| `npm run verify` | Sibling preflight, TypeScript, build, BDD generation, and 16/16 Playwright tests passed | ✅ PASS |
| `npm pack --dry-run --json` | Root legal and README files included | ✅ PASS |
| `git diff --check` | No whitespace errors | ✅ PASS |

---

## Technical decisions

| Decision | Rationale | Alternatives rejected |
|---|---|---|
| Apache-2.0 for Calculator | Implements approved D-05 and aligns the tightly coupled teaching pair | Leaving the consumer unspecified; changing the already coherent provider |
| Describe rather than duplicate the provider licence | The sibling is not vendored and its own repository remains authoritative | Treating one repository's `LICENSE` as automatically covering the other |
| Keep visibility unchanged | Owner approval explicitly covered legal metadata, not publication | Making the private repository public as an incidental licensing step |

No ADR is required because the sibling consumption architecture remains unchanged.

---

*Session logged: 2026-07-14. Author: Codex, directed by Gary Brooks.*
