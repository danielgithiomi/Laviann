# Paste this into Codex: Laviann - Milestone A

You are working on my EXISTING Laviann monorepo, not creating a new project. The scaffolding, Bun/Turborepo workspaces,
Husky, GitHub Actions, `@laviann/shared` package, shared color mapping, Tailwind CSS v4, font loaders, and image
synchronization have already been developed. Inspect the current branch and read `AGENTS.md`, the accepted ADRs,
`docs/PRD.md`, and `docs/ux/Laviann-UX-Plan-v0.1.md` before changing anything.

I have provided a design handoff with `CODEX-MASTER-DEVELOPMENT-PROMPT.md`, `BRAND-AND-UX-SPEC.md`, the approved
brand/UI image `references/approved/Laviann-approved-visual-board.png`, and earlier SVG layouts under
`references/legacy-layouts`. Read and follow them. The master brief defines the long-term development plan, but for THIS
task **implement only Milestone A** and prepare a reviewable PR. Do not build an unreviewed Supabase schema or pretend
the system processes live orders.

**Brand is approved:** LAVIANN; tagline exactly **Quality Meats, Greater Meals.** Forest green and ivory shared palette;
Big Shoulders Display/appropriate existing Big Shoulders heading face; Inter body. Recreate actual scalable SVG wordmark
with a VERY SMALL one-color simplified steak-cut accent over the `I`, and a matching `L` app icon with understated meat
accent; forest green on light and white on dark. No leaf, red steak icon, or large meat illustration. Source files
belong in `packages/shared/assets/images/branding`; use existing predev/prebuild recursive copying that preserves nested
directories and overwrites matching names, without watching or deleting.

**Visual UI:** build responsive customer home/catalogue, category, product customization, cart, checkout/request review
and request-submitted preview screens, and vendor overview/orders/inventory shells, using genuine components and
properly labeled deterministic demo data. Also scaffold the remaining PRD routes cleanly where justified, but prioritize
quality and honest interaction over dummy page count. Mobile-first customer (390px and 320px); responsive vendor
desktop/mobile (1440px and 390px). Match the approved screenshot's spacing, color hierarchy, photo direction and card
shape, NOT every literal placeholder text or sample price. Use shared Tailwind v4 semantic colors and
`@laviann/shared` - no duplicate palette.

**Nonnegotiable business content:** raw **Chicken and Beef** only initially; use PRD prices and MUR. Customer chooses
weight, cuts, package count/size (2kg in 4x500g packs), and eligible vendor-set dates/zone; cash on delivery, MCB Juice
or bank transfer ONLY. Checkout CTA is **Submit order request**, not Place Order/Pay Now; the requested order starts
Pending Review and cannot claim immediate confirmation, reservation, payment or delivery. Vendor review -> current
quotation -> explicit customer approval are SEPARATE later milestones. Images may use tasteful placeholders; do not
suggest merchant-owned stock or verified local sourcing without evidence.

**Execution:** create a feature branch off the correct reviewed base (do not overwrite or merge main); first report
codebase audit and concrete plan; implement; run asset/theme tests, lint, TypeScript checks, production build and
relevant UI tests; compare mobile/desktop screenshots, address accessibility and responsive overflow; update docs/AGENTS
instructions only where necessary. Open a PR if permission permits; do NOT auto-merge it. In the PR clearly distinguish
preview-only interactions from production-secure flows, list files and tests, and propose Milestone B for approval.
