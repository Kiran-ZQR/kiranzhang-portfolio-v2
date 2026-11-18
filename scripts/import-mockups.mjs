import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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
