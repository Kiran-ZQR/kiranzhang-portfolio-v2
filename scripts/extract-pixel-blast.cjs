// Mechanical extraction of the user-supplied React Bits shader, without React dependencies.
const fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(process.argv[2],'utf8');
let fragment=source.match(/const FRAGMENT_SRC = `([\s\S]*?)`;/)?.[1];
if(!fragment)throw Error('Missing supplied shader');
fragment=fragment.replace('uniform vec3  uColor;','uniform vec3 uPalette[5];');
fragment=fragment.replace('vec3 color = uColor;',`float band = clamp((gl_FragCoord.x / uResolution.x + .12 * sin(uv.y * 4.0 + uTime * .12)) * 5.0, 0.0, 4.99);
  vec3 color = uPalette[0];
  if(band >= 1.0) color = uPalette[1];
  if(band >= 2.0) color = uPalette[2];
  if(band >= 3.0) color = uPalette[3];
  if(band >= 4.0) color = uPalette[4];`);
fs.writeFileSync(path.join(__dirname,'../assets/js/pixel-blast-shader.js'),'/* React Bits Pixel Blast shader supplied by the user; five-element palette adaptation.\n * https://reactbits.dev/backgrounds/pixel-blast\n * Original inspiration: zavalit/bayer-dithering-webgl-demo. */\nwindow.PixelBlastFragment='+JSON.stringify(fragment)+';\n');
