# Editing the archived Laviann SVG concepts in Figma

These are **early design references**, retained after the P0 implementation. They
are not current application screenshots or a request to replace the working UI.
Use [the current design guide](README.md), shared source and
[verified application screenshots](../verification.md#responsive-accessibility-and-visual-evidence)
when extending the app. No Figma file is synchronized automatically with this repository.

## Optional reference workflow

1. In a Figma Design file where your account has edit access, import an SVG from
   `figma-import/`. The folder contains eight UI concepts and one palette board.
2. Arrange references by customer/vendor flow and label them as archived concepts.
3. Inspect the imported layers. SVG artwork does not automatically supply reusable
   components, Auto Layout, constraints or a working prototype; text may be vector outlines.
4. For new work, rebuild the necessary native layout/components using the implemented
   brand: Big Shoulders/Inter, the small monochrome steak wordmark and the exact tagline.
5. Take current color values from `packages/shared/src/theme/colors.ts`, not the
   historical `tokens.json`. Document intended changes before porting them back to code.

The accompanying `previews/` PNGs are previews of the old SVGs. Their logo treatments,
mock values and labels may differ from the completed app. They should not be used as
current acceptance evidence. Figma account capabilities and plan terms are outside
this repository's setup instructions.
