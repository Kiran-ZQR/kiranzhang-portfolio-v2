/* Reference-based visual reconstruction. Dimensions are inferred, in metres. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s), host=$('#viewport'), fallback=$('#fallback');
  if(!window.THREE){fallback.textContent='3D 渲染库未能加载，请刷新页面。';return;}
  const T=window.THREE;let renderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:false});}catch{fallback.textContent='当前浏览器无法启用 WebGL，请换用支持硬件加速的浏览器查看模型。';return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;host.append(renderer.domElement);
  const scene=new T.Scene(),model=new T.Group();model.name='Reference hand loom';scene.add(model);
  const camera=new T.PerspectiveCamera(36,1,.05,40), target=new T.Vector3(0,1.12,0);
  scene.add(new T.HemisphereLight(0xfffdf4,0xa9ad96,2.5));
  const sun=new T.DirectionalLight(0xfff6e5,3);sun.position.set(-3,6,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-3,right:3,top:4,bottom:-3,near:.5,far:15});sun.shadow.bias=-.0003;sun.shadow.normalBias=.02;scene.add(sun);
  const fill=new T.DirectionalLight(0xe1eaff,1.3);fill.position.set(4,3,-4);scene.add(fill);
  const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.16}));floor.rotation.x=-Math.PI/2;floor.position.y=-.025;floor.receiveShadow=true;scene.add(floor);
  function texture(kind){const c=document.createElement('canvas');c.width=c.height=256;const p=c.getContext('2d');p.fillStyle=kind==='wood'?'#bd8b51':'#e9e1ca';p.fillRect(0,0,256,256);let seed=31;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
    if(kind==='wood'){for(let i=0;i<430;i++){p.strokeStyle=`rgba(${rand()>.5?'78,43,15':'248,221,168'},${.035+rand()*.1})`;p.lineWidth=.3+rand();const x=rand()*256;p.beginPath();p.moveTo(x,0);p.bezierCurveTo(x+rand()*8,85,x-rand()*8,170,x+rand()*4,256);p.stroke();}}
    else{for(let i=0;i<256;i+=3){p.fillStyle=i%2?'#c6bca350':'#fffdf860';p.fillRect(i,0,1,256);p.fillRect(0,i,256,1);}}
    const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;return tex;}
  const wood=new T.MeshStandardMaterial({color:0xe2be86,map:texture('wood'),roughness:.66});
  const darkwood=new T.MeshStandardMaterial({color:0x86603d,map:wood.map,roughness:.74});
  const linen=new T.MeshStandardMaterial({color:0xf6ecd3,map:texture('linen'),roughness:1,side:T.DoubleSide});
  const iron=new T.MeshStandardMaterial({color:0x655e50,metalness:.55,roughness:.5});
  const yarn=new T.MeshStandardMaterial({color:0xe2d6b7,roughness:1});
  function group(name){const g=new T.Group();g.name=name;model.add(g);return g;}
  const frame=group('01 - Timber frame'), shafts=group('02 - Heddle shafts'), beater=group('03 - Reed and beater'), warp=group('04 - Warp threads'), rollers=group('05 - Warp and cloth beams'), cloth=group('06 - Woven linen'), pedals=group('07 - Treadles'), crank=group('08 - Hand crank');
  function mesh(g,geometry,material,name,pos){const m=new T.Mesh(geometry,material);m.name=name;m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
  function box(g,name,pos,size,mat=wood){return mesh(g,new T.BoxGeometry(...size),mat,name,pos);}
  function rod(g,name,a,b,r,mat=yarn,sides=8){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);const m=mesh(g,new T.CylinderGeometry(r,r,d.length(),sides),mat,name,av.add(bv).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
  // Tall rear and front uprights, low rails and long overhead beams.
  for(const x of [-.85,.85]){
    for(const z of [-.73,.66])box(frame,'Upright',[x,1.17,z],[.105,2.34,.12]);
    box(frame,'Side top rail',[x,2.22,-.04],[.12,.16,1.86]);
    box(frame,'Side foot rail',[x,.1,-.03],[.13,.16,1.66]);
    box(frame,'Side waist rail',[x,.86,-.01],[.09,.12,1.52]);
    box(frame,'Breast beam support',[x,1.07,.89],[.09,.16,.62]);
    rod(frame,'Diagonal brace',[x,.25,-.66],[x,.86,-.13],.026,darkwood);
  }
  for(const z of [-.73,.66]){box(frame,'Top cross beam',[0,2.21,z],[1.82,.15,.12]);box(frame,'Lower cross beam',[0,.14,z],[1.8,.12,.11]);}
  // Joinery pins are visible on the faces of the upright timber.
  for(const x of [-.85,.85])for(const y of [.14,.85,2.21])for(const z of [-.8,.73])rod(frame,'Timber joint peg',[x,y,z-.012],[x,y,z+.012],.017,darkwood,12);
  for(const z of [-.57,-.37,-.17,.03]){
    box(shafts,'Shaft upper bar',[0,1.71,z],[1.42,.035,.03]);box(shafts,'Shaft lower bar',[0,1.08,z],[1.42,.035,.03]);
    for(const x of [-.7,.7])box(shafts,'Shaft stile',[x,1.395,z],[.025,.66,.025]);
    for(let n=0;n<32;n++){const x=-.66+n*1.32/31;rod(shafts,'Heddle',[x,1.1,z],[x,1.69,z],.0015,yarn,4);}
    for(const x of [-.55,.55])rod(shafts,'Suspension cord',[x,1.73,z],[x,2.16,z],.003,yarn);
  }
  // Swinging beater and densely spaced reed dents.
  for(const x of [-.74,.74])box(beater,'Beater sword',[x,1.59,.38],[.04,1.13,.055]);
  for(const y of [1.07,1.5])box(beater,'Reed rail',[0,y,.38],[1.53,.055,.065]);
  for(let n=0;n<95;n++){let x=-.7+n*1.4/94;rod(beater,'Reed dent',[x,1.1,.38],[x,1.47,.38],.0018,iron,4);}
  // Cylinders run across the width of the loom (the X axis).
  rod(rollers,'Back warp beam',[-.93,1.23,-.76],[.93,1.23,-.76],.095,wood,32);
  rod(rollers,'Front breast beam',[-1,1.16,.87],[1,1.16,.87],.07,wood,32);
  rod(rollers,'Cloth roller',[-.91,.88,.72],[.91,.88,.72],.084,wood,32);
  rod(cloth,'Rolled linen',[-.66,.88,.72],[.66,.88,.72],.102,linen,48);
  for(let i=0;i<100;i++){const x=-.65+i*1.3/99;const y=1.27+(i%2? .07:-.07);rod(warp,'Warp rear',[x,1.26,-.78],[x,y,-.16],.0018,yarn,4);rod(warp,'Warp forward',[x,y,-.16],[x,1.185,.61],.0018,yarn,4);}
  // A continuous cloth drapes over the front breast beam toward the cloth roller.
  const verts=[],norms=[],uv=[],idx=[];const path=[[.57,1.185],[.81,1.185],[.87,1.17],[.90,1.12],[.89,1.04],[.82,.9],[.72,.88]];
  path.forEach(([z,y],j)=>{for(const x of [-.66,.66]){verts.push(x,y,z);uv.push(x<0?0:1,j/(path.length-1));}if(j<path.length-1){const a=j*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}});
  const cg=new T.BufferGeometry();cg.setAttribute('position',new T.Float32BufferAttribute(verts,3));cg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));cg.setIndex(idx);cg.computeVertexNormals();mesh(cloth,cg,linen,'Continuous woven cloth',[0,0,0]);
  // Four independent treadles and tie-up cords.
  rod(pedals,'Treadle pivot',[-.65,.16,-.38],[.65,.16,-.38],.018,iron);
  for(let i=0;i<4;i++){const x=(i-1.5)*.17;const m=box(pedals,'Treadle '+(i+1),[x,.15,.13],[.105,.04,1.12]);m.rotation.x=.075;rod(pedals,'Tie up '+i,[x,.18,-.12],[x,1.08,-.57+i*.2],.0025,yarn);}
  // Side wheel, metal axle, offset wooden crank handle.
  rod(crank,'Axle',[.82,1.23,-.76],[1.05,1.23,-.76],.027,iron,16);
  const wheel=mesh(crank,new T.TorusGeometry(.15,.016,8,40),wood,'Crank wheel',[1.01,1.23,-.76]);wheel.rotation.y=Math.PI/2;
  for(let i=0;i<6;i++){const a=i*Math.PI/3;rod(crank,'Wheel spoke',[1.01,1.23,-.76],[1.01,1.23+Math.cos(a)*.145,-.76+Math.sin(a)*.145],.009,darkwood);}
  rod(crank,'Crank arm',[1.05,1.23,-.76],[1.05,1.03,-.66],.023,wood);
  rod(crank,'Hand grip',[1.05,1.03,-.66],[1.23,1.03,-.66],.028,darkwood,16);
  // Small shuttle rests on the new cloth.
  const shuttle=mesh(cloth,new T.SphereGeometry(1,20,12),darkwood,'Shuttle',[.12,1.205,.67]);shuttle.scale.set(.21,.02,.045);
  // The game reuses the exact preview geometry but owns its camera and input.
  if(document.body.dataset.loomMode==='guided'){
    window.LoomScene={scene,model,camera,renderer,target,crank,cloth,beater,pedals,linen};
    fallback.hidden=true;return;
  }
  let yaw=.65,pitch=1.25,distance=5.8,auto=false,raf=0,last=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function draw(){const fitted=distance*Math.max(1,1.06/camera.aspect);camera.position.set(target.x+fitted*Math.sin(pitch)*Math.sin(yaw),target.y+fitted*Math.cos(pitch),target.z+fitted*Math.sin(pitch)*Math.cos(yaw));camera.lookAt(target);renderer.render(scene,camera);}
  function resize(){const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();draw();}new ResizeObserver(resize).observe(host);
  function clearView(){document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false'));}
  function zoom(factor){distance=T.MathUtils.clamp(distance*factor,3.1,10);draw();}
  function setView(v){const views={perspective:[.65,1.25],front:[0,Math.PI/2],side:[Math.PI/2,Math.PI/2],back:[Math.PI,Math.PI/2],top:[0,.04]};[yaw,pitch]=views[v];distance=5.8;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===v)));auto=false;$('#rotate').setAttribute('aria-pressed','false');draw();}
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));$('#reset').onclick=()=>setView('perspective');$('#zoom-in').onclick=()=>zoom(.88);$('#zoom-out').onclick=()=>zoom(1.14);
  $('#threads').onclick=()=>{warp.visible=!warp.visible;$('#threads').setAttribute('aria-pressed',String(warp.visible));$('#threads').textContent='经线：'+(warp.visible?'显示':'隐藏');draw();};
  $('#rotate').onclick=()=>{auto=!auto;$('#rotate').setAttribute('aria-pressed',String(auto));};
  const pointers=new Map();let pinch=0;
  host.addEventListener('pointerdown',e=>{host.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});pinch=0;auto=false;$('#rotate').setAttribute('aria-pressed','false');});
  host.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){yaw-=(e.clientX-prev.x)*.008;pitch=T.MathUtils.clamp(pitch-(e.clientY-prev.y)*.006,.06,2.55);clearView();draw();}else{const [a,b]=[...pointers.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch>0&&d>0)zoom(pinch/d);pinch=d;}});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])host.addEventListener(event,e=>{pointers.delete(e.pointerId);pinch=0;});
  host.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(e.deltaY*.001));},{passive:false});
  host.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key))return;e.preventDefault();if(e.key==='+')zoom(.9);else if(e.key==='-')zoom(1.1);else{yaw+=(e.key==='ArrowLeft'?.1:e.key==='ArrowRight'?-.1:0);pitch=T.MathUtils.clamp(pitch+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0),.06,2.55);clearView();draw();}});
  function animate(t){if(auto&&!document.hidden){yaw+=Math.min(t-last,50)*.00018;clearView();draw();}last=t;raf=requestAnimationFrame(animate);}document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);if(!document.hidden){last=performance.now();raf=requestAnimationFrame(animate);}});
  // Standard GLB 2.0 with named component hierarchy. Geometry is real mesh data,
  // materials use portable base colours; procedural preview textures are not exported.
  function exportGLB(){model.updateMatrixWorld(true);const chunks=[],views=[],accessors=[],nodes=[],meshes=[],materials=[],matMap=new Map();let offset=0;
    function data(array,targetType){const bytes=new Uint8Array(array.buffer,array.byteOffset,array.byteLength);const padded=new Uint8Array(Math.ceil(bytes.length/4)*4);padded.set(bytes);chunks.push(padded);views.push({buffer:0,byteOffset:offset,byteLength:bytes.length,target:targetType});offset+=padded.length;return views.length-1;}
    function attr(a,type){const accessor={bufferView:data(a.array,34962),componentType:5126,count:a.count,type};if(type==='VEC3'){accessor.min=[Infinity,Infinity,Infinity];accessor.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<a.count;i++)for(let k=0;k<3;k++){const v=a.array[i*3+k];accessor.min[k]=Math.min(accessor.min[k],v);accessor.max[k]=Math.max(accessor.max[k],v);}}accessors.push(accessor);return accessors.length-1;}
    function material(m){if(matMap.has(m))return matMap.get(m);const i=materials.length;materials.push({name:m===wood?'Honey oak':m===linen?'Natural linen':m===yarn?'Warp cotton':'Loom material',pbrMetallicRoughness:{baseColorFactor:[m.color.r,m.color.g,m.color.b,1],metallicFactor:m.metalness||0,roughnessFactor:m.roughness||1},doubleSided:m.side===T.DoubleSide});matMap.set(m,i);return i;}
    function visit(obj){const ni=nodes.length,node={name:obj.name||'Part',matrix:obj.matrix.toArray()};nodes.push(node);if(obj.isMesh){const g=obj.geometry,attributes={POSITION:attr(g.attributes.position,'VEC3'),NORMAL:attr(g.attributes.normal,'VEC3')};const primitive={attributes,material:material(obj.material)};if(g.index){const a=g.index.array;accessors.push({bufferView:data(a,34963),componentType:a instanceof Uint32Array?5125:5123,count:a.length,type:'SCALAR'});primitive.indices=accessors.length-1;}node.mesh=meshes.length;meshes.push({name:obj.name,primitives:[primitive]});}if(obj.children.length)node.children=obj.children.map(visit);return ni;}visit(model);
    const doc={asset:{version:'2.0',generator:'Kiran portfolio - reference loom reconstruction'},scene:0,scenes:[{nodes:[0]}],nodes,meshes,materials,buffers:[{byteLength:offset}],bufferViews:views,accessors};const json=new TextEncoder().encode(JSON.stringify(doc)),jl=Math.ceil(json.length/4)*4;const out=new ArrayBuffer(12+8+jl+8+offset),v=new DataView(out),bytes=new Uint8Array(out);v.setUint32(0,0x46546c67,true);v.setUint32(4,2,true);v.setUint32(8,out.byteLength,true);v.setUint32(12,jl,true);v.setUint32(16,0x4e4f534a,true);bytes.fill(32,20,20+jl);bytes.set(json,20);v.setUint32(20+jl,offset,true);v.setUint32(24+jl,0x004e4942,true);let pos=28+jl;for(const c of chunks){bytes.set(c,pos);pos+=c.length;}return out;
  }
  $('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([exportGLB()],{type:'model/gltf-binary'})),a=document.createElement('a');a.href=url;a.download='hand-loom-reference.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);$('#status').textContent='已生成 GLB 模型（含独立部件和基础材质；尺寸为推定，非工程复刻）。';};
  window.loomPreview={model,exportGLB,renderer,camera};fallback.hidden=true;resize();raf=requestAnimationFrame(animate);
})();
