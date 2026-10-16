# Paste into Codex - BUILD THE COMPLETE LAVIANN POC

You are the implementation agent for my EXISTING repository **danielgithiomi/Laviann**. Your assignment is to **develop
the working Laviann proof of concept end to end**, not create a new project, only a plan, or only attractive screen
mockups. Use the attached handoff folder, especially `CODEX-MASTER-DEVELOPMENT-PROMPT.md`, `BRAND-AND-UX-SPEC.md`,
`references/approved/Laviann-approved-visual-board.png`, and the repository's **current** `docs/PRD.md`. The master
prompt includes the detailed engineering appendix and required tests; treat all of it as implementation instructions.
The attached `product/PRD.md` is only a convenient snapshot and must not replace a newer repository version.

**First examine the actual checkout/branch/worktree before writing code.** My monorepo already contains two Next.js
React/strict TypeScript apps (`apps/customer` :3000, `apps/vendor` :3001), Bun workspaces, Turborepo, Husky, GitHub
Actions, Supabase JS configuration direction, and the `@laviann/shared` workspace with shared colors, Tailwind CSS v4,
shared fonts, starter UI and recursive asset copying. The latest shared foundation may still be on branch
`chore/shared-foundation` and not yet merged to `main`. Select the reviewed branch containing the latest shared setup;
explain your choice and create a non-destructive feature branch/worktree. **Do not recreate or replace the scaffold,
duplicate theme configuration, bypass Git hooks or rewrite history.** Read root/nested `AGENTS.md`, current accepted
ADRs (including Tailwind/font ADR), UX plans, tests, lockfile and package exports; update agent documentation when rules
change.

**Approved branding:** name LAVIANN; exact tagline **Quality Meats, Greater Meals.**; modern premium butcher/shop
aesthetic, deep forest #12382F, sage #AFC799, ivory #F4F7F3, white surfaces, charcoal text and restrained terracotta.
Heading type is the existing compatible Big Shoulders / Big Shoulders Display family; UI/body Inter. Create original
scalable, accessible one-color SVG logos with a **VERY SMALL simplified meat-cut/steak outline over the I**, plus an
L-shaped app icon with the same restrained accent; no leaves, oversized steak, red/orange meat logo, photoreal icon or
gradients. Put source SVGs in `packages/shared/assets/images/branding` and use the existing predev/prebuild sync, which
**preserves nested folders, overwrites same-name files, never watches, never deletes**. Reuse `@laviann/shared` theme
CSS/Tailwind v4; do not hardcode color values in every app.

**Product truth (PRD wins over pictures):** one Mauritius raw-meat vendor, initial categories **Chicken and Beef** only;
browse without login; customer chooses product/cut/weight/portions, delivery zone and an eligible vendor-offered date,
enters name/phone/address, selects **cash on delivery, MCB Juice or bank transfer** and submits an **order request**.
Checkout must say **Submit order request**, NOT Place Order or Pay Now. The order initially becomes **Pending Review**,
NOT immediately paid, confirmed or reserved. The vendor (authenticated) reviews requests including manually transcribed
WhatsApp orders, issues a **versioned digital quotation**, copies/shares its secure link manually; customer explicitly
approves the **latest valid quotation**; a trusted atomic operation revalidates stock/date and reserves inventory;
vendor then prepares/packages, dispatches/delivers and manually records independent payment status. Unapproved older
quotes cannot be confirmed. Product prices, stock and zone fees are configured server-side, with PRD sample data clearly
labelled demo. No multi-vendor marketplace, cooked foods, pork/lamb seed products, card payments, bank/WhatsApp
automation or falsely verified local-sourcing claims. An example six-kilo request (2kg breast + 2kg drumsticks + 2kg
wings, all 500g packages, North) must total **Rs 2,095** using the PRD's dummy fees/prices.

**Target output:** A visually polished mobile-first customer storefront (all nine PRD customer screens) and responsive
vendor dashboard (all ten vendor screens) using real, accessible components and meaningful interactions. Implement the
actual Supabase migration/seed/RLS/auth/server boundaries, strongly validated order and quote operations, safe guest
links, atomic idempotent inventory reservations/consumption and cancellation, vendor-managed schedules and delivery
fees, manual payment/WhatsApp workflows, and the eight PRD demo scenarios. Customer photos can be safe placeholders
until the real vendor supplies photos. Never mistake the AI-generated visual board's sample text and prices for business
requirements. If safe Supabase credentials or a local database are unavailable, write the real integration
code/migrations/tests, provide exact setup steps, and keep any fixture-only screens visibly labelled demo; do not
pretend that mock mutations are persisted.

**Work plan and delivery expectations:** audit the repo and summarize plan first; then **implement the full P0** in
coherent milestones (A branding/responsive design; B Supabase/RLS/auth; C catalogue/cart/request; D quotes/approval; E
inventory/delivery/manual payments; F testing/hardening). Do not stop at Milestone A unless a genuine permission,
unavailable service, or essential approval blocks further work. Prefer separate PRs for reviewable milestones if
permissions and workflow allow; otherwise use clean incremental commits and one clearly explained reviewable PR. **Never
merge a PR to main without me reviewing and approving it.** Do not perform a live merchant deployment or real payments.
Update docs, accepted ADRs and `AGENTS.md` as implementation advances.

**Quality gates:** run `bun run test:assets`, `bun run test:theme` (if present), `bun run check`, `bun run build` and
relevant unit/integration/browser tests; fix failures. Run local Supabase transaction/concurrency and RLS tests when
infrastructure allows. Check customer at 320/390/768/1440px and vendor at 390/768/1440px with accessible semantics and
no overflow. Provide screenshots, truthful test outputs, security audit notes, environment templates, migration/seed
guide, demo workflow guide, PR links or exact commands, and a mapping to the PRD's eight acceptance scenarios. Mark
every unavailable integration and unrun test honestly.

**Before making changes, report:** checked-out branch/worktrees, current status/available packages, exactly which files
you read, any conflicts between older mockups and the current PRD, Milestones A-F implementation approach, tests you can
run, and blockers. Ask at most the genuinely essential high-risk questions not already settled. Then proceed with
substantial implementation, not merely a rewritten plan.
