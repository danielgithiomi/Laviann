# ADR-0004: Transactional single-vendor POC

- Date: 2026-10-16
- Status: Implemented under the owner's full-P0 mandate; proposed implementation for PR review, not merchant-policy approval.
- Base: `chore/shared-foundation` at `466f169`.

## Decision

Keep both existing Next.js applications and the existing shared package. Shared
domain schemas validate transport data; a separate server-only export owns Supabase
clients. Public catalogue reads use a deliberately limited database projection.
Private guest operations use server-only credentials and purpose-scoped capabilities.
Vendor operations use the signed-in user's Supabase session and check the explicit
`vendor_admins` binding in the database on every operation. Signup is disabled in local Auth configuration; there is no signup UI.

Use integer grams and integer MUR cents. Products carry configured cuts, portions,
increments and optional fixed-pack offers. Independently replenished cuts have
independent stock sources; whole-to-cut conversion is not supported. Original
requests and issued quote lines are immutable JSON snapshots within relational
orders/quotations. Inventory balances, reservations, movements, approval events,
payment history, and delivery exceptions remain relational records.

Issue/revise locks the order, increments its quote version, and revokes previous
approval tokens. Approval locks the order and stock rows in UUID order, aggregates
all lines sharing a stock source, rechecks the current quote, expiry and offered
date, and reserves within one PostgreSQL transaction. Retrying the same approval
returns the existing result. Preparing consumes physical stock and releases its
reservation together. Cancellation before preparation releases once; cancellation
after preparation records the exception without restoring physical meat. Delivered
does not change payment. Post-approval quote edits are refused; the vendor must
cancel/review and obtain approval of a new request rather than alter consent.

Tokens contain 256 bits of entropy and are stored only as SHA-256 digests. Status
and approval capabilities have different purposes. The server deterministically
derives retry-safe tokens using HMAC and a private, separately configured secret;
idempotency keys alone cannot reconstruct them. Only the current quote capability
can approve. Personalized responses are no-store, noindex, and no-referrer; links
use URL fragments so capabilities do not enter HTTP access logs or Referer headers.

Guest requests and quote issuance have payload-bound idempotency keys. Stock and
payment adjustments also require operation keys. SQL constraints, restricted
function EXECUTE grants, empty function search paths, and RLS protect all tables.
Only narrow authenticated operations mutate data; browsers cannot update tables.
Guest endpoints use shared database rate limits and same-origin JSON POST checks.

Delivery weekdays, prior-day cutoff time, extra/disabled dates, zone fees, and
payment instructions are vendor configuration. Cutoffs use Indian/Mauritius;
calendar dates remain dates. Snapshots retain prices, payment instructions and delivery terms from issuance.
Date exceptions lock the zone row used by approval, including newly inserted dates.

Browser WCAG checks found that the old muted text failed contrast on ivory and pale
sage. The single shared muted token is now #52675D; primary forest, sage, ivory and
terracotta brand values are unchanged.

## Alternatives

Client-orchestrated stock updates cannot prevent overselling. An additional API
service would duplicate Next.js and Supabase responsibilities. Storing whole orders
as mutable documents would weaken quote history. Separate per-line stock locking
can deadlock and can miss repeated stock sources, so reservations aggregate sources.

## Demonstration and validation

Without configuration, show a labelled read-only fixture catalogue/dashboard and
allow local cart configuration. Refuse persisted operations with a useful setup
message; do not invent successful requests or approvals. Local Supabase, when
available, runs real auth, SQL and RLS. Reproducible seed values are explicitly demo.
No production database, deployment, real payments or automatic messaging is used.

Reference: [Supabase database functions](https://supabase.com/docs/guides/database/functions),
[SSR authentication](https://supabase.com/docs/guides/auth/server-side/creating-a-client).
