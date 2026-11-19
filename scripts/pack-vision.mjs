import fs from 'node:fs';
import path from 'node:path';
export function packVision(directory){
  const json=JSON.parse(fs.readFileSync(path.join(directory,'scene.gltf'))),chunks=[];let length=0;
  const add=bytes=>{const start=length,pad=(4-bytes.length%4)%4;chunks.push(bytes,Buffer.alloc(pad));length+=bytes.length+pad;return start};
  for(const buffer of json.buffers){const offset=add(fs.readFileSync(path.join(directory,buffer.uri)));for(const view of json.bufferViews)if(view.buffer===json.buffers.indexOf(buffer)){view.byteOffset=(view.byteOffset||0)+offset;view.buffer=0}}
  for(const image of json.images){const bytes=fs.readFileSync(path.join(directory,image.uri));const offset=add(bytes);image.bufferView=json.bufferViews.length;image.mimeType=/\.png$/i.test(image.uri)?'image/png':'image/jpeg';delete image.uri;json.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length})}
  json.buffers=[{byteLength:length}];const raw=Buffer.from(JSON.stringify(json)),encoded=Buffer.concat([raw,Buffer.alloc((4-raw.length%4)%4,32)]),binary=Buffer.concat(chunks),header=Buffer.alloc(20),binHeader=Buffer.alloc(8);
  header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+encoded.length+binary.length,8);header.writeUInt32LE(encoded.length,12);header.writeUInt32LE(0x4e4f534a,16);binHeader.writeUInt32LE(binary.length,0);binHeader.writeUInt32LE(0x004e4942,4);return Buffer.concat([header,encoded,binHeader,binary]);
}
