(()=>{
 const primary='<a href="index.html#home">Home</a><a href="index.html#projects">Projects</a><a href="about.html">About</a><a href="resume.html">Resume</a>';
 let header=document.querySelector('.case-header,.multimedia-navigation');
 if(!header){
  const old=document.querySelector('.category-nav,body>header');
  if(!old||document.querySelector('.site-header'))return;
  const links=[...old.querySelectorAll('a')].map(a=>({href:a.getAttribute('href'),label:a.textContent,current:a.hasAttribute('aria-current')}));
  header=document.createElement('header');header.className='multimedia-navigation nav-dark';
  if(old.classList.contains('light'))header.classList.remove('nav-dark');
  header.innerHTML='<div class="detail-nav-shell"><div class="primary-island"><button class="island-orb"><img src="assets/index-previews/orb.webp" alt=""></button><nav class="case-nav" aria-label="Primary navigation"></nav></div><nav class="case-switcher" aria-label="Page navigation"></nav></div>';
  const switcher=header.querySelector('.case-switcher');
  links.forEach(({href,label,current})=>{const a=document.createElement('a');a.className='case-tab';a.href=label==='Resume'?'resume.html':href;a.textContent=label;if(current){a.classList.add('is-active');a.setAttribute('aria-current','page')}switcher.append(a)});
  old.replaceWith(header);
  if(location.pathname.endsWith('/resume.html'))document.body.classList.add('resume-navigation');
 }
 header.classList.add('unified-navigation');document.body.classList.add('has-unified-nav');
 const island=header.querySelector('.primary-island'),nav=island.querySelector('.case-nav');
 nav.innerHTML=primary;
 const directHome=['tencent-news.html','tencent-news-ai-tools.html','tencent-news-crop.html'].includes(location.pathname.split('/').pop());
 const oldOrb=island.querySelector('.island-orb'),button=document.createElement(directHome?'a':'button');
 button.className='island-orb';if(directHome){button.href='index.html#home';}else{button.type='button';}button.innerHTML=oldOrb.innerHTML;button.setAttribute('aria-label',directHome?'返回 Home 主页':'展开网站导航');oldOrb.replaceWith(button);
 nav.id='global-project-navigation';button.setAttribute('aria-controls',nav.id);
 header.querySelector('.case-switcher')?.style.setProperty('--tab-count',header.querySelectorAll('.case-switcher .case-tab').length);
 // Capture legacy toggles so all pages use one interaction state.
 const setOpen=open=>{island.classList.toggle('is-open',open);button.setAttribute('aria-expanded',String(open));nav.inert=!open;};
 setOpen(false);let pinned=false;
 if(!directHome)button.addEventListener('click',e=>{e.stopImmediatePropagation();pinned=!pinned;setOpen(pinned)});
 button.addEventListener('focus',()=>setOpen(true));
 island.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')setOpen(true)});
 island.addEventListener('pointerleave',()=>{if(!pinned&&!island.contains(document.activeElement))setOpen(false)});
 island.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(!island.contains(document.activeElement)){pinned=false;setOpen(false)}}));
 header.addEventListener('keydown',e=>{if(e.key==='Escape'){pinned=false;setOpen(false);button.focus()}if(e.target===button&&e.key==='ArrowDown'){e.preventDefault();setOpen(true);nav.querySelector('a').focus()}});
 document.addEventListener('pointerdown',e=>{if(!island.contains(e.target)){pinned=false;setOpen(false)}});
})();

