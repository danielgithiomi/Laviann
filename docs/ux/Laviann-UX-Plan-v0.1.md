# Laviann UX: implemented P0 journeys

**Context updated 18 October 2026.** The original planning filename is retained for
existing links. The customer and vendor journeys are now implemented. Earlier
wireframes in `docs/design` are historical; this guide describes current behavior.
Product rules remain in [the PRD](../PRD.md), with technical boundaries in
[architecture](../architecture.md).

## Customer journey

1. Open the shared website, browse Home/Shop or a category, and inspect a product.
   Browsing and ordering are guest flows; there is no customer account/signup step.
2. Choose weight or a configured fixed pack, allowed cuts, package size and notes.
   Show total weight and package count separately, including any permitted remainder.
3. Review/edit the cart, then enter contact/address, delivery zone, an offered date
   and a manual payment preference. Zone selection and date eligibility are checked
   during checkout; arbitrary appointments are not offered.
4. Review the trusted estimate and **Submit order request**. The submitted screen
   explains **Pending Review**, unpaid and unreserved, and provides a private status link.
5. Open the vendor-shared quotation, inspect its version, terms and highlighted changes,
   and explicitly approve. Success means **Confirmed** with stock reserved.
6. Return to the private status view for preparation, delivery and separate payment
   progress. A payment report remains unverified until the vendor checks it.

The cart persists locally for 48 hours; contact drafts remain in session storage for
24 hours. Successful submission clears both. Quotation/status capabilities use URL
fragments and must not appear in shared screenshots or analytics.

## Vendor journey

1. Sign in as the provisioned owner. The overview surfaces pending requests, delivery
   work and stock warnings; Orders supports search/filtering.
2. Review the original request in order details, edit proposed quotation terms and issue
   a versioned quote. Copy the private link or open a WhatsApp draft for manual sharing.
3. Before approval, revise if needed. The old approval link becomes invalid and the
   customer must approve the current version. Accepted terms cannot be edited in place.
4. Once approved, mark Preparing, Ready for Delivery, Out for Delivery and Delivered.
   Preparation deducts physical stock once. Payment remains independent.
5. Record payment only after checking receipt. Record delivery issues as private
   follow-up notes. Changing accepted terms requires cancellation/review and a newly
   approved request; a settings edit never silently rewrites an agreed commitment.
6. Use Manual Request for WhatsApp/telephone orders. Products, Inventory, Delivery
   Settings and Payment Settings manage the real local configuration and stock.

There is no vendor self-registration, multi-vendor marketplace, staff-role editor,
message automation or payment gateway in P0.

## Screens and responsive behavior

The [demo screen map](../demo-guide.md#screen-map) covers all **nine customer and ten
vendor screen requirements**. Home and Shop share C-S01. Product editing is a view
within Products. The app READMEs include route details and screenshots:

- [Customer storefront](../../apps/customer/README.md): mobile-first, checked at
  320/390/768/1440 px during the recorded browser run.
- [Vendor workspace](../../apps/vendor/README.md): sidebar on desktop and usable
  mobile navigation/cards, checked at 390/768/1440 px.

Shared controls supply labels, focus indicators, status badges and understandable
error/loading/empty states. No-config preview is clearly labelled and refuses
persisted mutations. A configured backend failure shows an error, not fake data.
Stale links, stock shortages and invalid dates leave the request unconfirmed.

## Visual direction

The wordmark uses a small monochrome steak above the I and a compact L icon. The
exact tagline is **Quality Meats, Greater Meals.** Big Shoulders, Inter and the forest,
sage and ivory palette come from shared source. Product illustrations are labelled
placeholders. See [the design guide](../design/README.md) for assets and historical
concepts that no longer define the UI.

## Evidence and next UX work

[Verification](../verification.md) records the dated browser run, screenshots, no-overflow
checks, axe results and limited keyboard checks. Safari, Firefox, physical-device and
screen-reader testing remain outstanding. Before commercial use, walk through the
journey with the vendor and validate terminology, cuts/packaging, yields, coverage,
schedules, prices, payment handling, cancellation/rescheduling and invoice needs.

New UX changes should preserve explicit customer consent and truthful business states.
Use a scoped worktree/branch and PR to `main` under [the root Git policy](../../AGENTS.md#git-workflow).
