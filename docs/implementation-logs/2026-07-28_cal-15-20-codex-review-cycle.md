# Fourth review-derived cycle (Codex GPT-5 v1, CAL-15..20) — 2026-07-28

## Session Summary

Actioned the fourth code review (Codex GPT-5 v1) end-to-end: its two MEDIUM and three LOW findings
plus a governance item became worklist items CAL-15..20 and were delivered one per `loop-worklist`
iteration on the **coupled loop** (Calculator consumes `hand-baked-screenplay-pattern` via
`file:../`, rebuilt each iteration). All six landed across PRs #23–#28, every merge CI-gated on
`verify (Node 20)`. The suite grew **19 → 42** Playwright tests, `docs/backlog.md` was reconciled to
**v13 / zero outstanding**, and the running app was verified live (valid calc, blank-operand
rejection, `415`, OpenAPI `0.2.0`). Resulting state: `main` at `7b06e52`, clean, green, no open work.

---

## Objectives

1. ✅ CAL-15 — Record the review in the backlog and settle its two policy questions (governance).
2. ✅ CAL-16 (MEDIUM) — Single-source the release version and guard against drift.
3. ✅ CAL-17 (MEDIUM) — Reject blank browser operands instead of coercing them to zero.
4. ✅ CAL-18 (LOW) — Centralise strict full-string port parsing across the app and Playwright config.
5. ✅ CAL-19 (LOW) — Enforce the JSON media type with a `415` contract path.
6. ✅ CAL-20 (LOW) — Reject bind failures in `listen()`; reconcile the backlog to zero outstanding.

---

## Test Results

Coupled `npm run verify` (typecheck + build + Playwright), Node 20, run fresh after every item;
final run on `main` `7b06e52`.

| Stack | Suite | Before | After | Status |
|---|---|---|---|---|
| TypeScript / Playwright | `unit-and-api` + `bdd` (whole suite) | 19/19 | 42/42 | ✅ PASS |
| — live app (manual) | UI valid calc, CAL-17 blank→error, CAL-19 415/charset, CAL-16 OpenAPI 0.2.0 | — | verified | ✅ PASS |

`npm audit` reported 0 vulnerabilities throughout. Live checks captured against the running server
(`http://127.0.0.1:3100`): `7 + 5 = 12` (success); blank left operand → `data-state="error"`,
"Enter finite numbers for both operands."; `text/plain` POST → `415 Unsupported Media Type`;
`application/json; charset=utf-8` POST → `200` `2 * 4 = 8`; `/openapi.json` `info.version` = `0.2.0`
with a `415` response documented.

---

## Changes Implemented

### CAL-15 — Governance: open the cycle in the backlog

**Files changed:**
- `docs/backlog.md` — v11 → v12: recorded CAL-16..20 as Open with severities/dependencies; settled
  two owner-confirmed policies (API version tracks the package release, no ADR; blank operands are
  invalid input, never zero); corrected the stale "no outstanding items" claims. (`dcffcba`, PR #23)

### CAL-16 — Single-source the release version with a drift guard

**Files changed:**
- `package-lock.json` — root version fields `0.1.0 → 0.2.0` via `npm install --package-lock-only`
  (package tooling; no dependency-resolution change).
- `src/openApiDocument.ts` — `info.version` `0.1.0 → 0.2.0` (tracks the package release).
- `tests/api.spec.ts` — a deterministic test asserting `package.json` == lockfile root (both fields)
  == OpenAPI `info.version`. (`f0c997c`, PR #24)

### CAL-17 — Reject blank browser operands

**Files changed:**
- `src/uiController.ts` — `readNumber` rejects trimmed-empty operands as *missing* before `Number(...)`
  (`Number('')`/`Number('  ')` are `0`); the shared operator guard could not be imported (browser
  entry module, see Technical Decisions), so a local `uiOperators` literal is tied to
  `CalculatorOperator` via `satisfies` for a compile-time drift check.
- `tests/uiController.spec.ts` — decision-table browser test (blank-left, blank-right, zero, decimal).
  (`223af85`, PR #25)

### CAL-18 — Centralise strict port parsing

**Files changed:**
- `src/parsePort.ts` (new) — accepts only `/^\d+$/` naming an integer in `[1, 65535]`; error states
  the accepted format.
- `src/environment.ts` — `readPort` deleted; calls `parsePort`.
- `playwright.config.ts` — unchecked `Number.parseInt` replaced with `parsePort`.
- `tests/parsePort.spec.ts` (new) — table-driven (`1`, `65535`, `0`, `65536`, `1.5`, `1e3`,
  `3100abc`, blank, whitespace, signed, padded). (`8c264e5`, PR #26)

### CAL-19 — Enforce the JSON media type + `415`

**Files changed:**
- `src/calculatorHttpServer.ts` — `isJsonContentType` guard in `handleCalculation` runs *before*
  the body is read; missing/unsupported type → `415` + the standard `ApiErrorResponse` shape. The
  `413`/`400`/`422` paths are untouched.
- `src/openApiDocument.ts` — documents the `415` response.
- `tests/api.spec.ts` — charset → 200, missing type → 415, `text/plain` → 415. (`f0301e4`, PR #27)

### CAL-20 — `listen()` rejects bind failures + cycle close-out

**Files changed:**
- `src/calculatorHttpServer.ts` — `listen()` attaches one-shot `listening`/`error` handlers (each
  removing the other) so a failed bind (`EADDRINUSE`) rejects the promise instead of surfacing as an
  uncaught event; no listener leak; success/close unchanged.
- `tests/serverLifecycle.spec.ts` (new) — binds an ephemeral port, attempts a colliding second bind,
  asserts the controlled rejection with no leak.
- `docs/backlog.md` — v12 → **v13**: CAL-16..20 relocated under Resolved Risks; Risk Summary → zero
  outstanding. (`d643913`, PR #28)

---

## Technical Decisions

| Decision | Rationale | Alternatives rejected |
|---|---|---|
| OpenAPI `info.version` tracks the package release (0.2.0); no independent API version | Owner-confirmed pre-loop; simplest, and CAL-16's drift test enforces it | An independently versioned API (would need an ADR + a policy; not warranted for a tiny teaching API) |
| Blank/whitespace browser operands are rejected as *invalid input* | Owner-confirmed; `Number('')===0` silently calculated zero, contradicting the accessible-feedback contract | Keeping the implicit `Number('')` coercion; native `required` bubbles (the form is `novalidate` so the controller owns feedback) |
| `uiController.ts` imports **types only** from sibling modules; local operator literal tied to `CalculatorOperator` via `satisfies` | The module is served to the browser as a standalone ES file via the server's static allow-list; a runtime import of `calculatorContracts.js` 404s and breaks the whole UI (it broke every UI test when tried) | Importing the shared `isCalculatorOperator` guard (CAL-17's "where practical" clause — not practical here); serving the contracts module (would drag its transitive graph into the browser) |
| Count reconciliation deferred to the last item (CAL-20) | Each item marked only its own backlog entry; reconciling the Risk Summary per-item would make parallel PRs fight over the counter | Reconciling on every item |

No new ADR was created — none of these are structural in the ADR-0001 sense (the sibling-checkout
dependency remains the single architectural decision). They are recorded in the backlog's "Decisions"
block and here.

---

## Documentation Updates

- `docs/backlog.md` — v11 → v12 (CAL-15) → **v13** (CAL-20): cycle recorded, policies settled, all
  items resolved and relocated under Resolved Risks, zero outstanding.
- `CHANGELOG.md` — `[Unreleased]` gained five append-only entries (CAL-16..20).
- `src/openApiDocument.ts` — `info.version` corrected; `415` response documented (docs-as-code).
- `docs/templates/implementation-log.template.md` (new) — copied in from the portfolio template on
  first use of an implementation log for this project.

---

## Lessons Learned

- **A browser entry module served as a standalone file must import only *types* from siblings.** A
  runtime import 404s on the unserved module and breaks the whole UI — the compiled JS silently
  gains an `import` the browser can't resolve. Tie any duplicated local constant to the shared type
  via `satisfies` for a compile-time drift check instead.
- **The coupled loop needs an exclusive session and prompt merges.** Each iteration rebuilds the
  sibling, so no other agent may touch either tree; and per-item PRs all edit `CHANGELOG [Unreleased]`
  — merge in numeric order (keep both sides) and merge promptly.
- **Calculator merges are CI-gated, and a merge-commit re-triggers CI.** After resolving a conflict
  and pushing the merge commit, a *fresh* `verify (Node 20)` run starts; wait for it before
  `gh pr merge`, or the merge is refused as "requirements not met".
- **A `type="number"` input can't hold a non-numeric string**, so the UI "malformed input" case
  collapses to "blank"; defend non-finite input in depth (`Number.isFinite` + the server 400) rather
  than via a browser test that can't type `abc`.
- **Refresh a lockfile version with tooling, not a hand edit** — `npm install --package-lock-only`
  synced both root version fields with no dependency-resolution change.

These durable, stack-wide points are promoted into the session-notes handover v4 §5.

---

## Recommendations / Next Steps

- [ ] **`close-project` pass for calculator** — high priority. Fourth consecutive review closed with
  only additive/documentation-class fixes; zero open work (`docs/backlog.md` v13, 0 outstanding).
- [ ] Prune the merged `worklist/cal-15..20-*` remote branches — low priority, cosmetic.
- [ ] Watch the ADR-0001 revisit trigger (external consumer of the sibling library) — unchanged.

---

*Session logged: 2026-07-28. Author: Claude Code.*
