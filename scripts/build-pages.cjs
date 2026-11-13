/* Build only the audited public runtime. Originals and local preview profiles stay local. */
const fs=require('node:fs'),path=require('node:path');
const {files,report}=require('./audit-pages.cjs');
if(report.missing.length||!report.withinPagesSize)throw new Error('Publication blocked: fix audit errors before building.');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
if(fs.existsSync(out))throw new Error('dist already exists; inspect/archive that previous build before creating another.');
fs.mkdirSync(out);
for(const file of [...files,'.nojekyll']){const target=path.join(out,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target)}
console.log('Static Pages artifact ready:',out);
