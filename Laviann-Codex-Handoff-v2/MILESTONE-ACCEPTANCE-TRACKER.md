# Laviann implementation acceptance tracker

> Codex: copy this into the repository's development documentation or maintain an equivalent issue/PR tracker. Update
> status based on **observed evidence**, never on intent or mockup similarity. Use `not started`, `in progress`, `tested`,
> `blocked`, or `preview only`; provide PR/commit/test references where available.

| Milestone             | Required result                                                                                                                                | Status      | Evidence / blockers |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------|-------------|---------------------|
| A - Brand/design      | Original monochrome SVG logo with small steak-cut detail; tagline, shared theme, responsive customer/vendor views, honest demo fixtures        | not started |                     |
| B - Backend           | Versioned Supabase schema/seed, RLS, vendor owner Auth, guest capability-link boundaries, trusted price/inventory functions                    | not started |                     |
| C - Customer requests | Real configurable catalogue, weights/portions/cart, zone/date checkout, pending review requests, idempotency                                   | not started |                     |
| D - Quote workflow    | Vendor review/manual WhatsApp entry, current versioned quote, secure share/approval, supersession and transaction                              | not started |                     |
| E - Operations        | On-hand/reserved/available stock, low-stock warnings, correct stock movements, delivery scheduling/fulfillment, manual payment tracking        | not started |                     |
| F - QA/demo           | Eight baseline scenarios, security/concurrency tests, accessibility/responsive screenshots, operational runbook and truthful integration notes | not started |                     |

## Mandatory eight PRD demo scenarios

| Scenario            | Input / action                                                              | Exact expected outcome                                                                        | Status      | Test/evidence |
|---------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|-------------|---------------|
| A: Website request  | Customer selects 2kg breast + 2kg drumsticks + 2kg wings, 500g packs, North | 12 packs; product Rs1,970 + delivery Rs125 = **Rs2,095**; `pending_review`, no reserved stock | not started |               |
| B: Vendor quotation | Vendor reviews above request and issues versioned quote                     | Current quote recorded, `awaiting_customer_confirmation`, secure approval link available      | not started |               |
| C: Current approval | Customer approves the newest valid quote                                    | Atomic revalidation and reservation; `confirmed`, correct quote version stored                | not started |               |
| D: Fulfillment      | Vendor prepares, marks ready, dispatches, delivers                          | Allowed status sequence, correct one-time physical stock movement                             | not started |               |
| E: Manual WhatsApp  | Vendor enters raw-meat order from WhatsApp and manually shares quote        | Same secure pipeline; `vendor_entered` origin                                                 | not started |               |
| F: Low stock        | Target 50kg, available falls to 5kg                                         | 10% warning visible, threshold editable and no false duplicate alerts                         | not started |               |
| G: Concurrency      | Two distinct customers race to reserve final stock                          | Never oversells, exactly one eligible reservation if only one fits                            | not started |               |
| H: Quote revision   | Vendor issues v2 of an already issued quote                                 | v1 link rejected; only current v2 may be approved                                             | not started |               |

## Cross-cutting proof points

- [ ] Customer app works at 320px/390px mobile and ~1440px desktop.
- [ ] Vendor dashboard works at 390px mobile and ~1440px desktop; tables become usable cards.
- [ ] All editable product prices, delivery fees, schedule/cutoffs and payment methods are vendor configuration, not
  frozen mock data.
- [ ] Anonymous customer cannot access another customer's private order or address.
- [ ] Service-role keys never reach a browser, public endpoint or checked-in file.
- [ ] No instant paid/confirmed status on customer request submission.
- [ ] Accepted quote history, stock accounting and payment status remain auditable.
- [ ] No unsupported card-payment, automated WhatsApp, native app or multi-vendor features.
- [ ] Same-name nested brand image files overwrite generated public images on `predev`/`prebuild` with no watcher.
- [ ] Existing Husky/GitHub Actions checks pass; additional tests and screenshots documented.
- [ ] Real merchant values, tax/legal requirements and live payment integrations clearly marked pending validation.

## Reproducibility

- Repository branch/base:
- Feature branch (es)/PR (s):
- Bun / Node / Turbo versions:
- Supabase mode: `local` / `development project` / `not available`:
- Test commands run and results:
- Unit/integration/E2E status:
- Known blockers/unverified assumptions:
- Next step:
