/* Reference-front mechanical loom. Original standalone model is retained untouched. */
(() => {
 const T=window.THREE,api=window.LoomScene;if(!api||!T)return;
 api.scene.remove(api.model);const model=new T.Group();model.name='Exhibition mechanical loom';api.scene.add(model);
 const mat=(color,metalness=0,roughness=.42)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const ivory=mat('#d8cfb9',.25),green=mat('#103f30',.25),red=mat('#c83222',.3),steel=mat('#d2d5d5',.9,.18),dark=mat('#393832',.7),wood=mat('#b7834b'),linen=mat('#f5ead1');linen.side=T.DoubleSide;
 const faces=Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=c.height=128;const p=c.getContext('2d');const g=p.createLinearGradient(0,0,128,128);g.addColorStop(0,'#fff');g.addColorStop(.35,'#ddd');g.addColorStop(.5,i%2?'#777':'#eee');g.addColorStop(.68,'#fff');g.addColorStop(1,'#bbb');p.fillStyle=g;p.fillRect(0,0,128,128);return c;});const environment=new T.CubeTexture(faces);environment.colorSpace=T.SRGBColorSpace;environment.needsUpdate=true;api.scene.environment=environment;api.environment=environment;
 const grain=document.createElement('canvas');grain.width=grain.height=128;const gc=grain.getContext('2d');gc.fillStyle='#e8c28d';gc.fillRect(0,0,128,128);for(let i=0;i<100;i++){gc.strokeStyle='rgba(91,51,20,.10)';gc.beginPath();gc.moveTo(0,i*1.3);gc.bezierCurveTo(40,i*1.3+Math.sin(i)*3,80,i*1.3-2,128,i*1.3);gc.stroke();}wood.map=new T.CanvasTexture(grain);wood.map.colorSpace=T.SRGBColorSpace;
 function group(name){const g=new T.Group();g.name=name;model.add(g);return g;}
 const frame=group('Ivory chassis'),shafts=group('Heddles'),beater=group('Reed'),cloth=group('Fabric'),pedals=group('Treadles'),crank=group('Crank'),supplies=group('Five supply bobbins');
 function mesh(g,geo,m,pos){const o=new T.Mesh(geo,m);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function box(g,p,s,m){const [w,h,d]=s,r=Math.min(w,h,d)*.12;const shape=new T.Shape();shape.moveTo(-w/2+r,-h/2+r);shape.lineTo(w/2-r,-h/2+r);shape.lineTo(w/2-r,h/2-r);shape.lineTo(-w/2+r,h/2-r);shape.closePath();const geometry=new T.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:3,steps:1});geometry.translate(0,0,-d/2+r);return mesh(g,geometry,m,p);}
 function rod(g,a,b,r,m){const start=new T.Vector3(...a),end=new T.Vector3(...b),d=end.clone().sub(start);const o=mesh(g,new T.CylinderGeometry(r,r,d.length(),24),m,start.add(end).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
 function bolt(g,x,y,z){rod(g,[x,y,z],[x,y,z+.025],.016,steel);rod(g,[x,y,z+.025],[x,y,z+.03],.007,dark);}
 function bracket(g,x,y,z){box(g,[x,y,z],[.10,.10,.09],red);bolt(g,x,y,z+.046);}
 function gear(x,y,z,r){const g=new T.Group();g.position.set(x,y,z);frame.add(g);rod(g,[-.025,0,0],[.025,0,0],r,dark);for(let i=0;i<20;i++){const a=i*Math.PI/10;const tooth=box(g,[0,Math.cos(a)*r,Math.sin(a)*r],[.065,.03,.025],steel);tooth.rotation.x=a;}rod(g,[-.04,0,0],[.04,0,0],r*.38,steel);return g;}
 for(const x of [-.77,.77]){
   for(const z of [-.4,.7]){box(frame,[x,1.46,z],[.065,2.28,.09],ivory);box(frame,[x,.31,z],[.13,.065,.2],dark);}
   box(frame,[x,.42,.18],[.085,.08,1.25],ivory);box(frame,[x,1.36,.18],[.075,.08,1.3],wood);
   rod(frame,[x,.56,.65],[x,2.5,-.4],.019,steel);
   for(const y of [.5,1.35,1.95,2.57]){bracket(frame,x,y,.7);bolt(frame,x,y,-.34);}
   rod(frame,[x,1.6,.66],[x,2.67,.66],.009,steel);
 }
 box(frame,[0,2.51,.08],[1.58,.13,.10],green);
 rod(frame,[-.85,2.69,.07],[.85,2.69,.07],.026,wood);
 box(frame,[0,1.53,.79],[1.64,.065,.075],green);
 box(frame,[0,.48,.64],[1.63,.065,.095],ivory);
 for(const y of [2.27,1.95]){box(shafts,[0,y,.10],[1.25,.07,.07],wood);for(const x of [-.61,.61])bracket(shafts,x,y,.1);}
 for(let i=0;i<58;i++){const x=-.59+i*1.18/57;rod(shafts,[x,1.72,.12],[x,2.24,.12],.0027,steel);rod(shafts,[x,2.25,.10],[x,2.30,.10],.006,dark);}
 for(const y of [1.62,1.79]){rod(beater,[-.7,y,.45],[.7,y,.45],.023,wood);for(const x of [-.69,.69])bracket(beater,x,y,.45);}
 for(let i=0;i<100;i++){const x=-.61+i*1.22/99;rod(beater,[x,1.62,.45],[x,1.79,.45],.0018,steel);rod(frame,[x,1.76,.1],[x,1.46,.94],.0018,linen);}
 for(const y of [1.05,1.38]){rod(frame,[-.93,y,.75],[.93,y,.75],.036,steel);rod(frame,[-.66,y,.75],[.66,y,.75],y===1.05?.12:.044,wood);for(const x of [-.84,.84]){gear(x,y,.75,.095);bracket(frame,x,y,.75);}}
 rod(cloth,[-.64,1.05,.75],[.64,1.05,.75],.125,linen);
 for(let i=0;i<110;i++){const ring=mesh(cloth,new T.TorusGeometry(.126,.002,4,24),linen,[-.64+i*1.28/109,1.05,.75]);ring.rotation.y=Math.PI/2;}
 const base=mesh(cloth,new T.PlaneGeometry(1.22,1.8),linen,[0,.55,.95]);base.name='Continuous woven cloth';
 const spools=[],feeds=[],colours=['#4d7075','#c9302b','#ac8b40','#c83c9d','#91d6df'];
 const positions=[[-1.83,1.61,.40],[-1.52,1.61,.40],[-1.21,1.61,.40],[1.27,1.61,.40],[1.60,1.61,.40]];
 for(const [x,w] of [[-1.53,.98],[1.43,.75]]){box(supplies,[x,1.33,.4],[w,.05,.24],wood);for(const dx of [-w*.38,w*.38]){rod(supplies,[x+dx,.5,.4],[x+dx,1.31,.4],.016,steel);rod(supplies,[x+dx,.48,.4],[x+dx,.53,.4],.038,steel);bolt(supplies,x+dx,1.33,.53);}}
 positions.forEach((p,i)=>{const g=new T.Group();g.name='Supply spool '+(i+1);g.position.set(...p);supplies.add(g);spools.push(g);const yarn=mat(colours[i],0,.95);
   rod(g,[0,-.25,0],[0,.25,0],.115,yarn);rod(g,[0,-.29,0],[0,.29,0],.044,wood);
   for(let j=0;j<55;j++){const r=mesh(g,new T.TorusGeometry(.116,.0028,4,32),yarn,[0,-.25+j*.0092,0]);r.rotation.x=Math.PI/2;}
   const seam=rod(g,[.114,-.24,0],[.114,.24,0],.003,linen);
   const end=new T.Vector3((i-2)*.23,1.53,.78);const curve=new T.CatmullRomCurve3([new T.Vector3(p[0],p[1]+.2,p[2]),new T.Vector3(p[0]*.72,1.56,.6),end]);mesh(supplies,new T.TubeGeometry(curve,32,.0027,4,false),yarn,[0,0,0]);const marker=mesh(supplies,new T.SphereGeometry(.009,6,5),yarn,[0,0,0]);feeds.push({curve,marker});
 });
 // Same legacy pivot coordinates are retained for the interaction controller.
 const c=[1.04,1.23,-.76];const wheel=mesh(crank,new T.TorusGeometry(.15,.015,12,64),steel,c);wheel.rotation.y=Math.PI/2;
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;rod(crank,c,[c[0],c[1]+Math.cos(a)*.14,c[2]+Math.sin(a)*.14],.011,steel);}
 rod(crank,[1.015,1.23,-.76],[1.085,1.23,-.76],.034,dark);rod(crank,[1.05,1.23,-.88],[1.24,1.23,-.88],.024,red);
 for(let j=0;j<5;j++){const ring=mesh(crank,new T.TorusGeometry(.024,.002,5,24),dark,[1.075+j*.03,1.23,-.88]);ring.rotation.y=Math.PI/2;}
 api.scene.children.filter(o=>o.isLight).forEach(o=>{o.intensity*=.75;});api.renderer.toneMappingExposure=1.05;
 api.scene.children.filter(o=>o.isMesh&&o.material?.type==='ShadowMaterial').forEach(o=>o.visible=false);
 Object.assign(api,{model,crank,cloth,beater,pedals,linen});
 api.art={spools,feeds,update(angle){spools.forEach((s,i)=>s.rotation.y=angle*(i%2?-1:1));feeds.forEach(({curve,marker},i)=>marker.position.copy(curve.getPoint(((angle/6.283+i*.13)%1+1)%1)));shafts.position.y=Math.sin(angle*4)*.009;}};
})();
