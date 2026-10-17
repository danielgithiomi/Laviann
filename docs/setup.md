# Run the Laviann POC

Use this repository's Bun workspaces. Do not create another Next.js project.
Normal development ports remain customer **3000** and vendor **3001**.

## Read-only preview

```sh
bun install --frozen-lockfile
bun run dev
```

With no `NEXT_PUBLIC_SUPABASE_URL`, the storefront and vendor workspace display
labelled demo catalogue data. Local cart configuration works; order submission,
authentication and vendor saves require the database. No fake successful mutation
is shown. Once a backend URL is set, failures show an error instead of fixture data.

## Real local database

Prerequisites: Docker running, Bun, Node 22+, Git and `psql` on PATH. The pinned
Supabase CLI is installed from `bun.lock`. On macOS, Homebrew's `libpq` includes
`psql`; on Ubuntu use `postgresql-client`. This stack uses 54321/54322 and project ID
`laviann-poc`; check for port conflicts before starting it. Leave other projects'
containers and databases alone.

```sh
bun run db:start
# Destructive to this local stack's demo data only:
bunx supabase db reset --local --yes
bun scripts/setup-local.ts
bun run db:types
bun run dev
```

The migration creates schema, transactions, RLS and explicit function grants. The
seed provides Chicken and Beef, eight sample products, five regional fees, sample
weekly dates, stock and manual payment instructions. It contains no real customers
or merchant credentials. Global signup is disabled. The email provider stays enabled so the provisioned
owner can sign in; `auth.email.enable_signup=false` would disable that provider. `setup-local.ts` creates a local Auth
user, binds that UUID in `vendor_admins`, and writes mode-600, Git-ignored app
`.env.local` files plus `.env.test.local`. The script refuses non-loopback databases.
It does not print keys or passwords. It reuses the local test secret/password on
reruns; reset/reprovision if the owner password is changed independently.

Open `apps/customer` at `http://localhost:3000` and the vendor login at
`http://localhost:3001/login`. The fake owner email and random password are in
`.env.test.local` as `TEST_VENDOR_EMAIL` and `TEST_VENDOR_PASSWORD`.

The two apps must use the same `SERVER_TOKEN_SECRET`. This is separate from the
Supabase service key. `APP_ORIGIN` is the exact browser origin for that app;
`CUSTOMER_ORIGIN` is used when the vendor generates a guest link. `localhost` and
`127.0.0.1` are different origins. See both `.env.example` files.

If normal ports are occupied, choose unused ports and set the matching origins.
For example, from `apps/customer`, run `bun run predev` then
`APP_ORIGIN=http://localhost:3100 bunx next dev --port 3100`; from `apps/vendor`,
run `bun run predev` then
`APP_ORIGIN=http://localhost:3101 CUSTOMER_ORIGIN=http://localhost:3100 bunx next dev --port 3101`.
Calling Next directly requires the explicit asset-copy step.

## Reproduce verification

```sh
bun run test:assets
bun run test:theme
bun run test:commit-msg
bun run test:unit
bun run check
bun run build
bun run test:integration
# Database tests intentionally create fake products/orders. Start the browser demo clean:
bunx supabase db reset --local --yes
bun scripts/setup-local.ts
bunx playwright install chromium
# Start both app servers in another terminal before this command:
bun run test:browser
```

Integration tests are explicitly guarded to `127.0.0.1:54322`. They test real SQL,
Auth, RLS, idempotency, stale capabilities, shared stock and concurrent approvals.
Browser tests are restricted to loopback servers and use fake customer information.
Use `CUSTOMER_TEST_ORIGIN` and `VENDOR_TEST_ORIGIN` for alternate test ports.
They save responsive screenshots and a viewport/accessibility matrix under
`docs/screenshots`. Playwright reports and local credentials remain ignored.
Reset demo data before repeating the browser stock assertions. After a config
change such as disabling signup, restart only this Supabase project to reload Auth.

Builds self-host Big Shoulders and Inter using `next/font`; the initial build needs
Google Fonts connectivity. No database is required to build the read-only preview.
The authoring machine used Bun 1.3.6; the repository/CI remains pinned to 1.4.3.

## Hosted setup requires a separate approved deployment

No hosted project is configured by this work. For a future approved staging setup,
apply the reviewed migration, seed only if explicitly wanted, disable public signup,
create the owner with Supabase Auth administration, and insert that exact Auth UUID
into `public.vendor_admins` using a privileged database administration session.
Never allow a client to self-assign ownership. There is no public vendor onboarding.

Use environment templates, HTTPS origins and a new shared random token secret.
Set private keys only on the Next.js servers. Confirm the platform replaces the
forwarded client-IP header before enabling `TRUST_PROXY_IP`; otherwise rate limits
remain shared. Establish an owner recovery process, backups and merchant policies
before using real orders. These deployment steps were not executed.

To stop only this local stack without discarding its saved volumes:

```sh
bunx supabase stop
```
