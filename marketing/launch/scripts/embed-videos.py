"""Embed reviewed local MP4s into the artifact-tool-authored slide layout.

Usage: python3 marketing/launch/scripts/embed-videos.py INPUT.pptx OUTPUT.pptx
Uses native PresentationML media parts with poster images and click-to-play timing.
No python-pptx, private backup or external video links are used.
Reference: https://learn.microsoft.com/en-us/office/open-xml/presentation/how-to-add-a-video-to-a-slide-in-a-presentation
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.etree import ElementTree as E
import sys, hashlib, posixpath, json, os
P='http://schemas.openxmlformats.org/presentationml/2006/main'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
P14='http://schemas.microsoft.com/office/powerpoint/2010/main'
REL='http://schemas.openxmlformats.org/package/2006/relationships'
CT='http://schemas.openxmlformats.org/package/2006/content-types'
for prefix,uri in [('p',P),('a',A),('r',R),('p14',P14)]:E.register_namespace(prefix,uri)
def q(ns,name):return '{'+ns+'}'+name
def sub(el,ns,name,attrs=None):return E.SubElement(el,q(ns,name),attrs or {})
def xml(el):return E.tostring(el,encoding='utf-8',xml_declaration=True)
source,dest=map(Path,sys.argv[1:]);root=Path(__file__).resolve().parents[1]
ids=['01-overview','02-library','03-statistics','04-rhythm','05-knowledge','06-notes','07-book-details','09-share-card','10-import-synthetic','08-privacy-backup']
main=os.environ.get('READMORY_MAIN_DEMO')=='1'
scenes=json.loads((root/'scripts'/'main-demo-scenes.json').read_text()) if main else []
if main:ids=[s['id'] for s in scenes if s['clip']]
durations={s['id']:s['end']-s['start'] for s in scenes}
with ZipFile(source) as z:parts={n:z.read(n) for n in z.namelist()}
manifest=[]
for slide_num,scene in enumerate(ids,2):
 slide_path=f'ppt/slides/slide{slide_num}.xml';rel_path=f'ppt/slides/_rels/slide{slide_num}.xml.rels'
 slide=E.fromstring(parts[slide_path]);rels=E.fromstring(parts[rel_path])
 pics=slide.findall('.//'+q(P,'pic'));assert len(pics)==1
 pic=pics[0];nv=pic.find(q(P,'nvPicPr'));prop=nv.find(q(P,'cNvPr'));shape_id=prop.get('id')
 prop.set('name',scene+' video');prop.set('descr','Click to play the actual Readmory interaction. '+('Synthetic saved-file import demo.' if 'synthetic' in scene else 'Cleaned owner library.'))
 sub(prop,A,'hlinkClick',{'action':'ppaction://media'})
 nvpr=nv.find(q(P,'nvPr'))
 if nvpr is None:nvpr=sub(nv,P,'nvPr')
 video_rid='rIdReadmoryVideo';media_rid='rIdReadmoryMedia'
 sub(nvpr,A,'videoFile',{q(R,'link'):video_rid})
 extensions=nvpr.find(q(P,'extLst'))
 if extensions is None:extensions=sub(nvpr,P,'extLst')
 ext=sub(extensions,P,'ext',{'uri':'{DAA4B4D4-6D71-4841-9C94-3DE7FCFB9230}'})
 sub(ext,P14,'media',{q(R,'embed'):media_rid})
 filename=scene+'-landscape.mp4';target='../media/'+filename
 sub(rels,REL,'Relationship',{'Id':video_rid,'Type':R+'/video','Target':target})
 sub(rels,REL,'Relationship',{'Id':media_rid,'Type':'http://schemas.microsoft.com/office/2007/relationships/media','Target':target})
 clip=(root/'clips'/filename).read_bytes();parts['ppt/media/'+filename]=clip
 timing=sub(slide,P,'timing');tn=sub(timing,P,'tnLst');par=sub(tn,P,'par');ctn=sub(par,P,'cTn',{'id':'1','dur':'indefinite','restart':'never','nodeType':'tmRoot'})
 children=sub(ctn,P,'childTnLst');video=sub(children,P,'video');media=sub(video,P,'cMediaNode',{'vol':'80000'})
 child=sub(media,P,'cTn',{'id':'2','fill':'hold','display':'0'});conds=sub(child,P,'stCondLst');sub(conds,P,'cond',{'delay':'0' if main else 'indefinite'})
 tgt=sub(media,P,'tgtEl');sub(tgt,P,'spTgt',{'spid':shape_id})
 parts[slide_path]=xml(slide);parts[rel_path]=xml(rels)
 manifest.append({'slide':slide_num,'clip':'clips/'+filename,'embedded_sha256':hashlib.sha256(clip).hexdigest(),'playback':'automatic' if main else 'click-to-play','duration_seconds':durations.get(scene,8)})
content=E.fromstring(parts['[Content_Types].xml'])
if not any(el.get('Extension')=='mp4' for el in content):sub(content,CT,'Default',{'Extension':'mp4','ContentType':'video/mp4'})
E.register_namespace('',CT)
parts['[Content_Types].xml']=xml(content)
with ZipFile(dest,'w',ZIP_DEFLATED) as z:
 for n,b in parts.items():z.writestr(n,b)
with ZipFile(dest) as z:
 assert z.testzip() is None
 for item in manifest:
  filename=Path(item['clip']).name
  assert hashlib.sha256(z.read('ppt/media/'+filename)).hexdigest()==item['embedded_sha256']
  n=item['slide'];rels=E.fromstring(z.read(f'ppt/slides/_rels/slide{n}.xml.rels'))
  for r in rels:
   if r.get('TargetMode')!='External':assert (r.get('Target').lstrip('/') if r.get('Target').startswith('/') else posixpath.normpath('ppt/slides/'+r.get('Target'))) in z.namelist()
  slide=E.fromstring(z.read(f'ppt/slides/slide{n}.xml'))
  assert len(slide.findall('.//'+q(A,'videoFile')))==1 and len(slide.findall('.//'+q(P14,'media')))==1
(root/'scripts'/'video-slide-map.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Embedded and verified {len(manifest)} local MP4 files.')
