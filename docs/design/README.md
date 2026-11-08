# Laviann design references and implemented identity

**Updated 18 October 2026:** the approved P0 visual direction is implemented in both
apps. Use the [current brand guide](brand-concept.md) and shared runtime source for
new work. Actual application screenshots live in [the verification gallery](../verification.md#responsive-accessibility-and-visual-evidence),
not in this folder's older preview images.

## Current source of truth

- [Shared theme](../../packages/shared/src/theme/colors.ts), [font roles](../../packages/shared/src/theme/typography.ts)
  and [font loaders](../../packages/shared/src/theme/fonts.ts): runtime palette, Big Shoulders and Inter.
- [Brand SVGs](../../packages/shared/assets/images/branding): original wordmark with
  small monochrome steak above the I, tagline lockups, inverted versions and L icon.
- [Product illustrations](../../packages/shared/assets/images/products): labelled
  raw-meat placeholders used by the POC; not photographs of merchant inventory.
- [UX guide](../ux/Laviann-UX-Plan-v0.1.md): implemented journeys, route references and limitations.
- [Shared package guide](../../packages/README.md): theme/UI ownership and asset-copy rules.

The exact tagline is **Quality Meats, Greater Meals.** Product behavior remains
governed by [the PRD](../PRD.md), not decorative labels in a mockup.

## Historical assets retained for context

| Asset                                                                             | How to use it                                                      |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `tokens.json`                                                                     | Original design-token snapshot; do not copy it over runtime tokens |
| `figma-import/*.svg`                                                              | Early editable vector concepts, not implemented screens            |
| `previews/*.png` and contact sheets                                               | Previews of those concepts, not browser evidence                   |
| [Figma import notes](FIGMA-IMPORT.md)                                             | Optional editing of archived vectors, with current-source pointers |
| [Handoff visual board](../../Laviann-Codex-Handoff-v2/README-USE-THIS-HANDOFF.md) | Approved visual reference and archive context                      |

The old leaf/circular logo, Manrope proposal, muted `#687A73`, unsupported claims and
mock data are superseded. Runtime muted text is `#52675D` after contrast checks.
Keep historical files identifiable rather than presenting them as current screenshots.
