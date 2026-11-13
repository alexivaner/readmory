# Asset manifest

Generated 2026-11-06. The main footage uses Ivan’s cleaned Chrome library, exported through Readmory’s supported backup control and restored into fresh isolated Chrome contexts against a separate local production server. The private backup, raw WebM recordings, profile/storage and test screenshots are not part of this kit. Optional metadata lookup stayed disabled and external HTTP requests were blocked during real-library capture. No AI artwork or invented real-library statistics were used.

## Remaining manual steps and limits

- Review the selected covers, titles, reading history and single selected personal-note scene before public release. All real-data media and the PPTX are ignored by Git. No files have been committed or pushed.
- Record narration, choose licensed music if desired, assemble the supplied timeline and retime the SRT. No final edited video is included, as requested.
- Native Google Slides conversion was exercised and seven native Drive videos were added with actual Slides playback mode set to automatic. The revised 28-second library and 21-second knowledge clips were verified autoplaying their scrolling sequences in Chrome. The import clip uses the retained automatic mode. See the Git-ignored google-slides-autoplay.md for the private link. No Google Vids conversion or export was exercised. Recheck typography after conversion. The deck is rendered and structurally validated locally, with editable text and seven internally embedded MP4s on slides 2–8. Each video keeps a static poster image and automatic-start timing. Embedded clips match the standalone MP4 hashes. Desktop PowerPoint playback has not been tested. Slides/Vids conversion may keep only posters; upload the separate MP4s directly. UI text inside screenshots is raster content.
- Portrait captures use the actual responsive app at 540×960 CSS pixels. PNGs are 1080×1920. MP4s are upscaled from a 540×960 Playwright video stream to 1080×1920; they are readable at phone size but do not add native detail. Landscape recordings are native 1920×1080. A few controls scroll into view during interactions.
- Main landscape clips last 9–28 seconds; supplemental landscape and portrait clips last eight seconds. All MP4s are silent, independent H.264/yuv420p clips at 30fps. Fixture import clips carry a visible synthetic label. Corresponding stills use “synthetic” in their filenames; retain that disclosure in any edit.
- Source history is incomplete and can contain estimates or overlapping reader evidence. Keep the app’s ≈ / “at least” / unavailable labels visible. No exact lifetime reading or reread-count claims.
- Book covers and quoted passages retain their original rights. MIT applies to project code, not third-party artwork. No cover corpus is extracted or redistributed separately from selected UI imagery.
- Privacy review is visual sampling plus inspection of the selected static UI states, not a guarantee about every decoded frame. Owner review remains appropriate before publication. No expanded raw source identifiers, diagnostics or file-location panels were intentionally filmed.

## Verification

`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` passed. Unit/integration suite: 87 passed, one private-data case skipped. Browser suite: 28 passed, two conditional cases skipped (prefixed deployment and private hardware). Isolated profiles were used. Every generated MP4 was probed for dimensions/codec/duration and decoded end to end by FFmpeg. Nine slide previews were rendered and visually reviewed; the presentation package passed integrity/layout/import checks. Desktop PowerPoint playback remains untested. Native Google Slides was opened in Chrome.

The inventory below lists every kit file other than this manifest and its machine-readable twin `asset-inventory.json` (which holds SHA-256 hashes for the same list). Sources and intended uses are explicit per file. Source scripts and editorial documents are safe to review for source control; real-data visual files remain ignored.

| File | Purpose / technical properties | Data source | Recommended usage |
|---|---|---|---|
| `.gitignore` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `README.md` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `captions/linkedin.srt` | Proposed caption/narration timing | Editorial / repository implementation | Retime to recorded voice and final edit |
| `captions/linkedin.txt` | Proposed caption/narration timing | Editorial / repository implementation | Retime to recorded voice and final edit |
| `captions/short.srt` | Proposed caption/narration timing | Editorial / repository implementation | Retime to recorded voice and final edit |
| `captions/short.txt` | Proposed caption/narration timing | Editorial / repository implementation | Retime to recorded voice and final edit |
| `captions/silent.srt` | Proposed caption/narration timing | Editorial / repository implementation | Retime to recorded voice and final edit |
| `captions/silent.txt` | Proposed caption/narration timing | Editorial / repository implementation | Retime to recorded voice and final edit |
| `captions/youtube.srt` | Proposed caption/narration timing | Editorial / repository implementation | Retime to recorded voice and final edit |
| `captions/youtube.txt` | Proposed caption/narration timing | Editorial / repository implementation | Retime to recorded voice and final edit |
| `clips/01-overview-landscape.mp4` | Video visual; 1920×1080, H.264, 7.97s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/01-overview-portrait.mp4` | Video visual; 1080×1920, H.264, 7.97s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/02-library-landscape.mp4` | Video visual; 1920×1080, H.264, 27.97s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/02-library-portrait.mp4` | Video visual; 1080×1920, H.264, 7.97s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/03-statistics-landscape.mp4` | Video visual; 1920×1080, H.264, 8.97s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/03-statistics-portrait.mp4` | Video visual; 1080×1920, H.264, 8.00s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/04-rhythm-landscape.mp4` | Video visual; 1920×1080, H.264, 8.97s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/04-rhythm-portrait.mp4` | Video visual; 1080×1920, H.264, 7.97s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/05-knowledge-landscape.mp4` | Video visual; 1920×1080, H.264, 21.00s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/05-knowledge-portrait.mp4` | Video visual; 1080×1920, H.264, 8.00s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/06-notes-landscape.mp4` | Video visual; 1920×1080, H.264, 9.00s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/06-notes-portrait.mp4` | Video visual; 1080×1920, H.264, 7.97s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/07-book-details-landscape.mp4` | Video visual; 1920×1080, H.264, 8.00s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/07-book-details-portrait.mp4` | Video visual; 1080×1920, H.264, 7.97s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/08-privacy-backup-landscape.mp4` | Video visual; 1920×1080, H.264, 10.00s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/08-privacy-backup-portrait.mp4` | Video visual; 1080×1920, H.264, 8.00s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/09-share-card-landscape.mp4` | Video visual; 1920×1080, H.264, 7.97s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/09-share-card-portrait.mp4` | Video visual; 1080×1920, H.264, 8.00s, silent | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `clips/10-import-synthetic-landscape.mp4` | Video visual; 1920×1080, H.264, 19.97s, silent | Repository synthetic saved-file fixture | Import into Slides/Vids after owner review |
| `clips/10-import-synthetic-portrait.mp4` | Video visual; 1080×1920, H.264, 7.97s, silent | Repository synthetic saved-file fixture | Import into Slides/Vids after owner review |
| `creative-direction.md` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `feature-audit.md` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `google-slides-autoplay.md` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `google-vids-guide.md` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `narration.md` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `portrait/01-overview-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/01-overview.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/02-library-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/02-library.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/03-statistics-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/03-statistics.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/04-rhythm-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/04-rhythm.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/05-knowledge-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/05-knowledge.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/06-notes-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/06-notes.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/07-book-details-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/07-book-details.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/08-privacy-backup-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/08-privacy-backup.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/09-share-card-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/09-share-card.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `portrait/10-import-synthetic-detail.png` | Video visual | Repository synthetic saved-file fixture | Import into Slides/Vids after owner review |
| `portrait/10-import-synthetic.png` | Video visual | Repository synthetic saved-file fixture | Import into Slides/Vids after owner review |
| `portrait/end-card.png` | Video visual | Editorial typography and existing Readmory icon | Import into Slides/Vids after owner review |
| `portrait/reading-share-card.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `readmory-promo.pptx` | Video visual | Editable editorial layout + selected real UI; slide 2 uses synthetic fixture | Import into Slides/Vids after owner review |
| `screenshots/01-overview-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/01-overview.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/02-library-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/02-library-main-result.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/02-library-main-start.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/02-library.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/03-statistics-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/03-statistics-main-result.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/03-statistics-main-start.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/03-statistics.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/04-rhythm-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/04-rhythm-main-result.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/04-rhythm-main-start.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/04-rhythm.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/05-knowledge-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/05-knowledge-main-result.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/05-knowledge-main-start.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/05-knowledge.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/06-notes-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/06-notes-main-result.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/06-notes-main-start.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/06-notes.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/07-book-details-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/07-book-details.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/08-privacy-backup-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/08-privacy-backup-main-result.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/08-privacy-backup-main-start.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/08-privacy-backup.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/09-share-card-detail.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/09-share-card.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `screenshots/10-import-synthetic-detail.png` | Video visual | Repository synthetic saved-file fixture | Import into Slides/Vids after owner review |
| `screenshots/10-import-synthetic-main-result.png` | Video visual | Repository synthetic saved-file fixture | Import into Slides/Vids after owner review |
| `screenshots/10-import-synthetic-main-start.png` | Video visual | Repository synthetic saved-file fixture | Import into Slides/Vids after owner review |
| `screenshots/10-import-synthetic.png` | Video visual | Repository synthetic saved-file fixture | Import into Slides/Vids after owner review |
| `screenshots/reading-share-card.png` | Video visual | Selected cleaned owner library in real Readmory UI | Import into Slides/Vids after owner review |
| `scripts/build-deck.mjs` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `scripts/build-main-deck.mjs` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `scripts/capture-import.mjs` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `scripts/capture-main-demo.mjs` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `scripts/capture.mjs` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `scripts/embed-videos.py` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `scripts/extract-frames.mjs` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `scripts/main-demo-beats.json` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `scripts/main-demo-scenes.json` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `scripts/timelines.json` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `scripts/verify-assets.py` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `scripts/video-slide-map.json` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `scripts/write-copy.py` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `scripts/write-main-demo.py` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `short-video-storyboard.md` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
| `slides/slide-01.png` | Video visual | Editable editorial layout + selected real UI; slide 2 uses synthetic fixture | Import into Slides/Vids after owner review |
| `slides/slide-02.png` | Video visual | Editable editorial layout + selected real UI; slide 2 uses synthetic fixture | Import into Slides/Vids after owner review |
| `slides/slide-03.png` | Video visual | Editable editorial layout + selected real UI; slide 2 uses synthetic fixture | Import into Slides/Vids after owner review |
| `slides/slide-04.png` | Video visual | Editable editorial layout + selected real UI; slide 2 uses synthetic fixture | Import into Slides/Vids after owner review |
| `slides/slide-05.png` | Video visual | Editable editorial layout + selected real UI; slide 2 uses synthetic fixture | Import into Slides/Vids after owner review |
| `slides/slide-06.png` | Video visual | Editable editorial layout + selected real UI; slide 2 uses synthetic fixture | Import into Slides/Vids after owner review |
| `slides/slide-07.png` | Video visual | Editable editorial layout + selected real UI; slide 2 uses synthetic fixture | Import into Slides/Vids after owner review |
| `slides/slide-08.png` | Video visual | Editable editorial layout + selected real UI; slide 2 uses synthetic fixture | Import into Slides/Vids after owner review |
| `slides/slide-09.png` | Video visual | Editable editorial layout + selected real UI; slide 2 uses synthetic fixture | Import into Slides/Vids after owner review |
| `social-copy.md` | Production instructions or regenerating source | Editorial / repository implementation | Read or regenerate locally |
