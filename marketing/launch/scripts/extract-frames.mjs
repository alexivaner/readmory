import fs from 'node:fs/promises';import path from 'node:path';import {spawnSync} from 'node:child_process';
const root=path.resolve('marketing/launch');
for(const file of (await fs.readdir(path.join(root,'clips'))).filter(f=>f.endsWith('.mp4'))){
 const portrait=file.includes('-portrait'), id=file.replace(/-(landscape|portrait)\.mp4$/,'');
 const r=spawnSync('ffmpeg',['-y','-ss','5','-i',path.join(root,'clips',file),'-frames:v','1',path.join(root,portrait?'portrait':'screenshots',id+'-detail.png')],{stdio:'ignore'});if(r.status)throw Error('Frame export failed');
}
