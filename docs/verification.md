# POC verification and review handover

Verified locally on **17 October 2026** on `feat/complete-poc` (commit `63bdc76`),
based on `chore/shared-foundation` at `466f169`. Both branches have since been
reviewed and merged to `main` (PRs #1–#3). Nothing was deployed.

**Since this run (18 October 2026):** PR #4 reformatted
`supabase/migrations/202610160001_poc.sql` and `supabase/seed.sql` for readability.
On `main`, `bun run check` and `bun run test:unit` (9 passed) were re-run and pass.
`test:integration` and `test:browser` have **not** been re-run against the
reformatted SQL; repeat them (see [setup](setup.md)) before relying on this evidence.

## Executed checks

Actual command summaries are preserved in [verification-output.txt](verification-output.txt).

| Check                           | Observed result                                                                                                                                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun install --frozen-lockfile` | 387 installs / 477 packages checked, no lockfile changes.                                                                                                                                             |
| `bun run test:assets`           | 6 passed; recursive copying, overwrite and destination preservation.                                                                                                                                  |
| `bun run test:theme`            | 2 passed; shared Tailwind and font contracts.                                                                                                                                                         |
| `bun run test:commit-msg`       | All acceptance, rejection and footer cases passed. The validator now enforces the documented 72-character limit.                                                                                      |
| `bun run test:unit`             | 9 passed, 28 assertions; prices, portions, schedules and quotation comparisons.                                                                                                                       |
| `bun run check`                 | All 6 workspace lint/typecheck tasks passed.                                                                                                                                                          |
| `bun run build`                 | Both production Next.js builds and both asset tasks passed.                                                                                                                                           |
| `bun run test:integration`      | 17 passed, 97 assertions against real local PostgreSQL, Supabase Auth and RLS.                                                                                                                        |
| `bun run test:browser`          | 3 passed in Chromium against both production app servers and local Supabase.                                                                                                                          |
| Unconfigured build/preview      | Both apps built with empty public Supabase configuration. Storefront showed eight sample products; both apps labelled preview mode. Guest and vendor API operations returned 503 rather than success. |
| Browser bundle credential scan  | 41 production browser JavaScript files checked; neither the actual local service key nor the private HMAC secret appeared.                                                                            |

Local runtime: Bun 1.3.6, Node 25.9.0, Supabase CLI 2.121.0. Repository and CI
versions remain Bun 1.4.3 / Node 24. Local apps used ports **3100 / 3101** because
3000 was already occupied; normal development defaults remain **3000 / 3001**.
The isolated database project is `laviann-poc`, API 54321 and database 54322.

The GitHub workflow now runs the unit, database and browser suites. Its remote
result is separate from these local results and must be checked on the PR.

## Acceptance scenarios

All eight PRD scenarios are mapped in [the demo guide](demo-guide.md#eight-prd-scenarios-and-evidence).
The browser run exercised a real six-kilo request: twelve 500 g packages,
Rs 1,970 products + Rs 125 North delivery = **Rs 2,095**. It verified Pending
Review, vendor quotation, explicit approval, preparation, delivery while unpaid,
then independent vendor payment recording. It also created a manual WhatsApp
request, superseded v1 with v2, rejected the old link, approved v2 and cancelled
before preparation. Two deliberate stock adjustments created separate movements.

The settings journey saved a custom 1,500 g fixed pack, changed a delivery fee and
payment instructions, reloaded those settings, and verified the new customer
estimate. It restored the sample configuration afterward.

Database tests additionally cover simultaneous competing approvals, duplicate
approval/preparation/cancellation, shared stock sources, rollback after a later
line shortage, price tampering, invalid options, expiry/purpose/order scoping,
snapshot immutability, date revalidation, non-owner access and disabled signup.
These are real transaction tests, not mocked database responses.

## Responsive, accessibility and visual evidence

[verification.json](screenshots/verification.json) records **73 checks across 21
screen states**: customer at 320/390/768/1440 px and vendor at 390/768/1440 px.
The product editor adds three further viewport/axe checks in the settings test.
Each checked state had no document overflow and no detected Axe WCAG 2 A/AA or
2.1 A/AA violations. Browser runtime errors were also checked. Keyboard checks
cover the visible skip link and the login email-to-password focus sequence.
Automated scans are not a complete accessibility certification; screen-reader,
Safari, Firefox and physical-device testing were not run.

Screenshots use fake customer details. Private quotation inputs are masked, and
passwords, complete private URLs and session tokens are excluded from committed
evidence. Product artwork is original SVG placeholder illustration.

| Customer views                                                                                          | Vendor views                                                                                                                        |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [Home, mobile](screenshots/customer-home-390.png) / [desktop](screenshots/customer-home-1440.png)       | [Login](screenshots/vendor-login-390.png)                                                                                           |
| [Catalogue](screenshots/customer-catalogue-390.png) / [category](screenshots/customer-category-390.png) | [Overview, mobile](screenshots/vendor-overview-390.png) / [desktop](screenshots/vendor-overview-1440.png)                           |
| [Product](screenshots/customer-product-390.png)                                                         | [Orders](screenshots/vendor-orders-390.png)                                                                                         |
| [Cart](screenshots/customer-cart-390.png)                                                               | [Order details, mobile](screenshots/vendor-order-detail-390.png) / [desktop](screenshots/vendor-order-detail-1440.png)              |
| [Checkout](screenshots/customer-checkout-390.png)                                                       | [Manual request](screenshots/vendor-manual-order-390.png)                                                                           |
| [Review](screenshots/customer-review-390.png)                                                           | [Products](screenshots/vendor-products-390.png) / [editor](screenshots/vendor-product-editor-390.png)                               |
| [Submitted](screenshots/customer-submitted-390.png)                                                     | [Inventory, mobile](screenshots/vendor-inventory-390.png) / [desktop](screenshots/vendor-inventory-1440.png)                        |
| [Quotation](screenshots/customer-quotation-390.png)                                                     | [Deliveries](screenshots/vendor-deliveries-390.png)                                                                                 |
| [Status](screenshots/customer-status-390.png)                                                           | [Delivery settings](screenshots/vendor-delivery-settings-390.png) / [payment settings](screenshots/vendor-payment-settings-390.png) |

Visual inspection covered the mobile checkout, quotation and inventory, and the
desktop storefront/overview/order detail. It caught contrast, mobile layout and
hidden-skip-link rendering issues that were corrected before final evidence.

## Performance and security scope

[performance.json](screenshots/performance.json) contains one local production-home
measurement, using a fresh Chromium context at 390×844 with a configured profile
of 80 ms latency, 200 KiB/s download and 4× CPU slowdown. Treat it as a local smoke
measurement; it is not a hosted/mobile-network benchmark or production guarantee.
Reproduce with `node scripts/check-local-performance.mjs http://localhost:3100`.

Run `node scripts/audit-browser-bundles.mjs` after the configured production build
to repeat the private-key scan. It compares actual local secrets without printing
them. The [security notes](security.md) document RLS, owner checks, scoped links,
atomic stock changes, origin/body limits and operational assumptions. This was an
implementation self-review, not an independent penetration test.

No hosted Supabase environment, real merchant credentials, live deployment,
real payments or automatic WhatsApp sending were used. Storage/photo upload,
Realtime push, customer accounts and payment-provider integration remain outside
this POC. See [setup](setup.md) for migrations, demo owner provisioning, environment
templates and repeatable checks, and [ADR-0004](decisions/0004-transactional-poc.md)
for the implemented backend decisions.
