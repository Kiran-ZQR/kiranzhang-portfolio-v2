/* Native adapter of the Card Swap interaction, flat preset. Reference: https://reactbits.dev/components/card-swap */
(()=>{
 const stage=document.querySelector('.swap-stage'),cards=[...stage.children],reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let front=location.hash==='#sentaiment'?1:0,busy=false,paused=reduced.matches,timer,drag=null,suppressUntil=0,hovered=false;
 const pause=document.querySelector('#swap-pause');
 function sync(){cards.forEach((c,i)=>{c.dataset.front=String(i===front);c.querySelector('a').tabIndex=i===front?0:-1;});document.querySelector('#swap-status').textContent=`0${front+1} / 02`;pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'开启自动切换':'暂停自动切换');pause.textContent=paused?'▷':'Ⅱ';}
 function schedule(){clearTimeout(timer);if(!paused&&!reduced.matches&&!hovered&&!document.hidden&&!drag&&!stage.contains(document.activeElement))timer=setTimeout(()=>swap(),4500);}
 async function swap(dx=0,dy=0){if(busy)return;busy=true;clearTimeout(timer);const card=cards[front];
  if(!reduced.matches){
   const exit=card.animate([{transform:card.style.transform||'translate3d(0,0,0)'},{transform:`translate3d(${dx*.8}px,${Math.max(230,dy+200)}px,20px) rotate(${dx*.02}deg)`,opacity:0}],{duration:360,easing:'cubic-bezier(.4,0,.8,.4)',fill:'forwards'});
   await exit.finished.catch(()=>{});front=1-front;card.style.transform='';sync();exit.cancel();
   const target=getComputedStyle(card).transform;const enter=card.animate([{transform:`translate3d(48px,170px,-140px)`,opacity:0},{transform:target,opacity:1}],{duration:550,easing:'cubic-bezier(.16,1,.3,1)'});await enter.finished.catch(()=>{});
  }else{front=1-front;card.style.transform='';sync();}
  busy=false;schedule();
 }
 stage.addEventListener('pointerdown',e=>{if(busy||e.button>0||e.target.closest('a'))return;const card=e.target.closest('.swap-card');if(card!==cards[front]){swap();return;}drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0,card};clearTimeout(timer);});
 stage.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;drag.dx=e.clientX-drag.x;drag.dy=e.clientY-drag.y;if(Math.hypot(drag.dx,drag.dy)>7){stage.setPointerCapture(e.pointerId);drag.card.style.transition='none';drag.card.style.transform=`translate3d(${drag.dx}px,${drag.dy}px,0) rotate(${drag.dx*.025}deg)`;}});
 function release(e){if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);d.card.style.transition='';if(e.type!=='pointercancel'&&Math.hypot(d.dx,d.dy)>65){suppressUntil=performance.now()+600;swap(d.dx,d.dy);}else{d.card.style.transform='';schedule();}}
 stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
 stage.addEventListener('click',e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopPropagation();}});
 stage.addEventListener('pointerenter',()=>{hovered=true;clearTimeout(timer)});stage.addEventListener('pointerleave',()=>{hovered=false;schedule()});
 stage.addEventListener('focusin',()=>clearTimeout(timer));stage.addEventListener('focusout',()=>setTimeout(schedule,0));
 document.querySelector('#swap-next').onclick=()=>swap();pause.onclick=()=>{paused=!paused;sync();schedule()};
 document.addEventListener('visibilitychange',schedule);window.addEventListener('pagehide',()=>clearTimeout(timer));reduced.addEventListener('change',()=>{paused=reduced.matches;sync();schedule()});
 sync();schedule();
})();
