(() => {
  'use strict';
  const host = document.querySelector('.phone-showcase');
  if (!host) return;
  const stage = host.querySelector('.phone-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  let hovered = false, pinned = false, expanded = false;
  let renderApi, loading, inView = false, disposed = false;
  function setExpanded() {
    expanded = hovered || pinned;
    host.classList.toggle('is-expanded', expanded);
    host.setAttribute('aria-expanded', String(expanded));
    renderApi?.update({ expanded });
  }
  host.addEventListener('pointerenter', e => { if(e.pointerType === 'mouse' && hover.matches) { hovered = true; setExpanded(); } });
  host.addEventListener('pointerleave', () => { hovered = false; setExpanded(); });
  host.addEventListener('click', e => { if(e.pointerType === 'mouse' && hover.matches) return; pinned = !pinned; setExpanded(); });
  host.addEventListener('keydown', e => {
    if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pinned = !expanded; hovered = false; setExpanded(); }
    if(e.key === 'Escape') { pinned = hovered = false; setExpanded(); }
  });
  reduced.addEventListener('change', () => { renderApi?.reduce(reduced.matches); setExpanded(); });

  function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    return window.kiranThreePromise ||= new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'assets/vendor/three-0.160.1.min.js';
      script.onload = () => window.THREE ? resolve(window.THREE) : reject(new Error('3D runtime unavailable'));
      script.onerror = reject;
      document.head.append(script);
    });
  }
  async function initialize() {
    if (renderApi || loading || disposed) return;
    loading = true;
    try {
      const T = await loadThree();
      if (disposed) return;
      renderApi = await createScene(T);
      await renderApi.ready;
      if (disposed) return;
      renderApi.visible(inView);
      renderApi.prime();
      host.dataset.renderer = 'ready';
      setExpanded();
    } catch {
      host.dataset.renderer = 'fallback';
      renderApi?.dispose();
      renderApi = undefined;
    }
  }

  async function createScene(T) {
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.setClearColor(0, 0);
    let frame = 0, visible = false, open = expanded ? 1 : 0, target = open, velocity = 0, previous = 0, isReduced = reduced.matches;
    let sizeDirty = true, renderWidth = 0, renderHeight = 0;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(32, 1, 1, 40);
    camera.position.set(0, .1, 15);
    scene.add(new T.HemisphereLight(0xffffff, 0x535761, 2.2));
    const key = new T.DirectionalLight(0xffffff, 3.4); key.position.set(-5, 7, 9); scene.add(key);
    const fill = new T.DirectionalLight(0xcfd9ea, 2.1); fill.position.set(5, 1, -6); scene.add(fill);
    const rig = new T.Group(); scene.add(rig);
    const presentation=await import('../vendor/mockup-runtime.js?v=20261119');
    const environment=presentation.studio(renderer,scene);
    renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
    const resources = [], textures = [], materials = [];
    const metal = new T.MeshStandardMaterial({ color: 0x51545a, metalness: .82, roughness: .29 });
    const bezel = new T.MeshStandardMaterial({ color: 0x090a0b, metalness: .35, roughness: .24 });
    const rear = new T.MeshStandardMaterial({ color: 0x303238, metalness: .48, roughness: .4 });
    const lens = new T.MeshStandardMaterial({ color: 0x080f19, metalness: .65, roughness: .1 });
    materials.push(metal, bezel, rear, lens);
    function shape(w, h, r) {
      const s = new T.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
      s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
    }
    function flat(w, h, r) {
      const geometry = new T.ShapeGeometry(shape(w, h, r), 16);
      const positions = geometry.attributes.position, uv = geometry.attributes.uv;
      for (let i = 0; i < positions.count; i++) uv.setXY(i, positions.getX(i) / w + .5, positions.getY(i) / h + .5);
      resources.push(geometry); return geometry;
    }
    function addBox(group, w, h, d, x, y, z, material) {
      const geometry = new T.BoxGeometry(w, h, d); resources.push(geometry);
      const mesh = new T.Mesh(geometry, material); mesh.position.set(x, y, z); group.add(mesh); return mesh;
    }
    const loader = new T.TextureLoader(), textureLoads = [];
    function screenTexture(src) {
      let resolve, reject;
      textureLoads.push(new Promise((yes, no) => { resolve = yes; reject = no; }));
      const texture = loader.load(src, () => { resolve(); wake(); }, undefined, reject);
      texture.colorSpace = T.SRGBColorSpace;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
      textures.push(texture); return texture;
    }
    function logoTexture() {
      const canvas = document.createElement('canvas'); canvas.width = 900; canvas.height = 1949;
      const context = canvas.getContext('2d');context.fillStyle='#080a0d';context.fillRect(0,0,900,1949);context.fillStyle='#fff';context.beginPath();context.roundRect(15,15,870,1919,110);context.fill();
      context.fillStyle='#111';context.font='600 36px Arial';context.fillText('9:41',76,100);
      for(let i=0;i<4;i++)context.fillRect(710+i*15,101-i*9,10,15+i*9);
      context.lineWidth=4;context.strokeStyle='#111';context.strokeRect(791,65,54,27);context.fillRect(849,73,4,12);context.fillRect(796,70,40,17);
      context.beginPath();context.roundRect(330,1891,240,12,6);context.fill();
      const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
      textures.push(texture);
      textureLoads.push(new Promise((resolve, reject) => {
        const source = new Image();
        source.onload = () => {
          // Reuse the exact logo pixels from the old homepage; exclude its phone frame.
          context.drawImage(source, 160, 385, 168, 55, 270, (1949 - 118) / 2, 360, 118);
          texture.needsUpdate = true; resolve(); wake();
        };
        source.onerror = reject;
        source.src = 'assets/home-projects/tencent-phone.png';
      }));
      return texture;
    }
    const logo=logoTexture();await Promise.all(textureLoads);
    const device=await presentation.device('phone',{height:6.15,map:logo,finish:0xaeb4bb});rig.add(device);
    function card(src,crop,w,h){
      const g=new T.Group();rig.add(g);const glass=new T.MeshPhysicalMaterial({color:0xffffff,metalness:.08,roughness:.19,transparent:true,opacity:.96,transmission:0,thickness:.08,ior:1.38,side:T.DoubleSide,depthWrite:false});materials.push(glass);
      const surface=new T.Mesh(flat(w+.12,h+.12,.38),glass);g.add(surface);
      const map=typeof src==='string'?screenTexture(src):src;map.repeat.set(crop.w,crop.h);map.offset.set(crop.x,1-crop.y-crop.h);
      const content=new T.MeshBasicMaterial({map,transparent:true,opacity:1,toneMapped:false,depthWrite:false});materials.push(content);
      const plane=new T.Mesh(flat(w,h,.33),content);plane.position.z=.018;g.add(plane);
      const border=new T.LineLoop(new T.BufferGeometry().setFromPoints(shape(w+.12,h+.12,.38).getPoints(12).map(v=>new T.Vector3(v.x,v.y,0))),new T.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.32}));border.position.z=.025;g.add(border);resources.push(border.geometry);materials.push(border.material);return g;
    }
    function component(kind){
      const canvas=document.createElement('canvas');canvas.width=600;canvas.height=720;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,600,720);ctx.fillStyle='#161b24';ctx.font='500 48px "Microsoft YaHei",Arial';ctx.fillText(kind==='avatar'?'AI 早报定制':'设置偏好',44,86);
      const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;textures.push(map);
      textureLoads.push(new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{ctx.save();ctx.beginPath();ctx.roundRect(40,140,520,530,38);ctx.clip();if(kind==='avatar')ctx.drawImage(img,95,750,330,370,40,140,520,530);else{ctx.fillStyle='#f7f8fa';ctx.fillRect(40,140,520,530);ctx.drawImage(img,38,763,825,96,55,230,490,57);ctx.drawImage(img,38,918,825,108,55,390,490,64)}ctx.restore();map.needsUpdate=true;resolve();wake()};img.onerror=reject;img.src=kind==='avatar'?'assets/briefing/assistant-welcome.webp':'assets/briefing/preferences.webp'}));return map;
    }
    const cards=[card(component('avatar'),{x:0,y:0,w:1,h:1},1.52,1.82),card(component('preferences'),{x:0,y:0,w:1,h:1},1.55,1.86)];
    stage.append(renderer.domElement);
    const observer = new ResizeObserver(() => { sizeDirty = true; wake(); }); observer.observe(stage);
    function draw(now) {
      frame = 0;
      if (!visible || document.hidden) return;
      // setSize clears the drawing buffer. Resize only here, immediately before rendering,
      // never in ResizeObserver after the current animation frame has already been drawn.
      if (sizeDirty) {
        const w = stage.clientWidth, h = stage.clientHeight;
        if (!w || !h) return;
        if (w !== renderWidth || h !== renderHeight) {
          renderer.setSize(w, h, false); renderWidth = w; renderHeight = h;
          camera.aspect = w / h;
        }
        sizeDirty = false;
      }
      const dt = Math.min((now - (previous || now)) / 1000, .05); previous = now;
      // Damped spring: one restrained overshoot, integrated in small stable steps.
      if (isReduced) { open = target; velocity = 0; }
      else for (let t = 0; t < dt; t += 1/120) {
        const step = Math.min(1/120, dt-t);
        velocity += ((target-open)*180 - velocity*19)*step;
        open += velocity*step;
      }
      const pose = Math.max(0, Math.min(1.08, open));
      const narrow=renderWidth<550,spread=narrow?.79:1;
      cards.forEach(c=>c.scale.setScalar(narrow?.84:1));
      // Reference 04: a near-frontal device with detached, staggered UI cards.
      device.position.set(.78,-.18,0);device.rotation.set(.04,.29,.085);
      cards[0].position.set(-2.12*spread,.91,1.25);cards[0].rotation.set(.02,.10,.025);
      cards[1].position.set(-2.12*spread,-1.24,1.25);cards[1].rotation.set(.02,.10,.025);
      const openZoom=Math.min(1.05,camera.aspect*1.40),closedZoom=Math.min(1.13,camera.aspect*1.08);
      camera.zoom=closedZoom+(openZoom-closedZoom)*pose;camera.position.y=.12*(1-pose);
      camera.lookAt(0, camera.position.y, 0); camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      if (Math.abs(target - open) > .0005 || Math.abs(velocity) > .002) wake();
    }
    function wake() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw); }
    const visibility = () => { previous = 0; wake(); }; document.addEventListener('visibilitychange', visibility);
    renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); host.dataset.renderer = 'fallback'; renderApi?.visible(false); setExpanded(); });
    renderer.domElement.addEventListener('webglcontextrestored', () => { host.dataset.renderer = 'ready'; renderApi?.visible(inView); setExpanded(); wake(); });
    return {
      ready: Promise.all(textureLoads),
      prime() { if (frame) cancelAnimationFrame(frame); frame = 0; draw(performance.now()); },
      update(state) { target = state.expanded ? 1 : 0; wake(); },
      visible(value) { visible = value; previous = 0; if (!value && frame) { cancelAnimationFrame(frame); frame = 0; } else wake(); },
      reduce(value) { isReduced = value; wake(); },
      dispose() { if (frame) cancelAnimationFrame(frame); observer.disconnect(); environment.dispose(); document.removeEventListener('visibilitychange', visibility); resources.forEach(g => g.dispose()); textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose()); renderer.dispose(); }
    };
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) initialize();
      renderApi?.visible(inView);
    }, { rootMargin: '200px 0px' });
    observer.observe(host);
  } else { inView = true; initialize(); }
  // BFCache restores the existing scene; only dispose on a full document exit.
  addEventListener('pagehide', event => { if (!event.persisted) { disposed = true; renderApi?.dispose(); } });
  setExpanded();
})();
