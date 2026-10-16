# ADR-0003: Tailwind v4 and shared font loading

- **Status:** Accepted
- **Date:** 2026-10-16
- **Scope:** Complete customer/vendor styling scaffolding; no product screens
- **Updates:** ADR-0002's temporary local-font preference; image policy is unchanged

## Context

The planning chat selected Tailwind utilities alongside ordinary CSS, with centrally
editable colours and typography. Both apps already share runtime CSS variables and
components. Duplicating the palette in app configuration would allow them to drift.

## Decision

1. Install Tailwind v4, its PostCSS plugin and PostCSS in each Next.js application.
   Use the CSS-first configuration; no legacy `tailwind.config.js` is needed.
2. Each `globals.css` imports Tailwind followed by `@laviann/shared/theme.css`.
   Explicit source paths cover the app's `src` and `packages/shared/src`, independent
   of whether development/builds start at the monorepo root or the app directory.
3. Keep palette values in `colors.ts`, font roles in `typography.ts`, and derived
   runtime CSS variables in `theme/index.ts`. Register semantic utilities with
   `@theme inline` in `theme.css`, so generated rules reference the runtime variables.
4. Define both `next/font/google` loaders once in shared `fonts.ts`, exported through
   `@laviann/shared/fonts`. Both layouts attach the generated variable classes to
   `<html>` alongside the existing theme variables. Next.js builds and self-hosts
   the fonts; the first build needs Google Fonts connectivity.
5. Use Big Shoulders for headings and Inter for body text. The planning advice called
   the heading face Big Shoulders Display; the installed Next.js exposes the current
   variable family as `Big_Shoulders`. Enable its optical-size axis and CSS automatic
   optical sizing. Supply an explicit Arial Narrow fallback with metric adjustment
   disabled; Next.js has no automatic metrics for this family. Keep general fallback
   families in `typography.ts`. This is a font choice, not a claim to have
   identified the exact font in the planning reference image.
6. Put shared defaults in `@layer base` and existing app styles in `@layer components`.
   Tailwind's utilities layer can then override them. Preserve scaffold heading
   weights and list bullets explicitly because Tailwind Preflight resets them.
7. Apply a few real utilities in the existing scaffold and shared page shell to
   exercise app/shared detection without redesigning the pages.

## Alternatives considered

- **Separate Tailwind theme file:** valid, but the requested existing `theme.css`
  keeps the mappings and shared defaults together with fewer entry points.
- **Duplicate tokens or loaders per app:** makes global branding changes easier to
  miss. Both applications should consume the same shared definitions.
- **Replace every CSS selector with utilities:** unnecessary for scaffolding.
  Layered CSS and utilities can coexist while visual design is still pending.

## Verification

`bun run test:theme` runs each real PostCSS configuration against its application
stylesheet. It checks runtime-variable utility output, shared-component discovery,
component layering and retained list markers. CI runs it alongside image-copy tests,
lint, type checks and both production builds. Browser checks cover both applications,
font loading and mobile/desktop layout.

## References

- [Tailwind with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- [Inline theme variables](https://tailwindcss.com/docs/theme#referencing-other-variables)
- [Explicit class source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files)
- [Big Shoulders family naming](https://github.com/xotypeco/big_shoulders/blob/master/README.md)
