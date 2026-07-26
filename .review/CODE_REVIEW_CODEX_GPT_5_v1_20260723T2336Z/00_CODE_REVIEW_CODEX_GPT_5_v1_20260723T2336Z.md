# Code Review: Calculator Screenplay BDD

Reviewer: AI assistant (Codex GPT-5)
**Date:** 2026-07-23T23:36Z
**Scope:** Full repository review at `5fd5460029199bb41b805a3f6e8070ecce71aa66`
**Method:** Static source review plus read-only type, dependency, licence, secret-pattern, GitHub, and documentation checks
**Preflight:** WARN - paired handover v3 predates the fetched default head

## Table of Contents

1. [Executive Summary](01_EXECUTIVE_SUMMARY.md)
2. [Risks and Issues](02_RISKS_AND_ISSUES.md)
3. [Project Review](03_PROJECT_REVIEWS/PROJECT_001_CALCULATOR_SCREENPLAY_BDD.md)
4. [Cross-Cutting Analysis](04_CROSS_PROJECT_ANALYSIS.md)
5. [Recommendations](05_RECOMMENDATIONS.md)
6. [Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md)
7. [Migration Plans](07_MIGRATION_PLANS.md)

## Structure Summary

This is a single-repository review. The project review covers the application, Screenplay glue,
specifications, test runner, CI, and documentation as one teaching system. The cross-cutting file
examines the boundaries between those parts rather than inventing additional projects.

## Key Findings

1. **MEDIUM - Release metadata is split across 0.2.0 and 0.1.0.**
   `package.json` and the changelog declare 0.2.0, while both package-lock root version fields and
   the OpenAPI `info.version` remain 0.1.0. The backlog therefore overstates the completeness of
   the 0.2.0 release reconciliation.
2. **MEDIUM - Blank browser operands are silently converted to zero.**
   Native form validation is disabled and `Number('')` is `0`, so clearing a required operand can
   produce a valid calculation instead of the documented validation error.
3. **LOW - Port validation accepts malformed values.**
   `Number.parseInt` accepts values such as `3100abc` and truncates `1.5`, contradicting the
   configuration error message.
4. **LOW - The HTTP adapter does not enforce the OpenAPI media-type boundary.**
   The contract exposes only `application/json`, but valid JSON sent as another content type is
   accepted.
5. **LOW - Server startup does not reject its advertised promise on listen errors.**
   Port conflicts and similar failures are emitted by the server without a corresponding
   rejection path in `listen()`.

No HIGH findings were identified. The dependency audit reports zero known vulnerabilities, the
tracked-file secret-pattern scan found no candidate files, the licence declaration is clear, and
the latest fetched `main` CI run completed successfully.

## Backlog and Handover Position

- [backlog.md](../../docs/backlog.md) (lines 10-16) claims version 11, zero outstanding items, and a
  baseline at `b4c891a`.
- Fetched `main` is now `5fd5460`, which merged that backlog reconciliation. The paired v3
  handover still describes PR #21 as open and `main` at `b4c891a`; this is the required advisory
  freshness warning, not a structural handover failure.
- No skipped, quarantined, focused, or WIP tests were found. The only explicit deferral is the
  owner-accepted floating sibling `main` reference recorded by ADR 0001.
- The new findings above mean the backlog's "No outstanding risks" statement should be reconciled
  after triage.

## Validation Position

- `npm run typecheck`: PASS.
- `npm audit --json`: PASS, 0 vulnerabilities.
- `npm outdated --json`: informational exit 1; only major-line differences were reported for
  `@types/node` and TypeScript, while installed versions satisfy the declared ranges.
- Tracked-file credential-pattern scan: PASS, no candidate files.
- Package-lock licence aggregation: 7 Apache-2.0, 36 MIT, 1 BSD-3-Clause, 0 unknown.
- GitHub read-only checks: public repository, active main ruleset, Dependabot security updates,
  secret scanning, and push protection enabled; zero open Dependabot or secret-scanning alerts.
- Latest fetched `main` CI run at `5fd5460`: PASS.
- `npm run verify`, `npm run prepare:screenplay`, builds, BDD generation, and runtime tests:
  **SKIPPED**. `prepare:screenplay` installs and builds inside the sibling
  `hand-baked-screenplay-pattern` checkout. The cross-tree build gate was skipped to avoid
  concurrent writes, as required by the review invocation. Both trees remained clean.

## Recorded Questions

This review ran unattended and did not pause:

1. Should OpenAPI `info.version` be an independent API-contract version, or should it track the
   package release? No independent policy is documented, so this review treats the 0.1.0 value as
   drift from the 0.2.0 release.
2. Should a blank browser operand be rejected, as the `required` attributes and error copy imply,
   or deliberately interpreted as zero? This review treats rejection as the intended behaviour.

## Navigation Guide

Start with the [Executive Summary](01_EXECUTIVE_SUMMARY.md). Use
[Risks and Issues](02_RISKS_AND_ISSUES.md) for evidence and remediation, then read the
[Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) for the Test Pyramid, SOLID, ISTQB,
security, and pedagogical evaluation.

---

[Next: Executive Summary ->](01_EXECUTIVE_SUMMARY.md)
