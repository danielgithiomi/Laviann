# Laviann - approved visual design specification (v1.0)

Status: Approved visual direction for implementation. This document supersedes older logo, tagline, and typography
proposals. It does not override the product rules in `docs/PRD.md`.

## Brand identity

- Product name: **Laviann**. Display wordmark: **LAVIANN**.
- Exact tagline: **Quality Meats, Greater Meals.** The marketing lockup may use uppercase lettering, but preserve the
  words, comma, and meaning.
- Personality: confident and premium without feeling exclusive; modern, trustworthy, and straightforward, designed for
  customers ordering raw meat in Mauritius.
- Primary lockup: compact, uppercase, condensed wordmark. The letter **I** carries a **small steak-cut outline mark**
  above it instead of a leaf. The accent MUST be modest: approximately the visual weight of a typographic accent, about
  25-35% of the letter cap-height; it must not dominate the wordmark or float far above it. Treat these proportions as a
  design starting point and adjust optically.
- Logo mark for application icon: a large, simple **L** monogram with the same small cut-of-meat outline at its upper
  right, inset sufficiently to read at favicon sizes.
- The steak accent must use the same one-color treatment as the wordmark: deep forest (#12382F) on ivory/white, white on
  deep-forest backgrounds. No bright red meat icon, multi-color marbling, gradients, glow, or drop shadow on the logo.
- Avoid leaves, plant imagery, faux organic health-product signals, generic restaurant cutlery symbols, photoreal meat
  in the logo, detailed butcher illustrations, and overly elaborate outlines.
- Produce actual optimized, accessible SVG files; do NOT crop a logo from the reference board PNG. Need: horizontal
  wordmark with and without tagline, inverted white version, square L icon, favicon-appropriate minimal variant, plus
  sensible accessible names. Check monochrome usage and visibility at 24px and 32px. SVGs should scale cleanly and
  retain recognizability at reduced sizes.
- Do not claim the illustrative steak shape is a final legal trademark or that the product's merchant has approved the
  brand.

## Approved colors - authoritative values already in shared source

| Semantic purpose                   | Token/code          | Hex       |
|------------------------------------|---------------------|-----------|
| Deep Forest / primary              | `primary`           | `#12382F` |
| Deep Forest variation              | `primaryStrong`     | `#17483B` |
| Sage                               | `secondary`         | `#AFC799` |
| Pale sage                          | `secondaryPale`     | `#EBF1E8` |
| Ivory canvas                       | `background`        | `#F4F7F3` |
| White surface                      | `surface`           | `#FFFFFF` |
| Main text                          | `text`              | `#263D35` |
| Muted text                         | `muted`             | `#687A73` |
| Border                             | `border`            | `#DCE5DE` |
| Warm terracotta / secondary accent | `accent`            | `#C76B50` |
| Warning background                 | `warningBackground` | `#F9EBE4` |

The established runtime source of truth is `packages/shared/src/theme/colors.ts`. `packages/shared/src/theme/index.ts`
maps tokens to `--laviann-*` properties applied on both HTML roots. `packages/shared/src/theme/theme.css` maps these to
Tailwind v4 utilities through `@theme inline`. **Do not duplicate hex values in two app files, Tailwind config objects,
or components.** Status colors may need additional accessible semantic tokens, added to the shared source after review;
never make the brand logo red to match a status color.

## Typography

- Display type: **Big Shoulders Display** (or closest compatible Big Shoulders variant already loaded in the repository,
  after visual checking), condensed and uppercase for major marketing headings, category names, and section titles. The
  actual repository presently loads `Big_Shoulders` through `@laviann/shared/fonts`; assess rather than blindly
  replacing it.
- Body type: **Inter** for paragraphs, buttons, inputs, cards, product information, delivery details, vendor tables,
  quantities, and financial figures.
- Shared source: `packages/shared/src/theme/typography.ts` plus existing `packages/shared/src/theme/fonts.ts`/
  `next/font` integration. Retain a single source of style tokens and preserve accessible font fallbacks.
- Use the display face sparingly in vendor views; information density and readability take precedence over decoration.
  Never set small form labels or long-body text in all-cap display type.

## UI language and layout

- Customer: mobile-first at roughly 390x844, robust at 320px, attractive at 1440px; clear product photographs,
  unambiguous weights and portions, bottom-reachable CTAs, light surfaces, generous spacing, strong hierarchy and
  succinct guidance.
- Vendor: desktop-first dashboard approximately 1440px with forest sidebar, clean KPI cards, orders queue and inventory
  attention; responsive mobile view with action cards, no clipped tables.
- Shape: rounded cards (~18px), controls (~14px), generous whitespace and subtle neutral borders; avoid excessive
  shadows and busy gradients.
- Buttons: primary forest with appropriately contrasting text; sage is secondary surface/accent, not default small-text
  color; terracotta sparingly for emphasis. Clear focus rings, disabled and loading states.
- Display estimated prices with `Rs` and explicit `/kg` or pack unit; distinguish quantity weight from package count.
  Use 44px or larger interactive touch targets where practicable.
- Image direction: high-quality photos of **raw** beef and chicken cuts on clean, tactile food-preparation surfaces with
  warm natural lighting. For this development iteration placeholders are acceptable; no claim that stock images show the
  real vendor's products. Do not show cooked food.
- Shared components worth extracting: brand lockup, button, inputs, cards, badges, loading skeletons, form error,
  quantity selector, packaging summary, order-progress steps. Keep business-specific pages within their respective apps.

## Reference precedence

1. `references/approved/Laviann-approved-visual-board.png` - most recent **approved** visual hierarchy and small
   monochrome meat accent. This is a raster *reference*, not a complete UI asset or exact product specification.
2. This `BRAND-AND-UX-SPEC.md` - precise branding, typography, and accessibility instructions.
3. `docs/PRD.md` and accepted ADRs in repository - behavior, payment, pricing, products, architecture and security. PRD
   wins over inaccurate placeholder text in any mockup.
4. `references/legacy-layouts/*.svg` - earlier editable *layout studies* to help fill screen-flow gaps. Their **old leaf
   logos, sample prices, dates, payment icons and any extra product categories are NOT authoritative**.

## Critical corrections to generated concept art

- Initial sellable categories are **Chicken** and **Beef**, with sample products specified in PRD. Do not add Pork, Lamb
  or other categories merely because a generated board displays them.
- Payment options: **cash on delivery, MCB Juice, bank transfer**, tracked/verified manually. No online card payment UI
  or payment gateway is implied by the visuals.
- Checkout CTA: **Submit order request**, not Place Order/Pay Now. After submission show **Pending Review**, not instant
  Confirmed or a fabricated paid receipt. A vendor-generated, current-version quotation must be approved before
  Confirmed/stock reservation.
- Product and delivery charges in image boards are not validated. Use PRD examples, clearly labeled demo data; ensure
  math is correct.
- Delivery dates must be offered by the vendor for the selected zone. No unconstrained date picker.
- Do not imply verified local sourcing or partnerships. The final merchant must substantiate those claims before public
  launch.

## Asset locations and behavior

Store canonical logo and icon SVGs in a sensible nested directory such as:
`packages/shared/assets/images/branding/`.
The existing `scripts/sync-brand-assets.mjs` copies the entire nested directory tree into each Next.js app's
`public/assets/images/`, overwrites same-name files, never watches, and runs through `predev`/`prebuild`. Preserve the
source tree and do not copy `.gitkeep` or delete unrelated destination content. Generated copies are not source files
and are Git-ignored.

## Acceptance checklist - visual phase

- [ ] Primary, inverted, and icon-only SVG logos all use one color per logo version; steak symbol is restrained and
  recognizable at small sizes.
- [ ] Exact approved tagline appears in brand lockups; no 'Fresh Meat. Your Way.' or leaf logos remain in new UI.
- [ ] Both apps render from shared color/typography tokens and Tailwind utilities; no duplicate color palettes.
- [ ] Customer mobile, customer desktop, vendor desktop, vendor mobile are visually coherent.
- [ ] No mockup content violates PRD: no extra meats, online card charge, instant purchase or incorrect totals.
- [ ] Contrast, keyboard navigation, focus states, mobile widths and loading/empty/error states are checked.
