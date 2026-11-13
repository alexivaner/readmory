/** Nine-scene editable 120-second main demonstration. Requires the bundled artifact runtime.
 * Set ARTIFACT_NODE_MODULES, PRESENTATIONS_SKILL_DIR and RUNTIME_PYTHON as in README.
 * Pass a fresh DECK_FILENAME. Embed native MP4s afterward with READMORY_MAIN_DEMO=1.
 */
import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url),deps=process.env.ARTIFACT_NODE_MODULES;if(!deps)throw Error('Set ARTIFACT_NODE_MODULES');process.env.RUNTIME_NODE_MODULES=deps;
const {Presentation,PresentationFile}=await import(pathToFileURL(require.resolve('@oai/artifact-tool',{paths:[deps]})).href);
const root=path.resolve('marketing/launch'),work=path.resolve('.private/launch/main-deck'),scenes=JSON.parse(await fs.readFile(path.join(root,'scripts/main-demo-scenes.json'),'utf8'));
await fs.mkdir(work,{recursive:true});await fs.mkdir(path.join(root,'slides'),{recursive:true});
const p=Presentation.create({slideSize:{width:1280,height:720}}),forest='#1B2B22',cream='#F7F3E9',sage='#A9CC8A';
function txt(s,value,x,y,w,h,fontSize=26,serif=false,color=forest){const o=s.shapes.add({geometry:'textbox',name:value.slice(0,50),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});o.text=value;o.text.style={typeface:serif?'Georgia':'Arial',fontSize,color};}
async function img(s,file,x,y,w,h){const b=await fs.readFile(file);s.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/png',alt:path.basename(file),fit:'contain',position:{left:x,top:y,width:w,height:h}});}
for(let i=0;i<scenes.length;i++){
 const scene=scenes[i],s=p.slides.add(),dark=!scene.clip;s.background.fill=dark?forest:cream;
 txt(s,'READMORY',64,24,500,24,17,false,dark?sage:forest);txt(s,String(i+1).padStart(2,'0'),1170,24,50,24,17,false,dark?sage:forest);
 if(scene.id==='hook'){txt(s,'What stays after\nthe last page?',80,200,1100,220,76,true,cream);txt(s,'A personal reading project by Ivan',84,550,1000,50,27,false,sage);}
 else if(scene.id==='cta'){txt(s,'Readmory',80,185,900,120,92,true,cream);txt(s,'Your reading, remembered.',84,330,1080,65,40,true,sage);txt(s,'Open-source public beta',84,460,950,50,28,false,cream);txt(s,'alexivaner.github.io/readmory/',84,548,1110,55,30,false,cream);await img(s,path.resolve('apps/web/public/brand/readmory-r-icon.png'),1010,90,150,150);}
 else{txt(s,scene.title,64,55,1152,60,46,true);txt(s,scene.subtitle,68,116,1145,34,24);await img(s,path.join(root,'screenshots',scene.id+'-main-start.png'),160,160,960,540);}
 s.speakerNotes.text=`${scene.voice}\n\nScene ${i+1}: ${scene.start}–${scene.end}s (${scene.end-scene.start}s).\n${scene.clip?'Embedded clip: clips/'+scene.clip+'.':''}\nData: ${scene.source}.\nSource: README.md, PRIVACY.md, feature-audit.md.\nTiming is a production target; retime captions to the recorded voice.`;
 const png=await p.export({slide:s,format:'png',scale:1.5});await fs.writeFile(path.join(root,'slides',`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
}
const candidate=path.join(work,'layout-candidate.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);
const skill=process.env.PRESENTATIONS_SKILL_DIR,{finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href),filename=process.env.DECK_FILENAME||'readmory-main-layout.pptx';
await finalizePresentation({workspaceDir:process.cwd(),candidatePath:candidate,finalPath:path.join(root,filename),explicitTotalSlideCount:9,pythonExecutable:process.env.RUNTIME_PYTHON,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Georgia','Arial']},verifyArtifactToolImport:true,receiptPath:path.join(work,filename+'.validation.json')});
console.log('Validated nine-slide main demonstration layout.');
