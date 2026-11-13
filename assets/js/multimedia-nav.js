(() => {
 document.querySelectorAll('.category-nav,.reference-nav,.reference-brand').forEach(el=>el.remove());
 const isSent=location.pathname.endsWith('/sentaiment.html'),isLoom=location.pathname.endsWith('/life-weave.html');
 const header=document.createElement('header');header.className='multimedia-navigation'+(isLoom?'':' nav-dark');
 header.innerHTML=`<div class="detail-nav-shell"><div class="primary-island"><button class="island-orb" type="button" aria-label="展开网站导航" aria-expanded="false"><img src="assets/index-previews/orb.webp" alt=""></button><nav class="case-nav" aria-label="Primary navigation"><a href="index.html#home">Home</a><a href="index.html#projects">Projects</a><a href="index.html#about">About</a></nav></div><nav class="case-switcher" aria-label="Multimedia projects"><a class="case-tab ${isLoom?'is-active':''}" ${isLoom?'aria-current="page"':''} data-index="01" href="life-weave.html">生命之轮</a><a class="case-tab ${isSent?'is-active':''}" ${isSent?'aria-current="page"':''} data-index="02" href="sentaiment.html">SentAIment</a></nav></div>`;
 document.body.prepend(header);const island=header.querySelector('.primary-island'),button=header.querySelector('button');
 button.onclick=()=>{const open=island.classList.toggle('is-open');button.setAttribute('aria-expanded',String(open));};
 header.addEventListener('keydown',e=>{if(e.key==='Escape'){island.classList.remove('is-open');button.setAttribute('aria-expanded','false');button.focus();}});
 document.addEventListener('pointerdown',e=>{if(!header.contains(e.target)){island.classList.remove('is-open');button.setAttribute('aria-expanded','false');}});
})();
