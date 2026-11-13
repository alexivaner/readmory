/** Real UI capture. Requires an existing local build/server, Playwright and FFmpeg.
 * PRIVATE_BACKUP must point outside Git. No backup content is logged.
 * Raw video/profile stays in OS temp storage. Media outputs are ignored until review.
 */
import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root=path.resolve('marketing/launch');
const base=process.env.CAPTURE_URL || 'http://127.0.0.1:4317';
const backup=process.env.PRIVATE_BACKUP;
if(!backup) throw Error('Set PRIVATE_BACKUP to a cleaned backup outside the repository.');
if(path.resolve(backup).startsWith(process.cwd()+path.sep)) throw Error('Backup must be outside Git.');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const inventory=[];
for(const vertical of [false,true]) {
 const name=vertical?'portrait':'landscape', viewport=vertical?{width:540,height:960}:{width:1920,height:1080};
 const scratch=await fs.mkdtemp(path.join(os.tmpdir(),'readmory-capture-'));
 const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true});
 const context=await browser.newContext({viewport,deviceScaleFactor:vertical?2:1,recordVideo:{dir:scratch,size:viewport},acceptDownloads:true,timezoneId:'Asia/Taipei',locale:'en-US'});
 // No optional metadata service is contacted during capture.
 await context.route(/https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/#settings');
 await page.getByText('Opening your local library…').waitFor({state:'hidden'});
 await page.getByLabel('Restore library backup',{exact:true}).setInputFiles(backup);
 await page.getByRole('button',{name:'Restore & replace',exact:true}).click();
 await page.getByText('Backup restored.',{exact:true}).waitFor();
 await expect(page.getByLabel('Enable automatic covers and metadata')).not.toBeChecked();
 await wait(4500); // Allow the real restore notification to expire before filming.
 const video=page.video();
 const nav=async label=>{
  if(vertical) await page.getByRole('button',{name:'Open menu',exact:true}).click();
  await page.getByRole('button',{name:label,exact:true}).click();
  await wait(500);
  await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
 };
 const segments=[];
 // Video time begins with creation of the recorded page, including restoration.
 const recordingStart=await page.evaluate(()=>performance.timeOrigin);
 async function scene(id,setup,action){
  await setup();await wait(600);
  await page.screenshot({path:path.join(root,vertical?'portrait':'screenshots',id+'.png')});
  const start=(Date.now()-recordingStart)/1000;
  const begin=Date.now();await wait(1300);await action();
  await wait(Math.max(0,8000-(Date.now()-begin)));
  segments.push({id,start,duration:8});
  console.log(name+': '+id);
 }
 const scroll=async distance=>{await page.mouse.move(vertical?410:1600,vertical?650:800,{steps:15});await page.mouse.wheel(0,distance);await wait(1100);};
 await scene('01-overview',()=>nav('Overview'),async()=>scroll(vertical?320:240));
 await scene('02-library',()=>nav('My library'),async()=>{
  await scroll(vertical?350:300);await page.evaluate(()=>window.scrollTo({top:0,behavior:'smooth'}));await wait(900);
  await page.getByLabel('Search books',{exact:true}).pressSequentially('Taipei',{delay:130});
  await wait(900);await page.getByRole('heading',{name:'Taipei Story',exact:true}).click();
 });
 await scene('03-statistics',()=>nav('Statistics'),async()=>{
  await page.getByLabel('Statistics year').selectOption('2026');await wait(1000);await scroll(vertical?470:330);
 });
 await scene('04-rhythm',()=>nav('Reading rhythm'),async()=>{
  const days=page.locator('.calendar-days .has-reading');
  await days.last().click();await wait(800);await scroll(vertical?440:300);
 });
 await scene('05-knowledge',async()=>{await nav('Knowledge library');await page.getByLabel('Search knowledge',{exact:true}).fill('Digital Minimalism');},async()=>{
  await page.getByLabel('Search knowledge',{exact:true}).fill('');
  await page.getByLabel('Search knowledge',{exact:true}).pressSequentially('Digital Minimalism',{delay:90});await wait(700);await scroll(220);
 });
 await scene('06-notes',async()=>{await nav('Personal notes');await page.getByLabel('Search personal notes').fill('Digital Minimalism');},async()=>{
  await page.getByText('Highlighted passage',{exact:true}).click();await wait(1300);await scroll(150);
 });
 await scene('07-book-details',async()=>{await nav('My library');await page.getByLabel('Search books',{exact:true}).fill('Taipei');await page.getByRole('heading',{name:'Taipei Story',exact:true}).click();},async()=>scroll(vertical?500:380));
 await scene('08-privacy-backup',()=>nav('Settings'),async()=>{
  await page.getByRole('heading',{name:'Backup & restore',exact:true}).scrollIntoViewIfNeeded();
  const d=page.waitForEvent('download');await page.getByRole('button',{name:'Download backup',exact:true}).click();
  await (await d).saveAs(path.join(scratch,'private-backup.json'));await wait(1200);
 });
 await scene('09-share-card',async()=>{await nav('Statistics');await page.getByRole('button',{name:'Create share card',exact:true}).click();await page.getByRole('img',{name:/Share card/}).waitFor();},async()=>{
  const d=page.waitForEvent('download');await page.getByRole('button',{name:'Download PNG',exact:true}).click();
  await (await d).saveAs(path.join(root,vertical?'portrait':'screenshots','reading-share-card.png'));
 });
 // Import uses a separate EMPTY browser context and the repository's synthetic fixture.
 if(errors.length) throw Error('Application errors during capture: '+errors.length);
 await context.close();const raw=await video.path();await browser.close();
 for(const segment of segments){
  const output=path.join(root,'clips',segment.id+'-'+name+'.mp4');
  const r=spawnSync('ffmpeg',['-y','-ss',String(segment.start),'-i',raw,'-t','8','-vf',vertical?'scale=1080:1920':'scale=1920:1080','-r','30','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',output],{stdio:'ignore'});
  if(r.status!==0) throw Error('FFmpeg failed');inventory.push({...segment,aspect:name,source:'real cleaned owner library',file:path.relative(root,output)});
 }
}
await fs.writeFile(path.join(root,'asset-inventory.json'),JSON.stringify(inventory,null,2));
