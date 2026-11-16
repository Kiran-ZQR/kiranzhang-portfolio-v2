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
      try{const T=await loadThree();if(disposed)return;api=createScene(T);await api.ready;if(disposed)return;api.visible(inView);api.prime();host.dataset.renderer='ready';update()}
      catch{host.dataset.renderer='fallback';api?.dispose();api=null}
    }
    function createScene(T){
      const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
      const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,40);camera.position.set(0,.15,12);
      scene.add(new T.HemisphereLight(0xffffff,0x394452,2.5));for(const [x,y,z,power] of [[-4,6,7,4],[5,1,-4,3]]){let l=new T.DirectionalLight(0xffffff,power);l.position.set(x,y,z);scene.add(l)}
      const rig=new T.Group();scene.add(rig);const geometries=[],materials=[],textures=[],pending=[];
      const mat=(options)=>{const m=new T.MeshStandardMaterial(options);materials.push(m);return m};
      const silver=mat({color:0xb5bcc5,metalness:.8,roughness:.27}),white=mat({color:0xe8ebe9,metalness:.12,roughness:.32}),fabric=mat({color:0x7d858c,roughness:.92}),black=mat({color:0x0a0d13,metalness:.6,roughness:.2});
      function mesh(g,m,parent=rig){geometries.push(g);const o=new T.Mesh(g,m);parent.add(o);return o}
      function round(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
      function solid(w,h,d,r,m,parent){const g=new T.ExtrudeGeometry(round(w,h,r),{depth:d,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,steps:1,curveSegments:18});g.translate(0,0,-d/2);return mesh(g,m,parent)}
      function texture(src,topFraction=1){let yes,no;pending.push(new Promise((a,b)=>{yes=a;no=b}));const t=new T.TextureLoader().load(src,()=>{yes();wake()},undefined,no);t.colorSpace=T.SRGBColorSpace;if(typeof topFraction==='object'){const c=topFraction;t.repeat.set(c.w,c.h);t.offset.set(c.x,1-c.y-c.h)}else{t.repeat.y=topFraction;t.offset.y=1-topFraction;}textures.push(t);return t}
      function panel(src,w,h,parent,topFraction=1){const g=new T.Group();parent.add(g);solid(w+.10,h+.10,.11,.15,silver,g);const geometry=new T.ShapeGeometry(round(w,h,.12),20),pos=geometry.attributes.position,uv=geometry.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/w+.5,pos.getY(i)/h+.5);const material=new T.MeshBasicMaterial({map:texture(src,topFraction),toneMapped:false});materials.push(material);const display=mesh(geometry,material,g);display.position.z=.09;return g}
      function headset(){
        const g=new T.Group();rig.add(g);solid(4.25,1.97,.65,.70,silver,g);const face=solid(4.12,1.83,.20,.65,black,g);face.position.z=.39;
        const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');const grad=ctx.createLinearGradient(0,0,512,256);grad.addColorStop(0,'#18293e');grad.addColorStop(.38,'#593655');grad.addColorStop(.67,'#181d2c');grad.addColorStop(1,'#355c64');ctx.fillStyle=grad;ctx.fillRect(0,0,512,256);const glow=ctx.createRadialGradient(130,20,0,130,20,230);glow.addColorStop(0,'#d8dfec99');glow.addColorStop(1,'#d8dfec00');ctx.fillStyle=glow;ctx.fillRect(0,0,512,256);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;textures.push(t);const glassMat=mat({map:t,metalness:.38,roughness:.20});const glass=solid(3.96,1.68,.08,.58,glassMat,g);glass.position.z=.52;
        for(const x of [-1.4,-.75,.75,1.4]){const lens=mesh(new T.SphereGeometry(.075,16,12),black,g);lens.scale.z=.15;lens.position.set(x,-.55,.585)}
        const seal=solid(4.05,1.8,.60,.60,fabric,g);seal.position.z=-.46;
        const strap=mesh(new T.TorusGeometry(1.43,.17,12,80),fabric,g);strap.rotation.x=Math.PI/2;strap.scale.set(1.27,1,.85);strap.position.set(0,.18,-1.25);
        for(const x of [-2.08,2.08]){const stem=mesh(new T.BoxGeometry(.20,.5,1.2),white,g);stem.position.set(x,.1,-.45)}
        const crown=mesh(new T.CylinderGeometry(.17,.17,.08,24),silver,g);crown.position.set(1.40,1.02,.05);return g;
      }
      const main=headset();
      const panels=[
        panel('assets/academic/profiled-board.reading.webp',2.75,1.72,rig,{x:0,y:0,w:.575,h:.25}),
        panel('assets/academic/sadra-02.reading.webp',1.55,2.9,rig,.44)
      ];
      stage.append(renderer.domElement);let frame=0,visible=false,sizeDirty=true,w=0,h=0,open=expanded?1:0,target=open,velocity=0,previous=0;
      const resize=new ResizeObserver(()=>{sizeDirty=true;wake()});resize.observe(stage);
      function draw(now){frame=0;if(!visible||document.hidden)return;
        if(sizeDirty){const nw=stage.clientWidth,nh=stage.clientHeight;if(!nw||!nh)return;if(nw!==w||nh!==h){w=nw;h=nh;renderer.setSize(w,h,false);camera.aspect=w/h}sizeDirty=false}
        const dt=Math.min((now-(previous||now))/1000,.05);previous=now;
        if(reduced.matches){open=target;velocity=0}else for(let t=0;t<dt;t+=1/120){let d=Math.min(1/120,dt-t);velocity+=((target-open)*180-velocity*19)*d;open+=velocity*d}
        const p=Math.max(0,Math.min(1.08,open));
        rig.rotation.set(.06*(1-p),-.06*(1-p),-.025*(1-p));
        main.position.set(-.35-p*.40,-.2-p*.25,.9);main.rotation.set(.12+p*.10,-.3-p*.08,.08-p*.06);main.scale.setScalar(.83+p*.02);
        panels[0].position.set(1.05+p*.40,.55+p*.80,-1.1);panels[0].rotation.set(.02,-.24,0);
        panels[1].position.set(-1.5-p*.5,.4+p*.1,-1.6);panels[1].rotation.set(0,.20,-.10+p*.06);
        camera.zoom=Math.min(1.25,camera.aspect*.96)*(1.17-p*.17);camera.lookAt(0,.1,0);camera.updateProjectionMatrix();renderer.render(scene,camera);
        if(Math.abs(target-open)>.0005||Math.abs(velocity)>.002)wake();
      }
      function wake(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw)}
      const visibility=()=>{previous=0;wake()};document.addEventListener('visibilitychange',visibility);
      renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.dataset.renderer='fallback';visible=false});renderer.domElement.addEventListener('webglcontextrestored',()=>{host.dataset.renderer='ready';visible=inView;wake()});
      return{ready:Promise.all(pending),wake,prime(){if(frame)cancelAnimationFrame(frame);frame=0;draw(performance.now())},update(value){target=value?1:0;wake()},visible(value){visible=value;previous=0;if(!value&&frame){cancelAnimationFrame(frame);frame=0}else wake()},dispose(){if(frame)cancelAnimationFrame(frame);resize.disconnect();document.removeEventListener('visibilitychange',visibility);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose()}};
    }
    const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)initialize();api?.visible(inView)},{rootMargin:'150px 0px'});observer.observe(host);
    addEventListener('pagehide',e=>{if(!e.persisted){disposed=true;observer.disconnect();api?.dispose()}});
  });
})();
