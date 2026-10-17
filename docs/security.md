# POC security review and operating assumptions

This records implementation boundaries and local evidence, not an independent
penetration test or production approval.

## Identity and capabilities

- Customer browsing uses a limited catalogue RPC. It grants no table access to
  customer details, orders, tokens or stock movements.
- Vendor pages and APIs verify the Auth user and `vendor_admins` binding. Database
  mutations check that binding again. An authenticated non-owner has no privilege.
  Public signup is disabled locally; hosted Auth must receive the same setting.
- A status link cannot approve a quotation. Approval links are tied to one order,
  quote version, expiry and purpose. Revision revokes the old capability; approval
  rechecks after acquiring its order lock. Cancellation revokes approval capabilities.
- Tokens are HMAC-SHA-256 outputs using a private random secret, with only SHA-256
  digests stored in PostgreSQL. Stable derivation makes retries and owner link
  recovery possible without storing plaintext capabilities. UUIDs alone grant no access.
- Links use URL fragments, and the browser POSTs the token in a JSON body. Pages
  are noindex/no-referrer; sensitive responses are no-store. Do not introduce request
  body logging, analytics that record full URLs, or third-party scripts on these pages.
- A guest projection excludes contact/address, internal event notes, old quotes and
  token records. Products/portions, quotation notes, agreed totals and status are
  visible to the capability holder. Anyone with a forwarded private link has its
  authority; manual sharing must use the intended recipient.

## Trusted operations

- Server-only credentials never appear in `NEXT_PUBLIC_*`, client modules or response
  payloads. The shared server export imports `server-only`.
- Zod validates requests and returned data; SQL independently validates critical
  input. Prices and delivery fees come from database configuration, not client totals.
  Integer grams and MUR cents avoid floating-point inventory and pricing drift.
- Order and stock row locks, stable UUID lock order, aggregate stock-source quantities,
  uniqueness constraints and payload-bound idempotency protect concurrent retries.
  Preparing consumes physical stock and releases the reservation together.
- All application tables have RLS. Direct writes are revoked even from authenticated
  owners. Only explicitly granted RPCs can mutate; security-definer functions use
  an empty search path and fully qualified objects. Internal helpers are not executable
  by public/anon/authenticated roles.
- JSON mutation endpoints require an exact allowed origin. Body streaming enforces a
  48 KB cap, including chunked bodies. Errors avoid provider diagnostics and PII.
  Shared PostgreSQL rate buckets protect guest operations and login across instances.
- `TRUST_PROXY_IP=false` deliberately uses shared local quotas. For approved hosted
  use, configure a trusted proxy that replaces the forwarding header. Do not trust an
  arbitrary client-provided IP. Network-edge abuse protection remains a hosting concern.

## Local evidence

`tests/integration/workflow.test.ts` checks anonymous and non-owner RLS/RPC rejection,
unpredictable/scoped/expired tokens, superseded versions, malicious client prices,
duplicate requests and approvals, stock races, cancellation, payment independence,
date revalidation, low-stock thresholds and rate buckets. Browser HTTP tests check
origin, login, malformed and oversized request boundaries. See the executed results
in [verification.md](verification.md).

## Explicit POC assumptions

- Sample prices and weekly dates are demonstration data. Real vendor inventory,
  yields, schedules, service coverage, payment details and commercial terms still
  need merchant agreement. Separate cuts have independently replenished stock;
  no automatic whole-animal yield conversion or double-counting is implied.
- Status links expire after 30 days; approval links default to 48 hours, adjustable
  from 1–168 hours before issuance. Unconfirmed quotes never hold stock. Confirmed
  reservations remain until preparation/cancellation; no automatic reservation expiry.
- Changing accepted terms requires cancellation/review and a newly approved request.
  The POC does not silently edit an approved quote or reschedule a delivery promise.
  Date exceptions serialize with approval on the zone row; later changes do not
  rewrite an already accepted commitment.
- Payment instructions are captured when each quote is issued. Manual verification
  and a reference are required for Paid. There is no payment provider connection,
  settlement, automatic refund, fraud detection or proof-of-payment upload.
- The cart expires after 48 hours in local storage; contact drafts expire after 24
  hours in session storage. Successful request submission clears both. There are no
  customer accounts. Shared-device storage access is still possible before expiry.
- Auth password recovery, MFA enrollment, operational backups, retention/deletion
  procedures, monitoring and merchant onboarding need a separately scoped launch
  process. No live deployment or hosted security testing occurred.
- Product illustrations are explicit placeholders. Storage uploads, Realtime push,
  WhatsApp API automation, accounting and production invoices are outside P0.
  Refresh reloads real state; screenshots and printouts are quotation/status summaries.
- Rotating the HMAC secret prevents reconstructing old links from operation keys.
  Already issued links remain valid against their stored digests until expiry/revocation;
  issue a new quotation when a recoverable approval link is needed after rotation.
