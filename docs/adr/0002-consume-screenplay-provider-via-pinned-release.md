# ADR 0002 — Consume the Screenplay provider from a pinned release

**Status:** Accepted (owner-authorised 2026-08-18 as CAL-22)
**Date:** 2026-08-18
**Supersedes:** [ADR 0001](./0001-consume-screenplay-library-via-sibling-checkout.md)
**Followed by:** [ADR 0003](./0003-bound-provider-portability-proof.md)
**Relates to:** `docs/backlog.md` Provider-switching Phase 2, item CAL-22

## Context

ADR 0001 deliberately consumed `hand-baked-screenplay-pattern` from a sibling `file:../` checkout
while the two teaching projects were co-developed and no immutable provider distribution existed.
That made Calculator installs and CI depend on the sibling worktree and its moving `main` branch.

Provider Phase 1 completed on 2026-08-17 and now supplies the immutable distribution that the earlier
decision lacked. On 2026-08-18 the owner promoted Calculator Provider-switching Phase 2 and explicitly
authorised replacing the sibling proof with that release.

The approved artefact is:

- package version: **0.3.0**;
- release: <https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/releases/tag/v0.3.0>;
- release tarball: <https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/releases/download/v0.3.0/hand-baked-screenplay-pattern-0.3.0.tgz>;
- published SHA-256: `ac5bd1f6d9bddf95c9a42f99f05f093c7875b1835ecd3ae0d5ca2385e810c36d`;
- npm lock integrity: `sha512-paEH0LQFxnc4AtwiYeWd+oyvHYsikPq0jXr5NcL28VP6OfA1b4XoMs7/qti/3UpSucp71ZP7sTzzxi8evXI91w==`.

The SHA-256 was independently reproduced from the downloaded release asset before this decision was
implemented. GitHub's release metadata reports the same digest.

## Decision

Calculator consumes the exact v0.3.0 release tarball URL in `package.json`; `package-lock.json`
records that URL, the package version, and npm's SHA-512 integrity. `npm ci` is the only installation
step required by local development, CI, and Pages.

The sibling preflight and build scripts are retired. CI and Pages no longer clone the provider or
follow a branch. `scripts/check-screenplay-provider.mjs`, included in `npm run verify`, fails if the
approved manifest, lockfile, workflow, documentation, or decision evidence drifts.

## Local-development policy

- Calculator development and validation use the committed immutable artefact, including when the
  provider repository happens to exist beside it.
- Provider changes are developed and gated in the provider repository. A Calculator pin changes only
  after a new immutable release is published and its asset digest is independently verified.
- A disposable local experiment may test a packed provider candidate, but that override must never be
  committed or cited as Calculator verification evidence. Restore `package.json` and the lockfile to
  the approved release before running the project gate.
- Do not reintroduce a `file:` dependency, a branch URL, `npm link`, or a provider checkout step in a
  committed Calculator workflow.

## Consequences

- A clean standalone Calculator checkout can run `npm ci` and `npm run verify` without the provider
  repository.
- Historical CI is reproducible against the locked release instead of the provider's current branch.
- Calculator no longer exercises unpublished provider changes automatically; compatibility changes
  require a provider release and an explicit, reviewable pin update.
- The provider remains a separate Apache-2.0 project. Consuming its release does not vendor or
  relicense its source.

## Revisit trigger

Replace v0.3.0 only through a separately reviewed dependency update that records the new immutable
release URL, version, published SHA-256, npm integrity, compatibility evidence, and any decision
change. Provider-selection work in CAL-23 and later must build on this pinned baseline rather than
altering the dependency source.
