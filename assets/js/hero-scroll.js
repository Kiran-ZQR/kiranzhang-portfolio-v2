(() => {
  'use strict';
  const scene=document.querySelector('.hero-scroll');if(!scene)return;
  const stage=scene.querySelector('.hero-stage'),intro=scene.querySelector('.hero-intro'),next=scene.querySelector('.hero-next'),title=scene.querySelector('.hero-next-title'),seam=scene.querySelector('.hero-seam'),nav=document.querySelector('.main-nav'),masthead=document.querySelector('.masthead'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const rotating=document.createElement('i'),upper=document.createElement('i'),lower=document.createElement('i');
  rotating.className='hero-rotor';upper.className='hero-shutter-edge';lower.className='hero-shutter-edge';
  const lines=document.createElement('div');lines.className='hero-motion-lines';lines.setAttribute('aria-hidden','true');lines.append(rotating,upper,lower);seam.replaceWith(lines);
  let frame=0;
  const clamp=n=>Math.max(0,Math.min(1,n));
  function draw(){
    frame=0;const quiet=reduced.matches;
    document.documentElement.classList.toggle('hero-scene-ready',!quiet);
    if(quiet){scene.style.height='';stage.style.height='';intro.style.opacity='';intro.inert=false;next.inert=true;return}
    const navHeight=nav.offsetHeight,h=Math.max(440,innerHeight-navHeight),head=Math.max(0,masthead.getBoundingClientRect().bottom),bounds=scene.getBoundingClientRect(),span=innerHeight*1.65;
    scene.style.height=(h+span)+'px';stage.style.height=Math.max(380,h-head)+'px';stage.style.top=navHeight+'px';
    const p=clamp((navHeight-bounds.top)/span),turn=clamp(p/.60),open=clamp((p-.68)/.26),height=stage.clientHeight;
    const diagonal=Math.atan2(height,bounds.width)*180/Math.PI;
    // One full turn around the content viewport center, then align horizontally.
    const settle=clamp((p-.60)/.08),angle=diagonal+360*turn-diagonal*settle;
    rotating.style.width=(Math.hypot(bounds.width,height)+4)+'px';
    rotating.style.transform='translate(-50%,-50%) rotate('+angle+'deg)';
    rotating.style.opacity=p<.68?'1':'0';
    upper.style.top=(50*(1-open))+'%';lower.style.top=(50*(1+open))+'%';
    upper.style.opacity=lower.style.opacity=p>=.68&&open<1?'1':'0';
    // Background and all incoming copy share one symmetric clip.
    const inset=50*(1-open);next.style.clipPath='inset('+inset+'% 0 '+inset+'% 0)';
    next.style.visibility=open>0?'visible':'hidden';
    title.style.transform='translate3d(0,'+((1-open)*36)+'px,0)';
    intro.style.opacity=1-clamp((p-.47)/.21);
    intro.querySelector('.hero-bottom').style.opacity=1-clamp(p/.15);
    next.querySelector('a').style.opacity=clamp((open-.75)/.25);
    intro.inert=p>.5;next.inert=open<.9;
    scene.dataset.phase=p<.68?'rotate':open<1?'split':'complete';
    scene.dataset.rotation=angle.toFixed(2);
  }
  const request=()=>{if(!frame)frame=requestAnimationFrame(draw)};
  addEventListener('scroll',request,{passive:true});addEventListener('resize',request);addEventListener('pageshow',request);reduced.addEventListener('change',request);document.fonts.ready.then(request);draw();
})();
