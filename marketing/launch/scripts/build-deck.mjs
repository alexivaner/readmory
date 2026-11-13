/** Run with the bundled artifact-tool runtime.
 * ARTIFACT_NODE_MODULES and PRESENTATIONS_SKILL_DIR come from load_workspace_dependencies.
 * RUNTIME_PYTHON points to that runtime's Python. Requires the reviewed screenshots.
 */
import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url), deps=process.env.ARTIFACT_NODE_MODULES;
if(!deps)throw Error('Set ARTIFACT_NODE_MODULES to the bundled Node packages directory.');
process.env.RUNTIME_NODE_MODULES=deps;
const {Presentation,PresentationFile}=await import(pathToFileURL(require.resolve('@oai/artifact-tool',{paths:[deps]})).href);
const sharp=(await import(pathToFileURL(require.resolve('sharp',{paths:[deps]})).href)).default;
const root=path.resolve('marketing/launch'),work=path.resolve('.private/launch/deck');await fs.mkdir(work,{recursive:true});await fs.mkdir(path.join(root,'slides'),{recursive:true});
const videoDeck=process.env.VIDEO_DECK==='1';
const C={forest:'#1B2B22',deep:'#2F4A3C',sage:'#A9CC8A',cream:'#F7F3E9',gray:'#D2CCC1'};
const p=Presentation.create({slideSize:{width:1280,height:720}});
function text(s,t,x,y,w,h,size=30,serif=false,color=C.forest){
 const o=s.shapes.add({geometry:'textbox',name:t.slice(0,40),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 o.text=t;o.text.style={typeface:serif?'Georgia':'Arial',fontSize:size,color};return o;
}
async function pic(s,file,x,y,w,h,crop){
 let b=await fs.readFile(file);if(crop)b=await sharp(b).extract(crop).png().toBuffer();
 s.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/png',alt:path.basename(file),fit:'contain',position:{left:x,top:y,width:w,height:h}});
}
function slide(n,dark=false){const s=p.slides.add();s.background.fill=dark?C.forest:C.cream;text(s,'READMORY',64,28,350,28,17,false,dark?C.sage:C.deep);text(s,String(n).padStart(2,'0'),1170,28,50,28,17,false,dark?C.sage:C.deep);return s;}
function note(s,t,source){s.speakerNotes.text=t+'\n\nSources: '+source+'\nSelected owner-authorized cleaned library footage. Artwork retains original rights.';}
let s=slide(1,true);text(s,'What stayed with you\nafter the last page?',80,200,1100,220,72,true,C.cream);text(s,'A personal reading project by Ivan',84,550,900,50,27,false,C.sage);note(s,'What happens to the books you finish, and the ideas you underline? I wanted a better way to come back to mine.','Opening editorial question.');
const scenes=[
 ['Readmory','Your reading, remembered.','01-overview','This is my local reading workspace. I built it to bring my books and the ideas I keep together.','README.md; components/workspace.tsx'],
 ['Your books, together','Local covers. Searchable shelves. Reader filters.','02-library','This is my actual cleaned library. Browse familiar covers, filter by reader, then open a book.','components/workspace.tsx; packages/core/grouping.ts'],
 ['The time you spend reading','Recorded history, with estimates clearly labeled.','03-statistics','Explore a year or month, active reading days and recorded time. Imported history can be incomplete. Estimates stay labeled.','components/reading-statistics.tsx; packages/analytics/statistics.ts'],
 ['Every reading day has a story','A calendar with the books behind each day.','04-rhythm','Open a day to see the books and sessions behind it. Native Kobo intervals can be reconstructed estimates.','components/reading-rhythm.tsx; packages/analytics/timeline.ts'],
 ['Find the idea again','Search highlights across your books.','05-knowledge','Search by words, book or author. Your original quotations and notes remain separate.','packages/knowledge/index.ts; components/workspace.tsx'],
 ['Your own words','Personal notes, with passage context close by.','06-notes','My own notes have their own view. Open the passage context when you need it. Favorites and topics can organize useful highlights.','components/personal-notes.tsx; components/workspace.tsx'],
 ['One book, several readers','Kobo, KOReader and Kobalt source records stay visible.','07-book-details','Verified same-file or ISBN records can share a shelf card. Source records remain intact, with reversible manual combining.','packages/core/grouping.ts; components/reader-sources.tsx'],
 ['A reading recap you can keep','Save a local share card. Choose whether to include covers.','09-share-card','Save a local recap image. Highlights and personal notes are excluded from the card.','apps/web/lib/share-card.ts; components/reading-statistics.tsx'],
 ['Your Kobo library, in a few steps','Connect by USB. Choose your Kobo folder. Review and save.','10-import-synthetic','Connect your Kobo by USB and enable its storage connection. In Connect Kobo, choose the Kobo folder or supported saved files, review what was found, then save to your library. Readmory never modifies the Kobo files. This video demonstrates saved files using a synthetic fixture, not a connected physical device. Hidden folders or active database journals may require the documented saved-snapshot workflow.','components/import-guide.tsx; packages/importers/index.ts'],
 ['Your library stays in your browser','No account. Optional cover lookup. Portable backups.','08-privacy-backup','Reading imports stay in your browser. Optional Open Library lookup shares book metadata when enabled. Site data can be erased, so keep backups.','PRIVACY.md; packages/storage/index.ts']
];
for(let i=0;i<scenes.length;i++){
 const [title,sub,id,narration,source]=scenes[i];s=slide(i+2);
 if(videoDeck){
  text(s,title,64,70,1150,76,50,true);text(s,sub,68,150,1145,50,25);
  await pic(s,path.join(root,'screenshots',id+'.png'),220,210,840,472.5);
  text(s,id==='10-import-synthetic'?'Saved-file demo with a synthetic fixture. No physical Kobo connected.':'Click the video to play the recorded demonstration',220,686,950,24,15);
 }else if(id==='06-notes'){
  text(s,title,70,170,520,160,62,true);text(s,sub,74,370,430,120,29);
  await pic(s,path.join(root,'screenshots',id+'.png'),620,150,590,420,{left:310,top:285,width:790,height:450});
 }else if(id==='09-share-card'){
  text(s,title,70,170,590,170,62,true);text(s,sub,74,390,500,120,29);
  await pic(s,path.join(root,'screenshots','reading-share-card.png'),755,100,410,512);
 }else{
  text(s,title,64,70,1150,80,52,true);text(s,sub,68,152,1145,48,25);
  const crops={'02-library':{left:310,top:360,width:1540,height:680},'03-statistics':{left:310,top:330,width:1540,height:650},'04-rhythm':{left:310,top:275,width:1540,height:780},'07-book-details':{left:310,top:495,width:1540,height:565},'08-privacy-backup':{left:310,top:520,width:1540,height:550}};
  const file=id==='08-privacy-backup'?id+'-detail':id;
  await pic(s,path.join(root,'screenshots',file+'.png'),64,218,1152,450,crops[id]||{left:300,top:100,width:1560,height:610});
 }
 note(s,narration,source);
 if(videoDeck)s.speakerNotes.text+='\nVideo: clips/'+id+'-landscape.mp4. Click to play in a compatible PowerPoint player. Add the MP4 separately when converting Slides to Vids.';
}
s=slide(12,true);await pic(s,path.resolve('apps/web/public/brand/readmory-r-icon.png'),1010,90,150,150);text(s,'Readmory',80,185,900,120,92,true,C.cream);text(s,'Your reading, remembered.',84,330,1000,65,40,true,C.sage);text(s,'Open-source public beta',84,460,950,50,28,false,C.cream);text(s,'alexivaner.github.io/readmory/',84,548,1110,55,30,false,C.cream);note(s,'Readmory is open source and in public beta. Try it, and tell me what you’d like to remember from your reading.','README.md; LICENSE; docs/BRANDING.md');
const candidate=path.join(work,'candidate.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);
for(let i=0;i<p.slides.items.length;i++){const png=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});await fs.writeFile(path.join(root,'slides',`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));}
// Native editable text only: no screenshots are flattened into background slides.
const end=Presentation.create({slideSize:{width:1080,height:1920}});const es=end.slides.add();es.background.fill=C.cream;await pic(es,path.resolve('apps/web/public/brand/readmory-r-icon.png'),100,380,170,170);text(es,'Readmory',100,650,890,160,112,true);text(es,'Your reading,\nremembered.',105,840,860,180,65,true);text(es,'Open-source public beta',105,1150,800,90,40);text(es,'Link in description',105,1290,800,90,40);const ep=await end.export({slide:es,format:'png',scale:1});await fs.writeFile(path.join(root,'portrait','end-card.png'),new Uint8Array(await ep.arrayBuffer()));
const skill=process.env.PRESENTATIONS_SKILL_DIR;
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
await finalizePresentation({workspaceDir:process.cwd(),candidatePath:candidate,finalPath:path.join(root,process.env.DECK_FILENAME||'readmory-promo.pptx'),explicitTotalSlideCount:12,pythonExecutable:process.env.RUNTIME_PYTHON,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Georgia','Arial']},verifyArtifactToolImport:true,receiptPath:path.join(work,(process.env.DECK_FILENAME||'readmory-promo.pptx')+'.validation.json')});
console.log('Created editable 12-slide deck.');
