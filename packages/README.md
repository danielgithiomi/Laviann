# Shared application foundation

`packages/shared` is the implemented `@laviann/shared` Bun workspace consumed by
both Next.js applications. Keep genuinely shared behavior here; app-specific screens
remain in their app. [Root agent instructions](../AGENTS.md) and
[architecture](../docs/architecture.md) define the wider boundaries.

## Exports and ownership

| Import                           | Source                                             | Purpose                                                                          |
| -------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| `@laviann/shared/theme`          | `src/theme/index.ts`, `colors.ts`, `typography.ts` | Semantic colors, font roles and derived style variables                          |
| `@laviann/shared/fonts`          | `src/theme/fonts.ts`                               | Shared `next/font` loaders for Big Shoulders and Inter                           |
| `@laviann/shared/theme.css`      | `src/theme/theme.css`                              | Tailwind v4 theme mapping and base styles                                        |
| `@laviann/shared/ui`             | `src/ui/`                                          | Brand, navigation, fields, password field, cards and other React components      |
| `@laviann/shared/components.css` | `src/ui/components.css`                            | Shared component styles                                                          |
| `@laviann/shared/domain`         | `src/domain/index.ts`                              | Zod contracts, integer-unit calculations and workflow helpers                    |
| `@laviann/shared/demo`           | `src/domain/demo.ts`                               | Explicitly labelled preview catalogue/settings fixtures                          |
| `@laviann/shared/server`         | `src/server/index.ts`                              | Server-only Supabase clients, guest capabilities, validation and HTTP safeguards |
| `@laviann/shared/types`          | `src/types/index.ts`                               | Shared public TypeScript types                                                   |

Paths in this table are relative to `packages/shared`. The generated database contract
is `src/types/database.ts`; regenerate it with `bun run db:types` after applying the
reviewed schema. It is not an invitation to edit generated types manually.

## Domain and server rules

Use integer **grams** for weight and integer **MUR cents** for money. Validate inputs
with the shared schemas, then enforce prices, stock and state transitions in trusted
server/database operations. Browser calculations are previews, not authority.

The server export imports `server-only`. Never import it in a client component or
expose private keys through `NEXT_PUBLIC_*`. Vendor writes use the authenticated owner
session; narrowly scoped guest actions use private server credentials and expiring
capabilities. See [ADR-0004](../docs/decisions/0004-transactional-poc.md).

## Theme and fonts

Edit `colors.ts` for runtime colors and `typography.ts` for heading/body roles.
`fonts.ts` loads Big Shoulders and Inter once in shared source; both app layouts use
these loaders. `theme.css` maps the derived variables into Tailwind v4 utilities.
Keep shared defaults in the base layer and shared/app components in the components
layer so utility overrides remain predictable. Both apps explicitly scan shared source.

`docs/design/tokens.json` and old vector mockups are historical references, not another
runtime theme. The muted text token is now `#52675D`, adjusted after contrast testing.
See [ADR-0003](../docs/decisions/0003-tailwind-and-shared-fonts.md).

## Source images and generated copies

Place source images under `packages/shared/assets/images`, including nested folders.
The original wordmark, compact L icon and labelled product illustrations live there.

```text
packages/shared/assets/images/<relative-path>
  → apps/customer/public/assets/images/<relative-path>
  → apps/vendor/public/assets/images/<relative-path>
```

`scripts/sync-brand-assets.mjs` preserves every relative path and overwrites matching
files. It skips only `.gitkeep` and `.DS_Store`, never deletes destination content and
never starts a watcher. Each app invokes it through `predev` and `prebuild`; Turbo
also has an uncached per-app asset task. Generated copies are Git-ignored. Restart
or run `bun run sync:assets` after changing a source image. Renamed/removed sources
leave old copies until deliberately cleaned up.

Future merchant product-photo uploads belong in a separately scoped Storage feature;
P0 does not include an upload service. See [ADR-0002](../docs/decisions/0002-shared-foundation-and-assets.md).

## Verification

Run `bun run test:assets`, `bun run test:theme`, `bun run test:unit`, `bun run check`
and `bun run build` at the repository root. Recheck both apps when shared behavior
changes. Server/domain changes also need the appropriate database/browser checks
in [tests/README.md](../tests/README.md).
