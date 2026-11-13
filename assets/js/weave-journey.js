(() => {
  'use strict';
  const $=s=>document.querySelector(s), api=window.LoomScene;
  if(!api){$('#start').disabled=true;return;}
  const T=window.THREE,{scene,model,camera,renderer,crank,cloth,beater,pedals}=api;
  const host=$('#viewport'),dial=$('#handle-zone'),core=window.LifeWeaveCore;
  const colors=['#62885f','#bf725f','#9e895f','#b39a45','#648ca9'],names=['木','火','土','金','水'],W=100,H=60;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let state='idle',selected=0,angle=0,totalAngle=0,drag=null,cells=new Uint8Array(W*H),trace=new Uint8Array(W*H),woven=new Uint8Array(W*H),collected=new Set(),round=0,generation=0,ticks=0,paused=false,free=false,audio=null,sound=false;
  let last=0,clock=0,raf=0,stageTime=0,elapsed=0,flight=null,clothScan=0,dirty=true,seedMarks=[];
  const look=new T.Vector3(0,1.1,0),handCenter=new T.Vector3(1.04,1.23,-.76);
  // Pivot only the crank mechanism, not the whole machine.
  for(const part of crank.children)part.position.sub(handCenter);crank.position.copy(handCenter);
  const fabric=document.createElement('canvas');fabric.width=1000;fabric.height=600;const ink=fabric.getContext('2d');
  const tex=new T.CanvasTexture(fabric);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const surface=new T.Mesh(new T.PlaneGeometry(1.3,.78,1,1),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide,toneMapped:false}));surface.position.set(0,.72,.985);surface.name='Living tapestry';surface.receiveShadow=false;cloth.add(surface);
  // The cloth continues over the existing breast beam and hangs toward the viewer.
  const raycaster=new T.Raycaster();
  function pose(name){const aspect=camera.aspect,fit=Math.max(1,1.04/aspect);switch(name){
    case 'home':return {p:[3.3*fit,2.55*fit,5*fit],t:[0,1.1,0]};
    case 'near':return {p:[2.05,1.9,3.1],t:[0,1.15,0]};
    case 'side':return {p:[3.4,1.5,-.76],t:handCenter.toArray()};
    case 'handle':return {p:[1.04+1.05*Math.max(1,.68/aspect),1.23,-.76],t:handCenter.toArray()};
    case 'front':return {p:[1.7,1.4,3.2],t:[0,.8,.7]};
    default:return {p:[0,.72,.985+2.15*Math.max(1,.95/aspect)],t:[0,.72,.985]};}}
  function setPose(name){const a=pose(name);camera.position.fromArray(a.p);look.fromArray(a.t);camera.lookAt(look);}
  function move(stops,done){flight={stops:[...stops],done,start:clock,from:camera.position.clone(),target:look.clone(),stop:null};nextStop();}
  function nextStop(){if(!flight)return;const stop=flight.stops.shift();if(!stop){const done=flight.done;flight=null;done();return;}flight.stop=stop;flight.start=clock;flight.from=camera.position.clone();flight.target=look.clone();}
  function tickCamera(){if(!flight)return;const dest=pose(flight.stop),duration=reduce.matches?80:flight.stop==='side'?800:1100;const p=Math.min(1,(clock-flight.start)/duration),e=p*p*p*(p*(p*6-15)+10);camera.position.lerpVectors(flight.from,new T.Vector3(...dest.p),e);look.lerpVectors(flight.target,new T.Vector3(...dest.t),e);if(p===1)nextStop();}
  function heading(chapter,title,hint){$('#chapter').textContent=chapter;$('#play-title').textContent=title;$('#instruction').textContent=hint;}
  function phase(next){state=next;document.body.dataset.phase=state;stageTime=clock;update();}
  function update(){const handle=state==='handle',growth=state==='growth',ready=state==='ready',done=state==='woven';const moving=['approach','returning'].includes(state);
    dial.hidden=!handle;$('.turn-meter').hidden=!handle;$('.camera-note').hidden=!moving;$('.cloth-caption').hidden=!['reveal','growth','ready','weaving','woven'].includes(state);
    document.querySelectorAll('[data-element]').forEach((b,i)=>{b.disabled=!(handle&&totalAngle===0||done)||(!free&&collected.has(i));b.setAttribute('aria-pressed',String(i===selected));b.classList.toggle('woven',collected.has(i));});
    $('#next').disabled=!(ready||done);$('#next').textContent=ready?'织入这一轮 ↗':done?'再转一圈 ↻':state==='weaving'?'正在织入…':growth?'生命正在演化…':state==='reveal'?'种子就位 · 准备演化':moving?'镜头移动中…':'请先转动手柄';
    $('#pause').hidden=!growth;$('#pause').textContent=paused?'继续演化':'暂停演化';$('#pause').setAttribute('aria-pressed',String(paused));$('#save').hidden=collected.size<5;
    $('#progress').textContent=`${collected.size} / 5 缕线`;
    document.querySelectorAll('[data-step]').forEach(b=>{const active=b.dataset.step===(handle||moving?'handle':growth||state==='reveal'?'growth':'weave');b.classList.toggle('is-current',active);if(active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    $('#bench-note').textContent=handle?'先选元素，再绕手柄转一圈。可以分次拖动，顺逆时针均可；满圈后松手。':done?'这一轮已保留。选择下一种元素，再回到手柄继续编织。':ready?'演化已停在这一刻。点击「织入这一轮」，保留生命走过的痕迹。':moving?'镜头正在移动，播种与演化会在抵达后开始。':'生命会演化 18 代，消失的细胞也会留下淡淡的痕迹。';
  }
  function tone(){if(!sound||!audio)return;audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=[261.63,329.63,392,440,523.25][selected];g.gain.setValueAtTime(.055,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.6);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.65);}
  function start(){if(state!=='idle')return;document.body.classList.add('is-playing');$('.stage-heading').hidden=false;$('.workbench').hidden=false;$('#leave').hidden=false;host.setAttribute('role','img');host.setAttribute('aria-label','三维织布机，镜头将自动移向旋转手柄');resize();phase('approach');heading('01 / 走近织机','让我们靠近一点。','先找到织机右侧的手柄。');move(['near','side','handle'],enterHandle);}
  function enterHandle(){totalAngle=0;seedMarks=[];ticks=0;paused=false;phase('handle');heading(`01 / 转动 · ${names[selected]}`,'转一圈，让相遇开始。','按住手柄周围的圆环，绕中心拖动；转满一圈后松手。');meter();dial.focus({preventScroll:true});}
  function meter(){const p=Math.min(100,Math.floor(Math.abs(totalAngle)/(Math.PI*2)*100));$('#turn-value').textContent=p+'%';dial.setAttribute('aria-valuenow',p);dial.setAttribute('aria-valuetext',p>=100?'已转满一圈，松手播种':`已转动 ${p}%`);dial.style.setProperty('--turn',p*3.6+'deg');$('#turn-hint').textContent=p>=100?'已转满一圈 · 松手播种':'转动一圈 · 松手播种';$('.dial-label').textContent=p>=100?'松手，去看布料':'按住转动';}
  function turn(delta){if(state!=='handle')return;const before=Math.floor(Math.abs(totalAngle)/(Math.PI/2));totalAngle+=delta;angle-=delta;crank.rotation.x=angle;const n=Math.floor(Math.abs(totalAngle)/(Math.PI/2));if(n>before)tone();meter();update();}
  function finishTurn(){if(state!=='handle'||Math.abs(totalAngle)<Math.PI*2-.02)return;drag=null;phase('returning');heading('02 / 回到布面','你的种子，即将落在这里。','镜头回到织机正面后，再开始演化。');move(['side','front','cloth'],revealSeeds);}
  function revealSeeds(){cells.fill(0);trace.fill(0);seedMarks=[];const offset=(round*7+selected*5)%16;
    for(const [x,y] of [[22+offset,18],[66-offset,38],[43,28],[78,16]]){for(const [dx,dy] of [[0,0],[-7,0],[7,0],[0,-7],[0,7]]){core.plant(cells,W,H,x+dx,y+dy,selected);core.plant(cells,W,H,W-1-x-dx,H-1-y-dy,selected);}seedMarks.push([x,y],[W-1-x,H-1-y]);}
    cells.forEach((v,i)=>{if(v)trace[i]=v;});ticks=0;dirty=true;phase('reveal');heading('02 / 种子就位','每一个起点，都清晰可见。','这些标记就是你刚刚织入的生命种子。');$('#generation').textContent='种子位置 · 即将演化';}
  function evolve(){cells=core.step(cells,W,H);cells.forEach((v,i)=>{if(v)trace[i]=v;});ticks++;generation++;dirty=true;$('#generation').textContent=`演化 ${ticks} / 18 代`;if(ticks>=18){phase('ready');heading('03 / 留下痕迹','把这一刻，织进画卷。','生命暂时停下，走过的轨迹会被保留下来。');}}
  function finishWeave(){trace.forEach((v,i)=>{if(v)woven[i]=v;});cells.fill(0);trace.fill(0);seedMarks=[];dirty=true;collected.add(selected);round++;phase('woven');heading('这一轮 / 已完成','相遇，已经成为纹理。','再选一缕线，继续把新的故事织进来。');if(collected.size===5&&!free){free=true;update();showResult();}else if(!free){selected=[0,1,2,3,4].find(i=>!collected.has(i));update();}}
  function next(){if(state==='ready'){phase('weaving');heading('03 / 编织','让经纬记住这次相遇。','织梭经过，生命的轨迹被收进布料。');tone();}else if(state==='woven'){phase('approach');heading('01 / 再次相遇','回到手柄，再织一缕。',`这一轮选择了「${names[selected]}」。`);move(['front','side','handle'],enterHandle);}}
  function paint(){ink.fillStyle='#eee5cf';ink.fillRect(0,0,1000,600);const s=10;for(let i=0;i<woven.length;i++){let v=woven[i],alpha=.75;if(trace[i]){v=trace[i];alpha=.58;}if(cells[i]){v=cells[i];alpha=1;}if(!v)continue;ink.globalAlpha=alpha;ink.fillStyle=colors[v-1];const x=i%W*s,y=Math.floor(i/W)*s;ink.fillRect(x+1,y+1,8,8);ink.fillStyle='#fff';ink.globalAlpha=alpha*.22;ink.fillRect(x+2,y+2,1,6);}ink.globalAlpha=1;
    ink.fillStyle='#6c62490c';for(let x=0;x<1000;x+=3)ink.fillRect(x,0,1,600);for(let y=0;y<600;y+=3)ink.fillRect(0,y,1000,1);
    if(state==='reveal'){ink.strokeStyle=colors[selected];ink.lineWidth=2;for(const [x,y] of seedMarks){ink.strokeRect(x*s-22,y*s-22,50,50);}}
    if(state==='weaving'){const y=clothScan*600;ink.fillStyle='#fffffa60';ink.fillRect(0,y-14,1000,14);ink.fillStyle='#536c45';ink.fillRect(0,y,1000,2);}tex.needsUpdate=true;dirty=false;
  }
  function updateDial(){if(dial.hidden)return;camera.updateMatrixWorld();const c=handCenter.clone().project(camera),edge=handCenter.clone().add(new T.Vector3(0,.23,0)).project(camera);const r=host.getBoundingClientRect();const diameter=Math.max(110,Math.abs(edge.y-c.y)*r.height);dial.style.left=host.offsetLeft+(c.x*.5+.5)*r.width+'px';dial.style.top=host.offsetTop+(-c.y*.5+.5)*r.height+'px';dial.style.width=diameter+'px';dial.style.height=diameter+'px';}
  function resize(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();if(!flight)setPose(state==='idle'?'home':state==='handle'?'handle':'cloth');updateDial();render();}
  function render(){if(dirty)paint();camera.lookAt(look);renderer.render(scene,camera);}
  function frame(t){const dt=Math.min(60,t-last);last=t;const blocked=document.hidden||!!document.querySelector('dialog[open]');if(!blocked){clock+=dt;tickCamera();if(state==='reveal'&&clock-stageTime>1000){phase('growth');elapsed=0;heading('02 / 演化','看，一颗种子成为一场相遇。','纹样直接在布料上生长，上一轮的痕迹仍然留在其中。');}if(state==='growth'&&!paused){elapsed+=dt;if(elapsed>180){elapsed=0;evolve();}}if(state==='weaving'){clothScan=Math.min(1,(clock-stageTime)/(reduce.matches?250:1400));dirty=true;beater.position.z=Math.sin(clothScan*Math.PI)*.025;pedals.position.y=-Math.sin(clothScan*Math.PI)*.008;if(clothScan===1)finishWeave();}if(flight||state==='handle'||dirty||state==='idle'){render();updateDial();}}raf=requestAnimationFrame(frame);}
  function makeResult(){paint();const c=$('#result'),p=c.getContext('2d');p.fillStyle='#f4f2ed';p.fillRect(0,0,c.width,c.height);p.fillStyle='#344a34';p.font='32px serif';p.fillText('生命之轮：五元编织',60,70);p.font='12px monospace';p.fillText('VORTEX OF BEING / YOUR WOVEN STORY',60,100);p.drawImage(fabric,60,150,1080,648);p.font='16px sans-serif';p.fillText(`${round} 次相遇 · ${generation} 代演化`,60,850);p.textAlign='right';p.fillText('金 · 木 · 水 · 火 · 土',1140,850);p.textAlign='left';$('#result-caption').textContent='每一缕线，都留在这里。';}
  function showResult(){makeResult();$('#completion').showModal();}
  $('#start').onclick=start;host.addEventListener('click',e=>{if(state!=='idle')return;const r=host.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);if(raycaster.intersectObject(model,true).length)start();});host.addEventListener('keydown',e=>{if(state==='idle'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();start();}});
  dial.addEventListener('pointerdown',e=>{if(state!=='handle'||drag)return;const r=dial.getBoundingClientRect();drag={id:e.pointerId,x:r.left+r.width/2,y:r.top+r.height/2};drag.a=Math.atan2(e.clientY-drag.y,e.clientX-drag.x);dial.setPointerCapture(e.pointerId);});
  dial.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<18)return;const a=Math.atan2(e.clientY-drag.y,e.clientX-drag.x);let delta=a-drag.a;delta=Math.atan2(Math.sin(delta),Math.cos(delta));turn(delta);drag.a=a;});
  dial.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;drag=null;finishTurn();});for(const event of ['pointercancel','lostpointercapture'])dial.addEventListener(event,()=>{drag=null;});
  dial.addEventListener('keydown',e=>{if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Enter',' '].includes(e.key)){e.preventDefault();turn((e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1)*Math.PI/2);finishTurn();}});
  $('#quarter').onclick=()=>{turn(Math.PI/2);finishTurn();};$('#next').onclick=next;$('#pause').onclick=()=>{paused=!paused;update();};$('#save').onclick=showResult;
  document.querySelectorAll('[data-element]').forEach((b,i)=>b.onclick=()=>{if(b.disabled)return;selected=i;heading(state==='handle'?`01 / 转动 · ${names[i]}`:'下一轮 / 已选线',state==='handle'?'转一圈，让相遇开始。':'让新的相遇发生。',`已选「${names[i]}」。${state==='handle'?'绕手柄拖动一圈后松手。':'点击「再转一圈」回到手柄。'}`);tone();update();});
  $('#about-open').onclick=()=>$('#about').showModal();document.querySelectorAll('.dialog-close').forEach(b=>b.onclick=()=>b.closest('dialog').close());$('#continue').onclick=()=>$('#completion').close();
  function reset(){flight=null;drag=null;cells.fill(0);trace.fill(0);woven.fill(0);collected.clear();round=generation=ticks=totalAngle=angle=0;selected=0;free=paused=false;crank.rotation.x=0;beater.position.z=0;pedals.position.y=0;dirty=true;document.body.classList.remove('is-playing');$('.stage-heading').hidden=true;$('.workbench').hidden=true;$('#leave').hidden=true;host.setAttribute('role','button');host.setAttribute('aria-label','点击织布机，进入五元编织体验');phase('idle');resize();$('#start').focus({preventScroll:true});}
  $('#leave').onclick=()=>{if(confirm('退出会清空当前画卷，确定返回织机首页吗？'))reset();};$('#new-game').onclick=()=>{if(confirm('重新编织会清空当前画卷，请先保存。继续吗？')){$('#completion').close();reset();}};
  $('#download').onclick=()=>{const a=document.createElement('a');a.href=$('#result').toDataURL('image/png');a.download=`五元编织-${Date.now()}.png`;a.click();};
  $('#sound').onclick=()=>{try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();sound=!sound;$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').textContent='声音 · '+(sound?'开':'关');tone();}catch{$('#sound').textContent='声音暂不可用';}};
  new ResizeObserver(resize).observe(host);document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);drag=null;if(document.hidden){audio?.suspend();}else{last=performance.now();if(sound)audio?.resume();raf=requestAnimationFrame(frame);}});
  window.weaveJourney={get state(){return state;},get generation(){return generation;},get progress(){return collected.size;},camera,model,surface,get turn(){return totalAngle;}};
  resize();update();raf=requestAnimationFrame(frame);
})();
