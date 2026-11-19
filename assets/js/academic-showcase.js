/* Project-specific presentation meshes, built from the portfolio's original boards. */
(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion:reduce)'), fine=matchMedia('(hover:hover) and (pointer:fine)');
  const loadThree=()=> window.THREE ? Promise.resolve(window.THREE) : (window.kiranThreePromise ||= new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src='assets/vendor/three-0.160.1.min.js';s.onload=()=>window.THREE?resolve(window.THREE):reject(new Error('3D unavailable'));s.onerror=reject;document.head.append(s);
  }));
  document.querySelectorAll('.academic-showcase').forEach(host=>{
    const stage=host.querySelector('.academic-stage');let api,loading=false,hovered=false,pinned=false,expanded=false,inView=false,disposed=false;
    const update=()=>{expanded=hovered||pinned;host.classList.toggle('is-expanded',expanded);host.setAttribute('aria-expanded',String(expanded));api?.update(expanded)};
    host.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&fine.matches){hovered=true;update()}});
    host.addEventListener('pointerleave',()=>{hovered=false;update()});
    host.addEventListener('click',e=>{if(e.pointerType==='mouse'&&fine.matches)return;pinned=!pinned;update()});
    host.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pinned=!expanded;hovered=false;update()}if(e.key==='Escape'){pinned=hovered=false;update()}});
    reduced.addEventListener('change',()=>api?.wake());
    async function initialize(){
      if(loading||api||disposed)return;loading=true;
      try{const T=await loadThree();if(disposed)return;api=await createScene(T);await api.ready;if(disposed)return;api.visible(inView);api.prime();host.dataset.renderer='ready';update()}
      catch{host.dataset.renderer='fallback';api?.dispose();api=null}
    }
    async function createScene(T){
      const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
      let frame=0,visible=false,sizeDirty=true,w=0,h=0,open=expanded?1:0,target=open,velocity=0,previous=0;
      const scene=new T.Scene(),camera=new T.PerspectiveCamera(10.8617361253,1,.1,100);camera.position.set(0,0,12);
      scene.add(new T.HemisphereLight(0xffffff,0x394452,2.5));for(const [x,y,z,power] of [[-4,6,7,4],[5,1,-4,3]]){let l=new T.DirectionalLight(0xffffff,power);l.position.set(x,y,z);scene.add(l)}
      const presentation=await import('../vendor/mockup-runtime.js?v=20261119');
      const environment=presentation.studio(renderer,scene);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;
      const rig=new T.Group();scene.add(rig);const geometries=[],materials=[],textures=[],pending=[];
      const mat=(options)=>{const m=new T.MeshStandardMaterial(options);materials.push(m);return m};
      const silver=mat({color:0xb5bcc5,metalness:.8,roughness:.27}),white=mat({color:0xe8ebe9,metalness:.12,roughness:.32}),fabric=mat({color:0x7d858c,roughness:.92}),black=mat({color:0x0a0d13,metalness:.6,roughness:.2});
      function mesh(g,m,parent=rig){geometries.push(g);const o=new T.Mesh(g,m);parent.add(o);return o}
      function round(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
      function solid(w,h,d,r,m,parent){const g=new T.ExtrudeGeometry(round(w,h,r),{depth:d,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,steps:1,curveSegments:18});g.translate(0,0,-d/2);return mesh(g,m,parent)}
      function texture(src,topFraction=1){let yes,no;pending.push(new Promise((a,b)=>{yes=a;no=b}));const t=new T.TextureLoader().load(src,()=>{yes();wake()},undefined,no);t.colorSpace=T.SRGBColorSpace;if(typeof topFraction==='object'){const c=topFraction;t.repeat.set(c.w,c.h);t.offset.set(c.x,1-c.y-c.h)}else{t.repeat.y=topFraction;t.offset.y=1-topFraction;}t.userData.gltfCrop=typeof topFraction==='object'?topFraction:{x:0,y:0,w:1,h:topFraction};textures.push(t);return t}
      function panel(src,w,h,parent,topFraction=1){const g=new T.Group();parent.add(g);solid(w+.10,h+.10,.13,.15,silver,g);const bezel=solid(w+.055,h+.055,.025,.13,black,g);bezel.position.z=.08;const geometry=new T.ShapeGeometry(round(w,h,.12),20),pos=geometry.attributes.position,uv=geometry.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/w+.5,pos.getY(i)/h+.5);const material=new T.MeshBasicMaterial({map:texture(src,topFraction),toneMapped:false});materials.push(material);const display=mesh(geometry,material,g);display.position.z=.15;return g}
      const laptop=await presentation.device('laptop',{width:5.55,map:texture('assets/academic/profiled-board.reading.webp',{x:.23,y:.005,w:.29,h:.115})});rig.add(laptop);
      const phone=await presentation.device('phone',{height:1.95,map:texture('assets/academic/ar-nature-board.reading.webp',{x:.595,y:.531,w:.060,h:.094}),finish:0x71847c});rig.add(phone);
      const phoneRear=await presentation.device('phone',{height:1.85,finish:0x98b1a6});rig.add(phoneRear);
      const tablet=panel('assets/academic/lead-me-01.reading.webp',2.12,2.96,rig,{x:.025,y:.607,w:.215,h:.387});
      const cameraDot=mesh(new T.CircleGeometry(.035,16),black,tablet);cameraDot.position.set(0,1.45,.18);
      tablet.scale.setScalar(1.10);
      const back=new T.Group();tablet.add(back);back.rotation.y=Math.PI;
      const cameraPlate=solid(.32,.48,.06,.10,black,back);cameraPlate.position.set(.83,-1.18,.12);
      for(const y of [-1.07,-1.29]){const lens=mesh(new T.CircleGeometry(.078,20),black,back);lens.position.set(.83,y,.165)}
      const vision=await presentation.device('vision',{width:2.65});rig.add(vision);const visionScale=vision.scale.x;
      stage.append(renderer.domElement);
      const resize=new ResizeObserver(()=>{sizeDirty=true;wake()});resize.observe(stage);
      function draw(now){frame=0;if(!visible||document.hidden)return;
        if(sizeDirty){const nw=stage.clientWidth,nh=stage.clientHeight;if(!nw||!nh)return;if(nw!==w||nh!==h){w=nw;h=nh;renderer.setSize(w,h,false);camera.aspect=w/h}sizeDirty=false}
        const dt=Math.min((now-(previous||now))/1000,.05);previous=now;
        if(reduced.matches){open=target;velocity=0}else for(let t=0;t<dt;t+=1/120){let d=Math.min(1/120,dt-t);velocity+=((target-open)*180-velocity*19)*d;open+=velocity*d}
        const p=Math.max(0,Math.min(1.08,open));
        // Fixed reference-poster composition in a 610 × 395 product-crop coordinate space.
        // Hover changes the framing, never redistributes the devices into a new arrangement.
        rig.rotation.set(0,0,0);
        const poster=(object,x,y,z)=>{const span=2*(12-z)*Math.tan(camera.fov*Math.PI/360);object.position.set((x/610-.5)*span*(610/395),(.5-y/395)*span,z)};
        laptop.position.set(-.6347195863,-.4043121550,-20.0974227606);laptop.rotation.set(.537608172,-.790030050,.569517507);
        tablet.position.set(-3.0633529008,-1.5940745461,-23.7326957412);tablet.rotation.set(-2.3856920533901773,0.3788635241589102,1.2869312188456223);
        poster(phone,520,218,-14.0);phone.rotation.set(.02,-.25,.10);
        poster(phoneRear,545,228,-15.5);phoneRear.rotation.set(.05,Math.PI+.28,-.12);
        poster(vision,133,155,-18.0);vision.rotation.set(.08,-.15,-.12);vision.scale.setScalar(visionScale);
        camera.zoom=Math.min(1,camera.aspect/(610/395))*(.82+.20*p);camera.lookAt(0,0,0);camera.updateProjectionMatrix();renderer.render(scene,camera);
        if(Math.abs(target-open)>.0005||Math.abs(velocity)>.002)wake();
      }
      function wake(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw)}
      const visibility=()=>{previous=0;wake()};document.addEventListener('visibilitychange',visibility);
      renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.dataset.renderer='fallback';visible=false});renderer.domElement.addEventListener('webglcontextrestored',()=>{host.dataset.renderer='ready';visible=inView;wake()});
      return{ready:Promise.all(pending),wake,prime(){if(frame)cancelAnimationFrame(frame);frame=0;draw(performance.now())},update(value){target=value?1:0;wake()},visible(value){visible=value;previous=0;if(!value&&frame){cancelAnimationFrame(frame);frame=0}else wake()},dispose(){if(frame)cancelAnimationFrame(frame);resize.disconnect();environment.dispose();document.removeEventListener('visibilitychange',visibility);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose()}};
    }
    const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)initialize();api?.visible(inView)},{rootMargin:'150px 0px'});observer.observe(host);
    addEventListener('pagehide',e=>{if(!e.persisted){disposed=true;observer.disconnect();api?.dispose()}});
  });
})();
