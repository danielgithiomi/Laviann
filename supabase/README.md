# Laviann local database

Supabase PostgreSQL and Auth back the implemented P0. Read [architecture](../docs/architecture.md)
for the table/RPC map and [security](../docs/security.md) for access boundaries.

| File                              | Purpose                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------ |
| `config.toml`                     | Local project `laviann`, ports and Auth settings                               |
| `migrations/202610160001_poc.sql` | Application tables, RLS, grants, snapshots and transactional operations        |
| `seed.sql`                        | Reproducible demo catalogue, inventory, five zones and manual payment settings |
| `../scripts/setup-local.ts`       | Loopback-only owner provisioning and private local environment files           |

The application schema is `public`. The seed contains Chicken and Beef, eight sample
products and demonstration prices/schedules. It contains no real customer data or
merchant credentials. Public signup is disabled; ownership requires an explicit
Auth user UUID in `vendor_admins`.

## Run and change the schema

Follow [setup.md](../docs/setup.md#real-local-database) for the complete sequence.
`bun run db:start` starts the local project; `bun run db:types` regenerates the shared
TypeScript contract from its current schema. Database resets erase local data: use
only the intended disposable Laviann stack, never an active demo or another project.
Worktrees share the configured default ports/project unless deliberately isolated.

For new schema work, add a forward migration instead of rewriting a migration that
has already been applied. Review permissions and transaction guarantees, apply it
to the disposable test database, regenerate types, and run the integration/browser
checks appropriate to the changed contract. Commit migration, types and dependent
code together. Formatting history does not establish a policy of rewriting migrations.

## Guarantees to preserve

- Prices and fees are recalculated from trusted configuration; weights and amounts
  use integer grams and MUR cents.
- Requests reserve nothing. Current quotation approval reserves atomically and
  idempotently; preparation consumes physical stock exactly once.
- Quote versions and accepted terms remain immutable. Stock-source locking aggregates
  repeated sources so concurrent approvals cannot oversell.
- RLS and explicit function grants restrict every data path. Vendor functions check
  owner membership; guest functions validate purpose, version and expiry.
- Delivered and Paid are independent. Manual adjustments retain reasons/history.

[Integration tests](../tests/integration/workflow.test.ts) exercise these guarantees
against real local PostgreSQL/Auth/RLS. [ADR-0004](../docs/decisions/0004-transactional-poc.md)
records the design. No hosted database or deployment is implied by local setup.
