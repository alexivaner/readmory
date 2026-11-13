# Design: Readmory

A reading workspace built around books and the reader’s own words.
The existing Readmory logo and forest/sage palette are the brand.

## System

- Genre: editorial, adapted to an app screen.
- Shape: reading shelf in the existing navigation shell.
- Theme: Readmory brand, retained from the project’s declared tokens.
- Surface: cream reading area and forest navigation rail.
- Dark mode: existing `data-theme` attribute and `kobo-theme` preference.
- Signature: books lead the overview; measured statistics support them.

## Tokens

[apps/web/app/tokens.css](apps/web/app/tokens.css) owns colors, fonts,
spacing, timing and theme overrides. Reuse existing semantic token names.
[apps/web/app/base.css](apps/web/app/base.css) holds shared foundations.
[apps/web/app/globals.css](apps/web/app/globals.css) holds component layouts.

- Body, controls and data: system sans, 16px base.
- Page titles, quotations and book fallbacks: Georgia.
- Functional labels: sentence case, no tracking; source identifiers stay intact.
- Colors: original forest `#1b2b22`, deep green `#2f4a3c`, sage `#a9cc8a`,
  cream `#f7f3e9`; all component styles reference tokens.
- Spacing: four-pixel scale, with the existing responsive shell preserved.
- Shapes: 4px controls/panels; 2px book cover corners.
- Depth: borders or space; no glow or ornamental artwork in book fallbacks.
- Figures: tabular numerals. Never fabricate a source total or reading interval.

## Controls

Primary actions use the existing green fill and contrasting theme text.
Secondary actions use text or a fine outline. Hit targets remain 44px or larger.
Native selects, inputs, disclosure controls and existing focus management stay.
Disabled controls change fill, text and cursor; focus rings appear immediately.

## Motion

Still by default. Only brief state feedback and the mobile navigation transition.
Reduced motion disables transitions and animation. No decorative entrance effect.

## Preservation

Routes, navigation labels, field names, action handlers, backup behavior, source
identifiers and browser storage keys are product contracts, not design variables.
Keep consent, privacy and donation disclaimers verbatim.

## Welcome preview

Show an actual capture of the app populated only from the synthetic fixture.
Label the example visibly. Do not compose imitation app cards, invent reading
percentages, or present sample annotations as endorsements. Regenerate the
preview when the reading shelf changes. Shared panels and controls use 4px
corners; book covers retain 2px corners.

## Knowledge library

Use two columns on wide screens, capped at 1040px, and one below 1000px.
Each entry has a paper surface, a fine border and 24px separation. This is a
reading object, not an unbounded editorial grid. Keep text near 64 characters
per line. Passages lead; source, book references, dates and topic actions use
smaller sans type. Long highlights use a five-line preview with a native
disclosure that reveals the complete original text, including without scripting.
Search occupies its own row; filters sit below it. Preserve all favorite, topic,
book and location actions. Apply the same bordered surfaces, spacing and long-
highlight disclosures to the annotations inside each book. Keep book annotations
in one column beside the reflection panel so the reading measure stays usable.

## Shared content rules

Book links and other text actions wrap by default. Never use `nowrap` on
user-provided titles or hide overflow to mask a layout error. Keep icons fixed
and let the title shrink and wrap, including unbroken identifiers. Topic pills
wrap and selects stay within their toolbar.

All annotation, note and reflection entries share a paper surface, fine border,
4px corners and interior padding. Personal notes uses the same capped width,
two-column desktop grid, single-column mobile grid and search/filter hierarchy
as Knowledge library. Notes and reflections retain their original words.
