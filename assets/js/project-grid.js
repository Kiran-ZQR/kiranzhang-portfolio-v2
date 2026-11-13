(()=>{
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('is-pending');observer.unobserve(e.target)}}),{threshold:.08});
 // Above-the-fold covers are visible immediately; animate only later rows.
 if(!reduced.matches)document.querySelectorAll('.grid-card').forEach(card=>{if(card.getBoundingClientRect().top>=innerHeight){card.classList.add('is-pending');observer.observe(card)}});
 const tabs=[...document.querySelectorAll('[data-grid-tab]')],panels=[...document.querySelectorAll('[data-grid-panel]')];
 if(!tabs.length)return;
 function select(id){if(!panels.some(p=>p.dataset.gridPanel===id))id=panels[0].dataset.gridPanel;
 tabs.forEach(t=>{const active=t.dataset.gridTab===id;t.classList.toggle('is-active',active);t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1});
 panels.forEach(p=>p.hidden=p.dataset.gridPanel!==id)}
 tabs.forEach((t,i)=>{t.addEventListener('click',()=>{history.replaceState(null,'','#'+t.dataset.gridTab);select(t.dataset.gridTab)});
 t.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus()})});
 addEventListener('hashchange',()=>select(location.hash.slice(1)));select(location.hash.slice(1));
})();
