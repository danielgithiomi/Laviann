# Laviann

**Single-vendor raw meat ordering and scheduled delivery platform for Mauritius.**

Laviann is a pitch-stage proof of concept. Customers will order through a **mobile-first
Next.js web application** accessed via a shared link, while the meat vendor will use
a separate **Next.js dashboard**. Supabase is the agreed backend direction.

> Scaffold status: the two Next.js starter pages are placeholders. No live orders,
> authentication, Supabase connection, inventory rules or payments have been built.

## Repository map

```text
Laviann/
├── apps/
│   ├── customer/        # Next.js mobile-first storefront; localhost:3000
│   └── vendor/          # Next.js dashboard; localhost:3001
├── packages/            # Reserved for genuinely shared packages
├── docs/
│   ├── PRD.md
│   ├── Laviann-PRD-v1.0.pdf
│   ├── commit-conventions.md
│   └── decisions/
├── scripts/
│   ├── validate-commit-msg.sh
│   └── test-commit-msg.sh
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── AGENTS.md
├── turbo.json
└── package.json
```

## Prerequisites

- macOS or another supported development OS
- Bun 1.4.x (https://bun.com/docs/installation)
- Node.js 22+ (Next.js development / tools)
- Git

## Initial setup

```sh
cd ~/Desktop/Projects/Personal/Laviann
# Only run if there is no .git folder yet:
git init
bun install
bun run prepare
bun run test:commit-msg
bun run check
```

`bun install` creates a `bun.lock` file. **Commit that lockfile** to make dependency
resolution repeatable for future installs. This archive deliberately does not contain
unverified node_modules or a hand-written lockfile.

Bun dependencies have to be installed on your machine. The starter files were
assembled in an isolated environment without registry access, so no install/build
success is claimed until the commands above complete locally.

## Development

```sh
bun run dev            # both apps, localhost:3000 and localhost:3001
bun run dev:customer   # customer only
bun run dev:vendor     # vendor only
bun run lint           # lint all workspaces
bun run typecheck      # check TypeScript all workspaces
bun run check          # lint + typecheck in both apps (pre-commit)
bun run build          # production builds
bun run format:check   # optional formatting check
```

### Hooks

Husky is configured with:

- `.husky/pre-commit`: blocks commits unless **both** workspace lint and typecheck pass.
- `.husky/commit-msg`: checks Conventional Commits via the POSIX shell script in `scripts/`.

Hooks are local safeguards; they may be bypassed and do not replace CI. Consider a
GitHub Actions workflow using `bun install --frozen-lockfile && bun run check && bun run build`
once you create the GitHub repository.

## Supabase (not connected yet)

Both apps contain an `.env.example`. When setting up a Supabase project, copy it to
`.env.local` in each app and fill in browser-safe public keys. Never put a service
role key in any `NEXT_PUBLIC_` variable or commit `.env.local`.

## Documents and decisions

- [PRD - editable](docs/PRD.md) - product requirements and demo acceptance criteria.
- [PRD - PDF](docs/Laviann-PRD-v1.0.pdf) - formatted vendor-pitch document.
- [Agent guide](AGENTS.md) - instructions for any coding assistant/provider.
- [Contributing](CONTRIBUTING.md) - quality gates and collaboration guidance.
- [Commit conventions](docs/commit-conventions.md) - commit grammar and examples.
- [Architecture decision](docs/decisions/0001-monorepo-and-backend.md) - why Bun,
  Turbo, Next.js and Supabase were chosen.
