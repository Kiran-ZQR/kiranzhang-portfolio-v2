(() => {
  'use strict';
  const host = document.querySelector('.phone-showcase');
  if (!host) return;
  const stage = host.querySelector('.phone-stage');
  const expandButton = host.querySelector('.phone-expand');
  const spinButton = host.querySelector('.phone-spin');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  let hovered = false, pinned = false, expanded = false, spinning = false;
  let renderApi, loading, inView = false, disposed = false;
  function setExpanded() {
    const next = hovered || pinned;
    expanded = next;
    host.classList.toggle('is-expanded', next);
    expandButton.setAttribute('aria-expanded', String(next));
    expandButton.setAttribute('aria-label', next ? '收起样机' : '展开样机');
    const interactive3D = host.dataset.renderer === 'ready' && !reduced.matches;
    spinButton.hidden = !next || !interactive3D;
    if (!next) { spinning = false; spinButton.setAttribute('aria-pressed', 'false'); spinButton.setAttribute('aria-label', '自动旋转'); }
    renderApi?.update({ expanded, spinning });
  }
  host.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse' && hover.matches) { hovered = true; setExpanded(); } });
  host.addEventListener('pointerleave', () => { hovered = false; setExpanded(); });
  // Hover is temporary; an explicit button press pins/unpins the presentation.
  expandButton.addEventListener('click', () => {
    if (expanded) { pinned = false; hovered = false; } else pinned = true;
    setExpanded();
  });
  spinButton.addEventListener('click', () => {
    pinned = true; spinning = !spinning;
    spinButton.setAttribute('aria-pressed', String(spinning));
    spinButton.setAttribute('aria-label', spinning ? '暂停旋转' : '自动旋转');
    setExpanded();
  });
  host.addEventListener('keydown', event => {
    if (event.key === 'Escape') { pinned = false; hovered = false; setExpanded(); expandButton.focus({ preventScroll: true }); }
  });
  reduced.addEventListener('change', () => { spinning = false; spinButton.setAttribute('aria-pressed', 'false'); spinButton.setAttribute('aria-label', '自动旋转'); renderApi?.reduce(reduced.matches); setExpanded(); });

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
      spinButton.hidden = true;
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
    let frame = 0, visible = false, open = expanded ? 1 : 0, target = open, yaw = 0, pitch = 0, previous = 0, drag = null, isReduced = reduced.matches;
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
      open = isReduced ? target : open + (target - open) * (1 - Math.exp(-dt * 7));
      if (spinning && !isReduced && target) yaw += dt * .38;
      rig.rotation.set(pitch, yaw, 0);
      // The right device is physically in front of the left; the solids never intersect.
      phones[0].position.set(-1 - open * .7, .12, -.9 + open * .15);
      phones[1].position.set(1 + open * .7, -.24 + open * .14, .9 - open * .15);
      phones[0].rotation.set(-.045, .18 - open * .37, .15 - open * .09);
      phones[1].rotation.set(.035, -.18 + open * .37, -.13 + open * .07);
      // The crop belongs to the camera framing, not a chopped phone texture.
      const openZoom = Math.min(1.12, camera.aspect * 1.18);
      const closedZoom = Math.min(2.4, camera.aspect * 1.6);
      camera.zoom = closedZoom - open * (closedZoom - openZoom); camera.position.y = 1.65 * (1 - open);
      camera.lookAt(0, camera.position.y, 0); camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      if (Math.abs(target - open) > .001 || (spinning && !isReduced)) wake();
    }
    function wake() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw); }
    function resetSpin() {
      spinning = false; spinButton.setAttribute('aria-pressed', 'false'); spinButton.setAttribute('aria-label', '自动旋转');
    }
    function down(event) {
      if (!expanded || event.button > 0 || isReduced) return;
      drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY, moving: false };
    }
    function move(event) {
      if (!drag || drag.id !== event.pointerId) return;
      if (!drag.moving) {
        const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 7) return;
        if (event.pointerType !== 'mouse' && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
        drag.moving = true; pinned = true; resetSpin(); stage.setPointerCapture(event.pointerId); stage.classList.add('is-dragging');
      }
      yaw += (event.clientX - drag.lastX) * .012;
      pitch = Math.max(-.38, Math.min(.38, pitch + (event.clientY - drag.lastY) * .005));
      drag.lastX = event.clientX; drag.lastY = event.clientY; wake();
    }
    function up() { drag = null; stage.classList.remove('is-dragging'); }
    stage.addEventListener('pointerdown', down); stage.addEventListener('pointermove', move);
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) stage.addEventListener(event, up);
    const visibility = () => { previous = 0; wake(); }; document.addEventListener('visibilitychange', visibility);
    renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); host.dataset.renderer = 'fallback'; resetSpin(); renderApi?.visible(false); setExpanded(); });
    renderer.domElement.addEventListener('webglcontextrestored', () => { host.dataset.renderer = 'ready'; renderApi?.visible(inView); setExpanded(); wake(); });
    return {
      ready: Promise.all(textureLoads),
      prime() { if (frame) cancelAnimationFrame(frame); frame = 0; draw(performance.now()); },
      update(state) { target = state.expanded ? 1 : 0; if (!state.expanded) { yaw = 0; pitch = 0; } wake(); },
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
