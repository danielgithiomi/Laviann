# Laviann - Visual Identity Exploration, Concept A

**Status:** Exploratory, v0.1. These are not approved production brand guidelines.

## Concept name: Modern Fresh Market

Laviann is a single-vendor raw-meat ordering platform. The intended brand feeling is
**fresh, trustworthy, confident and approachable**, with a touch of premium quality.
The palette extends the deep green used in the v1.0 PRD presentation into customer
commerce and vendor administration. It is intentionally *not* a restaurant palette.

### Proposed colors

| Token | Hex | Usage |
|---|---|---|
| Brand / Deep Forest | `#12382F` | Logo, primary CTA, navigation |
| Brand / Green | `#17483B` | Hero and selected accents |
| Brand / Sage | `#AFC799` | Accent, selection, supporting panels |
| Brand / Sage Pale | `#EBF1E8` | Tinted panels and subtle states |
| Canvas / Ivory | `#F4F7F3` | Backgrounds |
| Text / Dark | `#263D35` | Body copy and headings |
| Text / Muted | `#687A73` | Secondary copy, metadata |
| Outline / Light | `#DCE5DE` | Hairlines and input borders |
| Accent / Terracotta | `#C76B50` | Selective emphasis, low-stock warning |
| Surface / White | `#FFFFFF` | Cards and form surfaces |

**Accessibility:** Validate every text/background combination with a contrast checker
when translating concepts into code. Muted-text usage at small sizes may need darker
tones to reach WCAG AA, and selected states must also include labels or icons.

### Typography (proposals)

- **Inter:** UI controls, navigation, forms, tables, prices.
- **Manrope:** Editorial/marketing headings and product storytelling, subject to visual review.
- For first screens, use Inter throughout when consistency is more valuable than font pairing.
- Do not ship font files in the design pack; use properly licensed sources when building the application.

### Shape and layout

- Corners: 12-20 px on cards; 14-16 px on touch controls; pill badges for statuses.
- Comfortable white space, few heavy dividers.
- Customer content: 16px mobile edge margins, prominent product information.
- Vendor content: compact but breathable tables and status surfaces.
- Primary actions: dark green on light backgrounds or sage on dark backgrounds.
- Price, weight, packaging count and vendor-selected date are visually primary.

### Photography direction (future)

The current vectors are illustrative placeholders, **not real meat product images**.
For the real brand use photographs of the vendor's actual inventory on uncluttered,
neutral backgrounds. Show raw, safely handled cuts only. The UI should not imply
processed or cooked products.

### Logo status

The concept `laviann.` wordmark and circular L symbol are temporary; no final logo
has been commissioned, selected or approved. They are safe to modify in Figma.

### Figma handoff

Use `docs/design/figma-import/*.svg`; see `docs/design/FIGMA-IMPORT.md`. Imported SVG
artwork is editable as vector content, but it is **not** a native `.fig` file and
does not automatically create Figma auto-layout, reusable components or prototypes.
