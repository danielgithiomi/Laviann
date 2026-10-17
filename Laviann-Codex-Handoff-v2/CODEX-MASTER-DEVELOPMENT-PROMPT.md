# CODEX MASTER BRIEF - LAVIANN CUSTOMER + VENDOR PLATFORM

**Instructions to the coding agent - FULL PRODUCT IMPLEMENTATION**

You are a senior full-stack product engineer, UX engineer, and technical architect contributing to the **existing**
Laviann monorepo. Do not initialize a fresh project, rename workspaces, replace the current setup with a new template,
or treat design screenshots as functional specifications. Your mandate is to implement the approved Laviann proof of
concept in small, testable, reviewable increments. Read the following instructions and inspect the actual codebase
before modifying anything.

This is a DEVELOPMENT MANDATE, not permission to deploy, create merchant accounts, run real payments, expose a real
customer database, merge to `main`, or silently choose unresolved business policy. Run tests, explain your changes, and
submit a pull request if GitHub access permits. If a required credential, business assumption or approval is missing,
continue with the safe, independently useful work and document the blocker instead of inventing a value or pretending
that an integration works.

## 0. Read and obey the sources of truth

First inspect your current Git working tree/branch, repository instructions, workspace and dependency versions, and test
status. Read these repository files, or their current equivalents:

- `AGENTS.md`; any more-specific `AGENTS.md` files in `apps/customer`, `apps/vendor`, or packages.
- `CLAUDE.md` if present (it points back to provider-neutral instructions).
- `docs/PRD.md` (authoritative product requirements and eight demo acceptance scenarios).
- `docs/ux/Laviann-UX-Plan-v0.1.md` (customer and vendor screen inventories and prior interaction concepts).
- `docs/decisions/0001-monorepo-and-backend.md` and `docs/decisions/0002-shared-foundation-and-assets.md` (architecture
  decisions).
- `docs/design/` for earlier exploratory vector screen designs; compare against the newly approved brand below.
- `README.md`, `CONTRIBUTING.md`, `package.json`, `bun.lock`, `turbo.json`, both Next.js app manifests/configurations,
  shared theme and font files, CI, and asset synchronization scripts.
- This bundle's `BRAND-AND-UX-SPEC.md`, `references/approved/Laviann-approved-visual-board.png`, and selected
  `references/legacy-layouts/*.svg`.

**Precedence:** latest explicit project-owner directions and the approved brand spec > PRD for behavior > accepted
architecture decisions > agent instructions > earlier UX concepts > literal content inside AI-rendered mockups. In case
of conflict, call out the discrepancy in the PR or decision log. Do not silently alter core workflows to match a
screenshot.

The previous `chore/shared-foundation` branch may or may not have been merged into `main` when you run. Detect which
branch contains the newest approved shared foundation. Avoid duplicate installation of things already in place. If the
required branch has not been merged, base your feature branch on the appropriate reviewed code; tell the owner which
branch you used. Do not force-push or rewrite history.

## 1. Product mission and boundaries

**Laviann** is a Mauritius-focused single-vendor **RAW MEAT** ordering and delivery-management proof of concept. It
replaces handwritten WhatsApp order summaries with a customer website and a vendor-admin workflow. It is NOT a
food-ordering marketplace, a restaurant platform, a prepared-meal service, or a multi-vendor system.

- **Customer application**: public/mobile-first responsive Next.js website on port 3000; initial browsing works without
  login, accessible by link shared over WhatsApp. Shoppers choose raw meat, weights, cut preferences, package
  sizes/count, delivery zone/date, payment preference and submit a **request**, not an immediately binding purchase.
- **Vendor application**: separate responsive Next.js admin on port 3001 with authenticated access, catalogue, stock
  management, request review, quotations, manual WhatsApp order entry, fulfillment, delivery schedules and recorded
  payment status.
- **Supabase**: planned PostgreSQL/Auth/Storage/Realtime backend with server-trusted operations and Row Level Security;
  only after technical design and safe credential handling. Do not invent a separate NestJS API.
- Exactly one vendor for POC. No vendor marketplace onboarding, customer loyalty, recommendations, cooked meals,
  automatic WhatsApp Business API messaging, live GPS tracking, card payment processing, or unsupported claims of
  production readiness.
- Customer order/purchase data, customer phone numbers and addresses are confidential. Guest order links must not expose
  other customers' records.

## 2. Approved visual identity (implemented before screens)

Use `BRAND-AND-UX-SPEC.md` and `references/approved/Laviann-approved-visual-board.png`.

- Name: `LAVIANN` in branding; natural sentence-case `Laviann` in body copy.
- Exact tagline: **Quality Meats, Greater Meals.** Marketing may render uppercase.
- Logo: condensed wordmark with a **small monochrome steak-cut outline** as a restrained accent above the `I`. The mark
  is optically around one quarter to one third of the cap height, not a large red steak dominating the lettering. The
  alternate app icon is a bold `L` with a similarly understated cut mark. No leaves, no red accent in the logo, no
  gradient/meat photo in the mark.
- Generate proper simple SVG vector assets from the brief, not a cropped screenshot. Include default/inverted wordmark
  and icon variants, title/aria information where appropriate, 24px favicon check, and a basic brand usage note. Place
  canonical image files under `packages/shared/assets/images/branding/`.
- Primary palette: `#12382F` deep forest, `#AFC799` sage, `#F4F7F3` ivory canvas, `#FFFFFF` white surfaces, `#263D35`
  text, `#687A73` muted, `#C76B50` terracotta. Use additional approved shared tokens (`primaryStrong`, pale sage,
  border, warning background) already defined in repository.
- Type: **Big Shoulders Display** as visual heading reference, **Inter** for body UI. The existing project may already
  load variable `Big_Shoulders` and Inter via shared `next/font` code. Inspect and compare to approved aesthetics; make
  changes in the shared source only if necessary and tested.
- Modern premium food retail UI: photographic raw meats, light backgrounds, spacious cards, forest CTAs, clean forms,
  readable mobile interactions; vendor dashboard compact and operational, not a restaurant POS. Natural, trusted feel
  but do not assert verified local sourcing unless vendor confirms it.
- All responsive layouts: customer mobile-first with ~390px reference and 320px minimum; desktop ~1440px. Vendor desktop
  emphasis with responsive 390px mobile orders/cards. Touch targets ~44px where practical, sufficient contrast, visible
  focus and errors.
- **Do not reproduce generated boards literally**: they may show lamb/pork, wrong prices, card payment, a `Place Order`
  checkout button, a fake success timeline, or unsupported sourcing claims. Implement business reality from PRD instead.

## 3. Existing monorepo constraints (do not undo work)

The project already uses Bun workspaces and Turborepo:

```
Laviann/
  apps/customer/     # Next.js App Router, React, strict TypeScript; :3000
  apps/vendor/       # Next.js App Router, React, strict TypeScript; :3001
  packages/shared/   # @laviann/shared local Bun workspace (not a third app)
    src/theme/       # colors.ts, index.ts, theme.css, typography.ts, fonts.ts
    src/ui/          # shared React UI primitives (existing PageShell)
    src/types/       # shared types/contracts
    assets/images/   # canonical static image source; nested folders allowed
  scripts/sync-brand-assets.mjs
  docs/PRD.md
  docs/decisions/
  AGENTS.md
  turbo.json
  bun.lock
```

- Bun is the sole dependency manager; use its workspace protocol, keep a **single root `bun.lock`**, and never introduce
  npm/yarn/pnpm lockfiles.
- Next.js App Router; prefer server components when suitable, reserve client components for interactions. Strict
  TypeScript, no casual `any` or unchecked assertions.
- Tailwind CSS **v4 is already configured on the shared-foundation feature branch**. Check actual source before
  changing. Prefer shared `@theme inline` tokens, utility classes and small semantic components to another independent
  theme or a competing style system.
- Actual theme token path: `colors.ts` stores hexes -> `packages/shared/src/theme/index.ts` defines `themeVariables` ->
  each application's root `<html style={themeVariables}>` sets CSS custom properties ->
  `packages/shared/src/theme/theme.css` maps these to `--color-*`, `--font-*` with Tailwind v4. Do not add duplicated
  colors in application CSS or a second Tailwind config.
- Shared code is imported using `@laviann/shared/...`; do not copy TS source into each app. Add shared
  types/utilities/UI only when genuinely reused.
- Brand assets: source at `packages/shared/assets/images/<arbitrary nested folders>`; script recursively copies into
  `apps/customer/public/assets/images/` and `apps/vendor/public/assets/images/`, **preserving all subdirectories and
  names, overwriting existing same-name files**, without watching or deleting destination files. `.gitkeep` and
  `.DS_Store` are skipped. Each app's `predev` and `prebuild` invokes sync. Preserve these semantics, tests and caching
  behavior.
- Distinguish brand/static assets from vendor-uploaded product photos (future Supabase Storage).
- Existing Husky: lint+typecheck pre-commit, Conventional Commit scope and matching branch trailer; CI installs
  Bun/Node, tests shared assets/theme, lint, typechecks and builds. Preserve or extend quality checks, do not circumvent
  them.
- Preserve existing docs and history; document decisions rather than overriding previous agreements.

## 4. Customer experience - complete planned screen inventory

Implement mobile-first, responsive views and meaningful interactions. Use the exact PRD logic; for a first UI-only
milestone use clearly labeled fixtures/states rather than claiming live persistence.

**C-S01 Home / catalogue**

- Primary brand hero with tagline or complementary copy, raw beef/chicken photography, discreet delivery-region hint,
  prominent browse CTA.
- Browse Chicken and Beef categories, product cards with name, demo price/unit, availability, image placeholder,
  add/view affordance.
- Search/filter only when backed by real fixture/backend logic; no nonfunctional decorative controls.
- On desktop, wider hero and multi-column product catalogue; navigation adjusts responsively.

**C-S02 Category listing**

- Category filter controls for Chicken/Beef, search/sort if functional, stock states, empty/loading/error states,
  accessible card links.

**C-S03 Product detail / customization (highest UX priority)**

- Show raw cut and price per unit, availability, allowed selling mode (weight or fixed pack), minimum/increment, cut
  style and instructions, packaging options; support vendor-review notes for unsupported physical cut requests.
- Distinguish product quantity from package count. Example: 2kg chicken breast with 500g packs = exactly 4 packs.
  Packaging preview updates instantly and blocks invalid combinations. More complex remainder packs only if allowed;
  surface constraints without silent assumptions.
- Price estimate recalculates from selected quantity and configured unit price (not arbitrary screenshot values).
  Sticky/near-bottom action on mobile that does not obscure form controls.

**C-S04 Cart**

- Every line shows product, selling quantity, selected cut/preparation notes, package size/count, estimated unit/line
  price. Edit/remove retains configuration, recalculates prices, persists a short-lived local cart appropriately (never
  trust it server-side).

**C-S05 Checkout**

- Customer name and phone; optional email if approved; delivery region, locality, full address/landmark; only
  vendor-offered eligible delivery dates; delivery fee shown clearly.
- Payment preference is **cash on delivery, MCB Juice, or bank transfer**, vendor-configurable. No card gateway or
  automatic online payment. Explain manual verification for transfers.

**C-S06 Request review**

- Full estimated order + delivery summary, instructions, packaging, preferred payment, zone/date, agreement explanation.
  CTA **Submit order request**. Explain the vendor will review and issue quotation; this does NOT reserve stock or
  confirm purchase.

**C-S07 Submission acknowledgement**

- Show order reference, **Pending Review**, next steps, access to secure status link if backend ready. No fake instant
  approval/delivery updates.

**C-S08 Latest quotation confirmation**

- Customer can review latest version, itemized costs/fees, zone/date, vendor notes; approve current quote explicitly or
  request revision. Outdated or expired links cannot approve. Label changes between original request and quote.

**C-S09 Order status**

- Current status timeline and payment state shown separately; guest links are secure, expiring, unguessable and
  quote/customer-scoped. No public order enumeration.

## 5. Vendor experience - complete planned screen inventory

**V-S01 Vendor login** with Supabase Auth once configured, accessible forms, server-side route protection and a single
admin scope. No fake login that gives open access to real private data.

**V-S02 Overview**: actionable summary cards for new requests, awaiting customer approvals, preparation, scheduled
deliveries, low-stock exceptions; click-through operational actions. Simple charts only if supported by real/demo
dataset and correctly labeled.

**V-S03 Orders queue**: search and filter by status/date/zone; view request source (`website` or `vendor_entered`),
summary, customer, payment status separately; mobile uses stacked cards, desktop uses readable table.

**V-S04 Order detail**: contact, delivery, all customized items/pack counts/instructions, review/change quote with
versioning, send/copy approval link, track and perform only valid status transitions. Display quote history and
immutable approved snapshot; show loading/error/permission states.

**V-S05 Create order manually**: enter customer details and raw meat configurations transcribed from WhatsApp/phone; tag
origin `vendor_entered`; produce same Pending Review -> quotation -> approval pipeline. No API-based WhatsApp messaging
in POC.

**V-S06 Products**: manage chicken/beef products, available products, prices (dummy until confirmed), category
expansion, weight/cut/pack choices; future new raw meat categories should be data-configurable, not hard-coded into
source.

**V-S07 Inventory**: on-hand/reserved/available, adjustment/replenishment, per-item target and 10% default low stock
threshold, movement trail where implemented; no double-counting whole product and derived cuts.

**V-S08 Deliveries**: group eligible confirmed orders by vendor-set date and Central/North/West/East/South zone; contact
and address, simple progress controls; no Google Maps/driver tracking assumptions.

**V-S09 Delivery settings**: edit zone fee, offered weekly days, exceptions, cutoff and unavailability, respecting
existing committed quote snapshots.

**V-S10 Payment settings**: enable vendor-approved cash/MCB Juice/bank-transfer preferences and instructions; record
payment state separately from fulfillment.

## 6. Demonstration data (must match PRD, not screenshots)

Initial **Chicken** products priced in MUR/kg (dummy only): whole chicken 235, breast 475, drumsticks 290, thighs 350,
wings 220.
Initial **Beef** products MUR/kg: mince 830, cubes 830, rump steak 1100.

Delivery zones/fee examples (dummy): Central Rs75; North Rs125; West Rs150; East Rs175; South Rs225. Weekly example
only: Central Monday, West Tuesday, East Wednesday, North Thursday, South Friday. Actual fee, coverage, days and cutoff
must be vendor configurable and validated.

Reference six-kilo demo: 2kg chicken breast (Rs950) + 2kg drumsticks (Rs580) + 2kg wings (Rs440) = Rs1,970 subtotal;
North delivery Rs125; **Rs2,095** grand estimated total; 500g portions across the three lines = **12 packages**.
Packaging fee is Rs0 by default. Do not display inconsistent amounts.

Use exact decimal arithmetic (integer cents or suitable decimal representation), and explain units when doing pricing
and rounding. Client totals are estimates; authoritative pricing and fee computation occurs server-side in live flows.
Historical quote snapshots preserve accepted amounts.

Payment states: Unpaid, Payment Reported, Paid, plus Failed/Refunded when applicable. Order/fulfillment states: Pending
Review -> Awaiting Customer Confirmation -> Confirmed -> Preparing -> Ready for Delivery -> Out for Delivery ->
Delivered; Cancelled/Rejected supported through guarded transitions. Independently represent both kinds of state.

## 7. Trusted data architecture and security design gate

Before creating Supabase migrations or privileged actions, **write a short technical design/ADR** for review. Cover data
model, primary keys, relationships, current-quote snapshot/version mechanics, guest link tokens, RLS strategy, vendor
authentication, transactional inventory reservation and idempotency, public read boundaries, payment state, and
migration/seed strategy. The PRD defines conceptual entities but DOES NOT specify final schema naming. Do not claim
schema approval merely because a UI exists.

Conceptual records include: vendor user; customer contact; category/product/configuration; inventory item, movement and
reservation; order/order item; versioned quotation/quotation line, approval; delivery zone, schedule and offered date;
payment record; communication/audit event. Normalize only as needed; avoid over-engineering speculative abstractions.

Non-negotiable business invariants:

1. Vendor-only operations require server-side authorization. Enforce Supabase RLS; do not expose privileged keys to
   browser/`NEXT_PUBLIC_` variables. Guest reads must be narrowly authorized.
2. Submitted requests are **Pending Review** and do **not** permanently reserve inventory.
3. Vendor issues a versioned quotation. Only the **latest** unexpired quote can be approved by its intended recipient.
   Invalidate old tokens upon revision, cancellation, or expiration.
4. On customer approval, in one trusted PostgreSQL transaction/function, validate quote currentness, zone/date
   eligibility and stock; atomically reserve physical quantity; idempotently mark Confirmed and record approved
   version/timestamp/snapshot. Two concurrent customers cannot reserve the final stock twice.
5. `available = on_hand - reserved`. Physical stock consumption occurs once at the documented preparation/fulfillment
   transition and releases the corresponding reservation without double-deducting available. Eligible early cancellation
   releases a reservation safely; later changes require vendor review.
6. Separate cuts vs cutting whole meat have distinct stock semantics; do not double count yields or promise impossible
   cutting proportions.
7. Prices, fees, quantities, delivery commitment, cuts and packaging accepted in an approved quotation are snapshotted;
   updating catalogue/zone configuration never retroactively changes accepted orders.
8. Payment method selection and `Paid` state do not imply verified processing; MCB Juice and bank transfers require
   vendor manual verification. No automated WhatsApp, Stripe, cards or push notification integrations unless explicitly
   approved.
9. Validate all untrusted form inputs and privilege boundaries at server boundary using shared schemas as needed;
   TypeScript interfaces alone do not validate runtime requests.
10. Use rate-limiting/abuse protections on guest submissions and token endpoints where practical; never enumerate orders
    using public numeric IDs. Use safe error messages, idempotency keys, and audit logging on critical transitions.

If Supabase is not connected, you may build a clearly labeled **non-persistent UI preview** using local demo fixtures.
Keep its data abstraction explicit and do not pretend mock approvals or inventory changes are secured or saved. Do not
seed real customer phone numbers or merchant credentials.

## 8. Suggested milestones - separate reviewed PRs

### Milestone A - brand, design system and responsive frontend shell

- Audit shared package and current Tailwind v4/font integration. Keep the existing workspace architecture.
- Create production-ready monochrome vector logo variants and documentation, place source in shared brand-assets tree,
  run existing asset sync.
- Apply exact tagline, hierarchy, brand styles, tokens to both apps. Use a component vocabulary consistent across mobile
  customer and desktop/mobile vendor.
- Implement responsive, navigable **customer** and **vendor** screen shells with safe demo fixtures, correct initial
  categories, payment methods and button copy. Begin with customer home, category, product detail, cart,
  checkout/request review; vendor overview, orders, inventory. Add remaining states/screen shells if manageable.
- Make fixtures deterministic and clearly tagged demo-only. UI actions should operate on local preview state if backend
  absent, never misleadingly claim persisted requests.
- Add unit/component/accessibility/responsive checks for implemented functionality. Document screenshots/limitations and
  submit one PR.

### Milestone B - technical design, Supabase schema and authentication

- Propose ADR and DB migrations, RLS, vendor auth, guest access strategy, typed server operations, seeded demo data.
  Review before irreversible data-policy choices. No privileged credentials in web output.
- Set up local/migratable schema, tests and rollback plan. Ensure both app builds without external production secrets
  where reasonable.

### Milestone C - catalogue, customization, cart and request submission

- Persist product/category/options from trusted DB, validate weights and packaging, server-quote estimates, accepted
  delivery dates, duplicate submit protection. Complete customer C-S01-C-S07 and vendor queue receiving requests.

### Milestone D - vendor quotations and secure customer approvals

- Vendor review/revision and manual WhatsApp creation, immutable versioned quote snapshots, secure expiring approval
  links, customer explicit approval and retries. Complete C-S08/09, V-S03/04/05. Cover stale quote rejection and
  security tests.

### Milestone E - inventory, delivery, payments

- Atomic/idempotent reservations with concurrency tests; on-hand/reserved/available and replenishment; vendor date/zone
  settings, route grouping and status changes; manually verified independent payment status and clear instructions.

### Milestone F - POC hardening and end-to-end demonstration

- Test all eight PRD scenarios, responsive 320/390/768/1440 widths, keyboard/a11y, graceful loading/empty/error states,
  audit/security review, truthful integration disclosures, docs and deploy-readiness notes. No actual merchant launch
  until vendor/legal validation.

Prefer one coherent PR per milestone rather than one huge PR. **The full-build kickoff in this handoff explicitly
authorizes implementing all P0 milestones A-F** as far as a safe environment permits: start with A, make tangible tested
progress on B-F, and do not stop at a static UI-only preview. Where repository permissions and the owner's review
workflow permit, submit separately reviewable PRs; do not auto-merge. If a PR or a business-sensitive schema decision
genuinely requires owner approval, leave a precise, actionable handoff and continue with independent safe work rather
than inventing approval. The optional phase-A-only kickoff is deliberately narrower and stops after the first UI PR.

## 9. Testing and quality gates

- Before changes: record current branch and `git status`, inspect dependencies, identify already configured features and
  run feasible baseline commands.
- After each feature slice: run applicable unit tests, `bun run test:assets`, `bun run test:theme` if present,
  `bun run lint`, `bun run typecheck`, `bun run build`; fix failures rather than bypassing Husky. Preserve GitHub
  Actions checks.
- Browser/visual QA: compare actual UI screenshots to the approved board at customer 390x844 + 1440x930, vendor
  390x844 + 1440x960. Check 320px overflow, responsive cards, touch/keyboard navigation, contrast, image alt text and
  focus indicators.
- Do not add test tools without reason; if introducing Playwright or Vitest, document why, use Bun-compatible config,
  make relevant tests reproducible locally and on CI.
- Test examples: price/units/rounding; 2kg / 500g = 4 packs; invalid remainders; disabled products; unavailable vendor
  date; quote revision invalidating prior link; idempotent duplicate submission; two concurrent approvals for last
  stock; independent payment state; cancellation reservation release.
- Do not mark unimplemented flows as passing or hide errors by disabling ESLint, TypeScript or tests. Do not claim
  external live integration was tested unless it actually was.

## 10. Implementation and handoff deliverables for every PR

1. A brief plan and affected files before editing.
2. Full implementation of the chosen milestone with shared components/contracts where appropriate and no unrelated
   changes.
3. Updated `AGENTS.md` and scoped agent docs if architectural conventions change, a versioned ADR for material
   decisions, UX documents reflecting approved behavior, and READMEs with any new setup commands.
4. Meaningful tests, their exact commands and results, plus screenshots where possible.
5. A short description of data/demo mode, what is real versus simulated, and security assumptions.
6. A pull request against the correct reviewed base branch; Conventional Commit title such as
   `feat(design): implement laviann responsive brand shell`. Do not merge into main automatically. If the environment
   lacks GitHub push rights, provide a clean commit/patch and precise commands rather than fabricating a PR link.
7. A checklist mapping the milestone to relevant PRD and brand acceptance criteria, identified blockers, and the next
   proposed milestone.

## 11. Mandatory first response from the coding agent

Before writing code, respond with:

- The detected branch, status, installed workspace layout, Tailwind/font status and current test availability.
- Which source files you read and any conflicts, especially between legacy visual mockups and PRD.
- The **immediate Milestone A implementation plan AND the roadmap through B-F**, file boundaries, intended
  routes/components, logo SVG strategy, image placeholder strategy, data/migration approach and test plan.
- Any genuinely blocking question, preferably grouped into no more than a couple of precise choices. Do not re-ask
  things already decided in this brief.

Then proceed with implementation. For the full-build kickoff, progress beyond Milestone A toward all P0 backend and
operational workflows; don't interpret the immediate first-response plan as permission to stop after a superficial
frontend. Prioritize a polished, accurate and genuinely functional Laviann POC over maximizing the number of mock pages.

---

# ENGINEERING AND ACCEPTANCE APPENDIX - PART OF THE MASTER MANDATE

# Laviann - Detailed Engineering Contracts, UX Behavior, and Acceptance Matrix

**Applies to:** Existing Laviann repository; customer Next.js app, vendor Next.js app, shared Bun workspace, and
Supabase-backed proof of concept. Read with `CODEX-MASTER-DEVELOPMENT-PROMPT.md`, `BRAND-AND-UX-SPEC.md`, and the
repository's current `docs/PRD.md`. Do not implement this as a separate project.

This is a **preferred, implementation-ready technical interpretation** of the approved PRD, not evidence that the real
vendor has validated demo prices, physical yield, legal requirements, or payment terms. Where this document proposes
internal field names and component boundaries, Codex may improve them after inspecting existing code, provided all
invariants and acceptance criteria survive and architecture rationale is recorded.

## 12. Completion target and execution policy

The desired result is an integrated, end-to-end **POC**, not a static template, a collection of screenshots, or an
API-less admin prototype. Work through all P0 stories in a sequence of testable vertical slices. Implement a preview
mode when external configuration is absent, but also provide the real schema, APIs/server operations, access controls,
and transaction tests necessary to operate the POC with local or configured Supabase. Never claim preview-mode mutations
are secure, persisted, or equivalent to real processing.

Provide a clear delivery status matrix in the final handoff: implemented and tested in live/local Supabase; implemented
but not integration-tested due to missing credentials/infrastructure; simulated preview only; future P1/P2; business
policy awaiting real vendor. Nothing may appear green merely because a screenshot matches. Complete as much of the full
P0 solution as the environment safely permits; ask for confirmation only when an irreversible or materially
business-sensitive decision cannot be derived from the PRD. Do not create a real merchant account, publish the service,
or merge into `main` unasked.

Where possible, implement Milestones A-F as successive reviewed PRs. If an autonomous task cannot await PR approval,
prepare a documented branch or series of commits covering coherent milestones, open a reviewable PR at the end, and
disclose exactly what was not reviewed independently. Do not stop after planning unless blocked. Do not force-push,
bypass checks, or create unnecessary worktrees. Preserve the owner-selected branch base and clean working-tree state.

## 13. Domain language and cross-application types

Use singular, understandable domain terminology consistently in UI, TypeScript, tests, SQL, and developer docs. Product
and inventory schemas must distinguish **requested weight** from **pack count** and **available-to-promise weight**.
Suggested contract unions (adjust spelling only if existing approved contracts already specify alternatives):

```ts
export const ORDER_STATUS = {
  PENDING_REVIEW: 'pending_review',
  AWAITING_CUSTOMER_CONFIRMATION: 'awaiting_customer_confirmation',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_DELIVERY: 'ready_for_delivery',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type PaymentMethod = 'cash_on_delivery' | 'mcb_juice' | 'bank_transfer';
export type PaymentStatus = 'unpaid' | 'payment_reported' | 'paid' | 'refunded' | 'failed';
export type OrderOrigin = 'website' | 'vendor_entered';
export type QuotationStatus = 'draft' | 'issued' | 'superseded' | 'approved' | 'expired' | 'void';
export type DeliveryZoneCode = 'central' | 'north' | 'west' | 'east' | 'south';
```

Export values/types centrally from the existing `@laviann/shared` workspace. Avoid duplicate manual interfaces in both
applications. Supabase table types should be generated from migrations (prefer existing Supabase tooling); domain view
models and transport contracts can be distinct from DB row shapes. Do not expose server-only entities or privileged
types through client imports by accident. Validate untrusted values at runtime using an appropriate shared schema
library if useful; `as OrderStatus` is not validation.

Core interface concepts: `CustomerContact`, `ProductSummary`, `ProductOption`, `ConfiguredOrderItem`, `PackagingPlan`,
`CartLine`, `DeliveryZone`, `DeliveryOffer`, `OrderRequest`, `QuotationVersion`, `QuotationLineSnapshot`,
`GuestAccessLink`, `InventoryBalance`, `InventoryMovement`, `PaymentRecord`, and separate customer/admin `OrderView`
projections. A product can have a weight-based offer, fixed pack offer, or both; its cut styles and allowable portion
sizes are explicit options rather than free-form guesses.

## 14. Recommended Supabase/Postgres model

**Before migrations:** inspect the current code, create a versioned architecture decision proposing concrete
schema/security functions, and then implement using reproducible migrations. This proposed structure is deliberately
detailed enough to avoid ambiguity but may be normalized differently if the transactional semantics remain correct.

| Entity/table concept                           | Required data and invariants                                                                                                                                                                                                                                                     |
|------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `vendor_admins` or equivalent role binding     | `auth.users` UUID reference(s) explicitly authorized as vendor owner; no public admin signup. A single account for POC. Vendor identity cannot be claimed by client-supplied role text.                                                                                          |
| `categories`                                   | UUID, slug, display name, raw-meat category, display order, active state. Seed Chicken and Beef. Future raw categories added as data, not code edits.                                                                                                                            |
| `products`                                     | UUID, category, slug, name, raw-only description, active flag, configurable price per base unit, price currency MUR, unit, allowed weight increments and minimum, image references. Do not store an active price only in frontend code.                                          |
| `product_variants` / `product_options`         | Allowed cuts, cutting styles, portion-size options, fixed pack SKU definitions, permitted remainder handling, and any pricing overrides. Explicitly link the option to the sellable inventory source.                                                                            |
| `inventory_items`                              | UUID, source/sellable stock identity, unit in grams or integer standardized base units, on-hand, reserved, target stock, alert percent (default 10), last update. Enforce nonnegative available stock and active-source mapping.                                                 |
| `inventory_movements`                          | Append-only, amount/delta, type (replenish/adjust/reserve/release/consume), actor, order/line or reservation correlation, reason, timestamp, unique idempotency key. Do not silently replace the history with a number.                                                          |
| `inventory_reservations`                       | Order/item/source, reserved quantity, consumed quantity, status and timestamps, idempotent link to confirmed quote. A single physical quantity must not be reserved twice.                                                                                                       |
| `customer_contacts`                            | Name, phone, optional email if approved, optional saved delivery details; handle PII carefully. Guest customers need not hold Auth accounts. No public list/read permissions.                                                                                                    |
| `delivery_zones`                               | Central/North/West/East/South, editable active state, current fee in integer minor units, locality guidance. These are vendor-owned data, not fixed constants for fee amounts.                                                                                                   |
| `delivery_schedule_rules`                      | Vendor-defined zone, weekdays, cutoff clock time, active range/time zone. Handle exceptions and non-service dates separately. Do not infer delivery days from a mockup date.                                                                                                     |
| `delivery_slot_exceptions` / `delivery_offers` | Explicit disabled/extra dates or generated eligible dates with capacity if implemented. Validate on server at both request and acceptance.                                                                                                                                       |
| `orders`                                       | UUID/internal reference, safe display reference, origin, current status, contact, delivery address/zone/date snapshot or request, preferred payment method, latest quotation version, idempotency/request key, timestamps. No pending-order permanent stock reservation.         |
| `order_items`                                  | Immutable original request data (product, requested quantity, cut preferences, package plan and notes) and references to relevant sellable stock items. Maintain change history where appropriate; do not rewrite the customer's original request when issuing a quote.          |
| `quotations`                                   | UUID, order, strictly increasing version number, `draft/issued/approved/...`, expiry, vendor-issued timestamp, calculated totals and fees, delivery commitment, snapshot metadata, latest-quote marker/version. Unique order+version. Published/approved versions are immutable. |
| `quotation_lines`                              | Product name and ID snapshot, quantity in integer units, cut and packaging details, unit price and extended price in MUR minor units, subtotal and notes at that version. Never recompute approved historical prices from current products.                                      |
| `quotation_approvals` / `confirmation_events`  | Approved order + exact quote UUID/version + timestamp, allowed recipient context, transaction/event ID. Approval only after currentness and reservation checks pass.                                                                                                             |
| `guest_access_tokens`                          | Token **digest** (not raw token), order/quote scope, purpose (view status vs approve quote), expiry, consumed/revoked timestamp where appropriate. Never index private data by a publicly guessable numeric order ref.                                                           |
| `payment_records`                              | Order, selected payment method, state, optional vendor-entered transfer reference, amount, reported/verified timestamps and actor, immutable change log. Customer-reported payment is not `paid`.                                                                                |
| `order_events` / `audit_events`                | Append-only actor, event type, previous/new state, quote version, timestamp, safe metadata for auditing status changes. Log events for failures with no sensitive raw tokens.                                                                                                    |

Prefer UUID primary keys, indexed foreign keys, uniqueness constraints and `timestamptz` for instants. Store delivery
**calendar dates** separately from timestamps; calculate local cutoffs using `Indian/Mauritius` and store UTC instants
for audit. Don't use system-local timezone implicitly. Money uses MUR **minor units** (integer cents), or a well-tested
exact decimal DB model; weight/quantity use **integer grams** or agreed exact numeric units. Do not use JS binary
floating-point calculations as the authority for financial totals or stock grams.

Database seeding must be reproducible and explicit. Seed example products, sample prices, zones, delivery schedule and
enough fake data to show the workflows; label it `DEMO` visibly and in docs. Do not create fake real-world delivery
addresses or payments that could be mistaken for live records. The vendor admin user should be explicitly provisioned
through secure local instructions/invitation, never via an embedded production password.

If photo uploading is in scope, product photos live in Supabase Storage, with vendor-only mutations and controlled
public-read access for **catalogue** images. Brand logos remain in the tracked shared assets folder. Avoid storing
private customer attachments in a publicly readable bucket.

## 15. Atomic order acceptance and inventory bookkeeping

Design a single trusted PostgreSQL transaction/function (RPC or equivalent trusted server-side transaction) that accepts
the current quotation. **A client-side sequence of `check available`, `insert reservation`, and `update order` is
unacceptable.** Specify who may call the operation: a server holding validated guest purpose/version access or an
explicitly authenticated vendor actor. Never grant an unbounded privilege to the browser through a generic
`SECURITY DEFINER` RPC; lock down function EXECUTE, validate claims/tokens and set secure search paths.

Acceptance transaction, conceptually:

1. Validate the access token or valid server session; check scope, order, latest quote ID/version, expiry/revocation,
   and exact intended action.
2. Acquire appropriate DB locks on the order/current quote and each affected inventory row (consistent ordering of rows
   by identifier prevents avoidable deadlocks).
3. Confirm the order is awaiting approval, quote is issued and current, delivery date is still acceptable or explicitly
   reserved as agreed, and all quoted line requirements are coherent.
4. Revalidate quantity availability for each separately tracked physical stock source, accounting for multiple quote
   lines requesting the same source. Reject atomically on shortage; present a vendor-review-required outcome rather than
   a partial confirmation.
5. Write exactly one reservation per unique line/source, or aggregate correctly if sharing a source. Use unique
   operation keys to make concurrent duplicate clicks and network retries idempotent.
6. Record approval (quote UUID/version/timestamp, exact snapshot), set order `confirmed`, invalidate approval tokens if
   one-time, append audit events; commit all changes together.
7. Return a deterministic success/result code. Retrying an already completed identical request must not reserve twice.
   Using an old or altered quote version must fail safely and not mutate stock.

Inventory accounting example: starting `on_hand=50kg`, `reserved=12kg`, available=38kg. On confirming a new 2kg order:
on_hand=50, reserved=14, available=36. On preparing that order, consume 2kg physical stock **and** release its 2kg
reservation in the **same** transaction: on_hand=48, reserved=12, available=36 (not 38 or 34). If the confirmed order is
cancelled **before** consumption and policy allows, release reserved=2kg once; on_hand remains unchanged. Once physical
meat is prepared/consumed, cancelling must not magically restore meat. Always record movement identifiers, responsible
actor and reason.

Do not treat whole chicken and separate sellable breast/thighs as additive inventories without a valid transformation
transaction. For the POC, independently maintained chicken cut stock sources are permitted and should be clearly
explained. Unsupported physical cutting yield combinations require manual vendor review, not silently accepted
arithmetic.

## 16. Quote/version state machine and change control

Define a centralized finite-state transition policy for order, quote, inventory and payment; enforce it on the server
and test it. The intended order path is:

```text
pending_review
  -> awaiting_customer_confirmation
  -> confirmed
  -> preparing
  -> ready_for_delivery
  -> out_for_delivery
  -> delivered
```

`cancelled` and `rejected` are guarded exception states, not convenient fall-through transitions. The vendor can create
a quotation draft and issue version N. Issue increments version in one transaction, marks superseded prior versions, and
invalidates their approval tokens. Customer can view current quote and request changes, but cannot edit or approve stale
versions. Approval records the exact order lines/charges/delivery commitment that were displayed to the customer. After
approval, change of price/weight/date requires a safe explicit change process and customer consent as appropriate; do
not silently mutate confirmed reservations. If you implement only pre-approval quote revision in initial P0, clearly
document the post-confirmation revision path as vendor manual review.

Separate payment lifecycle entirely: `unpaid -> payment_reported -> paid` is a typical path but the vendor may manually
record cash received without a prior report. `refunded` and `failed` require context, not automatic transitions. A
`delivered` order may still be unpaid. Display payment status independently in both vendor records and appropriate
customer status views.

Persist the order origin (`website` or `vendor_entered`) and use exactly the same quote workflow for both. Avoid
creating a separate, lower-security pipeline for manually entered WhatsApp orders.

## 17. Guest-link security and authorization

Guest checkout is intentional; do **not** require account creation before shopping or submitting a request. Order status
and quotation approvals must remain customer-specific despite the absence of an account. Treat shared approval/status
links as bearer capabilities: whoever possesses a valid link may perform its scoped action, so design expiry and sharing
carefully.

- Generate opaque cryptographically random tokens (sufficient entropy, e.g. 32 random bytes), hash/digest the stored
  representation, and link each to exactly one order and purpose; quote-approval tokens additionally bind to one issued
  quotation UUID/version.
- Do not embed phone numbers, sequential order numbers, names, or DB IDs alone as the authentication mechanism in URLs.
  Use display references only for human communication.
- Distinguish read-only status links from action-bearing approve-quote links. Expire/rotate quote tokens when a quote is
  revised or revoked. Use one-time or idempotent POST confirmation semantics.
- Validate access **server-side** on every private read and mutation. Guest query endpoints should return only a minimal
  projection of the authorized record, not a full admin database row or all vendor data.
- Avoid exposing service-role credentials in client bundles, `NEXT_PUBLIC_*`, logs, source maps, status-page metadata,
  analytics, or the browser. Vendor auth uses Supabase Auth and owner authorization on every trusted operation;
  middleware redirect alone is insufficient.
- Apply sensible no-store/cache controls to personalized order pages, limit Referer/token leakage when loading
  third-party assets, and avoid logging raw tokens or personal addresses. Rate-limit guest submissions, access-token
  verification and public status lookups where feasible.
- On invalid/expired/superseded links, show a calm and actionable UX
  (`This quotation has been updated; ask the vendor for the latest link`) without leaking whether unrelated order IDs
  exist.

Create automated tests for token uniqueness/scoping, expiry, quote supersession, double approval, and vendor-only
routes; check RLS policy paths. No test may assume public SELECT access to all orders just because the UI needs an order
status view.

## 18. Trusted operations and suggested UI/data boundaries

App Router: use server components for non-interactive catalogue/status pages where practical, and client components for
cart interactions/quantity selection/dialogs. Use server actions or route handlers for mutations only with careful CSRF,
auth, request schema validation, anti-replay/idempotency checks and consistent error handling. Do not call protected
Supabase RPCs from a public browser with elevated credentials. Prefer the repository's existing package conventions
rather than importing an unrelated state library automatically.

Recommended actions (these are behavioral contracts, not compulsory URL names):

| Action                                | Caller and checks                                                                                   | Result                                                                                 |
|---------------------------------------|-----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| `listCatalog` / `getProduct`          | Public read; return only active raw-meat products and permitted configurations                      | Paginated/filterable catalogue with accurate unit labels and active state              |
| `getAvailableDeliveryDates`           | Public; validates zone, current local cutoff, vendor schedule and exceptions                        | Offered dates and current fee, with cache invalidation strategy                        |
| `calculateEstimate`                   | Public read or trusted server; authoritative product prices and zone settings, validated quantities | Estimate (explicitly not vendor approval) in MUR                                       |
| `submitOrderRequest`                  | Guest; input schema, anti-bot/rate limit, idempotency key, server calculation                       | Exactly one `pending_review` order and private status capability; no stock reservation |
| `listVendorOrders` / `getVendorOrder` | Authenticated authorized vendor owner                                                               | Search/filter list and complete relevant order info                                    |
| `createManualOrder`                   | Authorized vendor                                                                                   | `vendor_entered` request in same workflow                                              |
| `issueQuotation` / `reviseQuotation`  | Authorized vendor; current version, server totals and snapshot, expiry                              | New `issued` quote version and newly scoped link; earlier links invalidated            |
| `getGuestQuotation`                   | Guest quote token scoped to current version                                                         | Only that quote, detailed items, delivery and price; no unrelated PII                  |
| `approveQuotation`                    | Valid guest approval token, POST, transaction and idempotency                                       | All-or-nothing confirm + stock reservation                                             |
| `updateFulfillmentStatus`             | Authorized vendor, allowed transition, inventory rules                                              | One state change and audit event                                                       |
| `adjustInventory`                     | Authorized vendor; reason, exact units, nonnegative constraints                                     | Balance and movement history updated atomically                                        |
| `configureProducts/Zones/Payments`    | Authorized vendor and validation                                                                    | Updated server configuration, no retroactive change to approved quotes                 |
| `recordManualPayment`                 | Authorized vendor; explicit evidence/note where applicable                                          | Independent payment state/history updated                                              |

Keep business operations and validation reusable across the two apps (or centralize on trusted server boundaries).
Shared `packages/shared` can own pure domain contracts, validation and formatting; **do not** import server-only
Supabase clients, service credentials or Node-only APIs into client-exposed components. If adding a distinct server
library, explain why it is required and keep its exports private to server entrypoints.

Store cart edits locally (e.g. context/localStorage) with a versioned serialization format if useful, but derive final
totals on the server. Use explicit loading, retry and error states; avoid optimistic confirmation for
stock/payment-critical actions. If realtime subscriptions are introduced, treat them as enhancements to refresh UI; the
database remains the authority. A regular refresh/poll fallback is acceptable for the POC.

## 19. Exact catalogue, packaging and money expectations

Demo raw chicken products (MUR/kg): whole chicken 235; breast 475; drumsticks 290; thighs 350; wings 220. Demo beef:
mince 830; cubes 830; rump steak 1100. Add no initial Pork, Lamb, grilled chicken, beef burgers or prepared meal
category merely because a generated board depicts it. Categories are extensible by vendor data. Mark prices as **sample
values** until vendor approval.

- A weight purchase records grams and increments; for 2kg use 2000g. If 500g portions are allowed, display
  `4 packs x 500g = 2kg`.
- Fixed-pack offerings must be explicitly configured. Show `/kg` or `/pack` depending on the SKU; do not mix unit price
  and total price in one number.
- If 2.5kg is requested with 1kg portions, either show `2 x 1kg + 1 x 500g` **only if remainder packs are permitted**,
  or show a validation message requiring a compatible configuration.
- A request for curry-sized cutting on 6kg whole chicken is a cutting instruction; it does not imply that 6kg of
  breast/wing/drumstick material can be obtained independently.
- Preview arithmetic uses server-consistent decimal/minor-unit functions. Implement a shared `formatMUR` utility with
  clear `Rs` display conventions; keep exact precision and rounding in tests. Default packaging fee Rs 0.
- Six-kilogram demo: 2000g breast x 475/kg = Rs950; 2000g drumsticks x 290/kg = Rs580; 2000g wings x 220/kg = Rs440;
  product subtotal Rs1,970; North delivery Rs125; packaging Rs0; total Rs2,095; with 500g portions, **12 packs**
  overall.
- Existing catalogue price changes, zone fee changes and payment setting changes never rewrite a confirmed/approved
  quotation snapshot.

Example delivery configuration (all mutable demo data): Central Rs75 Monday; West Rs150 Tuesday; East Rs175 Wednesday;
North Rs125 Thursday; South Rs225 Friday. Display only eligible options for a selected region after local cutoff rules
are applied. Payment choices are cash on delivery, MCB Juice and bank transfer, all manually recorded. No payment
success animation without vendor verification.

## 20. Comprehensive screen behavior and component design

The existing master prompt lists screens C-S01..C-S09 and V-S01..V-S10. Implement their **behavioral interactions**
rather than static representations.

**Customer global UI:** responsive masthead with scalable wordmark, discoverable catalogue/cart navigation,
delivery-region context, contextual help on quote workflow and accessible global notifications. Use clean hero
photography showing only raw chicken/beef cuts. Mobile: ~16px gutters, tap targets around 44px, practical sticky action
without obscuring controls, bottom navigation only when it reflects truly available routes (don't promise guest account
features that do not exist). Desktop: horizontal navigation, 2-4 column product grid as space allows, readable maximum
content width and attractive hero.

**Product detail:** distinguish `weight` (grams or kg), `cut/preparation` (product-specific options), `packaging`
(units/number/remainder) and `special instructions` (vendor-review note). Disable impossible choices with reason; update
pack count, line estimate and availability; adding cart creates a stable configured line, not an untyped product ID
without its options. Visualize both chicken and beef product details using realistic raw-meat imagery placeholders.
Include low/out-of-stock messaging and request-review flags for complex cuts.

**Cart and checkout:** customer can edit items and preserve their packaging. Use step guidance if helpful but avoid
wizard traps. Checkout requires name, phone, zone, locality, address/landmark, vendor-offered eligible date, and enabled
payment preference. Show fee/estimate; allow backtracking without losing data. The final primary CTA says **Submit order
request**. Explain that vendor verification and a later secure quotation approval are required. Confirmation page says
**Pending Review** and provides the private status link only when a real server-generated capability exists.

**Quotation and status:** quote view must display version number, exact items/weights/pack sizes, any vendor edits
highlighted, delivery commitment, total including fee, expiration and explicit approval control. Include
expired/superseded, stock conflict, network retry and unauthorized/invalid-link states. On success, show `Confirmed` and
track independently `Unpaid`/reported/paid; the order timeline must only show stages persisted by the backend. Provide a
way to request changes without assuming an automated WhatsApp sender; a prepared message or copy-link option is fine.

**Vendor shell:** authenticated route/layout, persistent sidebar at wide widths, responsive drawer or tab layout on
narrow screens; clear current location, actionable notification badges, keyboard-accessible menus and focus management.
Summaries and charts must be calculated from current data or explicitly labeled seeded demo data. No invented revenue
claims, verified sourced-product badges or silent auto-refresh claims.

**Vendor order details:** vendor sees customer contact and address only after auth, can inspect every line's pack plan,
compare request and quotation, edit before issuing, issue revision v2, copy or open `wa.me` manually with a safely
encoded message and secure link; update status using allowed transitions with success/error feedback. Manual order entry
must present the same product customization, delivery and quote flow as guest ordering; always tag origin
`vendor_entered`.

**Vendor inventory:** show on-hand, reserved, available, target and warning percent. Allow replenishment/adjustment with
required reason; show movement history and invalid adjustment handling. Warn at
`available <= target * threshold_percent` (default 10%), e.g. target 50kg -> warning at 5kg. Avoid duplicate alerts on
every render. Show normal/low/unavailable states accessibly without color alone.

**Vendor delivery:** display grouped confirmed orders by region and offered date, count and addresses, preparations
ready to depart, dispatch and delivered transitions. Vendor can change zone fees, weekly days/cutoffs and exceptions for
future orders; already accepted historical delivery terms remain snapshotted. If customer unavailable, record a
failure/follow-up note and handle manual rescheduling, without inventing live GPS tracking.

**Vendor payment:** display enabled methods and editable instructions, reported vs paid states, manual reference and
verification action with actor/timestamp. Never auto-switch order to paid after delivery, and never present MCB Juice or
bank transfer as API-verified.

**Common components** in shared UI where genuinely reused: accessible `Button`, `TextField`, `Select`, `StatusBadge`,
`Dialog`, `Card`, `Skeleton`, `InlineError`, `EmptyState`, `WeightSelector`, `PackageBreakdown`, `OrderStatusTimeline`,
`BrandLogo`/`AppMark`, and formatting. Keep package boundaries lean; if a component is only used by one app, keep it
local. Do not invent `@laviann/ui` as a second package unless reuse grows enough to justify it.

## 21. Visual QA and marketing-claim guardrails

Approved identity: `LAVIANN`; tagline exact words **Quality Meats, Greater Meals.** Use approved runtime palette (deep
forest #12382F, primary strong #17483B, sage #AFC799, pale sage #EBF1E8, ivory #F4F7F3, surface #FFFFFF, text #263D35,
muted #687A73, border #DCE5DE, warm accent #C76B50, warning panel #F9EBE4), but fetch values from shared `colors.ts`,
not copies pasted into app code.

Heading family: existing compatible Big Shoulders via `next/font`; Inter for body and UI. Use `font-display` only for
large headings/brand display, `font-body` for prices, forms and controls. Existing shared font loader includes optional
Montserrat; do not switch body without reason. Keep typographic details (spacing/uppercase/line height) visually aligned
to approved reference and accessible at reduced sizes. If exact font family naming differs (`Big_Shoulders` vs marketed
Big Shoulders Display), prefer the working installed font and validate visual match.

Logo: accessible original-vector SVG wordmark and 1-color app icon with **very small** steak-cut outline detail
replacing/adorning the `I` dot or `L` icon upper area; same color as the letters, not red, no leaf, not oversized;
scalable at 24px favicon and on desktop. Produce white reversed and forest-on-ivory versions. Keep optical spacing
consistent and a wordmark-only fallback for tiny contexts. User approved the *direction*, not a final trademark
registration; no trademark claims.

Use the final visual board as a style/hierarchy reference, not literal content. Legacy SVG artboards can guide screen
structure but may have an old leaf symbol and incorrect labels. Correct all generated concepts that show pork/lamb,
online cards, arbitrary prices, misleading `Place Order`, instantaneous confirmation, or unsupported `locally sourced`
claims. For placeholders, use project-owned artwork, licensed placeholders or clean illustrations of **raw** chicken and
beef. Never fetch copyrighted restaurant photography without rights; don't assert product photos are of this merchant's
stock. Provide simple swap points for later Supabase-backed product photos.

Responsive test matrix: customer 320px narrow phone, 390x844 reference phone, 768px tablet, 1440x930 desktop; vendor
390x844 operational mobile, 768px tablet, 1440x960 desktop. No horizontal overflow, obscured sticky buttons, unreadable
financial tables or 16px form text too tiny to tap; labels, focus rings and validation messages remain readable. Aim for
WCAG 2.2 AA accessible interaction patterns and meaningful alt text; semantic labels and disabled states must not rely
on color alone.

## 22. Required automated test catalogue and manual checks

Write real tests that protect the business rules. The following cases are **required**, not optional future enhancements
for the full P0:

| ID          | Level            | Test / expected outcome                                                                                                   |
|-------------|------------------|---------------------------------------------------------------------------------------------------------------------------|
| CATALOG-01  | Unit/integration | Inactive/unavailable products cannot be added to new requests; existing historical quotes still display snapshots.        |
| CATALOG-02  | Unit/integration | Vendor can create a new raw-meat category/product without editing application source.                                     |
| CUSTOM-01   | Unit/UI          | 2kg chicken breast with 500g allowed portions => four 500g packs, 2000g total, correct estimate.                          |
| CUSTOM-02   | Unit/UI          | Unsupported cut option, quantity increment and forbidden remainder are rejected with a useful message.                    |
| CUSTOM-03   | UI               | Editing cart restores all selected cuts, weights, notes and package distribution, not merely item count.                  |
| MONEY-01    | Unit/integration | Full 6kg demo subtotal=Rs1,970; North fee=Rs125; total=Rs2,095; 12 500g packs.                                            |
| MONEY-02    | Integration      | Tampering with client-sent unit price, fee or total does not affect trusted server estimate or quote.                     |
| ORDER-01    | DB/integration   | Duplicate guest submit with same idempotency key produces one pending request; no permanent stock reservation.            |
| ORDER-02    | Integration      | Vendor-entered WhatsApp request enters normal order review/quote pipeline and sets origin.                                |
| QUOTE-01    | Integration      | Vendor issues v1; guest sees only that quote; v2 issuance supersedes v1 and revokes old approval capability.              |
| QUOTE-02    | DB/integration   | Expired, wrong-order or wrong-purpose token cannot approve any quote or read another customer's data.                     |
| QUOTE-03    | DB/concurrency   | Two approval attempts for same current quote are idempotent; stock reserved exactly once.                                 |
| STOCK-01    | DB/concurrency   | Two different customers compete for final stock: only available stock can be reserved; losing attempt safely fails.       |
| STOCK-02    | DB/integration   | On prepare, decrement on-hand and release reserved once with correct movement history; available does not double change.  |
| STOCK-03    | DB/integration   | Eligible pre-preparation cancellation releases reservation; repeated cancellation is idempotent.                          |
| STOCK-04    | Unit/UI          | Target 50kg and available 5kg => default 10% warning, no false duplicate alert flood.                                     |
| DELIVERY-01 | Unit/integration | North selectable only on configured offered dates beyond cutoff; zone fee from DB, not hardcoded in component.            |
| DELIVERY-02 | Integration      | Changing future zone fee does not alter already approved quotation fee snapshot.                                          |
| PAYMENT-01  | DB/UI            | Delivered order can remain unpaid; customer-reported Juice/transfer is not automatically marked paid.                     |
| PAYMENT-02  | Auth/integration | Only vendor owner can mark paid and edit vendor payment instructions.                                                     |
| SECURITY-01 | RLS/integration  | Anonymous client cannot list private orders, phone numbers, payment records or admin configuration.                       |
| SECURITY-02 | Auth/integration | Unauthorized customer cannot access `/vendor` endpoints, issue quotes, adjust stock or delivery fees.                     |
| ASSETS-01   | Unit             | Nested brand assets copied preserving path and casing to both apps; same-name contents overwrite on next predev/prebuild. |
| ASSETS-02   | Unit             | `.gitkeep` is ignored, no watcher runs, destinations unrelated to source aren't deleted.                                  |
| THEME-01    | Build/UI         | Changing shared primary token updates Tailwind `bg-brand` and text-brand across both apps, without duplicate palettes.    |
| UI-01       | Browser          | Customer and vendor reference views work at 320/390/768/1440 widths without clipped or unusable content.                  |
| UI-02       | A11y/browser     | Keyboard and screen reader can navigate forms/dialogs, see labels/errors, submit request and read status messages.        |
| DEMO-01     | E2E              | Customer request -> vendor quote -> current approval -> reservation -> preparation -> delivery -> manual payment record.  |
| DEMO-02     | E2E              | Manual WhatsApp-origin request follows the same secure pipeline as the website.                                           |

Prefer a focused suite with Vitest/Bun test for pure logic, integration tests against local Postgres/Supabase for
transactions, and Playwright for critical browser flows when feasible. Add a clearly documented local seed/reset
strategy and repeatability requirements. In CI, retain existing `bun run test:assets`, `bun run test:theme`,
`bun run check`, `bun run build`; add appropriate focused unit/integration tests with practical runner requirements. If
Docker/Supabase local services are unavailable, mark DB tests **not run**, not passed; provide the exact commands to
rerun them.

## 23. Suggested milestone deliverables in concrete files

These are **examples of appropriate file boundaries**; don't hardcode an invented repo layout over existing conventions.

**A - approved visual system:** add SVGs under shared `assets/images/branding`; shared logo component + reusable basic
UI; refine `apps/customer/src/app` routes/layouts, `apps/vendor/src/app` routes/layouts; deterministic typed demo
catalogue; CSS util classes from existing Tailwind. Update design note with screenshot comparisons and demo-only
disclosure. Test assets/theme/compile/browser layouts.

**B - trusted backend foundation:** new `supabase/migrations/*.sql`, `supabase/seed.sql` or idempotent seed command,
`docs/decisions/0004-...md`, `.env.example` updates (placeholders only), generated database types in shared package,
server-only Supabase connectors, vendor auth route guard, RLS tests, vendor onboarding setup documentation. Avoid
duplicating database code across apps; keep ownership clear.

**C - customer order request:** server catalogue/zone/estimate/read endpoints, product option validators, cart
serialization, guest idempotent submit, `pending_review` receipt/status capability and vendor queue read. Tests for
validation, server pricing and duplicate submit.

**D - quotes and approval:** vendor issue/revise/current-quote screens, immutable SQL snapshots, guest token
issuance/validation, order compare and approve, manual WhatsApp copy/share; stock reservation begins here and must be
atomic. Tests for stale/expired link, concurrency and idempotency.

**E - operations:** inventory replenishment/movement/consumption/cancel release, schedule/zone editing, grouped delivery
queue, status transitions, manual payment tracking and alerts. Snapshot tests ensure later configuration edits never
alter accepted terms.

**F - product QA:** all eight PRD demonstrations, responsive screenshots, a11y checks, security review/RLS audit,
performance sanity, reliable error states and business validation checklist; release-readiness report with explicit
unresolved real-world vendor/legal tasks.

If truly needed, implement shared hooks/validators formatters in `packages/shared/src/` alongside existing exports, but
avoid creating a sprawling generic `core` or `common` folder with no clear purpose. Retain `@laviann/shared` package
conventions and add `@laviann/ui` only after a documented reason; user originally considered it but current repository
puts limited shared UI in `@laviann/shared/ui`.

## 24. Environment, deployment, and explicit limitations

- Do not commit `.env.local`, real Supabase service-role keys, credentials or PII. Use checked-in `.env.example`
  templates with clear public vs private key explanations. Verify that server secrets cannot be imported into client
  components or emitted into generated browser chunks.
- `NEXT_PUBLIC_*` values are public by definition. Use anon/publishable Supabase key only under appropriate RLS.
  Service-role/secret keys are server-only and require audited privilege handling; do not make public API routes that
  proxy unrestricted service-role queries.
- No actual payment gateways, automatic MCB Juice verification, bank integrations, WhatsApp API messages or mobile
  native apps. POC communications remain manual share links. A `wa.me` pre-filled message is a convenience link, not a
  sent message.
- URLs for the two dev apps remain customer :3000 and vendor :3001. The deployed hostnames will be configured later;
  don't hardcode a real production URL, vendor phone number, merchant bank account or tax rate.
- Product photos in this concept are not proof of vendor stock. A simple licensable placeholder library or
  self-contained SVG illustrations are acceptable until the vendor supplies genuine product images. Provide graceful
  image fallback.
- Build/test without production keys when feasible; display clearly labeled safe demo mode or configuration-required
  screens. Never expose a dashboard's private customer data in publicly hosted mock mode by accident.
- Do not claim legal launch readiness. Real vendor verification is still required for physical inventory accounting,
  cutting yield, actual stock values, real delivery localities/day/cutoffs, tariffs, MCB/bank instructions, Mauritius
  data protection, food handling/transport and fiscal invoicing.
- Keep an explicit `KNOWN-ASSUMPTIONS.md` or equivalent issue log for unverified real-world decisions; don't freeze
  those into constants or misrepresent them as approved.
- At the end, provide exact repeatable setup and verification commands, screenshot links, meaningful PR descriptions, DB
  migration/run instructions, demo accounts without embedded real secrets, and a list of any unrun tests. State which
  parts are live end-to-end and which rely on fixtures.

## 25. Definition of done for the FULL requested POC

The milestone collection is complete only when the normal website customer can request a customized raw-meat order, and
the authorized vendor can review and quote it, share a secure current-version approval link manually, receive the
customer's explicit approval, reserve stock transactionally, prepare/package/deliver with correct stock movements and
records, and manually record payment status; the vendor can also originate the identical flow from WhatsApp, manage
actual product/zone/stock settings and see low-stock alerts. All required P0 business rules must have meaningful
verification coverage, both responsive applications must reflect the approved one-color small-steak brand, and every
simulated/unverified integration must be described honestly.

**Required final verification:** Run the PRD's eight scenarios A-H against a real local/configured backend, not just
fixtures, if the necessary safe environment exists. When it does not, produce a precise gap report and rerun
instructions instead of describing a preview as a finished product. Complete the code and tests that can be authored
safely even when Supabase credentials or Docker aren't available.
