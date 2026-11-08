# Laviann implementation acceptance tracker

**Context updated 8 November 2026.** A–F are implemented; the evidence below was
executed locally on **17 October 2026**, with the initial implementation's GitHub
checks also passing. Later CI runs on `main` (most recently 8 November 2026) also pass. This is evidence of a working local P0, not merchant approval
or production certification. See [verification](../docs/verification.md) for exact
results and limitations. Revalidate affected behavior for future changes.

## Delivery milestones

| Milestone             | Status                      | Implemented result and evidence                                                                                                                       |
| --------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| A - Brand/design      | Tested                      | Original SVG identity, exact tagline, shared theme/fonts, nine customer and ten vendor screens; asset/theme tests and responsive screenshots          |
| B - Backend           | Tested                      | Supabase schema/seed, owner Auth, RLS, guest capabilities and trusted functions; 17 real database tests / 97 assertions                               |
| C - Customer requests | Tested                      | Product configuration, cart, zone/date checkout, trusted estimates and idempotent requests; domain/database tests and browser journey                 |
| D - Quote workflow    | Tested                      | Vendor/manual entry, immutable versions, manual sharing, current approval and revocation; browser and transaction tests                               |
| E - Operations        | Tested                      | Stock accounting, warnings, adjustments, delivery settings/fulfillment and separate manual payment; database and browser/settings tests               |
| F - QA/demo           | Tested within stated limits | Eight scenarios, concurrency/security checks, Chromium/axe/viewport evidence, setup/demo/security guides; additional browsers and launch work pending |

## Eight PRD scenarios

| Scenario             | Observed result                                                                                                           | Evidence                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| A - Website request  | 2 kg each breast/drumsticks/wings; twelve 500 g packs; Rs 1,970 + North Rs 125 = Rs 2,095; Pending Review, no reservation | Domain + database tests and browser journey |
| B - Vendor quotation | Current version stored, awaiting customer confirmation, private approval link                                             | Database and browser journey                |
| C - Current approval | Atomic revalidation/reservation, Confirmed, exact approved version                                                        | Database and browser journey                |
| D - Fulfillment      | Valid progression, one-time stock deduction, independent payment                                                          | Database and browser journey                |
| E - Manual WhatsApp  | `vendor_entered` request follows the same approval/fulfillment pipeline                                                   | Database and browser journey                |
| F - Low stock        | 5 kg available against 50 kg target triggers the 10% warning; target adjustable                                           | Seed, database tests and inventory screen   |
| G - Concurrency      | Two approvals compete for final stock; only the fitting reservation succeeds                                              | Real database race and rollback tests       |
| H - Quote revision   | v1 rejected after v2 issuance; only current v2 can approve                                                                | Database and browser journey                |

[Scenario walkthrough and route map](../docs/demo-guide.md) ·
[Domain tests](../tests/unit/domain.test.ts) ·
[Database tests](../tests/integration/workflow.test.ts) ·
[Browser journey](../tests/browser/journey.spec.ts) ·
[Settings journey](../tests/browser/vendor-settings.spec.ts).

## Cross-cutting evidence

- Customer 320/390/768/1440 px and vendor 390/768/1440 px: 73 viewport/axe checks
  across 21 states, plus three product-editor viewport/axe checks. No detected
  document overflow or scanned WCAG A/AA violations in those runs.
- Anonymous/non-owner access, capability scoping/expiry, stale versions, server
  pricing, safe retries, stock races and payment independence tested against real SQL.
- Both configured builds and unconfigured preview behavior checked. Preview mutations
  fail visibly; no fake successful orders/payments. Browser bundles scanned for secrets.
- Six image-copy and two theme tests passed; nested overwrite/no-deletion/no-watcher
  policy preserved. Unit tests: 9 passed / 28 assertions. Browser tests: 3 passed.
- Normal lint/typecheck/build and commit-policy checks passed. Screenshot examples
  use fake details and exclude full private links and credentials.

## Reproducibility and remaining work

- Original verification branch: `feat/complete-poc`, final handover commit `63bdc76`,
  originally based on `chore/shared-foundation` at `466f169`.
- Merged baseline: foundation PR #2 (`563cb08`), POC PR #3 (`dec0c33`) and
  Supabase/handoff PR #4 (`1471b70`), followed by maintenance PRs #5–#10
  (READMEs, Next.js 16.4.5, password toggle, favicon, Supabase CLI 3.0.0, aliases).
- Latest re-check, 8 November 2026: the [`main` CI run at `cf4ea5d`](https://github.com/danielgithiomi/Laviann/actions/runs/42477380550)
  passed the integration and browser jobs, and the integration suite passed locally
  on Supabase CLI 3.0.0. See [verification](../docs/verification.md).
- Original local verification runtime: Bun 1.3.6, Node 25.9.0, Supabase CLI 2.121.0.
  Repository/CI pins Bun 1.4.3 and Node 24. Check manifests/lockfile for current versions.
- Backend: isolated local project `laviann` (formerly `laviann-poc`), API 54321/database 54322. No hosted merchant
  project or live payment/message provider was exercised. [Setup](../docs/setup.md).
- Pending: vendor business-policy validation; Safari/Firefox, physical-device and
  screen-reader testing; owner recovery/MFA, retention, backups, monitoring,
  compliance and separately approved deployment.
- Next product step: a vendor walkthrough and scoped follow-up changes. New tasks
  follow [AGENTS.md](../AGENTS.md#git-workflow) with PRs targeting `main` and owner approval.
