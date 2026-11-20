(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const session = { get(k) {try{return sessionStorage.getItem(k)}catch{return null}}, set(k,v) {try{sessionStorage.setItem(k,v)}catch{}}, remove(k) {try{sessionStorage.removeItem(k)}catch{}} };
  document.querySelectorAll('.main-nav a:not(.nav-symbol),.v2-global a:not(.v2-brand)').forEach(a => {
    const text = a.textContent.trim();
    a.setAttribute('aria-label', text);
    const wrap = document.createElement('span'); wrap.className = 'nav-roll'; wrap.setAttribute('aria-hidden','true');
    for(let i=0;i<2;i++){const span=document.createElement('span');span.textContent=text;wrap.append(span)}
    a.replaceChildren(wrap);
  });
  const curtain = document.createElement('div'); curtain.className='route-curtain';curtain.setAttribute('aria-hidden','true');
  const topPanel=document.createElement('div'),bottomPanel=document.createElement('div'),routeLine=document.createElement('i');
  topPanel.className='route-panel route-panel--top';bottomPanel.className='route-panel route-panel--bottom';routeLine.className='route-line';
  curtain.append(topPanel,bottomPanel,routeLine);document.body.append(curtain);
  const animate = (el,frames,options) => el.animate(frames,{duration:500,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards',...options});
  function reveal(target) {
    if(reduced.matches) return;
    target.querySelectorAll('h1,h2,h3,.hero-statement,.project-media,.ab-mission').forEach((el,i)=> {
      if(el.getBoundingClientRect().top > innerHeight) return;
      el.animate([{clipPath:'inset(100% 0 0 0)',transform:'translateY(26px)'},{clipPath:'inset(0)',transform:'translateY(0)'}],{duration:850,delay:Math.min(i*55,220),easing:'cubic-bezier(.22,1,.36,1)'});
    });
  }
  async function uncover(target) {
    curtain.classList.add('is-active');
    reveal(target);
    routeLine.getAnimations().forEach(a=>a.cancel());routeLine.style.opacity='0';
    await Promise.all([
      animate(topPanel,[{transform:'translateY(0)'},{transform:'translateY(-101%)'}],{duration:700}).finished,
      animate(bottomPanel,[{transform:'translateY(0)'},{transform:'translateY(101%)'}],{duration:700}).finished
    ]);
    curtain.classList.remove('is-active');root.classList.remove('route-arriving');
  }
  if(session.get('kiran-route')) {
    session.remove('kiran-route');
    root.classList.add('route-arriving');
    if(!reduced.matches) uncover(document.querySelector('main') || document.body);
    else root.classList.remove('route-arriving');
  }
  let navigating=false;
  document.addEventListener('click',async e=>{
    const a=e.target.closest('a[href]');
    if(!a || e.defaultPrevented || e.button!==0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download') || a.classList.contains('skip-link'))return;
    const url=new URL(a.href,location.href);
    if(url.origin!==location.origin || !/\.html$|\/$/.test(url.pathname))return;
    const same=url.pathname===location.pathname;
    const target=same && url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
    if(same&&!target)return;
    if(reduced.matches)return;
    e.preventDefault();if(navigating)return;navigating=true;
    try{
      curtain.classList.add('is-active');
      const diagonal=Math.atan2(innerHeight,innerWidth)*180/Math.PI;
      routeLine.style.opacity='1';
      animate(routeLine,[{transform:'translate(-50%,-50%) rotate('+diagonal+'deg)',opacity:0},{opacity:1,offset:.15},{transform:'translate(-50%,-50%) rotate('+(diagonal+360)+'deg)',opacity:1,offset:.8},{transform:'translate(-50%,-50%) rotate(360deg)',opacity:0}],{duration:650});
      await Promise.all([
        animate(topPanel,[{transform:'translateY(-101%)'},{transform:'translateY(0)'}],{duration:650}).finished,
        animate(bottomPanel,[{transform:'translateY(101%)'},{transform:'translateY(0)'}],{duration:650}).finished
      ]);
      if(target){
        const nav=document.querySelector('.main-nav,.v2-global');
        const top=url.hash==='#home'?0:target.getBoundingClientRect().top+scrollY-(nav?.offsetHeight||68)-22;
        scrollTo({top:Math.max(0,top),behavior:'instant'});
        history.pushState(null,'',url.hash);
        target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
        await uncover(target);navigating=false;
      }else{session.set('kiran-route','1');location.assign(url.href)}
    }catch{navigating=false;curtain.classList.remove('is-active');root.classList.remove('route-arriving');location.assign(url.href)}
  });
  addEventListener('pageshow',e=>{if(e.persisted){navigating=false;curtain.querySelectorAll('*').forEach(el=>el.getAnimations().forEach(a=>a.cancel()));curtain.classList.remove('is-active');root.classList.remove('route-arriving')}});
  // Native pointer remains on touch devices and until the first real pointer event.
  const cursor=document.createElement('div');cursor.className='site-cursor';cursor.setAttribute('aria-hidden','true');document.body.append(cursor);
  document.addEventListener('pointermove',e=>{
    if(!fine.matches || e.pointerType!=='mouse')return;
    root.classList.add('has-circle-cursor');cursor.classList.add('is-active');
    cursor.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0)`;
    cursor.classList.toggle('is-link',!!e.target.closest('a,button,[role="button"]'));
  },{passive:true});
  const hide=()=>{cursor.classList.remove('is-active');root.classList.remove('has-circle-cursor')};
  document.addEventListener('pointerleave',hide);addEventListener('blur',hide);fine.addEventListener('change',hide);
})();
