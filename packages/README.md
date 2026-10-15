# Shared packages

`shared/` is the private Bun workspace `@laviann/shared`, used by customer and vendor.

```text
shared/
  src/theme/       # Authoritative palette, font preferences, derived CSS variables
  src/ui/          # Shared React UI, currently the scaffold page shell
  src/types/       # Shared theme/component contracts
  assets/images/   # Static images, nested freely (branding/ is ready for a logo)
```

Code is imported directly through the package exports; images are copied by
`scripts/sync-brand-assets.mjs` into each app's `public/assets/images/` before dev/build.
The script overwrites matching files without deleting anything or watching changes.
See [ADR-0002](../docs/decisions/0002-shared-foundation-and-assets.md).

Add business contracts when their shapes are agreed, keeping Supabase-generated
database types separate from UI contracts. A separate `@laviann/ui` workspace can be
introduced later if the component library needs an independent boundary.
