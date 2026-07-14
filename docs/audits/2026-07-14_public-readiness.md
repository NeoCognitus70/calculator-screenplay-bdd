# Calculator Screenplay BDD — Public-Readiness Audit

**Date:** 2026-07-14

**Portfolio item:** P-07

**Baseline:** private repository `NeoCognitus70/calculator-screenplay-bdd`, `main` at `e71a7a5`

**Scope:** current tree, all Git refs/history, GitHub PR/issue metadata, licence, generated/large
artefacts, README claims and links, CI safety, dependency health/licences, and clean bootstrap

**Visibility changed:** **No**

## Decision

**CONDITIONAL GO for publication; NO-GO for a visibility change until the owner clears both gates
below.** The technical and legal repository blockers found by this audit are remediated on the
audit branch, but publication remains a separate action.

1. **Personal-email exposure:** one of two unique historical author addresses is a non-noreply
   `gmail.com` address. The value is deliberately not copied into this report, but it is present in
   raw Git history and would become public. The owner must explicitly accept that exposure or
   separately authorise a history rewrite. This audit does not rewrite published commit history.
2. **Visibility approval:** the owner must explicitly name this repository and approve making it
   public. Merging the audit/remediation PR is not that approval.

After approval, the publication step must make only this repository public and run the post-change
checks in [Publication runbook](#publication-runbook). Sudoku has its own independent audit and
decision.

## Evidence Summary

| Area | Evidence | Result |
|---|---|---|
| Current tree | Baseline: 57 tracked files. Credential-pattern scans covered private-key headers, AWS/GitHub/OpenAI tokens, JWTs, and assigned-secret forms. `.env`, dependencies, build output, reports, generated BDD tests, coverage, caches, and logs are ignored. | **Pass:** zero credential-pattern paths; zero tracked generated/sensitive-name candidates. |
| Git history | All 40 commits and every local/remote ref were scanned with the same value patterns plus sensitive filenames. Object inventory covered all refs. | **Conditional:** zero secret-pattern/sensitive-path hits and zero blobs ≥1 MiB; largest blob 42,939 bytes. One non-noreply author email requires the owner decision above. |
| GitHub metadata | Thirteen PR/issue records (26 title/body fields), zero issue comments, and zero review comments were scanned for private-key/token/JWT patterns. | **Pass:** zero matches. |
| Test data and endpoints | Source, features, examples, and configuration were inspected. The SUT binds locally and uses deterministic calculator operands; CI consumes only this repository, the public sibling, npm, and GitHub Actions. | **Pass:** no credentials, production data, personal test data, live third-party SUT, or scanning target. |
| Licence | Canonical `LICENSE`, package metadata, README boundary, and GitHub REST licence detection were cross-checked. The sibling remains independently licensed. | **Pass:** GitHub identifies `Apache-2.0`; direct/installed dependencies declare compatible permissive licences. |
| Generated/large artefacts | Tree/history names, ignored paths, object sizes, and repository shape were checked. No submodule or LFS dependency exists. | **Pass:** no tracked reports/builds/caches/archives and no history blob ≥1 MiB. |
| README and claims | Architecture/test-count claims were checked against source and the 16-test verify run. Clone layout, sibling coupling, Node floor, install command, licence boundary, and audit status are explicit. | **Pass after remediation:** Node ≥20 and `npm ci` now match CI and the sibling. |
| CI safety | Workflow triggers, permissions, expressions, actions, credentials, dependency layout, and failure diagnostics were inspected. The prior default-branch run `29330445570` passed at `e71a7a5`. | **Pass after remediation:** PR/main only, `contents: read`, current v7 actions, no workflow secrets, persisted checkout credentials disabled, failure-only Playwright evidence retained for seven days. |
| Dependencies | Before remediation: six dev-only advisories (five moderate via `playwright-bdd` v8, one low via unused `tsx`); production audit zero. After v9/removal and lock refresh, full and production audits were repeated. Forty-two unique installed packages declared 35 MIT, 6 Apache-2.0, and 1 BSD-3-Clause licences; none unknown or copyleft-flagged. | **Pass after remediation:** `npm audit` = 0. Remaining registry-latest differences are deliberate major-line choices, not security findings. |
| Bootstrap | The public sibling was anonymously addressable. A disposable, clean GitHub clone of this audit branch plus a side-by-side anonymous sibling clone ran `prepare:screenplay`, `npm ci`, Chromium installation, and `npm run verify`. Both Git trees remained clean. | **Pass:** 16/16 tests. Calculator itself cannot be anonymously cloned until visibility is explicitly changed, so that is a mandatory post-change check. |

## Remediation Included With This Audit

- upgraded `playwright-bdd` from v8 to v9 and removed unused `tsx`, clearing all six audit
  advisories;
- refreshed compatible lockfile versions while retaining deliberate major-version boundaries;
- aligned README/package metadata to the tested Node.js 20 floor and used reproducible `npm ci` for
  both the Calculator checkout and sibling preparation; the disposable-clone check caught and
  removed a prior helper-side lockfile rewrite;
- updated checkout/setup/upload actions to current v7 majors, retained `contents: read`, disabled
  persisted Git credentials, and added failure-only Playwright artefacts;
- made the repository-local npm-cache comment platform-neutral and linked this audit from the
  README/backlog/changelog.

## Accepted or Non-Blocking Conditions

- `package.json` remains `private: true`; this prevents accidental npm publication and does not
  control GitHub repository visibility.
- The sibling dependency and CI checkout remain on floating `main`. ADR 0001 and CAL-04 explicitly
  accept that co-development trade-off. Public source inspection alone does not make the library a
  versioned external dependency; revisit the ADR if an external project consumes it.
- There are no tags/releases, branch protection, or enabled private-repository GitHub security
  features. None blocks source publication. A public ruleset requiring the `verify (Node 20)` check,
  plus secret scanning/push protection where available, is recommended during publication.
- CAL-06 (OpenAPI contract-drift guard), controller network-failure handling, request-size capping,
  and scenario-memory cleanup remain optional engineering refinements, not publication blockers.

## Publication Runbook

Do not run this section without explicit owner approval for this repository and a recorded decision
on the historical email exposure.

1. Confirm the audit/remediation PR is merged and `main` CI is green.
2. Record the owner's email-exposure decision and explicit Calculator visibility approval in the
   portfolio P-07 close-out.
3. Make **only** `NeoCognitus70/calculator-screenplay-bdd` public.
4. From an unauthenticated environment, verify repository/README/licence visibility, clone
   Calculator and `hand-baked-screenplay-pattern` side by side, and repeat the documented bootstrap
   and `npm run verify` sequence.
5. Verify Actions history/logs and the Apache-2.0 licence are anonymously visible; verify the CI
   workflow remains read-only for fork pull requests.
6. Configure/review a `main` ruleset requiring `verify (Node 20)` and enable GitHub secret scanning
   and push protection where the public-repository settings offer them.
7. Only after those checks pass, update the public landing card/source links and close Calculator's
   half of P-07. Do not infer or change Sudoku visibility.

## Audit Limitations

- Pattern scanning reduces credential risk but cannot prove that arbitrary prose contains no
  sensitive fact. Manual review was combined with the scans and kept matched values out of this
  report.
- Anonymous Calculator access cannot be tested while the repository is private. The authenticated
  clean-clone result validates the committed layout; the post-public anonymous repeat is mandatory.
- npm/GitHub advisory and action-release state is time-sensitive; this report records evidence as
  of 2026-07-14.
