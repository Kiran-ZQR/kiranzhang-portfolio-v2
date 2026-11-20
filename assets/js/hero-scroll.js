(() => {
  'use strict';
  const scene=document.querySelector('.hero-scroll');if(!scene)return;
  const stage=scene.querySelector('.hero-stage'),intro=scene.querySelector('.hero-intro'),next=scene.querySelector('.hero-next'),statement=intro.querySelector('.hero-statement'),title=next.querySelector('.hero-next-title'),link=next.querySelector('a'),nav=document.querySelector('.main-nav'),masthead=document.querySelector('.masthead'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const mask=document.createElement('div'),story=document.createElement('div'),description=document.createElement('div'),heading=document.createElement('div'),grid=document.createElement('div');
  mask.className='hero-story-mask';story.className='hero-story';description.className='hero-description-row';heading.className='hero-heading-row';grid.className='hero-motion-grid';grid.setAttribute('aria-hidden','true');
  for(let i=0;i<3;i++)grid.append(document.createElement('i'));
  description.append(statement);heading.append(title);story.append(description,heading,link);mask.append(story);stage.prepend(grid,mask);next.remove();stage.querySelector('.hero-seam')?.remove();
  let frame=0;
  const clamp=n=>Math.max(0,Math.min(1,n));
  function draw(){
    frame=0;const quiet=reduced.matches;
    document.documentElement.classList.toggle('hero-scene-ready',!quiet);
    if(quiet){scene.style.height='';scene.style.marginTop='';stage.style.height='';story.style.transform='';intro.style.transform='';intro.inert=false;link.inert=true;mask.classList.remove('is-masked');return}
    const h=innerHeight,w=stage.clientWidth,opening=masthead.getBoundingClientRect().height+nav.getBoundingClientRect().height;
    stage.style.height=h+'px';scene.style.marginTop=-opening+'px';
    // The source composition uses one viewport for its opening, then continues
    // its typography below it. Both pieces of text share one translating plane.
    const mobile=w<=800,gap=Math.max(64,Math.min(150,h*.12));
    const descriptionTop=mobile?Math.max(.53*h,opening+100):Math.max(.4925*h,opening+gap);
    stage.style.setProperty('--description-top',descriptionTop+'px');
    stage.style.setProperty('--description-height',(h-descriptionTop)+'px');
    stage.style.setProperty('--heading-gap',(mobile?.17:.195)*h+'px');
    stage.style.setProperty('--story-bottom',(.5*h+title.getBoundingClientRect().height/6)+'px');
    const travel=Math.max(0,story.scrollHeight-h);
    scene.style.height=(h+travel)+'px';
    const y=clamp(-scene.getBoundingClientRect().top/Math.max(1,travel))*travel;
    document.documentElement.classList.toggle('hero-nav-overlay',scene.getBoundingClientRect().bottom>nav.offsetHeight+24);
    // Calibrated to the source: diagonal from the viewport aspect ratio, ending
    // at a horizontal 50% boundary after 65% of one viewport has been scrolled.
    const start=Math.atan2(h,w)*180/Math.PI-180,progress=clamp(y/(h*.65)),angle=start*(1-progress);
    stage.style.setProperty('--story-angle',angle.toFixed(4)+'deg');
    story.style.transform='translate3d(0,'+(-y)+'px,0)';
    intro.style.transform='translate3d(0,'+(-y)+'px,0)';
    mask.classList.toggle('is-masked',y>h*.12);
    intro.querySelector('.hero-bottom').style.opacity=1-clamp(y/(h*.12));
    intro.inert=y>h*.12;link.inert=true;
    scene.dataset.phase=progress<1?'rotating-mask':'horizontal-mask';scene.dataset.rotation=angle.toFixed(4);scene.dataset.storyScroll=y.toFixed(2);
  }
  const request=()=>{if(!frame)frame=requestAnimationFrame(draw)};
  addEventListener('scroll',request,{passive:true});addEventListener('resize',request);addEventListener('pageshow',request);reduced.addEventListener('change',request);document.fonts.ready.then(request);draw();
})();
