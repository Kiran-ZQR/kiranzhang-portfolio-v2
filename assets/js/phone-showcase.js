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
    const presentation=await import('../vendor/mockup-runtime.js');
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
      const context = canvas.getContext('2d'); context.fillStyle = '#fff'; context.fillRect(0, 0, 900, 1949);
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
    const device=await presentation.device('phone',{height:5.85,map:logo,finish:0x8c959e});rig.add(device);
    function card(src,crop,w,h){
      const g=new T.Group();rig.add(g);const glass=new T.MeshPhysicalMaterial({color:0xecfff4,metalness:.05,roughness:.25,transparent:true,opacity:.63,transmission:.12,thickness:.08,ior:1.38,side:T.DoubleSide,depthWrite:false});materials.push(glass);
      const surface=new T.Mesh(flat(w+.12,h+.12,.16),glass);g.add(surface);
      const map=screenTexture(src);map.repeat.set(crop.w,crop.h);map.offset.set(crop.x,1-crop.y-crop.h);
      const content=new T.MeshBasicMaterial({map,transparent:true,opacity:.88,toneMapped:false,depthWrite:false});materials.push(content);
      const plane=new T.Mesh(flat(w,h,.12),content);plane.position.z=.018;g.add(plane);
      const border=new T.LineLoop(new T.BufferGeometry().setFromPoints(shape(w+.12,h+.12,.16).getPoints(12).map(v=>new T.Vector3(v.x,v.y,0))),new T.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.32}));border.position.z=.025;g.add(border);resources.push(border.geometry);materials.push(border.material);return g;
    }
    const cards=[
      card('assets/briefing/assistant-welcome.webp',{x:.048,y:.384,w:.819,h:.190},3.65,1.82),
      card('assets/briefing/preferences.webp',{x:0,y:.325,w:1,h:.305},3.05,1.98),
      card('assets/briefing/radio-nav-live.webp',{x:0,y:0,w:1,h:1},3.65,.72)
    ];
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
      const narrow=renderWidth<550,spread=narrow?.64:1;
      cards.forEach(c=>c.scale.setScalar(narrow?.72:1));
      device.position.set(-.15-pose*.15,.12,.30);device.rotation.set(.08,-.50+pose*.12,-.30+pose*.05);
      cards[0].position.set((-1.9-pose*.52)*spread,1.45+pose*.30,-1.15);cards[0].rotation.set(.03,.23,.10);
      cards[1].position.set((1.75+pose*.50)*spread,.10+pose*.12,1.95);cards[1].rotation.set(-.02,-.22,-.06);
      cards[2].position.set((-1.95-pose*.35)*spread,-1.72-pose*.18,1.40);cards[2].rotation.set(.02,.16,.07);
      const openZoom = Math.min(.98, camera.aspect * (narrow?1.35:.80));
      const closedZoom = Math.min(1.80, camera.aspect * 1.03);
      camera.zoom = closedZoom - pose * (closedZoom - openZoom);camera.position.y=.45*(1-pose);
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
