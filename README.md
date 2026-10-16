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
├── packages/shared/     # @laviann/shared: theme, UI, types and static images
│   ├── src/{theme,ui,types}/
│   └── assets/images/branding/
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

`bun install` restores the workspace dependencies from `bun.lock`. Commit lockfile
updates when changing dependencies; CI installs with `--frozen-lockfile`.

## Development

```sh
bun run dev            # both apps, localhost:3000 and localhost:3001
bun run dev:customer   # customer only
bun run dev:vendor     # vendor only
bun run lint           # lint all workspaces
bun run typecheck      # check TypeScript all workspaces
bun run check          # lint + typecheck in both apps (pre-commit)
bun run build          # refresh shared images, then production builds
bun run sync:assets    # manually refresh shared images in both apps
bun run test:assets    # asset-copy regression tests
bun run test:theme     # compile both stylesheets and verify shared utilities
bun run format:check   # optional formatting check
```

### Hooks

Husky is configured with:

- `.husky/pre-commit`: blocks commits unless **both** workspace lint and typecheck pass.
- `.husky/commit-msg`: checks Conventional Commits via the POSIX shell script in `scripts/`.

Hooks are local safeguards and do not replace CI. The GitHub Actions workflow runs
asset-copy and shared-theme tests, lint, TypeScript checks and both production builds.

## Shared foundation

Both applications import `@laviann/shared` from the local Bun workspace:

- `@laviann/shared/theme`: colors, font preferences and CSS variables.
- `@laviann/shared/theme.css`: Tailwind v4 inline theme mappings and shared base styles.
- `@laviann/shared/fonts`: one Next.js font definition for both application layouts.
- `@laviann/shared/ui`: the common page shell used by both scaffold pages.
- `@laviann/shared/types`: shared theme and component contracts. Product/database
  contracts will be added when their implementation is agreed.

Change the forest-green palette in `packages/shared/src/theme/colors.ts`. Each root
layout applies the derived `--laviann-*` CSS variables. The `@theme inline` block in
`theme.css` connects those variables to Tailwind utilities, keeping values centralized:

```tsx
<section className="rounded-card border border-outline bg-surface p-6 text-ink">
    <h1 className="font-display text-brand">Laviann</h1>
    <p className="font-body text-subtle">Fresh meat, delivered on your regional day.</p>
</section>
```

`text-brand`, `bg-brand` and `border-brand` all use the same primary colour. Other
semantic names are `brand-strong`, `sage`, `sage-pale`, `canvas`, `surface`, `ink`,
`subtle`, `outline`, `accent` and `warning`. Shared radii provide `rounded-control`,
`rounded-card` and `rounded-pill`.

Headings use **Big Shoulders** and body text uses **Inter**. Change the loaders in
`packages/shared/src/theme/fonts.ts` to replace fonts for both apps; `typography.ts`
connects their CSS variables to the heading/body roles and fallback families.
Next.js 16 exposes the variable Big Shoulders family as `Big_Shoulders`; optical
sizing is enabled. `next/font` downloads the fonts at build time and serves them
from the application, so the browser does not request Google Fonts. A fresh build
needs access to Google Fonts. The heading loader uses an explicit Arial Narrow
fallback because Next.js has no automatic fallback metrics for this family; general
fallbacks in `typography.ts` remain available.

Each app's PostCSS config compiles Tailwind. Its `globals.css` imports Tailwind and
the shared theme, explicitly scans that app's `src` and `packages/shared/src`, and
keeps existing layout CSS in `@layer components`. Shared defaults use `@layer base`.
This allows utilities to override defaults when needed, while ordinary CSS still
handles app-specific styles. Use complete class names such as `text-brand`, not
constructed fragments such as `text-${colour}`, so Tailwind can discover them.

### Static images

Put source images under `packages/shared/assets/images/`, nested as needed:

```text
packages/shared/assets/images/branding/authentication/logo.svg
    -> apps/customer/public/assets/images/branding/authentication/logo.svg
    -> apps/vendor/public/assets/images/branding/authentication/logo.svg
```

Both apps can reference this image as `/assets/images/branding/authentication/logo.svg`.
The `branding` directory is initially empty; a final logo has not been designed.

One script, `scripts/sync-brand-assets.mjs`, copies the entire directory tree:

- Runs before each app's `dev` and `build` commands through `predev` / `prebuild`.
- Overwrites matching files every run, including an updated logo with the same name.
- Never deletes destination files, including files removed from the shared source.
- Does not watch images. Restart development or run `bun run sync:assets` to refresh.
- Skips `.gitkeep` and `.DS_Store`; all other regular files are copied unchanged.
- Fails the command if copying fails, instead of starting with incomplete assets.

Generated `public/assets/images/` copies are ignored by Git. Edit the shared source;
keep app-specific public assets outside that directory to avoid name collisions.
Deleting/renaming a source does not remove its old copies: remove those explicitly if
needed. Product photographs uploaded by a vendor will eventually use Supabase Storage.

`bun run dev:customer` and `bun run dev:vendor` refresh only that app. Running the
root `dev` or `build` handles both. Turbo also runs each app's uncached `sync:assets`
task before checking its build cache, so a cache hit still refreshes images. On a
cache miss the app's lifecycle hook may repeat the same safe copy. Shared theme/code
and image changes are included in the build cache inputs.

Use the Bun package scripts; invoking `next dev` or `next build` directly bypasses
package lifecycle hooks.

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

- [Shared foundation decision](docs/decisions/0002-shared-foundation-and-assets.md) - shared code and image copying.
- [Tailwind and fonts decision](docs/decisions/0003-tailwind-and-shared-fonts.md) - shared utilities and font loading.
