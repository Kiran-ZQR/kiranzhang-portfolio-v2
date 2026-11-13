/* Shared-scene weaving experience; legacy controller retained in assets/js/weave-journey.js. */
(() => {
  'use strict';
  const $ = q => document.querySelector(q), T = window.THREE, api = window.LoomScene;
  const S = window.WeaveExperienceState, core = window.LifeWeaveCore;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const names = ['木','火','土','金','水'], colors = ['#4d7075','#c9302b','#ac8b40','#c83c9d','#91d6df'];
  const KEY = 'five-elements-experience-v4', LIMIT = 128, W = 100, H = 60;
  let state = S.create(), storageOK = true, savedPatterns=[];
  try { const saved = JSON.parse(localStorage.getItem(KEY)||'null'); if(saved){state={...S.restore(saved.state),stage:'landing'};savedPatterns=Array.isArray(saved.patterns)?saved.patterns:[];} } catch { storageOK = false; }
  const landing = $('.landing-copy');
  landing.innerHTML = '<p class="eyebrow">AN INTERACTIVE WEAVING EXPERIENCE</p><h1 aria-label="The Wheel of Life — 五元编织"><canvas aria-hidden="true"></canvas></h1><p class="title-english">WEAVING THE FIVE ELEMENTS</p><p class="intro-text">一次转动，唤醒五行。<br>让每一次相遇，交织成独一无二的生命纹样。</p><button id="start" class="primary">开始编织 <span>↗</span></button><small>一圈即可留下作品，也可以继续织入新的相遇。</small>';
  const titleCanvas=landing.querySelector('canvas');titleCanvas.width=1000;titleCanvas.height=550;window.YarnTitle.draw(titleCanvas.getContext('2d'),1000,550);
  $('.atelier').insertAdjacentHTML('beforeend','<button class="skip-intro-button">SKIP INTRO ↗</button><span class="view-label" hidden>01 / THE LOOM</span><span class="view-label right" hidden>02 / THE WHEEL</span><span class="view-divider" hidden></span>');
  $('.skip-intro-button').onclick=()=>document.body.classList.add('skip-intro');
  $('#leave').textContent='返回织机 ↗'; $('#sound').hidden=true;
  $('#pause').hidden=true; $('#next').textContent='继续编织 ↻'; $('#save').textContent='完成作品 ↗';
  $('#handle-zone').setAttribute('aria-label','顺时针绕手柄拖动进行编织；方向键提供四分之一圈操作');
  $('#completion .eyebrow').textContent='A PATTERN OF YOUR OWN';
  $('#completion h2').textContent='你的生命织物，已悄然成形。';
  $('#completion h2 + p').innerHTML='每一次转动，都是一次选择。<br>每一段经纬，都留下生命的痕迹。';
  $('#continue').textContent='继续编织 ↗'; $('#download').textContent='保存作品 ↓';
  $('.result-actions').insertAdjacentHTML('beforeend','<a class="result-home" href="index.html#home">返回首页 ↗</a>');
  $('#leave').insertAdjacentHTML('afterend','<a class="experience-home" href="index.html#home">返回首页 ↗</a>');
  $('#about details').innerHTML='<summary>网页怎么玩？与原作有什么不同？</summary><p>顺时针拖动织轮，布面随转动显现。第一圈默认使用木；完整一圈后可选择下一元素，也可随时结束、保存已有部分。键盘方向键或四分之一圈按钮可替代拖动。反转不会删除织物，回到已织位置后继续前进才会生成新内容。</p><p>生命规则保持 B3/S23。每完成一圈演化一代；五行种子叠加到前一代，留下连续的生成记录。网页是本地单人体验，不连接其他观众。最多保存 8 圈，每圈 256 行，纹理不超过 2048 行，以保留纹样细节并控制移动端开销。</p><a href="loom-model.html">查看完整模型 ↗</a>';
  $('#about-open').onclick=()=>{stopDrag();$('#about').showModal();};
  $('#about details p:nth-of-type(2)').textContent='生命规则保持 B3/S23。转动时逐步织入五行种子，松手后播放 18 代演化，再继续下一段；整张布面共同演化，新一圈的种子叠加在上一圈状态上。网页是本地单人体验，最多保存 128 圈，导出整张布面的当前生命状态。';
  if(!api){$('#start').disabled=true;return;}
  const {scene,model,renderer,camera,crank,cloth,beater,pedals}=api;
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  const host=$('#viewport'), dial=$('#handle-zone'), center=new T.Vector3(1.04,1.23,-.76);
  const control=document.createElement('aside');control.className='loom-controller';control.setAttribute('aria-label','织轮与五行控制');
  const wheelSlot=document.createElement('div');wheelSlot.className='wheel-slot';
  $('.atelier').append(control);control.append(wheelSlot);wheelSlot.append(dial);
  control.append($('.reference-wheel-caption'),$('.turn-meter'),$('.workbench'));
  for(const child of crank.children) child.position.sub(center); crank.position.copy(center);
  const clothCamera=new T.OrthographicCamera(-3,3,2,-2,.05,40), wheelCamera=camera.clone();
  document.querySelectorAll('[data-element] i').forEach((el,i)=>el.style.setProperty('--thread',colors[i]));
  // The right-hand controller shows only a shared-geometry wheel, not a second loom close-up.
  const wheelScene=new T.Scene(), isolatedWheel=crank.clone(true);isolatedWheel.position.set(0,0,0);wheelScene.add(isolatedWheel);
  wheelScene.environment=api.environment;wheelScene.add(new T.HemisphereLight(0xffffff,0xa9ad96,2));const wheelLight=new T.DirectionalLight(0xffffff,3);wheelLight.position.set(4,5,4);wheelScene.add(wheelLight);
  const clothDestination=new T.Vector3(), wheelDestination=new T.Vector3(), cameraLook=new T.Vector3();
  const homeTarget=new T.Vector3(0,1.1,0), fabricTarget=new T.Vector3(-.12,1.08,0);
  const fabric=document.createElement('canvas'); fabric.width=600;fabric.height=1000;
  const ink=fabric.getContext('2d'), texture=new T.CanvasTexture(fabric);texture.colorSpace=T.SRGBColorSpace;texture.minFilter=T.NearestFilter;texture.magFilter=T.NearestFilter;texture.generateMipmaps=false;
  // Continue the existing breast-beam path into a hanging front fabric, not a floating panel.
  const path=[[.95,1.46],[.95,.95],[.95,.35],[.95,-.68]];
  const vertices=[],uv=[],indices=[];
  path.forEach(([z,y],i)=>{for(const x of [-.61,.61]){vertices.push(x,y,z);uv.push(x<0?0:1,(y+.68)/(1.46+.68));}if(i<path.length-1){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}});
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const surface=new T.Mesh(geometry,new T.MeshBasicMaterial({map:texture,transparent:true,side:T.DoubleSide,depthWrite:true}));surface.name='Growing continuous tapestry';
  const originalCloth=cloth.getObjectByName('Continuous woven cloth');originalCloth.position.set(0,0,0);originalCloth.geometry=geometry.clone();originalCloth.material=originalCloth.material.clone();originalCloth.material.color.set('#ffffff');originalCloth.visible=true;surface.position.z=.003;cloth.add(surface);
  const sample=document.createElement('canvas');sample.width=700;sample.height=1300;window.drawLifeTextile(sample.getContext('2d'),700,1300,null);const sampleTexture=new T.CanvasTexture(sample);sampleTexture.colorSpace=T.SRGBColorSpace;
  let cache=[], drag=null, transitionStart=0, split=0, dirty=true, renderNeeded=true, guideStart=0, raf, saveTimer;
  window.addEventListener('element-pattern-ready',()=>{dirty=true;});
  let evolving=false, evolutionTicks=0, evolutionAt=0, pendingEvolution=false, settleTimer, finishAfterEvolution=false;
  savedPatterns.forEach((p,i)=>{if(i<state.segments.length&&Array.isArray(p.grid)&&p.grid.length===W*H&&p.grid.every(v=>Number.isInteger(v)&&v>=0&&v<=5))cache[i]={element:state.segments[i].element,grid:Uint8Array.from(p.grid),next:Uint8Array.from(p.grid),planted:Number.isInteger(p.planted)?p.planted:Math.ceil(state.segments[i].angle/S.TAU*40),generations:Number.isInteger(p.generations)?Math.max(0,p.generations):0};});
  const ease=x=>x*x*(3-2*x);
  function saveSession(){try{localStorage.setItem(KEY,JSON.stringify({state:S.serialize(state),patterns:cache.map(p=>({grid:Array.from(p.grid),planted:p.planted,generations:p.generations||0}))}));}catch{storageOK=false;}}
  function persist(){clearTimeout(saveTimer);saveTimer=setTimeout(saveSession,180);}
  function dispatch(type,extra={}){state=S.reduce(state,{type,...extra});update();persist();}
  function buildPattern(index){
    const segment=state.segments[index];
    if(cache[index]?.element!==segment.element){
      const grid=index?new Uint8Array(buildPattern(index-1).next):new Uint8Array(W*H);
      cache[index]={element:segment.element,grid,next:new Uint8Array(grid),planted:0,generations:0};
    }
    const p=cache[index], target=Math.ceil(segment.angle/S.TAU*160);
    // Distribute angle-driven seeds over the whole cloth, not only its bottom.
    // The coprime stride visits all 160 sites once; original five seeds and B3/S23 stay intact.
    while(p.planted<target){
      const site=(p.planted*67+index*7)%160;
      core.plant(p.grid,W,H,4+(site%16)*6,3+Math.floor(site/16)*6,segment.element);
      p.planted++;
    }
    p.next=new Uint8Array(p.grid);
    return p;
  }
  function paint(){
    ink.clearRect(0,0,fabric.width,fabric.height);
    // The latest accumulated grid is the entire living cloth, not a cropped history band.
    const last=state.segments.length-1;
    window.drawLifeTextile(ink,fabric.width,fabric.height,last>=0?buildPattern(last).grid:null,{segments:state.segments});
    texture.repeat.set(1,1);texture.offset.set(0,0);
    texture.needsUpdate=true;dirty=false;
  }
  function update(){
    renderNeeded=true;
    const info=S.summary(state), playing=state.stage!=='landing';
    originalCloth.visible=true;const clothMap=info.hasArtwork?null:sampleTexture;if(originalCloth.material.map!==clothMap){originalCloth.material.map=clothMap;originalCloth.material.needsUpdate=true;}
    const status=document.querySelector('#reference-status');if(status)status.textContent=evolving?`生命演化 · 第 ${evolutionTicks} / 18 代`:info.turns>=LIMIT?'已达 128 圈，请保存作品后重新开始':state.dragging?`正在织入 · ${Math.round(info.currentProgress*100)}%`:info.hasArtwork?(state.queuedElement!=null?`下一圈：${names[state.queuedElement]} · 已织内容保留`:'继续转动，或完成作品'):'先选五行，再转动织轮';
    document.body.classList.toggle('is-playing',playing);document.body.dataset.phase=state.stage;
    $('.stage-heading').hidden=!playing;$('.workbench').hidden=!playing;$('#leave').hidden=!playing;
    $('.turn-meter').hidden=!playing;$('#save').hidden=!playing;$('#save').disabled=state.stage!=='weaving';$('#next').hidden=!info.completedTurns;
    document.querySelectorAll('.view-label,.view-divider').forEach(el=>el.hidden=!playing);
    dial.hidden=state.stage!=='weaving'||split<.99;
    $('#chapter').textContent='WEAVE / 一次转动，一次相遇';$('#play-title').textContent='让生命，在经纬之间生长。';
    $('#instruction').textContent=evolving?`松手之后，生命继续生长 · ${evolutionTicks} / 18 代`:state.stage==='approach'?'正在展开织机…':info.turns>=LIMIT?'织物已达到本次容量，可以保存作品或返回首页。':info.hasArtwork?'演化结束，可以继续转动，或完成作品。':'顺时针转动织轮，松手后观看生命演化。';
    const percent=Math.round(info.currentProgress*100);
    $('#turn-value').textContent=(info.hasArtwork&&percent===0?'100':percent)+'%';
    dial.setAttribute('aria-valuenow',info.hasArtwork&&percent===0?100:percent);
    $('#turn-hint').textContent=`已织 ${info.turns.toFixed(2)} 圈 · ${names[state.currentElement]}`;
    $('#progress').textContent=info.elementSequence.map(i=>names[i]).join(' → ')||'第一缕 / 木 · 生长';
    $('#bench-note').textContent=!storageOK?'浏览器未允许本地保存；离开前请下载作品。':info.completedTurns?'整圈结束时可以选择下一种元素；不选择就自动继续。松手即停，进度会保留。':'第一圈无需选择。沿圆周顺时针拖动；也可以使用方向键或「转动 ¼ 圈」。';
    document.querySelectorAll('[data-element]').forEach((el,i)=>{el.disabled=state.stage!=='weaving';el.setAttribute('aria-pressed',String(i===(state.queuedElement??state.currentElement)));});
    $('#quarter').disabled=state.stage!=='weaving'||info.turns>=LIMIT;
    $('#next').disabled=state.stage!=='weaving'||info.turns>=LIMIT;
    dial.setAttribute('aria-disabled',String(state.stage!=='weaving'||info.turns>=LIMIT));$('#save').disabled=state.stage!=='weaving';
    if(evolving&&status)status.textContent=`生命演化 ${evolutionTicks} / 18 · 可随时继续转动`;
    $('#bench-note').textContent=storageOK?'转动时织入图案；松手后播放 18 代生命演化，结束后继续。整圈边界可以更换元素。':'本地保存不可用，离开前请下载作品。';
    $('.view-label').textContent='01 / THE LOOM';$('.view-label.right').textContent='02 / TURN TO WEAVE';
    $('#start').innerHTML=info.hasArtwork?'继续这幅编织 <span>↗</span>':'开始编织 <span>↗</span>';
  }
  function rectangles(){const w=host.clientWidth,h=host.clientHeight,r=wheelSlot.getBoundingClientRect(),v=host.getBoundingClientRect();return [w<600?{x:0,y:h*.43,w,h:h*.57}:{x:0,y:0,w:w*.73,h},{x:r.left-v.left,y:v.bottom-r.bottom,w:r.width,h:r.height}];}
  function positionCameras(){const aspect=host.clientWidth/host.clientHeight;camera.aspect=aspect;camera.position.set(3.3*Math.max(1,.95/aspect),2.55,5*Math.max(1,.95/aspect));camera.lookAt(0,1.1,0);camera.updateProjectionMatrix();
    const [a,b]=rectangles();clothCamera.aspect=a.w/a.h;wheelCamera.aspect=b.w/b.h;
    const halfHeight=Math.max(1.72,2.05/clothCamera.aspect);clothCamera.top=halfHeight;clothCamera.bottom=-halfHeight;clothCamera.left=-halfHeight*clothCamera.aspect;clothCamera.right=halfHeight*clothCamera.aspect;
    const distance=6;clothCamera.position.set(fabricTarget.x,fabricTarget.y+.12,distance);clothCamera.lookAt(fabricTarget);
    wheelCamera.position.set(.72*Math.max(1,.9/wheelCamera.aspect),.04,.42);wheelCamera.lookAt(0,0,0);
    clothDestination.copy(clothCamera.position);wheelDestination.copy(wheelCamera.position);
    clothCamera.updateProjectionMatrix();wheelCamera.updateProjectionMatrix();wheelCamera.updateMatrixWorld();
  }
  function resize(){stopDrag();renderer.setSize(host.clientWidth,host.clientHeight);positionCameras();renderNeeded=true;}
  function start(){if(state.stage!=='landing')return;document.body.classList.add('skip-intro');dispatch('ENTER');split=0;transitionStart=performance.now();resize();}
  function interruptEvolution(){clearTimeout(settleTimer);if(evolving){evolving=false;pendingEvolution=true;finishAfterEvolution=false;update();persist();}}
  function rotate(delta){if(state.stage!=='weaving'||document.querySelector('dialog[open]'))return;interruptEvolution();guideStart=0;const capped=Math.min(delta,LIMIT*S.TAU-state.wheelAngle);const before=state.effectiveAngle;dispatch('ROTATE',{delta:capped});crank.rotation.x=-state.wheelAngle;beater.position.z=Math.sin(state.wheelAngle*4)*.015;pedals.position.y=Math.sin(state.wheelAngle*2)*.008;renderer.shadowMap.needsUpdate=true;if(before!==state.effectiveAngle){dirty=true;pendingEvolution=true;}$('.dial-label').textContent='松手，观看演化';}
  function beginEvolution(){clearTimeout(settleTimer);if(!pendingEvolution||state.stage!=='weaving'||evolving)return;paint();pendingEvolution=false;evolving=true;evolutionTicks=0;evolutionAt=performance.now();update();}
  function release(){stopDrag();beginEvolution();}
  function stopDrag(){const previous=drag;drag=null;if(previous&&dial.hasPointerCapture(previous.id))dial.releasePointerCapture(previous.id);state=S.reduce(state,{type:'DRAG_END'});}
  dial.addEventListener('pointerdown',e=>{if(state.stage!=='weaving'||drag)return;interruptEvolution();e.preventDefault();const r=dial.getBoundingClientRect();drag={id:e.pointerId,x:r.left+r.width/2,y:r.top+r.height/2};drag.angle=Math.atan2(e.clientY-drag.y,e.clientX-drag.x);dial.setPointerCapture(e.pointerId);dispatch('DRAG_START');});
  dial.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<15)return;const angle=Math.atan2(e.clientY-drag.y,e.clientX-drag.x);rotate(S.deltaAngle(drag.angle,angle));drag.angle=angle;});
  for(const name of ['pointerup','pointercancel'])dial.addEventListener(name,release);
  dial.addEventListener('lostpointercapture',()=>{if(drag)release();});
  dial.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowUp','ArrowRight','ArrowDown','Enter',' '].includes(e.key)){e.preventDefault();rotate(['ArrowLeft','ArrowUp'].includes(e.key)?-Math.PI/2:Math.PI/2);}});
  dial.addEventListener('keyup',()=>{clearTimeout(settleTimer);settleTimer=setTimeout(beginEvolution,450);});
  $('#quarter').onclick=()=>{rotate(Math.PI/2);clearTimeout(settleTimer);settleTimer=setTimeout(beginEvolution,450);};$('#next').onclick=()=>{dial.focus();$('.dial-label').textContent='继续顺时针转动';};
  $('#start').onclick=start;host.onclick=start;host.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();start();}};
  $('#leave').onclick=()=>{stopDrag();evolving=false;pendingEvolution=false;clearTimeout(settleTimer);dispatch('RETURN_HOME');split=0;resize();};
  document.querySelectorAll('[data-element]').forEach((el,i)=>el.onclick=()=>dispatch('SELECT_ELEMENT',{element:i}));
  function result(){stopDrag();if(pendingEvolution){finishAfterEvolution=true;beginEvolution();return;}dispatch('FINISH');if(dirty)paint();const info=S.summary(state), canvas=$('#result'),p=canvas.getContext('2d');
    canvas.width=info.hasArtwork?fabric.width:1000;canvas.height=info.hasArtwork?fabric.height:300;p.clearRect(0,0,canvas.width,canvas.height);
    if(info.hasArtwork)p.drawImage(fabric,0,0);else{p.fillStyle='#eae7df';p.fillRect(0,0,1000,300);p.fillStyle='#717963';p.font='24px serif';p.textAlign='center';p.fillText(window.PortfolioI18n?.t('尚未织入第一缕线。回到织轮，开始一次相遇。')||'尚未织入第一缕线。回到织轮，开始一次相遇。',500,150);}
    $('#download').disabled=!info.hasArtwork;$('#result-caption').textContent=`${info.turns.toFixed(2)} 圈 · ${cache.reduce((n,p)=>n+(p.generations||0),0)} 代演化 · ${info.elementSequence.map(i=>names[i]).join(' → ')||'等待第一缕线'}`;$('#completion').showModal();
  }
  $('#save').onclick=()=>{interruptEvolution();pendingEvolution=false;result();};$('#continue').onclick=()=>$('#completion').close();
  $('#completion').addEventListener('close',()=>{if(state.stage==='result')dispatch('CONTINUE');});
  document.querySelectorAll('.dialog-close').forEach(el=>el.onclick=()=>el.closest('dialog').close());
  $('#new-game').onclick=()=>{if(!confirm(window.PortfolioI18n?.t('重新开始将清空当前创作，请先保存作品。继续吗？')||'重新开始将清空当前创作，请先保存作品。继续吗？'))return;dispatch('RESET');cache=[];dirty=true;split=0;crank.rotation.x=0;beater.position.z=0;pedals.position.y=0;$('#completion').close();resize();start();transitionStart=performance.now()-1400;split=1;dispatch('APPROACH_DONE');};
  $('#download').onclick=()=>{const link=document.createElement('a');link.download=`生命织物-${Date.now()}.png`;link.href=$('#result').toDataURL('image/png');link.click();};
  function draw(t){
    if(!document.hidden&&!document.body.classList.contains('intro-pending')){
      if(evolving&&state.stage==='weaving'&&!document.querySelector('dialog[open]')&&t-evolutionAt>=180){const p=buildPattern(state.segments.length-1);p.grid=core.step(p.grid,W,H);p.next=new Uint8Array(p.grid);p.generations++;evolutionTicks++;evolutionAt=t;dirty=true;if(evolutionTicks>=18){evolving=false;persist();if(finishAfterEvolution){finishAfterEvolution=false;result();}}update();}
      if(state.stage==='approach'){split=ease(Math.min(1,(t-transitionStart)/(reduced.matches?1:1300)));if(split>=1){dispatch('APPROACH_DONE');if(!state.effectiveAngle&&!reduced.matches)guideStart=t;dial.focus({preventScroll:true});}}
      if(guideStart){const p=Math.min(1,(t-guideStart)/1000);crank.rotation.x=-state.wheelAngle-.2*Math.sin(p*Math.PI);if(p===1)guideStart=0;}
      if(!renderNeeded&&!dirty&&!guideStart&&state.stage!=='approach'){raf=requestAnimationFrame(draw);return;}
      api.art?.update(state.wheelAngle);renderNeeded=false;
      if(dirty)paint();renderer.setScissorTest(false);renderer.setViewport(0,0,host.clientWidth,host.clientHeight);renderer.clear();
      if(state.stage==='landing'||split<1)renderer.render(scene,camera);
      if(state.stage!=='landing'){
        clothCamera.position.lerpVectors(camera.position,clothDestination,split);clothCamera.lookAt(cameraLook.lerpVectors(homeTarget,fabricTarget,split));
        wheelCamera.position.copy(wheelDestination);wheelCamera.lookAt(0,0,0);isolatedWheel.rotation.x=crank.rotation.x;
        renderer.setScissorTest(true);const rects=rectangles();
        rects.forEach((r,i)=>{renderer.setViewport(r.x,r.y,r.w,r.h);renderer.setScissor(r.x,r.y,r.w*split,r.h);renderer.clear(true,true,true);renderer.render(i?wheelScene:scene,i?wheelCamera:clothCamera);});renderer.setScissorTest(false);
      }
    }raf=requestAnimationFrame(draw);
  }
  document.addEventListener('visibilitychange',()=>{stopDrag();});
  window.addEventListener('pagehide',saveSession);
  new ResizeObserver(resize).observe(host);crank.rotation.x=-state.wheelAngle;update();resize();raf=requestAnimationFrame(draw);
  start();transitionStart=performance.now()-1400;split=1;dispatch('APPROACH_DONE');
  window.weaveJourney={enter:start,get state(){return state.stage;},get evolving(){return evolving;},get data(){return JSON.parse(S.serialize(state));},get turn(){return state.effectiveAngle;},get generation(){return cache.reduce((n,p)=>n+(p.generations||0),0);},camera,model,surface,renderer};
})();

