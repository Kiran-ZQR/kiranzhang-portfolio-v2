import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import {packVision} from './pack-vision.mjs';
const files=JSON.parse(fs.readFileSync(new URL('./mockup-assets.json',import.meta.url),'utf8'));
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const file of files){
  if(fs.existsSync(file.path)&&digest(fs.readFileSync(file.path))===file.sha256)continue;
  const response=await fetch(file.url,{headers:{'User-Agent':'kiran-portfolio-asset-import'},signal:AbortSignal.timeout(120000)});
  if(!response.ok)throw new Error(`Model download failed: ${response.status}`);
  const data=await response.json(),bytes=Buffer.from(data.content,'base64');
  if(digest(bytes)!==file.sha256)throw new Error(`Model integrity check failed: ${file.path}`);
  fs.mkdirSync(path.dirname(file.path),{recursive:true});fs.writeFileSync(file.path,bytes);console.log(`Stored licensed model: ${file.path}`);
}
const vision=JSON.parse(fs.readFileSync(new URL('./vision-assets.json',import.meta.url),'utf8')),target='assets/models/vision-pro.glb';
if(!fs.existsSync(target)||digest(fs.readFileSync(target))!==vision.sha256){
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'kiran-vision-'));
  for(let i=0;i<vision.files.length;i+=6)await Promise.all(vision.files.slice(i,i+6).map(async file=>{
    const response=await fetch(file.url,{signal:AbortSignal.timeout(120000)});if(!response.ok)throw new Error(`Vision asset download failed: ${response.status}`);
    const bytes=Buffer.from(await response.arrayBuffer());if(digest(bytes)!==file.sha256)throw new Error(`Vision asset integrity failed: ${file.path}`);
    const destination=path.join(directory,file.path);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes);
  }));
  const bytes=packVision(directory);if(digest(bytes)!==vision.sha256)throw new Error('Packed Vision Pro integrity failed');fs.writeFileSync(target,bytes);console.log('Stored licensed Vision Pro model');
}
