<!--
  AUDIENCE: Engineers, AI agents, and consumers tracking what changed between versions.
  PURPOSE:  Provide a human-readable history of all notable changes. Append only — never
            edit or delete past entries.
  LOCATION: CHANGELOG.md (repository root)
  TEMPLATE: test-automation-portfolio/templates/changelog.template.md
  FORMAT:   Based on https://keepachangelog.com/en/1.0.0/
            Versioning follows https://semver.org/spec/v2.0.0.html
-->

# Changelog

All notable changes to calculator-screenplay-bdd will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- Added `scripts/preflight-screenplay.mjs`, run before `prepare:screenplay` and `verify`
  (`--built`), which fails fast with the exact clone remedy when the sibling
  `hand-baked-screenplay-pattern` checkout is missing or unbuilt.
- Added [ADR 0001](./docs/adr/0001-consume-screenplay-library-via-sibling-checkout.md)
  recording the decision to keep the `file:../` sibling-checkout convention (with its
  revisit trigger), resolving backlog Risk #1.
- Added this `CHANGELOG.md`, scaffolded from the portfolio changelog template.

### Changed

- Changed the README prerequisites from "the sibling project must be present" to an explicit
  clone-both-repositories-side-by-side quick-start linking ADR 0001.

---

## [0.1.0] — 2026-06-11

The initial release: a pedagogical calculator application and a test suite that climbs the
test pyramid from unit checks to Screenplay-backed Gherkin scenarios.

### Added

- **Application**: a pure calculator domain (`src/calculatorDomain.ts`), a dependency-free
  Node HTTP server with static asset serving (`src/calculatorHttpServer.ts`), a hand-written
  OpenAPI document served at `/openapi.json`, and a static browser UI (`public/`).
- **Test suite**: Playwright `unit-and-api` project (domain and REST integration specs under
  `tests/`) and a `bdd` project generating specs from Gherkin (`features/`) via playwright-bdd,
  with Screenplay tasks, interactions, questions, and abilities consuming the sibling
  `hand-baked-screenplay-pattern` library (`file:../`).
- **Screenplay guide**: `SCREENPLAY.md` mapping the core primitives to the calculator examples,
  plus always-on screenshots as teaching evidence in browser-backed tests.
- **Documentation**: `docs/screenplay-flow-through-the-sut.md`, a pedagogical walkthrough of the
  Screenplay flow through the system under test (PR #1).
- **Process**: `docs/backlog.md` as the project's source of truth for outstanding work, added
  when the project was onboarded to the portfolio prompt conventions (PR #2).
