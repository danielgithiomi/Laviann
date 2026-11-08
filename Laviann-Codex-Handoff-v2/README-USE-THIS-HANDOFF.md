# Laviann development handoff v2: archive and completion context

**Updated 18 October 2026.** This bundle supplied the original implementation brief.
The complete local P0, shared foundation and Supabase implementation are now merged
into `main`. Do not paste an old launch prompt as though development has not started.
Continue from the current application and the owner's current task.

## Current starting point

1. Read [root AGENTS.md](../AGENTS.md), [the main README](../README.md) and
   [the documentation index](../docs/README.md).
2. Read [architecture](../docs/architecture.md), [setup](../docs/setup.md), the
   relevant app README/nested agent guide and current [PRD](../docs/PRD.md).
3. Use an isolated worktree and task branch from current `origin/main`. Run checks,
   push and open a PR to `main`; never merge without owner approval. Pull into a
   clean primary `main` after merge and preserve all work before cleanup, following
   [CONTRIBUTING.md](../CONTRIBUTING.md#git-worktrees-and-pull-requests).
4. Consult [the milestone ledger](MILESTONE-ACCEPTANCE-TRACKER.md) and
   [verification](../docs/verification.md) for actual completion and testing limits.

The earlier uncertainty about `chore/shared-foundation` is resolved: foundation PR #2,
POC PR #3 and the subsequent Supabase/handoff PR #4 are on `main`. Still fetch and
inspect the current branch at the start of any new task rather than assuming a saved
checkout is up to date.

## What each file means now

| File                                                            | Current use                                                                               |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [Master brief](CODEX-MASTER-DEVELOPMENT-PROMPT.md)              | Archived original build mandate and detailed rationale; not a fresh task                  |
| [Engineering appendix](CODEX-ENGINEERING-ACCEPTANCE-DETAILS.md) | Original proposed contracts/acceptance detail; actual decisions live in ADR-0004 and code |
| [Full-build launch prompt](CODEX-PASTE-TO-START-FULL-BUILD.md)  | Historical prompt for the completed implementation                                        |
| [Phase A launch prompt](CODEX-START-HERE-PHASE-A.md)            | Historical alternative for the initial UI-only phase; not the current stopping point      |
| [Brand specification](BRAND-AND-UX-SPEC.md)                     | Approved P0 identity, annotated with implemented assets and contrast correction           |
| [PRD snapshot](product/PRD.md)                                  | Frozen planning baseline; use the current repository PRD for work                         |
| [Milestone ledger](MILESTONE-ACCEPTANCE-TRACKER.md)             | A–F completion, eight scenarios, evidence and remaining assumptions                       |
| `references/approved/`                                          | Reviewed visual direction, not source SVGs or exact business data                         |
| `references/legacy-layouts/`                                    | Archived exploratory layouts; old logos and mock labels are superseded                    |

## Implemented decisions to preserve

- Single vendor in Mauritius; initial raw Chicken/Beef catalogue only.
- Original monochrome LAVIANN wordmark with a tiny steak above the I, compact L
  icon and exact tagline **Quality Meats, Greater Meals.** Big Shoulders/Inter and
  the runtime shared palette; muted text is now `#52675D` for contrast.
- **Submit order request** starts Pending Review, unpaid and unreserved. The latest
  vendor quote requires explicit approval before confirmation/reservation.
- Preparation consumes stock once. Payments are manually verified and recorded
  separately from delivery. WhatsApp sharing is manual.
- Real local PostgreSQL/Auth/RLS and transaction tests, with an honest read-only
  preview when unconfigured. Storage uploads and Realtime push are not implemented.
- Recursive shared-image copying overwrites on startup/build, without watcher or deletion.

Merchant prices, yields, coverage, schedules, policies and payment details remain
unvalidated. Local POC completion is not approval to deploy, transact real money,
send messages, or claim legal/operational readiness.
