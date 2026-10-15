# Laviann documentation

| Document                                                                         | Purpose                                             |
|----------------------------------------------------------------------------------|-----------------------------------------------------|
| [PRD.md](PRD.md)                                                                 | Editable product requirements; authoritative source |
| [Laviann-PRD-v1.0.pdf](Laviann-PRD-v1.0.pdf)                                     | Professionally formatted review/pitch document      |
| [commit-conventions.md](commit-conventions.md)                                   | Conventional Commits policy and hook usage          |
| [decisions/0001-monorepo-and-backend.md](decisions/0001-monorepo-and-backend.md) | Why Bun, Turborepo, Next.js and Supabase            |

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
