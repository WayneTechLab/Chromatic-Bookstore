# 12 Brand And Token Standard

Use this file when a project moves beyond the neutral template into a branded
implementation.

## Template Default

The default Web Stack Generation template still starts neutral, but projects may
now layer a branded storefront system on top of the base app. When that happens,
keep the operator docs aligned and document the project-specific palette,
typography, and imagery choices in the generated app files.

## Brand Inputs

Before branding, collect:

- Brand name.
- Legal entity name.
- Tagline or offer.
- Primary audience.
- Tone words.
- Logo files.
- Primary colors.
- Secondary colors.
- Font requirements.
- Image style.
- Icon style.
- Competitors or references.
- Accessibility constraints.

## Token Categories

Define tokens for:

- Color.
- Typography.
- Spacing.
- Radius.
- Shadow.
- Border.
- Motion.
- Z-index/layers.
- Breakpoints.

## Rules

- Do not bake one project brand into the reusable template.
- Store project-specific brand values in project docs or generated app files.
- If a project adopts a branded visual system like Chromatic Bookstore, mirror
  the palette and layout notes in the repo root app, metadata, and `.SYSTEMX`
  handoff docs.
- Keep token names semantic where possible: `surface`, `text`, `accent`,
  `danger`, `success`, `warning`.
- Document contrast-sensitive combinations.
- Update screenshots and media guidance after branding.
