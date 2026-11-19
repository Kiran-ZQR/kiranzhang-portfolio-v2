import {GLTFLoader} from './GLTFLoader.js';
import {MeshoptDecoder} from './meshopt_decoder.module.js';
const T=window.THREE,loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder),cache=new Map();
const defs={vision:{file:'vision-pro.glb',rotate:[0,-Math.PI/2,0],body:[]},phone:{file:'iphone-17-pro-max.glb',rotate:[0,Math.PI/2,0],screen:'screen.001',body:['basecolor.001','metalframe.002','backpanel.001','Material.005']},laptop:{file:'macbook-pro-16.glb',rotate:[0,0,0],screen:'sfCQkHOWyrsLmor',body:[]}};
export async function device(kind,{height,width,map,finish=0x89939e}={}){
  const d=defs[kind];if(!cache.has(kind))cache.set(kind,loader.loadAsync('assets/models/'+d.file));
  const gltf=await cache.get(kind),source=gltf.scene.clone(true),orient=new T.Group();orient.add(source);orient.rotation.set(...d.rotate);orient.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(orient),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
  orient.position.sub(center);const wrapper=new T.Group();wrapper.add(orient);wrapper.scale.setScalar(width?width/size.x:height/size.y);
  wrapper.updateMatrixWorld(true);
  source.traverse(o=>{if(!o.isMesh)return;const old=o.material;o.material=old.clone();o.castShadow=true;o.receiveShadow=true;
    if(old.name===d.screen&&map){
      // Replace the source atlas UV with an upright display-space UV for portfolio art.
      o.geometry=o.geometry.clone();const pos=o.geometry.attributes.position,box=new T.Box3().setFromObject(o),extent=box.getSize(new T.Vector3()),uv=new Float32Array(pos.count*2),v=new T.Vector3();
      for(let i=0;i<pos.count;i++){v.set(pos.getX(i),pos.getY(i),pos.getZ(i)).applyMatrix4(o.matrixWorld);uv[i*2]=(v.x-box.min.x)/extent.x;uv[i*2+1]=1-(v.y-box.min.y)/extent.y;}
      o.geometry.setAttribute('uv',new T.BufferAttribute(uv,2));const t=map.clone();t.flipY=false;if(map.userData.gltfCrop){const c=map.userData.gltfCrop;t.repeat.set(c.w,c.h);t.offset.set(c.x,c.y)}t.needsUpdate=true;o.material=new T.MeshBasicMaterial({map:t,toneMapped:false,side:old.side});}
    else if(d.body.includes(old.name)){o.material.color.setHex(finish);o.material.metalness=.94;o.material.roughness=.23;}
    else if(o.material.metalness>.3){o.material.envMapIntensity=1.1;o.material.roughness=Math.min(.52,Math.max(.17,o.material.roughness));}
    if(old.name==='glass.002'){o.material.transparent=true;o.material.opacity=.035;o.material.depthWrite=false;}
  });return wrapper;
}
export function studio(renderer,scene){
  const room=new T.Scene();room.add(new T.Mesh(new T.BoxGeometry(30,24,30),new T.MeshBasicMaterial({color:0x555c66,side:T.BackSide})));
  const patches=[[-6,5,6,6,10,0xffffff],[6,2,4,3,9,0xcbd9ee],[0,9,-1,9,4,0xffffff],[-2,-5,4,8,3,0x40464e]];
  patches.forEach(([x,y,z,w,h,color])=>{const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,0,0);room.add(p)});
  const generator=new T.PMREMGenerator(renderer);const target=generator.fromScene(room,.035,.1,60);scene.environment=target.texture;generator.dispose();room.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});return target;
}
