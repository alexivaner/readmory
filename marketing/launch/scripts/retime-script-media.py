"""Restore native video objects after editable layout export and retime existing clips.

Run after revise-script-deck.mjs. Keeps source PPTX and original clips unchanged.
Intermediate files remain private. The finalizer must validate candidate.pptx.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.etree import ElementTree as E
import copy, json, subprocess, posixpath, hashlib
root=Path(__file__).resolve().parents[1]
work=root.parents[1]/'.private/launch/script-revision'
P='http://schemas.openxmlformats.org/presentationml/2006/main'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
REL='http://schemas.openxmlformats.org/package/2006/relationships'
CT='http://schemas.openxmlformats.org/package/2006/content-types'
for prefix,uri in [('p',P),('a',A),('r',R),('p14','http://schemas.microsoft.com/office/powerpoint/2010/main')]:E.register_namespace(prefix,uri)
def q(ns,n):return '{'+ns+'}'+n
def xml(el):return E.tostring(el,encoding='utf-8',xml_declaration=True)
with ZipFile(root/'readmory-promo.pptx') as z:original={n:z.read(n) for n in z.namelist()}
with ZipFile(work/'edited-layout.pptx') as z:parts={n:z.read(n) for n in z.namelist()}
scenes=json.loads((work/'timing.json').read_text());media_map=[]
for i,scene in enumerate(scenes,1):
 slidepath=f'ppt/slides/slide{i}.xml';relpath=f'ppt/slides/_rels/slide{i}.xml.rels'
 slide=E.fromstring(parts[slidepath]);source=E.fromstring(original[slidepath])
 # Set actual slide advance timing, retaining manual click navigation.
 for old in list(slide.findall(q(P,'transition'))):slide.remove(old)
 transition=E.Element(q(P,'transition'),{'advClick':'1','advTm':str(scene['duration']*1000)})
 insert=next((j for j,e in enumerate(slide) if e.tag in [q(P,'timing'),q(P,'extLst')]),len(slide))
 slide.insert(insert,transition)
 if 2<=i<=8:
  source_pic=source.find('.//'+q(P,'pic'));pic=slide.find('.//'+q(P,'pic'))
  assert source_pic is not None and pic is not None
  source_nv=source_pic.find(q(P,'nvPicPr'));nv=pic.find(q(P,'nvPicPr'))
  old_id=source_nv.find(q(P,'cNvPr')).get('id');new_id=nv.find(q(P,'cNvPr')).get('id')
  replacement=copy.deepcopy(source_nv);replacement.find(q(P,'cNvPr')).set('id',new_id)
  pic.remove(nv);pic.insert(0,replacement)
  for old in list(slide.findall(q(P,'timing'))):slide.remove(old)
  timing=copy.deepcopy(source.find(q(P,'timing')))
  for target in timing.findall('.//'+q(P,'spTgt')):
   if target.get('spid')==old_id:target.set('spid',new_id)
  slide.append(timing)
  rels=E.fromstring(parts[relpath]);source_rels=E.fromstring(original[relpath])
  video_rels=[r for r in source_rels if r.get('Type').endswith('/video') or r.get('Type').endswith('/media')]
  assert len(video_rels)==2
  source_media=posixpath.normpath('ppt/slides/'+video_rels[0].get('Target'))
  clip_source=work/('source-'+Path(source_media).name);clip_source.write_bytes(original[source_media])
  clip=work/('script-'+Path(source_media).name)
  probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-of','json',str(clip_source)]))
  seconds=float(probe['format']['duration']);duration=scene['duration']-0.5
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(clip_source),'-an','-vf',f'setpts={(duration/seconds):.9f}*(PTS-STARTPTS),fps=30,tpad=stop_mode=clone:stop_duration=1','-t',str(duration),'-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(clip)],check=True)
  # Decode the exact retimed media before embedding.
  subprocess.run(['ffmpeg','-v','error','-i',str(clip),'-f','null','-'],check=True)
  target_media='ppt/media/'+clip.name;parts[target_media]=clip.read_bytes()
  for rel in video_rels:
   assert not any(r.get('Id')==rel.get('Id') for r in rels)
   rel=copy.deepcopy(rel);rel.set('Target','../media/'+clip.name);rels.append(rel)
  parts[relpath]=xml(rels)
  media_map.append({'slide':i,'duration':duration,'sha256':hashlib.sha256(parts[target_media]).hexdigest(),'part':target_media})
 parts[slidepath]=xml(slide)
content=E.fromstring(parts['[Content_Types].xml'])
if not any(e.get('Extension')=='mp4' for e in content):E.SubElement(content,q(CT,'Default'),{'Extension':'mp4','ContentType':'video/mp4'})
E.register_namespace('',CT)
parts['[Content_Types].xml']=xml(content)
if 'ppt/presProps.xml' in parts:
 props=E.fromstring(parts['ppt/presProps.xml']);show=props.find(q(P,'showPr'))
 if show is None:show=E.SubElement(props,q(P,'showPr'))
 show.set('useTimings','1');parts['ppt/presProps.xml']=xml(props)
with ZipFile(work/'candidate.pptx','w',ZIP_DEFLATED) as z:
 for n,b in parts.items():z.writestr(n,b)
(work/'media-validation.json').write_text(json.dumps(media_map,indent=2)+'\n')
print(f'Restored and decoded {len(media_map)} retimed native MP4s; slide timings total {sum(s["duration"] for s in scenes)}s.')
