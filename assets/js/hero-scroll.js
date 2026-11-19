(() => {
  'use strict';
  const scene=document.querySelector('.hero-scroll');if(!scene)return;
  const stage=scene.querySelector('.hero-stage'),intro=scene.querySelector('.hero-intro'),next=scene.querySelector('.hero-next'),title=scene.querySelector('.hero-next-title'),line=scene.querySelector('.hero-seam line'),nav=document.querySelector('.main-nav'),masthead=document.querySelector('.masthead'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let frame=0,span=1;
  const clamp=n=>Math.max(0,Math.min(1,n));
  function draw(){
    frame=0;const quiet=reduced.matches;
    document.documentElement.classList.toggle('hero-scene-ready',!quiet);
    if(quiet){scene.style.height='';stage.style.height='';intro.inert=false;next.inert=true;intro.querySelector('.hero-bottom').style.opacity='';return}
    const navHeight=nav.offsetHeight,h=Math.max(440,innerHeight-navHeight),head=Math.max(0,masthead.getBoundingClientRect().bottom),bounds=scene.getBoundingClientRect();span=innerHeight*1.35;
    scene.style.height=`${h+span}px`;stage.style.height=`${Math.max(380,h-head)}px`;stage.style.top=`${navHeight}px`;
    const p=clamp((navHeight-bounds.top)/span),q=clamp((p-.25)/.75),edge=Math.max(380,h-head)/bounds.width*100,travel=100+edge,top=q*travel,bottom=p<.25?100-p/.25*travel:top-edge;
    next.style.clipPath=`polygon(0 0,${top}% 0,${bottom}% 100%,0 100%)`;
    next.style.visibility=p<.25?'hidden':'visible';
    title.style.transform=`translate3d(0,${(1-q)*12}vh,0)`;
    line.setAttribute('x1',top*10);line.setAttribute('x2',bottom*10);
    intro.querySelector('.hero-bottom').style.opacity=1-clamp((p-.25)/.3);next.querySelector('a').style.opacity=clamp((q-.75)/.25);
    intro.inert=p>.55;next.inert=q<.75;
    scene.dataset.phase=p<=.25?'turn':p<.99?'wipe':'complete';
  }
  const request=()=>{if(!frame)frame=requestAnimationFrame(draw)};
  addEventListener('scroll',request,{passive:true});addEventListener('resize',request);addEventListener('pageshow',request);reduced.addEventListener('change',request);document.fonts.ready.then(request);draw();
})();
