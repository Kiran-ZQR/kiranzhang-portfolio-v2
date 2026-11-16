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
    return new Promise((resolve, reject) => {
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
      renderApi = createScene(T);
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

  function createScene(T) {
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.setClearColor(0, 0);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(32, 1, 1, 40);
    camera.position.set(0, .1, 15);
    scene.add(new T.HemisphereLight(0xffffff, 0x535761, 2.2));
    const key = new T.DirectionalLight(0xffffff, 3.4); key.position.set(-5, 7, 9); scene.add(key);
    const fill = new T.DirectionalLight(0xcfd9ea, 2.1); fill.position.set(5, 1, -6); scene.add(fill);
    const rig = new T.Group(); scene.add(rig);
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
    function phone(image) {
      const group = new T.Group();
      const shell = new T.ExtrudeGeometry(shape(2.75, 5.85, .43), { depth: .23, bevelEnabled: true, bevelThickness: .028, bevelSize: .025, bevelSegments: 3, steps: 1, curveSegments: 14 });
      shell.translate(0, 0, -.115); resources.push(shell); group.add(new T.Mesh(shell, metal));
      const front = new T.Mesh(flat(2.7, 5.8, .40), bezel); front.position.z = .17; group.add(front);
      const screenMaterial = new T.MeshBasicMaterial({ map: image, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }); materials.push(screenMaterial);
      const screen = new T.Mesh(flat(2.57, 5.64, .34), screenMaterial); screen.position.z = .195; group.add(screen);
      const island = new T.Mesh(flat(.76, .17, .085), bezel); island.position.set(0, 2.56, .22); group.add(island);
      const back = new T.Group(); back.rotation.y = Math.PI; group.add(back);
      const plate = new T.Mesh(flat(2.68, 5.78, .4), rear); plate.position.z = .15; back.add(plate);
      const bump = new T.Mesh(flat(1.02, 1.08, .22), metal); bump.position.set(-.66, 2.04, .18); back.add(bump);
      for (const [x, y] of [[-.9, 2.28], [-.45, 2.04], [-.9, 1.8]]) {
        const ringGeometry = new T.CylinderGeometry(.19, .19, .08, 24); ringGeometry.rotateX(Math.PI / 2); resources.push(ringGeometry);
        const ring = new T.Mesh(ringGeometry, metal); ring.position.set(x, y, .23); back.add(ring);
        const glassGeometry = new T.CircleGeometry(.145, 24); resources.push(glassGeometry);
        const glass = new T.Mesh(glassGeometry, lens); glass.position.set(x, y, .273); back.add(glass);
      }
      addBox(group, .055, .53, .10, 1.4, .9, 0, metal);
      addBox(group, .055, .37, .10, -1.4, 1.05, 0, metal);
      addBox(group, .055, .37, .10, -1.4, .5, 0, metal);
      return group;
    }
    const phones = [phone(logoTexture()), phone(screenTexture('assets/briefing/assistant-welcome.webp'))];
    phones.forEach(p => rig.add(p));
    stage.append(renderer.domElement);
    let frame = 0, visible = false, open = expanded ? 1 : 0, target = open, velocity = 0, previous = 0, isReduced = reduced.matches;
    let sizeDirty = true, renderWidth = 0, renderHeight = 0;
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
      // Logo device leads in scale and depth, with safe separation at every pose.
      phones[0].scale.setScalar(1.09);
      phones[1].scale.setScalar(.92);
      phones[0].position.set(-.85-pose*.85, .10, 1.25-pose*.15);
      phones[1].position.set(1+pose*.78, -.25+pose*.15, -1.15+pose*.15);
      phones[0].rotation.set(-.045, .14-pose*.30, .14-pose*.10);
      phones[1].rotation.set(.035, -.16+pose*.32, -.13+pose*.09);
      // The crop belongs to the camera framing, not a chopped phone texture.
      const openZoom = Math.min(1.12, camera.aspect * 1.18);
      const closedZoom = Math.min(2.4, camera.aspect * 1.6);
      camera.zoom = closedZoom - open * (closedZoom - openZoom); camera.position.y = 1.10 * (1 - open);
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
      dispose() { if (frame) cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); resources.forEach(g => g.dispose()); textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose()); renderer.dispose(); }
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
