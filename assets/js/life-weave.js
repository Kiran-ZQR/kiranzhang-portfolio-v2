(() => {
  'use strict';
  const $=s=>document.querySelector(s), core=window.LifeWeaveCore;
  const canvas=$('#loom'),ctx=canvas.getContext('2d');
  const W=100,H=44, colors=['#68916b','#ca7864','#a68f66','#b69b45','#6b95af'],names=['木','火','土','金','水'];
  let cells=new Uint8Array(W*H),trace=new Uint8Array(W*H),cloth=new Uint8Array(W*H);
  let started=false,selected=0,generation=0,roundTicks=0,planted=false,paused=false,weaving=false,free=false;
  let collected=new Set(),history=[],width=1200,height=540,last=0,elapsed=0,raf=0,phase=0;
  let cursor={x:50,y:22},pointer={x:.5,y:.5},rings=[],weaveStart=0,keyboardCursor=false;
  let audio=null,sound=false,dialogPaused=false;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const buttons=[...document.querySelectorAll('[data-element]')];
  const threads=$('#threads');for(let i=0;i<5;i++)threads.append(document.createElement('i'));
  function resize(){const b=canvas.getBoundingClientRect();width=b.width;height=b.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw(performance.now());}
  new ResizeObserver(resize).observe(canvas);
  function geometry(){const s=Math.min((width-32)/W,(height-94)/H);return{s,x:(width-W*s)/2,y:(height-H*s)/2};}
  function tone(index=selected){if(!sound||!audio)return;audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=[261.63,329.63,392,440,523.25][index];gain.gain.setValueAtTime(0,audio.currentTime);gain.gain.linearRampToValueAtTime(.075,audio.currentTime+.015);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.8);osc.connect(gain).connect(audio.destination);osc.start();osc.stop(audio.currentTime+.85);}
  function setInstruction(text){$('#instruction').textContent=text;}
  function syncSteps(){const stage=weaving||roundTicks>=12?2:planted?1:free?3:0;document.querySelectorAll('[data-stage]').forEach((el,i)=>{el.classList.toggle('is-current',i===stage);if(i===stage)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});buttons.forEach(b=>b.disabled=weaving||planted);$('#plant').disabled=weaving;$('#pause').disabled=weaving||!planted;$('#thread-note').textContent=`已完成 ${collected.size} / 5 种元素 · ${free?'可继续创作': '集齐后可保存画卷'}`;}
  function select(i){if(weaving||planted)return;if(i!==selected){planted=false;roundTicks=0;}selected=i;buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));document.documentElement.style.setProperty('--accent',colors[i]);if(started&&!weaving){if(collected.has(i)&&!free)setInstruction('这缕线已经织入。选择还未完成的五行，或继续在画布上播种。');else setInstruction(`已选${names[i]}。点击画布或「落下一颗种子」，让它与已有生命相遇。`);update();}tone(i);}
  function plant(x,y){if(!started||weaving)return;
    // A seed is repeated along warp and weft, echoing the original textile motifs.
    for(const [cx,cy] of [[x,y],[W-1-x,y],[x,H-1-y],[W-1-x,H-1-y]]){
      for(const [dx,dy] of [[0,0],[-6,0],[6,0],[0,-6],[0,6]])core.plant(cells,W,H,cx+dx,cy+dy,selected);
    }
    for(let i=0;i<cells.length;i++)if(cells[i])trace[i]=cells[i];planted=true;paused=false;cursor={x,y};rings.push({x,y,t:performance.now(),color:colors[selected]});tone();$('#chapter').textContent='02 / 演化';$('#play-title').textContent='看，这缕线正在生长。';setInstruction(`「${names[selected]}」正在演化，约 2 秒后即可织入。还可以点击画布，补充更多种子。`);update();}
  function autoPlant(){plant(14+Math.floor(Math.random()*72),9+Math.floor(Math.random()*26));}
  function update(){syncSteps();const pop=cells.reduce((n,v)=>n+!!v,0);$('#generation').textContent=String(generation).padStart(3,'0');$('#population').textContent=pop;$('#progress').textContent=`${collected.size} / 5`;$('#weave').disabled=weaving||!planted||roundTicks<12;$('#weave').textContent=weaving?'正在编织…':(planted&&roundTicks<12?`演化 ${roundTicks} / 12`:'织入画卷 ↗');buttons.forEach((b,i)=>b.classList.toggle('woven',collected.has(i)));[...threads.children].forEach((b,i)=>{b.style.background=collected.has(i)?colors[i]:'';});$('#pause').textContent=paused?'继续演化 ▷':'暂停演化 Ⅱ';$('#pause').setAttribute('aria-pressed',String(paused));$('#live-label').innerHTML=`<i></i> ${weaving?'相遇正在成为纹理':paused?'时间暂时停驻':!planted?'选线后，点击画布播种':'生命正在演化'}`;}
  function start(){started=true;document.body.classList.add('playing');$('.journey').hidden=false;$('.introduction').hidden=true;$('.intro-action').hidden=true;$('.play-heading').hidden=false;$('.controls').hidden=false;$('#play-status').hidden=false;$('#canvas-label').textContent='点击画布播种 · 或使用下方播种按钮';$('#chapter').textContent='01 / 选择';$('#play-title').textContent='先选一缕线，再点击画布播种。';select(0);resize();canvas.focus({preventScroll:true});update();}
  function reset(){cells.fill(0);trace.fill(0);cloth.fill(0);collected.clear();history=[];generation=roundTicks=0;planted=paused=weaving=free=false;rings=[];document.body.classList.remove('weaving');start();}
  function weave(){if($('#weave').disabled)return;weaving=true;weaveStart=performance.now();document.body.classList.add('weaving');$('#chapter').textContent='03 / 编织';$('#play-title').textContent='把这一刻，留在彼此的纹理里。';setInstruction('织梭经过，演化留下的痕迹成为新的经纬。');tone();update();}
  function finishWeave(){weaving=false;document.body.classList.remove('weaving');for(let i=0;i<cloth.length;i++)if(trace[i])cloth[i]=trace[i];collected.add(selected);history.push({element:selected,generation});trace.fill(0);roundTicks=0;planted=false;update();if(collected.size===5&&!free){makeResult();$('#completion').showModal();dialogPaused=true;return;}$('#chapter').textContent=free?'∞ / 自由编织':`0${Math.min(collected.size+1,5)} / 再次相遇`;$('#play-title').textContent=free?'生命画卷，没有终点。':`已织入${collected.size}缕线。让下一次相遇发生。`;if(!free)select([0,1,2,3,4].find(i=>!collected.has(i)));else setInstruction('继续播种与编织。点击「保存画卷」随时留住这一刻。');}
  function tick(){cells=core.step(cells,W,H);generation++;if(planted)roundTicks++;for(let i=0;i<cells.length;i++)if(cells[i])trace[i]=cells[i];if(planted&&roundTicks===12)setInstruction('这一刻已经留下痕迹。点击「织入画卷」，收下这次相遇。');if(generation%2===0)update();}
  function line(x1,y1,x2,y2,color){ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  function drawIntro(t){
    const time=reduce.matches?0:t*.00035,cx=width/2,cy=height*.44;
    const size=Math.min(width*.56,560),h=Math.min(height*.42,175);
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-.09);
    // Fine interlaced warp and weft form a floating textile, not a pixel ring.
    for(let layer=0;layer<2;layer++)for(let n=0;n<85;n++){
      const q=n/84;ctx.beginPath();ctx.strokeStyle=colors[Math.min(4,Math.floor(q*5))];ctx.globalAlpha=layer?.40:.62;ctx.lineWidth=layer?1.15:1.6;
      for(let k=0;k<=100;k++){const u=k/100;let x,y;
        if(!layer){x=(u-.5)*size;y=(q-.5)*h+Math.sin(u*Math.PI*2+q*2+time)*20*Math.sin(u*Math.PI);}
        else{x=(q-.5)*size;y=(u-.5)*h+Math.sin(q*Math.PI*2+u*2+time)*20*Math.sin(q*Math.PI);}
        x+=(pointer.x-.5)*6;y+=(pointer.y-.5)*4;
        if(!k)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }ctx.stroke();
    }ctx.restore();ctx.globalAlpha=1;
  }
  function drawGame(t){const g=geometry(),s=g.s;ctx.lineWidth=.5;for(let x=0;x<=W;x+=2)line(g.x+x*s,g.y,g.x+x*s,g.y+H*s,'#a9bea90e');for(let y=0;y<=H;y+=2)line(g.x,g.y+y*s,g.x+W*s,g.y+y*s,'#a9bea909');
    for(let i=0;i<cells.length;i++){const x=i%W,y=Math.floor(i/W),px=g.x+x*s,py=g.y+y*s;if(cloth[i]){ctx.globalAlpha=.25;ctx.fillStyle=colors[cloth[i]-1];ctx.fillRect(px,py,s*.85,s*.85);}if(trace[i]&&!cells[i]){ctx.globalAlpha=.22;ctx.fillStyle=colors[trace[i]-1];ctx.fillRect(px,py,s*.8,s*.8);}if(cells[i]){ctx.globalAlpha=.95;ctx.fillStyle=colors[cells[i]-1];ctx.fillRect(px,py,s*.8,s*.8);ctx.globalAlpha=.12;ctx.fillRect(px-s*.4,py-s*.4,s*1.6,s*1.6);}}
    ctx.globalAlpha=1;
    if(!planted&&collected.size===0){ctx.textAlign='center';ctx.fillStyle='#9eab98';ctx.font='13px Arial';ctx.fillText('在这里，落下第一颗种子。',width/2,height/2-8);ctx.fillStyle='#63715e';ctx.font='10px Arial';ctx.fillText('点击任意位置 · 或使用下方按钮',width/2,height/2+16);}
    if(keyboardCursor){const x=g.x+cursor.x*s,y=g.y+cursor.y*s;ctx.strokeStyle=colors[selected];ctx.strokeRect(x-s*2,y-s*2,s*5,s*5);}
    rings=rings.filter(v=>t-v.t<900);if(!reduce.matches)rings.forEach(v=>{const p=(t-v.t)/900;ctx.globalAlpha=(1-p)*.6;ctx.strokeStyle=v.color;ctx.beginPath();ctx.arc(g.x+v.x*s,g.y+v.y*s,(2+p*8)*s,0,Math.PI*2);ctx.stroke();});ctx.globalAlpha=1;
    if(weaving){const p=Math.min(1,(t-weaveStart)/(reduce.matches?200:1600)),y=g.y+H*s*p;const glow=ctx.createLinearGradient(0,y-35,0,y);glow.addColorStop(0,'#b9cd9a00');glow.addColorStop(1,'#b9cd9a22');ctx.fillStyle=glow;ctx.fillRect(g.x,y-35,W*s,35);line(g.x,y,g.x+W*s,y,'#d5e2bb');if(p>=1)finishWeave();}}
  function draw(t){ctx.clearRect(0,0,width,height);if(started)drawGame(t);else drawIntro(t);}
  function frame(t){const dt=Math.min(t-last,100);last=t;if(dialogPaused){if(weaving)weaveStart+=dt;}else{if(started&&planted&&!paused&&!weaving){elapsed+=dt;if(elapsed>=160){elapsed=0;tick();}}draw(t);}raf=requestAnimationFrame(frame);}
  function makeResult(){const c=$('#result'),p=c.getContext('2d');p.fillStyle='#f8f7f2';p.fillRect(0,0,c.width,c.height);p.fillStyle='#344b39';p.font='26px sans-serif';p.fillText('生命之轮：五元编织',60,65);p.fillStyle='#69785d';p.font='12px monospace';p.fillText('YOUR ENCOUNTERS, WOVEN TOGETHER.',60,94);
    // Mirror and repeat the recorded Life traces into a woven textile; no remote images taint export.
    const unit=6;for(let y=0;y<104;y++)for(let x=0;x<180;x++){const sx=(x%100<50?x%100:99-x%100),sy=(y%44<22?y%44:43-y%44);const v=cloth[sy*W+sx]||cloth[(H-1-sy)*W+(W-1-sx)];const i=(x*7+y*11+history.length)%5;p.globalAlpha=v?.82:.13;p.fillStyle=colors[v?v-1:i];p.fillRect(60+x*unit,138+y*unit,4.9,4.8);}p.globalAlpha=1;p.fillStyle='#69785d';p.font='16px sans-serif';p.fillText('金 · 木 · 水 · 火 · 土',60,811);p.font='13px monospace';p.fillText(`${history.length} ENCOUNTERS / ${generation} GENERATIONS`,60,844);p.fillStyle='#344b39';p.textAlign='right';p.fillText('相遇成纹。',1140,844);p.textAlign='left';$('#result-caption').textContent=`${history.length} 次编织 · ${generation} 代演化 · 只属于这次相遇`;
  }
  function showResult(){makeResult();dialogPaused=true;$('#completion').showModal();}
  buttons.forEach((b,i)=>b.addEventListener('click',()=>{if(!weaving)select(i);}));
  $('#start').addEventListener('click',start);$('#plant').addEventListener('click',autoPlant);$('#weave').addEventListener('click',weave);
  $('#pause').addEventListener('click',()=>{paused=!paused;update();});
  $('#restart').addEventListener('click',()=>{if(free){showResult();return;}if(!history.length&&!planted||confirm('重新开始会清空当前尚未保存的画卷，继续吗？'))reset();});
  canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};});
  canvas.addEventListener('pointerdown',e=>{if(!started)return;keyboardCursor=false;const r=canvas.getBoundingClientRect(),g=geometry();const x=Math.floor((e.clientX-r.left-g.x)/g.s),y=Math.floor((e.clientY-r.top-g.y)/g.s);if(x>=0&&x<W&&y>=0&&y<H)plant(x,y);});
  canvas.addEventListener('keydown',e=>{if(!started)return;const keys={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]};if(keys[e.key]){e.preventDefault();keyboardCursor=true;cursor.x=Math.max(2,Math.min(W-3,cursor.x+keys[e.key][0]));cursor.y=Math.max(2,Math.min(H-3,cursor.y+keys[e.key][1]));}if(e.key==='Enter'){e.preventDefault();plant(cursor.x,cursor.y);}});
  document.addEventListener('keydown',e=>{if(!started||document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey)return;if(/^[1-5]$/.test(e.key)&&!weaving)select(Number(e.key)-1);if(e.code==='Space'&&!/BUTTON|A|INPUT|TEXTAREA|SUMMARY/.test(e.target.tagName)){e.preventDefault();paused=!paused;update();}});
  $('#sound').addEventListener('click',()=>{try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();sound=!sound;$('#sound').setAttribute('aria-pressed',String(sound));$('#sound span').textContent=sound?'开':'关';tone();}catch{$('#sound span').textContent='不可用';}});
  $('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('#fullscreen').textContent='不支持全屏';}});
  $('#about-open').addEventListener('click',()=>{dialogPaused=true;$('#about').showModal();});
  document.querySelectorAll('.dialog-close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',()=>{dialogPaused=false;if(d.id==='completion'){free=true;$('#restart').textContent='保存画卷 ↓';$('#chapter').textContent='∞ / 自由编织';$('#play-title').textContent='生命画卷，没有终点。';setInstruction('五行已交织。继续播种，或点击右上角保存画卷。');update();}}));
  $('#continue').addEventListener('click',()=>$('#completion').close());
  $('#new-game').addEventListener('click',()=>{if(confirm('请先保存想保留的画卷。现在重新编织吗？')){$('#completion').close();setTimeout(()=>{$('#restart').textContent='重新开始 ↺';reset();},0);}});
  $('#download').addEventListener('click',()=>{const a=document.createElement('a');a.href=$('#result').toDataURL('image/png');a.download=`五元编织-${Date.now()}.png`;document.body.append(a);a.click();a.remove();});
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);if(document.hidden){if(audio)audio.suspend();}else{const now=performance.now();if(weaving)weaveStart+=now-last;last=now;if(sound&&audio)audio.resume();raf=requestAnimationFrame(frame);}});
  resize();raf=requestAnimationFrame(frame);
})();
