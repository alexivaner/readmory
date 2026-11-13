# Script-following PowerPoint revision

Open `readmory-promo-script.pptx` for the new supplied narration. The original `readmory-promo.pptx`, original clips, and existing native Google Slides deck remain unchanged.

The nine-slide revision contains the supplied script verbatim in speaker notes, seven internally embedded retimed videos, and automatic slide-advance targets totaling **3 minutes 10 seconds**. Narration audio is not included. Use Presenter View to read the notes. Timings are a rehearsal starting point; disable “Use Timings” for manual advancement or rehearse timings after recording. Video start and slide advance are encoded in the PPTX but have not been exercised in desktop PowerPoint. Importing to Google Slides may lose embedded video or timing.

The retained library footage does not demonstrate writing a new reflection. Personal Notes uses a book-title search. The import uses synthetic files. Reading history can contain estimates, and optional cover lookup sends book identifiers only after opt-in. These details are also in the relevant speaker notes.

| Slide | Scene | Start | Duration |
|---|---|---|---|
| 1 | What stays after the last page? | 0:00 | 23s |
| 2 | Your Kobo library, ready to explore | 0:23 | 26s |
| 3 | My Library | 0:49 | 38s |
| 4 | Statistics | 1:27 | 16s |
| 5 | Reading Rhythm | 1:43 | 17s |
| 6 | Knowledge Library | 2:00 | 25s |
| 7 | Personal Notes | 2:25 | 16s |
| 8 | Private by design | 2:41 | 21s |
| 9 | Readmory | 3:02 | 8s |

## Regenerate

Set `ARTIFACT_NODE_MODULES` to the bundled runtime dependency directory, then run the bundled Node executable with `marketing/launch/scripts/revise-script-deck.mjs`, followed by `python3 marketing/launch/scripts/retime-script-media.py`. Validate `.private/launch/script-revision/candidate.pptx` with the presentation skill finalizer to a fresh output filename before delivery. The original deck is the input. Source narration and durations are in `scripts/script-narration.json`. Retimed intermediate media stays under `.private`.
