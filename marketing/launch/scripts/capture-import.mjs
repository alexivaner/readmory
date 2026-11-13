/** Separate synthetic saved-file import. Never touches a real library. */
import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
const root=path.resolve('marketing/launch'), base=process.env.CAPTURE_URL||'http://127.0.0.1:4317';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
for(const portrait of [false,true]){
 const viewport=portrait?{width:540,height:960}:{width:1920,height:1080};
 const scratch=await fs.mkdtemp(path.join(os.tmpdir(),'readmory-import-'));
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport,deviceScaleFactor:portrait?2:1,recordVideo:{dir:scratch,size:viewport}});
 const page=await context.newPage();await page.goto(base+'/#import');await page.getByText('Opening your local library…').waitFor({state:'hidden'});
 await page.getByText('My Kobo doesn’t appear',{exact:true}).click();await page.getByRole('button',{name:'I have source files already',exact:false}).click();
 await page.getByLabel('Kobo name',{exact:false}).fill('Demo fixture');
 const origin=await page.evaluate(()=>performance.timeOrigin);await wait(600);
 const start=(Date.now()-origin)/1000;await wait(1200);
 await page.getByLabel('Select Kobo source files',{exact:true}).setInputFiles(path.resolve('fixtures/generated/KoboReader.sqlite'));
 await page.getByRole('region',{name:'Import preview'}).waitFor();
 await page.screenshot({path:path.join(root,portrait?'portrait':'screenshots','10-import-synthetic.png')});
 await wait(1800);await page.getByRole('button',{name:'Import into my library',exact:true}).click();
 await page.getByRole('heading',{name:'My library.',exact:true}).waitFor();await wait(3300);
 const rawVideo=page.video();await context.close();await browser.close();
 const raw=await rawVideo.path();
 const ff=spawnSync('ffmpeg',['-y','-ss',String(start),'-i',raw,'-t','8','-vf',(portrait?'scale=1080:1920':'scale=1920:1080')+",drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='Synthetic saved-file import demo':fontsize="+(portrait?'30':'26')+":fontcolor=white:box=1:boxcolor=0x1B2B22@0.95:boxborderw=14:x=40:y=h-65",'-r','30','-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(root,'clips','10-import-synthetic-'+(portrait?'portrait':'landscape')+'.mp4')],{stdio:'ignore'});
 if(ff.status!==0)throw Error('FFmpeg import export failed');console.log('Saved synthetic import '+(portrait?'portrait':'landscape'));
}
