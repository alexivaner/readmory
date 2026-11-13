"""Decode every MP4, verify delivery dimensions, and build an exact file manifest."""
from pathlib import Path
import subprocess,json,hashlib
root=Path(__file__).resolve().parents[1]
rows=[]
for file in sorted(root.rglob('*')):
 if not file.is_file() or file.name in ('asset-manifest.md','asset-inventory.json','.DS_Store'):continue
 rel=file.relative_to(root).as_posix();source='Editorial / repository implementation'
 purpose='Production instructions or regenerating source';usage='Read or regenerate locally'
 if rel.startswith(('screenshots/','portrait/','slides/','clips/')) or file.suffix=='.pptx':
  source='Selected cleaned owner library in real Readmory UI'
  purpose='Video visual';usage='Import into Slides/Vids after owner review'
 if 'synthetic' in rel:source='Repository synthetic saved-file fixture'
 if rel.startswith('slides/') or file.suffix=='.pptx':source='Editable editorial layout + selected real UI; slide 2 uses synthetic fixture'
 if rel=='portrait/end-card.png':source='Editorial typography and existing Readmory icon'
 if rel.startswith('captions/'):purpose='Proposed caption/narration timing';usage='Retime to recorded voice and final edit'
 props=''
 if file.suffix=='.mp4':
  probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(file)]))
  stream=next(s for s in probe['streams'] if s['codec_type']=='video')
  assert stream['codec_name']=='h264' and stream['pix_fmt']=='yuv420p'
  expected=(1080,1920) if '-portrait' in rel else (1920,1080)
  assert (stream['width'],stream['height'])==expected
  seconds=float(probe['format']['duration']);assert 5<=seconds<=28.1
  subprocess.run(['ffmpeg','-v','error','-i',str(file),'-f','null','-'],check=True,stdout=subprocess.DEVNULL)
  props=f'{expected[0]}×{expected[1]}, H.264, {seconds:.2f}s, silent'
 rows.append({'file':rel,'purpose':purpose,'source':source,'usage':usage,'properties':props,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
(root/'asset-inventory.json').write_text(json.dumps(rows,indent=2)+'\n')
intro='''# Asset manifest

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
'''
body='\n'.join(f"| `{r['file']}` | {r['purpose']}{'; '+r['properties'] if r['properties'] else ''} | {r['source']} | {r['usage']} |" for r in rows)
(root/'asset-manifest.md').write_text(intro+body+'\n')
print(f'Verified {sum(r["file"].endswith(".mp4") for r in rows)} MP4 clips; inventoried {len(rows)+2} files.')
