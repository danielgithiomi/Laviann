# Laviann implementation acceptance tracker

> Codex: copy this into the repository's development documentation or maintain an equivalent issue/PR tracker. Update
> status based on **observed evidence**, never on intent or mockup similarity. Use `not started`, `in progress`, `tested`,
> `blocked`, or `preview only`; provide PR/commit/test references where available.

| Milestone             | Required result                                                                                                                                | Status | Evidence / blockers                                                                                                                    |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------|--------|----------------------------------------------------------------------------------------------------------------------------------------|
| A - Brand/design      | Original monochrome SVG logo with small steak-cut detail; tagline, shared theme, responsive customer/vendor views, honest demo fixtures        | tested | Wordmark/lockup/icon SVGs in `packages/shared/assets/images/branding`; 73 responsive/Axe checks (`docs/screenshots/verification.json`) |
| B - Backend           | Versioned Supabase schema/seed, RLS, vendor owner Auth, guest capability-link boundaries, trusted price/inventory functions                    | tested | `supabase/migrations/202610160001_poc.sql`, ADR-0004; 17 integration tests (RLS, auth, transactions)                                   |
| C - Customer requests | Real configurable catalogue, weights/portions/cart, zone/date checkout, pending review requests, idempotency                                   | tested | Browser journey + SQL request tests; `docs/demo-guide.md`                                                                              |
| D - Quote workflow    | Vendor review/manual WhatsApp entry, current versioned quote, secure share/approval, supersession and transaction                              | tested | Browser v1/v2 supersession + SQL capability tests                                                                                      |
| E - Operations        | On-hand/reserved/available stock, low-stock warnings, correct stock movements, delivery scheduling/fulfillment, manual payment tracking        | tested | Inventory, delivery, payment and settings browser/SQL tests                                                                            |
| F - QA/demo           | Eight baseline scenarios, security/concurrency tests, accessibility/responsive screenshots, operational runbook and truthful integration notes | tested | `docs/verification.md`, `docs/demo-guide.md`, `docs/setup.md`, `docs/security.md`                                                      |

## Mandatory eight PRD demo scenarios

| Scenario            | Input / action                                                              | Exact expected outcome                                                                        | Status | Test/evidence                                              |
|---------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|--------|------------------------------------------------------------|
| A: Website request  | Customer selects 2kg breast + 2kg drumsticks + 2kg wings, 500g packs, North | 12 packs; product Rs1,970 + delivery Rs125 = **Rs2,095**; `pending_review`, no reserved stock | tested | `journey.spec.ts` + SQL six-kilo test                      |
| B: Vendor quotation | Vendor reviews above request and issues versioned quote                     | Current quote recorded, `awaiting_customer_confirmation`, secure approval link available      | tested | `journey.spec.ts`; integration quote tests                 |
| C: Current approval | Customer approves the newest valid quote                                    | Atomic revalidation and reservation; `confirmed`, correct quote version stored                | tested | Browser approval + SQL duplicate/concurrent approval tests |
| D: Fulfillment      | Vendor prepares, marks ready, dispatches, delivers                          | Allowed status sequence, correct one-time physical stock movement                             | tested | Browser stages + SQL balance/duplicate preparation tests   |
| E: Manual WhatsApp  | Vendor enters raw-meat order from WhatsApp and manually shares quote        | Same secure pipeline; `vendor_entered` origin                                                 | tested | Browser manual order + SQL origin check                    |
| F: Low stock        | Target 50kg, available falls to 5kg                                         | 10% warning visible, threshold editable and no false duplicate alerts                         | tested | Seed wings 5 kg / 50 kg target; inventory tests            |
| G: Concurrency      | Two distinct customers race to reserve final stock                          | Never oversells, exactly one eligible reservation if only one fits                            | tested | Integration race with two real database clients            |
| H: Quote revision   | Vendor issues v2 of an already issued quote                                 | v1 link rejected; only current v2 may be approved                                             | tested | Browser + SQL tests reject v1, approve v2                  |

## Cross-cutting proof points

- [x] Customer app works at 320px/390px mobile and ~1440px desktop.
- [x] Vendor dashboard works at 390px mobile and ~1440px desktop; tables become usable cards.
- [x] All editable product prices, delivery fees, schedule/cutoffs and payment methods are vendor configuration, not
  frozen mock data.
- [x] Anonymous customer cannot access another customer's private order or address.
- [x] Service-role keys never reach a browser, public endpoint or checked-in file.
- [x] No instant paid/confirmed status on customer request submission.
- [x] Accepted quote history, stock accounting and payment status remain auditable.
- [x] No unsupported card-payment, automated WhatsApp, native app or multi-vendor features.
- [x] Same-name nested brand image files overwrite generated public images on `predev`/`prebuild` with no watcher.
- [ ] Existing Husky/GitHub Actions checks pass; additional tests and screenshots documented. (Local hooks/checks pass
  and evidence is documented; remote CI results are unconfirmed here.)
- [x] Real merchant values, tax/legal requirements and live payment integrations clearly marked pending validation.

## Reproducibility

- Repository branch/base: `main` (P0 merged via PRs #1–#4, latest `1471b70`)
- Feature branch (es)/PR (s): `chore/shared-foundation`, `feat/complete-poc`, `from-ai/initial-development`; PRs #1–#4
- Bun / Node / Turbo versions: repo/CI Bun 1.4.3, Node 24, Turbo 2.x; verified locally on Bun 1.3.6 / Node 25.9.0
- Supabase mode: `local` (project `laviann-poc`); no hosted project
- Test commands run and results: see `docs/verification.md` (17 Oct 2026); `check` and `test:unit` re-run on `main` 18
  Oct 2026
- Unit/integration/E2E status: 9 unit, 17 integration, 3 browser passed on 17 Oct; integration/browser not re-run since
  the PR #4 SQL reformat
- Known blockers/unverified assumptions: real prices, zones, schedules, yields, tax/legal and payment processes need
  vendor validation (PRD §16.2)
- Next step: re-run integration/browser suites, demonstrate to the vendor, then plan approved hosted staging
