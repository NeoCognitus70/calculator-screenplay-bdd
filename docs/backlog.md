<!--
  AUDIENCE: Engineers, AI agents, and project leads maintaining work-in-progress tracking.
  PURPOSE:  Single source of truth for outstanding work, risks, and planning for this project.
  LOCATION: docs/backlog.md
  TEMPLATE: test-automation-portfolio/templates/backlog.template.md
-->

# Calculator Screenplay BDD — Backlog

**Version:** 19 — **CAL-24 COMPLETE** (2026-08-18): PR [#39](https://github.com/NeoCognitus70/calculator-screenplay-bdd/pull/39)
(`cfa4a0a`, merge `9bc20d3`) added the independent Promise-native adapter, truthfully translated
both adapters' lifecycle observations, passed all four exported conformance cases against each,
and proved the shared accepted/rejected REST slice with equivalent descriptions, ordering and
original failures. The suite grew 42 → 51 with no dependency, Gherkin or browser-default drift.
**CAL-25 is now the only open item.**

**Version:** 18 — **CAL-23 COMPLETE** (2026-08-18): PR [#38](https://github.com/NeoCognitus70/calculator-screenplay-bdd/pull/38)
(`66b839f`, merge `d7574c4`) introduced the Calculator-owned Screenplay seam, static hand-baked
gateway, scenario fixture and deterministic boundary guard. Actor construction left the step
definitions, the existing 42-test/Gherkin surface stayed unchanged, and exactly one provider owns
each REST/browser lifecycle. **CAL-24 is now the only valid starting item; CAL-25 remains
dependency-blocked.**

**Version:** 17 — **CAL-22 COMPLETE** (2026-08-18): the Calculator now consumes the immutable
provider v0.3.0 release artefact from a standalone checkout. PR [#37](https://github.com/NeoCognitus70/calculator-screenplay-bdd/pull/37)
(`4d15bc2`, merge `6c86ffc`) superseded ADR 0001 with ADR 0002, removed both workflows' moving
provider checkout and retired the sibling preflight/build path. The manifest/lock/decision guard,
standalone `npm ci`, 42/42 suite and zero-vulnerability audit are green. **CAL-23 is now the only
valid starting item; CAL-24..25 remain dependency-blocked.**

**Version:** 16 — **Provider-switching Phase 2 PROMOTED** (2026-08-18): the owner authorised the
Calculator proof described by the portfolio provider-switching viability assessment. Four required
MEDIUM items, `CAL-22..25`, are Open and must execute in dependency order: immutable provider
artefact → Calculator gateway → bounded alternate-provider REST proof → CI/evidence close-out. The
full suite remains hand-baked by default; runtime hot-switching, report parity, later consumer
migrations and framework replacement are outside this promotion.

**Version:** 15 — **CAL-21 COMPLETE** (2026-08-04): the deterministic static API reference is live at
<https://neocognitus70.github.io/calculator-screenplay-bdd/> (PRs #30 `faee931` + #31 `cd74df0`, Pages
run 30884443647) and linked from the portfolio landing page via a new typed `documentation` action,
closing landing **LAND-09C**. Back to **0 outstanding**; the fourth review-derived cycle below remains closed.

**Version:** 14 — opened **CAL-21** (planning-only): publish a deterministic, self-contained static
**API reference** rendered from `src/openApiDocument.ts` to GitHub Pages, to be linked from the
portfolio landing page (via a new typed `documentation` action) as its public-evidence slice
**LAND-09C**.

**Version:** 13 — **closes** the **fourth** review-derived cycle (Codex GPT-5 v1,
[`.review/CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z/`](../.review/CODE_REVIEW_CODEX_GPT_5_v1_20260723T2336Z/),
merged by PR [#22](https://github.com/NeoCognitus70/calculator-screenplay-bdd/pull/22)): CAL-15
(governance) plus **CAL-16..20** (review Risks 1–5) are all Resolved 2026-07-27 and moved under
**Resolved Risks** — **zero outstanding**. v12 opened the cycle and settled the two policy decisions
(see "Decisions" below). Risk 6 (Info) was not promoted.
**Last Updated:** 2026-08-18
**Based on:** `main` at `9bc20d3c97`, provider v0.3.0 at `58aa19261a`, the completed provider
backlog `HBSP-28..33`, and the status-updated portfolio assessment
[`hand-baked-screenplay-pattern-provider-switching-viability.md`](https://github.com/GBrooks1970/test-automation-portfolio/blob/main/project-specs/potential-project-outlines/hand-baked-screenplay-pattern-provider-switching-viability.md).

**Provider-switching Phase 2 decisions (owner-authorised 2026-08-18):**
- Provider selection is static at the build/profile composition boundary; no scenario-level or
  environment-variable runtime provider switch is introduced.
- The complete browser, REST and BDD suite continues to use hand-baked v0.3.0 by default. Only a
  representative REST contract profile runs against the alternate provider.
- One provider owns each Actor, every Activity and the lifecycle for a profile. Native objects from
  different providers are never mixed.
- The alternate profile must preserve domain wording, order, failure propagation, Questions,
  assertions and required observable information. Byte-identical output and report feature parity
  are explicit non-goals.
- The immutable v0.3.0 release artefact replaces the moving sibling `main` checkout as the CI proof
  baseline. CAL-22 superseded ADR 0001 with ADR 0002: the 2026-08-18 owner promotion explicitly
  replaced its earlier KISS/YAGNI deferral, and the provider now supplies the immutable release that
  decision previously lacked.
- This promotion authorises only `CAL-22..25`. Mobile Forex, Juice Shop, ParaBank, BFX, Sudoku,
  Serenity adapters and later portfolio phases remain outside this backlog.

**Decisions (owner-confirmed 2026-07-27, pre-loop — govern CAL-16/17):**
- **API version tracks the package release.** OpenAPI `info.version` follows `package.json` (0.2.0);
  no independent API-version policy and **no ADR** required for now. CAL-16 adds a static drift check
  that fails when package / lock-root / OpenAPI versions diverge under this policy.
- **Blank operands are invalid input, never zero.** The browser UI rejects null/empty/whitespace
  operands before `Number(...)` conversion (CAL-17); numeric zero, negatives and decimals stay valid.
- Preserved at that time: the accepted ADR 0001 sibling-checkout strategy (since superseded by
  ADR 0002 / CAL-22), the Node 20 required CI gate, and the existing `400`/`413`/`422` response
  semantics.

This backlog tracks outstanding work and risks for the calculator Screenplay/BDD demo project,
ordered by priority score (highest first). It is the project's **source of truth** for item
status — session handovers narrate; this file records.

**Priority Scoring System:**
- **Score = Security Impact (0–10) + Breakage Probability (0–10) + Maintenance Burden (0–10)**
- **HIGH (20–30):** Critical — immediate action required
- **MEDIUM (10–19):** Important — schedule within current sprint cycle
- **LOW (0–9):** Desirable — schedule when capacity allows

---

## Outstanding Risks

### Provider-switching Phase 2 (`CAL-22..25`) — PROMOTED 2026-08-18

**Delivery rule:** execute **CAL-22 → CAL-23 → CAL-24 → CAL-25**. CAL-22..24 are complete; execute
**CAL-25 next**. The sequence is both dependency-driven and score-ordered: establish a reproducible
provider baseline, create the consumer composition boundary, prove one bounded alternate
implementation, then make the proof a permanent gate and close the phase. Each item must remain
independently reviewable.

#### Item CAL-22: Pin the immutable provider artefact and supersede the moving-sibling proof — Score: 18

**Priority Score:** Security Impact (4) + Breakage Probability (8) + Maintenance Burden (6) =
**18 points (MEDIUM)**

**Origin:** Provider-switching viability assessment Phase 2 plus the Phase 1 packaging acceptance
criterion; owner promoted Phase 2 on 2026-08-18.

**Objective:** make Calculator's default hand-baked execution reproducible from its own checkout by
pinning the published v0.3.0 artefact instead of installing whatever happens to be in a sibling
provider worktree or on the provider's moving `main` branch.

**Acceptance criteria:**
- [x] Amend or supersede ADR 0001. Record the exact v0.3.0 release URL, version and published SHA-256
      (`ac5bd1f6d9bddf95c9a42f99f05f093c7875b1835ecd3ae0d5ca2385e810c36d`), the owner decision
      that supersedes the earlier deferral, and the local-development policy after pinning.
- [x] `package.json` and `package-lock.json` resolve one immutable v0.3.0 artefact with lockfile
      integrity; no dependency or CI step follows a branch, mutable sibling worktree or floating URL.
- [x] A clean standalone Calculator checkout can run the documented install and `npm run verify`
      path without cloning or building the provider repository. Retire or narrow
      `preflight:screenplay` / `prepare:screenplay` and update CI, README and contributor guidance to
      match the actual path.
- [x] The existing hand-baked browser, REST, BDD, API-doc and unit coverage remains green without
      domain or scenario wording changes; dependency/licence attribution remains correct.
- [x] Add a deterministic guard that fails if the manifest/lock/decision evidence drifts from the
      approved provider version or immutable source. **Type:** dependency + CI + test + ADR/docs.

**Status:** ✅ COMPLETE 2026-08-18 — PR #37 (`4d15bc2`, merge `6c86ffc`); independently reproduced
the published SHA-256, installed and verified from a provider-free standalone copy (42/42), and
reviewed `npm audit` at zero vulnerabilities. **Depends on:** completed provider `HBSP-33` / v0.3.0
release.

#### Item CAL-23: Put provider selection and Actor construction behind one Calculator gateway — Score: 17

**Priority Score:** Security Impact (2) + Breakage Probability (8) + Maintenance Burden (7) =
**17 points (MEDIUM)**

**Origin:** Provider-switching viability assessment Phase 2 step 1.

**Objective:** create one Calculator-owned composition boundary so domain-facing Tasks, Questions,
steps and adapters do not select or construct a concrete provider throughout the suite.

**Acceptance criteria:**
- [x] One clearly named Calculator gateway/composition module owns provider selection, Actor creation,
      Ability binding and per-scenario lifecycle creation for both REST and browser profiles.
- [x] Direct imports from `hand-baked-screenplay-pattern` are confined to the hand-baked adapter,
      the gateway's public type seam and dedicated provider/conformance tests. Domain Tasks,
      Questions and step definitions consume the Calculator-owned seam rather than selecting a
      provider themselves.
- [x] Actor construction is removed from `calculatorSteps.ts`; runner hooks/world setup request one
      scenario-scoped provider/Actor through the gateway, with exactly one lifecycle owner.
- [x] The full existing suite continues to run through the hand-baked adapter by default with
      unchanged Gherkin, Task/Question descriptions, assertions, test counts and Playwright evidence.
- [x] Provider choice is a build/test-profile composition decision, not a per-scenario environment
      toggle. No alternate provider is added in this item. **Type:** architecture refactor + tests + docs.

**Status:** ✅ COMPLETE 2026-08-18 — PR #38 (`66b839f`, merge `d7574c4`); the unchanged 42-test
suite, import/lifecycle boundary guard and zero-vulnerability audit passed. **Depends on:** CAL-22.

#### Item CAL-24: Prove the REST contract slice through an independent alternate provider — Score: 16

**Priority Score:** Security Impact (2) + Breakage Probability (7) + Maintenance Burden (7) =
**16 points (MEDIUM)**

**Origin:** Provider-switching viability assessment Phase 2 steps 2–4.

**Objective:** run a small but representative Calculator REST slice through the hand-baked adapter and
one independent Promise-native alternate provider without changing the slice's domain vocabulary or
assertion intent.

**Acceptance criteria:**
- [x] Add a Calculator-owned alternate provider adapter that does not reuse hand-baked native
      `Actor`, `Task`, `Question`, `Stage` or reporter classes at runtime. Keep it deliberately small;
      do not add Serenity/JS, Cypress, Cucumber or Playwright as provider-runtime dependencies.
- [x] Run the exported provider conformance cases against both Calculator adapters, truthfully
      translating their native lifecycle observations. Both prove ability/memory isolation,
      sync/async Questions, ordered execution, stop-on-failure, description preservation and
      exactly-once lifecycle outcomes.
- [x] Define one bounded REST contract profile containing at least a successful calculation and a
      rejected/failed calculation path. Execute the same Calculator-owned domain Tasks, Questions and
      assertions through both providers; do not duplicate or provider-prefix the domain wording.
- [x] Prove equivalent required observations: request/result semantics, ordering, original failure,
      assertion outcome and human-readable descriptions. Do not compare internal Actor objects,
      timestamps, byte output or report feature sets.
- [x] Keep the full browser/BDD suite on hand-baked only. The alternate profile cannot become the
      default or widen beyond the recorded REST slice in this item. **Type:** code + contract tests + docs.

**Status:** ✅ COMPLETE 2026-08-18 — PR #39 (`cfa4a0a`, merge `9bc20d3`); 51/51 tests and the
zero-vulnerability audit passed with the alternate confined to the REST proof. **Depends on:**
CAL-23.

#### Item CAL-25: Gate and publish the bounded provider-switching proof — Score: 14

**Priority Score:** Security Impact (2) + Breakage Probability (6) + Maintenance Burden (6) =
**14 points (MEDIUM)**

**Origin:** Provider-switching viability assessment Phase 2 acceptance and evidence close-out.

**Objective:** make the Phase 2 proof reproducible in the normal project gate, document exactly what
was and was not proved, and close the phase only after main-branch CI evidence exists.

**Acceptance criteria:**
- [ ] Add a named provider-contract command/profile that runs both conformance adapters and the
      dual-provider REST slice; wire it into `npm run verify` and the required Node 20 CI job without
      duplicating the full Playwright/BDD suite.
- [ ] Guard the hand-baked full-suite default and the bounded alternate profile against silent scope
      drift: provider count, selected REST cases and unchanged domain descriptions are asserted from
      executable metadata rather than copied prose.
- [ ] Update README, `SCREENPLAY.md`, architecture documentation, ADR index/decision, CHANGELOG and
      this backlog with the pinned artefact, gateway, profile command, evidence, limitations and the
      explicit non-goals (runtime hot-switching, mixed native objects and report parity).
- [ ] `npm run verify` passes from a clean standalone checkout; `npm audit` is reviewed; the provider
      and Calculator worktrees remain clean; required CI on the implementation head is green and linked
      from the completion record.
- [ ] Only after CAL-22..25 are all complete, move them to Resolved Risks, reconcile the Risk Summary
      to zero, and record the Phase 2 completion date. Do not promote Phases 3–5 from this item.
      **Type:** test/CI + docs + close-out.

**Status:** Open — implementation branch locally and provider-free standalone verified at 9 named
provider checks + 42 remaining tests with zero audit findings. Required implementation-head and
merged-main CI links, final acceptance ticks, relocation and Phase 2 close-out remain deliberately
pending. **Depends on:** CAL-24.

---

#### Item CAL-21: Publish a static API reference (from `openApiDocument.ts`) to GitHub Pages — Score: 9 — ✅ COMPLETE 2026-08-04

**Priority Score:** Security Impact (1) + Breakage Probability (3) + Maintenance Burden (5) = **9 points**
**Origin:** Portfolio landing **LAND-09C** (third public-evidence slice, READY once LAND-09B closed
2026-08-04). Per the LAND-09 cross-repository delivery contract, this landing item does **not** by
itself authorise implementation here — this backlog entry is that authorisation. The landing
repository owns only the eventual link (through a new typed `documentation` action); this repository
owns the artefact, its generation, tests, workflow and Pages configuration.

**Objective:** Publish a static, self-contained **API reference** rendered from the project's
authoritative `src/openApiDocument.ts`, so a visitor can read the contract without cloning or
running the server. It is **documentation for the contract** — it is **not** a hosted calculator
API and must **not** call or claim to host `/health` or `/api/calculations`.

**Approved scope / decisions (do not re-litigate):**
- **Deterministic, dependency-free renderer, in `src/`.** A pure `renderApiReference(document): string`
  turns the OpenAPI object into one self-contained HTML document (inline CSS/JS only). No third-party
  renderer, **no unpinned CDN**, no new runtime dependency — consistent with the project's "tiny,
  hand-written contract, no generator dependency" ethos (see `openApiDocument.ts`).
- **Raw document exposed.** The generator also emits the raw `openapi.json` (a deterministic
  serialisation of `openApiDocument`) beside the reference, and the reference links to it. Because the
  server serves `openApiDocument` verbatim at `/openapi.json`, the emitted file **is** the served
  contract.
- **Drift-proof.** A verify-time check derives its expectations from `openApiDocument` and fails if
  the reference omits any path, operation, response code or schema (with its properties/enums), if the
  emitted `openapi.json` does not deep-equal the source, or if output is non-deterministic. Any change
  to the contract therefore forces the reference to change too.
- **Truthful framing.** The page states it is a **static reference generated from the committed
  contract**, is not a running service, and does not call the endpoints. Any illustrative
  request/response example is clearly labelled as illustrative and lives in the renderer, not in the
  contract (so the CAL-16 version/drift policy and `openApiDocument` are untouched).
- **Self-contained + no endpoint calls.** One HTML document, inline assets only, **no external
  `http(s)://` / `src=` / `href=` asset refs**, and **no `fetch`/XHR** to `/health` or
  `/api/calculations`. Checked automatically.
- **Publish only after checks pass on `main`.** A `pages.yml` workflow runs on `push` to `main`,
  reproduces the sibling-checkout layout (ADR 0001), builds, generates, runs the docs check, then
  deploys — deploy-only Pages permissions (`pages: write`/`id-token: write` on the deploy job only),
  nothing on pull requests. Playwright browsers are **not** needed for docs generation.

**Acceptance criteria:**
- [x] Pure `renderApiReference()` in `src/` + a deterministic emitter for `openapi.json`; a
      verify-time check derives from `openApiDocument` and fails on any missing path/operation/response/
      schema, on `openapi.json` not deep-equalling the source, on non-determinism, on any external asset
      ref, or on any `fetch`/call to the endpoints. **`src/apidocs/renderApiReference.ts` +
      `src/apidocs/generateApiDocs.ts` (typed seam) + `scripts/check-api-docs.mjs`; the check is wired
      into `npm run verify`. `check-api-docs: PASS` locally (deterministic, contract-faithful,
      self-contained, 7640 bytes).**
- [x] A generator script writes `openapi.json` + a self-contained `index.html` from built `dist/`.
      **`scripts/generate-api-docs.mjs` (plain Node, no new dep) + `npm run docs:api`; wrote
      `index.html` 7640 bytes + `openapi.json` 3896 bytes. `docs-site/` is gitignored (produced in CI).**
- [x] `pages.yml` deploys on `push` to `main` after the build + docs check, with deploy-only Pages
      permissions and no deployment on pull requests. **`.github/workflows/pages.yml`: reproduces the
      ADR 0001 sibling layout, `build` runs `prepare:screenplay` + build + check + generate + upload;
      `deploy` alone holds `pages: write`/`id-token: write`; `push`/`workflow_dispatch` only; no
      Playwright browsers.**
- [x] Repository Pages configured for GitHub Actions publication; the canonical public URL documented
      in README with the "static reference, not a hosted API" wording. **Pages enabled (source =
      GitHub Actions); README documents <https://neocognitus70.github.io/calculator-screenplay-bdd/>
      with the static-reference wording.**
- [x] The public URL returns HTTP 200, is self-contained and renders with no console errors at desktop
      and 390px; a separate landing PR then adds a new typed `documentation` action linking it.
      **Verified 2026-08-04:** PRs #30 (`faee931`) + #31 (`cd74df0`) merged; Pages
      [run 30884443647](https://github.com/NeoCognitus70/calculator-screenplay-bdd/actions/runs/30884443647)
      green; the public URL and its `openapi.json` return HTTP 200, self-contained (banner + all
      endpoints/schemas + illustrative example), no console errors. The landing "API reference"
      `documentation` action was added and verified live via portfolio landing PR
      [#25](https://github.com/GBrooks1970/portfolio/pull/25) (`a4f991c`), closing landing **LAND-09C**.

**Type:** code + CI + docs. **✅ COMPLETE 2026-08-04.**

---

_No other outstanding risks._ `CAL-25` is the only current open item. The fourth
review-derived cycle (Codex GPT-5 v1) closed 2026-07-27 — see **Resolved Risks** below.

---

### Resolved Risks

Resolved risks are kept here as a record that the gap existed — do not delete them.

#### Fourth review-derived cycle (Codex GPT-5 v1, CAL-16..20) — ✅ Resolved 2026-07-27

The **fourth code review** (Codex GPT-5 v1, 2026-07-23, merged via PR #22) raised five current-state
findings absent from v11 (two MEDIUM, three LOW) plus one optional INFO item. Triaged into
`WORKLIST_calculator-screenplay-bdd.md` as CAL-15..20 and delivered one item per `loop-worklist`
iteration (a coupled loop — Calculator consumes `hand-baked-screenplay-pattern` via `file:../`, so
each iteration rebuilt the sibling): CAL-15 governance (PR #23), then CAL-16..20 across PRs #24–#28.
`npm run verify` was green after every item; the whole cycle is closed with **zero outstanding**.
Risk 6 (INFO) was not promoted.

#### Item CAL-16: Release metadata not single-sourced — Score: 12 — ✅ RESOLVED (MEDIUM, P1)

**Priority Score:** Security Impact (1) + Breakage Probability (5) + Maintenance Burden (6) = **12 points**
**Finding (Codex Risk 1):** the version is asserted in several places (`package.json`,
`package-lock.json` root fields, OpenAPI `info.version`) that can drift apart; nothing fails when
they do.
**Planned fix:** align both `package-lock.json` root version fields to `package.json` (0.2.0) without
changing dependency resolution; set OpenAPI `info.version` per the confirmed policy (tracks the
package release); add a deterministic fast test — included in `npm run verify` — that fails when
package / lock-root / OpenAPI versions diverge. **Depends on CAL-15.** **Code/config + test + docs.**
**Status:** ✅ RESOLVED 2026-07-27 (CAL-16). `package-lock.json`'s two root version fields refreshed
`0.1.0 → 0.2.0` via `npm install --package-lock-only` (no dependency resolution change, `npm audit`
0); OpenAPI `info.version` set to `0.2.0` (tracks the package release, confirmed policy); a
deterministic drift test in `tests/api.spec.ts` asserts `package.json` == lockfile root (both
fields) == OpenAPI `info.version`, and the CAL-06 operator-enum guard stays green. Suite 19 → 20.
CHANGELOG `[Unreleased]` note added. *(Risk Summary count reconciled to zero-outstanding at CAL-20
per its acceptance — the whole cycle's close-out.)*

#### Item CAL-17: Blank browser operands silently coerce to zero — Score: 12 — ✅ RESOLVED (MEDIUM, P1)

**Priority Score:** Security Impact (2) + Breakage Probability (6) + Maintenance Burden (4) = **12 points**
**Finding (Codex Risk 2):** the UI adapter passes operands through `Number(...)`, so an empty or
whitespace-only field becomes `0` and calculates silently instead of reporting invalid input.
**Planned fix (confirmed policy — reject):** reject null/empty/whitespace operands before conversion
while numeric zero/negatives/decimals still reach the API; reuse the shared `isCalculatorOperator`
guard where practical; add a controller/browser decision-table test over each blank operand,
malformed/non-finite input, zero and a valid decimal, asserting the settled accessible error/success
state. **Depends on CAL-15.** **Code + tests + docs.**
**Status:** ✅ RESOLVED 2026-07-27 (CAL-17). `readNumber` (`src/uiController.ts`) rejects
empty/whitespace operands (`value.trim() === ''`) as missing input before `Number(...)`; zero,
negatives and decimals still pass. Decision-table browser test in `tests/uiController.spec.ts`
(blank-left, blank-right, zero, decimal) asserts the settled accessible `data-state`/message; the
`novalidate` form keeps the controller's feedback authoritative. **`isCalculatorOperator` not
imported (documented "where practical" exception):** the browser entry module is served standalone
via the static allow-list, so a runtime import of `calculatorContracts.js` would 404 — the local
`uiOperators` literal is instead tied to `CalculatorOperator` via `satisfies` (compile-time drift
check). Non-finite input is defended in depth by `readNumber`'s `Number.isFinite` guard and the
server's existing 400 test. No Gherkin (CAL-15 did not record missing input as a BDD rule). Suite
19 → 23 on this branch. CHANGELOG `[Unreleased]` note added.

#### Item CAL-18: Port parsing accepts numeric prefixes — Score: 6 — ✅ RESOLVED (LOW, P2)

**Priority Score:** Security Impact (0) + Breakage Probability (3) + Maintenance Burden (3) = **6 points**
**Finding (Codex Risk 3):** port parsing accepts values like `3100abc` (numeric prefix) and reads
the environment two incompatible ways across the app and `playwright.config.ts`.
**Planned fix:** one shared strict full-string parser rejecting blank/whitespace, fractional,
exponent, signed out-of-range and trailing-character values, used by both app startup and Playwright
config; table-driven tests; default port 3100 and the `CALCULATOR_BASE_URL` override preserved.
**Code + tests + docs.**
**Status:** ✅ RESOLVED 2026-07-27 (CAL-18). New `src/parsePort.ts` accepts only a full run of ASCII
digits naming an integer in `[1, 65535]` (`/^\d+$/` + range) — rejecting numeric prefixes,
fractions, exponents, signed and blank/whitespace values that `Number.parseInt`/`Number` silently
mangle; its error states the accepted format. Both `src/environment.ts` (`readPort` deleted) and
`playwright.config.ts` (its unchecked `parseInt` replaced) now call it — one rule, no second parser.
Table-driven `tests/parsePort.spec.ts` covers `1`, `65535`, `0`, `65536`, `1.5`, `1e3`, `3100abc`,
blank, whitespace (+ signed and padded). Default `3100` and `CALCULATOR_BASE_URL` unchanged; suite
24 → 37 on this branch. CHANGELOG `[Unreleased]` note added.

#### Item CAL-19: JSON media type not enforced; no 415 path — Score: 7 — ✅ RESOLVED (LOW, P2)

**Priority Score:** Security Impact (1) + Breakage Probability (3) + Maintenance Burden (3) = **7 points**
**Finding (Codex Risk 4):** `POST /api/calculations` does not enforce the documented `application/json`
media type and has no `415` response.
**Planned fix:** accept `application/json` case-insensitively (optional `charset`); return `415` with
the standard `ApiErrorResponse` shape for missing/unsupported types before body parsing; document
`415` in OpenAPI; integration tests for plain JSON, JSON+charset, missing type and `text/plain`. The
existing `400`/`413`/`422` paths remain distinct. **Code + tests + docs.**
**Status:** ✅ RESOLVED 2026-07-27 (CAL-19). `handleCalculation` (`src/calculatorHttpServer.ts`)
checks the media type via a new `isJsonContentType` helper **before** reading the body — accepting
`application/json` case-insensitively and ignoring parameters (`; charset=utf-8`), returning `415
Unsupported Media Type` + the standard `ApiErrorResponse` shape otherwise; the `413` size-cap and
`400`/`422` body paths are untouched. OpenAPI gains the `415` response. Focused `tests/api.spec.ts`
cases: charset → 200, missing `Content-Type` → 415, `text/plain` → 415 (plain JSON already covered).
The BDD/Screenplay path and object-body tests were verified to send `application/json` (Playwright
auto-sets it for object bodies), so the guard is safe. Suite 24 → 27. CHANGELOG `[Unreleased]` note.

#### Item CAL-20: `CalculatorServer.listen()` ignores bind failures — Score: 6 — ✅ RESOLVED (LOW, P2)

**Priority Score:** Security Impact (0) + Breakage Probability (4) + Maintenance Burden (2) = **6 points**
**Finding (Codex Risk 5):** `listen()` resolves its promise without handling an `error` (e.g. a bind
failure), so a failed bind can surface as an uncaught process error.
**Planned fix:** attach a one-shot `error` listener before `listen`, reject the promise on bind
failure, remove temporary listeners on both paths; a lifecycle test binds one server then attempts a
second bind to the same host/port and asserts a controlled rejection with no leak. **Run last.**
**Code + tests + docs.**
**Status:** ✅ RESOLVED 2026-07-27 (CAL-20). `listen()` (`src/calculatorHttpServer.ts`) now attaches
one-shot `listening`/`error` handlers — each removing the other — so a failed bind (`EADDRINUSE`)
rejects the advertised promise instead of surfacing as an uncaught event, and neither listener leaks
past startup; successful startup/close behaviour is unchanged. `tests/serverLifecycle.spec.ts` binds
an ephemeral port (0), attempts a colliding second bind and asserts the rejection with no leaked
server. This item also carried the **cycle close-out**: the Risk Summary is reconciled to zero
outstanding and CAL-16..20 relocated under Resolved Risks (above). Suite 40 → 42. CHANGELOG note.

> **Not promoted:** Risk 6 (quantitative coverage/trend evidence) is INFO and explicitly optional;
> OpenAPI example conformance is covered by CAL-16/19's focused contract checks; Docker Compose is
> N/A; action-SHA pins, an extra Node LTS lane and provider release pinning stay optional/
> trigger-bound. ADR 0001's floating sibling strategy is accepted until its external-consumer
> trigger fires.

#### 2026-07-19 review v2 close-out (TRIAGE-02..04) ✅ Resolved

Code review v2's remaining findings, triaged into `WORKLIST_calculator-screenplay-bdd.md`
(portfolio root) alongside TRIAGE-01, are now delivered:

| Item | Review finding | Severity | Resolution | Commit / PR |
|---|---|---|---|---|
| **TRIAGE-02** | Risk 2 — `readJsonBody` buffered an unbounded request body, an audit-flagged refinement never actioned or declined | Low | `readJsonBody` (`src/calculatorHttpServer.ts`) now counts bytes while streaming and rejects a body over 10 KiB with `413` + the standard `ApiErrorResponse` shape, before `JSON.parse` runs; documented in `src/openApiDocument.ts` alongside the existing `400`/`422` entries. New test in `tests/api.spec.ts`. Suite 18 → 19. | `b0ce1ac` / PR #18 |
| **TRIAGE-03** | Risk 3 — README and the structure doc still named only `api.spec.ts`/`domain.spec.ts` and described `unit-and-api` as non-browser, drift left behind by CAL-11's `uiController.spec.ts` | Low | README and `docs/project-structure-and-test-architecture.md` now name all three spec files and describe `uiController.spec.ts` as browser-backed; added a comment on `unit-and-api` in `playwright.config.ts` explaining the deliberately absent device profile. No behaviour change. | `5ee3e95` / PR #19 |
| **TRIAGE-04** | Risk 4 — `CHANGELOG.md` had accumulated five weeks of shipped work under one `[Unreleased]` block since `[0.1.0]`, contradicting the SemVer claim | Low | Moved `[Unreleased]` content into a dated `## [0.2.0] — 2026-07-19` section (append-only); added entries for TRIAGE-01..03; bumped `package.json` version 0.1.0 → 0.2.0. | `a91920e` / PR #20 |

`npm run verify` was green after every commit; 19/19 Playwright tests on `main`. Combined with
the 2026-07-19 public-readiness closure below (TRIAGE-01, Risks 1 and 5), this closes every
finding from code review v2 (`.review/CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z/`) with a
recorded disposition. Risk 6 (Info) needed no action per the review's own severity legend.

#### 2026-07-19 public-readiness closure (TRIAGE-01) ✅ Resolved

Code review v2 (`.review/CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z/`, Risk 1) found the
README's "Public-readiness status" section still stated the repository "remains private", even
though the 2026-07-14 P-07 publication action plan completed Stage 1: Calculator was made public
at 2026-07-14T16:49:29Z, and every mandatory post-change check passed (anonymous repo/commit/
LICENSE/Actions/README visibility, disposable-clone `npm run verify` 16/16 and `npm audit` 0, the
`main` ruleset `main: PR + verify (Node 20)` active, and secret scanning/push protection/
dependency alerts/Dependabot security updates enabled) — see
`PORTFOLIO_P07_PUBLICATION_ACTION_PLAN_2026-07-14.md` (portfolio root) Stage 1 evidence log for
the full record.

- README's "Public-readiness status" section now states the repository was made public on
  2026-07-14 and that the runbook's post-change checks were completed and verified.
- This entry records that closure in the backlog; the stale "Based on" header reference
  (`f52e72c`, a PR branch tip rather than a `main` merge commit) is corrected above (review
  Risk 5, folded into this closure per the triage worklist).

#### 2026-07-17 optional-refinement close-out (CAL-06, CAL-11, CAL-12) ✅ Resolved

The three optional teaching/robustness refinements the 2026-07-14 reconciliation left open
(review Risks 6 and 8, plus the standalone contract-drift recommendation) are now delivered on
`worklist/cal-06-contract-drift-guard` (PR #15):

| Item | Review finding | Severity | Resolution | Commit |
|---|---|---|---|---|
| **CAL-06** | Standalone recommendation — no OpenAPI/domain contract-drift guard | Low | Added a test asserting the `/openapi.json` operator `enum` (`src/openApiDocument.ts`) is set-equal to `calculatorOperators` (`src/calculatorContracts.ts`). Suite 16 → 17. | `d809428` |
| **CAL-11** | Risk 6 — the UI controller's `data-state` contract was non-total (an unhandled fetch rejection left it stuck at `idle`) | Low | Wrapped `submitCalculation`'s fetch/response body in `try/catch`, routing failures through the existing `showError(...)`. Added `tests/uiController.spec.ts`, which aborts the `/api/calculations` route and asserts the settled error state. Suite 17 → 18. | `23cbbdb` |
| **CAL-12** | Risk 8 [Info] — the `Remember.that('lastCalculationRequest', ...)` calls were write-only; SCREENPLAY.md's "demonstrates scenario memory" claim was not exercised | Info | Chose option (a), recall (recorded loop default): added `TheRememberedCalculation` (`tests/calculatorQuestions.ts`), which recalls the request via `Recall.the(...)` and derives the expected result/expression through the same pure `calculate()` the server/UI use; wired into the "API result should be" and "displayed result should be" Then steps. `SCREENPLAY.md` updated. No reduction in scenario coverage. | `f52e72c` |

`npm run verify` was green after every commit; 18/18 Playwright tests on the branch. This closes
every finding from the 2026-07-06 `CLAUDE_Fable_5` review (Risks 1–9 and the standalone
recommendation) with a recorded disposition — see the 2026-07-14 entry below for Risks 1–5 and 9,
and Risk 7 (Info, recorded-not-actioned, no code implication) noted there as well.

#### 2026-07-14 public-readiness reconciliation ✅ Resolved

The 2026-07-06 `CLAUDE_Fable_5` review identified publication-facing dependency, licensing,
backlog, Node-floor, and CI-diagnostic gaps. P-04 and this P-07 audit tranche now reconcile them:

- review Risks 1/3: `playwright-bdd` v9 plus removal of unused `tsx` reduce full `npm audit` from
  six dev-only findings to zero; production remained zero;
- review Risk 2: P-04 added the recognised Apache-2.0 licence and explicit sibling boundary;
- review Risk 4: PR #11 merged backlog v7 before this reconciliation;
- review Risk 5: Node.js ≥20 is now documented and enforced through package metadata;
- review Risk 9: CI now retains failure-only Playwright evidence, uses current v7 action majors,
  and disables persisted checkout credentials.

Review Risks 6–8 and CAL-06 remain optional teaching/robustness refinements, not outstanding
required risks. The repository-visibility and historical-email decisions live in the linked P-07
audit because they require owner authority rather than code implementation.

#### Risk #2: No CI gate — `npm run verify` never runs on PRs or pushes to `main` ✅ Resolved 2026-06-13

**Priority Score was:** Security Impact (0) + Breakage Probability (6) + Maintenance Burden (4) = **10 points** (MEDIUM)
**Resolution:** Added `.github/workflows/ci.yml` running `npm run verify` on pull requests and
pushes to `main` (Node 20, npm cache). Per
[ADR 0001](./adr/0001-consume-screenplay-library-via-sibling-checkout.md) the workflow checks out
`NeoCognitus70/hand-baked-screenplay-pattern` (its `main`) side by side, so `file:../` and
`prepare:screenplay` resolve exactly as they do locally. `npm_config_cache` redirects the
repo-local `.npmrc` cache path to the runner default so setup-node's cache is effective.

**Unblocked by user decision (2026-06-12):** the library repo was made **public** (option (b)),
so the default `GITHUB_TOKEN` suffices for the second checkout — no PAT secret needed. (The item
was BLOCKED 2026-06-12 while the library was private and no PAT secret existed.)

**Success Criteria:**
- [x] `.github/workflows/` workflow runs `npm run verify` on PRs and pushes to `main` (Node 20, npm cache)
- [x] The workflow checks out the sibling library (its `main`) side by side, so `file:../` resolves as locally
- [x] A green run on the PR introducing it — **run `27450198314`** on PR #4 (`worklist/ci-and-prepare-fix`)
**See:** PR #4.

#### Risk #3: Flaky displayed-message question raced the UI controller's async render ✅ Resolved 2026-06-13

**Priority Score was:** Security Impact (0) + Breakage Probability (5) + Maintenance Burden (2) = **7 points** (LOW)
**Discovered:** 2026-06-13, when Risk #2's first CI run (`27450065305`) failed the divide-by-zero
UI scenario on a fast runner. `TheDisplayedCalculation.message()` read `#calculation-result` with
a one-shot `textContent()` that raced the controller's `fetch → JSON → DOM` update and read the
idle prompt.
**Resolution:** the question now waits for the controller's settled `data-state`
(`success`/`error`) on the element before reading — an explicit wait on a settled-state attribute
rather than racing text content (durable lesson carried from the magento project). Local `test:bdd`
green; CI run `27450198314` green.

**Success Criteria:**
- [x] The displayed-message question waits for a settled render before reading
- [x] Green locally and in CI

#### Risk #4: `prepare:screenplay` mutated the sibling repository on every run ✅ Resolved 2026-06-13

**Priority Score was:** Security Impact (0) + Breakage Probability (5) + Maintenance Burden (3) = **8 points** (LOW)
**Discovered:** 2026-06-12 while running the worklist loop. `npm --prefix ../hand-baked-screenplay-pattern install`
resolved this project's `file:../` reference from the *consumer's* directory (an npm 10.8.2 quirk)
and injected a circular `"calculator-screenplay-bdd": "file:../calculator-screenplay-bdd"`
dependency into the sibling's `package.json`/`package-lock.json` every run — dirtying the provider
repo's tree (and tripping the hand-baked loop's dirty-tree stop condition).
**Resolution:** `prepare:screenplay` now `cd`s into the sibling (`cd ../hand-baked-screenplay-pattern
&& npm install && npm run build`) instead of using `--prefix`, so installs resolve from the
sibling's own directory and its tree stays clean.

**Success Criteria:**
- [x] `prepare:screenplay` no longer modifies any tracked file in `../hand-baked-screenplay-pattern`
  (verified: `git -C ../hand-baked-screenplay-pattern status --porcelain` empty after a prepare run
  from a clean sibling tree)
- [x] `npm run verify` still green afterwards (11/11)
- [x] Recorded in `CHANGELOG.md` [Unreleased] Fixed

#### Risk #1: Hard dependency on a sibling checkout of `hand-baked-screenplay-pattern` ✅ Resolved 2026-06-12

**Priority Score was:** Security Impact (0) + Breakage Probability (6) + Maintenance Burden (4) = **10 points** (MEDIUM)
**Resolution:** Strategy (c), user-confirmed — the `file:../` sibling convention is kept
deliberately for this co-developed teaching pair. Added
`scripts/preflight-screenplay.mjs`, run before `prepare:screenplay` (sibling present?) and before
`verify` (sibling present and built?), failing fast with the exact clone remedy; promoted the
sibling requirement into the README quick-start ("clone both, side by side"); recorded the
decision and its revisit trigger (external consumers ⇒ pinned git dependency with a tagged
release) in
[`docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md`](./adr/0001-consume-screenplay-library-via-sibling-checkout.md).
Actual effort: ~1 hr.

**Success Criteria:**
- [x] A documented, reproducible path from `git clone` to a green `npm run verify` (README
  Prerequisites/Install: clone both repos side by side, `prepare:screenplay`, `install`, `verify`)
- [x] The dependency is explicitly documented with a preflight check that fails with a clear
  error message when the sibling is missing
- [x] Decision recorded (ADR 0001)
**See:** PR introducing the change (worklist branch `worklist/sibling-dependency-and-ci`).

---

## Code Review (2026-06-16) — refinements actioned (CAL-01..05) ✅ All resolved

A full static code review was run on 2026-06-16
(`.review/CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1542Z/`, reviewer `CLAUDE_Opus_4_8`). It
**confirmed the backlog's four resolved risks still hold** and recorded **no blockers** — every
finding is a Low/Info robustness, coverage, or reproducibility refinement on an already-complete
project. A worklist (`WORKLIST_calculator-screenplay-bdd`, derived 2026-06-16) turned the five
findings into CAL-01..05; all five were delivered and merged across **PRs #8, #9, #10** (2026-06-17),
and the CHANGELOG `[Unreleased]` section records each change. This entry catches the backlog up.

| Item | Review finding | Severity | Resolution | Commit / PR |
|---|---|---|---|---|
| **CAL-01** | Risk 1 — `fullyParallel: true` contradicted by `--workers=1` everywhere (latent isolation mixed-message) | Low | Set `fullyParallel: false` (option (a), the honest KISS choice) with a comment naming the single shared `webServer`, the lack of per-test isolation, and the `--workers=1` guard. | `418eef2` / PR #8 |
| **CAL-02** | Risk 2 — the 400-vs-422 rejection contract was invisible at the BDD layer (hard-coded only in the Screenplay task) | Low | Documented the "reject … with …" → 422 (unsupported) convention vs the 400 (bad-request) path in the `features/calculator-api.feature` header comment (lighter option; a new 400 scenario was left to CAL-05's scope). | `daafb01` / PR #8 |
| **CAL-03** | Risk 3 — always-on `screenshot: 'on'` caveat lived only in README prose | Low | Added an inline comment beside `screenshot: 'on'` in `playwright.config.ts` pointing at the README "Screenshots" guidance (switch to `only-on-failure` for larger suites). No behaviour change. | `5eb82db` / PR #9 |
| **CAL-04** | Risk 4 — CI pins the sibling at floating `ref: main`, so an unrelated sibling commit can turn a green PR red (reproducibility) | Low | **DEFER** (user-confirmed 2026-06-17): no CI pin — the floating ref is the intended design for this co-developed teaching pair. Recorded a dated review-log note in ADR 0001; pin-to-tag stays gated on the ADR's external-consumers trigger. | `c881374` / PR #9 |
| **CAL-05** | Risk 5 [Info] — edge-coverage gaps in the API and domain layers | Info | Added bottom-of-pyramid tests: `tests/api.spec.ts` malformed-JSON 400 (raw `Buffer` body) + unknown-route 404; `tests/domain.spec.ts` three ISTQB boundary-value cases (negative operands across zero, a 1e6×1e6 product, the finite non-terminating 1/3 division). BDD layer untouched. Suite went **11 → 16** Playwright tests, `npm run verify` green. The optional `/uiController.js` asset branch was left uncovered as non-trivial. | `3bbe03d` / PR #10 |

**Net effect:** the test suite grew from 11 to **16** Playwright tests (6 `api.spec.ts` + 6
`domain.spec.ts` + 4 BDD scenarios). No new outstanding risk arose from the review; the only
review recommendation **not** actioned by this cycle is the optional OpenAPI contract-drift guard
(see Potential Next Steps below).

---

## Risk Summary

| Priority | Count | Total Effort | Status Distribution |
|---|---|---|---|
| HIGH (20–30) | 0 | — | — |
| MEDIUM (10–19) | 1 | Phase 2 | CAL-25 — Open; CAL-22..24 complete |
| LOW (0–9) | 0 | — | — |
| **Total Outstanding** | **1** | **Phase 2** | Provider-switching proof close-out active; execute CAL-25 |
| Resolved | 4 risks + 5 review refinements (CAL-01..05) + public-readiness reconciliation + 3 optional refinements (CAL-06, CAL-11, CAL-12) + review v2 close-out (TRIAGE-01..04) + review v1/Codex close-out (CAL-15..20) | ~3 hrs + 5 review cycles | |

---

## Potential Next Steps

**Current required sequence:** CAL-22..24 are complete; execute `CAL-25`. A cold session should read
the provider-switching decisions near the top of this file, the one Open item above,
[`ADR 0002`](./adr/0002-consume-screenplay-provider-via-pinned-release.md), and the portfolio
viability assessment. CAL-25 is the only valid starting item. Final relocation to Resolved Risks
must wait for merged-main CI evidence; Phases 3–5 remain unpromoted.

Phases 3–5 are not Calculator backlog work and remain unpromoted. A fifth code review or fresh survey
must not displace the authorised Phase 2 sequence unless the owner explicitly reprioritises it.

### Delivered

### MEDIUM Priority

1. ✅ **Add `CHANGELOG.md`** — DONE 2026-06-12 (W3, commit `076309c`, PR #3). Scaffolded from the
   portfolio `templates/changelog.template.md`; `[0.1.0]` records the initial suite + PRs #1–#2 and
   `[Unreleased]` tracks ongoing changes; linked from the README's Change History section. (This
   entry was stale — listed NOT STARTED after delivery; pruned in v6.)

### LOW Priority

1. ✅ **Expand `docs/`** — DONE 2026-06-13 (W4). Added
   [`docs/project-structure-and-test-architecture.md`](./project-structure-and-test-architecture.md):
   a short architecture note covering the project layout (`features/`, `src/`, `tests/`), the
   `unit-and-api` vs `bdd` Playwright projects, and how `bddgen` generates the BDD specs. Linked
   from the README. Every claim checked against `playwright.config.ts` and `package.json`.
2. ✅ **CAL-06/CAL-11/CAL-12** — DONE 2026-07-17 (PR #15). OpenAPI contract-drift guard, total UI
   controller error handling, and closing the write-only `Remember` loop. See the "2026-07-17
   optional-refinement close-out" entry under Resolved Risks above for detail and commits.

---

## Maintenance Notes

- Include links/paths to affected files when adding new items.
- Update the version number at the top when items change status.
- Cross-reference code review findings in `.review/` once a review exists.
- Mark completion dates when items move to ✅ Resolved.
- Update effort estimates with actuals after completion.
