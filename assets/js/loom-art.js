/* Sculptural loom additions. Geometry is built once; angle drives every moving part. */
(() => {
  const api=window.LoomScene,T=window.THREE;if(!api||!T)return;
  const {model}=api;model.scale.set(.78,1.12,.84);
  // Round existing timber edges while retaining each member's original dimensions.
  model.traverse(part=>{if(!part.isMesh||part.geometry.type!=='BoxGeometry')return;const {width:w,height:h,depth:d}=part.geometry.parameters;const radius=Math.min(w,h,d)*.12;const shape=new T.Shape();shape.moveTo(-w/2,-h/2);shape.lineTo(w/2,-h/2);shape.lineTo(w/2,h/2);shape.lineTo(-w/2,h/2);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:Math.max(.001,d-2*radius),bevelEnabled:true,bevelThickness:radius,bevelSize:radius,bevelSegments:2,steps:1});geo.translate(0,0,-d/2+radius);part.geometry=geo;});
  const assembly=new T.Group();assembly.name='09 - Five yarn supplies';model.add(assembly);
  const chrome=new T.MeshStandardMaterial({color:'#dde7e7',metalness:.8,roughness:.25});
  const cream=new T.MeshStandardMaterial({color:'#fff7dc',roughness:.6});
  const colors=['#138b88','#f35a24','#eccb31','#e82578','#14a6bf'];
  const spools=[],feeds=[];
  function cylinder(parent,r,length,mat){const m=new T.Mesh(new T.CylinderGeometry(r,r,length,32),mat);m.rotation.z=Math.PI/2;parent.add(m);m.castShadow=true;return m;}
  // Exactly five supplies: three on the left, two on the right.
  const positions=[[-1.72,2.05,.1],[-1.72,1.35,.1],[-1.72,.65,.1],[1.72,1.95,.1],[1.72,1.02,.1]];
  positions.forEach((pos,i)=>{
    const spool=new T.Group();spool.name='Supply spool '+(i+1);spool.position.set(...pos);assembly.add(spool);spools.push(spool);
    const mat=new T.MeshStandardMaterial({color:colors[i],roughness:.8});
    cylinder(spool,.13,.25,mat);for(const x of [-.15,.15]){const cap=cylinder(spool,.17,.027,cream);cap.position.x=x;}
    cylinder(spool,.025,.43,chrome);
    for(let j=0;j<23;j++){const ring=new T.Mesh(new T.TorusGeometry(.132,.003,4,32),mat);ring.rotation.y=Math.PI/2;ring.position.x=-.12+j*.011;spool.add(ring);}
    // A visible winding seam makes rotation perceptible even on a circular bobbin.
    const seam=new T.Mesh(new T.BoxGeometry(.25,.006,.006),cream);seam.position.y=.133;spool.add(seam);
    const end=new T.Vector3((i-2)*.23,1.36,-.16);
    const curve=new T.CatmullRomCurve3([new T.Vector3(...pos),new T.Vector3(pos[0]*.8,pos[1]-.05,.12),new T.Vector3(pos[0]*.42,1.6,-.03),end]);
    const thread=new T.Mesh(new T.TubeGeometry(curve,48,.005,5,false),mat);thread.name='Feed thread '+(i+1);assembly.add(thread);
    const markers=[];for(let n=0;n<3;n++){const marker=new T.Mesh(new T.SphereGeometry(.016,8,6),mat);assembly.add(marker);markers.push(marker);}
    feeds.push({curve,markers});
  });
  // Machined collars and fasteners add depth without changing the original mechanics.
  for(const x of [-.85,.85])for(const y of [.17,1.1,2.21]){
    const collar=new T.Mesh(new T.BoxGeometry(.125,.025,.145),chrome);collar.position.set(x,y,.66);model.add(collar);
    const bolt=new T.Mesh(new T.SphereGeometry(.018,10,8),chrome);bolt.position.set(x,y,.746);model.add(bolt);
  }
  const shafts=model.getObjectByName('02 - Heddle shafts');
  api.art={spools,feeds,update(angle){spools.forEach((s,i)=>s.rotation.x=angle*(i%2?-1:1));feeds.forEach(({curve,markers},i)=>markers.forEach((m,n)=>m.position.copy(curve.getPoint(((angle/(Math.PI*2)+n/3+i*.07)%1+1)%1))));if(shafts)shafts.position.y=Math.sin(angle*4)*.012;}};
  api.art.update(0);
})();
