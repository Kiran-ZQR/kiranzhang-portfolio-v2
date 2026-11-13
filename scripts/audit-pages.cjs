/* Read-only GitHub Pages readiness audit. Does not deploy or modify source assets. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),files=new Set(),missing=new Set();
const entryFiles=[...fs.readdirSync(root).filter(f=>/\.html$/.test(f)), ...['assets/css','assets/js'].flatMap(dir=>fs.readdirSync(path.join(root,dir)).filter(f=>/\.(css|js)$/.test(f)).map(f=>dir+'/'+f))];
for(const file of entryFiles){
 files.add(file);
 const text=fs.readFileSync(path.join(root,file),'utf8');
 for(const m of text.matchAll(/assets\/[A-Za-z0-9_./% -]+\.(?:png|webp|jpg|jpeg|gif|svg|mp4|webm|woff2|pdf|json|js)\b/g)){
  const name=decodeURIComponent(m[0]);if(fs.existsSync(path.join(root,name)))files.add(name);else missing.add(name);
 }
 for(const m of text.matchAll(/(?:src|href)=["']([^"'#?]+)(?:[?#][^"']*)?["']/g)){
  const name=m[1];if(/^(?:https?:|mailto:|data:|tel:)/.test(name))continue;
  if(name.startsWith('/')||/^(?:file:|[A-Z]:)/i.test(name))missing.add('nonportable:'+name);
  else if(!name.includes('${')&&!fs.existsSync(path.join(root,name)))missing.add(name);
 }
}
const config={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/config.js'),'utf8'),config);
function includeDirectory(relative){const full=path.join(root,relative);if(!fs.existsSync(full)){missing.add(relative);return}for(const entry of fs.readdirSync(full,{withFileTypes:true})){const next=relative+'/'+entry.name;if(entry.isDirectory())includeDirectory(next);else files.add(next)}}
includeDirectory('assets');
includeDirectory('en');
// Scene images are resolved at runtime from the paired-page manifest.
includeDirectory('assets/daynight');
includeDirectory('assets/comments');
for(const variants of config.window.LETTER_CONFIG.imagesByPosition)for(const name of variants)files.add('assets/'+name);
let bytes=0;for(const file of files){const full=path.join(root,file);if(!fs.existsSync(full)){missing.add(file);continue}const size=fs.statSync(full).size;bytes+=size;if(size>100*1024*1024)missing.add('Git file exceeds 100 MiB: '+file)}
const report={static:true,files:files.size,megabytes:Math.round(bytes/1e6),withinPagesSize:bytes<1e9,missing:[...missing]};
console.log(JSON.stringify(report,null,2));
if(missing.size||bytes>=1e9)process.exitCode=1;
module.exports={files,report};
