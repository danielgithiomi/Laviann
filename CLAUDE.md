# Laviann agent entrypoint

@AGENTS.md

Read [AGENTS.md](AGENTS.md) first. It is the provider-neutral instruction source,
including the worktree, feature-branch, PR-to-`main`, owner-approval and cleanup rules.
Do not maintain a conflicting instruction set in this file.

The complete local P0 is implemented and merged into `main`. Continue from the
current code; the archived handoff prompts do not authorize rebuilding it.

- [Documentation index](docs/README.md), [architecture](docs/architecture.md) and
  [PRD](docs/PRD.md): current context and product rules.
- [Customer](apps/customer/README.md) and [vendor](apps/vendor/README.md): routes,
  screenshots and app boundaries. Read each app's nested `AGENTS.md` before editing it.
- [Setup](docs/setup.md) and [verification](docs/verification.md): how to run the
  real local system and which checks were actually executed.
- [Shared package guide](packages/README.md): centralized theme/fonts/contracts,
  server-only imports and overwrite-on-start asset copying, with no watcher or deletion.

Merchant validation and production readiness remain separate from local POC completion.
