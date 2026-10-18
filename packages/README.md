# Shared packages

`shared/` is the private Bun workspace `@laviann/shared`, used by customer and vendor.

```text
shared/
  src/theme/       # Palette, font loaders/roles, CSS variables and Tailwind inline theme
  src/ui/          # Shared React UI: page shell, primitives, product/quotation forms
  src/domain/      # Zod contracts, pricing/packaging/date/status rules, demo catalogue
  src/server/      # Server-only Supabase clients, guest tokens, API helpers
  src/types/       # Shared contracts and generated database.ts (`bun run db:types`)
  assets/images/   # Static images, nested freely: branding/ logos, products/ illustrations
```

Code is imported directly through the package exports; images are copied by
`scripts/sync-brand-assets.mjs` into each app's `public/assets/images/` before dev/build.
The script overwrites matching files without deleting anything or watching changes.
See [ADR-0002](../docs/decisions/0002-shared-foundation-and-assets.md).

`@laviann/shared/fonts` supplies Big Shoulders and Inter through `next/font` to both
root layouts. `@laviann/shared/theme.css` maps runtime tokens into Tailwind utilities
and base styles. Import it after Tailwind in each app's `globals.css`, with an
explicit `@source` for shared components. See
[ADR-0003](../docs/decisions/0003-tailwind-and-shared-fonts.md) and the root README
for the customization path and available class names.

Keep Supabase-generated database types separate from the Zod domain contracts, and
import `@laviann/shared/server` only from server components and route handlers. A separate `@laviann/ui` workspace can
be
introduced later if the component library needs an independent boundary.
