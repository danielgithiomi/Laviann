# Laviann implemented P0 visual identity

**Updated 18 October 2026.** This file replaces the earlier Concept A proposals with
the visual direction used by the implemented POC. The filename is retained for
existing links. Implementation approval is not merchant approval or trademark clearance.

## Identity

The brand is fresh, confident and approachable for a single raw-meat vendor in Mauritius.
The original **LAVIANN** SVG wordmark has a very small, monochrome steak-cut accent
above the I. The compact icon is a simple **L**. The exact tagline is
**Quality Meats, Greater Meals.** No leaf, red steak, restaurant cutlery or cooked-food motif.

Canonical files live in `packages/shared/assets/images/branding`: `wordmark.svg`,
`wordmark-white.svg`, `lockup.svg`, `lockup-white.svg`, `icon.svg` and `icon-white.svg`.
These are real vector assets, not crops from the reference board. Both apps use
`icon.svg` as the favicon in light mode and `icon-white.svg` in dark mode.

## Runtime palette

The table describes `packages/shared/src/theme/colors.ts`; edit that source when
changing the application and update this guide to match.

| Token               | Hex       | Purpose                                        |
| ------------------- | --------- | ---------------------------------------------- |
| `primary`           | `#12382F` | Wordmark, primary controls and navigation      |
| `primaryStrong`     | `#17483B` | Forest variation                               |
| `secondary`         | `#AFC799` | Sage accents and supporting panels             |
| `secondaryPale`     | `#EBF1E8` | Subtle tinted surfaces                         |
| `background`        | `#F4F7F3` | Ivory canvas                                   |
| `surface`           | `#FFFFFF` | Cards and fields                               |
| `text`              | `#263D35` | Main text                                      |
| `muted`             | `#52675D` | Secondary text, darkened after contrast checks |
| `border`            | `#DCE5DE` | Borders and dividers                           |
| `accent`            | `#C76B50` | Restrained terracotta emphasis                 |
| `warningBackground` | `#F9EBE4` | Warning surfaces                               |

Theme variables and Tailwind utilities derive from shared source. Do not introduce
separate palettes in each app. Recheck contrast when a token or its background changes;
color alone must not communicate an order/payment state.

## Typography and layout

Big Shoulders handles display headings; Inter handles body copy, controls, prices
and operational data. Both load through `@laviann/shared/fonts`; role mappings and
fallbacks are shared. Manrope was an early proposal and is not the application font.

Customer pages prioritize readable weights, prices, package counts and offered delivery
dates on mobile. Vendor pages use a forest sidebar and operational summaries on desktop,
with usable navigation and cards at mobile widths. Focus rings, errors, loading and
empty states are part of the interface. [Verification](../verification.md) records
Chromium/axe and viewport evidence; it is not full accessibility certification.

## Product imagery and history

P0 uses original, explicitly labelled SVG raw-chicken/beef illustrations. Actual merchant
photography and uploads remain future work. Do not imply the artwork shows real stock.

The older `figma-import` vectors, PNG previews and `tokens.json` remain exploratory
history. Use [current screenshots](../verification.md#responsive-accessibility-and-visual-evidence)
for visual comparison and [the UX guide](../ux/Laviann-UX-Plan-v0.1.md) for current flow.
