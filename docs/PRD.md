# Laviann - Product Requirements Document

**Version:** 1.0  
**Date:** 14 October 2026  
**Status:** Initial planning baseline - vendor assumptions require validation  
**Audience:** Product owner, prospective meat vendor, designers, implementation agents  
**Market:** Mauritius  
**Project type:** Single-vendor proof of concept

> **Product vision.** Make it easier for consumers to order raw meat with specific
> cuts, weights and packaging, while giving one meat vendor a central place to
> review orders, confirm quotations, prepare meat, monitor stock, and schedule
> deliveries around fixed routes across Mauritius.

**Presentation note:** All product prices, sample quantities, delivery fees, names,
weekly schedules, and order references in this document are demonstration values,
not approved business tariffs or operational commitments. Legal compliance and real
financial integrations must be separately validated before commercial launch.

## 1. Executive Summary

### 1.1 What we are building

Laviann is a digital raw-meat ordering and delivery-management platform for **one
independent vendor** based in Mauritius. It consists of two distinct Next.js
applications sharing a Supabase-backed data platform:

1. **Customer storefront:** A mobile-first, responsive Next.js web application
   opened using a shareable URL. No native app installation or app-store account
   is required. The customer can browse available raw meat, select specific
   cuts/weights/packs, enter cutting and packaging instructions, select a
   vendor-offered delivery date, and request an order.
2. **Vendor workspace:** A Next.js administrative application to manage products,
   physical inventory, stock warnings, manually entered WhatsApp orders, incoming
   requests, versioned quotations, customer approvals, preparation status,
   zone-based deliveries, and payment records.

**Back-end direction:** Supabase PostgreSQL, authentication, storage, realtime
updates and secure server-side/database operations. The repository uses Bun
workspaces and Turborepo. These are initial technology decisions, not a promise
of existing, functioning external integrations.

### 1.2 Current process and problem

At present, customers send orders to the vendor through WhatsApp. A message might
request six kilograms of chicken in particular cuts or packages. The vendor
records the request manually, photographs the written order, sends that image
back for approval, then cuts and packages the meat and delivers on a scheduled
regional route.

This process has unnecessary manual transcription, fragmented order history,
ambiguous requests, repetitive customer communication, and limited visibility
into stock and deliveries.

### 1.3 Laviann's proposed value

| Existing friction                                              | Intended Laviann improvement                                     |
|----------------------------------------------------------------|------------------------------------------------------------------|
| Orders described in free-form WhatsApp chats                   | Structured catalogue, weight, cut and packaging selections       |
| Handwritten notes and photographed order summaries             | Digital, itemized quotations with explicit approval              |
| Website customers and WhatsApp customers in separate workflows | Same vendor dashboard; vendor can enter WhatsApp orders manually |
| Inventory visibility relies on manual checks                   | On-hand, reserved and available stock with low-stock alerts      |
| Delivery routes organized from scattered conversations         | Orders grouped by vendor-defined zone and delivery day           |
| Payment and fulfillment progress remembered separately         | Independent, visible order and payment statuses                  |

### 1.4 POC success definition

A new customer must be able to use a phone browser to request a customized
six-kilogram meat order; the vendor must be able to review and quote it; the
customer must explicitly approve the current quotation; the system must reserve
stock; and the vendor must be able to mark the meat prepared and delivered while
recording the selected payment method/status. The vendor must be able to create
an equivalent order manually for a customer who contacted them via WhatsApp.

## 2. Goals, Non-Goals, and Scope

### 2.1 Product goals

| ID   | Goal                         | Observable outcome                                                           |
|------|------------------------------|------------------------------------------------------------------------------|
| G-01 | Simplify ordering            | Customers submit precise raw-meat requests without lengthy message exchanges |
| G-02 | Digitize confirmation        | Accepted order details, prices, and instructions are recorded electronically |
| G-03 | Centralize operations        | Website and manually entered orders share a single pipeline                  |
| G-04 | Make stock visible           | Vendor can replenish, adjust, reserve and inspect sellable inventory         |
| G-05 | Support scheduled deliveries | Customers choose only dates offered for the vendor's selected zone           |
| G-06 | Improve transparency         | Both sides can see the relevant progress of each order                       |
| G-07 | Validate adoption            | Vendor can assess whether the workflow saves time and is worth funding       |

### 2.2 In scope - P0 core MVP

- Single vendor with one administrator account and guest-friendly customers.
- Raw chicken and beef categories, extensible product definitions and availability.
- Specific meat cuts, cutting instructions, weight-based and fixed-pack ordering.
- Packaging portions and package-count previews.
- Mobile-first customer cart, contact/zone/delivery selection and order request.
- Vendor order list, order details, manual WhatsApp order entry and quotation review.
- Versioned quotation approval through a secure, shareable link.
- Basic physical inventory, stock reservations, adjustments and 10% default alerts.
- Vendor-controlled delivery days, cutoffs, fees and zone grouping.
- Cash / MCB Juice / bank transfer preferences and manual payment tracking.
- Dashboard alerts and manually shared WhatsApp confirmation links.

### 2.3 Excluded from this proof of concept

Native Android/iOS applications; multi-vendor marketplace; vendor self-service
onboarding; cooked, fried or marinated products; automated bank/MCB Juice
transaction verification; real money movement; live driver location tracking;
automated route optimization; complex tax/accounting; sophisticated warehouse
management; recurring subscriptions; loyalty rewards; multiple staff roles;
and automated WhatsApp Business API messages.

### 2.4 Product scope policy

A feature enters P0 only if it directly helps order, review, confirm, prepare,
deliver or safely manage the stock needed for an order. Future enhancements are
recorded, not implemented by default.

## 3. Users, Roles, and Permissions

### 3.1 Customer

A customer can browse before registering, configure products, submit an order
request with their name and phone number, provide delivery details, choose an
available date and payment preference, and securely approve a vendor-reviewed
quotation. They can subsequently review their own order status.

**MVP identity assumption:** guest checkout with contact details and an
unpredictable, expiring order/confirmation link. Full registered customer accounts
and phone verification may be added after validation. Customers must never be able
to read others' orders or administer stock.

### 3.2 Vendor administrator

The sole vendor administrator can sign in, maintain catalogue and stock,
configure delivery schedules, create manual orders, review and revise requests,
issue quotations, process confirmed orders, manage delivery status, and record
payments. Multiple employees and complex access roles are deferred.

### 3.3 Server-level authorization

Access must be enforced by trusted operations and Supabase Row Level Security
where database APIs are exposed. Hiding buttons in React components is not
authorization. Public browser clients must not receive Supabase privileged keys.

## 4. Catalogue and Product Customization

### 4.1 Catalogue principles

Products belong to categories such as Chicken and Beef. Future raw-meat categories (e.g. fish, pork) must be
configurable without source-code changes. A product may
have its own price per kilogram, purchasable increments, fixed packs, cutting
options, packaging options, photos, description and availability.

**Product examples:** whole chicken; chicken breast, thighs, wings and
drumsticks; beef mince, beef cubes and rump steak. No prepared or cooked meats
should appear in the initial catalogue.

### 4.2 Requirements

| ID     | Requirement             | Priority | Acceptance criterion                                     |
|--------|-------------------------|----------|----------------------------------------------------------|
| CAT-01 | Browse categories       | P0       | Customer can open Chicken and Beef listings              |
| CAT-02 | Display products        | P0       | Name, price/unit and availability appear for each        |
| CAT-03 | View product detail     | P0       | Allowed cuts, quantities and packs are visible           |
| CAT-04 | Display photos          | P1       | Vendor-uploaded images are shown where present           |
| CAT-05 | Enforce availability    | P0       | Unavailable products cannot be newly ordered             |
| CAT-06 | Extend catalogue        | P0       | Vendor can add a new category/product without code edits |
| CUS-01 | Order by weight         | P0       | Supported quantity/increment can be selected             |
| CUS-02 | Choose fixed packs      | P0       | Vendor-defined fixed-weight packs can be purchased       |
| CUS-03 | Order separate cuts     | P0       | E.g. 2 kg each of breast, thighs and wings               |
| CUS-04 | Request cutting         | P0       | Supported cut style or a vendor-review note is recorded  |
| CUS-05 | Select package portions | P0       | E.g. split 2 kg into 500 g portions                      |
| CUS-06 | Preview package count   | P0       | Customer sees 4 packages for 2 kg at 500 g/pack          |
| CUS-07 | Validate configurations | P0       | Unsupported combinations cannot be silently accepted     |
| CUS-08 | Recalculate estimate    | P0       | Price estimate updates with chosen quantity              |

### 4.3 Separate cuts versus cutting a whole product

The system supports both models:

- **Separate products:** customer selects 2 kg breast + 2 kg thighs + 2 kg wings.
  Each is priced and reserved against an appropriate sellable stock item.
- **Whole product with cutting request:** customer selects 6 kg whole chicken,
  requests curry-sized pieces, and asks for six 1 kg packages.

The first model is not the same as requesting a physically impossible output from a
whole chicken. If a customer requests a breakdown whose cut yields are uncertain,
the vendor must review and, if necessary, revise the quotation rather than
claiming that 6 kg of whole chicken can produce any arbitrary cut combination.

### 4.4 Packaging examples

| Product request                     | Packaging result                                  |
|-------------------------------------|---------------------------------------------------|
| 2 kg chicken breast; 500 g per pack | Four 500 g packages                               |
| 2 kg chicken thighs; 1 kg per pack  | Two 1 kg packages                                 |
| 6 kg whole chicken; 1 kg per pack   | Six 1 kg packages, subject to cutting instruction |
| 2.5 kg meat; 1 kg per pack          | Two 1 kg packs and 500 g remainder, if allowed    |

The application should explain remainder packs or prompt the customer to choose
compatible quantities. Free-form notes should not bypass product validation. The
vendor may flag unsupported requests for manual quotation review.

### 4.5 Product information model

Conceptual attributes: category, product name, description, images, stock unit,
pricing unit, price per unit, minimum quantity, quantity increment, allowed cuts,
allowed package sizes, fixed-pack offers, low-stock target, availability and
an internal inventory source. Detailed schema design is deferred.

## 5. Customer Cart and Checkout

### 5.1 Intended journey

**Browse -> Configure -> Cart -> Contact -> Delivery -> Payment preference ->
Review -> Submit request.** The storefront is mobile-first and accessed by a
shareable URL. An application installation is not required.

### 5.2 Requirements

| ID     | Requirement               | Priority | Acceptance criterion                                    |
|--------|---------------------------|----------|---------------------------------------------------------|
| CHK-01 | Manage cart               | P0       | Customer adds, edits and removes configured items       |
| CHK-02 | Show full item summary    | P0       | Cuts, weights, package counts and notes are visible     |
| CHK-03 | Collect contact           | P0       | Name and phone number are required                      |
| CHK-04 | Collect delivery details  | P0       | Zone, locality, address/landmark are captured           |
| CHK-05 | Show eligible dates       | P0       | Only vendor-configured dates past cutoff are selectable |
| CHK-06 | Calculate delivery fee    | P0       | Zone-specific fee appears in total                      |
| CHK-07 | Select payment preference | P0       | Cash, Juice and bank transfer as enabled                |
| CHK-08 | Submit request safely     | P0       | Valid submission creates Pending Review order once      |
| CHK-09 | Acknowledge submission    | P0       | Customer sees reference and next steps                  |

### 5.3 Guest ordering considerations

Customers may browse without authentication. At checkout they provide contact
information. The pending request must be accessible only to its customer and the
vendor via appropriate access controls. The customer must understand that
submission **requests a quotation** and does not yet mean the vendor has
accepted the order or that stock has been permanently reserved.

### 5.4 Example checkout

A customer selects 2 kg chicken breast, 2 kg drumsticks and 2 kg wings. They
request 500 g portions, choose North delivery, and select cash on delivery.
The displayed estimate is Rs 1,970 product subtotal + Rs 125 delivery = **Rs 2,095** (demo data only). The next eligible
North delivery date is offered.

## 6. Order Review, Quotation, and Confirmation

### 6.1 Why this step matters

The vendor's photographed handwritten note is replaced by a structured,
itemized digital quotation. The vendor can review actual stock and instructions,
propose changes, and request customer approval of the precise version that will
be prepared and delivered.

### 6.2 Requirements

| ID     | Requirement              | Priority | Acceptance criterion                                   |
|--------|--------------------------|----------|--------------------------------------------------------|
| ORD-01 | Receive website requests | P0       | New request appears in vendor order queue              |
| ORD-02 | Review request           | P0       | Vendor sees all items, cuts, packs, fees and contacts  |
| ORD-03 | Revise before approval   | P0       | Vendor can issue a corrected quotation                 |
| ORD-04 | Generate quotation       | P0       | Itemized, totalled summary is produced                 |
| ORD-05 | Share secure link        | P0       | Link opens the current quote for the intended customer |
| ORD-06 | Record approval          | P0       | Approved quote version and timestamp are stored        |
| ORD-07 | Update order status      | P0       | Only valid transitions are accepted                    |
| ORD-08 | Create manual order      | P0       | WhatsApp order enters identical workflow               |
| ORD-09 | Request revision         | P1       | Customer/vendor can return to review                   |
| ORD-10 | Cancel or reject         | P0       | Exceptional states follow documented rules             |
| ORD-11 | Record change history    | P1       | Relevant adjustments are auditable                     |

### 6.3 Distinguish business documents

- **Order request:** what the customer initially wants.
- **Quotation / pro forma:** vendor-reviewed items, quantities, charges and
  delivery commitment requiring customer approval.
- **Final invoice / receipt:** finalized transaction and payment record; exact
  production compliance/format to be validated with the vendor and local rules.

The quotation is required for the proof of concept. A simple receipt can be
generated after fulfillment; legal fiscal invoicing is a separate production
readiness exercise.

### 6.4 Quotation versioning

Each vendor revision creates a new quotation version, for example Order #1048,
Quote v2. The customer can only approve the **current** version. Older links must
not approve changed prices or instructions. Confirmation must revalidate the
relevant stock and delivery availability. An approval is only complete when the
reservation succeeds atomically.

### 6.5 Order states

| State                          | Meaning                                            |
|--------------------------------|----------------------------------------------------|
| Pending Review                 | Request received, vendor has not finalized a quote |
| Awaiting Customer Confirmation | Vendor quote issued; approval outstanding          |
| Confirmed                      | Current quotation approved and stock reserved      |
| Preparing                      | Vendor cutting and packaging the meat              |
| Ready for Delivery             | Preparation complete and awaiting route            |
| Out for Delivery               | Order dispatched with vendor                       |
| Delivered                      | Vendor marks delivery completed                    |
| Cancelled                      | Request/order cancelled according to policy        |
| Rejected                       | Vendor has declined the request                    |

A revised quotation returns to vendor review/customer approval and invalidates
prior approval links. Payment states are tracked independently.

### 6.6 Manual WhatsApp entry

The vendor can select **Create Order** and enter a customer's name, phone number,
items, weights, packaging, zone, delivery date and payment preference from a
WhatsApp or telephone conversation. The order origin is tagged `vendor_entered`
and follows the same quotation and fulfillment pipeline as a website order.

## 7. Inventory Management

### 7.1 Operating assumption

The vendor maintains physical stock and portions/packages it to order. They need
to replenish products, adjust stock, mark items unavailable and receive warnings. **This assumption must be validated
with the vendor** before production.

### 7.2 Requirements

| ID     | Requirement                    | Priority | Acceptance criterion                                 |
|--------|--------------------------------|----------|------------------------------------------------------|
| INV-01 | Set on-hand stock              | P0       | Vendor can enter tracked quantity                    |
| INV-02 | Add replenishment              | P0       | New stock increases physical on-hand value           |
| INV-03 | Adjust stock                   | P0       | Spoilage/corrections can be recorded with reason     |
| INV-04 | Reserve at confirmation        | P0       | Accepted order reduces available-to-promise quantity |
| INV-05 | Block overselling              | P0       | Two confirmations cannot exceed available stock      |
| INV-06 | Release unprepared reservation | P0       | Eligible cancellation restores available quantity    |
| INV-07 | Low-stock alert                | P0       | Warning appears when available falls to threshold    |
| INV-08 | Configure target               | P0       | Target quantity and warning percentage are editable  |
| INV-09 | Movement history               | P1       | Auditable adjustments, reservations and deductions   |

### 7.3 Stock definitions and formula

- **On-hand:** physical meat currently in the vendor's possession.
- **Reserved:** quantity promised to confirmed orders but not yet consumed by a
  documented preparation/fulfillment event.
- **Available to promise:** `on_hand - reserved`.

Example: 50 kg of chicken breast on hand, 12 kg reserved, **38 kg available**.
An order request is not a permanent reservation; a confirmed quotation reserves
stock. Preparation reduces physical stock exactly once and releases the matching
reservation without changing available stock twice.

### 7.4 Default low-stock rule

Each stock item can have a target quantity. A default warning threshold is **10%
of target stock**, editable per item. Example: target 50 kg -> warning at 5 kg
available or below. Dashboard warnings should be stateful, not repeated every
page refresh. More notification channels can be introduced later.

### 7.5 Avoid double counting cut yield

The POC may treat chicken breast and thighs as independently tracked sellable
stock sources. Do not simultaneously count whole chickens and all potential
cut-derived products as extra available inventory. Actual processing yields and
whole-to-cut conversions require vendor validation before implementation.

### 7.6 Atomicity and safe retries

The backend must check stock, create reservations and change order status in
one trusted transactional operation (e.g. a PostgreSQL function). Retried client
requests must not create duplicate reservations or consume stock twice.

## 8. Delivery Zones and Scheduling

### 8.1 Vendor-controlled dates

The vendor decides the delivery dates. Customers may choose **only from offered
dates** for their zone. The vendor can set regular weekly routes, exceptions,
cutoffs and unavailable days. Automated route planning is not required for POC.

### 8.2 Zones and illustrative fees

| Price rank  | Delivery zone | Dummy fee (MUR) |
|-------------|---------------|-----------------|
| 1 - lowest  | Central       | Rs 75           |
| 2           | North         | Rs 125          |
| 3           | West          | Rs 150          |
| 4           | East          | Rs 175          |
| 5 - highest | South         | Rs 225          |

The order and amounts come from the project owner's planning assumptions. The
vendor can change each fee without code edits. The exact localities assigned to
each region remain unvalidated.

### 8.3 Illustrative schedule

| Day       | Example region |
|-----------|----------------|
| Monday    | Central        |
| Tuesday   | West           |
| Wednesday | East           |
| Thursday  | North          |
| Friday    | South          |

This weekly schedule is dummy data. The actual calendar will be vendor-managed.
Orders submitted after a cutoff must be offered the next eligible slot instead.

### 8.4 Requirements

| ID     | Requirement           | Priority | Acceptance criterion                            |
|--------|-----------------------|----------|-------------------------------------------------|
| DEL-01 | Manage five zones     | P0       | Central, North, West, East, South exist         |
| DEL-02 | Edit zone fees        | P0       | Vendor can change fees per zone                 |
| DEL-03 | Set offered dates     | P0       | Vendor can configure recurring region days      |
| DEL-04 | Enforce cutoffs       | P0       | Expired slots cannot be selected                |
| DEL-05 | Show valid dates      | P0       | Customer only sees dates for selected region    |
| DEL-06 | Group delivery orders | P0       | Vendor filters/group by region and date         |
| DEL-07 | View delivery contact | P0       | Address, locality, landmark and phone visible   |
| DEL-08 | Update delivery stage | P0       | Ready, dispatched, delivered are trackable      |
| DEL-09 | Override schedule     | P1       | Vendor can adjust dates and communicate changes |

### 8.5 Addresses, failed delivery and rescheduling

Customers provide zone, locality, delivery address/landmark and contact number.
Map pin selection is optional later. If a customer is unavailable, the vendor
records an unsuccessful delivery and arranges a new plan manually. Existing
confirmed delivery charges/dates cannot be silently altered by later settings
changes; rescheduling requires a communicated update.

## 9. Pricing, Payments, and Documents

### 9.1 Authoritative price calculation

For the POC: `total = sum(line item price x quantity) + packaging fee + delivery fee`.
Packaging fees default to Rs 0. No promotions, automatic card billing or currency
conversions are required. Prices are calculated from trusted server-side data.
Client-visible totals are only estimates until vendor quotation approval.

### 9.2 Illustrative order total

| Line item          | Quantity   | Dummy unit price | Amount       |
|--------------------|------------|------------------|--------------|
| Chicken breast     | 2 kg       | Rs 475/kg        | Rs 950       |
| Chicken drumsticks | 2 kg       | Rs 290/kg        | Rs 580       |
| Chicken wings      | 2 kg       | Rs 220/kg        | Rs 440       |
| Packaging          | 12 x 500 g | Rs 0             | Rs 0         |
| Delivery to North  | 1          | Rs 125           | Rs 125       |
| **Total**          | **6 kg**   |                  | **Rs 2,095** |

Product prices and delivery fees are deliberately invented demo values. Once a
quote is approved, its accepted unit prices, quantities and delivery charge must
remain an immutable historical snapshot even if catalogue prices later change.

### 9.3 Payment methods and statuses

| Method           | POC handling                                                           |
|------------------|------------------------------------------------------------------------|
| Cash on delivery | Vendor records when cash is received                                   |
| MCB Juice        | Display configured instructions; vendor manually verifies receipt      |
| Bank transfer    | Display configured details/reference; vendor manually verifies receipt |

Payment states are independent of order states: **Unpaid**, **Payment Reported**, **Paid**, and, where relevant,
**Refunded** or **Failed**. Customer-reported
transfers or screenshots do not constitute independent proof of payment.

### 9.4 Requirements

| ID     | Requirement               | Priority | Acceptance criterion                        |
|--------|---------------------------|----------|---------------------------------------------|
| PAY-01 | Configure methods         | P0       | Vendor can enable/disable supported methods |
| PAY-02 | Select method             | P0       | Customer chooses an enabled option          |
| PAY-03 | Show instructions         | P0       | Vendor-approved instructions are visible    |
| PAY-04 | Update payment state      | P0       | Vendor records unpaid/reported/paid status  |
| PAY-05 | Record transfer reference | P1       | Reference can be stored with payment note   |
| PAY-06 | Independent states        | P0       | Delivered does not automatically mean Paid  |

### 9.5 Weight changes and invoice compliance

The demo assumes ordered weights are the agreed weights. If actual cuts differ,
the vendor should revise the quotation before approval. Post-preparation
reconciliation, applicable tax handling, regulated invoice content and electronic
invoicing requirements must be evaluated separately before commercial launch.

## 10. Notifications and WhatsApp

### 10.1 POC communications

At first, the system provides visible dashboard alerts and a **manual WhatsApp
sharing action**. The vendor can copy or open a ready-made message containing the
order reference, total, delivery zone/date and a secure confirmation link.

The system does **not** automatically send WhatsApp Business Platform messages in
this release. The proposal must not describe a simulated or manual action as a
live integrated service.

### 10.2 Requirements

| ID     | Requirement                  | Priority | Acceptance criterion                            |
|--------|------------------------------|----------|-------------------------------------------------|
| NOT-01 | Flag pending vendor orders   | P0       | New orders are visible in dashboard             |
| NOT-02 | Generate approval links      | P0       | Latest quote has a customer-specific link       |
| NOT-03 | Manual WhatsApp share        | P0       | Vendor can copy/share link and summary          |
| NOT-04 | Show customer progress       | P0       | Correct customer can view their order status    |
| NOT-05 | Show low-stock alerts        | P0       | Threshold warnings are visible to vendor        |
| NOT-06 | Auto WhatsApp via API        | P2       | Only after verified integration and permissions |
| NOT-07 | Automated delivery reminders | P2       | Future notification enhancement                 |

### 10.3 Sample template for manual sharing

> Your Laviann order #1048 is ready for review. Total: Rs 2,095. Delivery:
> North (Thursday). Please approve your current quotation at [secure link].

The sample link is illustrative; production links must use secure expiry and
version/identity checks.

## 11. Primary User Journeys

### 11.1 Customer storefront journey

| Step | Customer action                       | System response                                        |
|------|---------------------------------------|--------------------------------------------------------|
| 1    | Opens storefront link                 | Shows products available to order                      |
| 2    | Selects category/product              | Displays options and current illustrative prices       |
| 3    | Configures weight, cuts and packaging | Updates package count and price estimate               |
| 4    | Adds items to cart                    | Preserves complete preparation instructions            |
| 5    | Enters contact/zone/address           | Validates input and loads eligible dates               |
| 6    | Selects date and payment preference   | Adds delivery fee and shows payment details            |
| 7    | Reviews and submits request           | Records Pending Review order and reference             |
| 8    | Receives vendor's quotation link      | Displays reviewed latest quote                         |
| 9    | Approves quotation                    | Attempts atomic reservation and confirms if successful |
| 10   | Tracks order progress                 | Shows confirmed, preparing, delivery status            |

### 11.2 Vendor journey

| Step | Vendor action                   | System response                                 |
|------|---------------------------------|-------------------------------------------------|
| 1    | Signs into dashboard            | Displays orders requiring attention             |
| 2    | Opens Pending Review request    | Shows customer, products, cutting and packaging |
| 3    | Checks stock and edits proposal | Recalculates quotation as needed                |
| 4    | Issues reviewed quotation       | Generates versioned approval link               |
| 5    | Shares it via WhatsApp          | Opens or copies prepared message                |
| 6    | Customer approves               | Order confirmed and stock reserved if eligible  |
| 7    | Marks Preparing                 | Preparation instructions remain available       |
| 8    | Marks Ready for Delivery        | Order appears on date/zone delivery list        |
| 9    | Dispatches and delivers         | Updates status and timestamps                   |
| 10   | Records receipt of payment      | Payment state updates independently             |

### 11.3 Manual order from WhatsApp

The vendor selects **Create Order**, transcribes a WhatsApp or phone request,
selects products, quantities, packaging, customer contact and zone, issues the
quote and sends the link. After confirmation, the manual order flows through the
same pipeline. Its origin is recorded to assess adoption of the storefront.

## 12. Screen Inventory (No Visual Designs Yet)

### 12.1 Customer screens

| ID    | Screen                 | Primary contents                                             |
|-------|------------------------|--------------------------------------------------------------|
| C-S01 | Home / Catalogue       | Categories, available product cards, basic delivery guidance |
| C-S02 | Category               | Category product listing, price and availability             |
| C-S03 | Product details        | Weight, cut, package and notes configuration                 |
| C-S04 | Cart                   | All line items, instructions and subtotal                    |
| C-S05 | Checkout               | Contact information, zone, date, payment preference          |
| C-S06 | Order review           | Full requested products, fees and terms                      |
| C-S07 | Submitted              | Order reference and next-step explanation                    |
| C-S08 | Quotation confirmation | Vendor-reviewed current quote and approval control           |
| C-S09 | Order status           | Current preparation, delivery and payment states             |

### 12.2 Vendor screens

| ID    | Screen             | Primary contents                                           |
|-------|--------------------|------------------------------------------------------------|
| V-S01 | Login              | Vendor authentication                                      |
| V-S02 | Dashboard overview | Pending orders, delivery queue, stock warnings             |
| V-S03 | Orders             | Searchable/filterable order list                           |
| V-S04 | Order details      | Customer request, quotation versions, fulfillment actions  |
| V-S05 | Create order       | Manual WhatsApp order entry                                |
| V-S06 | Products           | Add/edit/disable catalogue, categories and prices          |
| V-S07 | Inventory          | On-hand, reserved, available stock, adjustments and alerts |
| V-S08 | Deliveries         | Scheduled date/zone grouping, customer addresses           |
| V-S09 | Delivery settings  | Zone fees, days, cutoffs and exceptions                    |
| V-S10 | Payment settings   | Accepted methods and vendor payment instructions           |

Design treatment, navigation patterns, fonts, palettes and layout details are
explicitly reserved for UX/UI planning.

## 13. Conceptual Data and Business Rules

### 13.1 Core conceptual entities

Vendor / Vendor User; Customer; Product Category; Product; Product Configuration;
Inventory Item; Inventory Movement; Inventory Reservation; Order; Order Item;
Quotation; Order Confirmation; Delivery Zone; Delivery Schedule; Payment Record;
Notification/Communication Event.

These entities explain *what must be represented*, not how database tables
should be named. A complete Supabase schema, access policies and server function
contracts will be designed during technical planning.

### 13.2 Non-negotiable business rules

| Code  | Rule                                                                    |
|-------|-------------------------------------------------------------------------|
| BR-01 | Only one vendor manages all POC orders                                  |
| BR-02 | Catalogue can add raw-meat products without source-code changes         |
| BR-03 | Server is authoritative for price and eligibility checks                |
| BR-04 | Customer approval applies to exact current quotation version            |
| BR-05 | Unconfirmed requests do not permanently consume inventory               |
| BR-06 | Reservation and order confirmation are atomic and idempotent            |
| BR-07 | Physical stock consumption is recorded exactly once                     |
| BR-08 | Cancelled, unprepared reservations are released safely                  |
| BR-09 | Physical cuts/whole meat cannot be counted twice                        |
| BR-10 | Delivery date options are vendor-owned and cutoff-aware                 |
| BR-11 | Previously agreed fees, prices, weights and dates remain snapshotted    |
| BR-12 | Delivery progress and payment verification are separate concepts        |
| BR-13 | Manual WhatsApp orders share standard quotation/fulfillment pipeline    |
| BR-14 | Public customers never have vendor-administrator access                 |
| BR-15 | Automated integrations may not be represented as live until implemented |

## 14. Edge Cases and Error Handling

| Situation                              | Required behavior                                                 |
|----------------------------------------|-------------------------------------------------------------------|
| Stock depletes during browsing         | Revalidate during review/confirmation; explain unavailable amount |
| Two customers confirm last stock       | Only reservations within physical availability succeed            |
| Invalid packaging remainder            | Explain remainder or request compatible quantity                  |
| Vendor revises a quotation             | Invalidate old approval and request approval of new version       |
| Customer repeats submission            | Avoid accidental duplicated orders through safe retries           |
| Customer cancels before preparation    | Release reservation according to cancellation policy              |
| Customer cancels after preparation     | Vendor manual review; do not restore prepared meat automatically  |
| Delivery date becomes unavailable      | Vendor proposes new date; customer is informed                    |
| Customer not present on delivery       | Mark unsuccessful delivery and arrange follow-up manually         |
| Payment screenshot is submitted        | Do not automatically set Paid                                     |
| WhatsApp manual sharing fails          | Keep link available for copying/retry                             |
| Connection drops during a state update | Safe retry with no duplicate stock transaction                    |
| Changing catalogue price               | Confirmed order keeps agreed historical amount                    |

## 15. Non-Functional Requirements

### 15.1 Quality and accessibility

Customer storefront must be comfortable on ordinary smartphone screens and
mainstream current mobile/desktop browsers. Use readable text, labeled form
controls, good contrast, keyboard accessibility and comprehensible validation
messages. Keep catalogue and checkout usable on normal mobile connections.
Numerical performance targets are to be established once working prototypes exist.

### 15.2 Security and data protection

| ID     | Requirement                                                         |
|--------|---------------------------------------------------------------------|
| SEC-01 | Vendor dashboard requires authentication                            |
| SEC-02 | Customers cannot access other customers' private records            |
| SEC-03 | All privileged changes require server-side authorization            |
| SEC-04 | Pricing and delivery fees are calculated from trusted configuration |
| SEC-05 | Inventory reservation is atomic, consistent and retry-safe          |
| SEC-06 | Confirmation links are expiring, unguessable and quote-scoped       |
| SEC-07 | Old quotation versions cannot be approved                           |
| SEC-08 | Customer phone/address data are not publicly exposed                |
| SEC-09 | Supabase RLS is enforced for exposed data paths                     |
| SEC-10 | Secret/service-role keys never reach the client bundle              |

### 15.3 Reliability and maintainability

Avoid duplicate orders, partial inventory updates and silently failed state
transitions. Use traceable errors and logs for critical business operations.
Keep product prices, stock targets, payment options, zones, delivery dates and
cutoffs vendor-configurable. Add monitoring before commercial launch.

### 15.4 Mauritius-specific launch dependencies

Before actual commerce, confirm Mauritian data-protection obligations, raw-meat
storage/handling/transport compliance, electronic/fiscal invoicing obligations,
and approved merchant payment processes. This PRD does not constitute legal or
food-safety advice and does not assert that production compliance is complete.

## 16. Demonstration Data and Vendor Assumptions

### 16.1 Dummy product prices

| Product            | Category | Illustrative MUR price per kg |
|--------------------|----------|-------------------------------|
| Whole chicken      | Chicken  | Rs 235                        |
| Chicken breast     | Chicken  | Rs 475                        |
| Chicken drumsticks | Chicken  | Rs 290                        |
| Chicken thighs     | Chicken  | Rs 350                        |
| Chicken wings      | Chicken  | Rs 220                        |
| Beef mince         | Beef     | Rs 830                        |
| Beef cubes         | Beef     | Rs 830                        |
| Rump steak         | Beef     | Rs 1,100                      |

Optional fixed-pack examples: chicken breast 500 g at Rs 237.50; breast 1 kg at
Rs 475; chicken wings 500 g at Rs 110; beef mince 500 g at Rs 415 and 1 kg at
Rs 830. The demo assumes no packaging fees. The vendor may eventually apply
different pricing for a fixed pack.

### 16.2 Assumptions to validate

| Topic            | POC assumption                           | Vendor clarification needed             |
|------------------|------------------------------------------|-----------------------------------------|
| Inventory        | Vendor maintains meat stock              | Replenishment sources and frequency     |
| Stock units      | Mostly kilograms                         | Piece-based and package-based tracking  |
| Cutting          | Separate cuts and cut-style instructions | Allowed combinations and yield policies |
| Packaging        | 500 g, 1 kg and other choices            | Actual sizes, constraints and charges   |
| Low stock        | 10% of vendor-configured target          | Preferred alerts and contact channels   |
| Delivery zones   | Central, North, West, East, South        | Exact locality coverage                 |
| Fees             | Rs 75, 125, 150, 175, 225                | Real transportation charges             |
| Calendar         | Vendor offers recurring delivery days    | Actual days, holidays, cutoffs          |
| Pricing          | Dummy MUR values                         | Actual catalogue and quote tolerance    |
| Payment          | Cash, Juice, bank transfer               | Accepted methods and reconciliation     |
| Documents        | Quote before approval                    | Tax and invoice obligations             |
| Delivery failure | Manual follow-up                         | Vendor's actual rescheduling policy     |

These assumptions should not be silently presented to the vendor as facts.

## 17. Demo Acceptance Scenarios

The POC is demonstration-ready when **all eight** scenarios work with sample data.

**A. Website order.** Customer opens shared URL, selects 2 kg each of breast,
drumsticks and wings, chooses 500 g packages, selects North delivery, sees
Rs 125 zone fee, selects payment preference and submits. Expected total:
**Rs 2,095** (dummy prices). Order appears as Pending Review.

**B. Vendor quotation.** Vendor reviews items, packaging and delivery details;
issues a quote. Order becomes Awaiting Customer Confirmation with a secure link.

**C. Customer approval.** Customer approves current quotation. Stock is
revalidated and reserved atomically; order becomes Confirmed.

**D. Fulfillment.** Vendor marks Preparing, Ready for Delivery, Out for Delivery
and Delivered, with correct preparation instructions and physical stock movement.

**E. Manual WhatsApp order.** Vendor creates a customer request, issues a quote
and processes it using the same pipeline as website orders.

**F. Low stock.** Item target stock is 50 kg; available falls to 5 kg. Vendor
sees the configured 10% warning.

**G. Concurrency.** Two customers request the final stock; system never confirms
more reserved quantity than physically available.

**H. Revised quote.** Vendor changes a quotation; previous confirmation link
cannot approve the superseded version.

Automated WhatsApp API notifications, real payments, native app publication or
live map tracking are **not** required for these scenarios.

## 18. Product Roadmap and Project Stages

| Stage                    | Focus                                                           | Output                                        |
|--------------------------|-----------------------------------------------------------------|-----------------------------------------------|
| 1 - Ideation             | Identify current WhatsApp workflow and opportunity              | Completed vision and assumptions              |
| 2 - Requirements         | Record functional rules and demo scenarios                      | This PRD v1.0                                 |
| 3 - UX planning          | Journeys, navigation, screen details and error states           | User flows and wireframes                     |
| 4 - Visual design        | Brand direction, palette, typography and components             | High-fidelity UI designs                      |
| 5 - Technical planning   | Supabase schema, Next.js boundaries, auth and service contracts | Architecture document and implementation plan |
| 6 - POC development      | Incremental core workflows and tests                            | Working customer + vendor web apps            |
| 7 - Vendor demonstration | Show real flow using dummy data                                 | Feedback and approval decision                |
| 8 - Production readiness | Validated real prices, legal and payment/WhatsApp processes     | Launch plan for approved business             |

### Delivery milestones once implementation begins

1. Catalogue and customizable product selection.
2. Cart and customer order request.
3. Vendor review and manual order entry.
4. Secure versioned quotations and customer approvals.
5. Physical inventory, reservations, replenishment and alerts.
6. Vendor-controlled zone/date delivery grouping.
7. Payment tracking, quotations and order document output.
8. End-to-end QA against eight acceptance scenarios.

## 19. Outstanding Decisions and Change Control

The PRD is a baseline, not evidence of vendor approval. We must still learn actual
stock workflows, cutting/packaging policies, delivery schedules, permitted
payment methods, real prices, tax obligations and address granularity. Changes
to those choices should be documented, reviewed for effects on orders and
inventory, and reflected in UX and test criteria.

**Next working session:** Map the mobile-first customer journey from opening a
shareable link to confirming an order; then map the vendor dashboard journey.
Only after these interaction flows are settled should we design visual styles
and choose detailed technical implementation patterns.

---

**Laviann - PRD v1.0.** Prepared for initial vendor discussion and internal
product planning. Dummy values and unvalidated assumptions are clearly labeled.
