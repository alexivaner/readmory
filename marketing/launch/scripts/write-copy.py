"""Generate timed production copy. No private data is read."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
tracks={
'youtube':[
(0,7,'What happens to the books you finish, and the ideas you underline? I wanted a better way to come back to mine.'),
(7,14,'Hi, I’m Ivan. I built Readmory, a local-first reading workspace. Your reading, remembered.'),
(14,22,'This is my actual library. I can browse the covers, filter by reader, or find a book and pick up its details.'),
(22,30,'Statistics let me look at a year or a month, and see which books I spent time with, using the history my readers recorded.'),
(30,38,'The reading calendar brings that history together. I can open a day and see the books behind it. Estimates stay clearly labeled.'),
(38,46,'And the ideas don’t have to disappear into a device. I can search my highlights across books and return to the original context.'),
(46,53,'My own notes have their own view, too. Favorites and topics help me keep useful passages close.'),
(53,59,'There’s even a reading recap I can save as an image, with the choice to include book covers.'),
(59,65,'Connect by USB, choose the folder, review, and save. Here I’m using saved demo files.'),
(65,72,'Kobo, KOReader and Kobalt imports stay in your browser. No account. Optional cover lookup shares book metadata only when enabled. Keep backups.'),
(72,78,'Readmory is open source and in public beta. Try it, and tell me what you’d like to remember from your reading.')],
'short':[
(0,3,'Your Kobo remembers more than you think.'),
(3,7,'I built Readmory to bring my reading together.'),
(7,11,'My books. The time I spend with them.'),
(11,15,'A calendar of my reading days.'),
(15,20,'And highlights I can actually find again.'),
(20,24,'Local-first, with no account. Keep a backup.'),
(24,28,'Readmory. Your reading, remembered. Try the public beta.')],
'linkedin':[
(0,7,'I built Readmory because I wanted to come back to more than a list of books I’d read.'),
(7,15,'It brings Kobo, KOReader and Kobalt reading records into one local workspace. This is my own cleaned library in the app.'),
(15,23,'I can explore recorded reading time, open a day in the calendar, and see the source behind the history. Estimates stay labeled.'),
(23,31,'Search brings old highlights back into reach. Personal notes stay separate from the quoted passage, so my own thoughts are easier to revisit.'),
(31,39,'The core works without an account. Reading data stays in the browser, and portable backups help protect it. Cover lookup is optional.'),
(39,46,'It’s an independent, open-source public beta. If you use a Kobo or one of these readers, I’d love your feedback.')],
'silent':[
(0,4,'What stayed with you after the last page?'),
(4,9,'Readmory\nYour reading, remembered.'),
(9,14,'Your library, with the covers you know'),
(14,19,'Recorded reading time and active days'),
(19,24,'A calendar with the books behind each day'),
(24,29,'Search the ideas you kept'),
(29,34,'Local-first. No account. Back up regularly.'),
(34,40,'Open-source public beta\nalexivaner.github.io/readmory/')]
}
def stamp(sec):
 return f'{sec//3600:02}:{sec%3600//60:02}:{sec%60:02},000'
parts=['# Narration and on-screen captions\n\nTiming is an editorial target, not measured voiceover. Record naturally, then retime captions to the final voice. SRTs contain proposed wording and complete cue intervals. All UI clips are silent. Do not present the silent track as spoken narration.\n']
for name,cues in tracks.items():
 parts.append(f'## {name.title()} — {cues[-1][1]} seconds\n')
 for i,(start,end,text) in enumerate(cues):
  parts.append(f'**{start:02}–{end:02}s** {text}\n')
 (root/'captions'/f'{name}.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(a)} --> {stamp(b)}\n{t}' for i,(a,b,t) in enumerate(cues))+'\n')
 (root/'captions'/f'{name}.txt').write_text('\n'.join(t for a,b,t in cues)+'\n')
parts.append('## Landscape overlays\n\nUse short editable overlays rather than duplicating every spoken sentence: “Your reading, remembered.” / “Your books, together” / “Recorded history, clearly labeled” / “Every reading day has a story” / “Find the idea again” / “Your own words” / “A recap you can share” / “Choose files. Review. Save.” / “Local-first. Back up regularly.” / “Public beta · Open source”.\n\nThe short storyboard supplies portrait overlays. Subtitle text should wrap into two short lines in the editor. SRT import support varies: if unavailable, use it as a timing reference for native caption text. These files are editorial companions, not evidence that a finished voice or video exists.\n')
(root/'narration.md').write_text('\n'.join(parts))
(root/'scripts'/'timelines.json').write_text(json.dumps(tracks,ensure_ascii=False,indent=2)+'\n')

# Apply the authoritative main narrative after regenerating the supplemental tracks.
import runpy
runpy.run_path(str(root/"scripts"/"write-main-demo.py"))
