(() => {
 const header=document.createElement('header');header.className='multimedia-navigation nav-dark aigc-navigation';
 const items=[['cinema','The Fortress'],['forest','The Rococo'],['worlds','角色场景'],['experiments','视觉实验']];
 header.innerHTML=`<div class="detail-nav-shell"><div class="primary-island"><button class="island-orb" type="button" aria-label="展开网站导航" aria-expanded="false"><img src="assets/index-previews/orb.webp" alt=""></button><nav class="case-nav" aria-label="Primary navigation"><a href="index.html#home">Home</a><a href="index.html#projects">Projects</a><a href="index.html#about">About</a></nav></div><nav class="case-switcher" aria-label="AIGC projects">${items.map(([id,label],i)=>`<a class="case-tab" data-index="0${i+1}" href="#${id}">${label}</a>`).join('')}</nav></div>`;
 document.body.prepend(header);const island=header.querySelector('.primary-island'),button=header.querySelector('button');
 const close=()=>{island.classList.remove('is-open');button.setAttribute('aria-expanded','false')};
 button.onclick=()=>{const open=island.classList.toggle('is-open');button.setAttribute('aria-expanded',String(open))};
 header.addEventListener('keydown',e=>{if(e.key==='Escape'){close();button.focus()}});document.addEventListener('pointerdown',e=>{if(!header.contains(e.target))close()});
 const tabs=[...header.querySelectorAll('.case-tab')];const select=id=>tabs.forEach(t=>{const active=t.hash==='#'+id;t.classList.toggle('is-active',active);if(active)t.setAttribute('aria-current','location');else t.removeAttribute('aria-current')});
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)select(e.target.id)}),{rootMargin:'-15% 0px -65% 0px'});items.forEach(([id])=>observer.observe(document.getElementById(id)))}
 tabs.forEach(t=>t.addEventListener('click',()=>select(t.hash.slice(1))));select(location.hash.slice(1)||'cinema');
})();
