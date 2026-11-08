# Contributing to Laviann

## Before making changes

1. Read [AGENTS.md](AGENTS.md) and the related requirements in [docs/PRD.md](docs/PRD.md).
2. Confirm the requested work falls within the agreed MVP and isn't a future feature.
3. Consider effects on the customer storefront, vendor dashboard and Supabase business rules.
4. Update requirements/ADRs if the change modifies agreed behavior or architecture.

## Git worktrees and pull requests

Follow the [root Git policy](AGENTS.md#git-workflow). Start by inspecting `git status`,
`git branch --show-current` and `git worktree list`. Preserve existing local changes.
For a new task, fetch the remote and create an isolated worktree from current `main`:

```sh
git fetch origin
# Replace the example directory and branch with names for your task.
git worktree add -b feat/your-change ../Laviann-your-change origin/main
cd ../Laviann-your-change
bun install --frozen-lockfile
```

When resuming, use the existing task branch/worktree instead of duplicating it.
Worktrees share Git history, but their files, dependencies and ignored environment
files are separate. They do not automatically isolate Docker containers or ports;
read [setup.md](docs/setup.md#working-in-another-worktree) before running a backend.

After the required checks, commit normally, push with
`git push -u origin HEAD`, and open a PR with **base `main`**. Explain the behavior,
validation and any limitations. Never merge automatically without owner approval.
Do not force-push, rewrite history or disable hooks to make the workflow pass.

Once the owner has merged the PR, inspect the primary checkout. If it is clean and
on `main`, synchronize it with:

```sh
git pull --ff-only origin main
```

If pulling fails because of local changes or divergent history, preserve and inspect
that work; do not reset it. Before removing a temporary worktree, confirm the PR is
merged and every needed change is committed and preserved, including any ignored
local files worth keeping. A squash merge may have a different commit ID, so also
check the merged PR's actual content. Remove only the verified inactive task worktree
with `git worktree remove <task-worktree-path>`; do not force removal.

## Coding standards

- Use Bun for dependency changes, scripts and the workspace lockfile.
- Use TypeScript strict mode and Next.js App Router patterns.
- Avoid committing credentials, real customer details or production inventory data.
- Recompute authoritative prices and inventory reservations on trusted server operations.
- Keep the customer app mobile-first and guest-accessible for catalogue browsing.
- Preserve the implemented P0 contracts in ADR-0004; keep fixtures visibly labelled.

## Required quality gates

```sh
bun run test:assets
bun run test:theme
bun run test:commit-msg
bun run test:unit
bun run check
bun run build
# With isolated local Supabase and both local app servers:
bun run test:integration
bun run test:browser
```

Both lint and typecheck also run automatically for each ordinary local commit through
`.husky/pre-commit`. Fix errors instead of skipping validation.

See [tests/README.md](tests/README.md) for setup and safe test isolation. For
documentation-only work, check links, images and any regenerated PDFs, run the
non-database gates above, and report that the existing database/browser results
are dated evidence. Let PR CI exercise its disposable stack; do not reset an active
demo merely to repeat unchanged application tests.

When product rules or PRD context change, edit `docs/PRD.md` and regenerate its PDF
using [the documented builder](docs/README.md#regenerate-the-prd-pdf). Keep historical
audit output dated; add new evidence rather than rewriting old results as a new run.

## Commit messages

Commit messages use **Conventional Commits 1.0.0** and project additions described in
[docs/commit-conventions.md](docs/commit-conventions.md). The `commit-msg` hook
runs `scripts/validate-commit-msg.sh`. Test the policy with:

```sh
bun run test:commit-msg
```

Examples:

```text
feat(customer): add weight input
fix(vendor): handle unavailable delivery date
docs(prd): clarify price snapshot rules
chore(repo): add workspace configuration
```

The repository is already linked to GitHub; new work is reviewed through PRs to `main`.

## Shared code and images

Edit shared colors/fonts in `packages/shared/src/theme`, common React components in
`src/ui`, and runtime contracts in `src/domain`, and generated database types in `src/types`. Both apps consume `@laviann/shared`.
The approved structure and export map are in [packages/README.md](packages/README.md)
and ADR-0002. Database types are generated with `bun run db:types`, not hand-edited.

Add static images under `packages/shared/assets/images`, retaining any nested folders.
App `predev` and `prebuild` scripts copy them to `public/assets/images`, overwriting
same-name files. There is no watcher and no automatic deletion. Restart the server
or run `bun run sync:assets` after an image change. Do not commit generated copies.
