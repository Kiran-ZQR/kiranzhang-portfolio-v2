const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
fs.writeFileSync(path.join(root,'assets/js/poster-reference-data.js'),'window.PosterReferenceSource='+JSON.stringify('data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/poster-reference.png')).toString('base64'))+';\n');
