/** Longer action/result demonstrations for the two-minute introduction.
 * Uses a cleaned backup outside Git, isolated profiles, and a separate local server.
 * No video is a final edited promotional film. Private raw recordings stay in OS temp.
 */
import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
const root=path.resolve('marketing/launch'),base=process.env.CAPTURE_URL||'http://127.0.0.1:4317';
const backup=process.env.PRIVATE_BACKUP;
if(!backup||path.resolve(backup).startsWith(process.cwd()+path.sep))throw Error('Set PRIVATE_BACKUP to a cleaned backup outside Git.');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const beats=[];const selected=new Set((process.env.CAPTURE_SCENES||'').split(',').filter(Boolean));
async function contextFor(browser,dir){return browser.newContext({viewport:{width:1920,height:1080},recordVideo:{dir,size:{width:1920,height:1080}},timezoneId:'Asia/Taipei',locale:'en-US',acceptDownloads:true});}
function encode(raw,scene){
 const out=path.join(root,'clips',scene.id+'-landscape.mp4');
 const filters=[];
 if(scene.synthetic)filters.push("drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='Saved-file demonstration. Synthetic fixture.':fontsize=26:fontcolor=white:box=1:boxcolor=0x1B2B22@0.96:boxborderw=12:x=40:y=h-65");
 const args=['-y','-ss',String(scene.start),'-i',raw,'-t',String(scene.duration)];
 if(filters.length)args.push('-vf',filters.join(','));
 args.push('-r','30','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',out);
 const result=spawnSync('ffmpeg',args,{stdio:'ignore'});if(result.status)throw Error('MP4 encoding failed for '+scene.id);
}
const browser=await chromium.launch({channel:'chrome',headless:true});
const scratch=await fs.mkdtemp(path.join(os.tmpdir(),'readmory-main-demo-'));
const context=await contextFor(browser,scratch);await context.route(/https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base+'/#settings');await page.getByText('Opening your local library…').waitFor({state:'hidden'});
await page.getByLabel('Restore library backup',{exact:true}).setInputFiles(backup);await page.getByRole('button',{name:'Restore & replace',exact:true}).click();await page.getByText('Backup restored.',{exact:true}).waitFor();
await expect(page.getByLabel('Enable automatic covers and metadata')).not.toBeChecked();await wait(4500);
const video=page.video(),origin=await page.evaluate(()=>performance.timeOrigin),segments=[];
async function nav(label){await page.getByRole('button',{name:label,exact:true}).click();await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});await wait(700);}
async function glide(y){await page.mouse.move(1800,900,{steps:12});await page.evaluate(target=>window.scrollTo({top:target,behavior:'smooth'}),y);await wait(550);}
async function point(locator){const b=await locator.boundingBox();if(b)await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:18});}
async function scene(id,duration,setup,action){
 if(selected.size&&!selected.has(id))return;
 await setup();await wait(600);await page.screenshot({path:path.join(root,'screenshots',id+'-main-start.png')});
 const start=(Date.now()-origin)/1000,begin=Date.now();const cue=[];
 const beat=label=>cue.push({at:Math.round((Date.now()-begin)/100)/10,action:label});
 await action(beat);const elapsed=Date.now()-begin;if(elapsed>duration*1000-500)throw Error('Scene exceeded deliberate pacing budget: '+id+' '+elapsed+'ms');
 await wait(duration*1000-elapsed);await page.screenshot({path:path.join(root,'screenshots',id+'-main-result.png')});
 segments.push({id,duration,start});beats.push({id,duration,source:'real cleaned owner library',beats:cue});console.log('Captured '+id+' ('+duration+'s)');
}
await scene('02-library',28,()=>nav('My library'),async beat=>{
 beat('Browse the current cleaned shelf');await wait(1600);
 for(const y of [750,1500,2250]){await glide(y);await wait(700);}
 beat('Return to the shelf search');await glide(0);await wait(500);
 const search=page.getByLabel('Search books',{exact:true});await point(search);await search.pressSequentially('Taipei',{delay:115});await wait(900);
 const title=page.getByRole('heading',{name:'Taipei Story',exact:true});await point(title);await title.click();await expect(page.getByRole('heading',{name:'Taipei Story',exact:true})).toBeVisible();await wait(1000);
 beat('Open Taipei Story and read its preserved reader records');await glide(450);await wait(900);
 const cards=page.locator('.annotation');const count=await cards.count();if(count!==11)throw Error('Recheck Taipei annotation count before filming');
 beat('Scroll through every Taipei Story annotation');
 for(let i=0;i<count;i+=2){const y=await cards.nth(i).evaluate(el=>el.getBoundingClientRect().top+window.scrollY-120);await glide(y);await wait(550);}
 await cards.last().scrollIntoViewIfNeeded();await expect(cards.last()).toBeVisible();beat('Hold the final annotation');await wait(900);
});
await scene('03-statistics',9,()=>nav('Statistics'),async beat=>{
 beat('Read all-time totals');await wait(1700);const year=page.getByLabel('Statistics year');await point(year);await year.selectOption('2026');beat('Filter to the year');await wait(1900);
 const month=page.getByLabel('Statistics month');await point(month);await month.selectOption('10');beat('Filter to October and read the labeled result');await wait(1600);
});
await scene('04-rhythm',9,()=>nav('Reading rhythm'),async beat=>{
 beat('Read calendar with latest day selected');await wait(1800);const days=page.locator('.calendar-days .has-reading');const count=await days.count();if(count<2)throw Error('Need at least two active days');const selected=days.nth(count-2);await point(selected);await selected.click();beat('Select a different active day');await wait(1500);
 const details=page.getByRole('region',{name:'Selected day reading'}).locator('summary').first();await expect(details).toBeVisible();await point(details);await details.click();beat('Reveal the actual session times and evidence labels');await wait(1800);
});
await scene('05-knowledge',21,()=>nav('Knowledge library'),async beat=>{
 beat('Read the complete knowledge collection');await wait(1800);
 for(const y of [650,1300,1950,2600,3250,3900]){await glide(y);await wait(900);}
 beat('Return to search after browsing several screens');await glide(0);await wait(700);
 const search=page.getByLabel('Search knowledge',{exact:true});await point(search);await search.pressSequentially('work backward',{delay:80});await expect(page.getByText(/they start with the things they value most/)).toBeVisible();beat('A remembered phrase finds the passage');await wait(2000);
});
await scene('06-notes',9,async()=>{await nav('Personal notes');await page.getByLabel('Search personal notes').fill('Digital Minimalism');},async beat=>{
 beat('Read the selected personal note');await wait(2000);const passage=page.getByText('Highlighted passage',{exact:true});await point(passage);await passage.click();beat('Expand the passage that prompted the note');await wait(3000);
});
await scene('08-privacy-backup',10,()=>nav('Settings'),async beat=>{
 beat('Optional metadata lookup remains off');await wait(1800);await page.getByRole('heading',{name:'Backup & restore',exact:true}).scrollIntoViewIfNeeded();await wait(900);beat('Read backup and privacy information');await wait(1300);
 const button=page.getByRole('button',{name:'Download backup',exact:true});await point(button);const download=page.waitForEvent('download');await button.click();await(await download).saveAs(path.join(scratch,'private-backup.json'));await expect(page.getByText('Backup downloaded. Keep it somewhere safe.',{exact:true})).toBeVisible();beat('The real backup download succeeds');await wait(1300);
});
if(errors.length)throw Error('Page errors during capture: '+errors.length);await context.close();const raw=await video.path();for(const segment of segments)encode(raw,segment);
// Separate empty profile: show the connection guidance, then take the saved-files path honestly.
const demoScratch=await fs.mkdtemp(path.join(os.tmpdir(),'readmory-main-import-'));const demo=await contextFor(browser,demoScratch),p=await demo.newPage();await p.goto(base+'/#import');await p.getByText('Opening your local library…').waitFor({state:'hidden'});await wait(700);
const demoVideo=p.video(),demoOrigin=await p.evaluate(()=>performance.timeOrigin),start=(Date.now()-demoOrigin)/1000,begin=Date.now(),cue=[];
const beat=action=>cue.push({at:Math.round((Date.now()-begin)/100)/10,action});
await p.screenshot({path:path.join(root,'screenshots','10-import-synthetic-main-start.png')});beat('Explain the real USB connection instructions');await wait(6000);
await p.getByRole('button',{name:'My Kobo is connected',exact:false}).click();beat('Continue from connection guidance to file selection');await wait(3000);
await p.getByLabel('Kobo name',{exact:false}).fill('Demo snapshot');await wait(800);await p.getByLabel('Select Kobo source files',{exact:true}).setInputFiles(path.resolve('fixtures/generated/KoboReader.sqlite'));await p.getByRole('region',{name:'Import preview'}).waitFor();beat('Review actual fixture counts before saving');await wait(4000);
await p.getByRole('button',{name:'Import into my library',exact:true}).click();await p.getByRole('heading',{name:'My library.',exact:true}).waitFor();beat('Import completes and the shelf appears');await p.screenshot({path:path.join(root,'screenshots','10-import-synthetic-main-result.png')});
if(Date.now()-begin>19500)throw Error('Import exceeded pacing budget');await wait(20000-(Date.now()-begin));await demo.close();encode(await demoVideo.path(),{id:'10-import-synthetic',duration:20,start,synthetic:true});beats.push({id:'10-import-synthetic',duration:20,source:'repository synthetic saved-file fixture',beats:cue});
await browser.close();if(selected.size){const old=JSON.parse(await fs.readFile(path.join(root,'scripts','main-demo-beats.json'),'utf8'));beats.push(...old.filter(x=>!beats.some(n=>n.id===x.id)));}await fs.writeFile(path.join(root,'scripts','main-demo-beats.json'),JSON.stringify(beats,null,2)+'\n');console.log('Selected action/result clips captured.');
