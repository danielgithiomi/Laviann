# Laviann documentation

| Document                                                                                         | Purpose                                                    |
|--------------------------------------------------------------------------------------------------|------------------------------------------------------------|
| [PRD.md](PRD.md)                                                                                 | Editable product requirements; authoritative source        |
| [Laviann-PRD-v1.0.pdf](Laviann-PRD-v1.0.pdf)                                                     | Professionally formatted review/pitch document             |
| [setup.md](setup.md)                                                                             | Run the preview or the local Supabase stack and demo owner |
| [demo-guide.md](demo-guide.md)                                                                   | Demo walkthrough and the eight PRD acceptance scenarios    |
| [verification.md](verification.md)                                                               | Executed checks, screenshots and their limits              |
| [security.md](security.md)                                                                       | Security boundaries and operating assumptions              |
| [implementation-audit.md](implementation-audit.md)                                               | Historical pre-implementation repository audit             |
| [commit-conventions.md](commit-conventions.md)                                                   | Conventional Commits policy and hook usage                 |
| [decisions/0001-monorepo-and-backend.md](decisions/0001-monorepo-and-backend.md)                 | Why Bun, Turborepo, Next.js and Supabase                   |
| [decisions/0002-shared-foundation-and-assets.md](decisions/0002-shared-foundation-and-assets.md) | Shared package and startup image copying                   |
| [decisions/0003-tailwind-and-shared-fonts.md](decisions/0003-tailwind-and-shared-fonts.md)       | Shared Tailwind v4 theme and font loading                  |
| [decisions/0004-transactional-poc.md](decisions/0004-transactional-poc.md)                       | Implemented schema, auth, guest links and transactions     |
| [design/](design/README.md), [ux/](ux/Laviann-UX-Plan-v0.1.md)                                   | Early exploratory brand and UX planning (historical)       |

`../Laviann-Codex-Handoff-v2/` holds the original development brief, approved brand
spec and the [milestone tracker](../Laviann-Codex-Handoff-v2/MILESTONE-ACCEPTANCE-TRACKER.md).

## Updating the PRD PDF

1. Edit `docs/PRD.md` first, with approved requirements and clear assumptions.
2. Install `pandoc`, Python 3 and the `weasyprint` Python package.
3. From the repository root, run:

   ```sh
   python3 scripts/build-prd-pdf.py
   ```

4. Review the generated `docs/Laviann-PRD-v1.0.pdf` visually and commit both
   Markdown and PDF so they stay in sync.

The PDF's typography and muted green cover are **document styling only**. They do
not finalize Laviann's application branding, colors or UI design.
