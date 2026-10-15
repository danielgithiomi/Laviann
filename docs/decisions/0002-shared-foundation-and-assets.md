# ADR-0002: Shared foundation and startup image copying

- **Status:** Accepted
- **Date:** 2026-10-15
- **Scope:** Shared scaffolding for customer and vendor; no new product workflows

## Context

Both Next.js applications need one place for Laviann's palette, typography, shared
UI, types and static images. The planning chat agreed on `packages/shared`. The
latest implementation request replaces the earlier skip-existing-files proposal:
same-name source images must overwrite their copies on every dev/build start.

## Decision

1. Register `packages/shared` as private Bun workspace `@laviann/shared`. Both apps
   declare `workspace:*` dependencies and transpile it with Next.js.
2. Keep theme, UI and types under `src/`, exposed through explicit package exports.
   The two existing scaffold pages share a page shell. App content and page layouts
   remain local; detailed product/database types await implementation planning.
3. Define the approved forest-green palette once in `src/theme/colors.ts`. Derive
   CSS variables in the package and apply them in both root layouts. Typography
   preferences use local fallbacks until web-font loading is agreed. The JSON in
   `docs/design` remains a historical design snapshot, not runtime configuration.
4. Store static images in `packages/shared/assets/images`. One Node.js script,
   `scripts/sync-brand-assets.mjs`, copies every regular file recursively into
   `apps/customer/public/assets/images` and `apps/vendor/public/assets/images`.
   Skip only `.gitkeep` and `.DS_Store`. Preserve bytes, names, casing and nesting.
5. Always overwrite matching files. Never remove destination files. Never watch
   source images. Fail with a nonzero exit code if copying fails. Symbolic links
   in the source are unsupported; store actual image files in this directory.
6. Invoke the script per app through `predev` and `prebuild`. The root manual
   `sync:assets` command refreshes both apps. Paths resolve from the script's
   location rather than the caller's working directory.
7. Turbo builds also depend on the per-app uncached `sync:assets` task. This runs
   even for a build-cache hit; on a miss the lifecycle hook repeats the copy.
   Copying twice is harmless, and keeps direct app commands and Turbo commands
   correct without environment-specific branching in the script. Cache inputs
   include shared source code, source images and the synchronizer.
8. Ignore generated image directories in Git. Keep app-only public files outside
   them. Keep the canonical shared source files versioned.

## Example

`packages/shared/assets/images/Brands/Authentication/logo.svg` becomes
`public/assets/images/Brands/Authentication/logo.svg` in both apps, served at
`/assets/images/Brands/Authentication/logo.svg`.

Changing the source logo with the same filename then restarting development or
running a build refreshes both copies. Deleting or renaming a source deliberately
leaves the previous destination files in place until explicitly removed.

## Alternatives considered

- **Watch images continuously:** unnecessary for the requested restart/build workflow.
- **Copy only missing files or require a force flag:** leaves changed same-name logos
  stale; the latest user instruction explicitly requires automatic overwrites.
- **Mirror with deletion:** would remove destination files, contrary to the requested
  additive/overwrite behaviour.
- **Copy TypeScript and theme files too:** creates duplicate code. Import these as a
  workspace library; copy only the static files that need public URLs.
- **Separate shared UI workspace immediately:** no independent boundary is needed
  for one common page shell. UI lives inside `shared/src/ui` for now.

## Verification

Asset tests cover recursive binary copying, overwrite with unchanged filename/size/
timestamp, no deletion, app selection, empty/missing sources and CLI path handling.
CI runs these tests plus workspace lint, TypeScript checks and production builds.
Runtime smoke checks should verify startup hooks, cached builds and HTTP image bytes.

## Consequences

There is one editable source for images and theme values. Source-image edits require
a restart or manual sync. Old copies persist by design; a browser may also require
a refresh if it has cached the same URL. No final logo, web fonts, Supabase schema,
authentication or ordering functionality is introduced here.
