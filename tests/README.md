# Laviann verification suites

Run commands from the repository root. [Recorded results](../docs/verification.md)
are dated evidence; rerun the affected checks for a new change. [CONTRIBUTING.md](../CONTRIBUTING.md)
defines the required gates, and [setup.md](../docs/setup.md) provides environment setup.

| Command                    | Coverage                                                         | Needs                                                                          |
| -------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `bun run test:assets`      | Nested asset copying, overwrite and preservation                 | Node, repository dependencies                                                  |
| `bun run test:theme`       | Shared Tailwind utilities/font contracts in both apps            | Installed dependencies                                                         |
| `bun run test:commit-msg`  | Commit subject/scope/footer policy in a temporary Git repository | Git and shell                                                                  |
| `bun run test:unit`        | Domain calculations, portions, schedules and quote comparison    | Bun                                                                            |
| `bun run check`            | Workspace lint and TypeScript checks                             | Installed dependencies                                                         |
| `bun run build`            | Both production Next.js builds and asset tasks                   | Initial font-download connectivity; backend optional                           |
| `bun run test:integration` | Real Auth, RLS, pricing, stock races, revisions and safe retries | Disposable local Supabase, provisioned owner, `psql`, private test environment |
| `bun run test:browser`     | Customer/vendor lifecycle, settings, responsive/axe checks       | Prepared local database, both app servers and Playwright Chromium              |

## Isolation and evidence

Integration tests are guarded to loopback database port 54322 and create fake records.
Browser tests use local app origins and sample contact details; reset/reprovision the
**disposable test stack** between integration and browser runs so stock assertions
start from the seed. Do not reset a running demo for unrelated documentation work.
Another worktree does not automatically create another Supabase stack.

Use `CUSTOMER_TEST_ORIGIN` and `VENDOR_TEST_ORIGIN` for alternate app ports. The server
origins and guest-link origin must agree with those values; see setup for the full
configuration. Never point these suites at a hosted merchant database.

Browser tests write screenshots, viewport/accessibility results and timing evidence
under `docs/screenshots`. Review images for private links, credentials and personal
data before committing them. Playwright reports and local credential files are ignored.
Keep earlier verification dates honest rather than overwriting their narrative with
unexecuted results.

## What the suites prove

The main journey verifies twelve 500 g packages from 2 kg each of breast, drumsticks
and wings, Rs 1,970 products + Rs 125 North fee = Rs 2,095, then quote approval,
reservation, preparation, delivery and separate manual payment. Manual WhatsApp
entry and invalidated old quote links follow the same pipeline. Database tests
exercise concurrent approval directly rather than relying on simultaneous clicks.

GitHub Actions runs independent quality/build and database/browser jobs for pushes
and PRs, uploads browser evidence, and stops its disposable stack afterward. Check
both jobs for the actual PR commit; do not infer a pass from an older run.

Chromium/axe checks are not complete accessibility or cross-browser certification.
Safari, Firefox, screen-reader and physical-device checks remain outstanding, as do
hosted security and production operational testing.
