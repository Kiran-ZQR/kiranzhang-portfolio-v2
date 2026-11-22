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
  const animate = (el,frames,options) => el.animate(frames,{duration:700,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards',...options});
  const nextPaint=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  async function arrivalReady(target){
    // Let the destination's deferred navigation and content scripts finish layout.
    await nextPaint();
    const visibleImages=[...target.querySelectorAll('img')].filter(img=>{const r=img.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<innerHeight}).slice(0,4);
    let timeout;
    try{await Promise.race([Promise.allSettled([document.fonts.ready,...visibleImages.map(img=>img.decode())]),new Promise(resolve=>{timeout=setTimeout(resolve,1600)})])}finally{clearTimeout(timeout)}
    await nextPaint();
  }
  function reveal(target) {
    if(reduced.matches) return;
    // One coherent arrival avoids separate heading masks snapping through artwork.
    target.animate([{opacity:.55},{opacity:1}],{duration:1050,easing:'cubic-bezier(.16,1,.3,1)'});
  }
  async function uncover(target) {
    curtain.classList.add('is-active');
    curtain.dataset.phase='preparing';
    await arrivalReady(target);
    if(reduced.matches){curtain.classList.remove('is-active');root.classList.remove('route-arriving');return}
    curtain.dataset.phase='opening';
    reveal(target);
    routeLine.getAnimations().forEach(a=>a.cancel());routeLine.style.opacity='0';
    await Promise.all([
      animate(topPanel,[{transform:'translateY(0)'},{transform:'translateY(-101%)'}],{duration:1100,easing:'cubic-bezier(.16,1,.3,1)'}).finished,
      animate(bottomPanel,[{transform:'translateY(0)'},{transform:'translateY(101%)'}],{duration:1100,easing:'cubic-bezier(.16,1,.3,1)'}).finished
    ]);
    curtain.classList.remove('is-active');curtain.dataset.phase='idle';root.classList.remove('route-arriving');
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
      curtain.dataset.phase='closing';
      routeLine.style.opacity='1';
      animate(routeLine,[{transform:'translate(-50%,-50%) scaleX(0)',opacity:0},{transform:'translate(-50%,-50%) scaleX(1)',opacity:.65}],{duration:700});
      await Promise.all([
        animate(topPanel,[{transform:'translateY(-101%)'},{transform:'translateY(0)'}],{duration:700}).finished,
        animate(bottomPanel,[{transform:'translateY(101%)'},{transform:'translateY(0)'}],{duration:700}).finished
      ]);
      document.querySelectorAll('.inner-picker[open]').forEach(picker=>picker.open=false);
      if(target){
        const nav=document.querySelector('.main-nav,.v2-global');
        const navHeight=parseFloat(getComputedStyle(root).getPropertyValue('--inner-nav-height'))||(nav?.offsetHeight||68);
        const top=url.hash==='#home'?0:target.getBoundingClientRect().top+scrollY-navHeight-22;
        scrollTo({top:Math.max(0,top),behavior:'instant'});
        history.pushState(null,'',url.hash);
        target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
        await uncover(target);navigating=false;
      }else{session.set('kiran-route','1');location.assign(url.href)}
    }catch{navigating=false;curtain.classList.remove('is-active');root.classList.remove('route-arriving');location.assign(url.href)}
  });
  // Warm only a real hovered/focused project destination; no background route crawl.
  const warmed=new Set();
  const warm=event=>{const a=event.target.closest('.collection-index a,.collection-open,.case-forward-link,.inner-local a');if(!a)return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||url.pathname===location.pathname||warmed.has(url.href))return;warmed.add(url.href);const hint=document.createElement('link');hint.rel='prefetch';hint.as='document';hint.href=url.href;document.head.append(hint)};
  document.addEventListener('pointerover',warm,{passive:true});document.addEventListener('focusin',warm);
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
