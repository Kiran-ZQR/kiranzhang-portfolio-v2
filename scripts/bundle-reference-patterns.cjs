const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
fs.writeFileSync(path.join(root,'assets/js/element-reference-data.js'),'window.ElementReferenceSource='+JSON.stringify('data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/elements-v2/layout-reference.png')).toString('base64'))+';\n');
