# ADR 0001 — Consume the Screenplay library via a sibling checkout

**Status:** Accepted (user-confirmed 2026-06-12)
**Date:** 2026-06-12
**Relates to:** `docs/backlog.md` Risk #1 — hard dependency on a sibling checkout of
`hand-baked-screenplay-pattern`

## Context

This project consumes the teaching library
[`hand-baked-screenplay-pattern`](https://github.com/NeoCognitus70/hand-baked-screenplay-pattern)
as a local `file:` dependency:

```json
"hand-baked-screenplay-pattern": "file:../hand-baked-screenplay-pattern"
```

`prepare:screenplay` installs and builds inside that sibling checkout. The dependency is
invisible to a plain `npm install`, unpinned (whatever the sibling's working tree holds), and a
clone of this repository alone fails at build time with a confusing missing-path error.

Options considered:

- **(a)** consume the library as a pinned git dependency or published package;
- **(b)** vendor a built copy into this repository;
- **(c)** keep the sibling-path convention, document it prominently, and add a preflight check
  that fails fast with a clear remedy.

## Decision

**Strategy (c)** — keep the `file:../hand-baked-screenplay-pattern` sibling convention untouched,
and:

1. add `scripts/preflight-screenplay.mjs`, run before `prepare:screenplay` (sibling present?) and
   before `verify` (sibling present *and built*?), failing fast with the exact remedy:
   `git clone https://github.com/NeoCognitus70/hand-baked-screenplay-pattern ../hand-baked-screenplay-pattern`;
2. promote the sibling requirement into the README quick-start: **clone both repositories, side
   by side**, before anything else.

### Rationale

The two projects are a co-developed teaching pair maintained in the same portfolio — KISS/YAGNI
applies. There are no external consumers to protect with a version pin, and developing against
the sibling's working tree is precisely the workflow the pair is for. Vendoring (b) was rejected
as an anti-pattern (a stale built copy masquerading as source). Pinning (a) buys reproducibility
this project does not yet need, at the cost of a release/tag ceremony on every library change.

## Consequences

- A fresh clone of this repository alone now fails **immediately and self-explanatorily** at
  `npm run prepare:screenplay` / `npm run verify`, instead of deep inside an npm `--prefix` run.
- The reproducible path to a green `npm run verify` is documented in the README: clone both
  repositories side by side, then `npm run prepare:screenplay && npm install && npm run verify`.
- The build still consumes whatever the sibling's working tree holds — by design. Keep the
  sibling on `main` when verifying this project.

## Revisit trigger

If `hand-baked-screenplay-pattern` ever gains consumers outside this portfolio, promote the
dependency to a **pinned git dependency with a tagged release** (strategy (a)) and retire the
preflight's clone remedy in favour of the pinned reference.

## Review log

- **2026-06-17 (review Risk 4 / CAL-04):** the same trade-off surfaces in CI, where
  `.github/workflows/ci.yml` checks out the sibling at a floating `ref: main`, so an unrelated
  sibling commit can turn a green PR red and a past PR's CI is not reproducible. Reviewed and
  **deferral reaffirmed** — no CI pin added. The floating `ref: main` is the intended design for
  this co-developed teaching pair: the calculator *should* break loudly when a sibling change
  breaks it, and there are still no external consumers to protect (KISS/YAGNI). The pin-to-tag
  remedy remains gated on this ADR's external-consumers revisit trigger above.
