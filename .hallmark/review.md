# Readmory design audit and polish

Date: 2026-11-13. Baseline: the existing Antigravity working-tree changes,
retained under the user's instruction to audit, finish, sync and deploy.

## Result

The book-first workspace and forest/cream system work well. A full redesign
would add churn without improving the reading task. Retained the app shell,
all routes, storage identifiers, source labels, backup behavior and handlers.

Centralized nine stray color usages, aligned control/panel corner tokens with
design.md, removed positive tracking on labels, used the body face for count
badges, and replaced opacity-only primary hover styling with a theme-aware fill.
The paper fallback cover now uses theme ink so its title stays readable in dark
mode; the previous fixed forest foreground failed contrast on the dark paper.
Measured fallback contrast is 14.49:1 light and 13.51:1 dark. All required
checks and five affected browser regressions passed after this correction.

The welcome preview is now an actual app capture made in an isolated browser
using only fixtures/generated/KoboReader.sqlite. Its caption identifies synthetic
example data. This replaces a manually composed shelf with inconsistent reading
percentages and a sample quote/date. The original brand icon remains available.
The welcome meta line uses sentences instead of a middle-dot separator.
Privacy, donation and consent disclosures retain their exact wording.

## Hallmark verification

- Baseline: 16 Floor flags, one Reflex flag.
- Final static and rendered comparison: zero FAIL, zero REFLEX, zero WARN.
- Eight recorded warning dismissals, one answered Finish finding. The unchanged
  donation disclaimer contains “unlock”; verbatim copy is recorded in the stamp.
- Retained 18/18 links, 121/121 handlers and 9/9 headings. The removed sample
  date and illustrative image are recorded in the CSS stamp.
- Captures: 1280, 1440, 1920 desktop widths and 375 mobile width.
- Independent finish review: two findings, both resolved on recapture: excess
  screenshot space and mobile legibility. Baseline had more legible sample
  book labels; the tighter actual-app capture restores that strength.
- Comparison: .hallmark/compare.html (local and ignored).

## Project checks

Typecheck, lint, unit tests (87 passed, one private-fixture case skipped), and
production build passed. Root Playwright: 31 passed, two expected skips
(subpath-only test and private real-device fixture). Production /readmory build
and ten subpath regressions also passed, including offline import and branding.

## Public assets

Existing launch recordings, screenshots, decks and private document links remain
ignored and local. Included launch text/scripts and the separate synthetic-only
introduction kit. The intro kit's source explicitly imports authored fixtures in
an isolated context and blocks external requests. No real Kobo database, book,
annotation, backup or screenshot is staged.

No stock pictures or replacement image slots were added. Future shelf changes
should regenerate the synthetic example capture.

## Knowledge library separation redesign

User correction: the unboxed two-column feed felt overwhelming.
Recomposed only Knowledge library as a single column capped at 1040px, with
paper entries, borders and 24px gaps. Source metadata, book references and
topic actions remain secondary to the passage. Long highlights show a five-line
preview and native disclosure; full original text remains available without
scripting. Book detail and overview passages remain fully expanded.

Search has its own row, with filters below. Control borders meet the rendered
contrast check. All existing 14 static links and 121 handlers remain.

Copy: “From a passing thought to a lasting connection” becomes “Highlights and
notes from your books.” (gate 69: replace figurative boilerplate with the task).
No reading text, source identifier, storage key or disclosure was rewritten.

Hallmark final: zero FAIL, zero REFLEX, zero WARN. The independent review
returned ship after mobile screenshots were retaken after navigation settled.
Baseline showed full passages immediately and fit more entries side by side;
the redesign exchanges this density for focused reading and distinct boundaries.
No photo slots or new external material were introduced. All capture data comes
from authored synthetic SQLite fixtures; the user's screenshot stays private.

New browser regression verifies independent expansion with the keyboard, intact
favorite/topic actions and dark mobile layout.

Validation for this revision: typecheck, lint, unit tests (87 passed, one private
fixture skipped), root production build and /readmory production build passed.
Root browser suite: 32 passed, two expected skips. Production-path regressions:
seven passed, including SQLite/offline import and the new long-highlight case.
