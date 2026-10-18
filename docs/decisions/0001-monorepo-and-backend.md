# ADR-0001: Bun + Turborepo + two Next.js apps + Supabase

- **Status:** Accepted; implementation details recorded in ADR-0002 to ADR-0004
- **Date:** 2026-10-14
- **Product:** Laviann

> Implementation update (2026-10-16): the owner's full-P0 mandate and
> [ADR-0004](0004-transactional-poc.md) supersede the original scaffold-only stage
> restriction. The stack, shared theme/font source and overwrite-without-deletion
> asset policy remain in force.

## Context

The product is a proof of concept for one Mauritius-based raw meat vendor. Customer
orders will be initiated through a shareable, mobile-first web page. The vendor
manages products, stock, quotations, deliveries and payments in a separate admin
interface. Publishing native apps, operating a multi-vendor marketplace, and
maintaining a full standalone backend would add unnecessary launch complexity.

## Decision

1. Use **Bun workspaces** as package manager, with a single `bun.lock` after install.
2. Use **Turborepo** for tasks, caching and orchestrating the two Next.js workspaces.
3. Place applications in `apps/customer` (mobile-first web) and `apps/vendor`
   (responsive admin dashboard). Both use Next.js App Router and TypeScript.
4. Adopt **Supabase** as the planned backend (PostgreSQL, Auth, Storage, Realtime,
   and trustworthy server-side functions). Do not build NestJS at this stage.
5. Set up Husky to run lint + typecheck before commits and a POSIX shell
   Conventional Commit validator on commit messages.
6. Delay detailed domain schemas, server functions, routes and UI decisions until
   product UX and technical planning are approved.

## Alternatives considered

- **Nx:** A capable alternative with broader workspace tooling. Turbo is sufficient
  and less elaborate for two closely related Next.js applications.
- **Angular vendor dashboard:** Suitable but would introduce another UI framework.
  The project owner selected Next.js for both apps to keep stack uniform.
- **NestJS + PostgreSQL:** Strong fit for a mature service but unnecessary backend
  infrastructure for this early proof of concept.
- **MongoDB:** Can support the data but orders, items, inventory, payments and
  delivery schedules are naturally relational; Supabase includes additional services.
- **Native React Native app:** Unnecessary app-store friction for the vendor pitch;
  native apps remain a possible future channel.

## Consequences / constraints

- Product data must be protected by Supabase RLS, server-validated pricing,
  authorization checks, and atomic inventory operations when implemented.
- Business logic should not be buried in UI components or duplicated across apps.
- Manual WhatsApp links and manual payment reconciliation are explicitly simulated
  or human-driven in the POC, not claimed to be fully automated integrations.
- The P0 implementation is tested against local Supabase only (see
  `docs/verification.md`); no hosted project or production environment exists yet.
  Versioned install requires Bun registry access.

## Revisit if

- Business expands to multiple vendors or warehouses.
- Operational complexity justifies a dedicated service or more sophisticated
  monorepo orchestration.
- Native delivery tracking or third-party payment requirements change the model.
