# Laviann - UX Planning v0.1

**Stage:** UX planning, exploratory UI concept  
**Scope:** Single raw-meat vendor in Mauritius  
**Status:** For review; not implementation approval  
**Source of truth:** `docs/PRD.md`

## Experience principles

1. **Mobile customer first.** The primary journey begins when a customer opens a shared WhatsApp link on a smartphone. Browsing must work without an account.
2. **Raw meat, not prepared meals.** Customers buy chicken and beef as cuts or raw meat with cutting instructions. Do not depict fried, marinated, or cooked food.
3. **Make weight and packaging explicit.** Distinguish `2 kg ordered` from `4 x 500 g packs`. Avoid vague counts and misleading prices.
4. **Show vendor-controlled delivery.** The customer selects a zone and may choose only dates offered by the vendor. No arbitrary on-demand appointment selection.
5. **Requests precede commitments.** Customer checkout creates an order request. Vendor reviews the request, sends a quotation, and customer approves its exact version.
6. **Reduce vendor keystrokes.** Put new orders and exceptions first; make WhatsApp-originated manual order entry a first-class action.
7. **Keep operations traceable.** Order status and payment status remain independent. Inventory reflects on-hand, reserved and available quantities.
8. **Keep pricing honest.** The samples in this design are placeholders in Mauritian rupees, not vendor-confirmed product prices.

## Customer information architecture

- **Home/Catalogue** (`C-S01`) - discover products and delivery region.
- **Category** (`C-S02`) - filter by Chicken, Beef, and future categories.
- **Product Detail** (`C-S03`) - select weight, cuts, instructions and packaging.
- **Cart** (`C-S04`) - verify the product and per-package configuration.
- **Checkout** (`C-S05`) - customer contacts, delivery address, zone, offered date, payment preference.
- **Review Request** (`C-S06`) - review price estimate and request submission.
- **Order Submitted** (`C-S07`) - show order reference and what vendor review means.
- **Review Quotation** (`C-S08`) - approve or request a change to versioned quotation.
- **Order Status** (`C-S09`) - view latest order, preparation, and delivery status via secure link.

### Customer happy path

`WhatsApp / direct link` → `Catalogue` → `Product detail` → `Cart` →
`Contact + zone + vendor date + payment` → `Submit request` →
`Vendor review` → `Secure quotation link` → `Confirm latest quote` →
`Order status and delivery`.

### Customer UX details to validate

- Weight is the selling unit for listed sample products; options per product vary.
- In product details, quantity, cut preference, and packaging are separate controls.
- Example: Chicken breast / 2 kg / whole / four packs of 500 g.
- On small screens, the product price and main action may stay in a sticky bottom bar.
- Checkout must collect **locality, full address or landmark, and phone number**; the illustrative screen shows only the condensed delivery panel, not every field.
- Checkout button says **Submit order request**, not **Pay now** or **Confirm purchase**.
- Quotation approval is a separate step. Material vendor changes invalidate earlier links.
- The example screenshots use North Thursday delivery and Rs 125 fee as dummy data.
- Long forms should scroll naturally; no modal-only steps that trap customers.

## Vendor information architecture

- **Overview** (`V-S02`) - daily counts, new requests, stock alerts, next route.
- **Orders** (`V-S03`) - status filtering, search, grouping by delivery zone/date.
- **Order detail** (`V-S04`) - review products, requested portions, customer, payment, quote version, allowed status transitions.
- **Create order** (`V-S05`) - enter a WhatsApp or phone request manually.
- **Products** (`V-S06`) - manage categories, prices, weights, cutting options.
- **Inventory** (`V-S07`) - on-hand vs reserved vs available, threshold alerts, manual adjustments.
- **Deliveries** (`V-S08`) - group confirmed orders by zone and scheduled day.
- **Delivery settings** (`V-S09`) - zone fees, vendor schedules, cutoff time.
- **Payment settings** (`V-S10`) - accepted payment types and instructions.

### Vendor happy path

`Vendor dashboard` → `New request` → `Review + quote` →
`Share approval link on WhatsApp` → `Customer approval` →
`Reserve stock` → `Prepare/portion` → `Ready for region's route` →
`Out for delivery` → `Delivered` → `Record payment`.

### Vendor exceptions

- Customer has requested stock that is no longer available.
- Cutting/yield instructions cannot be fulfilled exactly.
- A confirmed order requests modification: requires an explicit new quotation where material.
- Delivery day is unavailable or a cutoff has passed.
- Payment reported by customer but unverified by vendor.
- Customer misses delivery; follow manual vendor-handled rescheduling.

## Responsive design approach

**Customer web**
- Primary reference artboard: **390 × 844** (common mobile layout).
- Larger-screen reference: **1440 × 930**; wider catalogue cards, horizontal navigation and a spacious hero.
- Design for 320 px and up, with touch targets around 44px minimum and content-driven scrolling.
- Mobile navigation may use Home, Shop, Orders, Account; orders/account links may resolve through secure links before account features exist.

**Vendor web**
- Primary working view: **1440 × 960** with a navigation sidebar and data-first overview.
- Narrow-screen reference: **390 × 844**, prioritizing Orders, Stock and Deliveries rather than shrinking a desktop table.
- Desktop tables turn into stacked action cards on narrow devices.
- Separate attention states: new order, awaiting approval, preparing, low inventory, payment exception.

## Screens represented in concept set

| File | View | What it demonstrates |
|---|---|---|
| `00-brand-palette.svg` | Brand board | Forest/sage/ivory direction and component tokens |
| `01-customer-home-mobile.svg` | Customer / mobile | Brand, delivery region, categories, product cards |
| `02-customer-product-mobile.svg` | Customer / mobile | Weight, cutting and packaging selectors; cost feedback |
| `03-customer-checkout-mobile.svg` | Customer / mobile | Zone, offered date, order totals, payment preference |
| `04-customer-quotation-mobile.svg` | Customer / mobile | The **critical customer approval** step |
| `05-customer-storefront-desktop.svg` | Customer / desktop | Wide-screen version of the customer catalogue |
| `06-vendor-dashboard-desktop.svg` | Vendor / desktop | KPIs, new orders, delivery and inventory attention |
| `07-vendor-orders-mobile.svg` | Vendor / mobile | Small-screen operational order cards |
| `08-vendor-inventory-desktop.svg` | Vendor / desktop | Stock table and configurable-alert affordances |

These are **concept mockups**, not the complete list of screens in the PRD.
In particular, cart editing, full addresses, manual order creation, order details, delivery settings and order status pages remain to be wireframed.

## Visual concept notes

The drawings intentionally use editable vector illustrations as **placeholders** for real product photography. In a production storefront, high-quality photographs of the vendor's actual raw cuts should be used, with consistent lighting and neutral backgrounds. No asset is an actual product photograph.

The PRD PDF used a deep green identity; this iteration explores how that visual direction could carry across both customer and vendor experiences. Brand naming, logo treatment and typography remain subject to review. `docs/design/brand-concept.md` contains the proposed palette.

## Questions to settle during the next UX review

1. Should customers first choose their delivery zone and next vendor date before browsing, or only during checkout? Current concept shows location near the top and final confirmation at checkout.
2. Should product cutting and packaging options be on a single product page (current concept) or in a step-by-step configurator?
3. Should the vendor's default Orders view be a status table or cards/kanban board? Current concept uses tables on desktop and cards on mobile.
4. Is the forest-green direction appropriate for the vendor's brand, or should we explore a warmer, more traditional butcher-shop alternative?

## Stage gate

Do **not** implement live APIs or production styling solely from these exploratory mockups. After stakeholder feedback, create low-fidelity wireframes for all P0 flows, approve reusable UI components, then update the PRD/UX plan before implementing screens.
