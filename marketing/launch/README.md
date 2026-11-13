# Readmory launch production kit

For the latest supplied narration, open **`readmory-promo-script.pptx`**. See `script-follow-along.md` for the 3:10 scene timings and presenter instructions. The original 120-second version and native Google Slides deck below are separate earlier revisions.

Start with `google-vids-guide.md`, then import `readmory-promo.pptx` into Google Slides. All clips are independent, silent H.264 MP4 building blocks. This kit does not contain a final edited video.

- `feature-audit.md`: verified scope and claims
- `creative-direction.md`: brand and visual rules
- `short-video-storyboard.md`: 28-second portrait edit
- `narration.md` and `captions/`: four timed scripts and matching subtitle text
- `social-copy.md`: platform-specific launch text
- `screenshots/`, `portrait/`, `clips/`, `slides/`: selected local review media
- `asset-manifest.md`: source, usage, verification and manual handoff
- `scripts/`: repeatable recording, import demo, deck authoring and inventory tools

The main scenes use the owner’s cleaned Chrome library restored through the supported backup UI. The import scene uses the repository’s synthetic fixture and must be labeled accordingly. Personal databases, backups and profiles are outside this kit. Selected real-data media and the PPTX are ignored by Git pending owner review. No commits, pushes, account changes or production app edits are part of this work.

## Regenerate

Use the existing project dependencies, Node 24, system FFmpeg and installed Chrome. Playwright needs its official video helper (`pnpm exec playwright install ffmpeg`). Build the app with `pnpm build`. Start a separate server with `PORT=4317 pnpm start`, leaving existing servers untouched.

```sh
PRIVATE_BACKUP=/absolute/path/outside/repository/cleaned-backup.json \
  node marketing/launch/scripts/capture.mjs
node marketing/launch/scripts/capture-import.mjs
```

Use only a cleaned backup, keep optional enrichment disabled, and review every new frame before publication. The scripts restore into fresh isolated contexts. They do not connect to your everyday Chrome profile. Raw recording workspaces remain under OS temporary storage. Never add those to Git. See the script header for dependencies and the deck script for bundled runtime setup.

After capture, run `node marketing/launch/scripts/extract-frames.mjs` to extract the 5-second interaction stills. The editable deck uses the bundled `@oai/artifact-tool` and `sharp`, without adding dependencies to this application. Obtain runtime locations with Codex’s `load_workspace_dependencies`, then run:

```sh
ARTIFACT_NODE_MODULES=/path/to/bundled/node_modules \
PRESENTATIONS_SKILL_DIR=/path/to/presentations/skill \
RUNTIME_PYTHON=/path/to/bundled/python3 \
  /path/to/bundled/node marketing/launch/scripts/build-main-deck.mjs
python3 marketing/launch/scripts/verify-assets.py
```

The finalizer intentionally does not overwrite an existing final file. For a new revision set `DECK_FILENAME=readmory-promo-review.pptx`, validate/review it, then replace the delivery filename with that reviewed file. Move superseded versions outside the kit before generating the manifest. Nine landscape slide PNGs and the portrait end card are also rendered by the deck script. Fonts chosen for this deck are Georgia and Arial. If a destination lacks Georgia, select its closest editorial serif and check the line breaks.

Editorial copy can be regenerated with `python3 marketing/launch/scripts/write-copy.py`. This overwrites narration/caption files from its approved text source; preserve any later voice-timing edits first. The manifest tool checks every MP4 by decoding it end to end and records file hashes. It requires FFmpeg/FFprobe.

## 120-second main demonstration

The nine-slide `readmory-promo.pptx` contains seven internally embedded MP4s on slides 2–8, with automatic-start timing and poster frames. Desktop PowerPoint playback has not been exercised. The existing native Google Slides deck uses native Drive video objects; its private link is in `google-slides-autoplay.md`. Slides playback starts videos on entering their slides in slideshow mode, not merely when opening the editor. Slide advancement and narration are separate production steps.

Kobo import comes first: USB storage instructions, source-file selection, preview, save, then a populated shelf. This 20-second saved-file demonstration uses a labeled synthetic fixture. The library clip lasts 28 seconds and the knowledge clip lasts 21 seconds; the remaining main clips last 9–10 seconds and show actual action/results from the cleaned owner library. The original portrait footage remains available for the 28-second social version.

To regenerate the main clips, set PRIVATE_BACKUP to a cleaned backup outside this repository and run `node marketing/launch/scripts/capture-main-demo.mjs`. Run `python3 marketing/launch/scripts/write-main-demo.py` after any older copy generator to restore the authoritative 120-second main script. Build the layout with `build-main-deck.mjs`, then embed:

```sh
READMORY_MAIN_DEMO=1 python3 marketing/launch/scripts/embed-videos.py INPUT.pptx OUTPUT.pptx
```

Validate the exact resulting package with the presentation skill finalizer before replacing the delivery file. `scripts/video-slide-map.json` records slide IDs, durations and media hashes. Slides-to-Vids conversion excludes native video: upload the separate MP4s directly when assembling a Vid. No finished edited video or recorded narration is included.
