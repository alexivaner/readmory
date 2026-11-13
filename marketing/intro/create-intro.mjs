/** Reproducible introduction. Uses only authored synthetic fixtures and a fresh browser context. */
import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const out = path.resolve('marketing/intro');
const work = await fs.mkdtemp(path.join(os.tmpdir(), 'readmory-intro-'));
const base = process.env.CAPTURE_URL || 'http://127.0.0.1:4318';
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) throw Error(`${cmd}: ${r.stderr?.slice(-2500)}`);
  return r.stdout;
};
const pause = ms => new Promise(r => setTimeout(r, ms));
const scenes = [
  { seconds: 7, title: 'Your reading,\nremembered.', label: 'MEET READMORY', voice: 'Meet Readmory. A quiet home for your books, your highlights, and the ideas you want to remember.' },
  { seconds: 8, title: 'Bring your\nreading together.', label: '01 / CONNECT', sub: 'Kobo · KOReader · Kobalt', voice: 'Import your reading data from Kobo, KOReader, or Kobalt. Review what you are bringing in, then save it to your local library.' },
  { seconds: 7, title: 'Return to\nyour bookshelf.', label: '02 / EXPLORE', sub: 'Find a book. Pick up a thought.', voice: 'Browse your bookshelf, check your progress, and return to the books you have spent time with.' },
  { seconds: 8, title: 'Find the\nidea again.', label: '03 / REMEMBER', sub: 'Search highlights and notes.', voice: 'Search your highlights and notes to find a thought again, with the book it came from always close by.' },
  { seconds: 8, title: 'Make room for\nyour own words.', label: '04 / REFLECT', sub: 'Keep a personal reflection.', voice: 'Add your own reflections, and keep your personal notes together. Let one good passage become the start of a new idea.' },
  { seconds: 9, title: 'See your\nreading rhythm.', label: '05 / DISCOVER', sub: 'Explore recorded reading activity.', voice: 'Explore your reading rhythm through a calendar of available activity. See the source behind each record, with estimates clearly marked.' },
  { seconds: 9, title: 'Readmory', label: 'YOUR READING, REMEMBERED.', voice: 'Your library stays in your browser, with no account required. Keep a backup, and try the Readmory public beta today.' },
];
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, recordVideo: { dir: work, size: { width: 1440, height: 810 } }, timezoneId: 'Asia/Taipei', locale: 'en-US' });
await context.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(base + '/#import');
await expect(page.getByText('Opening your local library…')).toBeHidden();
const epoch = await page.evaluate(() => performance.timeOrigin);
async function record(index, setup, action) {
  await setup(); await pause(500);
  scenes[index].start = (Date.now() - epoch) / 1000;
  const start = Date.now(); await pause(1000); await action();
  await pause(Math.max(0, (scenes[index].seconds + 1) * 1000 - (Date.now() - start)));
  await page.screenshot({ path: path.join(out, `scene-${index}.png`) });
  console.log('Recorded ' + scenes[index].label);
}
await record(1, async () => {
  await page.getByText('My Kobo doesn’t appear', { exact: true }).click();
  await page.getByRole('button', { name: 'I have source files already', exact: false }).click();
  await page.getByLabel('Kobo name', { exact: false }).fill('Demo reader');
}, async () => {
  await page.getByLabel('Select Kobo source files', { exact: true }).setInputFiles(['KoboReader.sqlite','kobalt.sqlite','metadata.epub.lua'].map(f => path.resolve('fixtures/generated', f)));
  await page.getByRole('region', { name: 'Import preview' }).waitFor();
  await pause(1600);
  await page.getByRole('button', { name: 'Import into my library', exact: true }).click();
  await page.getByRole('heading', { name: 'My library.', exact: true }).waitFor();
});
const nav = name => page.getByRole('button', { name, exact: true }).click();
await record(2, () => nav('My library'), async () => {
  await page.getByLabel('Search books', { exact: true }).pressSequentially('Quiet', { delay: 180 });
  await pause(1300);
  await page.getByRole('heading', { name: 'The Quiet Atlas', exact: true }).click();
});
await record(3, () => nav('Knowledge library'), async () => {
  await page.getByLabel('Search knowledge', { exact: true }).pressSequentially('walk home', { delay: 180 });
  await expect(page.getByText('Attention turns ordinary moments into a life.', { exact: true })).toBeVisible();
});
await record(4, async () => {
  await nav('My library');
  await page.getByLabel('Search books', { exact: true }).fill('Quiet');
  await page.getByRole('heading', { name: 'The Quiet Atlas', exact: true }).click();
}, async () => {
  await page.getByLabel('Your reflection', { exact: true }).fill('A reminder to notice the small details on my next walk.');
  await page.getByRole('button', { name: 'Save reflection', exact: true }).click();
  await pause(1000); await nav('Personal notes');
  await page.getByRole('button', { name: /My reflections/ }).click();
});
await record(5, async () => {
  await nav('Reading rhythm');
  await page.getByLabel('Reading month').selectOption('2026-09');
}, async () => {
  await page.locator('.calendar-days .has-reading').first().click();
  await pause(1200);
  await page.getByRole('region', { name: 'Selected day reading' }).scrollIntoViewIfNeeded();
});
if (errors.length) throw Error(errors.join('\n'));
const video = page.video();
await context.close();
const raw = await video.path();
const design = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const card = await design.newPage();
const icon = (await fs.readFile('apps/web/public/brand/readmory-r-icon.png')).toString('base64');
for (let i = 0; i < scenes.length; i++) {
  const s = scenes[i], end = i === 6, hero = i === 0 || end;
  await card.setContent(`<html><style>*{box-sizing:border-box}body{margin:0;background:${hero?'#1B2B22':'#F7F3E9'};color:${hero?'#F7F3E9':'#1B2B22'};font-family:Arial} .brand{position:absolute;top:48px;left:76px;font:36px Georgia}.brand img{width:46px;height:46px;vertical-align:middle;margin-right:12px;border-radius:9px}.label{font-size:19px;letter-spacing:4px;color:${hero?'#A9CC8A':'#2F4A3C'}}h1{font: ${hero?'108':'51'}px/1.1 Georgia;margin:28px 0;white-space:pre-line;font-weight:400}.copy{position:absolute;left:${hero?'180':'76'}px;top:${hero?'300':'280'}px;width:${hero?'1500':'310'}px}p{font-size:23px;line-height:1.5;color:${hero?'#D2CCC1':'#2F4A3C'}}.footer{position:absolute;bottom:108px;left:76px;right:76px;border-top:1px solid ${hero?'#526454':'#D2CCC1'};padding-top:0px;display:flex;justify-content:space-between;font-size:18px;color:${hero?'#D2CCC1':'#2F4A3C'}}.frame{position:absolute;left:414px;top:134px;width:1448px;height:818px;border:4px solid #D2CCC1;border-radius:12px;background:#fff}.cta{font-size:31px;color:#A9CC8A;margin-top:32px}.pill{display:inline-block;padding:12px 20px;border:1px solid #526454;border-radius:30px;font-size:21px;margin-top:15px}</style><body><div class="brand"><img src="data:image/png;base64,${icon}"/>Readmory</div>${hero?'':'<div class="frame"></div>'}<div class="copy"><div class="label">${s.label}</div><h1>${s.title}</h1>${s.sub?`<p>${s.sub}</p>`:''}${i===0?'<p>Books. Highlights. Notes. A place to return.</p><div class="pill">Kobo &nbsp;·&nbsp; KOReader &nbsp;·&nbsp; Kobalt</div>':''}${end?'<p>Local-first. No account required. Back up regularly.</p><div class="cta">alexivaner.github.io/readmory/</div><div class="pill">Explore the public beta →</div>':''}</div><div class="footer"><span>${hero?'Your reading, remembered.':'Actual Readmory interface · Synthetic demo data'}</span><span>${String(i+1).padStart(2,'0')} / 07</span></div></body></html>`);
  await card.screenshot({ path: path.join(work, `card-${i}.png`) });
  const txt = path.join(work, `voice-${i}.txt`); await fs.writeFile(txt, s.voice);
  run('say', ['-v', 'Samantha', '-r', '166', '-f', txt, '-o', path.join(work, `voice-${i}.aiff`)]);
  const duration = Number(run('ffprobe', ['-v','error','-show_entries','format=duration','-of','csv=p=0',path.join(work,`voice-${i}.aiff`)]));
  const tempo = Math.max(1, duration / (s.seconds - 0.65));
  const args = ['-y','-loop','1','-i',path.join(work,`card-${i}.png`)];
  if (!hero) args.push('-ss', String(s.start), '-i', raw);
  args.push('-i', path.join(work,`voice-${i}.aiff`));
  const ai = hero ? 1 : 2;
  const vf = hero ? '[0:v]fps=30,format=yuv420p[v]' : '[0:v][1:v]overlay=418:138:shortest=1,fps=30,format=yuv420p[v]';
  args.push('-filter_complex', `${vf};[${ai}:a]atempo=${tempo.toFixed(4)},adelay=280|280,apad,afade=t=out:st=${s.seconds-0.2}:d=0.2[a]`, '-map','[v]','-map','[a]','-t',String(s.seconds),'-c:v','libx264','-preset','fast','-crf','19','-c:a','aac','-ar','48000','-ac','2',path.join(work,`part-${i}.mp4`));
  run('ffmpeg',args); console.log(`Rendered scene ${i+1}`);
}
await browser.close();
const stamp = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')},000`;
let offset=0; const subtitles=[];
for (const s of scenes) {
  const sentences = s.voice.match(/[^.!?]+[.!?]+/g).map(t=>t.trim());
  let local=0; const total=sentences.reduce((n,t)=>n+t.length,0);
  for (let j=0;j<sentences.length;j++) {
    const end = j===sentences.length-1?s.seconds:Math.round(s.seconds*sentences.slice(0,j+1).reduce((n,t)=>n+t.length,0)/total);
    subtitles.push(`${subtitles.length+1}\n${stamp(offset+local)} --> ${stamp(offset+end)}\n${sentences[j]}\n`); local=end;
  }
  offset+=s.seconds;
}
await fs.writeFile(path.join(out,'readmory-introduction.srt'),subtitles.join('\n'));
await fs.writeFile(path.join(out,'script.md'),'# Readmory introduction\n\n56 seconds · 1920×1080 · English synthetic voice (macOS Samantha)\n\n'+scenes.map(s=>`- **${s.label} (${s.seconds}s):** ${s.voice}`).join('\n')+'\n');
await fs.writeFile(path.join(work,'concat.txt'),scenes.map((_,i)=>`file '${path.join(work,`part-${i}.mp4`)}'`).join('\n'));
run('ffmpeg',['-y','-f','concat','-safe','0','-i',path.join(work,'concat.txt'),'-c','copy',path.join(work,'joined.mp4')]);
run('ffmpeg',['-y','-i',path.join(work,'joined.mp4'),'-vf',`subtitles=${path.join(out,'readmory-introduction.srt')}:force_style='FontName=Arial,FontSize=11,PrimaryColour=&H00E9F3F7,OutlineColour=&H00222B1B,BorderStyle=3,Outline=3,Shadow=0,MarginV=9'`,'-c:v','libx264','-preset','fast','-crf','19','-c:a','copy','-movflags','+faststart',path.join(out,'readmory-introduction.mp4')]);
run('ffmpeg',['-y','-ss','18','-i',path.join(out,'readmory-introduction.mp4'),'-frames:v','1',path.join(out,'poster.jpg')]);
console.log(`Saved ${path.join(out,'readmory-introduction.mp4')}`);
