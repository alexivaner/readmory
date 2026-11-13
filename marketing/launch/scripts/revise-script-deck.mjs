/** Edit the existing local deck to match script-narration.json, preserving its design.
 * Runtime: bundled artifact-tool. Input/output are deliberately separate.
 * Run from the repository root; then run retime-script-media.py and finalization.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const deps=process.env.ARTIFACT_NODE_MODULES;
if(!deps) throw Error('Set ARTIFACT_NODE_MODULES to the bundled dependency path');
const {PresentationFile,FileBlob}=await import(require.resolve('@oai/artifact-tool',{paths:[deps]}));
const root=path.resolve('marketing/launch'),work=path.resolve('.private/launch/script-revision');
await fs.mkdir(work,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(root,'readmory-promo.pptx')));
const scenes=JSON.parse(await fs.readFile(path.join(root,'scripts/script-narration.json'),'utf8'));
const sourceScenes=JSON.parse(await fs.readFile(path.join(root,'scripts/main-demo-scenes.json'),'utf8'));
if(p.slides.items.length!==scenes.length)throw Error('Unexpected source slide count');
let start=0;
for(let i=0;i<scenes.length;i++){
 const slide=p.slides.items[i],scene=scenes[i];
 // Match imported objects by their existing semantic names, retaining geometry/style.
 const title=slide.shapes.items.find(s=>s.name===sourceScenes[i].title || s.name==='What stays after\nthe last page?');
 if(!title)throw Error(`Missing title on slide ${i+1}`);
 title.text=scene.title;
 const subtitle=slide.shapes.items.find(s=>s.name===(i===0?'A personal reading project by Ivan':sourceScenes[i].subtitle.slice(0,50)));
 if(!subtitle)throw Error(`Missing subtitle on slide ${i+1}`);
 subtitle.text=scene.subtitle;
 if(i===1 || i===7){
  const label=slide.shapes.add({geometry:'textbox',name:'Source disclosure',position:{left:500,top:26,width:640,height:22},fill:'none',line:{fill:'none',width:0}});
  label.text=i===1?'Synthetic import demonstration':'Optional cover lookup is off by default and shares book identifiers only if enabled.';
  label.text.style={typeface:'Arial',fontSize:13,color:'#1B2B22'};
 }
 scene.start=start;scene.end=start+scene.duration;
 const caveat=i===1?'The source recording demonstrates saved synthetic files, not a physical USB connection. The next scene uses the existing cleaned owner library.':i===2?'The retained clip shows shelf browsing, search, source records and annotation scrolling. Reflection writing is available in the app but is not performed in this retained recording.':i===4?'Daily activity can include reconstructed or estimated sessions. Keep all estimate labels visible. The app does not award streaks or guarantee exact session coverage.':i===6?'Book filtering in this recording uses the search field with a book title. There is no separate book dropdown.':i===7?'Optional remote cover/metadata enrichment sends book identifiers after opt-in. Notes and annotations stay local. No narration audio has been embedded.':'';
 slide.speakerNotes.text=`NARRATION\n${scene.voice}\n\nTIMING\n${scene.start}–${scene.end}s (${scene.duration}s). Automatic slide advance; click to advance early or rehearse manually.\n\nVISUAL CUES\n${sourceScenes[i].clip?'Retained and retimed clip: '+sourceScenes[i].clip:'Static editorial card.'}\n${caveat}\n\nSOURCE\n${sourceScenes[i].source}. Original launch kit, README.md, PRIVACY.md, feature-audit.md.\n\nNarration is the supplied script verbatim. Timing is provisional until a voice recording is available.`;
 start=scene.end;
 await fs.writeFile(path.join(work,`after-${i+1}.png`),new Uint8Array(await(await p.export({slide,format:'png',scale:1})).arrayBuffer()));
}
await(await PresentationFile.exportPptx(p)).save(path.join(work,'edited-layout.pptx'));
await fs.writeFile(path.join(work,'timing.json'),JSON.stringify(scenes,null,2)+'\n');
console.log(`Edited ${scenes.length} slides; ${start}s target; ${scenes.reduce((n,s)=>n+s.voice.split(/\s+/).length,0)} narration words.`);
