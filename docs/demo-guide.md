# Laviann demo walkthrough

Use fake names/addresses and the local demo owner. The banner deliberately states
that prices and schedules are samples and no real payments are taken.

## Customer and vendor journey

1. Browse `/shop` or `/category/chicken`. Configure **2 kg Chicken Breast**, **2 kg
   Chicken Drumsticks**, and **2 kg Chicken Wings**, each split into **500 g** portions.
   Each line previews four packages; the cart preserves the selected cuts and notes.
2. Open `/cart`, then delivery details. Select **North**, an offered date, fake contact
   details and cash on delivery. Review shows products **Rs 1,970**, packaging **Rs 0**,
   delivery **Rs 125**, total **Rs 2,095**. Click **Submit order request**.
3. Save the private status link from the submitted screen. The request is **Pending
   Review**, unpaid, with no stock reservation. In the vendor dashboard, find its
   reference or customer name in Orders.
4. Review the original request. Configure any changes in the quotation editor and
   explain them in vendor notes. Issue **quotation v1**. Copy the private link;
   opening a WhatsApp draft is optional and does not send a message automatically.
5. Open that link as the customer. Review any highlighted differences and the total,
   then **Approve this quotation**. The database rechecks date, current version and
   stock in one transaction. Success means **Confirmed** and reserved stock.
6. Vendor marks **Preparing**: physical stock and reserved stock each decrease by
   2 kg per product, once. Mark **Ready for Delivery**. Deliveries groups the order
   under its agreed date and region, with customer contact and packaging details.
7. Mark **Out for Delivery**, then **Delivered**. Payment is still **Unpaid**. Record
   **Paid** with a verification reference only after the vendor has checked receipt.
   Refresh the customer's status page to see these independent states.

## Eight PRD scenarios and evidence

| PRD              | Implementation and check                                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| A: Website order | Browser journey plus SQL six-kilo test verifies Rs 2,095, 12 packages, Pending Review and no initial reservation.                                   |
| B: Quotation     | Vendor order details issues a versioned, immutable quote; browser opens its private link.                                                           |
| C: Approval      | Browser approves; SQL duplicate/concurrent calls prove reservation happens once.                                                                    |
| D: Fulfillment   | Browser completes each stage; SQL checks physical/reserved balances and duplicate preparation. Delivery leaves payment unchanged.                   |
| E: WhatsApp      | Manual order page uses the same request/quote/approval pipeline; browser and database tests verify the recorded origin.                             |
| F: Low stock     | Seed wings have 5 kg available against a 50 kg target and 10% threshold. Inventory tests cover replenishment, target and safe negative adjustments. |
| G: Concurrency   | Two real database clients race to approve 2 kg from the final 2 kg. Exactly one succeeds; there is one reservation and no partial allocation.       |
| H: Revised quote | Issue v2 before approval. Browser and SQL tests reject v1 and approve only v2; immutable original request remains available.                        |

The automated race uses isolated fake products so it does not depend on clicking
two browser tabs at exactly the same moment. This checks the database guarantee
directly. A rejected approval leaves the order unconfirmed for vendor review.

## Other working controls

- Products: add/edit/disable raw-meat products and categories; set prices, cuts,
  weight steps, fixed packs, portions and remainder policy. New stock starts at zero.
- Inventory: physical, reserved and available quantities; reasoned adjustments,
  replenishment, target/threshold and recent movement history.
- Delivery settings: fees, weekly weekdays, Mauritius cutoff time/lead days,
  additional dates and closures. Accepted snapshots remain unchanged.
- Payment settings: enable supported methods and edit instructions. At least one
  method must remain enabled. A customer transfer report is never automatically Paid.
- Cancellation: before preparation, releases reserved stock; after preparation,
  never returns meat to stock. A reason is required. Delivery follow-up records a
  private note without changing the approved commercial terms.

## Screen map

| PRD screen              | Route                        |
| ----------------------- | ---------------------------- |
| C-S01 Home/catalogue    | `/`, `/shop`                 |
| C-S02 Category          | `/category/[slug]`           |
| C-S03 Product           | `/product/[slug]`            |
| C-S04 Cart              | `/cart`                      |
| C-S05 Checkout          | `/checkout`                  |
| C-S06 Review            | `/review`                    |
| C-S07 Submitted         | `/submitted#<private-token>` |
| C-S08 Quotation         | `/quotation#<private-token>` |
| C-S09 Status            | `/status#<private-token>`    |
| V-S01 Login             | `/login`                     |
| V-S02 Overview          | `/`                          |
| V-S03 Orders            | `/orders`                    |
| V-S04 Details           | `/orders/[id]`               |
| V-S05 Manual request    | `/orders/new`                |
| V-S06 Products          | `/products`                  |
| V-S07 Inventory         | `/inventory`                 |
| V-S08 Deliveries        | `/deliveries`                |
| V-S09 Delivery settings | `/settings/delivery`         |
| V-S10 Payment settings  | `/settings/payments`         |
