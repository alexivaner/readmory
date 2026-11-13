# Readmory Hallmark redesign review

Date: 2026-11-13. Baseline: the user explicitly approved continuing from the
existing uncommitted UI work. The unrelated marketing folder was not edited.

## Result

Books lead the overview; measured statistics follow them. Forest navigation,
cream reading surfaces, title/author book fallbacks and unboxed quotations give
the app a consistent reading-oriented hierarchy. Original branding, cover
imports, routes, storage keys, source identifiers and handlers remain.

The independent finish reviewer returned `ship`, with no actionable visual
findings in the supplied desktop, mobile, empty and populated screenshots.

## Evidence

- Hallmark before: 87 automated Floor flags and 295 Reflex flags.
- Final static scan: one keyword false positive, zero Reflex, zero WARN;
  three Finish answers and five recorded label-warning dismissals.
- The false positive is `unlock` in the unchanged sentence:
  “Donations never unlock or restrict features.” This is a literal donation
  disclaimer, not a claim promising a benefit. The wording was preserved.
- Rendered preservation comparison: 19/19 links, 121/121 handlers and
  11/11 rendered headings retained. No route or component file was deleted.
- Typecheck, lint and production build passed.
- Unit tests: 87 passed; private-fixture case skipped.
- Root-path Playwright suite: 31 passed; subpath/private-hardware cases skipped.
- Final `/readmory` Playwright checks: 10 passed, including offline import,
  branding, guided import, menu keyboard behavior and filter recovery.
- Populated layout audit: 96 layouts, eight destinations at six widths
  (320, 390, 768, 1024, 1440, 1920) in both themes; no horizontal overflow
  or page errors.
- Measured contrast: body 13.39:1 in both themes; muted text 4.94:1 light
  and 8.88:1 dark; primary action text 9.47:1 light and 7.06:1 dark.
- Rendered comparison: `.hallmark/compare.html` (local, ignored by Git).

## Presentation copy changes

- Removed the redundant “Workspace” line above navigation.
- Removed “ONE BOOK, EVERY READER”; retained “Reader sources”.
- “FROM YOUR [SOURCE] RECORD” → “From your [source] record”.
- “OPEN LIBRARY · WORK-LEVEL METADATA” → “Open Library work-level metadata”.
- “YOUR NOTE” / “YOUR REFLECTION” → sentence case.
- Source names now use Kobo, KOReader or Kobalt brand spelling. The existing
  KOBALT BOOKMARK identifier remains intact for its integration contract.
- Archived annotation labels use a comma and sentence case.
- “About this project ↗” → “About this project”.
- Welcome labels “View on GitHub ↗”, “Open App →”, “Start guided import →”
  and “Support Readmory on Ko-fi ↗” lost their ornamental arrow suffixes.
- “Unlock your Kobo, reconnect …” → “Dismiss your Kobo’s lock screen,
  reconnect …”; the same troubleshooting instruction remains.
- “Title A–Z” → “Title A to Z”; sort values are unchanged.
- Reading-status captions, shelf source lists, snapshot dates and filtered-book
  totals use commas instead of middle-dot separators.
- “Duration unavailable · [n] annotation dates · [n] …” →
  “Duration unavailable; [n] annotation dates, [n] …”. Evidence stays distinct.
- Forward-arrow icons were removed from workspace/import action labels.
  External-link indicators and directional navigation retain their meaning.

Privacy, donation and consent disclosures retain their wording. No source book,
annotation, note or quotation was rewritten. Existing supported-source option
labels and diagnostic labels remain intact.

## Material

No stand-in photographs or replacement image slots were added. Existing brand
assets and imported book covers carry the design. Missing covers use a plain
book title and author; no fabricated artwork or external lookup was introduced.
A representative, approved screenshot of a larger synthetic library would be
the most useful additional material for future welcome-page work.

## Delivery

Local and uncommitted. No GitHub mutation or deployment was performed.
