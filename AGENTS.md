# Laviann - agent instructions (provider-neutral)

> **Read this file before changing code.** These instructions are written for Codex,
> Claude Code, Cursor, Copilot, Gemini, and other autonomous coding assistants.
> They are repository instructions, not a request to implement the entire PRD.

## Mission

Laviann is a **single-vendor raw-meat ordering and delivery management product** for
Mauritius. The initial deliverable is a demonstrable proof of concept for one actual
vendor. The user asked to start by scaffolding the project, then move into UX planning; **do not assume the screens,
flows, integrations, or backend schemas are approved for
implementation solely because this scaffold exists.**

**Customer value:** Browse raw meat, choose quantity, cuts and packaging, provide
contact/delivery details, submit an order request, and approve a reviewed quotation. **Vendor value:** Centralize orders
from the storefront and WhatsApp, manage product
availability and stock, review and revise quotations, prepare and group orders by
vendor-controlled delivery zones, and record payment/delivery progress.

## Business context - current process

1. Customers message orders via WhatsApp (e.g. 6 kg chicken with different cuts).
2. Vendor notes the request by hand and photographs the written order.
3. Vendor sends the photograph to the customer for approval.
4. Vendor cuts/packages raw meat and delivers on its own regional delivery day.

Laviann replaces the handwritten order/photograph with a structured order, a reviewed
quotation and an explicit customer confirmation. It should **not** force current
WhatsApp customers to migrate immediately: the vendor must be able to create an order
manually in the dashboard and share its confirmation link over WhatsApp.

## Scope boundaries

- **Exactly one vendor** for the POC. No multi-vendor marketplace, commissions or
  vendor self-registration.
- **Raw meat only:** chicken, beef, raw mince and additional raw products. Do NOT add
  fried, cooked, marinated, recipe, restaurant, or prepared-food features.
- Customers can order by weight or fixed packs and request cuts/packaging (e.g.
  2 kg breast split into four 500 g packs). Separate cuts and whole-chicken cutting
  instructions are both supported; complex yields may require vendor review.
- **Vendor holds physical stock**. Inventory needs on-hand, reserved and available
  quantities, an adjustable target, and a default 10% low-stock alert. Do not
  double-count whole animals and their derived cuts.
- Vendor determines delivery dates; customers choose only offered dates for their
  region, not arbitrary delivery appointments. Five zones, lowest to highest fee:
  Central Rs 75, North Rs 125, West Rs 150, East Rs 175, South Rs 225.
- Prices are **prototype-only**, in Mauritian rupees: whole chicken 235/kg, breast
  475/kg, drumsticks 290/kg, thighs 350/kg, wings 220/kg, beef mince 830/kg,
  beef cubes 830/kg, rump steak 1100/kg. These are NOT the vendor's agreed prices.
- Payment preferences: cash, MCB Juice, bank transfer. Initial payment recording
  is **manual**. Do not claim Juice/API payments are automatically verified.
- **Customer approval is required** after vendor review. Preserve quotation
  version, exact items/prices, and time of approval. A changed quote requires a
  new approval and invalidates earlier links.
- Payment status is separate from order/preparation/delivery status.
- No native mobile app for POC: the customer application is a mobile-first
  responsive **Next.js website reachable via a shareable URL** (no app-store step).
- WhatsApp API automation, live driver tracking, automatic route optimization,
  loyalty, subscriptions, multi-vendor operations, complex accounting and full
  staff permission management are **outside MVP scope**.

## Agreed stack and repository

- Package manager and workspace system: **Bun** (do not introduce npm/yarn/pnpm
  lockfiles; commit the generated `bun.lock` after running Bun locally).
- Monorepo task runner: **Turborepo** (`turbo.json`).
- Customer app: **Next.js App Router + React + strict TypeScript**, under `apps/customer`.
- Vendor admin: **Next.js App Router + React + strict TypeScript**, under `apps/vendor`.
- Backend direction: **Supabase** (PostgreSQL, Auth, Storage, Realtime and secure
  server-side/database functions). Do not create a separate NestJS service unless
  a later approved architecture decision requires one.
- Documentation: `docs/PRD.md` is the authoritative product requirement source;
  `docs/Laviann-PRD-v1.0.pdf` is the formatted presentation copy. If requirements
  change, update the Markdown first and regenerate the PDF.
- Shared packages: introduce them under `packages/` **only when genuinely shared**;
  do not duplicate contracts or create speculative abstraction layers.

### Important directories

```text
Laviann/
  AGENTS.md                 # This source-independent guide
  README.md                 # Setup and contributor overview
  CONTRIBUTING.md           # Coding and commit rules
  apps/customer/            # Mobile-first customer Next.js app (port 3000)
  apps/vendor/              # Vendor admin Next.js app (port 3001)
  packages/                 # Reserved for truly shared packages
  docs/PRD.md               # Editable product requirements source
  docs/Laviann-PRD-v1.0.pdf # Pitch-friendly PRD
  docs/commit-conventions.md
  docs/decisions/           # ADRs for architecture choices
  scripts/validate-commit-msg.sh
  .husky/pre-commit         # Runs workspace lint and typecheck
  .husky/commit-msg         # Enforces Conventional Commits
```

## Always follow this task workflow

1. **Read context:** `AGENTS.md` and the relevant sections of `docs/PRD.md`.
2. **Check scope:** State whether requested work is POC-required or a future idea.
   Do not build speculative features without approval.
3. **Outline affected areas:** Customer, vendor, Supabase, docs, shared packages.
4. **Implement the smallest coherent change:** Use typed interfaces and clean
   boundaries. Keep business rules centralized and avoid needless indirection.
5. **Test appropriately:** At minimum run `bun run lint` and `bun run typecheck`.
   For a finished deliverable, also run `bun run build` and focused tests when
   available. Repair failures instead of bypassing hooks.
6. **Document behavior:** Update the PRD if changing product rules; add an ADR
   under `docs/decisions/` for a material architectural decision. Do not let docs
   and runtime behavior silently diverge.
7. **Summarize accurately:** State what changed, tests run, and any blockers.
   Do not claim packages, integrations, builds or tests succeeded if they did not.

## Correctness and safety invariants

- **Pricing trusted on server**; never trust client-provided totals, fees or prices.
- Supabase Row Level Security must restrict user data. Never expose privileged
  service credentials in browser code or `NEXT_PUBLIC_*` values.
- Reservation of limited inventory must be **atomic**, with server-verified
  availability and idempotency for retries; avoid race-condition overselling.
- State model: Pending Review -> Awaiting Customer Confirmation -> Confirmed ->
  Preparing -> Ready for Delivery -> Out for Delivery -> Delivered; allow
  Cancelled/Rejected and quotation revisions. Enforce permissible transitions.
- **Requests do not permanently consume inventory**. Approved quotations reserve
  stock, and physical deductions occur only once under a documented transition.
- Keep immutable snapshots of accepted product quantities, cutting instructions,
  packaging, charges, and delivery commitment with a quotation version.
- Cut yields and unexpected weight deviations are **unvalidated vendor policy**:
  request review/approval instead of fabricating a physically impossible output.
- Vendor controls zone delivery dates and cutoffs. Fees and schedules are
  configuration, not permanent code constants.
- Manual WhatsApp flow must produce normal orders and the same approval process.
- Guest order links must be expiring/unpredictable and scoped to the correct
  customer/quotation; never expose arbitrary order IDs with public read access.
- Demo data and simulated integrations must be clearly labeled as such; never
  pretend to process real payments or automatically message customers.
- Before commercial launch, verify Mauritius data-protection, food-safety,
  invoice/tax, and payment requirements with appropriate professionals.

## Conventions and commands

- TypeScript strict mode. Prefer explicit domain types and validation at inputs.
- Use App Router and server-first components where appropriate; place secrets and
  sensitive mutations only in trusted server code.
- Avoid `any`, unchecked casts, disabled ESLint rules or `@ts-ignore` unless the
  need is documented and narrowly scoped.
- When adding dependencies, use **Bun** and keep the workspace lockfile consistent.
- `bun install` - restore workspace dependencies / generate the initial bun.lock.
- `bun run dev` - start both apps (ports 3000, 3001).
- `bun run dev:customer` / `bun run dev:vendor` - start one app.
- `bun run lint` - lint each workspace with Turborepo.
- `bun run typecheck` - TypeScript check of each workspace.
- `bun run check` - both checks, required before every commit (Husky pre-commit).
- `bun run build` - build both apps.
- `bun run test:commit-msg` - validate representative Conventional Commit messages.
- Never bypass hooks with `--no-verify` merely to make a commit pass.

### Git commit message policy

Use [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
with lowercase types and optional lowercase scopes. Subject at most 72 characters,
no trailing period, begin summary with lowercase action verb.

Examples:

```text
feat(customer): add configurable meat weight selection
fix(inventory): prevent over-reservation
chore(repo): configure bun and turborepo
refactor(vendor): simplify order status transitions
docs(prd): clarify fixed-pack pricing
```

Breaking changes use `!` or a `BREAKING CHANGE:` footer. Detailed rules in
`docs/commit-conventions.md`. Husky `pre-commit` runs the full repo lint+typecheck,
then `commit-msg` validates messages. Husky only works after installing dependencies
in an initialized local Git repository; it is not a remote branch policy.

## Stage gate / next steps

**Current stage:** scaffolding + requirements recorded. The customer/vendor pages
are neutral placeholders, NOT a finished UX or production application.

**Next:** user-flow mapping, screen inventories, wireframes, visual UI design,
then technical implementation decisions and feature development. Ask before
making large product/architecture deviations. User handles GitHub creation and
remote linking; do not create/push a GitHub repository without an explicit request.

## Source-of-truth hierarchy

1. Latest explicit user decisions in the current task.
2. `docs/PRD.md` for product requirements and acceptance criteria.
3. Accepted ADRs in `docs/decisions/` for architecture rationale.
4. `AGENTS.md` for process and overarching context.
5. Source code and tests for current implementation status.

When these conflict, explain the discrepancy and update all affected records.
