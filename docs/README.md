# Laviann documentation

**Current context: 8 November 2026.** The complete local P0 is implemented and merged
into `main`. Start here when maintaining the app; do not treat the archived build
prompts or early mockups as a new implementation mandate.

## Start here

| Document                                                                                  | Purpose                                                                   |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [Root README](../README.md)                                                               | Product overview, mobile/desktop screenshots and quick start              |
| [AGENTS.md](../AGENTS.md) / [CLAUDE.md](../CLAUDE.md)                                     | Provider-neutral agent instructions and entrypoint                        |
| [CONTRIBUTING.md](../CONTRIBUTING.md)                                                     | Worktrees, branches, PRs to `main`, owner approval, checks and cleanup    |
| [Architecture](architecture.md)                                                           | Implemented apps, API boundaries, data map and order lifecycle            |
| [Setup](setup.md)                                                                         | Preview, local Supabase, owner provisioning and environment configuration |
| [Customer README](../apps/customer/README.md) / [vendor README](../apps/vendor/README.md) | Screenshots, routes and app-specific development context                  |
| [Shared package guide](../packages/README.md)                                             | Theme/fonts, UI, contracts and asset synchronization                      |
| [Database guide](../supabase/README.md) / [test guide](../tests/README.md)                | Schema ownership, migrations, test setup and isolation                    |

## Product, demonstrations and evidence

| Document                                                                        | Purpose                                                               |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [PRD](PRD.md) / [PDF](Laviann-PRD-v1.0.pdf)                                     | Authoritative requirements and synchronized presentation copy         |
| [Demo guide](demo-guide.md)                                                     | Complete customer/vendor journey and eight acceptance scenarios       |
| [Verification](verification.md)                                                 | Dated test results, screenshot index, performance and limitations     |
| [Security](security.md)                                                         | Implemented access controls and remaining operating assumptions       |
| [UX guide](ux/Laviann-UX-Plan-v0.1.md)                                          | Current interactions and relationship to earlier concepts             |
| [Design guide](design/README.md)                                                | Implemented visual identity and clearly labelled historical assets    |
| [Milestone ledger](../Laviann-Codex-Handoff-v2/MILESTONE-ACCEPTANCE-TRACKER.md) | Completed A–F milestones with evidence and remaining vendor decisions |

## Architecture decisions

1. [ADR-0001](decisions/0001-monorepo-and-backend.md): Bun, Turbo, two Next.js apps and Supabase.
2. [ADR-0002](decisions/0002-shared-foundation-and-assets.md): shared package and startup image copying.
3. [ADR-0003](decisions/0003-tailwind-and-shared-fonts.md): Tailwind v4 and centralized font loading.
4. [ADR-0004](decisions/0004-transactional-poc.md): owner Auth, guest capabilities, immutable quotes and stock transactions.

[Commit conventions](commit-conventions.md) cover mandatory scopes and branch trailers.

## Historical material

[The implementation audit](implementation-audit.md) records the **16 October**
starting point. [The handoff archive](../Laviann-Codex-Handoff-v2/README-USE-THIS-HANDOFF.md)
contains the original build instructions and baseline PRD snapshot. Older SVG mockups,
preview PNGs and `design/tokens.json` remain design history; current screenshots are
in `screenshots/`, and runtime tokens live in `packages/shared/src/theme`.

Preserve the dates and limitations of test output. A documentation update does not
turn the previous browser run into a new run. For a new change, report its own checks
and inspect that PR's GitHub Actions results.

## Regenerate the PRD PDF

`PRD.md` is the editable source. Version 1.0 identifies the requirements baseline;
its separate context-update date records implementation/status changes.

1. Edit the Markdown first. Keep sample values and unresolved vendor policies explicit.
2. Provide Python 3, `pandoc` and the Python `weasyprint` package in an authoring
   environment. These are document tools, not application runtime dependencies.
   WeasyPrint also needs its platform rendering libraries.
3. Run from the repository root:

    ```sh
    python3 scripts/build-prd-pdf.py
    ```

4. Inspect the PDF's cover, contents, tables and page breaks. Confirm the metadata
   matches the Markdown and commit both files together.

The builder reads version/date/status metadata from the source. The PDF keeps the
stable filename `Laviann-PRD-v1.0.pdf`. Its page design is document styling; application
branding is defined by the shared theme and approved SVG assets.
