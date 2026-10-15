# Contributing to Laviann

## Before making changes

1. Read [AGENTS.md](AGENTS.md) and the related requirements in [docs/PRD.md](docs/PRD.md).
2. Confirm the requested work falls within the agreed MVP and isn't a future feature.
3. Consider effects on the customer storefront, vendor dashboard and Supabase business rules.
4. Update requirements/ADRs if the change modifies agreed behavior or architecture.

## Coding standards

- Use Bun for dependency changes, scripts and the workspace lockfile.
- Use TypeScript strict mode and Next.js App Router patterns.
- Avoid committing credentials, real customer details or production inventory data.
- Recompute authoritative prices and inventory reservations on trusted server operations.
- Keep the customer app mobile-first and guest-accessible for catalogue browsing.
- Treat both starter apps as scaffolds until designs and core flows are agreed.

## Required quality gates

```sh
bun run test:assets
bun run lint
bun run typecheck
bun run build
```

Both lint and typecheck also run automatically for each ordinary local commit through
`.husky/pre-commit`. Fix errors instead of skipping validation.

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

GitHub repo creation and linking remain under the project owner's control.

## Shared code and images

Edit shared colors/fonts in `packages/shared/src/theme`, common React components in
`src/ui`, and shared contracts in `src/types`. Both apps consume `@laviann/shared`.
The approved structure and examples are in the README and ADR-0002.

Add static images under `packages/shared/assets/images`, retaining any nested folders.
App `predev` and `prebuild` scripts copy them to `public/assets/images`, overwriting
same-name files. There is no watcher and no automatic deletion. Restart the server
or run `bun run sync:assets` after an image change. Do not commit generated copies.
