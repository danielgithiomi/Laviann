# Implemented POC architecture

**As of 8 November 2026:** the local P0 is on `main`. This describes running code,
not the original scaffold. See [ADR-0004](decisions/0004-transactional-poc.md) for
rationale, [setup](setup.md) to run it and [verification](verification.md) for dated evidence.

## Applications and trust boundaries

| Layer                  | Responsibility                                                                     | Source                                                            |
| ---------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Customer Next.js app   | Public catalogue, local cart, guest request/quote/status UI                        | `apps/customer/src/app`, `src/components`                         |
| Vendor Next.js app     | Authenticated owner workspace and session-based operations                         | `apps/vendor/src/app`, `src/lib/data.ts`, `src/proxy.ts`          |
| Shared domain/UI       | Zod validation, weights/prices, schedules, fields, theme and fonts                 | `packages/shared/src/domain`, `src/ui`, `src/theme`               |
| Trusted server helpers | Supabase clients, HMAC guest capabilities, origin/body/rate checks                 | `packages/shared/src/server/index.ts`                             |
| PostgreSQL             | Authoritative pricing, authorization, snapshots, atomic stock and workflow changes | `supabase/migrations/202610160001_poc.sql`                        |
| Supabase Auth          | Single explicitly provisioned vendor owner, no public signup                       | `supabase/config.toml`, `scripts/setup-local.ts`, `vendor_admins` |

There is no separate API service. Next.js route handlers call PostgreSQL functions
(RPCs: database operations exposed through Supabase). Browser components never
receive service credentials. Vendor operations use the signed-in user's session
and recheck `vendor_admins` in the database. Guest handlers use server-only credentials
and narrowly scoped capabilities; an order UUID alone grants no private access.

## HTTP entrypoints

| App endpoint                       | Purpose                                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| Customer `/api/catalog`            | Limited public catalogue projection                                                            |
| Customer `/api/estimate`           | Validate requested lines/date and calculate trusted totals                                     |
| Customer `/api/requests`           | Create an idempotent Pending Review request and private status link                            |
| Customer `/api/guest`              | Resolve a private status/quote, approve the current quote, or report payment for manual review |
| Vendor `/api/login`, `/api/logout` | Owner session lifecycle                                                                        |
| Vendor `/api/operations`           | Validate owner operations and dispatch to authorized database functions                        |

Mutations use same-origin JSON requests with bounded bodies. Guest tokens travel in
URL fragments and JSON POST bodies, not URL queries. Sensitive responses are
no-store; private pages are noindex/no-referrer. Status and approval tokens have
separate purposes. Only digests are stored in the database; the server can derive
retry-safe links with a private HMAC secret. See [security](security.md).

## Order and stock lifecycle

1. **Request:** `create_request` recalculates the estimate and snapshots the request.
   Website and vendor-entered requests start Pending Review and reserve no stock.
2. **Quote:** `issue_quote` snapshots the reviewed lines, prices, packaging, payment
   instructions and delivery commitment. Each revision increments the version and
   revokes the previous approval capability.
3. **Approval:** `approve_quote` locks the order and relevant stock rows, rechecks the
   current version, expiry, date and availability, aggregates shared stock sources,
   then confirms and reserves atomically. Retrying does not reserve twice.
4. **Preparation:** `transition_order` deducts physical stock and releases the matching
   reservation together, once. Ready, Out for Delivery and Delivered follow.
5. **Exceptions:** cancellation before preparation releases reserved stock. Later
   cancellation records the exception without returning prepared meat to stock.
   Post-approval edits require cancellation/review and approval of a new request.
6. **Payment:** `record_payment` is a separate manual operation. A guest payment report
   does not verify receipt; Delivered never automatically means Paid.

All weights are integer grams and all amounts integer MUR cents. Available stock is
`on_hand - reserved`. Whole animals and derived cuts cannot both count as extra stock;
P0 uses independently replenished stock sources and no automatic yield conversion.
Delivery dates remain calendar dates, with cutoffs evaluated in `Indian/Mauritius`.
Accepted snapshots survive later catalogue, fee or schedule changes.

## Database map

All application tables are in `public`, with RLS, restricted table privileges and
explicit function grants. Security-definer functions use an empty search path and
qualified names. Direct browser table writes are not the mutation interface.

| Concern                                  | Tables                                                             |
| ---------------------------------------- | ------------------------------------------------------------------ |
| Owner and configuration                  | `vendor_admins`, `app_settings`, `payment_settings`                |
| Catalogue and delivery options           | `categories`, `products`, `delivery_zones`, `delivery_exceptions`  |
| Request and immutable commercial history | `orders`, `quotations`, `quotation_approvals`, `order_events`      |
| Stock accounting                         | `inventory_items`, `inventory_reservations`, `inventory_movements` |
| Payments and safe retries                | `payment_records`, `operation_receipts`                            |
| Guest access and abuse controls          | `guest_tokens`, `rate_buckets`                                     |

Customer contact/address and original order lines are request snapshots; there is no
customer-account table or separate mutable order-item service. Quotation lines are
immutable snapshots, and delivery grouping reads agreed order terms. Generated
TypeScript database types are in `packages/shared/src/types/database.ts`.

## Preview and local operation

No public Supabase URL means a labelled read-only demo. Local cart configuration
still works, but persisted operations return a setup error. Once configured, backend
errors are shown rather than replaced with fake success or fixture data. The real
local stack runs SQL, RLS and Auth; it is not an in-memory backend mock.

The cart expires after 48 hours in local storage. Contact drafts expire after 24 hours
in session storage; successful submission clears both. The apps share theme, fonts
and source images. See [packages/README.md](../packages/README.md) for asset rules.

## Continuing development

Use the root [Git/worktree policy](../AGENTS.md#git-workflow), [contribution checks](../CONTRIBUTING.md)
and [test guide](../tests/README.md). Add new migrations for future schema changes,
regenerate types and update affected contracts, UI and tests together. A worktree
isolates files, not the default local Supabase ports/project; preserve active demos.

P0 includes PostgreSQL/Auth, manual sharing/payment records and labelled illustrations.
Storage uploads, Realtime push, automated messaging/payment providers, customer
accounts, multiple vendors and production operations remain outside this implementation.
Vendor validation is still required before treating sample business values as real.
